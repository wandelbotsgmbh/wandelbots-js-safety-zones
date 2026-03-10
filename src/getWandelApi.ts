import { NovaClient } from "@wandelbots/nova-js/v1"
import { NovaClient as NovaClientV2 } from "@wandelbots/nova-js/v2"
import { env } from "./runtimeEnv"

let nova: NovaClient | null = null
let novaV2: NovaClientV2 | null = null

export const getSecureUrl = (url: string): string => {
    if (!url) {
        return url;
    }
    return url.startsWith('http://') || url.startsWith('https://') 
      ? url 
      : url.includes('wandelbots.io') 
        ? `https://${url}` 
        : `http://${url}`;
}

export const getNovaClient = () => {
  if (!nova) {
    const secureWandelAPIBaseURL = getSecureUrl(env.WANDELAPI_BASE_URL || "");
    console.log(secureWandelAPIBaseURL)
    nova = new NovaClient({
      instanceUrl:
        typeof window !== "undefined"
          ? new URL(secureWandelAPIBaseURL || "", window.location.origin).href
          : secureWandelAPIBaseURL || "",
      cellId: env.CELL_ID || "cell",
      username: env.NOVA_USERNAME || "",
      password: env.NOVA_PASSWORD || "",
      accessToken: env.NOVA_ACCESS_TOKEN || "",
      baseOptions: {
        // Time out after 30 seconds
        timeout: 30000,
      },
    })
  }

  return nova
}

export const getNovaClientV2 = () => {
  if (!novaV2) {
    const secureWandelAPIBaseURL = getSecureUrl(env.WANDELAPI_BASE_URL || "")
    console.log(secureWandelAPIBaseURL)
    novaV2 = new NovaClientV2({
      instanceUrl:
        typeof window !== "undefined"
          ? new URL(secureWandelAPIBaseURL || "", window.location.origin).href
          : secureWandelAPIBaseURL || "",
      cellId: env.CELL_ID || "cell",
      username: env.NOVA_USERNAME || "",
      password: env.NOVA_PASSWORD || "",
      accessToken: env.NOVA_ACCESS_TOKEN || "",
      baseOptions: {
        // Time out after 30 seconds
        timeout: 30000,
      },
    })
  }

  return novaV2
}

