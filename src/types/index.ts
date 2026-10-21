export type MealCategory =
  | 'Breakfast'
  | 'Brunch'
  | 'Lunch'
  | 'Midday snack'
  | 'Dinner'
  | 'Evening snack'
  | 'Other';

export type CuisineRegion = 'Nigerian' | 'Global' | 'Custom';

export type FoodCategory =
  | 'grains_tubers'
  | 'legumes'
  | 'vegetables'
  | 'fruits'
  | 'meat_poultry'
  | 'fish_seafood'
  | 'soups_stews'
  | 'dairy_alternatives'
  | 'fats_oils'
  | 'snacks_sweets'
  | 'beverages'
  | 'other';

export type DataQuality = 'verified' | 'estimate' | 'partial';

export interface Food {
  id: number;
  name: string;
  cuisineRegion: CuisineRegion;
  category: FoodCategory;
  servingSize: number;
  servingUnit: string;
  servingWeightGrams: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fibreG: number;
  sodiumMg: number;
  addedSugarG: number;
  potassiumMg?: number;
  dataSource: string;
  dataQuality: DataQuality;
  allergens?: string[] | null;
  description?: string | null;
  isCustom?: boolean;
}

export interface MealItem {
  id?: number;
  mealId?: number;
  foodId?: number | null;
  foodName: string;
  portionSize: number;
  portionUnit: string;
  quantity: number;
  preparationMethod?: string | null;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fibreG: number;
  sodiumMg: number;
  addedSugarG: number;
  dataQuality: DataQuality;
}

export interface Meal {
  id: number;
  userId: string;
  category: MealCategory;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  notes?: string | null;
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  totalFibreG: number;
  totalSodiumMg: number;
  totalSugarG: number;
  createdAt: string;
  items: MealItem[];
}

export interface UserProfile {
  id?: number;
  userId: string;
  age?: number | null;
  gender?: string | null;
  heightCm?: number | null;
  weightKg?: number | null;
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
  primaryGoal: string;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  targetFibreG: number;
  targetSodiumMg: number;
  targetSugarG: number;
  onboardingCompleted: boolean;
}

export interface HealthPreference {
  id?: number;
  userId: string;
  healthConditions: string[];
  allergies: string[];
  dietaryRestrictions: string[];
  customNotes?: string | null;
  clinicalAdviceAcknowledged: boolean;
}

export interface DailyInsightResponse {
  date: string;
  mealsCount: number;
  totals: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fibreG: number;
    sodiumMg: number;
    sugarG: number;
  };
  targets: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fibreG: number;
    sodiumMg: number;
    sugarG: number;
  };
  insights: {
    whatWentWell: string[];
    whatCouldImprove: string[];
    suggestedImprovements: string[];
    dataConfidence: 'high' | 'medium' | 'low';
    healthConditionNotes?: string;
  };
}

export interface WeeklyReportResponse {
  startDate: string;
  endDate: string;
  daysLogged: number;
  totalMeals: number;
  averages: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fibreG: number;
    sodiumMg: number;
  };
  targets: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fibreG: number;
    sodiumMg: number;
  };
  dailyBreakdown: Array<{
    date: string;
    dayName: string;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fibreG: number;
    sodiumMg: number;
    mealsCount: number;
  }>;
  categoryCounts: Record<string, number>;
  recommendations: string[];
}

export interface FoodSuggestion {
  title: string;
  category: string;
  foodName: string;
  serving: string;
  calories: number;
  proteinG: number;
  fibreG: number;
  reason: string;
  allergensWarning: string;
}
