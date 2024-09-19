import { Grid, OrbitControls, Reflector, SoftShadows } from "@react-three/drei"

import { Canvas } from "@react-three/fiber"
import React from "react"
import { Euler, Object3D, Vector3 } from "three"
import { WebGLRenderer } from "three"
import { isIOS, isSafari } from "react-device-detect"

import { PresetEnvironment } from "@wandelbots/wandelbots-js-react-components"
import { Robot } from "@wandelbots/wandelbots-js-react-components"
import { SupportedRobot } from "@wandelbots/wandelbots-js-react-components"
import { SafetyZonesRenderer } from "@wandelbots/wandelbots-js-react-components"
import { useActiveRobot } from "@/WandelAppContext"
import type { SafetySetupSafetyZone } from "@wandelbots/wandelbots-api-client"

export function SafetyZones3DCanvas() {
  Object3D.DEFAULT_UP = new Vector3(0, 0, 1)
  const activeRobot = useActiveRobot()

  const antialias = !(isSafari && isIOS)

  const { gridSize, ...gridConfig } = {
    gridSize: [200, 200],
    sectionSize: 0.25,
    sectionThickness: 1.0,
    sectionColor: "#6278a2",
    fadeDistance: 9,
    fadeStrength: 2,
    followCamera: false,
    infiniteGrid: true,
  }

  return (
    <>
      <Canvas
        frameloop="demand"
        flat={true}
        shadows
        camera={{
          position: [-2, 1, 1],
          rotation: new Euler(0, 0, 0),
          fov: 25,
        }}
        resize={{ debounce: 0, scroll: false }}
        gl={(canvas) => {
          const renderer = new WebGLRenderer({
            canvas,
            antialias: antialias,
            alpha: true,
          })
          canvas.addEventListener("webglcontextlost", (event) => {
            event.preventDefault()
            //window.location.reload()
          })
          return renderer
        }}
      >
        <color attach="background" args={["#303b51"]} />

        <SafetyZonesRenderer
          safetyZones={activeRobot.safetyZones as SafetySetupSafetyZone[]}
        />

        <group position={[0, 0, -0]} rotation={[Math.PI / 2, -Math.PI / 3, 0]}>
          <Robot connectedMotionGroup={activeRobot} />
          <group
            position={[0, 0, 0.01]}
            rotation={[-Math.PI / 2, -Math.PI * 2, 0]}
          >
            <Grid
              position={[0, 0, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              args={
                gridSize as
                  | [
                      width?: number | undefined,
                      height?: number | undefined,
                      widthSegments?: number | undefined,
                      heightSegments?: number | undefined,
                    ]
                  | undefined
              }
              {...gridConfig}
            />

            <OrbitControls />
            <PresetEnvironment />
          </group>
        </group>
      </Canvas>
    </>
  )
}
