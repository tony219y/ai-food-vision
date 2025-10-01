import type { ResponseResult } from "../types/nutrition-model";


interface Item {
    result: ResponseResult;
}

export default function NutritionItemsTable({result}: Item) {
    if (!result) return null;

    return (
        <div className="bg-white rounded-2xl shadow-[0_6px_28px_rgba(0,0,0,0.08)] ring-1 ring-black/5 overflow-hidden">
            <div className="bg-blue-600 text-white px-6 py-3 font-semibold grid grid-cols-7 gap-2">
                <span className="col-span-2">Item</span>
                <span className="text-right">Calories</span>
                <span className="text-right">Protein</span>
                <span className="text-right">Carbs</span>
                <span className="text-right">Fat</span>
                <span className="text-right">Serving Size</span>
            </div>
            <div>
                {result.items.map((it, idx) => (
                    <div key={idx} className={["grid grid-cols-7 gap-2 px-6 py-3 text-sm", idx % 2 ? "bg-blue-50/50" : ""].join(" ")}>
                        <div className="col-span-2 text-gray-800">{it.name || "unknown"}</div>
                        <div className="text-right">{it.calories}</div>
                        <div className="text-right">{it.protein_g}</div>
                        <div className="text-right">{it.carbs_g}</div>
                        <div className="text-right">{it.fat_g}</div>
                        <div className="text-right">{it.serving_size}</div>
                    </div>
                ))}
                
                <div className="grid grid-cols-7 gap-2 px-6 py-3 text-sm font-medium border-t">
                    <div className="col-span-2 text-gray-800">Total</div>
                    <div className="text-right">{result.totals.calories}</div>
                    <div className="text-right">{result.totals.carbs_g}</div>
                    <div className="text-right">{result.totals.protein_g}</div>
                    <div className="text-right">{result.totals.fat_g}</div>
                </div>

            </div>
        </div>
    );
}
