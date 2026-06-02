# FISSION Gameplay Guide

FISSION is a two-player territory strategy game played on an 8x8 board. You play as the cyan side against the coral AI. The goal is to place orbs, build pressure, and trigger chain reactions that convert enemy territory.

## Starting a game

1. Open FISSION.
2. Select **Play**.
3. Choose a mode:
   - **Conquest** for elimination.
   - **Cascade** for score-based chain reaction play.
4. Choose an AI difficulty:
   - **Easy** makes visible mistakes and is best for learning.
   - **Normal** looks for solid short combinations.
   - **Hard** searches deeper and contests powerful cells.
5. The human player always takes the first turn.

## Basic controls

Click a cell to place one orb.

You may place an orb on:

- An empty cell.
- A cell you already own.

You may not place an orb on a cell owned by the AI.

After you move, the AI thinks and places its own orb. Turns continue until the selected mode ends.

## Board ownership

Every cell can be empty, owned by you, or owned by the AI. A cell becomes yours when you place an orb on it or when one of your explosions sends orbs into it. Explosions can overwrite enemy-owned cells, so a single chain reaction can swing a large section of the board.

## Critical mass

Each cell has a critical mass based on its position:

| Cell position | Critical mass |
|---|---:|
| Corner | 2 |
| Edge | 3 |
| Interior | 4 |

When a cell reaches or exceeds its critical mass, it explodes.

## Explosions

When a cell explodes:

1. It loses orbs equal to its critical mass.
2. It sends orbs to its cardinal neighbors: up, down, left, and right.
3. Neighboring cells become the exploding player's color.
4. Any neighbor that reaches critical mass also explodes.

This can create a chain reaction. Chain reactions are the core of FISSION: the best moves are often not the moves that gain the most orbs immediately, but the moves that prepare a larger cascade later.

## Special cells

Special cells are fixed at the start of every game and are visible immediately.

| Icon | Name | Positions | Effect |
|---|---|---|---|
| Lightning | Catalyst | (1,1), (1,6), (6,1), (6,6) | Critical mass is reduced by 1, to a minimum of 1. Catalysts are fast trigger points. |
| Shield | Void | (0,3), (3,7), (7,4) | A charged Void absorbs the first explosion that would enter it. After that, it becomes depleted and behaves like a normal cell. |
| Broadcast | Amplifier | (3,3), (4,4) | When an Amplifier explodes, it sends 2 orbs to each neighbor instead of 1. |

## Conquest mode

Conquest is an elimination game. The game starts counting elimination only after both players have placed at least one orb. After that, if either player has zero orbs on the board, the opponent wins.

To win Conquest:

- Build stable territory.
- Avoid giving the AI easy chain reactions.
- Contest Catalysts and Amplifiers.
- Use explosions to convert enemy cells, not just to add orbs.

## Cascade mode

Cascade is a scoring game. Both players take 20 turns each, for 40 total turns.

Each move scores points based on the number of explosion steps it triggers:

- A move with no explosion scores 1.
- A move with a 1-step explosion scores 1.
- A move with a 6-step chain scores 6.

The player with the higher score after 40 turns wins. Cascade rewards planned chain reactions even if they do not eliminate the opponent.

## Reading the HUD

The HUD shows:

- Your current orb count.
- The AI orb count.
- Whose turn it is.
- The active game mode.
- The current turn number.
- Cascade scores when playing Cascade mode.

If the HUD says **AI THINKING...**, input is temporarily disabled until the AI completes its move.

## Beginner strategy

Start by claiming cells that are hard for the AI to immediately flip. Corners and edges need fewer orbs to explode, so they can create quick chains, but they are also easier to destabilize.

Catalysts are strong early because they explode sooner than normal cells. Amplifiers are usually the most valuable cells on the board because one explosion from an Amplifier can flip several nearby cells at once.

Voids can stop a chain route once. You can either avoid charged Voids when setting up a cascade or deliberately deplete them so they cannot block a later attack.

## Practical tips

- Do not fill every cell evenly. Pressure near critical mass creates threats.
- Watch enemy cells that are one orb away from exploding.
- A small explosion near an Amplifier can become a large chain.
- In Conquest, removing the opponent's last orb wins immediately.
- In Cascade, a high-scoring chain can matter more than board control.
- Easy AI sometimes ignores dangerous setups; use that to learn chain timing.
- Hard AI values Amplifiers and Catalysts, so expect it to fight for the center.

## Finishing a game

When the game ends, FISSION shows the result:

- **VICTORY** if you win.
- **DEFEAT** if the AI wins.
- **STALEMATE** if Cascade mode ends tied.

Use **PLAY AGAIN** to restart with the same settings, or **MAIN MENU** to choose a new mode and difficulty.
