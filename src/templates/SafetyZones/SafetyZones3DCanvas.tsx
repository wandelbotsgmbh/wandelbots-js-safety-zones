import { Grid, OrbitControls } from "@react-three/drei"

import { Canvas } from "@react-three/fiber"
import React, { useMemo } from "react"
import { Euler, Object3D, Vector3 } from "three"
import { WebGLRenderer } from "three"
import { isIOS, isSafari } from "react-device-detect"

import {
  MotionGroupVisualizer,
  PresetEnvironment,
  type SupportedLinearAxisProps,
  type SupportedRobotProps,
} from "@wandelbots/wandelbots-js-react-components"
import { Robot } from "@wandelbots/wandelbots-js-react-components"
import { SafetyZonesRenderer } from "@wandelbots/wandelbots-js-react-components"
import { useActiveRobot } from "@/WandelAppContext"
import type { SafetySetupSafetyZone } from "@wandelbots/nova-api/v1"
import { observer } from "mobx-react-lite"
import { transformIntoV2MotionState } from "@/utils/transformIntoV2MotionState"
import { env } from "@/runtimeEnv"
import { getSecureUrl } from "@/getWandelApi"

export const SafetyZones3DCanvas = observer(() => {
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

  const motionProps = useMemo<
    SupportedRobotProps | SupportedLinearAxisProps
  >(() => {
    return {
      rapidlyChangingMotionState: transformIntoV2MotionState(
        activeRobot.rapidlyChangingMotionState.state,
      ),
      modelFromController: activeRobot.modelFromController || "",
      dhParameters: activeRobot.dhParameters as any,
    }
  }, [activeRobot.rapidlyChangingMotionState])

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
        gl={(props) => {
          const renderer = new WebGLRenderer({
            ...props,
            antialias: antialias,
            alpha: true,
          })
          renderer.domElement.addEventListener("webglcontextlost", (event) => {
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
          <MotionGroupVisualizer
            instanceUrl={getSecureUrl(env.WANDELAPI_BASE_URL || "")}
            inverseSolver={null}
            {...motionProps}
          />
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
})
