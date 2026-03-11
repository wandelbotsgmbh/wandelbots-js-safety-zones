import {
  JointTypeEnum,
  type DHParameter,
  type KinematicModel,
  type MotionGroupState,
  type NovaClient,
  type RobotControllerState,
} from "@wandelbots/nova-js/v2"
import {
  tryParseJson,
  type AutoReconnectingWebsocket,
} from "@wandelbots/nova-js"
import { makeAutoObservable, runInAction } from "mobx"
import { jointValuesEqual } from "@wandelbots/wandelbots-js-react-components"

const MOTION_DELTA_THRESHOLD = 0.0001

export interface SocketMessage {
  receivedAt: number
  data: RobotControllerState
}

export class ActiveRobot {
  /**
   * Last motion state received for this motion group; changes very fast
   * when robot is in motion
   */
  rapidlyChangingMotionState: MotionGroupState = {} as any

  dhParameters: DHParameter[] = []

  inverseSolver: string | null | undefined

  jointType: JointTypeEnum = JointTypeEnum.RevoluteJoint

  /**
   * Last valid state message received from the controller
   * state socket
   */
  lastValidStateMessage: SocketMessage
  lastInvalidStateMessage: SocketMessage | null = null

  constructor(
    readonly nova: NovaClient,
    readonly modelFromController: string,
    readonly motionGroupId: string,
    readonly controllerKind: string,
    readonly initialControllerState: RobotControllerState,
    readonly controllerStateSocket: AutoReconnectingWebsocket,
  ) {
    /**
     * Setting the rapidly changing motion state including all position data
     * of the rendered robot
     */
    this.rapidlyChangingMotionState =
      this.initialControllerState.motion_groups.find(
        (mg) => mg.motion_group === motionGroupId,
      )!

    /**
     * Setting initial state of last valid state message in order to determine
     * whether the data should be updated and overwritten by the last message
     */
    this.lastValidStateMessage = {
      receivedAt: Date.now(),
      data: initialControllerState,
    }

    /**
     * Make this class auto observable for the react components to be
     * able to recognize newest changes to the attributes
     *
     * Moved after initialization of initial states of the variables for
     * the components to be able to pick up any changes (the call place
     * of the makeAutoObservable function is important)
     */
    makeAutoObservable(this, {}, { autoBind: true })

    /**
     * Track controller state stream -- includes motion data for the robot
     * as well as safety state and operation mode
     */
    controllerStateSocket.addEventListener("message", (event) => {
      const data = tryParseJson(event.data)?.result

      if (!data || !data.motion_groups) {
        runInAction(() => {
          this.lastInvalidStateMessage = {
            receivedAt: Date.now(),
            data: event.data,
          }
        })
        return
      }

      runInAction(() => {
        this.lastValidStateMessage = {
          receivedAt: Date.now(),
          data,
        }
      })

      const newMotionState = data.motion_groups.find(
        (mg) => mg.motion_group === this.motionGroupId,
      )

      if (!newMotionState) {
        runInAction(() => {
          this.lastInvalidStateMessage = {
            receivedAt: Date.now(),
            data: event.data,
          }
        })
        return
      }

      const shouldUpdate = !jointValuesEqual(
        this.rapidlyChangingMotionState.joint_position,
        newMotionState.joint_position,
        MOTION_DELTA_THRESHOLD,
      )

      // handle motionState message
      if (shouldUpdate) {
        runInAction(() => {
          this.rapidlyChangingMotionState = newMotionState
        })
      }
    })
  }

  get isVirtual() {
    return this.controllerKind === "VirtualController"
  }

  get controllerState() {
    return this.lastValidStateMessage.data
  }

  /**
   * Fetches the kinematic model for the motion group from the API.
   */
  async fetchKinematicModel(modelFromController: string) {
    try {
      const { inverse_solver, dh_parameters }: KinematicModel =
        await this.nova.api.motionGroupModels.getMotionGroupKinematicModel(
          modelFromController!,
        )

      runInAction(() => {
        this.inverseSolver = inverse_solver

        this.dhParameters = dh_parameters ?? []

        if (dh_parameters?.length) {
          this.jointType = dh_parameters[0]?.type as JointTypeEnum
        }
      })
    } catch (err) {
      console.warn(
        `Failed to fetch kinematic model from API for ${modelFromController}, falling back to local config`,
      )
    }
  }
}
