/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useRef } from "react"

interface SplashCursorProps {
  SIM_RESOLUTION?: number
  DYE_RESOLUTION?: number
  CAPTURE_RESOLUTION?: number
  DENSITY_DISSIPATION?: number
  VELOCITY_DISSIPATION?: number
  PRESSURE?: number
  PRESSURE_ITERATIONS?: number
  CURL?: number
  SPLAT_RADIUS?: number
  SPLAT_FORCE?: number
  SHADING?: boolean
  COLOR_UPDATE_SPEED?: number
  BACK_COLOR?: { r: number; g: number; b: number }
  TRANSPARENT?: boolean
  RAINBOW_MODE?: boolean
  COLOR?: string
}

export default function SplashCursor({
  SIM_RESOLUTION = 128,
  DYE_RESOLUTION = 1440,
  CAPTURE_RESOLUTION = 512,
  DENSITY_DISSIPATION = 2.5,
  VELOCITY_DISSIPATION = 0.4,
  PRESSURE = 0.1,
  PRESSURE_ITERATIONS = 20,
  CURL = 30,
  SPLAT_RADIUS = 0.25,
  SPLAT_FORCE = 6000,
  SHADING = true,
  COLOR_UPDATE_SPEED = 10,
  BACK_COLOR = { r: 0, g: 0, b: 0 },
  TRANSPARENT = true,
  RAINBOW_MODE = true,
  COLOR = "#ff0000",
}: SplashCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameId = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let isActive = true

    function pointerPrototype(this: any) {
      this.id = -1; this.texcoordX = 0; this.texcoordY = 0
      this.prevTexcoordX = 0; this.prevTexcoordY = 0
      this.deltaX = 0; this.deltaY = 0
      this.down = false; this.moved = false; this.color = [0, 0, 0]
    }

    const config: any = {
      SIM_RESOLUTION, DYE_RESOLUTION, CAPTURE_RESOLUTION,
      DENSITY_DISSIPATION, VELOCITY_DISSIPATION, PRESSURE, PRESSURE_ITERATIONS,
      CURL, SPLAT_RADIUS, SPLAT_FORCE, SHADING, COLOR_UPDATE_SPEED,
      PAUSED: false, BACK_COLOR, TRANSPARENT, RAINBOW_MODE, COLOR,
    }

    const pointers: any[] = [new (pointerPrototype as any)()]

    const { gl, ext } = getWebGLContext(canvas)
    if (!ext.supportLinearFiltering) {
      config.DYE_RESOLUTION = 256
      config.SHADING = false
    }

    function getWebGLContext(c: HTMLCanvasElement) {
      const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false }
      let glCtx: any = c.getContext("webgl2", params)
      const isWebGL2 = !!glCtx
      if (!isWebGL2) glCtx = c.getContext("webgl", params) || c.getContext("experimental-webgl", params)
      let halfFloat: any, supportLinearFiltering: any
      if (isWebGL2) {
        glCtx.getExtension("EXT_color_buffer_float")
        supportLinearFiltering = glCtx.getExtension("OES_texture_float_linear")
      } else {
        halfFloat = glCtx.getExtension("OES_texture_half_float")
        supportLinearFiltering = glCtx.getExtension("OES_texture_half_float_linear")
      }
      glCtx.clearColor(0, 0, 0, 1)
      const halfFloatTexType = isWebGL2 ? glCtx.HALF_FLOAT : halfFloat?.HALF_FLOAT_OES
      let formatRGBA, formatRG, formatR
      if (isWebGL2) {
        formatRGBA = getSupportedFormat(glCtx, glCtx.RGBA16F, glCtx.RGBA, halfFloatTexType)
        formatRG = getSupportedFormat(glCtx, glCtx.RG16F, glCtx.RG, halfFloatTexType)
        formatR = getSupportedFormat(glCtx, glCtx.R16F, glCtx.RED, halfFloatTexType)
      } else {
        formatRGBA = getSupportedFormat(glCtx, glCtx.RGBA, glCtx.RGBA, halfFloatTexType)
        formatRG = getSupportedFormat(glCtx, glCtx.RGBA, glCtx.RGBA, halfFloatTexType)
        formatR = getSupportedFormat(glCtx, glCtx.RGBA, glCtx.RGBA, halfFloatTexType)
      }
      return { gl: glCtx, ext: { formatRGBA, formatRG, formatR, halfFloatTexType, supportLinearFiltering } }
    }

    function getSupportedFormat(glCtx: any, internalFormat: any, format: any, type: any): any {
      if (!supportRenderTextureFormat(glCtx, internalFormat, format, type)) {
        switch (internalFormat) {
          case glCtx.R16F: return getSupportedFormat(glCtx, glCtx.RG16F, glCtx.RG, type)
          case glCtx.RG16F: return getSupportedFormat(glCtx, glCtx.RGBA16F, glCtx.RGBA, type)
          default: return null
        }
      }
      return { internalFormat, format }
    }

    function supportRenderTextureFormat(glCtx: any, internalFormat: any, format: any, type: any) {
      const texture = glCtx.createTexture()
      glCtx.bindTexture(glCtx.TEXTURE_2D, texture)
      glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_MIN_FILTER, glCtx.NEAREST)
      glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_MAG_FILTER, glCtx.NEAREST)
      glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_WRAP_S, glCtx.CLAMP_TO_EDGE)
      glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_WRAP_T, glCtx.CLAMP_TO_EDGE)
      glCtx.texImage2D(glCtx.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null)
      const fbo = glCtx.createFramebuffer()
      glCtx.bindFramebuffer(glCtx.FRAMEBUFFER, fbo)
      glCtx.framebufferTexture2D(glCtx.FRAMEBUFFER, glCtx.COLOR_ATTACHMENT0, glCtx.TEXTURE_2D, texture, 0)
      return glCtx.checkFramebufferStatus(glCtx.FRAMEBUFFER) === glCtx.FRAMEBUFFER_COMPLETE
    }

    class Material {
      vertexShader: any; fragmentShaderSource: any; programs: any[]; activeProgram: any; uniforms: any
      constructor(vs: any, fss: any) {
        this.vertexShader = vs; this.fragmentShaderSource = fss
        this.programs = []; this.activeProgram = null; this.uniforms = []
      }
      setKeywords(keywords: string[]) {
        let hash = 0
        for (let i = 0; i < keywords.length; i++) hash += hashCode(keywords[i])
        let program = this.programs[hash]
        if (program == null) {
          const fs = compileShader(gl.FRAGMENT_SHADER, this.fragmentShaderSource, keywords)
          program = createProgram(this.vertexShader, fs)
          this.programs[hash] = program
        }
        if (program === this.activeProgram) return
        this.uniforms = getUniforms(program)
        this.activeProgram = program
      }
      bind() { gl.useProgram(this.activeProgram) }
    }

    class Program {
      uniforms: any; program: any
      constructor(vs: any, fs: any) {
        this.program = createProgram(vs, fs)
        this.uniforms = getUniforms(this.program)
      }
      bind() { gl.useProgram(this.program) }
    }

    function createProgram(vs: any, fs: any) {
      const p = gl.createProgram()
      gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p)
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) console.trace(gl.getProgramInfoLog(p))
      return p
    }

    function getUniforms(program: any) {
      const uniforms: any = []
      const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
      for (let i = 0; i < count; i++) {
        const name = gl.getActiveUniform(program, i).name
        uniforms[name] = gl.getUniformLocation(program, name)
      }
      return uniforms
    }

    function compileShader(type: any, source: string, keywords?: string[]) {
      source = addKeywords(source, keywords)
      const shader = gl.createShader(type)
      gl.shaderSource(shader, source); gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) console.trace(gl.getShaderInfoLog(shader))
      return shader
    }

    function addKeywords(source: string, keywords?: string[]) {
      if (!keywords) return source
      return keywords.map(k => `#define ${k}\n`).join("") + source
    }

    const baseVertexShader = compileShader(gl.VERTEX_SHADER, `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
      uniform vec2 texelSize;
      void main () {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(texelSize.x, 0.0); vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y); vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }`)

    const copyShader = compileShader(gl.FRAGMENT_SHADER, `
      precision mediump float; precision mediump sampler2D;
      varying highp vec2 vUv; uniform sampler2D uTexture;
      void main () { gl_FragColor = texture2D(uTexture, vUv); }`)

    const clearShader = compileShader(gl.FRAGMENT_SHADER, `
      precision mediump float; precision mediump sampler2D;
      varying highp vec2 vUv; uniform sampler2D uTexture; uniform float value;
      void main () { gl_FragColor = value * texture2D(uTexture, vUv); }`)

    const displayShaderSource = `
      precision highp float; precision highp sampler2D;
      varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
      uniform sampler2D uTexture; uniform sampler2D uDithering;
      uniform vec2 ditherScale; uniform vec2 texelSize;
      vec3 linearToGamma (vec3 color) {
        color = max(color, vec3(0));
        return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0));
      }
      void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;
        #ifdef SHADING
        vec3 lc = texture2D(uTexture, vL).rgb; vec3 rc = texture2D(uTexture, vR).rgb;
        vec3 tc = texture2D(uTexture, vT).rgb; vec3 bc = texture2D(uTexture, vB).rgb;
        float dx = length(rc) - length(lc); float dy = length(tc) - length(bc);
        vec3 n = normalize(vec3(dx, dy, length(texelSize))); vec3 l = vec3(0.0, 0.0, 1.0);
        float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0); c *= diffuse;
        #endif
        float a = max(c.r, max(c.g, c.b));
        gl_FragColor = vec4(c, a);
      }`

    const splatShader = compileShader(gl.FRAGMENT_SHADER, `
      precision highp float; precision highp sampler2D;
      varying vec2 vUv; uniform sampler2D uTarget; uniform float aspectRatio;
      uniform vec3 color; uniform vec2 point; uniform float radius;
      void main () {
        vec2 p = vUv - point.xy; p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
      }`)

    const advectionShader = compileShader(gl.FRAGMENT_SHADER, `
      precision highp float; precision highp sampler2D;
      varying vec2 vUv; uniform sampler2D uVelocity; uniform sampler2D uSource;
      uniform vec2 texelSize; uniform vec2 dyeTexelSize; uniform float dt; uniform float dissipation;
      vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
        vec2 st = uv / tsize - 0.5; vec2 iuv = floor(st); vec2 fuv = fract(st);
        vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
        vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
        vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
        vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
        return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
      }
      void main () {
        #ifdef MANUAL_FILTERING
        vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
        vec4 result = bilerp(uSource, coord, dyeTexelSize);
        #else
        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
        vec4 result = texture2D(uSource, coord);
        #endif
        float decay = 1.0 + dissipation * dt;
        gl_FragColor = result / decay;
      }`, ext.supportLinearFiltering ? undefined : ["MANUAL_FILTERING"])

    const divergenceShader = compileShader(gl.FRAGMENT_SHADER, `
      precision mediump float; precision mediump sampler2D;
      varying highp vec2 vUv; varying highp vec2 vL; varying highp vec2 vR;
      varying highp vec2 vT; varying highp vec2 vB; uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uVelocity, vL).x; float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y; float B = texture2D(uVelocity, vB).y;
        vec2 C = texture2D(uVelocity, vUv).xy;
        if (vL.x < 0.0) { L = -C.x; } if (vR.x > 1.0) { R = -C.x; }
        if (vT.y > 1.0) { T = -C.y; } if (vB.y < 0.0) { B = -C.y; }
        gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
      }`)

    const curlShader = compileShader(gl.FRAGMENT_SHADER, `
      precision mediump float; precision mediump sampler2D;
      varying highp vec2 vUv; varying highp vec2 vL; varying highp vec2 vR;
      varying highp vec2 vT; varying highp vec2 vB; uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uVelocity, vL).y; float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x; float B = texture2D(uVelocity, vB).x;
        gl_FragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
      }`)

    const vorticityShader = compileShader(gl.FRAGMENT_SHADER, `
      precision highp float; precision highp sampler2D;
      varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
      uniform sampler2D uVelocity; uniform sampler2D uCurl; uniform float curl; uniform float dt;
      void main () {
        float L = texture2D(uCurl, vL).x; float R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x; float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;
        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        force /= length(force) + 0.0001; force *= curl * C; force.y *= -1.0;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity += force * dt; velocity = min(max(velocity, -1000.0), 1000.0);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }`)

    const pressureShader = compileShader(gl.FRAGMENT_SHADER, `
      precision mediump float; precision mediump sampler2D;
      varying highp vec2 vUv; varying highp vec2 vL; varying highp vec2 vR;
      varying highp vec2 vT; varying highp vec2 vB;
      uniform sampler2D uPressure; uniform sampler2D uDivergence;
      void main () {
        float L = texture2D(uPressure, vL).x; float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x; float B = texture2D(uPressure, vB).x;
        float divergence = texture2D(uDivergence, vUv).x;
        gl_FragColor = vec4((L + R + B + T - divergence) * 0.25, 0.0, 0.0, 1.0);
      }`)

    const gradientSubtractShader = compileShader(gl.FRAGMENT_SHADER, `
      precision mediump float; precision mediump sampler2D;
      varying highp vec2 vUv; varying highp vec2 vL; varying highp vec2 vR;
      varying highp vec2 vT; varying highp vec2 vB;
      uniform sampler2D uPressure; uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uPressure, vL).x; float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x; float B = texture2D(uPressure, vB).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity.xy -= vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }`)

    const blit = (() => {
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer())
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW)
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
      gl.enableVertexAttribArray(0)
      return (target: any, clear = false) => {
        if (target == null) {
          gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
          gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        } else {
          gl.viewport(0, 0, target.width, target.height)
          gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo)
        }
        if (clear) { gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT) }
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
      }
    })()

    let dye: any, velocity: any, divergence: any, curl: any, pressure: any

    const copyProgram = new Program(baseVertexShader, copyShader)
    const clearProgram = new Program(baseVertexShader, clearShader)
    const splatProgram = new Program(baseVertexShader, splatShader)
    const advectionProgram = new Program(baseVertexShader, advectionShader)
    const divergenceProgram = new Program(baseVertexShader, divergenceShader)
    const curlProgram = new Program(baseVertexShader, curlShader)
    const vorticityProgram = new Program(baseVertexShader, vorticityShader)
    const pressureProgram = new Program(baseVertexShader, pressureShader)
    const gradienSubtractProgram = new Program(baseVertexShader, gradientSubtractShader)
    const displayMaterial = new Material(baseVertexShader, displayShaderSource)

    function initFramebuffers() {
      const simRes = getResolution(config.SIM_RESOLUTION)
      const dyeRes = getResolution(config.DYE_RESOLUTION)
      const texType = ext.halfFloatTexType
      const rgba = ext.formatRGBA, rg = ext.formatRG, r = ext.formatR
      const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST
      gl.disable(gl.BLEND)
      if (!dye)
        dye = createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering)
      else
        dye = resizeDoubleFBO(dye, dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering)
      if (!velocity)
        velocity = createDoubleFBO(simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering)
      else
        velocity = resizeDoubleFBO(velocity, simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering)
      divergence = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST)
      curl = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST)
      pressure = createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST)
    }

    function createFBO(w: number, h: number, internalFormat: any, format: any, type: any, param: any) {
      gl.activeTexture(gl.TEXTURE0)
      const texture = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null)
      const fbo = gl.createFramebuffer()
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
      gl.viewport(0, 0, w, h); gl.clear(gl.COLOR_BUFFER_BIT)
      return { texture, fbo, width: w, height: h, texelSizeX: 1 / w, texelSizeY: 1 / h,
        attach(id: number) { gl.activeTexture(gl.TEXTURE0 + id); gl.bindTexture(gl.TEXTURE_2D, texture); return id } }
    }

    function createDoubleFBO(w: number, h: number, internalFormat: any, format: any, type: any, param: any) {
      let fbo1 = createFBO(w, h, internalFormat, format, type, param)
      let fbo2 = createFBO(w, h, internalFormat, format, type, param)
      return { width: w, height: h, texelSizeX: fbo1.texelSizeX, texelSizeY: fbo1.texelSizeY,
        get read() { return fbo1 }, set read(v) { fbo1 = v },
        get write() { return fbo2 }, set write(v) { fbo2 = v },
        swap() { const t = fbo1; fbo1 = fbo2; fbo2 = t } }
    }

    function resizeFBO(target: any, w: number, h: number, internalFormat: any, format: any, type: any, param: any) {
      const newFBO = createFBO(w, h, internalFormat, format, type, param)
      copyProgram.bind(); gl.uniform1i(copyProgram.uniforms.uTexture, target.attach(0)); blit(newFBO)
      return newFBO
    }

    function resizeDoubleFBO(target: any, w: number, h: number, internalFormat: any, format: any, type: any, param: any) {
      if (target.width === w && target.height === h) return target
      target.read = resizeFBO(target.read, w, h, internalFormat, format, type, param)
      target.write = createFBO(w, h, internalFormat, format, type, param)
      target.width = w; target.height = h
      target.texelSizeX = 1 / w; target.texelSizeY = 1 / h
      return target
    }

    function updateKeywords() {
      const kw: string[] = []
      if (config.SHADING) kw.push("SHADING")
      displayMaterial.setKeywords(kw)
    }

    updateKeywords(); initFramebuffers()
    let lastUpdateTime = Date.now(), colorUpdateTimer = 0.0

    function updateFrame() {
      if (!isActive) return
      const dt = calcDeltaTime()
      if (resizeCanvas()) initFramebuffers()
      updateColors(dt); applyInputs(); step(dt); render(null)
      animationFrameId.current = requestAnimationFrame(updateFrame)
    }

    function calcDeltaTime() {
      const now = Date.now(); const dt = Math.min((now - lastUpdateTime) / 1000, 0.016666)
      lastUpdateTime = now; return dt
    }

    function resizeCanvas() {
      const w = scaleByPixelRatio(canvas!.clientWidth)
      const h = scaleByPixelRatio(canvas!.clientHeight)
      if (canvas!.width !== w || canvas!.height !== h) { canvas!.width = w; canvas!.height = h; return true }
      return false
    }

    function updateColors(dt: number) {
      colorUpdateTimer += dt * config.COLOR_UPDATE_SPEED
      if (colorUpdateTimer >= 1) {
        colorUpdateTimer = wrap(colorUpdateTimer, 0, 1)
        pointers.forEach(p => { p.color = generateColor() })
      }
    }

    function applyInputs() {
      pointers.forEach(p => { if (p.moved) { p.moved = false; splatPointer(p) } })
    }

    function step(dt: number) {
      gl.disable(gl.BLEND)
      curlProgram.bind()
      gl.uniform2f(curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
      gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0)); blit(curl)
      vorticityProgram.bind()
      gl.uniform2f(vorticityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
      gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0))
      gl.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1))
      gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL)
      gl.uniform1f(vorticityProgram.uniforms.dt, dt); blit(velocity.write); velocity.swap()
      divergenceProgram.bind()
      gl.uniform2f(divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
      gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0)); blit(divergence)
      clearProgram.bind()
      gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0))
      gl.uniform1f(clearProgram.uniforms.value, config.PRESSURE); blit(pressure.write); pressure.swap()
      pressureProgram.bind()
      gl.uniform2f(pressureProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
      gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0))
      for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
        gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1))
        blit(pressure.write); pressure.swap()
      }
      gradienSubtractProgram.bind()
      gl.uniform2f(gradienSubtractProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
      gl.uniform1i(gradienSubtractProgram.uniforms.uPressure, pressure.read.attach(0))
      gl.uniform1i(gradienSubtractProgram.uniforms.uVelocity, velocity.read.attach(1))
      blit(velocity.write); velocity.swap()
      advectionProgram.bind()
      gl.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
      if (!ext.supportLinearFiltering)
        gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY)
      const velocityId = velocity.read.attach(0)
      gl.uniform1i(advectionProgram.uniforms.uVelocity, velocityId)
      gl.uniform1i(advectionProgram.uniforms.uSource, velocityId)
      gl.uniform1f(advectionProgram.uniforms.dt, dt)
      gl.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION)
      blit(velocity.write); velocity.swap()
      if (!ext.supportLinearFiltering)
        gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY)
      gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0))
      gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1))
      gl.uniform1f(advectionProgram.uniforms.dissipation, config.DENSITY_DISSIPATION)
      blit(dye.write); dye.swap()
    }

    function render(target: any) {
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.enable(gl.BLEND)
      const w = target == null ? gl.drawingBufferWidth : target.width
      const h = target == null ? gl.drawingBufferHeight : target.height
      displayMaterial.bind()
      if (config.SHADING) gl.uniform2f(displayMaterial.uniforms.texelSize, 1 / w, 1 / h)
      gl.uniform1i(displayMaterial.uniforms.uTexture, dye.read.attach(0))
      blit(target)
    }

    function splatPointer(pointer: any) {
      splat(pointer.texcoordX, pointer.texcoordY,
        pointer.deltaX * config.SPLAT_FORCE, pointer.deltaY * config.SPLAT_FORCE, pointer.color)
    }

    function splat(x: number, y: number, dx: number, dy: number, color: any) {
      splatProgram.bind()
      gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0))
      gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas!.width / canvas!.height)
      gl.uniform2f(splatProgram.uniforms.point, x, y)
      gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0)
      gl.uniform1f(splatProgram.uniforms.radius, correctRadius(config.SPLAT_RADIUS / 100))
      blit(velocity.write); velocity.swap()
      gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0))
      gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b)
      blit(dye.write); dye.swap()
    }

    function correctRadius(radius: number) {
      const ar = canvas!.width / canvas!.height
      if (ar > 1) radius *= ar
      return radius
    }

    function scaleByPixelRatio(input: number) {
      return Math.floor(input * (window.devicePixelRatio || 1))
    }

    function getResolution(resolution: number) {
      let ar = gl.drawingBufferWidth / gl.drawingBufferHeight
      if (ar < 1) ar = 1 / ar
      const min = Math.round(resolution), max = Math.round(resolution * ar)
      return gl.drawingBufferWidth > gl.drawingBufferHeight
        ? { width: max, height: min } : { width: min, height: max }
    }

    function generateColor() {
      if (!config.RAINBOW_MODE) return hexToRGB(config.COLOR)
      const c = HSVtoRGB(Math.random(), 1, 1)
      c.r *= 0.15; c.g *= 0.15; c.b *= 0.15; return c
    }

    function hexToRGB(hex: string) {
      let v = hex.replace("#", "")
      if (v.length === 3) v = v[0]+v[0]+v[1]+v[1]+v[2]+v[2]
      return { r: parseInt(v.slice(0,2),16)/255*0.15, g: parseInt(v.slice(2,4),16)/255*0.15, b: parseInt(v.slice(4,6),16)/255*0.15 }
    }

    function HSVtoRGB(h: number, s: number, v: number) {
      const i = Math.floor(h * 6), f = h*6-i, p = v*(1-s), q = v*(1-f*s), t = v*(1-(1-f)*s)
      const cases: [number,number,number][] = [[v,t,p],[q,v,p],[p,v,t],[p,q,v],[t,p,v],[v,p,q]]
      const [r,g,b] = cases[i%6]
      return { r, g, b }
    }

    function wrap(value: number, min: number, max: number) {
      const range = max - min; if (range === 0) return min
      return ((value - min) % range) + min
    }

    function hashCode(s: string) {
      let hash = 0
      for (let i = 0; i < s.length; i++) { hash = (hash << 5) - hash + s.charCodeAt(i); hash |= 0 }
      return hash
    }

    function updatePointerDownData(pointer: any, id: number, posX: number, posY: number) {
      pointer.id = id; pointer.down = true; pointer.moved = false
      pointer.texcoordX = posX / canvas!.width; pointer.texcoordY = 1 - posY / canvas!.height
      pointer.prevTexcoordX = pointer.texcoordX; pointer.prevTexcoordY = pointer.texcoordY
      pointer.deltaX = 0; pointer.deltaY = 0; pointer.color = generateColor()
    }

    function updatePointerMoveData(pointer: any, posX: number, posY: number, color: any) {
      pointer.prevTexcoordX = pointer.texcoordX; pointer.prevTexcoordY = pointer.texcoordY
      pointer.texcoordX = posX / canvas!.width; pointer.texcoordY = 1 - posY / canvas!.height
      pointer.deltaX = correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX)
      pointer.deltaY = correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY)
      pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0
      pointer.color = color
    }

    function correctDeltaX(delta: number) {
      const ar = canvas!.width / canvas!.height; if (ar < 1) delta *= ar; return delta
    }

    function correctDeltaY(delta: number) {
      const ar = canvas!.width / canvas!.height; if (ar > 1) delta /= ar; return delta
    }

    const handleMouseDown = (e: MouseEvent) => {
      const p = pointers[0]
      updatePointerDownData(p, -1, scaleByPixelRatio(e.clientX), scaleByPixelRatio(e.clientY))
      const color = generateColor(); color.r *= 10; color.g *= 10; color.b *= 10
      const dx = 10*(Math.random()-0.5), dy = 30*(Math.random()-0.5)
      splat(p.texcoordX, p.texcoordY, dx, dy, color)
    }

    let firstMove = false
    const handleMouseMove = (e: MouseEvent) => {
      const p = pointers[0], posX = scaleByPixelRatio(e.clientX), posY = scaleByPixelRatio(e.clientY)
      const color = firstMove ? p.color : generateColor(); firstMove = true
      updatePointerMoveData(p, posX, posY, color)
    }

    const handleTouchStart = (e: TouchEvent) => {
      const p = pointers[0]
      for (let i = 0; i < e.targetTouches.length; i++)
        updatePointerDownData(p, e.targetTouches[i].identifier,
          scaleByPixelRatio(e.targetTouches[i].clientX), scaleByPixelRatio(e.targetTouches[i].clientY))
    }

    const handleTouchMove = (e: TouchEvent) => {
      const p = pointers[0]
      for (let i = 0; i < e.targetTouches.length; i++)
        updatePointerMoveData(p, scaleByPixelRatio(e.targetTouches[i].clientX),
          scaleByPixelRatio(e.targetTouches[i].clientY), p.color)
    }

    const handleTouchEnd = () => { pointers[0].down = false }

    window.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("touchstart", handleTouchStart)
    window.addEventListener("touchmove", handleTouchMove, false)
    window.addEventListener("touchend", handleTouchEnd)

    updateFrame()

    return () => {
      isActive = false
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current)
      window.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("touchstart", handleTouchStart)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleTouchEnd)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  )
}
