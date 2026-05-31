import type { ReactNode } from "react";
import { navigate } from "../lib/router";

export const Link = ({ children, className, to }: { children: ReactNode; className?: string; to: string }) => (
  <a
    className={className}
    href={to}
    onClick={(event) => {
      event.preventDefault();
      navigate(to);
    }}
  >
    {children}
  </a>
);
