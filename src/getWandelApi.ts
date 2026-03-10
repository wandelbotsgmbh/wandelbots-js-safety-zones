import { NovaClient } from "@wandelbots/nova-js/v2";
import { env } from "./runtimeEnv.ts";

let nova: NovaClient | null = null;

export const getSecureUrl = (url: string): string => {
  if (!url || url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  let hostname = "";
  try {
    const parsed = new URL(
      url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `http://${url}`,
    );
    hostname = parsed.hostname.toLowerCase();
  } catch {
    // Fallback: if URL parsing fails, treat as non-wandelbots and default to http
    return `http://${url}`;
  }

  const isWandelbotsHost =
    hostname === "wandelbots.io" || hostname.endsWith(".wandelbots.io");

  return isWandelbotsHost ? `https://${url}` : `http://${url}`;
};

export const getNovaClient = () => {
  if (!nova) {
    const secureWandelAPIBaseURL = getSecureUrl(env.WANDELAPI_BASE_URL || "");
    console.log(secureWandelAPIBaseURL);
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
    });
  }

  return nova;
};
