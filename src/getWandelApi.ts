import { NovaClient } from "@wandelbots/wandelbots-js"
import { env } from "./runtimeEnv"
import type { AxiosRequestConfig } from "axios"

let nova: NovaClient | null = null

export const getNovaClient = () => {
  if (!nova) {
    nova = new NovaClient({
      instanceUrl:
        typeof window !== "undefined"
          ? new URL(env.WANDELAPI_BASE_URL || "", window.location.origin).href
          : env.WANDELAPI_BASE_URL || "",
      cellId: env.CELL_ID || "cell",
      username: env.NOVA_USERNAME || "",
      password: env.NOVA_PASSWORD || "",
      baseOptions: {
        // Time out after 30 seconds
        timeout: 30000,
      },
    })
  }

  return nova
}
