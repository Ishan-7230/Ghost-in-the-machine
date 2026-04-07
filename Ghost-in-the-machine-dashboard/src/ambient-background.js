/* --- UV Displacement Texture Shader: Animates the static bg.png --- */
const canvas = document.getElementById('silk-canvas');
if (canvas) {
    const gl = canvas.getContext('webgl');

    if (!gl) {
        console.error('WebGL is not supported in your browser.');
    } else {
        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
        }
        window.addEventListener('resize', resize);
        resize();

        const vsSource = `
            attribute vec4 aVertexPosition;
            varying vec2 vUv;
            void main() {
                gl_Position = aVertexPosition;
                // Convert Vertex Clip Space (-1 to 1) into UV space (0 to 1) for the texture
                vUv = aVertexPosition.xy * 0.5 + 0.5;
                // Flip Y-axis to orient the texture properly
                vUv.y = 1.0 - vUv.y;
            }
        `;

        const fsSource = `
            precision highp float;
            uniform sampler2D u_texture;
            uniform float u_time;
            varying vec2 vUv;

            void main() {
                // Slow time modifier for luxurious, natural fabric flow
                float time = u_time * 0.6;
                
                // Complex, broad undulating math for flowing folds
                float waveX = sin(vUv.y * 2.5 + time * 0.8) * cos(vUv.x * 1.8 - time * 0.4) * 0.04;
                float waveY = cos(vUv.x * 2.2 - time * 0.7) * sin(vUv.y * 1.5 + time * 0.5) * 0.04;

                // Apply distortion mapping directly to the UV coordinates
                vec2 distortedUv = vUv + vec2(waveX, waveY);

                // Clamp edges to prevent texture bleeding/wrapping artifacts
                distortedUv = clamp(distortedUv, 0.02, 0.98);

                // Sample the original aesthetic background image through the distorted warp
                vec4 texColor = texture2D(u_texture, distortedUv);

                // Add extreme subtle micro-lighting to give depth to the ripples traversing the peaks
                float dynamicGlimmer = sin(vUv.x * 4.0 + time) * 0.025;

                gl_FragColor = vec4(texColor.rgb + dynamicGlimmer, 1.0);
            }
        `;

        function loadShader(gl, type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('Shader compilation error: ' + gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        }

        const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
        const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        gl.useProgram(shaderProgram);

        // Setup Full-Screen Quad Geometry
        const positions = new Float32Array([
            -1.0,  1.0,
             1.0,  1.0,
            -1.0, -1.0,
             1.0, -1.0,
        ]);
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        const vertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
        gl.enableVertexAttribArray(vertexPosition);
        gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 0, 0);

        // Setup Uniforms
        const timeUniformLocation = gl.getUniformLocation(shaderProgram, "u_time");
        const textureLocation = gl.getUniformLocation(shaderProgram, "u_texture");

        // Load the exact aesthetic image as a WebGL Texture
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        // Put a single pixel in the texture so it can be used immediately while loading
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([10, 10, 10, 255]));

        const image = new Image();
        image.src = '/bg.png';
        image.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        };

        // Start Render Loop
        function render(timeMs) {
            const time = timeMs * 0.001; 

            // Bind texture unit 0
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.uniform1i(textureLocation, 0);

            // Update uniform time
            gl.uniform1f(timeUniformLocation, time);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            requestAnimationFrame(render);
        }

        requestAnimationFrame(render);
    }
}
