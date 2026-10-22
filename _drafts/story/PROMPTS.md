# Station Zero — opening-still prompts

Each situation report opens on one of these pictures. It holds at full brightness for about
2.5 s, then dims, and the green story text types over it. Make each one 16:9 (1920×1080 or
similar), save it here in `_drafts/story/` under the file name given, then run the command
under it from the repo root.

## Style (paste at the start of every prompt)

> Cinematic photoreal film still, 16:9, wide shot. Dark, worn industrial sci-fi space station
> interior in the style of 1979 *Alien* and *Dead Space*: grimy grey metal panels, exposed pipes
> and cable bundles, grated floors, frost and cold haze. Cold teal-blue light with small red and
> amber warning lights. Film grain, shallow depth of field. No people unless the prompt says so.
> No blood or gore, and no creature or monster in view. Full-bleed image filling the whole
> frame: no black bars, borders, letterboxing or frames. Keep the main subject in the upper
> part of the frame, and let the floor area fall naturally into shadow. No words except the
> ones the prompt asks for.

The rules from the story still apply: the alien is never shown, only what sensors pick up
(blips, heat, frost, shadows). Nothing graphic.

---

## Chapter 1 — Wake Up (`Y9/Python/L1_Python_Refresh/1_Wake_Up_PRIMM.html`)

Intro (`station`), P (`cryo`) and M2 (`hale`) already have pictures.

### R — "Check-in accepted" → `wu_r_door_panel.jpg`
> Inside the Cryo Bay, looking at its heavy sealed sliding bulkhead door, stencilled CRYO BAY.
> The keypad panel beside the door glows half green and half red, as if it flickered between
> the two. Above the door, a ceiling vent grille has had the frost knocked off it, with a faint
> dark blur behind the slats as if something just moved away. Frost dust drifting down.

`python _drafts/story/add_still.py Y9/Python/L1_Python_Refresh/1_Wake_Up_PRIMM.html doorPanel _drafts/story/wu_r_door_panel.jpg`

### I1 — "The voice" → `wu_i1_intercom.jpg`
> Close-up of a battered wall intercom panel beside a frosted door: a round speaker grille, one
> large square TALK button, and a small amber call light glowing. A tiny cracked green display
> reads "CALL: DUCT 3". Breath-like mist in the cold air, frost on the metal, the rest of the
> room in darkness.

`python _drafts/story/add_still.py Y9/Python/L1_Python_Refresh/1_Wake_Up_PRIMM.html intercom _drafts/story/wu_i1_intercom.jpg`

### I — "Pod 2's record" → `wu_i_pod2_log.jpg`
> Close-up of an open, empty cryo pod marked C2, its glass door cracked outward from the inside,
> shards on the floor. A small screen on the pod frame glows green with lines of a text log. On
> a second small screen beside it, a heart monitor shows a flat line. Frost round the edges,
> one red warning light above.

`python _drafts/story/add_still.py Y9/Python/L1_Python_Refresh/1_Wake_Up_PRIMM.html pod2 _drafts/story/wu_i_pod2_log.jpg`

### M1 (door opened) — "Something got in" → `wu_m1_open_door.jpg`
> From inside the Cryo Bay, looking out through a wide-open bulkhead door into an empty, dim
> corridor. In the foreground on the right, the glass of a cryo pod with fresh frost spreading
> across it in fern-like patterns. Faint wet marks on the floor lead in past the camera.
> Nobody in sight.

`python _drafts/story/add_still.py Y9/Python/L1_Python_Refresh/1_Wake_Up_PRIMM.html openDoor _drafts/story/wu_m1_open_door.jpg`

### M1 (door kept sealed) — "Footsteps" → `wu_m1_sealed_door.jpg`
> Inside view of a heavy sealed bulkhead door, its panel glowing red with the word LOCKED. A thin
> line of corridor light shines under the door, broken by two dark shadows, as if someone is
> standing just outside. Frost on the inside of the door, the room dark.

`python _drafts/story/add_still.py Y9/Python/L1_Python_Refresh/1_Wake_Up_PRIMM.html sealedDoor _drafts/story/wu_m1_sealed_door.jpg`

---

## Chapter 1, part 2 — Life Support (`Y9/Python/L1_Python_Refresh/2_Life_Support_PRIMM.html`)

Intro (`trail`) already has a picture.

### P — "Something in the vents" → `ls_p_vent.jpg`
> The Life Support plant room: tall, silent oxygen recycler machines along the walls. In the
> middle of the grated floor, a dented square vent cover lies where it fell, under an open,
> pitch-black ceiling vent. A little frost dust still falling from the vent. Nothing visible
> inside it.

`python _drafts/story/add_still.py Y9/Python/L1_Python_Refresh/2_Life_Support_PRIMM.html vent _drafts/story/ls_p_vent.jpg`

### R — "Air" → `ls_r_recyclers.jpg`
> A bank of three large oxygen recycler turbines spinning up behind protective grilles, their
> blades motion-blurred, status lights changing from red to amber. A round analogue gauge
> reads "O2 34%". Mist being pulled into the intakes, and a faint warmer light coming on in the
> room.

`python _drafts/story/add_still.py Y9/Python/L1_Python_Refresh/2_Life_Support_PRIMM.html recyclers _drafts/story/ls_r_recyclers.jpg`

### I — "Running on reserve" → `ls_i_reserve_tanks.jpg`
> A row of tall reserve oxygen tanks with analogue pressure gauges, every needle almost at empty
> in the red zone. Beside them a wall terminal scrolls green system logs. A junction box nearby
> has scorch marks from storm damage. Cold, dim light.

`python _drafts/story/add_still.py Y9/Python/L1_Python_Refresh/2_Life_Support_PRIMM.html reserve _drafts/story/ls_i_reserve_tanks.jpg`

### M1 — "Lights out" → `ls_m1_lights_out.jpg`
> A long, gently curving station corridor seen from one end. The ceiling light panels are going
> out one by one from the far end towards the camera: the far half is already pitch black, and
> only the nearest few panels are still lit. At the very end, a door marked CRYO BAY is just
> visible in the dark.

`python _drafts/story/add_still.py Y9/Python/L1_Python_Refresh/2_Life_Support_PRIMM.html lightsOut _drafts/story/ls_m1_lights_out.jpg`

### M2 — "Life support online" → `ls_m2_tracker.jpg`
> A chunky handheld motion tracker lying on a metal console, its round green screen showing a
> sweep line and a single bright blip near the edge, with the small label SENSOR OPS. Behind
> it, out of focus, the oxygen recyclers now running with steady blue-green lights.

`python _drafts/story/add_still.py Y9/Python/L1_Python_Refresh/2_Life_Support_PRIMM.html tracker _drafts/story/ls_m2_tracker.jpg`

---

## Chapter 2 — Proximity (`Y9/Python/L2_Selection/1_Proximity_PRIMM.html`)

M1 (the sealed door, `cryoDoor` / `opsDoor`) and M2 (`hale`) already have pictures.

### Intro — "Chapter 2 — Proximity" → `px_intro_sensor_ops.jpg`
> Sensor Ops, empty: banks of dark sensor consoles and dead screens, a chair pushed back as if
> someone left in a hurry. Frost streaks across the floor. Directly above the main console, a
> vent cover hangs open on one hinge, black inside.

`python _drafts/story/add_still.py Y9/Python/L2_Selection/1_Proximity_PRIMM.html sensorOps _drafts/story/px_intro_sensor_ops.jpg`

### P — "Watched" → `px_p_warden.jpg`
> A dead wall screen in a dark control room flickering on through static. Filling the screen,
> a single glowing red camera eye (the station's AI, WARDEN), like a lens with a red iris. Its
> red light reflects on the dark consoles below.

`python _drafts/story/add_still.py Y9/Python/L2_Selection/1_Proximity_PRIMM.html warden _drafts/story/px_p_warden.jpg`

### R — "Range" → `px_r_array.jpg`
> A round green proximity radar display set into a console, with a sweep line and concentric
> range rings labelled in metres. The centre is empty. One small, bright
> blip sits frozen at the very outer edge. Frost on the console round the screen.

`python _drafts/story/add_still.py Y9/Python/L2_Selection/1_Proximity_PRIMM.html array _drafts/story/px_r_array.jpg`

### I1 — "Two pods" → `px_i1_heaters.jpg`
> Two cryo pods side by side in the Cryo Bay. The left one is bathed in orange heater glow, its
> frost melting and dripping. The right one is dark and icing over, frost creeping across its
> glass, with a small red status light. Sleeping figures barely visible behind the frosted
> glass. No pod numbers visible.

`python _drafts/story/add_still.py Y9/Python/L2_Selection/1_Proximity_PRIMM.html heaters _drafts/story/px_i1_heaters.jpg`

### I — "Calibrated" → `px_i_thermal.jpg`
> A thermal sensor camera view in false colour (mostly deep blues and purples) of a curved
> station corridor outside a door marked LIFE SUPPORT. Partway along it, one faint, person-height
> smear that is colder than the walls, mid-stride, with no detail visible. Thin green HUD
> overlay lines and a small range readout in the corner.

`python _drafts/story/add_still.py Y9/Python/L2_Selection/1_Proximity_PRIMM.html thermal _drafts/story/px_i_thermal.jpg`

---

## Chapter 3 — Locked In (`Y9/Python/L3_While_Loops/1_Locked_In_PRIMM.html`)

No pictures yet: every `CAMS` entry has `src: ''`.

### Intro — "Chapter 3 — Locked In" → `li_intro_airlock.jpg`
> The inner door of a heavy station airlock, sealed shut, with a red warning light glowing above
> it and a small keypad beside it whose screen reads LOCKED. Frost round the door seals. A
> corridor curves away into darkness behind the camera.

`python _drafts/story/add_still.py Y9/Python/L3_While_Loops/1_Locked_In_PRIMM.html airlock _drafts/story/li_intro_airlock.jpg`

### P — "Watched" → `li_p_keypad.jpg`
> Close-up of a frosted airlock keypad, its small green screen glowing. Above it, set into the
> wall, a single glowing red camera eye (the station's AI, WARDEN), its red light falling across
> the keys.

`python _drafts/story/add_still.py Y9/Python/L3_While_Loops/1_Locked_In_PRIMM.html keypad _drafts/story/li_p_keypad.jpg`

### R — "Cycling" → `li_r_cycle.jpg`
> Inside an empty airlock chamber: amber cycle lights turning on the walls, and a haze of air
> draining down through the floor grates. Both doors shut.

`python _drafts/story/add_still.py Y9/Python/L3_While_Loops/1_Locked_In_PRIMM.html cycle _drafts/story/li_r_cycle.jpg`

### I1 — "One power line" → `li_i1_powerline.jpg`
> A wall power junction in a dim corridor, with two heavy cables leaving it, one stencilled
> AIRLOCK and one stencilled CRYO BAY. Faint sparks at the junction box.

`python _drafts/story/add_still.py Y9/Python/L3_While_Loops/1_Locked_In_PRIMM.html powerline _drafts/story/li_i1_powerline.jpg`

### I — "Two ways through" → `li_i_override.jpg`
> The airlock keypad's screen, close up, showing two options in green text: WARDEN CODE and
> ENGINEER OVERRIDE. A gloved finger hovers just above the keys.

`python _drafts/story/add_still.py Y9/Python/L3_While_Loops/1_Locked_In_PRIMM.html override _drafts/story/li_i_override.jpg`

### M1 — "Something at the door" → `li_m1_outer_door.jpg`
> The outer airlock door seen from inside the chamber, dented outwards in two places by heavy
> blows from the other side, frost spreading from its edges. A red warning light. Nothing
> visible through the small window but darkness.

`python _drafts/story/add_still.py Y9/Python/L3_While_Loops/1_Locked_In_PRIMM.html outerDoor _drafts/story/li_m1_outer_door.jpg`

### M2 — "Let me in" → `li_m2_intercom.jpg`
> A wall intercom panel in the dark, its speaker grille lit from inside, and beside it a small
> screen reading VOICEPRINT: NO MATCH in red. Frost on the panel.

`python _drafts/story/add_still.py Y9/Python/L3_While_Loops/1_Locked_In_PRIMM.html intercom _drafts/story/li_m2_intercom.jpg`

---

## New chapters

Give every beat (intro, P, R, I1, I, M1, M2) its own picture: add a `CAMS` entry with its
label, alt and `src: ''`, set the beat's `cam`, write the prompt here, then run
`add_still.py`. A variant can use its own picture where its scene is very different (like
Wake Up's open and sealed door).
