// Pill / badge (PRD 8b). Inline-flex, centred, no mid-pill wrap: shorten the
// label rather than let it wrap. Semantic tones appear only as tinted glass.

import type { ReactNode } from "react";
import { Icon, type IconName } from "./icons";

type Tone = "info" | "warn" | "ok" | "mute";

export function Pill({
  tone = "mute",
  icon,
  children,
}: {
  tone?: Tone;
  icon?: IconName;
  children: ReactNode;
}) {
  return (
    <span className={`pill pill-${tone}`}>
      {icon ? <Icon name={icon} /> : null}
      {children}
    </span>
  );
}
