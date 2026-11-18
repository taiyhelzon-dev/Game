# Building the human bodies

`build.js` turns the MakeHuman base mesh (CC0) into `hero-clash/assets/human.json`:
it shapes a body for every hero, bakes arms-down and clenched fists, maps the
MakeHuman skeleton weights onto the game's 15 joints and fits the eyes.

It needs these MakeHuman files (from github.com/makehumancommunity/makehuman, folder `makehuman/data`)
in one folder:

- `base.obj` (from `3dobjs`)
- `rigs/default.mhskel` and `rigs/default_weights.mhw`
- `eyes/high-poly/high-poly.obj` and `high-poly.mhclo`
- the `.target` files used in `HEROES` at the top of `build.js`, in `targets/macrodetails`

Then run: `node build.js <that folder> ../../hero-clash/assets/human.json`
