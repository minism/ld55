import { PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
  title?: string;
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export default function FloatingPanel(props: Props) {
  return (
    <div
      style={{
        top: props.top,
        right: props.right,
        bottom: props.bottom,
        left: props.left,
      }}
      className="absolute bg-black bg-opacity-50 border border-orange-300 rounded"
    >
      {props.title ? (
        <div className="p-2 bg-gradient-to-b from-amber-700 to-orange-800">
          {props.title}
        </div>
      ) : null}
      <div className="p-4">{props.children}</div>
    </div>
  );
}
