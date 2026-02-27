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
  ENEMY_NONE = 0,
  ENEMY_SALT_SNAIL = 1,
  ENEMY_ROPE_GHOST = 2
} EnemyType;

typedef struct {
  Actor a;
  EnemyType type;
} Enemy;

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
  int cooldown;     // base cooldown turns (0 means trigger-based)
  int p1;           // meaning depends on type
  int p2;           // meaning depends on type
  int p3;           // meaning depends on type
} PatternDef;

typedef struct {
  // Config
  int floor;
  int hp, atk;
  int patternCount;
  PatternDef pats[3];

  // Enrage rules
  int enrageHpPercent;    // e.g. 50
  int enrageCooldownDelta; // e.g. -1
  int enrageExtraMove;     // e.g. +1 move per turn
  int enrageMarkRadiusDelta; // e.g. +1
  int enrageCrossRangeDelta;  // e.g. +2

  // Runtime
  int enrageOn;
  int cd[3];              // cooldown trackers
  int shieldTurns;        // from SUMMON pattern
  int markX, markY;       // MARK target
  int markTimer;          // turns until explosion
  int markRadius;         // runtime radius (base + enrage delta)
  int crossRange;         // runtime range (base + enrage delta)
  int extraMove;          // runtime extra move per turn (enrage)
} BossConfig;

typedef struct {
  uint32_t version;
  uint32_t rng;
  uint32_t turn;

  uint8_t  map[W * H];

  Actor player;
  Enemy enemies[8];
  Actor boss;

  uint8_t boss_alive;

  // story/save extras
  uint32_t story_flags;
  uint8_t  shield_once;
  uint8_t  dash_bonus;

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
      if (in_bounds(x,y)) set_map(x,y,'.');
}

static void gen_map(void) {
  for (int i = 0; i < W * H; i++) g.map[i] = '#';

  carve_room(2, 2, 16, 10);
  carve_room(22, 3, 37, 12);
  carve_room(8, 13, 30, 20);

  for (int x = 16; x <= 22; x++) set_map(x, 7, '.');
  for (int y = 7; y <= 13; y++) set_map(22, y, '.');
  for (int x = 16; x <= 22; x++) set_map(x, 16, '.');

  for (int i = 0; i < 16; i++) {
    int x = (int)(xorshift32(&g.rng) % (W - 2)) + 1;
    int y = (int)(xorshift32(&g.rng) % (H - 2)) + 1;
    if (get_map(x,y) == '.') set_map(x,y,'#');
  }
}

static void gen_map_ep1(void) {
  for (int i = 0; i < W * H; i++) g.map[i] = '#';

  carve_room(2, 2, 14, 9);
  carve_room(9, 10, 30, 18);
  carve_room(24, 4, 37, 12);
  carve_room(30, 13, 37, 19);

  for (int x = 14; x <= 24; x++) set_map(x, 6, '.');
  for (int y = 6; y <= 10; y++) set_map(24, y, '.');
  for (int x = 14; x <= 30; x++) set_map(x, 15, '.');
  for (int y = 12; y <= 15; y++) set_map(30, y, '.');

  for (int x = 9; x <= 30; x += 2) set_map(x, 11, '~');
  for (int x = 10; x <= 30; x += 3) set_map(x, 17, '~');
  for (int y = 4; y <= 18; y += 3) set_map(18, y, '~');

  for (int i = 0; i < 24; i++) {
    int x = (int)(xorshift32(&g.rng) % (W - 4)) + 2;
    int y = (int)(xorshift32(&g.rng) % (H - 4)) + 2;
    if (get_map(x,y) == '.') set_map(x,y,'*');
  }
}

static int is_blocked(int x, int y) {
  if (!in_bounds(x,y)) return 1;
  return get_map(x,y) == '#';
}

static int actor_at(int x, int y) {
  for (int i = 0; i < 8; i++) {
    if (g.enemies[i].a.hp > 0 && g.enemies[i].a.x == x && g.enemies[i].a.y == y) return 10 + i;
  }
  if (g.boss_alive && g.boss.hp > 0 && g.boss.x == x && g.boss.y == y) return 2;
  return 0;
}

// line-of-sight for row/col attacks; returns 1 if wall blocks between (exclusive)
static int wall_between_row(int y, int x0, int x1) {
  if (x0 > x1) { int t = x0; x0 = x1; x1 = t; }
  for (int x = x0 + 1; x < x1; x++) if (get_map(x,y) == '#') return 1;
  return 0;
}
static int wall_between_col(int x, int y0, int y1) {
  if (y0 > y1) { int t = y0; y0 = y1; y1 = t; }
  for (int y = y0 + 1; y < y1; y++) if (get_map(x,y) == '#') return 1;
  return 0;
}

// ===================== Combat =====================
static void player_attack(Actor *t) {
  int dmg = g.player.atk;
  if (&g.boss == t && g.boss_cfg.shieldTurns > 0) {
    // boss shield from SUMMON pattern
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

static void enemy_ai_salt_snail(Enemy *e) {
  Actor *a = &e->a;
  if (a->hp <= 0) return;

  int ox = a->x, oy = a->y;
  enemy_ai_basic(a);
  if (a->x != ox || a->y != oy) {
    if (get_map(ox, oy) != '#') set_map(ox, oy, '~');
  }
}

static void enemy_ai_rope_ghost(Enemy *e) {
  Actor *a = &e->a;
  if (a->hp <= 0) return;

  int sameRow = (g.player.y == a->y) && !wall_between_row(a->y, a->x, g.player.x);
  int sameCol = (g.player.x == a->x) && !wall_between_col(a->x, a->y, g.player.y);
  if (sameRow || sameCol) {
    int dx = (g.player.x > a->x) - (g.player.x < a->x);
    int dy = (g.player.y > a->y) - (g.player.y < a->y);
    for (int i = 0; i < 2; i++) {
      int nx = a->x + dx;
      int ny = a->y + dy;
      if (is_blocked(nx, ny)) break;
      if (nx == g.player.x && ny == g.player.y) {
        apply_player_damage(a->atk);
        int kx = g.player.x + dx;
        int ky = g.player.y + dy;
        if (!is_blocked(kx, ky) && actor_at(kx, ky) == 0) {
          g.player.x = kx;
          g.player.y = ky;
        }
        return;
      }
      if (actor_at(nx, ny) != 0) break;
      a->x = nx;
      a->y = ny;
    }
    return;
  }

  enemy_ai_basic(a);
}

// ===================== Boss Config API (JS -> WASM) =====================
static void boss_runtime_reset(void) {
  g.boss_cfg.enrageOn = 0;
  for (int i = 0; i < 3; i++) g.boss_cfg.cd[i] = 0;
  g.boss_cfg.shieldTurns = 0;
  g.boss_cfg.markX = -1; g.boss_cfg.markY = -1; g.boss_cfg.markTimer = 0;
  g.boss_cfg.markRadius = 0;
  g.boss_cfg.crossRange = 0;
  g.boss_cfg.extraMove = 0;
}

EXPORT void boss_config_begin(int floor, int hp, int atk) {
  memset(&g.boss_cfg, 0, sizeof(g.boss_cfg));
  g.boss_cfg.floor = floor;
  g.boss_cfg.hp = hp;
  g.boss_cfg.atk = atk;
  g.boss_cfg.patternCount = 0;
  g.boss_cfg.enrageHpPercent = 50;
  g.boss_cfg.enrageCooldownDelta = 0;
  g.boss_cfg.enrageExtraMove = 0;
  g.boss_cfg.enrageMarkRadiusDelta = 0;
  g.boss_cfg.enrageCrossRangeDelta = 0;
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
  // derive runtime values from patterns
  g.boss_cfg.markRadius = 0;
  g.boss_cfg.crossRange = 6;
  for (int i = 0; i < g.boss_cfg.patternCount; i++) {
    if (g.boss_cfg.pats[i].type == PAT_MARK) g.boss_cfg.markRadius = g.boss_cfg.pats[i].p2; // radius
    if (g.boss_cfg.pats[i].type == PAT_CROSS) g.boss_cfg.crossRange = g.boss_cfg.pats[i].p1; // range
  }
  g.boss_cfg.extraMove = 0;
}

// ===================== Boss Engine =====================
static void boss_check_enrage(void) {
  if (!g.boss_alive || g.boss.hp <= 0) return;
  if (g.boss_cfg.enrageOn) return;

  int hpPct = (g.boss.hp * 100) / (g.boss.maxhp ? g.boss.maxhp : 1);
  if (hpPct <= g.boss_cfg.enrageHpPercent) {
    g.boss_cfg.enrageOn = 1;
    g.boss_cfg.extraMove = g.boss_cfg.enrageExtraMove;
    g.boss_cfg.markRadius += g.boss_cfg.enrageMarkRadiusDelta;
    g.boss_cfg.crossRange += g.boss_cfg.enrageCrossRangeDelta;

    // Apply cooldown delta to patterns by shifting their base cooldown (runtime effect)
    for (int i = 0; i < g.boss_cfg.patternCount; i++) {
      int cd = g.boss_cfg.pats[i].cooldown + g.boss_cfg.enrageCooldownDelta;
      if (cd < 0) cd = 0;
      g.boss_cfg.pats[i].cooldown = cd;
    }
  }
}

static void boss_do_charge(PatternDef *p) {
  int steps = p->p1;           // charge steps
  int aoeOnCrash = p->p2;      // 1 means AOE around crash
  int dx = (g.player.x > g.boss.x) - (g.player.x < g.boss.x);
  int dy = (g.player.y > g.boss.y) - (g.player.y < g.boss.y);

  int crashed = 0;
  for (int i = 0; i < steps; i++) {
    int nx = g.boss.x + dx;
    int ny = g.boss.y + dy;

    if (is_blocked(nx, ny) || actor_at(nx, ny) >= 10) { crashed = 1; break; } // blocked or enemy tile
    g.boss.x = nx; g.boss.y = ny;

    // if became adjacent, can stop; (keeps simple)
    if ((abs(g.player.x - g.boss.x) + abs(g.player.y - g.boss.y)) == 0) break;
  }

  if (crashed && aoeOnCrash) {
    // small AOE around boss: if player within 1 tile => damage
    int dist = abs(g.player.x - g.boss.x) + abs(g.player.y - g.boss.y);
    if (dist <= 1) apply_player_damage(g.boss.atk);
  }
}

static void boss_do_slam(PatternDef *p) {
  // slam triggers when adjacent; dmg = atk + bonus
  int dist = abs(g.player.x - g.boss.x) + abs(g.player.y - g.boss.y);
  if (dist != 1) return;

  int knock = p->p1; // knockback steps
  int bonus = p->p2; // bonus dmg
  apply_player_damage(g.boss.atk + bonus);

  // knockback in direction away from boss
  int dx = (g.player.x > g.boss.x) - (g.player.x < g.boss.x);
  int dy = (g.player.y > g.boss.y) - (g.player.y < g.boss.y);
  for (int i = 0; i < knock; i++) {
    int nx = g.player.x + dx;
    int ny = g.player.y + dy;
    if (is_blocked(nx, ny) || actor_at(nx, ny) != 0) break;
    g.player.x = nx; g.player.y = ny;
  }
}

static void boss_do_mark(PatternDef *p) {
  // sets a mark at player position; explode after delay
  int delay = p->p1; // turns
  g.boss_cfg.markX = g.player.x;
  g.boss_cfg.markY = g.player.y;
  g.boss_cfg.markTimer = delay;
}

static void boss_resolve_mark_explosion(void) {
  if (g.boss_cfg.markTimer <= 0) return;
  g.boss_cfg.markTimer--;
  if (g.boss_cfg.markTimer > 0) return;

  // explode at mark
  int r = g.boss_cfg.markRadius;
  int dx = abs(g.player.x - g.boss_cfg.markX);
  int dy = abs(g.player.y - g.boss_cfg.markY);

  // simple diamond radius
  if ((dx + dy) <= r) {
    apply_player_damage(g.boss.atk);
  } else if (r == 0 && g.player.x == g.boss_cfg.markX && g.player.y == g.boss_cfg.markY) {
    apply_player_damage(g.boss.atk);
  }

  g.boss_cfg.markX = -1; g.boss_cfg.markY = -1;
}

static void boss_do_wipe_line(PatternDef *p) {
  (void)p;
  // if same row/col and no wall => damage
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
  // shoot cross up to range; wall blocks
  int range = g.boss_cfg.crossRange;
  (void)p;

  if (g.player.y == g.boss.y) {
    int dist = abs(g.player.x - g.boss.x);
    if (dist <= range && !wall_between_row(g.player.y, g.player.x, g.boss.x)) apply_player_damage(g.boss.atk);
    return;
  }
  if (g.player.x == g.boss.x) {
    int dist = abs(g.player.y - g.boss.y);
    if (dist <= range && !wall_between_col(g.player.x, g.player.y, g.boss.y)) apply_player_damage(g.boss.atk);
    return;
  }
}

static void boss_do_summon(PatternDef *p) {
  // summon a minion if none; give boss shield for p3 turns
  int minHp = p->p1;
  int minAtk = p->p2;
  int shieldTurns = p->p3;

  int hasMinion = 0;
  for (int i = 0; i < 8; i++) if (g.enemies[i].a.hp > 0) { hasMinion = 1; break; }
  if (!hasMinion) {
    // find a nearby empty floor tile
    const int dirs[4][2] = {{1,0},{-1,0},{0,1},{0,-1}};
    for (int i = 0; i < 4; i++) {
      int nx = g.boss.x + dirs[i][0];
      int ny = g.boss.y + dirs[i][1];
      if (!is_blocked(nx, ny) && actor_at(nx, ny) == 0 && !(nx==g.player.x && ny==g.player.y)) {
        for (int s = 0; s < 8; s++) {
          if (g.enemies[s].a.hp <= 0) {
            g.enemies[s].a = (Actor){ .x=nx, .y=ny, .hp=minHp, .maxhp=minHp, .atk=minAtk };
            g.enemies[s].type = ENEMY_SALT_SNAIL;
            break;
          }
        }
        break;
      }
    }
  }
  g.boss_cfg.shieldTurns = shieldTurns;
}

static void boss_ai_step(void) {
  if (!g.boss_alive || g.boss.hp <= 0) return;

  // shield decay
  if (g.boss_cfg.shieldTurns > 0) g.boss_cfg.shieldTurns--;

  boss_check_enrage();
  boss_resolve_mark_explosion();

  // extra move (enrage)
  for (int m = 0; m < (1 + g.boss_cfg.extraMove); m++) {
    // decide action:
    // - if adjacent and SLAM exists -> slam
    // - else if any pattern cooldown hits -> execute
    // - else chase 1 tile

    // 1) slam if adjacent
    for (int i = 0; i < g.boss_cfg.patternCount; i++) {
      if (g.boss_cfg.pats[i].type == PAT_SLAM) {
        int dist = abs(g.player.x - g.boss.x) + abs(g.player.y - g.boss.y);
        if (dist == 1) {
          boss_do_slam(&g.boss_cfg.pats[i]);
          return;
        }
      }
    }

    // 2) cooldown-based patterns
    for (int i = 0; i < g.boss_cfg.patternCount; i++) {
      PatternDef *p = &g.boss_cfg.pats[i];
      if (p->cooldown <= 0) continue;

      if (g.boss_cfg.cd[i] <= 0) {
        // execute
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

    // 3) chase
    enemy_ai_basic(&g.boss);

    // tick cooldowns after movement attempt (keeps simple)
    for (int i = 0; i < g.boss_cfg.patternCount; i++) {
      if (g.boss_cfg.pats[i].cooldown > 0 && g.boss_cfg.cd[i] > 0) g.boss_cfg.cd[i]--;
    }
  }
}

// ===================== Game API =====================
EXPORT void game_new(uint32_t seed) {
  memset(&g, 0, sizeof(g));
  g.version = 4;
  g.rng = seed ? seed : 0xA1B2C3D4u;
  g.turn = 0;

  gen_map_ep1();

  g.player = (Actor){ .x = 4, .y = 4, .hp = 12, .maxhp = 12, .atk = 3 };
  memset(g.enemies, 0, sizeof(g.enemies));
  g.enemies[0].a = (Actor){ .x = 11, .y = 6, .hp = 6, .maxhp = 6, .atk = 1 };
  g.enemies[0].type = ENEMY_SALT_SNAIL;
  g.enemies[1].a = (Actor){ .x = 27, .y = 8, .hp = 5, .maxhp = 5, .atk = 2 };
  g.enemies[1].type = ENEMY_ROPE_GHOST;
  g.enemies[2].a = (Actor){ .x = 18, .y = 14, .hp = 6, .maxhp = 6, .atk = 1 };
  g.enemies[2].type = ENEMY_SALT_SNAIL;

  // boss position; stats will be set by boss_config_* from JS
  g.boss   = (Actor){ .x = 33, .y = 16, .hp = 18, .maxhp = 18, .atk = 3 };
  g.boss_alive = 1;

  g.story_flags = 0;
  g.shield_once = 0;
  g.dash_bonus = 0;

  // default boss config (safe fallback if JS hasn't injected yet)
  boss_config_begin(1, 18, 3);
  boss_config_add_pattern(PAT_CHARGE, 3, 2, 1, 0);         // steps=2, aoeOnCrash=1
  boss_config_add_pattern(PAT_SLAM, 0, 2, 1, 0);           // knock=2, bonus=1
  boss_config_set_enrage(50, -1, 0, 0, 0);
  boss_config_end();

  // apply boss stats from config
  g.boss.hp = g.boss.maxhp = g.boss_cfg.hp;
  g.boss.atk = g.boss_cfg.atk;
}

EXPORT int game_w(void) { return W; }
EXPORT int game_h(void) { return H; }

EXPORT uint8_t game_tile(int x, int y) {
  if (!in_bounds(x,y)) return '#';
  return get_map(x,y);
}

EXPORT int game_player_x(void) { return g.player.x; }
EXPORT int game_player_y(void) { return g.player.y; }
EXPORT int game_player_hp(void){ return g.player.hp; }
EXPORT int game_player_maxhp(void){ return g.player.maxhp; }
EXPORT uint32_t game_turn(void){ return g.turn; }

EXPORT int game_enemy_alive(void){
  for (int i = 0; i < 8; i++) if (g.enemies[i].a.hp > 0) return 1;
  return 0;
}
EXPORT int game_boss_alive(void){ return g.boss_alive && g.boss.hp > 0; }
EXPORT int game_boss_hp(void){ return g.boss.hp; }
EXPORT int game_boss_maxhp(void){ return g.boss.maxhp; }
EXPORT int game_enemy_count(void){
  int c = 0;
  for (int i = 0; i < 8; i++) if (g.enemies[i].a.hp > 0) c++;
  return c;
}

EXPORT uint8_t game_glyph(int x, int y) {
  if (!in_bounds(x,y)) return '#';
  if (g.player.hp > 0 && g.player.x == x && g.player.y == y) return '@';
  if (g.boss_alive && g.boss.hp > 0 && g.boss.x == x && g.boss.y == y) return 'W';
  for (int i = 0; i < 8; i++) {
    if (g.enemies[i].a.hp > 0 && g.enemies[i].a.x == x && g.enemies[i].a.y == y) {
      if (g.enemies[i].type == ENEMY_SALT_SNAIL) return 's';
      if (g.enemies[i].type == ENEMY_ROPE_GHOST) return 'g';
      return 'm';
    }
  }
  return get_map(x,y);
}

static void try_move_player(int dx, int dy, int steps) {
  for (int i = 0; i < steps; i++) {
    int nx = g.player.x + dx;
    int ny = g.player.y + dy;

    int who = actor_at(nx, ny);
    if (who >= 10) {
      int idx = who - 10;
      if (idx >= 0 && idx < 8) player_attack(&g.enemies[idx].a);
      return;
    }
    if (who == 2) { player_attack(&g.boss); return; }

    if (is_blocked(nx, ny)) return;

    g.player.x = nx; g.player.y = ny;

    if (get_map(g.player.x, g.player.y) == '~' && i + 1 == steps) {
      steps++;
    }
  }
}

EXPORT void game_step(int input) {
  if (g.player.hp <= 0) return;

  int dx = 0, dy = 0, dash = 0;
  switch (input) {
    case 1: dy = -1; break;
    case 2: dy =  1; break;
    case 3: dx = -1; break;
    case 4: dx =  1; break;
    case 5: dy = -1; dash = 1; break;
    case 6: dy =  1; dash = 1; break;
    case 7: dx = -1; dash = 1; break;
    case 8: dx =  1; dash = 1; break;
    default: break;
  }

  if (dx || dy) {
    int steps = dash ? (2 + (g.dash_bonus ? 1 : 0)) : 1;
    try_move_player(dx, dy, steps);
    if (dash && g.dash_bonus) g.dash_bonus = 0;

    g.turn++;

    // enemy turn
    for (int i = 0; i < 8; i++) {
      if (g.enemies[i].a.hp <= 0) continue;
      if (g.enemies[i].type == ENEMY_SALT_SNAIL) enemy_ai_salt_snail(&g.enemies[i]);
      else if (g.enemies[i].type == ENEMY_ROPE_GHOST) enemy_ai_rope_ghost(&g.enemies[i]);
      else enemy_ai_basic(&g.enemies[i].a);
    }

    // boss turn
    boss_ai_step();

    for (int i = 0; i < 8; i++) if (g.enemies[i].a.hp < 0) g.enemies[i].a.hp = 0;
    if (g.boss_alive && g.boss.hp <= 0) {
      g.boss.hp = 0;
      g.boss_alive = 0;
    }
  }
}

// ===================== Save/Load =====================
EXPORT int game_save_size(void) { return (int)sizeof(Save); }

EXPORT void game_save_write(uint8_t *out) {
  memcpy(out, &g, sizeof(Save));
}

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
EXPORT void story_set_flag_bit(int bit) { if (bit >= 0 && bit < 32) g.story_flags |= (1u << bit); }

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

// convenience: apply boss stats after JS inject
EXPORT void boss_apply_stats_from_config(void) {
  g.boss.hp = g.boss.maxhp = g.boss_cfg.hp;
  g.boss.atk = g.boss_cfg.atk;
  g.boss_alive = 1;
  boss_runtime_reset();
  boss_config_end();
}
