import { PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
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
      className="absolute bg-black bg-opacity-50 p-4 border border-orange-300 rounded"
    >
      {props.children}
    </div>
  );
}
