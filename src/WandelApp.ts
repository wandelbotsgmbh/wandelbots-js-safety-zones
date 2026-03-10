import { tryParseJson } from "@wandelbots/nova-js";
import type {
  MotionGroupDescription,
  NovaClient,
  RobotControllerState,
} from "@wandelbots/nova-js/v2";
import { makeAutoObservable } from "mobx";

import { ActiveRobot } from "@/ActiveRobot";

/**
 * Main store for the current state of the robot pad.
 */
export class WandelApp {
  controller: string | null = null;
  selectedMotionGroupId: string | null = null;
  modelFromController: string | null = null;

  /**
   * Represents the current state of the selected motion group
   * after setup and websocket connection */
  activeRobot: ActiveRobot | null = null;

  constructor(
    readonly nova: NovaClient,
    readonly controllers: string[],
  ) {
    (window as any).wandelApp = this;
    makeAutoObservable(this);
  }

  async selectMotionGroup(
    controller: string,
    motionGroupId: string,
    modelFromController: string,
    safetyZones: MotionGroupDescription["safety_zones"],
  ) {
    this.controller = controller;
    this.selectedMotionGroupId = motionGroupId;
    this.modelFromController = modelFromController;

    if (controller && motionGroupId && modelFromController) {
      /**
       * Open the websocket to monitor controller state for e.g. e-stop
       */
      const controllerStateSocket = this.nova.openReconnectingWebsocket(
        `/controllers/${controller}/state-stream`,
      );

      /**
       * Wait for the first message to get the initial state
       */
      const firstControllerMessage = await controllerStateSocket.firstMessage();
      const initialControllerState = tryParseJson(firstControllerMessage.data)
        ?.result as RobotControllerState;

      /**
       * Wait for the kinematic model of the robot before setting it as active
       * and triggering the render
       */
      const activeRobot = new ActiveRobot(
        this.nova,
        modelFromController,
        motionGroupId,
        initialControllerState,
        controllerStateSocket,
        safetyZones,
      );

      await activeRobot.fetchKinematicModel(this.modelFromController);

      this.activeRobot = activeRobot;
    }
  }
}
