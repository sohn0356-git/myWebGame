#include <stdint.h>
#include <string.h>
#include <stdlib.h>

#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>
#define EXPORT EMSCRIPTEN_KEEPALIVE
#else
#define EXPORT
#endif

// ===================== Core =====================
#define W 40
#define H 22

typedef struct {
  int x, y;
  int hp, maxhp;
  int atk;
} Actor;

typedef enum {
  PAT_NONE = 0,
  PAT_CHARGE = 1,
  PAT_SLAM = 2,
  PAT_MARK = 3,
  PAT_WIPE_LINE = 4,
  PAT_CROSS = 5,
  PAT_SUMMON = 6
} PatternType;

typedef struct {
  PatternType type;
  int cooldown;
  int p1;
  int p2;
  int p3;
} PatternDef;

typedef struct {
  int floor;
  int hp, atk;
  int patternCount;
  PatternDef pats[3];

  int enrageHpPercent;
  int enrageCooldownDelta;
  int enrageExtraMove;
  int enrageMarkRadiusDelta;
  int enrageCrossRangeDelta;

  int enrageOn;
  int cd[3];

  int shieldTurns;

  int markX, markY;
  int markTimer;
  int markRadius;
  int crossRange;
  int extraMove;
} BossConfig;

typedef struct {
  uint32_t version;
  uint32_t rng;
  uint32_t turn;
  uint8_t floor;

  uint8_t map[W * H];

  Actor player;
  Actor enemy;
  Actor boss;

  uint8_t boss_alive;

  uint32_t story_flags;
  uint8_t shield_once;
  uint8_t dash_bonus;

  BossConfig boss_cfg;
} Save;

static Save g;

// ===================== RNG =====================
static uint32_t xorshift32(uint32_t *s) {
  uint32_t x = *s;
  x ^= x << 13;
  x ^= x >> 17;
  x ^= x << 5;
  *s = x;
  return x;
}

// ===================== Map =====================
static int in_bounds(int x, int y) { return x >= 0 && x < W && y >= 0 && y < H; }
static uint8_t get_map(int x, int y) { return g.map[y * W + x]; }
static void set_map(int x, int y, uint8_t t) { g.map[y * W + x] = t; }

static void carve_room(int x0, int y0, int x1, int y1) {
  for (int y = y0; y <= y1; y++)
    for (int x = x0; x <= x1; x++)
      if (in_bounds(x, y)) set_map(x, y, '.');
}

static void gen_map_base(void) {
  for (int i = 0; i < W * H; i++) g.map[i] = '#';

  carve_room(2, 2, 16, 10);
  carve_room(22, 3, 37, 12);
  carve_room(8, 13, 30, 20);

  for (int x = 16; x <= 22; x++) set_map(x, 7, '.');
  for (int y = 7; y <= 13; y++) set_map(22, y, '.');
  for (int x = 16; x <= 22; x++) set_map(x, 16, '.');
}

static void sprinkle_walls(int count) {
  for (int i = 0; i < count; i++) {
    int x = (int)(xorshift32(&g.rng) % (W - 2)) + 1;
    int y = (int)(xorshift32(&g.rng) % (H - 2)) + 1;
    if (get_map(x, y) == '.') set_map(x, y, '#');
  }
}

static void gen_map_floor(int floor) {
  if (floor < 1) floor = 1;
  if (floor > 4) floor = 4;

  if (floor == 3) {
    // Frost Aqueduct: long channels + many crossings
    for (int i = 0; i < W * H; i++) g.map[i] = '#';

    for (int y = 2; y < H - 2; y += 4) {
      for (int x = 1; x < W - 1; x++) set_map(x, y, '.');
    }
    for (int x = 4; x < W - 4; x += 6) {
      for (int y = 1; y < H - 1; y++) set_map(x, y, '.');
    }
    carve_room(1, 1, 6, 5);
    carve_room(32, 16, 38, 20);
  } else {
    gen_map_base();

    if (floor == 1) {
      // Ash Furnace: debris-heavy paths
      sprinkle_walls(20);
      for (int y = 14; y <= 18; y++) set_map(19, y, '#');
    } else if (floor == 2) {
      // Magma Rift: line-shaped fissure lanes
      for (int x = 3; x < W - 3; x++) {
        if ((x % 5) != 0) set_map(x, 5, '.');
        if ((x % 6) != 0) set_map(x, 18, '.');
      }
      for (int y = 4; y < H - 2; y++) {
        if ((y % 4) != 0) set_map(11, y, '.');
        if ((y % 3) != 0) set_map(29, y, '.');
      }
      sprinkle_walls(10);
    } else if (floor == 4) {
      // Umbral Mycelium: denser maze corridors
      sprinkle_walls(24);
      for (int x = 6; x < W - 6; x += 4) {
        for (int y = 3; y < H - 3; y++) {
          if ((x + y) % 5 == 0) set_map(x, y, '#');
        }
      }
      for (int y = 4; y < H - 4; y += 4) {
        for (int x = 3; x < W - 3; x++) {
          if ((x + y) % 7 == 0) set_map(x, y, '.');
        }
      }
    }
  }

  // ensure spawn lanes stay open
  set_map(4, 4, '.');
  set_map(20, 17, '.');
  set_map(35, 17, '.');
  set_map(34, 4, '.');
}

static int is_blocked(int x, int y) {
  if (!in_bounds(x, y)) return 1;
  return get_map(x, y) == '#';
}

static int actor_at(int x, int y) {
  if (g.enemy.hp > 0 && g.enemy.x == x && g.enemy.y == y) return 1;
  if (g.boss_alive && g.boss.hp > 0 && g.boss.x == x && g.boss.y == y) return 2;
  return 0;
}

static int wall_between_row(int y, int x0, int x1) {
  if (x0 > x1) { int t = x0; x0 = x1; x1 = t; }
  for (int x = x0 + 1; x < x1; x++) if (get_map(x, y) == '#') return 1;
  return 0;
}

static int wall_between_col(int x, int y0, int y1) {
  if (y0 > y1) { int t = y0; y0 = y1; y1 = t; }
  for (int y = y0 + 1; y < y1; y++) if (get_map(x, y) == '#') return 1;
  return 0;
}

// ===================== Combat =====================
static void player_attack(Actor *t) {
  int dmg = g.player.atk;
  if (&g.boss == t && g.boss_cfg.shieldTurns > 0) {
    dmg -= 1;
    if (dmg < 0) dmg = 0;
  }
  t->hp -= dmg;
  if (t->hp < 0) t->hp = 0;
}

static void apply_player_damage(int dmg) {
  if (g.shield_once) {
    dmg -= 1;
    g.shield_once = 0;
    if (dmg < 0) dmg = 0;
  }
  g.player.hp -= dmg;
  if (g.player.hp < 0) g.player.hp = 0;
}

static void enemy_ai_basic(Actor *a) {
  if (a->hp <= 0) return;

  int dx = (g.player.x > a->x) - (g.player.x < a->x);
  int dy = (g.player.y > a->y) - (g.player.y < a->y);

  if ((abs(g.player.x - a->x) + abs(g.player.y - a->y)) == 1) {
    apply_player_damage(a->atk);
    return;
  }

  int nx = a->x + dx, ny = a->y;
  if (!is_blocked(nx, ny) && actor_at(nx, ny) == 0) { a->x = nx; a->y = ny; return; }
  nx = a->x; ny = a->y + dy;
  if (!is_blocked(nx, ny) && actor_at(nx, ny) == 0) { a->x = nx; a->y = ny; return; }
}

// ===================== Boss Config API =====================
static void boss_runtime_reset(void) {
  g.boss_cfg.enrageOn = 0;
  for (int i = 0; i < 3; i++) g.boss_cfg.cd[i] = 0;
  g.boss_cfg.shieldTurns = 0;
  g.boss_cfg.markX = -1;
  g.boss_cfg.markY = -1;
  g.boss_cfg.markTimer = 0;
  g.boss_cfg.markRadius = 0;
  g.boss_cfg.crossRange = 0;
  g.boss_cfg.extraMove = 0;
}

EXPORT void boss_config_begin(int floor, int hp, int atk) {
  memset(&g.boss_cfg, 0, sizeof(g.boss_cfg));
  g.boss_cfg.floor = floor;
  g.boss_cfg.hp = hp;
  g.boss_cfg.atk = atk;
  g.boss_cfg.enrageHpPercent = 50;
  boss_runtime_reset();
}

EXPORT void boss_config_add_pattern(int type, int cooldown, int p1, int p2, int p3) {
  if (g.boss_cfg.patternCount >= 3) return;
  int i = g.boss_cfg.patternCount++;
  g.boss_cfg.pats[i].type = (PatternType)type;
  g.boss_cfg.pats[i].cooldown = cooldown;
  g.boss_cfg.pats[i].p1 = p1;
  g.boss_cfg.pats[i].p2 = p2;
  g.boss_cfg.pats[i].p3 = p3;
}

EXPORT void boss_config_set_enrage(int hpPercent, int cooldownDelta, int extraMove, int markRadiusDelta, int crossRangeDelta) {
  g.boss_cfg.enrageHpPercent = hpPercent;
  g.boss_cfg.enrageCooldownDelta = cooldownDelta;
  g.boss_cfg.enrageExtraMove = extraMove;
  g.boss_cfg.enrageMarkRadiusDelta = markRadiusDelta;
  g.boss_cfg.enrageCrossRangeDelta = crossRangeDelta;
}

EXPORT void boss_config_end(void) {
  g.boss_cfg.markRadius = 0;
  g.boss_cfg.crossRange = 6;
  for (int i = 0; i < g.boss_cfg.patternCount; i++) {
    if (g.boss_cfg.pats[i].type == PAT_MARK) g.boss_cfg.markRadius = g.boss_cfg.pats[i].p2;
    if (g.boss_cfg.pats[i].type == PAT_CROSS) g.boss_cfg.crossRange = g.boss_cfg.pats[i].p1;
  }
  g.boss_cfg.extraMove = 0;
}

static void boss_check_enrage(void) {
  if (!g.boss_alive || g.boss.hp <= 0 || g.boss_cfg.enrageOn) return;

  int hpPct = (g.boss.hp * 100) / (g.boss.maxhp ? g.boss.maxhp : 1);
  if (hpPct <= g.boss_cfg.enrageHpPercent) {
    g.boss_cfg.enrageOn = 1;
    g.boss_cfg.extraMove = g.boss_cfg.enrageExtraMove;
    g.boss_cfg.markRadius += g.boss_cfg.enrageMarkRadiusDelta;
    g.boss_cfg.crossRange += g.boss_cfg.enrageCrossRangeDelta;

    for (int i = 0; i < g.boss_cfg.patternCount; i++) {
      int cd = g.boss_cfg.pats[i].cooldown + g.boss_cfg.enrageCooldownDelta;
      if (cd < 0) cd = 0;
      g.boss_cfg.pats[i].cooldown = cd;
    }
  }
}

static void boss_do_charge(PatternDef *p) {
  int steps = p->p1;
  int aoeOnCrash = p->p2;
  int dx = (g.player.x > g.boss.x) - (g.player.x < g.boss.x);
  int dy = (g.player.y > g.boss.y) - (g.player.y < g.boss.y);

  int crashed = 0;
  for (int i = 0; i < steps; i++) {
    int nx = g.boss.x + dx;
    int ny = g.boss.y + dy;

    if (is_blocked(nx, ny) || actor_at(nx, ny) == 1) {
      crashed = 1;
      break;
    }
    g.boss.x = nx;
    g.boss.y = ny;
    if ((abs(g.player.x - g.boss.x) + abs(g.player.y - g.boss.y)) == 0) break;
  }

  if (crashed && aoeOnCrash) {
    int dist = abs(g.player.x - g.boss.x) + abs(g.player.y - g.boss.y);
    if (dist <= 1) apply_player_damage(g.boss.atk);
  }
}

static void boss_do_slam(PatternDef *p) {
  int dist = abs(g.player.x - g.boss.x) + abs(g.player.y - g.boss.y);
  if (dist != 1) return;

  int knock = p->p1;
  int bonus = p->p2;
  apply_player_damage(g.boss.atk + bonus);

  int dx = (g.player.x > g.boss.x) - (g.player.x < g.boss.x);
  int dy = (g.player.y > g.boss.y) - (g.player.y < g.boss.y);
  for (int i = 0; i < knock; i++) {
    int nx = g.player.x + dx;
    int ny = g.player.y + dy;
    if (is_blocked(nx, ny) || actor_at(nx, ny) != 0) break;
    g.player.x = nx;
    g.player.y = ny;
  }
}

static void boss_do_mark(PatternDef *p) {
  g.boss_cfg.markX = g.player.x;
  g.boss_cfg.markY = g.player.y;
  g.boss_cfg.markTimer = p->p1;
}

static void boss_resolve_mark_explosion(void) {
  if (g.boss_cfg.markTimer <= 0) return;
  g.boss_cfg.markTimer--;
  if (g.boss_cfg.markTimer > 0) return;

  int r = g.boss_cfg.markRadius;
  int dx = abs(g.player.x - g.boss_cfg.markX);
  int dy = abs(g.player.y - g.boss_cfg.markY);

  if ((dx + dy) <= r) apply_player_damage(g.boss.atk);
  else if (r == 0 && g.player.x == g.boss_cfg.markX && g.player.y == g.boss_cfg.markY) apply_player_damage(g.boss.atk);

  g.boss_cfg.markX = -1;
  g.boss_cfg.markY = -1;
}

static void boss_do_wipe_line(PatternDef *p) {
  (void)p;
  if (g.player.y == g.boss.y && !wall_between_row(g.player.y, g.player.x, g.boss.x)) {
    apply_player_damage(g.boss.atk);
    return;
  }
  if (g.player.x == g.boss.x && !wall_between_col(g.player.x, g.player.y, g.boss.y)) {
    apply_player_damage(g.boss.atk);
    return;
  }
}

static void boss_do_cross(PatternDef *p) {
  (void)p;
  int range = g.boss_cfg.crossRange;

  if (g.player.y == g.boss.y) {
    int dist = abs(g.player.x - g.boss.x);
    if (dist <= range && !wall_between_row(g.player.y, g.player.x, g.boss.x)) apply_player_damage(g.boss.atk);
    return;
  }

  if (g.player.x == g.boss.x) {
    int dist = abs(g.player.y - g.boss.y);
    if (dist <= range && !wall_between_col(g.player.x, g.player.y, g.boss.y)) apply_player_damage(g.boss.atk);
  }
}

static void boss_do_summon(PatternDef *p) {
  int minHp = p->p1;
  int minAtk = p->p2;
  int shieldTurns = p->p3;

  if (g.enemy.hp <= 0) {
    const int dirs[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    for (int i = 0; i < 4; i++) {
      int nx = g.boss.x + dirs[i][0];
      int ny = g.boss.y + dirs[i][1];
      if (!is_blocked(nx, ny) && actor_at(nx, ny) == 0 && !(nx == g.player.x && ny == g.player.y)) {
        g.enemy = (Actor){.x = nx, .y = ny, .hp = minHp, .maxhp = minHp, .atk = minAtk};
        break;
      }
    }
  }
  g.boss_cfg.shieldTurns = shieldTurns;
}

static void boss_ai_step(void) {
  if (!g.boss_alive || g.boss.hp <= 0) return;

  if (g.boss_cfg.shieldTurns > 0) g.boss_cfg.shieldTurns--;

  boss_check_enrage();
  boss_resolve_mark_explosion();

  for (int m = 0; m < (1 + g.boss_cfg.extraMove); m++) {
    for (int i = 0; i < g.boss_cfg.patternCount; i++) {
      if (g.boss_cfg.pats[i].type == PAT_SLAM) {
        int dist = abs(g.player.x - g.boss.x) + abs(g.player.y - g.boss.y);
        if (dist == 1) {
          boss_do_slam(&g.boss_cfg.pats[i]);
          return;
        }
      }
    }

    for (int i = 0; i < g.boss_cfg.patternCount; i++) {
      PatternDef *p = &g.boss_cfg.pats[i];
      if (p->cooldown <= 0) continue;

      if (g.boss_cfg.cd[i] <= 0) {
        switch (p->type) {
          case PAT_CHARGE: boss_do_charge(p); break;
          case PAT_MARK: boss_do_mark(p); break;
          case PAT_WIPE_LINE: boss_do_wipe_line(p); break;
          case PAT_CROSS: boss_do_cross(p); break;
          case PAT_SUMMON: boss_do_summon(p); break;
          default: break;
        }
        g.boss_cfg.cd[i] = p->cooldown;
        return;
      }
    }

    enemy_ai_basic(&g.boss);

    for (int i = 0; i < g.boss_cfg.patternCount; i++) {
      if (g.boss_cfg.pats[i].cooldown > 0 && g.boss_cfg.cd[i] > 0) g.boss_cfg.cd[i]--;
    }
  }
}

static void set_floor_default_boss(int floor) {
  if (floor == 1) {
    boss_config_begin(1, 20, 3);
    boss_config_add_pattern(PAT_CHARGE, 3, 2, 1, 0);
    boss_config_add_pattern(PAT_SLAM, 0, 2, 1, 0);
    boss_config_set_enrage(50, -1, 0, 0, 0);
  } else if (floor == 2) {
    boss_config_begin(2, 22, 4);
    boss_config_add_pattern(PAT_MARK, 2, 1, 0, 0);
    boss_config_add_pattern(PAT_WIPE_LINE, 4, 99, 0, 0);
    boss_config_set_enrage(50, 0, 0, 1, 0);
  } else if (floor == 3) {
    boss_config_begin(3, 24, 4);
    boss_config_add_pattern(PAT_CROSS, 3, 8, 0, 0);
    boss_config_add_pattern(PAT_SUMMON, 4, 6, 2, 1);
    boss_config_set_enrage(50, 0, 0, 0, 2);
  } else {
    boss_config_begin(4, 28, 5);
    boss_config_add_pattern(PAT_CHARGE, 3, 2, 0, 0);
    boss_config_add_pattern(PAT_MARK, 3, 1, 0, 0);
    boss_config_add_pattern(PAT_CROSS, 4, 6, 0, 0);
    boss_config_set_enrage(50, -1, 1, 0, 0);
  }
  boss_config_end();
}

static void place_floor_entities(int floor) {
  g.enemy = (Actor){.x = 0, .y = 0, .hp = 0, .maxhp = 0, .atk = 0};
  g.boss_alive = 1;

  if (floor == 3) {
    g.player.x = 3;
    g.player.y = 3;
    g.boss.x = 35;
    g.boss.y = 17;
  } else if (floor == 4) {
    g.player.x = 4;
    g.player.y = 17;
    g.boss.x = 34;
    g.boss.y = 4;
  } else {
    g.player.x = 4;
    g.player.y = 4;
    g.boss.x = 35;
    g.boss.y = 17;
  }

  set_map(g.player.x, g.player.y, '.');
  set_map(g.boss.x, g.boss.y, '.');
}

// ===================== Game API =====================
EXPORT void game_set_floor(int floor, uint32_t seed, int keepPlayer) {
  if (floor < 1) floor = 1;
  if (floor > 4) floor = 4;

  if (seed) g.rng = seed;

  int oldMax = g.player.maxhp;
  int oldAtk = g.player.atk;
  int oldHp = g.player.hp;

  if (!keepPlayer || oldMax <= 0) {
    g.player.maxhp = 12;
    g.player.hp = 12;
    g.player.atk = 3;
  } else {
    g.player.maxhp = oldMax;
    g.player.atk = oldAtk;
    if (oldHp > g.player.maxhp) oldHp = g.player.maxhp;
    if (oldHp < 1) oldHp = g.player.maxhp;
    g.player.hp = oldHp;
  }

  g.floor = (uint8_t)floor;
  g.turn = 0;
  gen_map_floor(floor);
  place_floor_entities(floor);

  set_floor_default_boss(floor);
  g.boss.hp = g.boss.maxhp = g.boss_cfg.hp;
  g.boss.atk = g.boss_cfg.atk;
  boss_runtime_reset();
  boss_config_end();
}

EXPORT void game_new(uint32_t seed) {
  memset(&g, 0, sizeof(g));
  g.version = 4;
  g.rng = seed ? seed : 0xA1B2C3D4u;
  g.story_flags = 0;
  g.shield_once = 0;
  g.dash_bonus = 0;

  game_set_floor(1, g.rng, 0);
}

EXPORT int game_w(void) { return W; }
EXPORT int game_h(void) { return H; }
EXPORT int game_floor(void) { return g.floor; }

EXPORT uint8_t game_tile(int x, int y) {
  if (!in_bounds(x, y)) return '#';
  return get_map(x, y);
}

EXPORT int game_player_x(void) { return g.player.x; }
EXPORT int game_player_y(void) { return g.player.y; }
EXPORT int game_player_hp(void) { return g.player.hp; }
EXPORT int game_player_maxhp(void) { return g.player.maxhp; }
EXPORT uint32_t game_turn(void) { return g.turn; }

EXPORT int game_enemy_alive(void) { return g.enemy.hp > 0; }
EXPORT int game_boss_alive(void) { return g.boss_alive && g.boss.hp > 0; }
EXPORT int game_boss_hp(void) { return g.boss.hp; }
EXPORT int game_boss_maxhp(void) { return g.boss.maxhp; }

static void try_move_player(int dx, int dy, int steps) {
  for (int i = 0; i < steps; i++) {
    int nx = g.player.x + dx;
    int ny = g.player.y + dy;

    int who = actor_at(nx, ny);
    if (who == 1) {
      player_attack(&g.enemy);
      return;
    }
    if (who == 2) {
      player_attack(&g.boss);
      return;
    }

    if (is_blocked(nx, ny)) return;

    g.player.x = nx;
    g.player.y = ny;
  }
}

EXPORT void game_step(int input) {
  if (g.player.hp <= 0) return;

  int dx = 0, dy = 0, dash = 0;
  switch (input) {
    case 1: dy = -1; break;
    case 2: dy = 1; break;
    case 3: dx = -1; break;
    case 4: dx = 1; break;
    case 5: dy = -1; dash = 1; break;
    case 6: dy = 1; dash = 1; break;
    case 7: dx = -1; dash = 1; break;
    case 8: dx = 1; dash = 1; break;
    default: break;
  }

  if (dx || dy) {
    int steps = dash ? (2 + (g.dash_bonus ? 1 : 0)) : 1;
    try_move_player(dx, dy, steps);
    if (dash && g.dash_bonus) g.dash_bonus = 0;

    g.turn++;

    enemy_ai_basic(&g.enemy);
    boss_ai_step();

    if (g.enemy.hp <= 0) g.enemy.hp = 0;
    if (g.boss_alive && g.boss.hp <= 0) {
      g.boss.hp = 0;
      g.boss_alive = 0;
    }
  }
}

// ===================== Save/Load =====================
EXPORT int game_save_size(void) { return (int)sizeof(Save); }
EXPORT void game_save_write(uint8_t *out) { memcpy(out, &g, sizeof(Save)); }

EXPORT int game_load_read(const uint8_t *in, int len) {
  if (len != (int)sizeof(Save)) return 0;
  Save tmp;
  memcpy(&tmp, in, sizeof(Save));
  if (tmp.version != 4) return 0;
  g = tmp;
  return 1;
}

// ===================== Story flags/effects =====================
EXPORT uint32_t story_get_flags(void) { return g.story_flags; }
EXPORT void story_set_flag_bit(int bit) {
  if (bit >= 0 && bit < 32) g.story_flags |= (1u << bit);
}

// effect: 1 heal_2, 2 heal_3, 3 atk_1, 4 shield_1, 5 dash_buff
EXPORT void story_apply_effect(int effect) {
  switch (effect) {
    case 1: g.player.hp += 2; if (g.player.hp > g.player.maxhp) g.player.hp = g.player.maxhp; break;
    case 2: g.player.hp += 3; if (g.player.hp > g.player.maxhp) g.player.hp = g.player.maxhp; break;
    case 3: g.player.atk += 1; break;
    case 4: g.shield_once = 1; break;
    case 5: g.dash_bonus = 1; break;
    default: break;
  }
}

EXPORT void game_apply_player_damage(int dmg) {
  if (dmg > 0) apply_player_damage(dmg);
}

EXPORT void boss_apply_stats_from_config(void) {
  g.boss.hp = g.boss.maxhp = g.boss_cfg.hp;
  g.boss.atk = g.boss_cfg.atk;
  g.boss_alive = 1;
  boss_runtime_reset();
  boss_config_end();
}

EXPORT int game_enemy_x(void) { return g.enemy.x; }
EXPORT int game_enemy_y(void) { return g.enemy.y; }
EXPORT int game_boss_x(void) { return g.boss.x; }
EXPORT int game_boss_y(void) { return g.boss.y; }
