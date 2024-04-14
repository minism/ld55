interface Props {
  amount: number;
  color: string;
}

export default function FillBar(props: Props) {
  const width = `${Math.floor(props.amount * 100)}%`;
  return (
    <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-600">
      <div className={`h-4 ${props.color}`} style={{ width }} />
    </div>
  );
}
