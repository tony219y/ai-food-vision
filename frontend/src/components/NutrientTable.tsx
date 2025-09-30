// NutrientTable component displays a table of nutrient name-value pairs.
// Props:
// - data: Array of [name, value] pairs to display.
// - naText: Optional text to show if value is undefined (default: "N/A").

type NutrientPair = Array<string | number | undefined>

interface Props {
  data: NutrientPair[];
  naText?: string;
}

export default function NutrientTable({ data, naText = "N/A" }: Props) {
  if (!data || !data.length) return null;

  return (
    <div className="bg-white rounded-2xl shadow-[0_6px_28px_rgba(0,0,0,0.08)] ring-1 ring-black/5 overflow-hidden">
      <div className="bg-blue-600 text-white px-6 py-3 font-semibold flex items-center justify-between">
        <span>Nutrient</span>
        <span>Amount</span>
      </div>
      <table className="w-full text-sm">
        <tbody>
          {data.map(([name, value], idx) => (
            <tr key={idx} className={idx % 2 ? "bg-blue-50/50" : ""}>
              <td className="px-6 py-3 text-gray-800">{name}</td>
              <td className="px-6 py-3 text-right font-medium">{value ?? naText}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
