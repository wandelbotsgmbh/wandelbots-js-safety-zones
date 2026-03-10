import type { TcpPose } from "@wandelbots/nova-js/v1"
import { type Pose } from "@wandelbots/nova-js/v1"
import type { Pose as PoseV2 } from "@wandelbots/nova-js/v2"
import { type MotionGroupState } from "@wandelbots/nova-js/v1"
import type { MotionGroupState as MotionGroupStateV2 } from "@wandelbots/nova-js/v2"

/**
 * TODO @v2-api as soon as the migration is done, feel free to delete this file
 */
/**
 * Converts v1 Pose-ish objects (position: {x,y,z}) to the v2 shape (position: number[])
 * @param pose
 */
const mapPoseV1ToV2 = (pose: Pose | TcpPose): PoseV2 => {
  if (!pose || typeof pose !== "object") return pose

  const p = pose

  // v1 -> v2 position mapping
  const x = p.position.x ?? 0
  const y = p.position.y ?? 0
  const z = p.position.z ?? 0

  return {
    ...p,
    position: [x, y, z],
  } as PoseV2
}

/**
 * Transforms a v1 MotionGroupState into a v2 MotionGroupState.
 * @param motionState
 */
export const transformIntoV2MotionState = (
  motionState: MotionGroupState,
): MotionGroupStateV2 => {
  const { flange_pose, tcp_pose, ...rest } = motionState

  return {
    ...rest,
    flange_pose: motionState.flange_pose
      ? mapPoseV1ToV2(motionState.flange_pose)
      : undefined,
    tcp_pose: motionState.tcp_pose
      ? mapPoseV1ToV2(motionState.tcp_pose)
      : undefined,
    joint_position: motionState.joint_position.joints,
    joint_torque: motionState.joint_torque?.joints ?? [],
    joint_current: motionState.joint_current?.joints ?? [],
    timestamp: new Date().toISOString(),
    standstill: false,
    sequence_number: parseInt(motionState.sequence_number),
  } as MotionGroupStateV2
}
