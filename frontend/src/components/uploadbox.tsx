import { useRef, useState, useEffect } from "react";

/** ---------- Config ---------- */
const MAX_SIZE_MB = 10;

/** ---------- Types ---------- */
type Macro = number | null;

type FoodItem = {
  name: string;
  calories?: Macro;
  protein_g?: Macro;
  carbs_g?: Macro;
  fat_g?: Macro;
  fiber_g?: Macro;
  sugar_g?: Macro;
};

type NutritionResult = {
  // From backend (according to required schema)
  items?: FoodItem[];
  total_calories?: number | null;
  notes?: string | null;

  // For some backends that provide totals at the top level
  serving_size?: string | null;
  calories?: Macro;
  protein_g?: Macro;
  carbs_g?: Macro;
  fat_g?: Macro;
  fiber_g?: Macro;
  sugar_g?: Macro;

  // extra
  name?: string | null;  // Main menu name (derived from items if not present)
  tags?: string[];
};

const NA = "N/Ag";

/** ---------- Helpers ---------- */
const num = (v: any): Macro => {
  if (v == null) return null;
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const m = v.match(/-?\d+(\.\d+)?/);
    return m ? parseFloat(m[0]) : null;
  }
  return null;
};

const safeItems = (maybeItems: any): FoodItem[] => {
  if (!Array.isArray(maybeItems)) return [];
  return maybeItems.map((it: any) => ({
    name: String(it?.name ?? "unknown"),
    calories: num(it?.calories),
    protein_g: num(it?.protein_g),
    carbs_g: num(it?.carbs_g),
    fat_g: num(it?.fat_g),
    fiber_g: num(it?.fiber_g),
    sugar_g: num(it?.sugar_g),
  }));
};

// Normalize various JSON formats into a single NutritionResult and calculate summary
const normalizeResponse = (raw: any): NutritionResult => {
  const src = raw?.result ?? raw ?? {};
  const items = safeItems(src.items);

  const sum = (k: keyof FoodItem) =>
    items.reduce((acc, it) => acc + (typeof it[k] === "number" ? (it[k] as number) : 0), 0);

  const caloriesTotal =
    num(src.total_calories) ??
    (items.length ? sum("calories") : null) ??
    num(src.calories);

  const proteinTotal = num(src.protein_g) ?? (items.length ? sum("protein_g") : null);
  const carbsTotal   = num(src.carbs_g)   ?? (items.length ? sum("carbs_g")   : null);
  const fatTotal     = num(src.fat_g)     ?? (items.length ? sum("fat_g")     : null);
  const fiberTotal   = num(src.fiber_g)   ?? (items.length ? sum("fiber_g")   : null);
  const sugarTotal   = num(src.sugar_g)   ?? (items.length ? sum("sugar_g")   : null);

  // Create main menu name: use src.name if present, otherwise join first 3 item names
  const derivedName =
    (typeof src.name === "string" && src.name.trim()) ||
    (items.length ? items.slice(0, 3).map(it => it.name).join(", ") : null);

  return {
    items,
    total_calories: caloriesTotal,
    notes: typeof src.notes === "string" ? src.notes : null,

    serving_size: src.serving_size ?? src.serving ?? src.portion ?? null,
    calories: caloriesTotal,
    protein_g: proteinTotal,
    carbs_g: carbsTotal,
    fat_g: fatTotal,
    fiber_g: fiberTotal,
    sugar_g: sugarTotal,

    name: derivedName,
    tags: Array.isArray(src.tags) ? src.tags : Array.isArray(src.labels) ? src.labels : [],
  };
};

const fmt = (v?: Macro, unit = "") => (v == null ? NA : `${v}${unit}`);

/** ---------- Component ---------- */
export default function UploadBox() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<NutritionResult | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null); // raw JSON (debug)

  // Backend URL 
  const BACKEND_URL = "/api/analyze";

  // Cleanup preview URL
  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  // Handle file selection and validation
  const handleFile = (f: File) => {
    setError(null);
    setAnalysis(null);
    setResult(null);
    if (!f.type.startsWith("image/")) { setError("Please select an image (JPEG/PNG/WebP, etc.)"); return; }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) { setError(`File exceeds ${MAX_SIZE_MB}MB`); return; }
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  // Clear selected file and reset state
  const clearFile = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setError(null);
    setAnalysis(null);
    setResult(null);
  };

  // Send image to backend for analysis
  const analyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);
    setResult(null);

    try {
      const form = new FormData();
      form.append("image", file);

      const res = await fetch(BACKEND_URL, { method: "POST", body: form });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Request failed (${res.status})`);
      }
      const data = await res.json();
      setAnalysis(JSON.stringify(data, null, 2));
      setResult(normalizeResponse(data));
    } catch (e: any) {
      setError(e?.message || "Analyze failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div>
      <h2 className="mb-2 text-base font-semibold text-gray-800">Upload Your Meal Here</h2>

      {/* Drop area wrapper */}
      <div className="my-10 w-[900px] h-[360px] flex items-center justify-center rounded-xl
                      shadow-[0_4px_30px_rgba(0,0,0,0.2)]
                      hover:shadow-[0_8px_40px_rgba(0,0,0,0.2)]
                      hover:scale-[1.01] transition-all duration-300 ease-in-out">
        {/* Drop zone */}
        <div
          role="button"
          tabIndex={0}
          aria-busy={isAnalyzing}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
          onDragEnter={(e) => { e.preventDefault(); if (Array.from(e.dataTransfer.types || []).includes("Files")) setIsDragging(true); }}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={(e) => { e.preventDefault(); const rt = e.relatedTarget as Node | null; if (!rt || !e.currentTarget.contains(rt)) setIsDragging(false); }}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
          className={[
            "relative w-[800px] h-[300px] rounded-xl flex flex-col items-center justify-center",
            "border-2 border-dashed transition cursor-pointer",
            "hover:border-orange-500 hover:bg-orange-50",
            isDragging ? "border-orange-400 bg-orange-50" : "border-gray-300 bg-white"
          ].join(" ")}
        >
          {/* Empty state */}
          {!preview && (
            <div className="text-center text-gray-600">
              <p className="text-orange-500 font-semibold text-3xl my-2">
                You Wanna Break Down Your Meal’s Nutrition?
              </p>
              <p className="text-base mt-6">Drag & drop your image or click the button</p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="inline-flex items-center gap-2 rounded-full bg-orange-600 text-white px-4 py-2
                           hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-300 mt-6"
                aria-label="Upload your meal image"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                  <path fill="currentColor" d="M5 20h14a1 1 0 001-1v-5h-2v4H6v-4H4v5a1 1 0 001 1zm7-16l5 5h-3v4h-4v-4H7l5-5z" />
                </svg>
                Upload Your Meal Image
              </button>
            </div>
          )}

          {/* Error */}
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          {/* Preview + Actions */}
          {preview && (
            <div className="flex flex-col items-center gap-3">
              <img src={preview} alt={file?.name || "Preview"} className="max-h-40 rounded-lg shadow" />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); analyze(); }}
                  className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-full hover:bg-emerald-700 disabled:opacity-50"
                  disabled={isAnalyzing}
                >
                  {isAnalyzing && (
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                  )}
                  {isAnalyzing ? "Analyzing..." : "Analyze"}
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); clearFile(); }}
                  className="px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-50"
                  disabled={isAnalyzing}
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Drag ring overlay */}
          {isDragging && <div className="pointer-events-none absolute inset-0 rounded-xl ring-4 ring-orange-300/70" />}
        </div>
      </div>

      {/* Hidden input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.currentTarget.value = ""; }}
        aria-hidden="true"
      />

      {/* ====== Results ====== */}
      {result && (
        <section className="space-y-6">
          {/* Main menu name */}
          {result.name && (
            <h1 className="text-2xl font-bold text-gray-900">{result.name}</h1>
          )}

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Calories", value: result.calories, unit: "" },
              { label: "Protein",  value: result.protein_g, unit: "g" },
              { label: "Carbs",    value: result.carbs_g,   unit: "g" },
              { label: "Fat",      value: result.fat_g,     unit: "g" },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl bg-blue-50 text-blue-700 px-6 py-5 shadow-sm">
                <div className="text-3xl font-bold">{fmt(s.value, s.unit)}</div>
                <div className="text-sm opacity-70">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Chips: food names */}
          {!!(result.items && result.items.length) && (
            <div className="flex flex-wrap gap-2">
              {result.items.map((it, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-xs">
                  {it.name || "unknown"}
                </span>
              ))}
            </div>
          )}

          {/* Items table */}
          {!!(result.items && result.items.length) && (
            <div className="bg-white rounded-2xl shadow-[0_6px_28px_rgba(0,0,0,0.08)] ring-1 ring-black/5 overflow-hidden">
              <div className="bg-blue-600 text-white px-6 py-3 font-semibold grid grid-cols-6 gap-2">
                <span className="col-span-2">Item</span>
                <span className="text-right">Calories</span>
                <span className="text-right">Protein</span>
                <span className="text-right">Carbs</span>
                <span className="text-right">Fat</span>
              </div>
              <div>
                {result.items.map((it, idx) => (
                  <div key={idx} className={["grid grid-cols-6 gap-2 px-6 py-3 text-sm", idx % 2 ? "bg-blue-50/50" : ""].join(" ")}>
                    <div className="col-span-2 text-gray-800">{it.name || "unknown"}</div>
                    <div className="text-right">{fmt(it.calories)}</div>
                    <div className="text-right">{fmt(it.protein_g, "g")}</div>
                    <div className="text-right">{fmt(it.carbs_g, "g")}</div>
                    <div className="text-right">{fmt(it.fat_g, "g")}</div>
                  </div>
                ))}
                {/* Footer row: totals */}
                <div className="grid grid-cols-6 gap-2 px-6 py-3 text-sm font-medium border-t">
                  <div className="col-span-2 text-gray-800">Total</div>
                  <div className="text-right">{fmt(result.total_calories ?? result.calories)}</div>
                  <div className="text-right">{fmt(result.protein_g, "g")}</div>
                  <div className="text-right">{fmt(result.carbs_g, "g")}</div>
                  <div className="text-right">{fmt(result.fat_g, "g")}</div>
                </div>
              </div>
            </div>
          )}

          {/* Nutrient detail table */}
          <div className="bg-white rounded-2xl shadow-[0_6px_28px_rgba(0,0,0,0.08)] ring-1 ring-black/5 overflow-hidden">
            <div className="bg-blue-600 text-white px-6 py-3 font-semibold flex items-center justify-between">
              <span>Nutrient</span><span>Amount</span>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["Serving Size", result.serving_size || NA],
                  ["Calories",     fmt(result.calories)],
                  ["Protein",      fmt(result.protein_g, "g")],
                  ["Carbohydrates",fmt(result.carbs_g, "g")],
                  ["Fat",          fmt(result.fat_g, "g")],
                  ["Fiber",        fmt(result.fiber_g, "g")],
                  ["Sugar",        fmt(result.sugar_g, "g")],
                ].map(([k, v], idx) => (
                  <tr key={idx} className={idx % 2 ? "bg-blue-50/50" : ""}>
                    <td className="px-6 py-3 text-gray-800">{k as string}</td>
                    <td className="px-6 py-3 text-right font-medium">{v as string}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notes */}
          {result.notes && (
            <div className="p-4 rounded-xl bg-yellow-50 text-yellow-800 text-sm">
              {result.notes}
            </div>
          )}

          {/* Tags */}
          {!!(result.tags && result.tags.length) && (
            <div className="flex flex-wrap gap-2">
              {result.tags.map((t, i) => (
                <span key={i} className="px-3 py-1 rounded-full text-blue-600 bg-blue-50 border border-blue-200 text-xs">
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Debug raw JSON */}
          {analysis && (
            <details className="mt-2">
              <summary className="cursor-pointer text-sm text-gray-500">Raw JSON</summary>
              <pre className="mt-2 p-3 rounded-lg bg-gray-50 text-gray-700 text-xs whitespace-pre-wrap">
                {analysis}
              </pre>
            </details>
          )}
        </section>
      )}

      <p className="mt-5 text-sm text-gray-500">Note: Please upload a clear image of your meal (.jpg/.png).</p>
    </div>
  );
}