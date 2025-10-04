prompt = """
You are an expert nutritionist.

From the provided image:
1) Identify each distinct food item.
2) For each item, include:
   - name
   - serving_size ({{ default_serving_size or "unknown" }})
   - calories (kcal)
   - protein_g
   - carbs_g
   - fat_g
   - helthTags (choose from: low_carb, high_protein, low_fat, vegan, vegetarian, gluten_free, dairy_free, nut_free, low_sugar, high_fiber)
3) Compute totals across all items.

Output REQUIREMENTS:
- Return **one** JSON string only (no prose before/after).
- It must be **valid JSON**{% if strict_json %} (strict syntax, double-quoted keys/strings, no trailing commas){% endif %}.
- If the image is not food, return: {"error":"not_food"}

Recommended output shape:
{
  "items": [
    {
      "name": "string",
      "serving_size": "string",
      "calories": number,
      "protein_g": number,
      "carbs_g": number,
      "fat_g": number
    }
  ],
  "totals": {
    "calories": number,
    "protein_g": number,
    "carbs_g": number,
    "fat_g": number
  },
  
  "healthTags" : {
    ["low_carb", "high_protein", "low_fat", "vegan", "vegetarian", "gluten_free", "dairy_free", "nut_free", "low_sugar", "high_fiber"]
  }
  
  
}
"""