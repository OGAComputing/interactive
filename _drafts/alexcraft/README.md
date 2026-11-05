# AlexCraft robot art

Game page: `_side/AlexCraft/index.html` (side project, not on the hub).

Three tiers, each from one Gemini image of the whole robot on white:

| Tier | Source | Look |
|------|--------|------|
| Wood | `wooden_robot_source.jpg` | light carved wood, brass bolts, green eyes/gem |
| Iron | `iron_robot_source.jpg` | old rusty cast iron, hex rivets, orange eyes/gem |
| Steel | `steel_robot_source.jpg` | shiny chrome, blue light strips, blue eyes/gem |

## Prompts

Wood:

> Generate an image. A cute chunky toy robot hand-carved from warm light wood, game asset style for a children's game, bright cheerful cartoon with soft shading. Full body, perfectly front-on and symmetrical, standing straight, centred, filling most of the frame from top to bottom. It is built from separate blocky wooden parts with clear white gaps between every part so nothing overlaps: a square head with two round glowing green eyes and a small smile, a thin wooden antenna on top of the head ending in a small round ball, a rectangular body with a round glowing green gem set in the middle of the chest, two arms hanging straight down beside the body with a clear gap between each arm and the body, and two short legs with chunky feet with a clear gap between the legs. Visible wood grain, small brass bolts at the joints. Plain pure white background, no floor, no shadow, no other objects. No text anywhere.

Iron and steel start with "Generate an image of exactly one robot, a single character on its own, not a sheet of views." (without it Gemini drew three robots), swap the material sentences, and use orange (iron) or electric-blue (steel) for the eyes and gem:

- Iron: "built from old cast iron … The iron looks old and industrial: dark gunmetal grey plates with patches of orange-brown rust, chunky hex rivets around the edges, scratched and weathered like an old steam engine."
- Steel: "built from brand-new polished steel … The steel is super shiny and cool: gleaming silver chrome plates with bright white highlights and little sparkle glints, smooth bevelled edges, sleek electric-blue light strips along the seams, like a futuristic hero robot."

## Cutting

`python chop_robot.py <repo>/_side/AlexCraft/robot [preview.png]` cuts all three into
`robot/<skin>/<part>.webp` (+ `head_off.webp`, eyes unlit; the body gets an empty dark socket)
and writes `robot/layout.json`. Copy its numbers into `LAYOUT` in the page.

The part regions, eye circles and gem circle for each image are hard-coded in `SKINS`. A new
image needs them re-measured. All tiers share the wooden robot's frame so parts can be mixed;
see the docstring for how iron/steel parts are scaled and pinned. The preview shows each tier
plus a mixed robot, which is the quickest check.
