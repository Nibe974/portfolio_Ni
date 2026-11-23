import { useEffect, useRef } from 'react'
import useMediaQuery from '../hooks/useMediaQuery'

const vertexShader = `
  attribute vec2 position;
  varying vec2 uv;
  void main() {
    uv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`

const fragmentShader = `
  precision highp float;
  varying vec2 uv;
  uniform sampler2D previousFrame;
  uniform vec2 pointer;
  uniform vec2 resolution;
  uniform float time;
  uniform float active;
  void main() {
    vec2 aspect = vec2(resolution.x / resolution.y, 1.0);
    vec2 drift = vec2(sin(uv.y * 10.0 + time) * 0.0007, cos(uv.x * 9.0 + time) * 0.0007);
    vec4 old = texture2D(previousFrame, uv + drift);
    old.rgb *= 0.975;
    float d = distance((uv - pointer) * aspect, vec2(0.0));
    float blob = exp(-d * d * 2200.0) * active;
    float halo = exp(-d * d * 450.0) * active;
    vec3 pink = vec3(1.0, 0.18, 0.58);
    vec3 yellow = vec3(1.0, 0.84, 0.04);
    float mixColor = 0.5 + 0.5 * sin(time * 1.4 + pointer.x * 7.0);
    vec3 ink = mix(pink, yellow, mixColor);
    float shine = exp(-distance((uv - pointer + vec2(0.006, 0.008)) * aspect, vec2(0.0)) * 3000.0);
    vec3 dye = ink * (blob * 0.14 + halo * 0.045) + vec3(1.0) * shine * blob * 0.08;
    gl_FragColor = vec4(old.rgb + dye, max(old.a * 0.975, halo * 0.10));
  }
`

function compile(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(`Fluid cursor shader failed: ${message}`)
  }
  return shader
}

export default function FluidCursor() {
  const canvasRef = useRef(null)
  const dotRef = useRef(null)
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const touchDevice = useMediaQuery('(pointer: coarse)')

  useEffect(() => {
    const canvas = canvasRef.current
    const dot = dotRef.current
    if (reducedMotion || touchDevice) return undefined

    let gl
    let animationFrame
    let program
    let framebuffers = []
    let textures = []
    let buffer
    let frame = 0
    let pointer = { x: -1, y: -1 }
    let cursor = { x: -1, y: -1 }
    let lastPointerTime = 0
    let uniforms

    try {
      gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false })
      if (!gl) return undefined
      program = gl.createProgram()
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertexShader))
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragmentShader))
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(`Fluid cursor program failed: ${gl.getProgramInfoLog(program)}`)
      }

      buffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
      gl.useProgram(program)
      const position = gl.getAttribLocation(program, 'position')
      gl.enableVertexAttribArray(position)
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

      const previousFrame = gl.getUniformLocation(program, 'previousFrame')
      uniforms = {
        pointer: gl.getUniformLocation(program, 'pointer'),
        resolution: gl.getUniformLocation(program, 'resolution'),
        time: gl.getUniformLocation(program, 'time'),
        active: gl.getUniformLocation(program, 'active'),
      }
      gl.uniform1i(previousFrame, 0)

      const resize = () => {
        const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
        const width = Math.max(1, Math.floor(window.innerWidth * ratio))
        const height = Math.max(1, Math.floor(window.innerHeight * ratio))
        canvas.width = width
        canvas.height = height
        gl.viewport(0, 0, width, height)
        textures.forEach((texture) => gl.deleteTexture(texture))
        framebuffers.forEach((target) => gl.deleteFramebuffer(target))
        textures = []
        framebuffers = []
        for (let index = 0; index < 2; index += 1) {
          const texture = gl.createTexture()
          gl.bindTexture(gl.TEXTURE_2D, texture)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
          const target = gl.createFramebuffer()
          gl.bindFramebuffer(gl.FRAMEBUFFER, target)
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
          textures.push(texture)
          framebuffers.push(target)
        }
        framebuffers.forEach((target) => {
          gl.bindFramebuffer(gl.FRAMEBUFFER, target)
          gl.clearColor(0, 0, 0, 0)
          gl.clear(gl.COLOR_BUFFER_BIT)
        })
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      }

      const move = (event) => {
        pointer = { x: event.clientX / window.innerWidth, y: 1 - event.clientY / window.innerHeight }
        lastPointerTime = performance.now()
        dot.style.opacity = '1'
        dot.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`
      }
      const setInteractive = (event) => {
        dot.classList.toggle('is-interactive', Boolean(event.target.closest('a, button, input, textarea, [role="button"]')))
      }
      const clearInteractive = () => dot.classList.remove('is-interactive')

      const render = (now) => {
        frame += 1
        const current = frame % 2
        const previous = 1 - current
        const active = now - lastPointerTime < 1100 ? 1 : 0
        cursor.x += (pointer.x - cursor.x) * 0.14
        cursor.y += (pointer.y - cursor.y) * 0.14
        gl.useProgram(program)
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[current])
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, textures[previous])
        gl.uniform2f(uniforms.pointer, cursor.x, cursor.y)
        gl.uniform2f(uniforms.resolution, canvas.width, canvas.height)
        gl.uniform1f(uniforms.time, now * 0.001)
        gl.uniform1f(uniforms.active, active)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        gl.bindTexture(gl.TEXTURE_2D, textures[current])
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
        animationFrame = requestAnimationFrame(render)
      }

      resize()
      animationFrame = requestAnimationFrame(render)
      window.addEventListener('resize', resize)
      window.addEventListener('pointermove', move, { passive: true })
      window.addEventListener('pointerover', setInteractive, { passive: true })
      window.addEventListener('pointerout', clearInteractive, { passive: true })
      document.body.classList.add('has-fluid-cursor')

      return () => {
        cancelAnimationFrame(animationFrame)
        window.removeEventListener('resize', resize)
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerover', setInteractive)
        window.removeEventListener('pointerout', clearInteractive)
        document.body.classList.remove('has-fluid-cursor')
        textures.forEach((texture) => gl.deleteTexture(texture))
        framebuffers.forEach((target) => gl.deleteFramebuffer(target))
        gl.deleteBuffer(buffer)
        gl.deleteProgram(program)
      }
    } catch (error) {
      console.error(error)
      return undefined
    }
  }, [reducedMotion, touchDevice])

  return (
    <>
      <canvas ref={canvasRef} className="fluid-canvas" aria-hidden="true" />
      <span ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  )
}
