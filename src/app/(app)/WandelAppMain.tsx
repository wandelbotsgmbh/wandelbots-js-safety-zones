"use client";

import { NoMotionGroupModal } from "@wandelbots/wandelbots-js-react-components";
import { observer } from "mobx-react-lite";
import { getSecureUrl } from "@/getWandelApi";
import { env } from "@/runtimeEnv";
import { SafetyZones } from "@/templates/SafetyZones/SafetyZones";
import { useWandelApp } from "@/WandelAppContext";
import { LoadingScreen } from "./LoadingScreen.tsx";

export const WandelAppMain = observer(() => {
  const wandelApp = useWandelApp();

  if (!wandelApp.controllers.length) {
    // No robots (virtual or otherwise)! We can't do much without a robot.
    return (
      <NoMotionGroupModal
        baseUrl={getSecureUrl(env.WANDELAPI_BASE_URL || "")}
      />
    );
  }

  // Everything below this point expects an active robot
  if (!wandelApp.activeRobot) {
    return <LoadingScreen />;
  }

  return (
    <>
      {/* add your code here */}
      <SafetyZones />
    </>
  );
});
