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
        "rounded-2xl px-4 py-3 text-base font-bold transition disabled:cursor-not-allowed disabled:opacity-40 md:px-5 md:py-3.5",
        variant === "primary" &&
          "text-white shadow-lg hover:opacity-90",
        variant === "secondary" &&
          "border border-white/10 bg-white/5 text-white/80 hover:bg-white/10",
        variant === "success" &&
          "border-2 border-green-400/40 text-[#4ade80]",
        variant === "danger" &&
          "border-2 border-red-400/40 text-[#f87171]",
        variant === "ghost" &&
          "bg-transparent text-white/40 hover:text-white/70",
        className
      )}
      style={
        variant === "primary"
          ? {
              background: "linear-gradient(135deg, #a78bfa, #8b5cf6)",
              boxShadow: "0 8px 25px rgba(167,139,250,0.35)",
            }
          : variant === "success"
            ? {
                background:
                  "linear-gradient(135deg, rgba(74,222,128,0.2), rgba(74,222,128,0.08))",
              }
            : variant === "danger"
              ? {
                  background:
                    "linear-gradient(135deg, rgba(248,113,113,0.2), rgba(248,113,113,0.08))",
                }
              : undefined
      }
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
        "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-base text-white placeholder:text-white/25 outline-none transition focus:border-[#a78bfa]/50 focus:ring-2 focus:ring-[#a78bfa]/20 md:px-5",
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
    <div className={clsx("glass-panel p-4 md:p-6", className)}>
      {children}
    </div>
  );
}