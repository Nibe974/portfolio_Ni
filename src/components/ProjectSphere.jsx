import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Edges, Float, Line, Text } from '@react-three/drei'
import * as THREE from 'three'
import { projects } from '../data/projects'

function Segment({ project, index, highlighted, onHover, onSelect }) {
  const groupRef = useRef()
  const geometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const latitudeSteps = 24
    const longitudeSteps = 12
    const positions = []
    const indices = []
    const start = (index / projects.length) * Math.PI * 2
    const end = ((index + 1) / projects.length) * Math.PI * 2

    for (let lat = 0; lat <= latitudeSteps; lat += 1) {
      const theta = (lat / latitudeSteps) * Math.PI
      for (let lon = 0; lon <= longitudeSteps; lon += 1) {
        const phi = start + (lon / longitudeSteps) * (end - start)
        positions.push(
          Math.sin(theta) * Math.cos(phi),
          Math.cos(theta),
          Math.sin(theta) * Math.sin(phi),
        )
      }
    }
    for (let lat = 0; lat < latitudeSteps; lat += 1) {
      for (let lon = 0; lon < longitudeSteps; lon += 1) {
        const a = lat * (longitudeSteps + 1) + lon
        const b = a + longitudeSteps + 1
        indices.push(a, b, a + 1, b, b + 1, a + 1)
      }
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setIndex(indices)
    geometry.computeVertexNormals()
    return geometry
  }, [index])

  const middlePhi = ((index + 0.5) / projects.length) * Math.PI * 2
  const labelPosition = [Math.cos(middlePhi) * 1.015, 0.16, Math.sin(middlePhi) * 1.015]
  const iconPosition = [Math.cos(middlePhi) * 0.91, 0.39, Math.sin(middlePhi) * 0.91]
  const normal = new THREE.Vector3(Math.cos(middlePhi), 0, Math.sin(middlePhi))
  const labelQuaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal)
  const outlinePoints = useMemo(() => [index / projects.length, (index + 1) / projects.length].map((slice) => {
    const phi = slice * Math.PI * 2
    return Array.from({ length: 33 }, (_, step) => {
      const theta = (step / 32) * Math.PI
      return [
        Math.sin(theta) * Math.cos(phi) * 1.003,
        Math.cos(theta) * 1.003,
        Math.sin(theta) * Math.sin(phi) * 1.003,
      ]
    })
  }), [index])
  const iconGeometry = [
    <boxGeometry key="box" args={[0.14, 0.1, 0.025]} />,
    <sphereGeometry key="sphere" args={[0.065, 16, 16]} />,
    <torusGeometry key="torus" args={[0.052, 0.018, 8, 24]} />,
    <coneGeometry key="cone" args={[0.065, 0.12, 5]} />,
    <cylinderGeometry key="cylinder" args={[0.052, 0.052, 0.1, 8]} />,
    <icosahedronGeometry key="icosahedron" args={[0.07, 0]} />,
    <dodecahedronGeometry key="dodecahedron" args={[0.068, 0]} />,
    <octahedronGeometry key="octahedron" args={[0.073, 0]} />,
  ][index]

  useFrame((_, delta) => {
    const target = highlighted ? 1.07 : 1
    if (groupRef.current) {
      const scale = THREE.MathUtils.damp(groupRef.current.scale.x, target, 9, delta)
      groupRef.current.scale.setScalar(scale)
    }
  })

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <group ref={groupRef}>
      <mesh
        geometry={geometry}
        onPointerOver={(event) => { event.stopPropagation(); onHover(index) }}
        onPointerOut={(event) => { event.stopPropagation(); onHover(null) }}
        onClick={(event) => {
          event.stopPropagation()
          onSelect(project, { x: event.nativeEvent.clientX, y: event.nativeEvent.clientY })
        }}
      >
        <meshStandardMaterial
          color={highlighted ? (index % 2 ? '#FFD60A' : '#FF2E93') : '#ffffff'}
          roughness={0.64}
          metalness={0.04}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[Math.cos(middlePhi) * 1.018, 0, Math.sin(middlePhi) * 1.018]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.4} />
      </mesh>
      {outlinePoints.map((points, boundary) => (
        <Line key={boundary} points={points} color="#0a0a0a" lineWidth={1.5} />
      ))}
      <mesh position={iconPosition} quaternion={labelQuaternion}>
        {iconGeometry}
        <meshStandardMaterial color="#e2e1dc" roughness={0.55} />
        <Edges color="#0a0a0a" threshold={10} />
      </mesh>
      <Text
        position={labelPosition}
        quaternion={labelQuaternion}
        fontSize={0.105}
        maxWidth={0.48}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        color="#0a0a0a"
        outlineWidth={0.003}
        outlineColor="#ffffff"
      >
        {project.title.toUpperCase()}
      </Text>
      <Text
        position={[labelPosition[0], labelPosition[1] - 0.16, labelPosition[2]]}
        quaternion={labelQuaternion}
        fontSize={0.055}
        anchorX="center"
        anchorY="middle"
        color="#5e5e5e"
      >
        ↗ 0{index + 1}
      </Text>
    </group>
  )
}

function SphereScene({ hovered, setHovered, onSelect, dragging, setDragging }) {
  const sphereRef = useRef()
  const velocity = useRef(0)
  const lastX = useRef(0)
  const lastMoveTime = useRef(0)
  const isPointerDown = useRef(false)
  const hasDragged = useRef(false)

  useFrame((_, delta) => {
    if (!sphereRef.current) return
    if (!dragging) {
      sphereRef.current.rotation.y += delta * ((hovered === null ? 0.43 : 0.11) + velocity.current)
      velocity.current *= Math.exp(-delta * 2.7)
    }
    sphereRef.current.rotation.x += (0.03 - sphereRef.current.rotation.x) * delta * 0.7
  })

  const pointerDown = (event) => {
    event.stopPropagation()
    isPointerDown.current = true
    hasDragged.current = false
    setDragging(true)
    lastX.current = event.clientX
    lastMoveTime.current = performance.now()
    event.target.setPointerCapture?.(event.pointerId)
  }
  const pointerMove = (event) => {
    if (!isPointerDown.current) return
    const movement = event.clientX - lastX.current
    if (Math.abs(movement) > 3) hasDragged.current = true
    lastX.current = event.clientX
    if (sphereRef.current) sphereRef.current.rotation.y += movement * 0.008
    const now = performance.now()
    const elapsed = Math.max((now - lastMoveTime.current) / 1000, 1 / 120)
    velocity.current = THREE.MathUtils.clamp((movement * 0.008) / elapsed, -4, 4)
    lastMoveTime.current = now
  }
  const pointerUp = () => {
    isPointerDown.current = false
    setDragging(false)
  }
  const selectProject = (project) => {
    if (hasDragged.current) {
      hasDragged.current = false
      return
    }
    onSelect(project)
  }

  return (
    <group
      ref={sphereRef}
      onPointerDown={pointerDown}
      onPointerMove={pointerMove}
      onPointerUp={pointerUp}
      onPointerCancel={pointerUp}
      onPointerMissed={() => { if (dragging) setDragging(false) }}
    >
      {projects.map((project, index) => (
        <Segment
          key={project.id}
          project={project}
          index={index}
          highlighted={hovered === index}
          onHover={setHovered}
          onSelect={selectProject}
        />
      ))}
      <Float speed={2.2} rotationIntensity={0.12} floatIntensity={0.12}>
        <group position={[0, 0, 1.03]}>
          <mesh position={[-0.13, 0.06, 0]}>
            <sphereGeometry args={[0.072, 18, 18]} />
            <meshBasicMaterial color="#0a0a0a" />
          </mesh>
          <mesh position={[0.13, 0.06, 0]}>
            <sphereGeometry args={[0.072, 18, 18]} />
            <meshBasicMaterial color="#0a0a0a" />
          </mesh>
          <mesh position={[-0.146, 0.082, 0.03]}>
            <sphereGeometry args={[0.023, 12, 12]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0.114, 0.082, 0.03]}>
            <sphereGeometry args={[0.023, 12, 12]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, -0.105, 0]}>
            <torusGeometry args={[0.075, 0.012, 8, 24, Math.PI]} />
            <meshBasicMaterial color="#0a0a0a" />
          </mesh>
        </group>
      </Float>
    </group>
  )
}

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas')
    if (!window.WebGLRenderingContext) return false
    const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    context?.getExtension('WEBGL_lose_context')?.loseContext()
    return Boolean(context)
  } catch {
    return false
  }
}

export default function ProjectSphere({ onSelect }) {
  const [hovered, setHovered] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [webglAvailable, setWebglAvailable] = useState(true)
  const listRef = useRef(null)
  const [focusedIndex, setFocusedIndex] = useState(0)

  useEffect(() => setWebglAvailable(hasWebGL()), [])

  const focusProject = useCallback((index) => {
    const next = (index + projects.length) % projects.length
    setFocusedIndex(next)
    listRef.current?.querySelectorAll('button')[next]?.focus()
  }, [])

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      focusProject(focusedIndex + 1)
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      focusProject(focusedIndex - 1)
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect(projects[focusedIndex])
    }
  }

  return (
    <div className={`sphere-wrap${dragging ? ' is-dragging' : ''}${webglAvailable ? '' : ' is-fallback'}`}>
      {webglAvailable ? (
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 3.55], fov: 40 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          aria-label="An interactive sphere of eight portfolio projects"
        >
          <ambientLight intensity={2.3} />
          <directionalLight position={[4, 5, 6]} intensity={3.5} />
          <pointLight position={[-4, -2, 4]} intensity={0.8} color="#fff4dd" />
          <SphereScene
            hovered={hovered}
            setHovered={setHovered}
            onSelect={onSelect}
            dragging={dragging}
            setDragging={setDragging}
          />
        </Canvas>
      ) : (
        <div className="sphere-fallback">
          <span className="fallback-face" aria-hidden="true">:)</span>
          <p>Eight projects. No WebGL required.</p>
        </div>
      )}
      {hovered !== null && (
        <div className="sphere-tooltip" aria-live="polite">
          {projects[hovered].title}<span> ↗</span>
        </div>
      )}
      <div className="sphere-keyboard-list" ref={listRef} onKeyDown={handleKeyDown}>
        <p className="sr-only">Use the arrow keys to browse projects and Enter to open one.</p>
        {projects.map((project, index) => (
          <button
            key={project.id}
            type="button"
            className="sphere-keyboard-item"
            tabIndex={index === focusedIndex ? 0 : -1}
            onFocus={() => setFocusedIndex(index)}
            onClick={() => onSelect(project)}
          >
            {project.title}
          </button>
        ))}
      </div>
    </div>
  )
}
