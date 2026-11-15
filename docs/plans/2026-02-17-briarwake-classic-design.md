# Briarwake Classic Mode Design

## Goal

Classic mode is Briarwake's plain rule set. Enhanced mode adds busier enemies and extra bonuses on top of it. All visuals and audio are generated in code.

## Rules in Classic mode

- Extra life every 20,000 points, up to 8 lives.
- Enemy scores: thornworm segments and head, Mizzle the Dripper, Tamsin the Skitter, and Orrin the Weaver, whose score scales with how close you are when you shoot him.
- When several drippers are on screen, their scores double for each consecutive kill.
- Mouse aiming and rapid click firing are the core controls.
- Blooms (guided, diamond, machine gun, shield, lock, house cleaning, extra man, multiplier) drop from destroyed mushrooms.
- Reflecting mushrooms appear in late waves and can be turned off in Options.
- Cheat words are typed while paused with Caps Lock held.

## Tuning

Every speed, spawn window and score value is this game's own tuning. Calibration is done with `pnpm balance` and the deterministic engine tests, not against any other game.

## Open work

- Level-by-level pacing still needs a calibration pass.
- Enemy spawn windows and movement amplitudes need side-by-side review with `pnpm balance`.
