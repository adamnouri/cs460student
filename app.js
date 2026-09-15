import { Mat4 } from './matrix.js';

// --- WebGL Shaders (WebGL 1 & 2 Dual Compatible) ---
const vertexShaderSource = `
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute vec3 aColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform mat4 uNormalMatrix;

    varying vec3 vColor;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
        vec4 pos = uModelViewMatrix * vec4(aPosition, 1.0);
        vPosition = pos.xyz;
        vNormal = normalize((uNormalMatrix * vec4(aNormal, 0.0)).xyz);
        vColor = aColor;
        gl_Position = uProjectionMatrix * pos;
    }
`;

const fragmentShaderSource = `
    precision mediump float;

    varying vec3 vColor;
    varying vec3 vNormal;
    varying vec3 vPosition;

    uniform int uRenderMode; // 0 = Color, 1 = Shaded (Lit), 2 = Wireframe

    void main() {
        if (uRenderMode == 2) {
            // Wireframe Accent Glow
            gl_FragColor = vec4(0.22, 0.74, 0.97, 1.0);
            return;
        }

        if (uRenderMode == 0) {
            // Unlit Color Mode
            gl_FragColor = vec4(vColor, 1.0);
            return;
        }

        // Shaded / Lit Mode with Diffuse + Ambient + Specular
        vec3 normal = normalize(vNormal);
        vec3 lightDir = normalize(vec3(0.6, 0.9, 0.7));
        vec3 viewDir = normalize(-vPosition);
        vec3 halfDir = normalize(lightDir + viewDir);

        // Ambient component
        vec3 ambient = vec3(0.25, 0.28, 0.35) * vColor;

        // Diffuse Lambertian
        float diff = max(dot(normal, lightDir), 0.0);
        vec3 diffuse = diff * vColor * 0.85;

        // Specular Blinn-Phong
        float spec = 0.0;
        if (diff > 0.0) {
            spec = pow(max(dot(normal, halfDir), 0.0), 32.0);
        }
        vec3 specular = vec3(1.0, 1.0, 1.0) * spec * 0.4;

        vec3 finalColor = ambient + diffuse + specular;
        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

// --- Cube Mesh Geometry (24 Vertices, 6 Distinct Faces) ---
function createCubeData() {
    // 6 Faces: Front (+Z), Back (-Z), Top (+Y), Bottom (-Y), Right (+X), Left (-X)
    const positions = [
        // Front
        -1.0, -1.0,  1.0,   1.0, -1.0,  1.0,   1.0,  1.0,  1.0,  -1.0,  1.0,  1.0,
        // Back
        -1.0, -1.0, -1.0,  -1.0,  1.0, -1.0,   1.0,  1.0, -1.0,   1.0, -1.0, -1.0,
        // Top
        -1.0,  1.0, -1.0,  -1.0,  1.0,  1.0,   1.0,  1.0,  1.0,   1.0,  1.0, -1.0,
        // Bottom
        -1.0, -1.0, -1.0,   1.0, -1.0, -1.0,   1.0, -1.0,  1.0,  -1.0, -1.0,  1.0,
        // Right
         1.0, -1.0, -1.0,   1.0,  1.0, -1.0,   1.0,  1.0,  1.0,   1.0, -1.0,  1.0,
        // Left
        -1.0, -1.0, -1.0,  -1.0, -1.0,  1.0,  -1.0,  1.0,  1.0,  -1.0,  1.0, -1.0,
    ];

    const normals = [
        // Front
         0.0,  0.0,  1.0,   0.0,  0.0,  1.0,   0.0,  0.0,  1.0,   0.0,  0.0,  1.0,
        // Back
         0.0,  0.0, -1.0,   0.0,  0.0, -1.0,   0.0,  0.0, -1.0,   0.0,  0.0, -1.0,
        // Top
         0.0,  1.0,  0.0,   0.0,  1.0,  0.0,   0.0,  1.0,  0.0,   0.0,  1.0,  0.0,
        // Bottom
         0.0, -1.0,  0.0,   0.0, -1.0,  0.0,   0.0, -1.0,  0.0,   0.0, -1.0,  0.0,
        // Right
         1.0,  0.0,  0.0,   1.0,  0.0,  0.0,   1.0,  0.0,  0.0,   1.0,  0.0,  0.0,
        // Left
        -1.0,  0.0,  0.0,  -1.0,  0.0,  0.0,  -1.0,  0.0,  0.0,  -1.0,  0.0,  0.0,
    ];

    // Harmonious modern color palette for the 6 faces
    const faceColors = [
        [0.22, 0.74, 0.97], // Front: Vibrant Cyan
        [0.96, 0.44, 0.44], // Back: Coral Red
        [0.98, 0.78, 0.22], // Top: Amber Gold
        [0.39, 0.53, 0.96], // Bottom: Indigo Blue
        [0.20, 0.83, 0.60], // Right: Emerald Green
        [0.75, 0.45, 0.97]  // Left: Purple Orchid
    ];

    let colors = [];
    for (let c of faceColors) {
        for (let i = 0; i < 4; i++) {
            colors.push(...c);
        }
    }

    // Indices for solid rendering (triangles)
    const indices = [
         0,  1,  2,      0,  2,  3,    // Front
         4,  5,  6,      4,  6,  7,    // Back
         8,  9, 10,      8, 10, 11,    // Top
        12, 13, 14,     12, 14, 15,    // Bottom
        16, 17, 18,     16, 18, 19,    // Right
        20, 21, 22,     20, 22, 23     // Left
    ];

    // Indices for clean wireframe rendering (edges)
    const wireframeIndices = [
        0, 1, 1, 2, 2, 3, 3, 0, // Front square
        4, 5, 5, 6, 6, 7, 7, 4, // Back square
        0, 7, 1, 6, 2, 5, 3, 4  // Connecting edges
    ];

    return {
        positions: new Float32Array(positions),
        normals: new Float32Array(normals),
        colors: new Float32Array(colors),
        indices: new Uint16Array(indices),
        wireframeIndices: new Uint16Array(wireframeIndices)
    };
}

// --- Shader Compilation Helper ---
function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(`Shader compilation failure: ${error}`);
    }
    return shader;
}

function createProgram(gl, vertexSrc, fragmentSrc) {
    const vs = createShader(gl, gl.VERTEX_SHADER, vertexSrc);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentSrc);
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const error = gl.getProgramInfoLog(program);
        gl.deleteProgram(program);
        throw new Error(`Program link failure: ${error}`);
    }
    return program;
}

// --- Main Application ---
class HelloCubeApp {
    constructor() {
        this.canvas = document.getElementById('glcanvas');
        this.container = document.getElementById('canvas-container');
        this.gl = this.canvas.getContext('webgl2') || this.canvas.getContext('webgl');

        if (!this.gl) {
            alert('WebGL is not supported on your browser or device.');
            return;
        }

        // App state
        this.renderMode = 0; // 0: Color, 1: Shaded, 2: Wireframe
        this.isAutoRotating = true;
        this.rotationSpeed = 1.0;
        this.rotX = 0.45;
        this.rotY = 0.65;
        this.cameraDist = 5.2;

        // Pointer drag interaction
        this.isDragging = false;
        this.lastPointerX = 0;
        this.lastPointerY = 0;
        this.dragVelocityX = 0;
        this.dragVelocityY = 0;

        // Matrices
        this.modelMatrix = Mat4.create();
        this.viewMatrix = Mat4.create();
        this.projMatrix = Mat4.create();
        this.modelViewMatrix = Mat4.create();
        this.mvpMatrix = Mat4.create();
        this.normalMatrix = Mat4.create();

        // FPS tracking
        this.frameCount = 0;
        this.lastFpsUpdate = performance.now();
        this.fpsElement = document.getElementById('fps-val');
        this.matrixCells = document.querySelectorAll('.matrix-cell');

        this.initWebGL();
        this.initEvents();
        this.renderLoop = this.renderLoop.bind(this);
        requestAnimationFrame(this.renderLoop);
    }

    initWebGL() {
        const gl = this.gl;
        this.program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
        gl.useProgram(this.program);

        // Uniform locations
        this.uModelViewLoc = gl.getUniformLocation(this.program, 'uModelViewMatrix');
        this.uProjLoc = gl.getUniformLocation(this.program, 'uProjectionMatrix');
        this.uNormalLoc = gl.getUniformLocation(this.program, 'uNormalMatrix');
        this.uRenderModeLoc = gl.getUniformLocation(this.program, 'uRenderMode');

        // Attribute locations
        this.aPosLoc = gl.getAttribLocation(this.program, 'aPosition');
        this.aNormLoc = gl.getAttribLocation(this.program, 'aNormal');
        this.aColLoc = gl.getAttribLocation(this.program, 'aColor');

        const cubeData = createCubeData();

        // Positions buffer
        this.posBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, cubeData.positions, gl.STATIC_DRAW);

        // Normals buffer
        this.normBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, cubeData.normals, gl.STATIC_DRAW);

        // Colors buffer
        this.colBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, cubeData.colors, gl.STATIC_DRAW);

        // Triangle Indices buffer
        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cubeData.indices, gl.STATIC_DRAW);

        // Wireframe Indices buffer
        this.wireframeIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.wireframeIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cubeData.wireframeIndices, gl.STATIC_DRAW);

        this.indexCount = cubeData.indices.length;
        this.wireframeIndexCount = cubeData.wireframeIndices.length;

        // OpenGL settings
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clearColor(0.04, 0.05, 0.08, 1.0);
    }

    initEvents() {
        // Resize handling
        window.addEventListener('resize', () => this.handleResize());
        this.handleResize();

        // Pointer controls on canvas container
        this.container.addEventListener('pointerdown', (e) => {
            this.isDragging = true;
            this.lastPointerX = e.clientX;
            this.lastPointerY = e.clientY;
            this.dragVelocityX = 0;
            this.dragVelocityY = 0;
            this.container.setPointerCapture(e.pointerId);

            const hint = document.getElementById('interaction-hint');
            if (hint) hint.style.opacity = '0';
        });

        this.container.addEventListener('pointermove', (e) => {
            if (!this.isDragging) return;
            const deltaX = e.clientX - this.lastPointerX;
            const deltaY = e.clientY - this.lastPointerY;

            this.dragVelocityX = deltaX * 0.008;
            this.dragVelocityY = deltaY * 0.008;

            this.rotY += this.dragVelocityX;
            this.rotX += this.dragVelocityY;

            // Clamp vertical rotation
            this.rotX = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, this.rotX));

            this.lastPointerX = e.clientX;
            this.lastPointerY = e.clientY;
        });

        const stopDrag = (e) => {
            if (this.isDragging) {
                this.isDragging = false;
                try {
                    this.container.releasePointerCapture(e.pointerId);
                } catch (err) {}
            }
        };

        this.container.addEventListener('pointerup', stopDrag);
        this.container.addEventListener('pointercancel', stopDrag);

        // Zoom via scroll wheel
        this.container.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.cameraDist += e.deltaY * 0.004;
            this.cameraDist = Math.max(2.5, Math.min(12.0, this.cameraDist));
        }, { passive: false });

        // Mode Pill Buttons
        const pillButtons = document.querySelectorAll('.pill-btn');
        pillButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                pillButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderMode = parseInt(btn.getAttribute('data-mode'), 10);
            });
        });

        // Auto-spin toggle
        const autoSpinBtn = document.getElementById('btn-spin');
        autoSpinBtn.addEventListener('click', () => {
            this.isAutoRotating = !this.isAutoRotating;
            autoSpinBtn.classList.toggle('active', this.isAutoRotating);
        });

        // Speed Slider
        const speedSlider = document.getElementById('speed-slider');
        speedSlider.addEventListener('input', (e) => {
            this.rotationSpeed = parseFloat(e.target.value);
        });

        // Reset View
        const resetBtn = document.getElementById('btn-reset');
        resetBtn.addEventListener('click', () => {
            this.rotX = 0.45;
            this.rotY = 0.65;
            this.cameraDist = 5.2;
            this.dragVelocityX = 0;
            this.dragVelocityY = 0;
        });

        // Inspector Modal Toggle
        const inspectorToggle = document.getElementById('btn-inspector');
        const inspectorModal = document.getElementById('inspector-modal');
        const closeInspector = document.getElementById('close-inspector');

        inspectorToggle.addEventListener('click', () => {
            inspectorModal.classList.toggle('open');
        });

        closeInspector.addEventListener('click', () => {
            inspectorModal.classList.remove('open');
        });
    }

    handleResize() {
        const dpr = window.devicePixelRatio || 1;
        const displayWidth = Math.round(this.canvas.clientWidth * dpr);
        const displayHeight = Math.round(this.canvas.clientHeight * dpr);

        if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
            this.canvas.width = displayWidth;
            this.canvas.height = displayHeight;
        }

        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    updateMatrices() {
        const aspect = this.canvas.width / this.canvas.height;
        Mat4.perspective(this.projMatrix, (45 * Math.PI) / 180, aspect, 0.1, 100.0);

        // Eye position from spherical angles
        const eyeX = this.cameraDist * Math.sin(this.rotY) * Math.cos(this.rotX);
        const eyeY = this.cameraDist * Math.sin(this.rotX);
        const eyeZ = this.cameraDist * Math.cos(this.rotY) * Math.cos(this.rotX);

        Mat4.lookAt(this.viewMatrix, [eyeX, eyeY, eyeZ], [0, 0, 0], [0, 1, 0]);

        // Model matrix remains identity since we rotate the camera viewpoint
        Mat4.identity(this.modelMatrix);

        // Combined ModelView
        Mat4.multiply(this.modelViewMatrix, this.viewMatrix, this.modelMatrix);

        // Model-View-Projection (MVP) matrix
        Mat4.multiply(this.mvpMatrix, this.projMatrix, this.modelViewMatrix);

        // Normal matrix (for lighting normals)
        for (let i = 0; i < 16; i++) {
            this.normalMatrix[i] = this.modelViewMatrix[i];
        }
    }

    renderLoop(now) {
        // Frame rate calculation
        this.frameCount++;
        if (now - this.lastFpsUpdate >= 500) {
            const currentFps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
            if (this.fpsElement) this.fpsElement.textContent = `${currentFps} FPS`;
            this.frameCount = 0;
            this.lastFpsUpdate = now;
        }

        // Inertial damping or auto rotation
        if (this.isAutoRotating && !this.isDragging) {
            this.rotY += 0.01 * this.rotationSpeed;
        } else if (!this.isDragging) {
            // Smooth inertia decay
            this.rotY += this.dragVelocityX;
            this.rotX += this.dragVelocityY;
            this.dragVelocityX *= 0.92;
            this.dragVelocityY *= 0.92;
            this.rotX = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, this.rotX));
        }

        this.updateMatrices();

        // Update Matrix Inspector UI
        if (this.matrixCells && this.matrixCells.length === 16) {
            for (let i = 0; i < 16; i++) {
                this.matrixCells[i].textContent = this.mvpMatrix[i].toFixed(2);
            }
        }

        const gl = this.gl;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(this.program);

        // Upload Uniforms
        gl.uniformMatrix4fv(this.uProjLoc, false, this.projMatrix);
        gl.uniformMatrix4fv(this.uModelViewLoc, false, this.modelViewMatrix);
        gl.uniformMatrix4fv(this.uNormalLoc, false, this.normalMatrix);
        gl.uniform1i(this.uRenderModeLoc, this.renderMode);

        // Bind Vertex Attributes
        gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
        gl.vertexAttribPointer(this.aPosLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.aPosLoc);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normBuffer);
        gl.vertexAttribPointer(this.aNormLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.aNormLoc);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.colBuffer);
        gl.vertexAttribPointer(this.aColLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.aColLoc);

        // Draw Call
        if (this.renderMode === 2) {
            // Wireframe Lines
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.wireframeIndexBuffer);
            gl.lineWidth(2.0);
            gl.drawElements(gl.LINES, this.wireframeIndexCount, gl.UNSIGNED_SHORT, 0);
        } else {
            // Solid Triangles
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
        }

        requestAnimationFrame(this.renderLoop);
    }
}

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
    new HelloCubeApp();
});
