import { PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
  transparent?: boolean;
  title?: string;
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export default function FloatingPanel(props: Props) {
  const color = props.transparent
    ? "bg-black bg-opacity-50"
    : "bg-gradient-to-b from-amber-950 to-yellow-950";

  return (
    <div
      style={{
        top: props.top,
        right: props.right,
        bottom: props.bottom,
        left: props.left,
      }}
      className={`absolute rounded-lg border border-amber-600 ${color} `}
    >
      {props.title ? (
        <div className="py-2 px-4 rounded-t-lg bg-gradient-to-b from-amber-700 to-orange-800">
          {props.title}
        </div>
      ) : null}
      <div className="p-4">{props.children}</div>
    </div>
  );
}
