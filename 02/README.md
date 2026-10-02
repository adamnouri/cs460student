# CS460 Assignment 2: Agentic Engineering & Interactive 3D Cube Art (XTK)

**Student:** Adam Nouri  
**Repository:** [https://github.com/adamnouri/cs460student](https://github.com/adamnouri/cs460student)  
**Pull Request:** [https://github.com/bostongfx/cs460student/pulls](https://github.com/bostongfx/cs460student/pulls)  
**Live GitHub Pages Deployments:**
- **Assignment 2 Citadel (`index.html`):** [https://adamnouri.github.io/cs460student/02/](https://adamnouri.github.io/cs460student/02/)
- **Assignment 2 Agent Prototype (`agent.html`):** [https://adamnouri.github.io/cs460student/02/agent.html](https://adamnouri.github.io/cs460student/02/agent.html)
- **Assignment 1:** [https://adamnouri.github.io/cs460student/01/](https://adamnouri.github.io/cs460student/01/)

---

## 1. Step 1: Initial AGY Exploration (`agent.html`)

### AGY Execution Command:
```bash
agy --sandbox --dangerously-skip-permissions
```

### Generic Prompt:
> *"Hi I want to work with the XTK webgl framework. Can you create a cool cube art visualziation with animations, changing colors, flying cubes and more?"*

### Results & Features in `agent.html`:
- **Core 3D Matrix:** A 6×6×6 lattice (216 cubes) plus 24 orbiting satellite cubes (240 total cubes).
- **Kinetic Modes:** Lattice Wave (pulsing dynamic wave), Cosmic Orbit (planetary rings), Double Helix (intertwined spiral strands), and Quantum Swarm (stochastic flying cubes).
- **Color Palettes:** Cyberpunk Neon, Sunset Ember, Glacier Frost, and Emerald Matrix with real-time hue cycling.
- **Physics Dynamics:** Interactive **Scatter / Flying Burst** mode that thrusts cubes outwards along randomized 3D velocity vectors and reassembles them smoothly.
- **Controls & HUD:** Live FPS counter, active cube telemetry, speed and spread sliders, camera orbit toggle, and keyboard navigation (`Space`, `P`, `R`, `1-4`).

---

## 2. Step 2: Hand-Drawn Concept Design (`sketch.png`)

Before jumping into advanced prompting, a detailed isometric architectural concept was sketched on graph paper:

- **Concept Name:** **HyperCube Citadel**
- **Design Structure:**
  - **Tier 0 Foundation Base:** An 8×8 perimeter podium with courtyard recesses and corner bastions.
  - **Tier 1 Mezzanine:** A 6×6 elevated platform creating stepped terraces.
  - **Tier 2 Upper Sanctum:** A 4×4 platform flanked by 4 nested data core cube clusters.
  - **Central Spire:** A tapering obelisk tower composed of stacked cubes ascending to an apex crown (H=240).
  - **Orbital Satellite Rings:** Dual rings of flying data-node cubes orbiting around the citadel at varying radii (R=105, R=155) and inclinations.

The sketch includes technical notes on coordinate transforms (`transform.matrix`), elevation-based color gradient waves, and exploded view separation vectors.

---

## 3. Step 3 & 4: Prompting AGY & Quality Verification (`index.html`)

### AGY Prompt for `index.html`:
> *"Create an interactive 3D WebGL architectural visualization called 'HyperCube Citadel' using XTK based on the hand-drawn engineering paper sketch. Implement a stepped citadel architecture with an 8x8 base foundation, 6x6 mezzanine terrace, 4x4 upper sanctum, nested floating data cores, and a central spire ascending to H=240, surrounded by dual orbiting satellite rings. Add four architectural motion states (Monumental, Harmonic Wave, Vortex Helix, Zero-G Orbit), camera vantage presets (Isometric, Spire Close-up, Ground Horizon, Apex Top), dynamic chromatic shaders (Cyberpunk, Emerald, Solar Core, Amethyst), smooth deconstruction/explosion physics along outward tier vectors, interactive Web Audio API procedural sound synthesis, and an interactive in-canvas modal previewing the original hand-drawn sketch."*

### Key Technical Achievements in `index.html`:
- **316 Total Cubes:** Optimized batching in WebGL using XTK's `transform.matrix` and `transform.modified()`.
- **Zero Memory Leaks:** Explicit matrix composition prevents cumulative floating-point rotation drift.
- **Dual Orbit Mechanics:** Distinct orbital radii and opposing tilt angles for outer satellite cube swarms.
- **Deconstruct Citadel Mode:** Linear interpolation easing (`dt * 3.5`) moves every architectural tier and core along its calculated directional vector.
- **Web Audio FX:** Pure client-side procedural sound generation (sawtooth, sine, and triangle wave frequency ramps) synchronized with explosion and UI state switches.
- **Embedded Paper Sketch Viewer:** Click *"View Paper Sketch"* in the top HUD to view the original pencil concept drawing directly inside the 3D application.

---

## 4. Bonus Analysis: Deep Dive into `loader.js` (33 Points)

### What does `loader.js` do?
`loader.js` is a lightweight persistence utility for XTK 3D scenes consisting of two primary functions:

1. **`download()`**:
   - Inspects the active XTK scene by iterating over `r.Ha` (XTK's internal array of scene objects).
   - Filters for visible elements and extracts vital geometric properties:
     - Object type (`r.Ha[i].g`: `'cube'`, `'sphere'`, etc.)
     - Base color (`r.Ha[i].color`: RGB array)
     - 4×4 World Transformation Matrix (`r.Ha[i].transform.matrix`)
     - Dimensions (`lengthX`, `lengthY`, `lengthZ` for cubes, `radius` for spheres)
   - Packages all object records along with the camera view matrix (`r.camera.view` / `CAMERAS`) into a single JSON object.
   - Generates a data URI (`data:text/json;charset=utf-8,...`) and automatically triggers the download of `scene.json` in the user's browser.

2. **`upload(scene)`**:
   - Hides all existing objects currently registered in `r.Ha`.
   - Sends an asynchronous `XMLHttpRequest` (AJAX GET) to fetch the target `scene.json` file.
   - Iterates through the deserialized `objects` array, reinstantiates the corresponding `X.cube()` or `X.sphere()` instances, restores their exact transformation matrix (`new Float32Array(Object.values(matrix))`), dimensions, and colors, and re-adds them to the renderer `r`.
   - Restores the camera's original view matrix to match the saved perspective.

### Is `loader.js` still useful here?
- **In Previous Assignments:** Students manually placed, translated, scaled, and configured individual cubes and spheres through direct user input. Persisting scene state across browser reloads required static serialization via `loader.js`.
- **In Assignment 2 (Agentic / Generative XTK):**
  - **Limitations for Dynamic Scenes:** In modern agentic visualizations like `agent.html` and `index.html`, cube positions, orientations, and colors are procedurally recomputed on every frame (`r.onRender`) via mathematical functions (sine wave propagation, orbital mechanics, matrix rotations, color drift). Saving a static JSON snapshot via `loader.js` only records the geometry of a single frozen moment in time—it does **not** persist the underlying JavaScript animation loops, state machines, or audio triggers.
  - **Continued Usefulness:** Despite this limitation, `loader.js` remains valuable as:
    1. **Initial Layout Importer:** Loading complex base configurations or static CAD-like cube blueprints from which dynamic animations begin.
    2. **State Snapshot Exporter:** Allowing users to freeze and export their favorite generative arrangements or exploded configurations into reusable 3D assets (`scene.json`) that can be loaded into other XTK tools or offline pipelines.
