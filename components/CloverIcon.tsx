import type { ComponentPropsWithoutRef } from "react";

export function CloverIcon({ className = "", ...props }: ComponentPropsWithoutRef<"span">) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center leading-none ${className}`.trim()}
      {...props}
    >
      ☘︎
    </span>
  );
}
