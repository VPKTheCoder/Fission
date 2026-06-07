# FISSION Gameplay Guide

Welcome to FISSION, a strategic territory control game about chain reactions and tactical placement! Master six distinct game modes, each transforming how you approach the 8×8 reactor grid.

---

## Core Mechanics

### Placing Orbs
- Click any **empty cell** or a **cell you already own** to place one orb
- Turns alternate between you and your opponent (human or AI)
- You cannot place orbs on cells controlled by your opponent
- Optimal placement is the cornerstone of victory

### Critical Mass & Explosions
- When a cell reaches **critical mass**, it **explodes**
  - **Normal cells**: 4 orbs
  - **Corner cells**: 2 orbs (reduced base)
  - **Edge cells** (non-corner): 3 orbs (reduced base)
  - **Catalyst cells**: 3 orbs (reduced by 1 from normal)
- The explosion sends **1 orb to each adjacent cell** (up, down, left, right)
- Adjacent cells that reach critical mass also explode in a **chain reaction**
- All orbs from an explosion **convert neighboring territory to your color**

### Territory Control
- Each cell is owned by the player whose orbs occupy it
- When orbs explode into a cell, the cell changes ownership
- Control is visualized by cell color
- Territory control is the foundation of all winning conditions

---

## Game Modes (6 Total)

### 🎯 **CONQUEST** — Elimination

**Objective**: Reduce opponent orbs to zero.

**Rules**:
- Turns alternate between players
- Both players must place at least one orb before winning is possible
- Win when opponent has 0 orbs remaining on board
- Game ends immediately upon this condition

**Strategic Focus**: Aggressive placement to maximize chain reactions and clear enemy territory.

**Game Pacing**: Variable (can be fast or slow depending on player skill)

**Best For**: Players who enjoy direct confrontation and quick, decisive strikes.

**Key Strategies**:
- Create **forced chains** that eliminate large blocks of opponent orbs
- Secure **Catalyst and Amplifier cells**—they accelerate your dominance
- **Defend your territory** by placing on your own cells to build up explosive reserves
- **Isolate enemy orbs** into small regions they can't escape from

**Example Flow**:
1. You place on empty cell → explodes → eliminates 3 opponent orbs
2. Opponent's remaining orbs become increasingly vulnerable
3. One final move clears the board → You win

**Difficulty vs AI**:
- Easy AI: Makes suboptimal moves; can be beaten with basic strategy
- Normal AI: Plays competently; will eliminate you if careless
- Hard AI: Calculates deep chains; almost unbeatable at this mode

---

### 📊 **CASCADE** — Scoring

**Objective**: Score the highest points over 20 turns each.

**Scoring System**:
- Every move grants **1 base point**
- **+1 point per explosion step** in your chain reaction
- Example: A move triggering 5 explosions = 6 points (1 base + 5 chain)
- Longer chain reactions = exponential score gains

**Rules**:
- Each player takes exactly 20 turns
- After 40 total moves (20 per player), the game ends
- If scores are tied, result is a draw
- Orbs are not eliminated (but territory changes ownership)

**Strategic Focus**: Planning 2-3 moves ahead to set up massive chain reactions.

**Game Pacing**: Moderate (careful, deliberate play)

**Best For**: Tactical players who enjoy long-term planning and setup.

**Key Strategies**:
- **Map explosion routes**: Know which cells lead to long chains
- **Sacrifice moves**: Sometimes place where you'll lose territory if it sets up a 10-point chain next turn
- **Protect scoring chains**: Don't let opponent disrupt your setup
- **Count points carefully**: A 3-point chain with Amplifier might be worth more than an aggressive 5-point move
- **Amplifiers are gold**: Every Amplifier on your territory increases future chain potential

**Example Flow**:
1. Turn 1: Place conservatively (1 point)
2. Turn 2: Place to set up Amplifier chains (2 points)
3. Turn 3: Opponent tries to block → places suboptimally (1 point)
4. Turn 4: **UNLEASH**: Activate Amplifier → triggers 8-step chain (9 points)
5. You're now ahead; maintain advantage through remaining turns

**Difficulty vs AI**:
- Easy AI: Scores randomly; you easily outscore it
- Normal AI: Plans 1-2 moves ahead; competitive games
- Hard AI: Sees deep chains; may lock you out of high-scoring positions

---

### 💥 **MELTDOWN** — Degradation

**Objective**: Be the last player with orbs; critical mass thresholds continuously decrease.

**Core Mechanic**:
Every **5 turns**, critical mass thresholds decrease by 1 (bottom limit: 1).

| Turn Range | Critical Mass Adjustment |
|---|---|
| Turns 1-4 | Normal (-0) |
| Turns 5-9 | Decreased by 1 (-1) |
| Turns 10-14 | Decreased by 2 (-2) |
| Turns 15+ | Decreased by 3 (-3) |

**The Degradation Process**:
1. At turns 5, 10, 15, 20, etc., the reactor destabilizes
2. All cells currently exceeding new critical mass automatically explode
3. These explosions trigger chain reactions
4. Multiple players' orbs may detonate simultaneously (massive board shifts)

**Rules**:
- First player to eliminate all opponent orbs wins
- After both players place first orb, standard win condition applies
- Degradation applies regardless of whose turn it is

**Strategic Focus**: Adaptation and survival; early aggression followed by defensive stabilization.

**Game Pacing**: Escalating chaos (manageable early, frantic late)

**Best For**: Players who thrive in dynamic, unpredictable environments.

**Key Strategies**:
- **Early aggression**: Turns 1-4 have normal critical mass; dominate early
- **Anticipate degradation**: Before turn 5, position for stability
- **Cluster weakly**: Keep orbs spread out to avoid catastrophic spontaneous explosions
- **Catalyst cells become critical**: They're only 3-orbs normally; at turn 10 with -2 degradation, only 1 orb needed to explode
- **Turn 15+ is survival mode**: Almost any placement triggers explosions; plan for chaos

**Example Flow**:
1. Turns 1-4: You place aggressively, opponent responds
2. Turn 5: Degradation triggers → Your 4-orb cell explodes (was safe before)
3. Turn 6: Opponent adapts, places defensively
4. Turn 10: Massive spontaneous explosion wave → 6 cells detonate at once
5. Chaos resolves; whoever planned better survives

**Difficulty vs AI**:
- Easy AI: Doesn't adapt to degradation; you exploit this
- Normal AI: Plans around degradation turns
- Hard AI: Builds boards that thrive even after -3 degradation

---

### 🌌 **SINGULARITY** — Black Hole

**Objective**: Eliminate all opponent orbs (standard Conquest rules).

**Core Mechanic**:
The center 2×2 grid is a **black hole** with unique properties:
- **Position**: Rows 3-4, Columns 3-4 (the four central cells)
- **Cannot be controlled**: No player can own these cells
- **Drains adjacent orbs**: Every turn, the black hole swallows 1 orb from each adjacent cell (8 neighboring cells)
- **Blocks explosions**: Orbs cannot explode into the black hole; they vanish instead
- **Orbs disappear**: Drained orbs are removed from the game entirely

**Turn Sequence**:
1. Player places orb → explosions resolve normally
2. **Singularity drains**: Each adjacent cell loses 1 orb (if owned)
3. Drained orbs are consumed (not transferred)
4. Turn ends; next player goes

**Rules**:
- Standard elimination rules apply (reduce opponent to 0 orbs)
- Singularity drain happens after every move
- If a cell has 1 orb and loses it to drain, the cell becomes neutral

**Strategic Focus**: Avoid the black hole while using it strategically against opponent.

**Game Pacing**: Moderate (draining mechanic adds urgency)

**Best For**: Players who enjoy positional play and tight resource management.

**Key Strategies**:
- **Avoid the center**: Placing near the black hole is a resource drain
- **Force opponent near it**: Place orbs pushing them toward the drain
- **Use it as a barrier**: The black hole blocks expansions; position accordingly
- **Sacrifice moves**: Sometimes feed orbs to the black hole to prevent opponent chains
- **Perimeter control**: Win by controlling the outer ring while opponent loses to drain
- **Corner strategy**: Corners are far from drain; secure them early

**Example Flow**:
1. You place cell at (5,5) adjacent to black hole → 2 orbs drained per turn
2. Opponent places at (2,2) far from center → no drain effect
3. After 3 turns: Your cell has lost 6 orbs due to drain
4. You adapt: Focus on outer territories where drain doesn't reach

**Difficulty vs AI**:
- Easy AI: Gets drained quickly; loses by attrition
- Normal AI: Respects the drain; plays carefully
- Hard AI: Uses drain strategically; might even feed you toward it

---

### ⚡ **OVERDRIVE** — Energy & Special Abilities

**Objective**: Score the highest points over 20 turns each (like Cascade, but with abilities).

**Core Mechanic**:
Combine scoring with **purchasable special abilities**. Chain reactions generate energy that you spend on powerful effects.

**Energy System**:
- **Earn energy**: Each chain reaction grants energy equal to (chain steps - 1)
  - Example: 5-step chain = 4 energy earned
  - Single explosion = 0 energy
- **Energy pool**: Accumulates across turns; no maximum
- **Spend energy**: Abilities consume energy; only one ability per turn max

**Abilities**:

| Ability | Cost | Effect | Strategy |
|---|---|---|---|
| **Stabilize** | 3 | Reduce all critical mass thresholds by 1 for 1 turn | Use before enemy sets up a massive chain |
| **Quantum** | 5 | Place your next orb **twice** (once per turn) | Devastating: Double placement = double explosions |

**Rules**:
- 20 turns per player (40 total)
- Scoring identical to Cascade (1 base + chain steps)
- Highest score wins
- Abilities only function during your turn
- Using ability doesn't prevent move; you still place an orb

**Strategic Focus**: Balance immediate scoring vs. saving for ability timing.

**Game Pacing**: Moderate-to-high intensity (ability timing creates tension)

**Best For**: Players who enjoy tactical depth and turn-by-turn decision-making.

**Key Strategies**:
- **Earn first, spend later**: Accumulate 5 energy before using Quantum
- **Quantum into setup**: Use Quantum when you have a planned double-chain
- **Stabilize disruption**: When opponent builds threatening position, Stabilize to lower their critical mass
- **Energy conservation**: Don't waste 3 energy on Stabilize unless it's critical
- **Chain optimization**: A 4-energy chain is better than a 3-energy chain (leaves room for ability next turn)
- **Mind the endgame**: Don't waste energy late-game if you're behind in score

**Example Flow**:
1. Turn 1-3: You place conservatively, earn 2+3+1 = 6 energy
2. Turn 4: Use Stabilize (3 energy) → opponent's planned 6-step chain becomes 5-step
3. Turn 5: Earn 4 more energy (now at 7)
4. Turn 6: Use Quantum (5 energy) → place orb twice, trigger massive chains
5. Score advantage; coast to victory

**Difficulty vs AI**:
- Easy AI: Doesn't use abilities effectively; predictable
- Normal AI: Uses abilities tactically; formidable
- Hard AI: Perfect ability timing; nearly unbeatable

---

### 🏰 **BREACH** — Asymmetric War

**Objective**: Asymmetric victory conditions based on player role.

**Core Mechanic**:
**Roles are permanent and opposite**:
- **You (HUMAN)**: Control the perimeter; goal is to eliminate AI
- **AI**: Controls the board center; goal is to eliminate you OR control all 4 corners

**Board Setup**:
- Center 4×4 starts controlled by AI
- Outer ring (perimeter) starts neutral
- You must fight inward from the edges

**Win Conditions**:

| Player | Win Conditions (Either) |
|---|---|
| **Human** | 1. AI orbs reach 0, OR 2. (Mutual elimination not a win) |
| **AI** | 1. Human orbs reach 0, OR 2. AI controls all 4 corners |

**Strategic Focus**: Different strategies for each side; human plays defensively/offensively; AI plays defensively/corner-grab.

**Game Pacing**: Variable (can be long; asymmetry makes it unpredictable)

**Best For**: Players who enjoy strategic imbalance and unique challenges.

**Key Strategies for Human**:
- **Rapid expansion**: Spread control to corner before AI moves there
- **Divide and conquer**: Isolate AI groups; prevent them from linking
- **Corner capture**: Getting even 1 corner denies AI victory; get all 4 and you're safe
- **Early pressure**: Don't let AI consolidate; force activity
- **Sacrifice plays**: Trade orbs for progress toward corners

**Key Strategies for AI** (when you play against it):
- **Defend corners**: The AI prioritizes corner control; it won't abandon them
- **Isolate the center**: Keep AI contained to board center; prevent expansion
- **Outpace its growth**: You must eliminate AI faster than it claims corners
- **Exploit early advantage**: You have perimeter control initially; use it

**Example Flow (Human perspective)**:
1. You place at corners [0,0] and [0,7]
2. AI expands outward from center
3. Race: Can you secure 4 corners before AI reaches them?
4. You capture [7,0] and [7,7]
5. You've blocked AI's corner victory → must eliminate it instead
6. Engage in standard elimination phase

**Difficulty vs AI**:
- Easy AI: Doesn't prioritize corners; you win easily
- Normal AI: Respects corners; competitive game
- Hard AI: Plays perfectly; very hard to beat

---

## Special Cells

Special cells are scattered across the board in fixed locations and modify critical mass or explosion behavior.

| Icon | Name | Location | Effect | Strategy |
|---|---|---|---|---|
| ⚡ Lightning | **Catalyst** | 4 corners of inner square | Critical mass is reduced by 1 (minimum 1). Explodes at 3 orbs instead of 4 | Secure these early; they're force multipliers |
| 🛡️ Shield | **Void** | 3 locations | Absorbs the first explosion that lands on it, then becomes depleted (one-time use only) | Use as defensive barrier; opponent must find another route |
| 📡 Broadcast | **Amplifier** | 2 central locations | Sends **2 orbs** to each cardinal neighbor (instead of 1) | Massive board-shakersif on your territory; keep opponent away |
| 🌀 Singularity | **Black Hole** | Center 2×2 (Singularity mode only) | Swallows adjacent orbs every turn; blocks explosions | Avoid or leverage against opponent |

---

## Turn Order & Phases

1. **Your Turn**: Click a cell to place an orb (or use ability if Overdrive)
2. **Explosions**: Chain reactions resolve instantly
3. **Special Effects**: 
   - Singularity drain (Singularity mode)
   - Meltdown degradation (Meltdown mode, every 5 turns)
   - Ability effects (Overdrive mode)
4. **Opponent's Turn**: AI or human places their orb
5. **Opponent's Effects**: Same as above
6. **Win Check**: Test for victory condition
7. **Repeat** until win condition met

---

## Difficulty Levels (vs AI)

When playing against AI:

| Level | AI Strength | Lookahead | Random Moves |
|---|---|---|---|
| **Easy** | Very weak; makes illogical moves | 1 turn | 60% chance |
| **Normal** | Competent; plays solidly | 2 turns | 10% (biased toward good moves) |
| **Hard** | Near-optimal; deep planning | 3 turns | 0% (always best move) |

---

## Tips & Strategies (Universal)

### General Principles
- **Chain reactions are powerful**—one move can transform the board
- **Catalysts are premium cells**—securing them early gives massive advantage
- **Defend your territory**—place orbs on your own cells to build up explosive potential
- **Watch the opponent**—anticipate their chains before they execute them
- **Think 2-3 moves ahead**—plan setups, not just immediate placements
- **Special cells are worth fighting for**—Amplifiers and Catalysts are game-changers

### Explosive Thinking
- **Amplifiers multiply reach**: An Amplifier chain can reach 16 cells instead of 4
- **Catalysts speed victory**: Fewer orbs needed to trigger explosions
- **Voids are walls**: They block one chain; use them strategically
- **Pressure matters**: 3 orbs on a cell with 4 critical mass is dangerous—pressure opponent to defuse it

### Territory Management
- **Consolidate early**: Don't spread too thin early on
- **Expand strategically**: Each expansion should support future chains
- **Isolate enemy orbs**: Group opponent pieces into small regions where they can't escape
- **Control the center**: Middle of board influences more cells than edges

### Mode-Specific Tips

**Conquest**: Be aggressive; eliminate opponent quickly before they consolidate.

**Cascade**: Plan chains; map routes; sometimes conservative play scores higher.

**Meltdown**: Adapt constantly; don't get caught with dangerous configurations at turn 5, 10, 15.

**Singularity**: Use drain to your advantage; force opponent into high-drain zones.

**Overdrive**: Save abilities for turning points; don't waste on minor plays.

**Breach** (as Human): Move fast; don't let AI consolidate the center.

---

## Advanced Tactics

### Forcing Opponent Mistakes
- Place orbs that create **threats** (cells near critical mass)
- Force opponent to either block or accept a chain reaction
- This limits their options and gives you initiative

### Multi-Level Chains
- Set up your pieces so a chain reaction creates **more** threats
- A single move triggers a 5-step chain; leaves opponent 3 cells at pressure
- Opponent must defuse; you regain initiative

### Void Baiting
- If opponent places a Void, funnel chains through it
- Forces them to use their one-time defense
- After depleted, that zone becomes a free path for your attacks

### Catalyst Control
- Catalysts are **force multipliers** for whoever controls them
- Secure key ones early; deny opponent others
- In endgame, one Catalyst can decide board control

### Amplifier Cascades
- Build setups where Amplifier chains link
- Example: Amplifier on your territory → 2 orbs to adjacent cells → both reach critical mass → chain continues
- Result: One move, 8+ explosion steps

### Sacrificial Play
- Sometimes place where you'll lose territory
- If it sets up opponent to make a mistake or wastes their move, it's worth it
- Especially effective in Cascade (score, not territory)

---

## Game States & UI Indicators

During play, watch for:

- **Your Turn**: You can click cells; opponent waits
- **Opponent Thinking**: AI calculating its move (less than 1 second usually)
- **Resolving Explosions**: Watch chain reactions play out (don't click; just observe)
- **Board Stress**: Color intensity shows orb density; darker = more orbs
- **Chain Meter**: Displays current chain length during explosions
- **Energy (Overdrive only)**: Bar showing available ability energy
- **Meltdown Indicator**: Shows current critical mass degradation level
- **Game Over**: Winner/score displayed with option to play again or return to menu

---

## Accessibility Features

- Full keyboard navigation supported (Tab to focus, Enter to select)
- Screen reader compatible (ARIA labels on all interactive elements)
- Color-blind friendly (icons + labels for all cell types; not solely color-dependent)
- Configurable animation speed (if available in settings)

---

## FAQ & Common Mistakes

**Q: Why did my cell explode at 3 orbs?**
A: It's either a Catalyst cell (reduced by 1), a corner (base 2), or an edge (base 3), or Meltdown degradation lowered thresholds.

**Q: Can I control the Singularity black hole?**
A: No. It's uncontrollable; only drain orbs from it.

**Q: Is there a board limit?**
A: No; theoretically infinite orbs per cell. Most games resolve before reaching large numbers.

**Q: Can I undo moves?**
A: No; moves are final. Plan carefully.

**Q: How do ties work?**
A: In Cascade/Overdrive, if scores are tied after 40 turns, result is a draw. In other modes, ties are uncommon (one player eliminates the other).

---

## Progression Path (Learning Order)

1. **Start with Conquest**: Learn the basics; understand chain reactions
2. **Try Cascade**: Practice planning; think ahead
3. **Explore Meltdown**: Adapt to changing conditions
4. **Master Singularity**: Positional play and resource denial
5. **Unlock Overdrive**: Add tactical ability timing
6. **Conquer Breach**: Asymmetric strategy and role-based play

---

Enjoy the game, and may your chain reactions be legendary! ⚛️

**Pro Tip**: The best players don't just react to the board—they **shape it** with every placement. Think several moves ahead, anticipate opponent responses, and always have a follow-up play ready.
