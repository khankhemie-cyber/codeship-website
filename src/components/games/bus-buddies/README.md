# Bus Buddies Road Trip

An early coding game for ages 4–6 at `/ship-it/bus-buddies/`. Kids put picture
blocks in order to drive Bina the Bus, pick up friends and reach the destination.

| What | Where |
| --- | --- |
| Chapters and free levels 1–10 (data) | `src/lib/games/bus/levels.ts` |
| Class levels 11–20 (server only) | `src/lib/games/paid/bus.ts` |
| Game rules (pure, tested) | `src/lib/games/bus/engine.ts` |
| Every spoken line | `src/lib/games/bus/voice-script.json` |
| Voice settings and picks | `scripts/bus-buddies/voices.json` |
| Voice generator | `scripts/bus-buddies/generate-voices.mjs` |
| Generated audio | `public/ship-it/bus-buddies/audio/` |
| Screens, art, sound | this folder (`BusBuddies.tsx`, `art.tsx`, `sound.ts`) |
| Tests | `npm run test:bus` |

## Add a level

1. Add an entry to `FREE_LEVELS` in `src/lib/games/bus/levels.ts` (levels 1–10), or
   to `BUS_PAID_LEVELS` in `src/lib/games/paid/bus.ts` (class levels). Then add its id
   to its chapter's `levelIds` and its sticker picture to `stickers` in `CHAPTERS`.
   Copy a level and change:
   - `map`: one string per row, 5×5 up to 7×7. The key is at the top of `levels.ts`:
     `S` start, `#` road, `G` destination, `k` ferry dock, `w` water, `x` road work,
     `m` mountain rocks, `c` cows, `f` flowers, `t` tree, `h` house, plus a letter for each
     stop (`passengers`) and each traffic light or duckling crossing (`lights`).
   - `start.dir`: which way Bina faces (0 up, 1 right, 2 down, 3 left).
   - `blocks`: what's on the shelf: `forward`, `left`, `right`, `honk`, `wait`,
     `pickup`, `bridge`, `ferry`, `repeat`.
   - `maxBlocks`: slots in the strip. A Repeat uses one slot plus one per block inside it,
     so a small `maxBlocks` makes children use Repeat. `repeatBody` caps a Repeat's blocks.
   - `passengers`: who or what is waiting, and what gets them aboard (`arrive`, `honk` or `pickup`).
   - `lights`: `{ ch, red, kind }`: red until `red` blocks have run (Wait takes one).
   - `mode: "cones"` with `cones: n`: children tap road squares to close them, and Bina
     drives herself, taking the only open road. Give the answer in `coneSolution`.
   - `goal`: the picture at `G` (`gate`, `picnic`, `flag`, `fountain`, `peak`, `party`).
   - `prompt`, `successLine`: line IDs from `voice-script.json`.
   - `sticker`: the sticker the level gives.
   - `solution`: one correct program. The hint arrow and "add the next block" follow it.
2. Add any new lines to `voice-script.json`.
3. Run `npm run test:bus`. It checks that the answer works, fits the slots, only uses
   that level's blocks, that Repeat levels really need a Repeat, that cones levels need
   their cones, and that every line ID exists.

Levels play in chapter order. A level opens once the one before it in its chapter is done.
Levels 1–10 are free; 11–20 are sent by `/api/arcade/levels/?game=bus` only to a browser
holding the Explorers class password.

## Change a line, or regenerate the voices

The voices are MP3 files made once with ElevenLabs. Kids never trigger an API call.
You need a paid ElevenLabs plan (the free plan is non-commercial) and its API key in
`ELEVENLABS_API_KEY`.

```bash
# 1. Edit the text in src/lib/games/bus/voice-script.json, then:
node scripts/bus-buddies/generate-voices.mjs            # only new or changed lines
node scripts/bus-buddies/generate-voices.mjs --chapter 1  # one chapter
node scripts/bus-buddies/generate-voices.mjs --dry-run    # list what would change
node scripts/bus-buddies/generate-voices.mjs --force      # rebuild everything
```

Commit the new files in `public/ship-it/bus-buddies/audio/`, including `manifest.json`.

### Choosing voices (first time, or to recast a character)

```bash
node scripts/bus-buddies/generate-voices.mjs --samples
```

This writes samples to `public/ship-it/bus-buddies/voice-samples/`. Open
`/ship-it/bus-buddies/voices/` to listen and pick, then save your picks:

```bash
node scripts/bus-buddies/generate-voices.mjs --pick bina=A,codey=B,turtle=A,duck=C,owl=B
```

Each character's voice description is in `voices.json` under `candidates`.

Until audio exists for a line, the game shows it in a speech bubble for a
reading-length pause, so everything still works with no audio.

## Notes

- Sound effects (honk, boing, cheer) are made with the Web Audio API. There are no sound files.
- Progress (levels done, stickers) is saved only in this browser's localStorage, under `codeship-bus-buddies-v1`.
- All animation stops under `prefers-reduced-motion`.
- The Grown-up corner is the lock button in the top bar: press and hold it to open.
