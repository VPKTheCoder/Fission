# FISSION

FISSION is a two-player territory strategy game about controlling an 8x8 deep-space reactor grid. Human and AI players place orbs, trigger critical-mass explosions, and flip neighboring territory through chain reactions. Special cells turn the board into a tactical fight over catalysts, firebreaks, and amplifier cores.

## How to play

Click any empty cell or any cell you already own to place one orb. Turns alternate between you and the AI. In Conquest, eliminate every enemy orb after both players have entered the board; in Cascade, play 20 turns each and score by the number of explosion steps caused by every move.

For a complete player-facing rules document, see [GAMEPLAY_GUIDE.md](./GAMEPLAY_GUIDE.md).

## Special cells

| Icon | Name | Effect |
|---|---|---|
| Lightning | Catalyst | Critical mass is reduced by 1, with a minimum of 1. |
| Shield | Void | A charged Void absorbs the first explosion that would land on it, then becomes depleted. |
| Broadcast | Amplifier | When it explodes, it sends 2 orbs to each cardinal neighbor instead of 1. |

## Game modes

Conquest is the elimination mode. Once both players have placed at least one orb, either side wins as soon as the opponent has zero orbs remaining on the board.

Cascade is the scoring mode. Both players take 20 turns, every move scores at least 1 point, and longer chain reactions score 1 point per distinct explosion step.

## How Codex helped

Codex was used to generate the full codebase from a detailed specification, including game logic, minimax AI, special cell mechanics, and animation system. The implementation includes the fixed board generator, chain-reaction processing, difficulty tuning, React components, and production build configuration.

## Tech stack

React, Vite, Tailwind CSS, Rajdhani + Share Tech Mono fonts.

## Run locally

```bash
npm install
npm run dev
```

## Deploy

```bash
npm run build
```

Deploy `/dist` to Vercel.
