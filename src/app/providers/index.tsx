"use client";

import { ReactNode } from "react";
import Auth0Provider from "./auth0-provider";

export default function Providers({ children }: { children: ReactNode }) {
  return <Auth0Provider>{children}</Auth0Provider>;
}
