// One button component, three variants (PRD 8b):
//   primary: centred, filled, single line, at most one per screen.
//   list:    fixed 22px icon slot left, label column that wraps without moving
//            the icon, optional secondary line.
//   ghost:   centred, muted, escape hatches.

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon, type IconName } from "./icons";

type Variant = "primary" | "list" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  icon?: IconName;
  // Second, lighter line, used by the list variant only.
  secondary?: ReactNode;
};

export function Button({
  variant = "ghost",
  icon,
  secondary,
  children,
  className,
  type = "button",
  ...rest
}: ButtonProps) {
  const cls = ["btn", `btn-${variant}`, className].filter(Boolean).join(" ");

  if (variant === "list") {
    return (
      <button type={type} className={cls} {...rest}>
        <span className="btn-icon">{icon ? <Icon name={icon} /> : null}</span>
        <span className="btn-label">
          <span className="lead">{children}</span>
          {secondary ? <span className="sub">{secondary}</span> : null}
        </span>
      </button>
    );
  }

  return (
    <button type={type} className={cls} {...rest}>
      {icon ? (
        <span className="btn-icon">
          <Icon name={icon} />
        </span>
      ) : null}
      {children}
    </button>
  );
}
