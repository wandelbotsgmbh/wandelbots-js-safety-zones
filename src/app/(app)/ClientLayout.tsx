"use client";

import { ThemeProvider } from "@mui/system";
import { createNovaMuiTheme } from "@wandelbots/wandelbots-js-react-components";
import { env as runtimeEnv } from "../../runtimeEnv.ts";
import { WandelAppLoader } from "./WandelAppLoader.tsx";

export function ClientLayout({
  env,
  children,
}: Readonly<{
  env: Record<string, string | undefined>;
  children: React.ReactNode;
}>) {
  console.log("Runtime ENV from server:\n  ", env);
  Object.assign(runtimeEnv, env);

  const theme = createNovaMuiTheme({});

  return (
    <ThemeProvider theme={theme}>
      <WandelAppLoader>{children}</WandelAppLoader>
    </ThemeProvider>
  );
}
