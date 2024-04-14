import { PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
  transparent?: boolean;
  color?: string;
  headerColor?: string;
  borderColor?: string;
  title?: string;
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export default function FloatingPanel(props: Props) {
  const color = props.color
    ? props.color
    : props.transparent
    ? "bg-black bg-opacity-50"
    : "bg-gradient-to-b from-amber-950 to-yellow-950";
  const borderColor = props.borderColor ?? "border-amber-600";
  const headerColor =
    props.headerColor ?? "bg-gradient-to-b from-amber-700 to-orange-800";

  return (
    <div
      style={{
        top: props.top,
        right: props.right,
        bottom: props.bottom,
        left: props.left,
      }}
      className={`absolute rounded-lg border ${borderColor} ${color} `}
    >
      {props.title ? (
        <div className={`py-2 px-4 rounded-t-lg ${headerColor}`}>
          {props.title}
        </div>
      ) : null}
      <div className="p-4">{props.children}</div>
    </div>
  );
}
