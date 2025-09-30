
/**
 * Renders a styled table displaying a list of nutrition items and their nutritional values.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Item[]} props.items - Array of nutrition items, each containing optional name, calories, protein, carbs, and fat values.
 * @param {Object} props.totals - Object containing the total values for calories, protein, carbs, and fat.
 *
 * @returns {JSX.Element | null} A table summarizing the nutritional information for each item and the totals, or null if no items are provided.
 *
 * @remarks
 * - Uses Tailwind CSS classes for styling.
 * - Alternates row background color for better readability.
 * - Displays "unknown" for items without a name.
 * - Formats values with units where appropriate (e.g., "g" for grams).
 */
interface Item {
    name?: string;
    calories?: number;
    protein_g?: number;
    carbs_g?: number;
    fat_g?: number;
}

interface Props {
    items: Item[];
    totals: {
        total_calories?: number;
        protein_g?: number;
        carbs_g?: number;
        fat_g?: number;
    };
}

const fmt = (value: any, unit = "") => (value ?? 0) + (unit ? ` ${unit}` : "");

export default function NutritionItemsTable({ items, totals }: Props) {
    if (!items.length) return null;

    return (
        <div className="bg-white rounded-2xl shadow-[0_6px_28px_rgba(0,0,0,0.08)] ring-1 ring-black/5 overflow-hidden">
            <div className="bg-blue-600 text-white px-6 py-3 font-semibold grid grid-cols-6 gap-2">
                <span className="col-span-2">Item</span>
                <span className="text-right">Calories</span>
                <span className="text-right">Protein</span>
                <span className="text-right">Carbs</span>
                <span className="text-right">Fat</span>
            </div>
            <div>
                {items.map((it, idx) => (
                    <div key={idx} className={["grid grid-cols-6 gap-2 px-6 py-3 text-sm", idx % 2 ? "bg-blue-50/50" : ""].join(" ")}>
                        <div className="col-span-2 text-gray-800">{it.name || "unknown"}</div>
                        <div className="text-right">{fmt(it.calories)}</div>
                        <div className="text-right">{fmt(it.protein_g, "g")}</div>
                        <div className="text-right">{fmt(it.carbs_g, "g")}</div>
                        <div className="text-right">{fmt(it.fat_g, "g")}</div>
                    </div>
                ))}
                <div className="grid grid-cols-6 gap-2 px-6 py-3 text-sm font-medium border-t">
                    <div className="col-span-2 text-gray-800">Total</div>
                    <div className="text-right">{fmt(totals.total_calories)}</div>
                    <div className="text-right">{fmt(totals.protein_g, "g")}</div>
                    <div className="text-right">{fmt(totals.carbs_g, "g")}</div>
                    <div className="text-right">{fmt(totals.fat_g, "g")}</div>
                </div>
            </div>
        </div>
    );
}
