// Tags component displays a list of tags as styled badges.
// Props:
// - items: Array of tag strings to display. If empty or undefined, the component renders nothing.
interface Props {
  items?: string[];
}

export default function Tags({ items }: Props) {
  if (!items || !items.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((tag, idx) => (
        <span key={idx} className="px-3 py-1 rounded-full text-blue-600 bg-blue-50 border border-blue-200 text-xs">
          {tag}
        </span>
      ))}
    </div>
  );
}
