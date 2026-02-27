#include <stdint.h>
#include <string.h>

#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>
#define EXPORT EMSCRIPTEN_KEEPALIVE
#else
#define EXPORT
#endif

// ====== Minimal roguelike: tile + bump combat + 1 boss ======
// Map: 40x22, tiles: '#' wall, '.' floor
// Entities: player '@', enemy 'g', boss 'B'

#define W 40
#define H 22

typedef struct {
  int x, y;
  int hp, maxhp;
  int atk;
} Actor;

typedef struct {
  uint32_t version;
  uint32_t rng;
  uint32_t turn;
  uint8_t  map[W * H];
  Actor player;
  Actor enemy;
  Actor boss;
  uint8_t boss_alive;
} Save;

static Save g;

static uint32_t xorshift32(uint32_t *s) {
  uint32_t x = *s;
  x ^= x << 13;
  x ^= x >> 17;
  x ^= x << 5;
  *s = x;
  return x;
}

static int in_bounds(int x, int y) { return x >= 0 && x < W && y >= 0 && y < H; }
static uint8_t get_map(int x, int y) { return g.map[y * W + x]; }
static void set_map(int x, int y, uint8_t t) { g.map[y * W + x] = t; }

static void carve_room(int x0, int y0, int x1, int y1) {
  for (int y = y0; y <= y1; y++)
    for (int x = x0; x <= x1; x++)
      if (in_bounds(x,y)) set_map(x,y,'.');
}

static void gen_map(void) {
  // Fill walls
  for (int i = 0; i < W * H; i++) g.map[i] = '#';

  // Simple rooms + corridors
  carve_room(2, 2, 16, 10);
  carve_room(22, 3, 37, 12);
  carve_room(8, 13, 30, 20);

  // Corridors
  for (int x = 16; x <= 22; x++) set_map(x, 7, '.');
  for (int y = 7; y <= 13; y++) set_map(22, y, '.');
  for (int x = 16; x <= 22; x++) set_map(x, 16, '.');

  // Sprinkle a few pillars (walls) for movement tactics
  for (int i = 0; i < 16; i++) {
    int x = (int)(xorshift32(&g.rng) % (W - 2)) + 1;
    int y = (int)(xorshift32(&g.rng) % (H - 2)) + 1;
    if (get_map(x,y) == '.') set_map(x,y,'#');
  }
}

static int is_blocked(int x, int y) {
  if (!in_bounds(x,y)) return 1;
  return get_map(x,y) == '#';
}

static int actor_at(int x, int y) {
  if (g.enemy.hp > 0 && g.enemy.x == x && g.enemy.y == y) return 1;
  if (g.boss_alive && g.boss.hp > 0 && g.boss.x == x && g.boss.y == y) return 2;
  return 0;
}

static void player_attack(Actor *t) {
  t->hp -= g.player.atk;
  if (t->hp < 0) t->hp = 0;
}

static void enemy_ai(Actor *a) {
  if (a->hp <= 0) return;

  // Very simple chase: move one step toward player if path isn't blocked.
  int dx = (g.player.x > a->x) - (g.player.x < a->x);
  int dy = (g.player.y > a->y) - (g.player.y < a->y);

  // If adjacent -> attack
  if ((abs(g.player.x - a->x) + abs(g.player.y - a->y)) == 1) {
    g.player.hp -= a->atk;
    if (g.player.hp < 0) g.player.hp = 0;
    return;
  }

  // Try horizontal first, then vertical
  int nx = a->x + dx, ny = a->y;
  if (!is_blocked(nx, ny) && actor_at(nx, ny) == 0 && !(nx == g.player.x && ny == g.player.y)) {
    a->x = nx; a->y = ny; return;
  }
  nx = a->x; ny = a->y + dy;
  if (!is_blocked(nx, ny) && actor_at(nx, ny) == 0 && !(nx == g.player.x && ny == g.player.y)) {
    a->x = nx; a->y = ny; return;
  }
}

// Boss: 2-pattern loop with a telegraph.
// Pattern A: charge (2 tiles) every 3 turns
// Pattern B: slam (AOE around boss) when adjacent
static void boss_ai(void) {
  if (!g.boss_alive || g.boss.hp <= 0) return;

  int dist = abs(g.player.x - g.boss.x) + abs(g.player.y - g.boss.y);

  // Adjacent -> slam
  if (dist == 1) {
    g.player.hp -= (g.boss.atk + 1);
    if (g.player.hp < 0) g.player.hp = 0;
    return;
  }

  // Charge every 3 turns: step twice if possible
  if ((g.turn % 3) == 0) {
    int dx = (g.player.x > g.boss.x) - (g.player.x < g.boss.x);
    int dy = (g.player.y > g.boss.y) - (g.player.y < g.boss.y);

    for (int i = 0; i < 2; i++) {
      int nx = g.boss.x + dx;
      int ny = g.boss.y + dy;
      if (is_blocked(nx, ny) || actor_at(nx, ny) != 0) break;
      g.boss.x = nx; g.boss.y = ny;
      if (g.boss.x == g.player.x && g.boss.y == g.player.y) break;
    }
  } else {
    // Otherwise slow chase
    enemy_ai(&g.boss);
  }
}

EXPORT void game_new(uint32_t seed) {
  memset(&g, 0, sizeof(g));
  g.version = 1;
  g.rng = seed ? seed : 0xA1B2C3D4u;
  g.turn = 0;

  gen_map();

  g.player = (Actor){ .x = 4, .y = 4, .hp = 12, .maxhp = 12, .atk = 3 };
  g.enemy  = (Actor){ .x = 28, .y = 8, .hp = 7,  .maxhp = 7,  .atk = 2 };
  g.boss   = (Actor){ .x = 20, .y = 17,.hp = 18, .maxhp = 18, .atk = 3 };
  g.boss_alive = 1;
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

EXPORT int game_enemy_alive(void){ return g.enemy.hp > 0; }
EXPORT int game_boss_alive(void){ return g.boss_alive && g.boss.hp > 0; }
EXPORT int game_boss_hp(void){ return g.boss.hp; }
EXPORT int game_boss_maxhp(void){ return g.boss.maxhp; }

// Input: 0 none, 1 up,2 down,3 left,4 right, 5 dash(up),6 dash(down),7 dash(left),8 dash(right)
static void try_move_player(int dx, int dy, int steps) {
  for (int i = 0; i < steps; i++) {
    int nx = g.player.x + dx;
    int ny = g.player.y + dy;

    int who = actor_at(nx, ny);
    if (who == 1) { player_attack(&g.enemy); return; }
    if (who == 2) { player_attack(&g.boss); return; }

    if (is_blocked(nx, ny)) return;

    g.player.x = nx; g.player.y = ny;
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
    try_move_player(dx, dy, dash ? 2 : 1);
    g.turn++;

    // Enemies take turn
    enemy_ai(&g.enemy);
    boss_ai();

    // Resolve deaths
    if (g.enemy.hp <= 0) { g.enemy.hp = 0; }
    if (g.boss_alive && g.boss.hp <= 0) {
      g.boss.hp = 0;
      g.boss_alive = 0;
    }
  }
}

// ===== Save/Load: single slot binary blob =====
EXPORT int game_save_size(void) { return (int)sizeof(Save); }

EXPORT void game_save_write(uint8_t *out) {
  memcpy(out, &g, sizeof(Save));
}

EXPORT int game_load_read(const uint8_t *in, int len) {
  if (len != (int)sizeof(Save)) return 0;
  Save tmp;
  memcpy(&tmp, in, sizeof(Save));
  if (tmp.version != 1) return 0;
  g = tmp;
  return 1;
}