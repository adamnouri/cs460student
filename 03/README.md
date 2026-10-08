# Assignment 3 — Torus World

Run a static server from the repository root (`python3 -m http.server 8000`),
then open http://localhost:8000/03/. Internet access is needed for the pinned
Three.js 0.180.0 modules from unpkg.

- Shift + left mouse: place a new hotpink torus knot at the cursor.
- Keep holding the mouse and drag up/down to increase/decrease its signed scale.
- Negative scale changes the color to grassgreen; positive scale restores pink.
- Release the mouse to restore camera orbit controls.
- F toggles random opacity flickering; turning it off restores full opacity.
- W toggles wireframes for all existing and subsequently placed knots.
- Flower cluster replaces the scene with nine arranged knots. Clear starts fresh.
- Save PNG exports the current canvas (use once solid and once in wireframe).

## Part 1: geometry notes

Reference: https://threejs.org/docs/pages/TorusKnotGeometry.html

`TorusKnotGeometry(radius, tube, tubularSegments, radialSegments, p, q)`:

| Parameter | Meaning | This scene |
| --- | --- | --- |
| radius | Overall knot radius | 7 |
| tube | Tube radius | 2 |
| tubularSegments | Segments along the knot | 96 |
| radialSegments | Segments around the tube | 12 |
| p | Windings around the axis of rotational symmetry | 2 |
| q | Windings around an interior circle | 3 |

## Bonus: counts

With T = 96 and R = 12, the closed, triangulated surface of one knot has:

- V = T × R = 1,152 unique vertices after joining duplicate seam vertices.
- F = 2 × T × R = 2,304 triangular faces.
- E = 3 × F / 2 = 3,456 unique edges (each edge borders two triangles).
- V − E + F = 0, consistent with a genus-one surface.

Three.js stores (T + 1) × (R + 1) = 1,261 position entries per geometry,
including duplicate seam vertices for UV coordinates. This differs from the
welded surface count shown in the interface. Meshes share a geometry buffer,
but scene counts count each placed instance separately, even when overlapping.
At exactly zero scale, a mesh is collapsed; counts describe its underlying mesh.

The nine-knot Flower cluster has V = 10,368, E = 31,104, F = 20,736.

## Submission checklist

Choose your own final composition, save solid and wireframe screenshots,
and record the counts for that composition. Push your changes and verify
https://adamnouri.github.io/cs460student/03/ after GitHub Pages builds.
Then submit the course pull request and form at
https://cs460.org/assignments/03/ using your screenshot and URLs.
Publishing, a course pull request, and the submission form are not performed
by the local implementation.

Example screenshots of the nine-knot flower composition are included as
`torusworld.png` and `torusworld-wireframe.png`. These are a suggested composition,
not a recorded personal creative choice. Browser checks passed in Chrome for
placement, signed scaling and color flips, camera locking/restoration, orbit,
flicker, wireframes, composition counts, PNG download, clearing, and resizing.
