# My Games

This repo is my games website. The front page (`index.html`) shows my name and a
card for each game. Press **PLAY** on a card to open that game.

| Folder | What it is |
|---|---|
| `index.html` | The landing page with my name and the list of games |
| `hero-clash/` | Hero Clash, a 3D superhero fighting game |
| `.github/workflows/pages.yml` | The robot that publishes the website |

## How the website updates itself
Every time a change lands on the `main` branch, GitHub Actions runs `pages.yml`. It
publishes the whole repo to GitHub Pages, which shows it at my own domain. You don't
need to upload anything by hand. The website is updated a minute or two after a change.

## Add a new game
1. Make a new folder for it, like `my-new-game/`, with an `index.html` inside.
2. Add a cover picture (`my-new-game/cover.jpg`, 16:9 works best).
3. Open the landing page `index.html`, find `EDIT HERE`, and add an entry to `GAMES`.
4. Change your name in the same place (`MY_NAME`).

---

# Hero Clash

A 3D superhero fighting game that runs in your web browser.

## How to play
Open `hero-clash/index.html` in a browser (Chrome, Safari or Edge), or press PLAY on the website.

There are three ways to play:
- **VS Computer**: fight the computer (Easy, Normal or Hard).
- **2 Players**: two people on one keyboard (the controls are shown in the menu).
- **Online**: play a friend over the internet with a 4-letter code. This only works
  in the version on claude.ai, because it uses claude.ai to connect the two players.
- **Story**: fight the other 9 heroes one at a time (they get harder), then the giant
  monster MAGMAW. Your progress is saved so you can continue later.
- **Boss Fight**: pick a giant boss to fight:
  - **MAGMAW, the Volcano Titan**: a monster as tall as a building. Jump over his
    shockwaves, get out of the red circles before the lava lands, and stay away from his fire breath.
  - **TYRANNOX, the Storm Dragon**: a flying dragon. Hit him in the air with special moves,
    punch him when he lands, knock him out of the sky with an ultimate, and run out of the
    blue circles before lightning strikes.
  - **KING FLOE, the Seal Tyrant**: a giant spotted seal king with a crown and a royal cape who belly-flops, spits ice spears and slides at you.
    Once per fight, his **ICE DOMAIN: FEEDING FRENZY** fills the arena with ice and seals. Get into the gold circle before
    they bite, or they bite off 50% of your health! Beat him to watch a cutscene and **unlock KING FLOE as a playable fighter**
    (weaker than the boss), with Ice Spit and a smaller Ice Domain.

| Key | What it does |
|---|---|
| W A S D or arrows | Move |
| J or mouse click | Punch (press 3 times for a combo) |
| K | Special move |
| L | ULTIMATE (when the yellow bar is full) |
| Hold I | Block |
| Shift | Dash |
| Space | Jump |
| Esc | Pause |

On a phone or tablet, use the on-screen joystick and buttons.

## The maps
- **Hero City**: a downtown arena at sunset.
- **Tokyo**: neon signs, a red-and-white tower, lanterns and cherry blossoms at night.
- **Los Angeles**: a sunny beach with palm trees, the ocean and mountains.
- **Snowy Mountain**: falling snow, snowy pine trees, a cabin and a moving ski lift.
- **Christmas Village**: a giant decorated tree with twinkling lights, presents, candy canes, snowmen, cozy houses and a sleigh flying overhead.

In online games, the player who creates the game picks the map.

## The heroes
Every hero is a real human body. The bodies come from [MakeHuman](http://www.makehumancommunity.org),
whose base body, skeleton, body-shape targets and eyes are shared under the CC0 license (free for anyone
to use). Each hero has their own body type (strong, huge, athletic, slim) and face, and their suit, gloves,
belt, skin, lips, eyebrows and beard are painted right onto the body when the game starts. The bodies are
built ahead of time by `tools/human-build/build.js` into `hero-clash/assets/human.json`.

| Hero | Power | Special | Ultimate |
|---|---|---|---|
| **Volt** | Lightning | Lightning Dash | Thunder Quake |
| **Titan Max** | Super strength | Air Cannon | Titan Crash |
| **Flare** | Fire | Fireball | Supernova |
| **Glacia** | Ice (freezes rivals) | Ice Spear | Blizzard |
| **Thorn** | Plants | Vine Whip (pulls rivals in) | Thorn Garden |
| **Orbit** | Gravity | Gravity Pull | Meteor Fall |
| **Prism** | Light | Light Beam | Rainbow Burst |
| **Blink** | Teleporting | Shadow Step | Shadow Storm |
| **Boulder** | Rock | Rock Throw | Earthquake |
| **Riptide** | Water | Water Jet | Tidal Wave |

## Make it yours!
Open `hero-clash/index.html` and find `THE HEROES`. Change the numbers (`speed`, `power`, `hp`)
or the colors (like `suit:0x1fb5a8`) and reload the page to see what happens.

## Real photos and textures
The 360° photos behind each arena and the concrete floor come from [Poly Haven](https://polyhaven.com),
which shares them under the CC0 license (free for anyone to use). They are in the `assets` folder:
`sunset_jhbcentral` (Hero City), `shanghai_bund` (Tokyo), `spiaggia_di_mondello` (Los Angeles),
`snowy_hillside` (Snowy Mountain), `blaubeuren_church_square` (Christmas Village) and `concrete_floor_worn_001` (the arena curb).

Each arena floor is a real scanned surface that matches its place, with bumps, shadows in the cracks and
shiny or rough spots: `concrete_pavement` (Hero City rooftop), `large_grey_tiles` (Tokyo, made wet so it
reflects the lights), `coast_sand_01` (Los Angeles beach), `snow_02` (Snowy Mountain) and
`cobblestone_floor_08` (Christmas Village).

Tip: the photos only load when the game is opened from a web address (like the claude.ai link or GitHub Pages).
If you open `hero-clash/index.html` straight from your computer, the game uses its drawn backgrounds instead.
