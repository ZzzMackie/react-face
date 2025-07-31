import { extend, ThreeElement, useThree } from '@react-three/fiber'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Camera } from 'three'

declare module '@react-three/fiber' {
  interface ThreeElements {
    orbitControls: ThreeElement<typeof OrbitControls>
  }
}

extend({ OrbitControls })

interface ControlsProps {
    enablePan?: boolean, 
    enableZoom?: boolean, 
    enableRotate?: boolean,
    enableDamping?: boolean
}

export default function Controls(props: ControlsProps) {
  // Will only initialize when tree is connected to screen
  const camera:Camera = useThree((state) => state.camera) as unknown as Camera
  const gl = useThree((state) => state.gl)
  const {
    enablePan = true,
    enableZoom = true,
    enableRotate = true,
    enableDamping = true
  } = props
  // Will only initialize when tree is connected to screen
  return <orbitControls enableDamping={enableDamping} enablePan={enablePan} enableZoom={enableZoom} enableRotate={enableRotate} 
  args={[camera, gl.domElement]} />
}

