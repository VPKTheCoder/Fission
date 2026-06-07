# FISSION

FISSION is a two-player territory strategy game about controlling an 8x8 deep-space reactor grid. Human and AI players place orbs, trigger critical-mass explosions, and flip neighboring territory through chain reactions. Six distinct game modes transform the strategic landscape with special mechanics, while a Symbolic AI engine using minimax with alpha-beta pruning provides intelligent opponents across three difficulty levels.

## How to play
Go to https://fisson.vercel.app/ to play the game. There are tutorials there which will guide you to play it.

Click any empty cell or any cell you already own to place one orb. Turns alternate between you and the AI (or human opponent in 2-Player mode). The game plays out differently depending on which mode you select. For a complete player-facing rules document with strategies and tips, see [GAMEPLAY_GUIDE.md](./GAMEPLAY_GUIDE.md).

## Core Mechanics

### Placing Orbs
- Click any **empty cell** or a **cell you already own** to place one orb
- Turns alternate between players
- You cannot place orbs on cells controlled by your opponent

### Critical Mass & Explosions
- When a cell reaches **critical mass**, it **explodes**
  - **Normal cells**: 4 orbs (or less on edges/corners)
  - **Catalyst cells**: 3 orbs (reduced by 1)
  - **Corner cells**: 2 orbs (reduced base)
  - **Edge cells**: 3 orbs (reduced base)
- The explosion sends orbs to each adjacent cell (up, down, left, right)
- Adjacent cells that reach critical mass also explode in a **chain reaction**
- All orbs from an explosion convert neighboring territory to your color

## Game Modes (6 Total)

### 🎯 **Conquest** — Elimination
Eliminate all opponent orbs from the board. Once both players have placed at least one orb, either side wins as soon as the opponent has zero orbs remaining. Fast, aggressive gameplay.

### 📊 **Cascade** — Scoring
Both players take 20 turns. Every move scores at least 1 point, plus 1 point per explosion step. Highest score after 20 turns each wins. Emphasizes strategic chain reaction planning.

### 💥 **Meltdown** — Degradation
Critical mass thresholds **decrease every 5 turns** as the reactor degrades. Turn 5, 10, 15, etc., trigger spontaneous explosions on cells exceeding new critical mass values. Boards become increasingly chaotic—adapt quickly or face cascade failures.

### 🌌 **Singularity** — Black Hole
The center 2×2 is a **black hole** that swallows adjacent orbs every turn. It blocks all explosions (orbs cannot explode into it). Players must manage drain while avoiding this gravitational trap.

### ⚡ **Overdrive** — Energy & Abilities
Combine scoring with **special abilities**. Chain reactions generate energy: gain 1 energy per explosion step beyond the first. Spend energy on:
- **Stabilize** (3 energy): Reduce critical mass on entire board by 1 for 1 turn
- **Quantum** (5 energy): Place your next orb twice (once per turn)

20 turns per player; highest score wins. Adds tactical depth through ability timing.

### 🏰 **Breach** — Asymmetric
**Asymmetric war for control**: The AI controls the board center (core), while you control the perimeter. The AI wins by either eliminating you or controlling all 4 corners. You win by eliminating the AI. Different board setup reflects this asymmetry.

## Special Cells

| Icon | Name | Effect |
|---|---|---|
| ⚡ Lightning | Catalyst | Critical mass is reduced by 1 (minimum 1). Premium real estate. |
| 🛡️ Shield | Void | Absorbs the first explosion that lands on it, then becomes depleted (one-time use). |
| 📡 Broadcast | Amplifier | When it explodes, sends 2 orbs to each cardinal neighbor instead of 1. Multiplies reach. |
| 🌀 Singularity | Black Hole | (Singularity mode only) Swallows adjacent orbs. Blocks explosions. Uncontrollable. |

## Symbolic AI Engine

FISSION uses a **rule-based Symbolic AI** system—not machine learning. The AI makes decisions through explicit game logic, heuristic evaluation, and adversarial search.

### Minimax Algorithm with Alpha-Beta Pruning

The core decision-making uses **minimax with alpha-beta pruning**:

1. **Game Tree Search**: The AI explores possible future moves recursively to a set depth
2. **Alpha-Beta Pruning**: Eliminates branches that cannot affect the final decision, reducing computation
3. **Evaluation Function**: Each board position is scored using domain-specific metrics:
   - **Conquest Mode**: Orb count, control of special cells (amplifiers +12, catalysts +6), explosion pressure
   - **Cascade/Overdrive Mode**: Score difference between players + board control metrics
   - **Breach Mode**: Corner control (corners worth +30 for AI, -50 for human), center control (2×2 center worth +5)

### Move Ordering & Heuristics

Moves are strategically ordered to maximize pruning efficiency:

1. **Amplifier cells** (highest priority): Always explored first—massive game-changers
2. **Cells that explode immediately** (will reach critical mass): Second priority
3. **Catalyst cells** (special effect cells): Third priority
4. **Other cells** (sorted by distance to center): Lower priority

This ordering allows alpha-beta pruning to reject inferior branches early, speeding search.

### Difficulty Levels

| Difficulty | Search Depth | Time Limit | Random Moves |
|---|---|---|---|
| **Easy** | 1 | 200ms | 60% chance |
| **Normal** | 2 | 500ms | 10% chance (first 3 moves only) |
| **Hard** | 3 | 800ms | 0% (always optimal) |

### Mode-Specific AI Adjustments

- **Meltdown**: AI factors in degradation bonus when evaluating critical mass
- **Singularity**: AI applies singularity drain after simulating opponent moves
- **Overdrive**: AI tracks energy state and considers ability usage in evaluation
- **Breach**: AI uses corner and center control evaluation instead of pure orb count

### Why Symbolic AI?

This approach is ideal for FISSION because:
- **Deterministic**: Every game is reproducible; AI behavior is predictable
- **Transparent**: Decisions follow explicit rules, not learned patterns
- **Efficient**: Minimax is proven optimal for turn-based games
- **Configurable**: Easy to adjust difficulty by tweaking depth, time, or heuristics
- **No training data required**: Rules are hard-coded from game logic

## How Codex helped

Codex was used to generate the full codebase from a detailed specification, including game logic, minimax AI with alpha-beta pruning, special cell mechanics, mode-specific behavior, and animation system. The implementation includes the fixed board generator, chain-reaction processing, difficulty tuning, React components, and production build configuration.

## Tech stack

React, Vite, Tailwind CSS, Rajdhani + Share Tech Mono fonts.

## Run locally

```bash
npm install
npm run dev
```

## Deploy locally

```bash
npm run build
```
