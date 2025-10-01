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

export type ModelOK = 
    | { items: ModelFoodItem[]; totals: ModelTotals }
    | { error: "not_food" };

// export interface NutritionItem{
//     name? : string;
//     serving_size? : string;
//     calories? : number;
//     protein_g? : number;
//     carbs_g? : number;
//     fat_g? : number;
// }

// export interface NutritionResult{
//     items?: NutritionItem[];

//     total_calories?: number;
//     protein_g?: number;
//     carbs_g?: number;
//     fat_g?: number;

//     //for notes/tags 
//     notes?: string;
//     tags?: string[];

//     //if it not food
//     not_food?: boolean;
// }