import { PropsWithChildren } from "react";

// Weird type issue here
export default function GameButton(props: PropsWithChildren & any) {
  return (
    <button
      {...props}
      className="rounded-md bg-gradient-to-b from-amber-700 to-orange-800 px-3 py-2 text-lg font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500"
    >
      {props.children}
    </button>
  );
}
