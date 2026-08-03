import type { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  href: string;
  variant?: "primary" | "secondary";
  size?: "small" | "medium" | "large";
};

export default function Button({
  children,
  href,
  variant = "primary",
  size = "medium",
}: ButtonProps) {
  return (
    <a href={href} className={`button button-${variant} button-${size}`}>
      {children}
    </a>
  );
}
