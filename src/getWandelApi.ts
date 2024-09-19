import { NovaClient } from "@wandelbots/wandelbots-js"
import { env } from "./runtimeEnv"

let nova: NovaClient | null = null

const getSecureUrl = (url: string): string => {
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
      baseOptions: {
        // Time out after 30 seconds
        timeout: 30000,
      },
    })
  }

  return nova
}
