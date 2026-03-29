import type { HTMLAttributes } from "react";

type GlassCardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "strong";
};

export function GlassCard({
  className = "",
  variant = "default",
  children,
  ...props
}: GlassCardProps) {
  const base =
    variant === "strong" ? "glass-panel-strong rounded-2xl" : "glass-panel rounded-xl";
  return (
    <div className={`${base} ${className}`} {...props}>
      {children}
    </div>
  );
}
