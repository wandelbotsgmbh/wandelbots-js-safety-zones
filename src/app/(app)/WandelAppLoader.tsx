"use client"

import { getNovaClient, getNovaClientV2 } from "../../getWandelApi"
import { observer, useLocalObservable } from "mobx-react-lite"
import { useEffect, type ReactNode } from "react"
import { LoadingScreen } from "./LoadingScreen"
import { WandelApp } from "../../WandelApp"
import { WandelAppContext } from "../../WandelAppContext"
import type {
  ControllerDescription,
  MotionGroupDescription,
  RobotController,
} from "@wandelbots/nova-js/v2"

export const WandelAppLoader = observer((props: { children: ReactNode }) => {
  const nova = getNovaClient()
  const novaV2 = getNovaClientV2()

  const state = useLocalObservable(() => ({
    loading: "Initializing" as string | null,
    mounted: false as boolean,
    error: null as unknown | null,
    wandelApp: null as WandelApp | null,

    finishLoading() {
      state.loading = null
    },

    nowLoading(message: string) {
      state.loading = message
    },

    receiveError(error: unknown) {
      console.error(error)
      state.error = error
    },
  }))

  async function loadWandelApp() {
    state.nowLoading(`Loading controllers`)

    let controllers: string[] = []

    let controllersRes
    try {
      controllers = await novaV2.api.controller.listRobotControllers()

      controllersRes = await nova.api.controller.listControllers()
    } catch (error) {
      console.error("Error: No connection to WandelAPI")
    }

    const availableControllers = controllersRes?.instances || []

    console.log(`Available controllers:\n  `, availableControllers)

    state.wandelApp = new WandelApp(novaV2, controllers)

    /**
     * No selected controller and designated motion group, try to
     * select the first available ones
     */
    if (!state.wandelApp.selectedMotionGroupId) {
      // TODO select first one (index = 0)
      const controller = state.wandelApp.controllers?.[4]
      let motionGroup: string | null = null
      let modelFromController: string | null = null
      let controllerKind: string | null = null
      let safetyZones: MotionGroupDescription['safety_zones'] | null = null

      if (controller) {
        /**
         * Fetch controller description (for the motionGroup name and controller kind)
         */
        try {
          const controllerDescriptions: ControllerDescription =
            await novaV2.api.controller.getControllerDescription(controller)
          motionGroup =
            controllerDescriptions.connected_motion_groups[0] ?? null

          const controllerDetails: RobotController =
            await novaV2.api.controller.getRobotController(controller)
          controllerKind = controllerDetails.configuration.kind
        } catch (error) {
          throw new Error(
            "API Error: getControllerDescription, getRobotController requests failed",
          )
        }

        /**
         * Fetch motion group description (for the motion_group_model name)
         */
        if (motionGroup) {
          try {
            const motionGroupDescription: MotionGroupDescription =
              await novaV2.api.motionGroup.getMotionGroupDescription(
                controller,
                motionGroup,
              )
            modelFromController = motionGroupDescription.motion_group_model
            safetyZones = motionGroupDescription.safety_zones ?? null
          } catch (error) {
            throw new Error(
              "API Error: getMotionGroupDescription request failed",
            )
          }
        }
      }

      /**
       * Carry on, only if all required data is fetched successfully
       * controller - controller name, eg. "abb-irb1200-7"
       * motionGroup - motion group id of the controller, eg. "0@abb-irb1200-7"
       * modelFromController = model name of the motion group, eg. "ABB_1200_07_7"
       * controllerKind = type of controller, eg. "VirtualController"
       */
      if (controller && motionGroup && modelFromController && controllerKind) {
        state.nowLoading(`Configuring motion group`)
        await state.wandelApp.selectMotionGroup(
          controller,
          controllerKind,
          motionGroup,
          modelFromController,
          safetyZones,
        )
      }
    }
  }

  async function tryLoadWandelApp() {
    try {
      await loadWandelApp()
      state.finishLoading()
    } catch (error) {
      state.receiveError(error)
    }
  }

  useEffect(() => {
    state.mounted = true
    tryLoadWandelApp()
  }, [])

  /**
   * Prevents Next.js hydration mismatches by ensuring client-specific UI only renders after the initial mount.
   * This avoids discrepancies between the server-rendered HTML and the first client-side render caused by immediate state changes.
   */
  if (!state.mounted) {
    return <></>
  }

  if (state.loading) {
    return <LoadingScreen message={state.loading} error={state.error} />
  }

  return (
    <WandelAppContext.Provider value={state.wandelApp}>
      {props.children}
    </WandelAppContext.Provider>
  )
})
