import { HTMLProps } from "react";

export const ButtonLink = (props: HTMLProps<HTMLAnchorElement>) => (
  <a
    className="rounded-md bg-amber-800 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
    {...props}
  >
    {props.children}
  </a>
);
