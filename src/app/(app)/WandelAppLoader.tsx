"use client";

import type {
  ControllerDescription,
  MotionGroupDescription,
} from "@wandelbots/nova-js/v2";
import { observer, useLocalObservable } from "mobx-react-lite";
import { type ReactNode, useEffect } from "react";
import { getNovaClient } from "../../getWandelApi.ts";
import { WandelApp } from "../../WandelApp.ts";
import { WandelAppContext } from "../../WandelAppContext.ts";
import { LoadingScreen } from "./LoadingScreen.tsx";

export const WandelAppLoader = observer((props: { children: ReactNode }) => {
  const nova = getNovaClient();

  const state = useLocalObservable(() => ({
    loading: "Initializing" as string | null,
    mounted: false as boolean,
    error: null as unknown | null,
    wandelApp: null as WandelApp | null,

    finishLoading() {
      state.loading = null;
    },
    nowLoading(message: string) {
      state.loading = message;
    },

    receiveError(error: unknown) {
      console.error(error);
      state.error = error;
    },
  }));

  async function loadWandelApp() {
    state.mounted = true;
    state.nowLoading(`Loading controllers`);

    let controllers: string[] = [];

    try {
      controllers = await nova.api.controller.listRobotControllers();
    } catch (error) {
      throw new Error("Error: No connection to WandelAPI", { cause: error });
    }

    console.log(`Available controllers:\n  `, controllers);

    state.wandelApp = new WandelApp(nova, controllers);

    /**
     * No selected controller and designated motion group, try to
     * select the first available ones
     */
    if (!state.wandelApp.selectedMotionGroupId) {
      const controller = state.wandelApp.controllers?.[0];
      let motionGroup: string | null = null;
      let modelFromController: string | null = null;
      let safetyZones: MotionGroupDescription["safety_zones"] = {};

      if (controller) {
        /**
         * Fetch controller description (for the motionGroup name and controller kind)
         */
        try {
          const controllerDescriptions: ControllerDescription =
            await nova.api.controller.getControllerDescription(controller);
          motionGroup =
            controllerDescriptions.connected_motion_groups[0] ?? null;
        } catch (error) {
          throw new Error(
            "API Error: getControllerDescription, getRobotController requests failed",
            { cause: error },
          );
        }

        /**
         * Fetch motion group description (for the motion_group_model name)
         */
        if (motionGroup) {
          try {
            const motionGroupDescription: MotionGroupDescription =
              await nova.api.motionGroup.getMotionGroupDescription(
                controller,
                motionGroup,
              );
            modelFromController = motionGroupDescription.motion_group_model;
            safetyZones = motionGroupDescription.safety_zones ?? {};
          } catch (error) {
            throw new Error(
              "API Error: getMotionGroupDescription request failed",
              { cause: error },
            );
          }
        }
      }

      /**
       * Carry on, only if all required data is fetched successfully
       * controller - controller name, eg. "abb-irb1200-7"
       * motionGroup - motion group id of the controller, eg. "0@abb-irb1200-7"
       * modelFromController = model name of the motion group, eg. "ABB_1200_07_7"
       */
      if (controller && motionGroup && modelFromController) {
        state.nowLoading(`Configuring motion group`);
        await state.wandelApp.selectMotionGroup(
          controller,
          motionGroup,
          modelFromController,
          safetyZones,
        );
      }
    }
  }

  async function tryLoadWandelApp() {
    try {
      await loadWandelApp();
      state.finishLoading();
    } catch (error) {
      state.receiveError(error);
    }
  }

  useEffect(() => {
    tryLoadWandelApp();
  }, []);

  /**
   * Prevents Next.js hydration mismatches by ensuring client-specific UI only renders after the initial mount.
   * This avoids discrepancies between the server-rendered HTML and the first client-side render caused by immediate state changes.
   */
  if (!state.mounted) {
    return null;
  }

  if (state.loading) {
    return <LoadingScreen message={state.loading} error={state.error} />;
  }

  return (
    <WandelAppContext.Provider value={state.wandelApp}>
      {props.children}
    </WandelAppContext.Provider>
  );
});
