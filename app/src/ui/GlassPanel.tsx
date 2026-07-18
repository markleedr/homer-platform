// A frosted glass surface (PRD 8e): translucent white, backdrop blur, light top
// edge, soft floating shadow. The base panel primitive other surfaces build on.

import type { HTMLAttributes, ReactNode } from "react";

export function GlassPanel({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={["glass", className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </div>
  );
}
