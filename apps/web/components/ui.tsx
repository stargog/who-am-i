import { clsx } from "clsx";
import type { ButtonHTMLAttributes, InputHTMLAttributes } from "react";

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "success" | "danger" | "ghost";
}) {
  return (
    <button
      className={clsx(
        "rounded-xl px-4 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "bg-[var(--accent)] text-[#1a1200] hover:bg-[var(--accent-hover)]",
        variant === "secondary" &&
          "border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)]",
        variant === "success" && "bg-[var(--success)] text-white",
        variant === "danger" && "bg-[var(--danger)] text-white",
        variant === "ghost" &&
          "bg-transparent text-[var(--muted)] hover:text-[var(--text)]",
        className
      )}
      {...props}
    />
  );
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        "w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none",
        className
      )}
      {...props}
    />
  );
}

export function Panel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4",
        className
      )}
    >
      {children}
    </div>
  );
}
