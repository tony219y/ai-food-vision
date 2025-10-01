export interface ModelFoodItem{
    name: string;
    serving_size: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
}
export interface ModelTotals{
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
}

export interface ResponseResult{
    items: ModelFoodItem[];
    totals: ModelTotals;
    healthTags: string[];
}