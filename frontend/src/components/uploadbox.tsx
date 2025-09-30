import { useRef, useState } from "react";

import NutritionItemsTable from "./NutritionItemsTable";
import NutrientTable from "./NutrientTable";
import Notes from "./Notes";
import Tags from "./Tags";

import ExamImage from "./ExamImage";
import { useImageUpload } from "../hooks/useImageUpload";

export default function UploadBox() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const {
    file,
    preview,
    error,
    isAnalyzing,
    result,
    handleFile,
    clearFile,
    analyze,
  } = useImageUpload();

  return (
    <>
      <div className="flex w-full">
        <div className="flex flex-col items-center justify-center p-10">
          <h2 className="mb-2 text-base font-semibold text-gray-800">
            Upload Your Meal Here
          </h2>

          {/* Drop area wrapper */}
          <div
            className=" flex items-center justify-center rounded-xl
                        shadow-[0_4px_30px_rgba(0,0,0,0.2)]
                        hover:shadow-[0_8px_40px_rgba(0,0,0,0.2)]
                        hover:scale-[1.01] transition-all duration-300 ease-in-out"
          >
            {/* Drop zone */}
            <div
              tabIndex={0}
              aria-busy={isAnalyzing}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  fileInputRef.current?.click();
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                if (Array.from(e.dataTransfer.types || []).includes("Files"))
                  setIsDragging(true);
              }}
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={(e) => {
                e.preventDefault();
                const rt = e.relatedTarget as Node | null;
                if (!rt || !e.currentTarget.contains(rt)) setIsDragging(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const f = e.dataTransfer.files?.[0];
                if (f) {clearFile(); handleFile(f);};
              }}
              className={[
                "relative w-[800px] h-[300px] rounded-xl flex flex-col items-center justify-center",
                "border-2 border-dashed transition cursor-pointer",
                "hover:border-orange-500 hover:bg-orange-50",
                isDragging
                  ? "border-orange-400 bg-orange-50"
                  : "border-gray-300 bg-white",
              ].join(" ")}
            >
              {/* Empty state */}
              {!preview && (
                <div className="text-center text-gray-600">
                  <p className="text-orange-500 font-semibold text-3xl my-2">
                    You Wanna Break Down Your Meal’s Nutrition?
                  </p>
                  <p className="text-base mt-6">
                    Drag & drop your image or click the button
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-orange-600 text-white px-4 py-2
                            hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-300 mt-6"
                    aria-label="Upload your meal image"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4"
                      aria-hidden="true"
                    >
                      <path
                        fill="currentColor"
                        d="M5 20h14a1 1 0 001-1v-5h-2v4H6v-4H4v5a1 1 0 001 1zm7-16l5 5h-3v4h-4v-4H7l5-5z"
                      />
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
                  <img
                    src={preview}
                    alt={file?.name || "Preview"}
                    className="max-h-40 rounded-lg shadow"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        analyze();
                      }}
                      className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-full hover:bg-emerald-700 disabled:opacity-50"
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? "Analyzing..." : "Analyze"}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearFile();
                      }}
                      className="px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-50"
                      disabled={isAnalyzing}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Drag ring overlay */}
              {isDragging && (
                <div className="pointer-events-none absolute inset-0 rounded-xl ring-4 ring-orange-300/70" />
              )}
            </div>

            {/* Hidden input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {clearFile(); handleFile(f)};
                e.currentTarget.value = "";
              }}
              aria-hidden="true"
            />
          </div>
          {/* Result UI */}
          {result && (
            <div className="max-w-[800px] space-y-6 mt-10">
              {/* NutritionItemsTable and NutrientTable */}
              <NutritionItemsTable
                items={result.items || []}
                totals={{
                  total_calories: result.total_calories ?? result.calories,
                  protein_g: result.protein_g,
                  carbs_g: result.carbs_g,
                  fat_g: result.fat_g,
                }}
              />
              <NutrientTable
                data={[
                  ["Serving Size", result.serving_size],
                  ["Calories", result.calories],
                  ["Protein", result.protein_g],
                  ["Carbohydrates", result.carbs_g],
                  ["Fat", result.fat_g],
                  ["Fiber", result.fiber_g],
                  ["Sugar", result.sugar_g],
                ]}
              />
              {/* Notes and Tags */}
              <Notes text={result.notes} />
              <Tags items={result.tags} />
            </div>
          )}

          <p className="mt-5 text-sm text-gray-500">
            Note: Please upload a clear image of your meal (.jpg/.png).
          </p>
        </div>

        <ExamImage
          onPickFile={async (file: File) => {
            clearFile();
            await handleFile(file);
          }}
        />
      </div>
    </>
  );
}
