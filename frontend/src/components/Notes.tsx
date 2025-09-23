// Notes component displays a note text in a styled box.
// Props:
// - text: The note text to display. If null or undefined, the component renders nothing.

interface Props {
  text?: string | null;
}

export default function Notes({ text }: Props) {
  if (!text) return null;

  return <div className="p-4 rounded-xl bg-yellow-50 text-yellow-800 text-sm">{text}</div>;
}
