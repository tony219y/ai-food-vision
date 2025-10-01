import type { ResponseResult } from "../types/nutrition-model";


interface Item {
    result: ResponseResult;
}

export default function Tags({result} : Item ) {
  if (!result) return null;
  console.log(result.healthTags);

  return (
    <div className="flex flex-wrap gap-2">
      {result.healthTags.map((tags, idx) => (
        <span key={idx} className="px-3 py-1 rounded-full text-blue-600 bg-blue-50 border border-blue-200 text-xs">
          {tags}
        </span>
      ))}
    </div>
  );
}
