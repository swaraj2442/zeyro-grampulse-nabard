export default function fluidCursor() {
    const canvas = document.getElementById('fluid') as HTMLCanvasElement;
    if (!canvas) return;

    // Configuration for localized smoke reveal effect
    const config = {
        SIM_RESOLUTION: 128,
        DYE_RESOLUTION: 1024,
        DENSITY_DISSIPATION: 0.96,
        VELOCITY_DISSIPATION: 0.85,
        PRESSURE: 0.2,
        PRESSURE_ITERATIONS: 10,
        CURL: 25,
        SPLAT_RADIUS: 0.2,
        SPLAT_FORCE: 6000,
        COLOR_UPDATE_SPEED: 10,
        BACK_COLOR: { r: 0, g: 0, b: 0 },
        TRANSPARENT: true,
    };

    let gl: WebGL2RenderingContext | WebGLRenderingContext | null = null;
    let ext: {
        formatRGBA: { internalFormat: number; format: number } | null;
        formatRG: { internalFormat: number; format: number } | null;
        formatR: { internalFormat: number; format: number } | null;
        halfFloatTexType: number;
        supportLinearFiltering: boolean;
    } | null = null;

    function getWebGLContext(canvas: HTMLCanvasElement) {
        const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
        let gl: WebGL2RenderingContext | WebGLRenderingContext | null = canvas.getContext('webgl2', params) as WebGL2RenderingContext | null;
        const isWebGL2 = !!gl;
        if (!isWebGL2) {
            gl = (canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params)) as WebGLRenderingContext | null;
        }
        if (!gl) return null;
        
        let halfFloat: any, supportLinearFiltering: any;
        if (isWebGL2) {
            gl.getExtension('EXT_color_buffer_float');
            supportLinearFiltering = gl.getExtension('OES_texture_float_linear');
        } else {
            halfFloat = gl.getExtension('OES_texture_half_float');
            supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear');
        }
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        
        const halfFloatTexType = isWebGL2 ? (gl as WebGL2RenderingContext).HALF_FLOAT : (halfFloat?.HALF_FLOAT_OES || 0x8D61);
        let formatRGBA, formatRG, formatR;

        if (isWebGL2) {
            const gl2 = gl as WebGL2RenderingContext;
            formatRGBA = getSupportedFormat(gl2, gl2.RGBA16F, gl2.RGBA, halfFloatTexType);
            formatRG = getSupportedFormat(gl2, gl2.RG16F, gl2.RG, halfFloatTexType);
            formatR = getSupportedFormat(gl2, gl2.R16F, gl2.RED, halfFloatTexType);
        } else {
            formatRGBA = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
            formatRG = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
            formatR = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
        }

        return {
            gl,
            ext: { formatRGBA, formatRG, formatR, halfFloatTexType, supportLinearFiltering }
        };
    }

    function getSupportedFormat(gl: any, internalFormat: number, format: number, type: number) {
        if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
            switch (internalFormat) {
                case gl.R16F: return getSupportedFormat(gl, gl.RG16F, gl.RG, type);
                case gl.RG16F: return getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type);
                default: return null;
            }
        }
        return { internalFormat, format };
    }

    function supportRenderTextureFormat(gl: any, internalFormat: number, format: number, type: number) {
        let texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
        let fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        return status === gl.FRAMEBUFFER_COMPLETE;
    }

    const ctx = getWebGLContext(canvas);
    if (!ctx) return;
    gl = ctx.gl;
    ext = ctx.ext;

    function getResolution(resolution: number) {
        let aspectRatio = gl!.drawingBufferWidth / gl!.drawingBufferHeight;
        if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;
        let min = Math.round(resolution);
        let max = Math.round(resolution * aspectRatio);
        if (gl!.drawingBufferWidth > gl!.drawingBufferHeight) return { width: max, height: min };
        else return { width: min, height: max };
    }

    function createFBO(w: number, h: number, internalFormat: number, format: number, type: number, param: number) {
        gl!.activeTexture(gl!.TEXTURE0);
        let texture = gl!.createTexture();
        gl!.bindTexture(gl!.TEXTURE_2D, texture);
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, param);
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, param);
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
        gl!.texImage2D(gl!.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);
        let fbo = gl!.createFramebuffer();
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
        gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, texture, 0);
        gl!.viewport(0, 0, w, h);
        gl!.clear(gl!.COLOR_BUFFER_BIT);
        return { texture, fbo, width: w, height: h, attach: function(id: number) { gl!.activeTexture(gl!.TEXTURE0 + id); gl!.bindTexture(gl!.TEXTURE_2D, texture); return id; } };
    }

    function createDoubleFBO(w: number, h: number, internalFormat: number, format: number, type: number, param: number) {
        let fbo1 = createFBO(w, h, internalFormat, format, type, param);
        let fbo2 = createFBO(w, h, internalFormat, format, type, param);
        return {
            width: w, height: h, texelSizeX: 1.0 / w, texelSizeY: 1.0 / h,
            get read() { return fbo1; },
            set read(value) { fbo1 = value; },
            get write() { return fbo2; },
            set write(value) { fbo2 = value; },
            swap() { let temp = fbo1; fbo1 = fbo2; fbo2 = temp; }
        }
    }

    const baseVertexShader = `
        precision highp float;
        attribute vec2 aPosition;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform vec2 texelSize;
        void main () {
            vUv = aPosition * 0.5 + 0.5;
            vL = vUv - vec2(texelSize.x, 0.0);
            vR = vUv + vec2(texelSize.x, 0.0);
            vT = vUv + vec2(0.0, texelSize.y);
            vB = vUv - vec2(0.0, texelSize.y);
            gl_Position = vec4(aPosition, 0.0, 1.0);
        }
    `;

    const clearShader = `
        precision mediump float;
        varying highp vec2 vUv;
        uniform sampler2D uTexture;
        uniform float value;
        void main () {
            gl_FragColor = value * texture2D(uTexture, vUv);
        }
    `;

    const colorShader = `
        precision mediump float;
        uniform vec4 color;
        void main () { gl_FragColor = color; }
    `;

    const displayShader = `
        precision highp float;
        varying vec2 vUv;
        uniform sampler2D uTexture; // Smoke dye (monochromatic base)
        uniform sampler2D uVelocity;

        void main () {
            vec2 vel = texture2D(uVelocity, vUv).xy;
            
            // 1. Prism Split (Chromatic Aberration) based on fluid velocity
            // The faster the smoke moves, the wider the RGB light splits!
            float strength = 0.25; 
            vec2 uvR = vUv - vel * strength * 0.6;
            vec2 uvG = vUv - vel * strength * 1.0;
            vec2 uvB = vUv - vel * strength * 1.4;
            
            // 2. Sample the dense smoke dye at the split coordinates
            // We use the red channel since the injected dye is pure white
            float rSmoke = texture2D(uTexture, uvR).r;
            float gSmoke = texture2D(uTexture, uvG).r; 
            float bSmoke = texture2D(uTexture, uvB).r;
            
            // 3. Construct the physical prism-split smoke
            vec3 prismSmoke = vec3(rSmoke, gSmoke, bSmoke);
            
            // 4. EMIL DESIGN ENG: "Darken the colors, dense smoke"
            // We use smoothstep to make the smoke thicker (dense edges)
            // and multiply by 0.5 to drastically darken the bright colors.
            prismSmoke = smoothstep(0.02, 0.9, prismSmoke) * 0.5;
            
            // 5. Premium dark background
            vec3 darkBg = vec3(0.03, 0.03, 0.04);
            
            // Additive blend for the thick glowing smoke
            gl_FragColor = vec4(darkBg + prismSmoke, 1.0);
        }
    `;

    const splatShader = `
        precision highp float;
        varying vec2 vUv;
        uniform sampler2D uTarget;
        uniform float aspectRatio;
        uniform vec3 color;
        uniform vec2 point;
        uniform float radius;
        void main () {
            vec2 p = vUv - point.xy;
            p.x *= aspectRatio;
            vec3 splat = exp(-dot(p, p) / radius) * color;
            vec3 base = texture2D(uTarget, vUv).xyz;
            gl_FragColor = vec4(base + splat, 1.0);
        }
    `;

    const advectionShader = `
        precision highp float;
        varying vec2 vUv;
        uniform sampler2D uVelocity;
        uniform sampler2D uSource;
        uniform vec2 texelSize;
        uniform float dt;
        uniform float dissipation;
        void main () {
            vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
            gl_FragColor = dissipation * texture2D(uSource, coord);
        }
    `;

    const divergenceShader = `
        precision mediump float;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uVelocity;
        void main () {
            float L = texture2D(uVelocity, vL).x;
            float R = texture2D(uVelocity, vR).x;
            float T = texture2D(uVelocity, vT).y;
            float B = texture2D(uVelocity, vB).y;
            vec2 C = texture2D(uVelocity, vUv).xy;
            if (vL.x < 0.0) { L = -C.x; }
            if (vR.x > 1.0) { R = -C.x; }
            if (vT.y > 1.0) { T = -C.y; }
            if (vB.y < 0.0) { B = -C.y; }
            float div = 0.5 * (R - L + T - B);
            gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
        }
    `;

    const curlShader = `
        precision mediump float;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uVelocity;
        void main () {
            float L = texture2D(uVelocity, vL).y;
            float R = texture2D(uVelocity, vR).y;
            float T = texture2D(uVelocity, vT).x;
            float B = texture2D(uVelocity, vB).x;
            float vorticity = R - L - T + B;
            gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
        }
    `;

    const vorticityShader = `
        precision highp float;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform sampler2D uVelocity;
        uniform sampler2D uCurl;
        uniform float curl;
        uniform float dt;
        void main () {
            float L = texture2D(uCurl, vL).x;
            float R = texture2D(uCurl, vR).x;
            float T = texture2D(uCurl, vT).x;
            float B = texture2D(uCurl, vB).x;
            float C = texture2D(uCurl, vUv).x;
            vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
            force /= length(force) + 0.0001;
            force *= curl * C;
            force.y *= -1.0;
            vec2 velocity = texture2D(uVelocity, vUv).xy;
            gl_FragColor = vec4(velocity + force * dt, 0.0, 1.0);
        }
    `;

    const pressureShader = `
        precision mediump float;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uPressure;
        uniform sampler2D uDivergence;
        void main () {
            float L = texture2D(uPressure, vL).x;
            float R = texture2D(uPressure, vR).x;
            float T = texture2D(uPressure, vT).x;
            float B = texture2D(uPressure, vB).x;
            float C = texture2D(uPressure, vUv).x;
            float divergence = texture2D(uDivergence, vUv).x;
            float pressure = (L + R + B + T - divergence) * 0.25;
            gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
        }
    `;

    const gradientSubtractShader = `
        precision mediump float;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uPressure;
        uniform sampler2D uVelocity;
        void main () {
            float L = texture2D(uPressure, vL).x;
            float R = texture2D(uPressure, vR).x;
            float T = texture2D(uPressure, vT).x;
            float B = texture2D(uPressure, vB).x;
            vec2 velocity = texture2D(uVelocity, vUv).xy;
            velocity.xy -= vec2(R - L, T - B);
            gl_FragColor = vec4(velocity, 0.0, 1.0);
        }
    `;

    function createProgram(vertexShaderSource: string, fragmentShaderSource: string) {
        const vertexShader = gl!.createShader(gl!.VERTEX_SHADER)!;
        gl!.shaderSource(vertexShader, vertexShaderSource);
        gl!.compileShader(vertexShader);
        const fragmentShader = gl!.createShader(gl!.FRAGMENT_SHADER)!;
        gl!.shaderSource(fragmentShader, fragmentShaderSource);
        gl!.compileShader(fragmentShader);
        const program = gl!.createProgram()!;
        gl!.attachShader(program, vertexShader);
        gl!.attachShader(program, fragmentShader);
        gl!.linkProgram(program);
        return program;
    }

    class Program {
        program: WebGLProgram;
        uniforms: any;
        constructor(vertexShaderSource: string, fragmentShaderSource: string) {
            this.program = createProgram(vertexShaderSource, fragmentShaderSource);
            this.uniforms = {};
            const uniformCount = gl!.getProgramParameter(this.program, gl!.ACTIVE_UNIFORMS);
            for (let i = 0; i < uniformCount; i++) {
                const uniformName = gl!.getActiveUniform(this.program, i)!.name;
                this.uniforms[uniformName] = gl!.getUniformLocation(this.program, uniformName);
            }
        }
        bind() { gl!.useProgram(this.program); }
    }

    const blit = (() => {
        gl!.bindBuffer(gl!.ARRAY_BUFFER, gl!.createBuffer());
        gl!.bufferData(gl!.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl!.STATIC_DRAW);
        gl!.bindBuffer(gl!.ELEMENT_ARRAY_BUFFER, gl!.createBuffer());
        gl!.bufferData(gl!.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl!.STATIC_DRAW);
        gl!.vertexAttribPointer(0, 2, gl!.FLOAT, false, 0, 0);
        gl!.enableVertexAttribArray(0);
        return (target: any) => {
            if (target == null) {
                gl!.viewport(0, 0, gl!.drawingBufferWidth, gl!.drawingBufferHeight);
                gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
            } else {
                gl!.viewport(0, 0, target.width, target.height);
                gl!.bindFramebuffer(gl!.FRAMEBUFFER, target.fbo);
            }
            gl!.drawElements(gl!.TRIANGLES, 6, gl!.UNSIGNED_SHORT, 0);
        }
    })();

    let dye: any, velocity: any, divergence: any, curl: any, pressure: any;

    const clearProgram = new Program(baseVertexShader, clearShader);
    const colorProgram = new Program(baseVertexShader, colorShader);
    const displayProgram = new Program(baseVertexShader, displayShader);
    const splatProgram = new Program(baseVertexShader, splatShader);
    const advectionProgram = new Program(baseVertexShader, advectionShader);
    const divergenceProgram = new Program(baseVertexShader, divergenceShader);
    const curlProgram = new Program(baseVertexShader, curlShader);
    const vorticityProgram = new Program(baseVertexShader, vorticityShader);
    const pressureProgram = new Program(baseVertexShader, pressureShader);
    const gradienSubtractProgram = new Program(baseVertexShader, gradientSubtractShader);

    function initFramebuffers() {
        let simRes = getResolution(config.SIM_RESOLUTION);
        let dyeRes = getResolution(config.DYE_RESOLUTION);
        const texType = ext!.halfFloatTexType;
        const rgba = ext!.formatRGBA;
        const rg = ext!.formatRG;
        const r = ext!.formatR;
        const filtering = ext!.supportLinearFiltering ? gl!.LINEAR : gl!.NEAREST;
        
        dye = createDoubleFBO(dyeRes.width, dyeRes.height, rgba!.internalFormat, rgba!.format, texType, filtering);
        velocity = createDoubleFBO(simRes.width, simRes.height, rg!.internalFormat, rg!.format, texType, filtering);
        divergence = createFBO(simRes.width, simRes.height, r!.internalFormat, r!.format, texType, gl!.NEAREST);
        curl = createFBO(simRes.width, simRes.height, r!.internalFormat, r!.format, texType, gl!.NEAREST);
        pressure = createDoubleFBO(simRes.width, simRes.height, r!.internalFormat, r!.format, texType, gl!.NEAREST);
    }
    initFramebuffers();

    let splats: any[] = [];
    let lastTime = Date.now();
    let animationFrameId: number;

    function update() {
        const dt = Math.min((Date.now() - lastTime) / 1000, 0.016);
        lastTime = Date.now();

        gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
        gl!.clearColor(0.0, 0.0, 0.0, 1.0);
        gl!.clear(gl!.COLOR_BUFFER_BIT);

        if (splats.length > 0) {
            for (let i = 0; i < splats.length; i++) {
                splatProgram.bind();
                gl!.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
                gl!.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height);
                gl!.uniform2f(splatProgram.uniforms.point, splats[i].x, splats[i].y);
                gl!.uniform3f(splatProgram.uniforms.color, splats[i].dx, splats[i].dy, 1.0);
                gl!.uniform1f(splatProgram.uniforms.radius, splats[i].radius / 100.0);
                blit(velocity.write);
                velocity.swap();

                gl!.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
                gl!.uniform3f(splatProgram.uniforms.color, splats[i].color.r, splats[i].color.g, splats[i].color.b);
                blit(dye.write);
                dye.swap();
            }
            splats = [];
        }

        curlProgram.bind();
        gl!.uniform2f(curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl!.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
        blit(curl);

        vorticityProgram.bind();
        gl!.uniform2f(vorticityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl!.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
        gl!.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
        gl!.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
        gl!.uniform1f(vorticityProgram.uniforms.dt, dt);
        blit(velocity.write);
        velocity.swap();

        divergenceProgram.bind();
        gl!.uniform2f(divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl!.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
        blit(divergence);

        clearProgram.bind();
        gl!.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
        gl!.uniform1f(clearProgram.uniforms.value, config.PRESSURE);
        blit(pressure.write);
        pressure.swap();

        pressureProgram.bind();
        gl!.uniform2f(pressureProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl!.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
        for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
            gl!.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
            blit(pressure.write);
            pressure.swap();
        }

        gradienSubtractProgram.bind();
        gl!.uniform2f(gradienSubtractProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl!.uniform1i(gradienSubtractProgram.uniforms.uPressure, pressure.read.attach(0));
        gl!.uniform1i(gradienSubtractProgram.uniforms.uVelocity, velocity.read.attach(1));
        blit(velocity.write);
        velocity.swap();

        advectionProgram.bind();
        gl!.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        if (!ext!.supportLinearFiltering) {
            gl!.uniform2f(advectionProgram.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
        }
        let velocityId = velocity.read.attach(0);
        gl!.uniform1i(advectionProgram.uniforms.uVelocity, velocityId);
        gl!.uniform1i(advectionProgram.uniforms.uSource, velocityId);
        gl!.uniform1f(advectionProgram.uniforms.dt, dt);
        gl!.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION);
        blit(velocity.write);
        velocity.swap();

        gl!.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
        gl!.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
        gl!.uniform1f(advectionProgram.uniforms.dissipation, config.DENSITY_DISSIPATION);
        blit(dye.write);
        dye.swap();

        displayProgram.bind();
        gl!.uniform1i(displayProgram.uniforms.uTexture, dye.read.attach(0));
        gl!.uniform1i(displayProgram.uniforms.uVelocity, velocity.read.attach(1));
        blit(null);

        animationFrameId = requestAnimationFrame(update);
    }
    update();

    function generateColor() {
        // EMIL DESIGN ENG: Pure white smoke injection.
        // We do NOT want sequential rainbow/neon colors.
        // The Prism Split shader will physically bend this white smoke into RGB colors natively based on velocity!
        return { r: 1.0, g: 1.0, b: 1.0 };
    }

    let pointers: any[] = [];
    let splatColor = generateColor();

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initFramebuffers();
    }
    window.addEventListener('resize', resize);
    resize();

    function pointerMove(e: MouseEvent | TouchEvent) {
        let clientX, clientY;
        if (e instanceof MouseEvent) {
            clientX = e.clientX;
            clientY = e.clientY;
        } else {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        const x = clientX;
        const y = canvas.height - clientY;
        const p = pointers[0] || { x: 0, y: 0, dx: 0, dy: 0, color: splatColor };
        
        p.dx = (x - p.x) * 5.0;
        p.dy = (y - p.y) * 5.0;
        p.x = x;
        p.y = y;
        
        // EMIL DESIGN ENG: Force pure white injection so prism handles colors!
        splatColor = generateColor();
        p.color = splatColor;

        pointers[0] = p;

        splats.push({
            x: x / canvas.width,
            y: y / canvas.height,
            dx: p.dx,
            dy: p.dy,
            color: splatColor,
            radius: config.SPLAT_RADIUS
        });
    }

    window.addEventListener('mousemove', pointerMove);
    window.addEventListener('touchmove', pointerMove);

    return () => {
        window.removeEventListener('resize', resize);
        window.removeEventListener('mousemove', pointerMove);
        window.removeEventListener('touchmove', pointerMove);
        cancelAnimationFrame(animationFrameId);
    };
}
