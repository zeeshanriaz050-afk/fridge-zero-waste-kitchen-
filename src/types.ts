export type FreshnessLevel = 'urgent_rescue' | 'use_soon' | 'fresh';

export type CategoryType =
  | 'Vegetable'
  | 'Protein'
  | 'Dairy'
  | 'Grain/Carb'
  | 'Fruit'
  | 'Condiment/Sauce'
  | 'Spice/Pantry';

export interface IngredientItem {
  id: string;
  name: string;
  localName?: string;
  category: CategoryType;
  quantity: string;
  freshness: FreshnessLevel;
  daysLeft: number;
  rescueTip?: string;
  isSelected?: boolean;
}

export interface SmartSubstitution {
  missingIngredient: string;
  substitute: string;
  whyItWorks: string;
}

export interface Recipe {
  id: string;
  title: string;
  subtitle: string;
  prepTime: string;
  cookTime: string;
  totalMinutes: number;
  difficulty: 'Easy' | 'Medium' | 'Quick';
  wasteRescueScore: number;
  estimatedSavings: string;
  servings: number;
  ingredientsUsed: string[];
  smartSubstitutions?: SmartSubstitution[];
  steps: string[];
  chefZeroWasteTip: string;
  nutritionSummary?: string;
}

export interface RouletteIdea {
  dishName: string;
  catchyReason: string;
  prepTime: string;
  threeStepSummary: string[];
  wasteSavedGramEstimate: number;
}

export interface SubstitutionResult {
  targetIngredient: string;
  bestQuickFix: string;
  substitutes: Array<{
    name: string;
    ratio: string;
    howToPrepare: string;
    flavorDifference: string;
    ratingStars?: number;
  }>;
}

export type LanguageCode = 'English' | 'Roman Urdu' | 'Urdu';

export interface ImpactStats {
  mealsRescued: number;
  foodSavedKg: number;
  moneySaved: number;
  currency: string;
}
