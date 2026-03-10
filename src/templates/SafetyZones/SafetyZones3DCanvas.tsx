import { Grid, OrbitControls } from "@react-three/drei";

import { Canvas } from "@react-three/fiber";
import { JointTypeEnum } from "@wandelbots/nova-js/v2";
import {
  MotionGroupVisualizer,
  PresetEnvironment,
  SafetyZonesRenderer,
} from "@wandelbots/wandelbots-js-react-components";
import { observer } from "mobx-react-lite";
import { isIOS, isSafari } from "react-device-detect";
import { Euler, Object3D, Vector3, WebGLRenderer } from "three";
import { getSecureUrl } from "@/getWandelApi";
import { env } from "@/runtimeEnv";
import { useActiveRobot } from "@/WandelAppContext";

export const SafetyZones3DCanvas = observer(() => {
  Object3D.DEFAULT_UP = new Vector3(0, 0, 1);
  const activeRobot = useActiveRobot();

  const antialias = !(isSafari && isIOS);

  const { gridSize, ...gridConfig } = {
    gridSize: [200, 200],
    sectionSize: 0.25,
    sectionThickness: 1.0,
    sectionColor: "#6278a2",
    fadeDistance: 9,
    fadeStrength: 2,
    followCamera: false,
    infiniteGrid: true,
  };

  const rotationOffset: Euler = new Euler(Math.PI / 2, 0, 0);
  if (activeRobot.jointType === JointTypeEnum.PrismaticJoint) {
    rotationOffset.x = -Math.PI / 2;
    rotationOffset.y = 0;
    rotationOffset.z = -Math.PI / 2;
  }

  return (
    <Canvas
      frameloop="demand"
      flat={true}
      shadows
      camera={{
        position: [3.3246, -3.6538, 3.2033],
        fov: 25,
      }}
      resize={{ debounce: 0, scroll: false }}
      gl={(props) => {
        const renderer = new WebGLRenderer({
          ...props,
          antialias: antialias,
          alpha: true,
        });
        renderer.domElement.addEventListener("webglcontextlost", (event) => {
          event.preventDefault();
          //window.location.reload()
        });
        return renderer;
      }}
    >
      <color attach="background" args={["#303b51"]} />

      <group position={[0, 0, -0]}>
        {activeRobot.safetyZones && (
          <SafetyZonesRenderer safetyZones={activeRobot.safetyZones} />
        )}

        <group rotation={rotationOffset}>
          <MotionGroupVisualizer
            rapidlyChangingMotionState={activeRobot.rapidlyChangingMotionState}
            modelFromController={activeRobot.modelFromController}
            dhParameters={activeRobot.dhParameters}
            instanceUrl={getSecureUrl(env.WANDELAPI_BASE_URL || "")}
            inverseSolver={activeRobot.inverseSolver}
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

            <directionalLight
              position={[-4, 1, 4]}
              castShadow
              intensity={1}
            ></directionalLight>
          </group>
        </group>
      </group>
      <OrbitControls />
      <PresetEnvironment />
    </Canvas>
  );
});
