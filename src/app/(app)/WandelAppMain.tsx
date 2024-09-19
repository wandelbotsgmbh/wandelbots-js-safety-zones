"use client"

import { env } from "../../runtimeEnv"
import { observer } from "mobx-react-lite"
import { useWandelApp } from "../../WandelAppContext"
import { LoadingScreen } from "./LoadingScreen"
import { SafetyZones } from "../../templates/SafetyZones/SafetyZones"
import { NoMotionGroupModal } from "@wandelbots/wandelbots-js-react-components"

export const WandelAppMain = observer(() => {
  const wandelApp = useWandelApp()

  if (!wandelApp.motionGroupOptions.length) {
    // No robots (virtual or otherwise)! We can't do much without a robot.
    return <NoMotionGroupModal baseUrl={env.WANDELAPI_BASE_URL} />
  }

  // Everything below this point expects an active robot
  if (!wandelApp.activeRobot) {
    return <LoadingScreen />
  }

  return (
    <>
      {/* add your code here */}
      <SafetyZones />
    </>
  )
})
