import { type ButtonHTMLAttributes } from "react";

const variants = {
  primary: "bg-signal text-white hover:brightness-95",
  secondary: "border border-edge bg-surface text-ink hover:bg-ground",
  // Destructive actions never rely on a red — they stay distinguishable by
  // their label/icon and darken on hover (foundation §4: color never
  // carries state alone).
  danger: "border border-edge text-ink-muted hover:text-ink hover:bg-ground",
} as const;

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
}) {
  return (
    <button
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
