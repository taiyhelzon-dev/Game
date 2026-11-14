# Hero Clash

A 3D superhero fighting game that runs in your web browser.

## How to play
Open `index.html` in a browser (Chrome, Safari or Edge).

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
  - **KING FLOE, the Seal Tyrant**: a giant seal king who belly-flops, spits ice spears and slides at you.
    His **ICE DOMAIN: FEEDING FRENZY** fills the arena with ice and seals. Get into the gold circle before
    they bite, or they bite off 75% of your health! Beat him to watch a cutscene and **unlock KING FLOE as a playable fighter**
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
Open `index.html` and find `THE HEROES`. Change the numbers (`speed`, `power`, `hp`)
or the colors (like `suit:0x1fb5a8`) and reload the page to see what happens.

## Real photos and textures
The 360° photos behind each arena and the concrete floor come from [Poly Haven](https://polyhaven.com),
which shares them under the CC0 license (free for anyone to use). They are in the `assets` folder:
`sunset_jhbcentral` (Hero City), `shanghai_bund` (Tokyo), `spiaggia_di_mondello` (Los Angeles),
`snowy_hillside` (Snowy Mountain), `blaubeuren_church_square` (Christmas Village) and `concrete_floor_worn_001` (arena floor).

Tip: the photos only load when the game is opened from a web address (like the claude.ai link or GitHub Pages).
If you open `index.html` straight from your computer, the game uses its drawn backgrounds instead.
