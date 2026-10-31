import React, { useState } from 'react';
import {
  Sparkles,
  Clock,
  ChefHat,
  Share2,
  DollarSign,
  Flame,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Bookmark,
  Check,
} from 'lucide-react';
import { Recipe, IngredientItem, LanguageCode } from '../types';

interface RecipeSectionProps {
  recipes: Recipe[];
  isLoading: boolean;
  onGenerateRecipes: (filters: {
    cuisine: string;
    dietary: string;
    maxTime: number;
  }) => void;
  onSelectRecipeForCooking: (recipe: Recipe) => void;
  selectedIngredients: IngredientItem[];
  language: LanguageCode;
}

export const RecipeSection: React.FC<RecipeSectionProps> = ({
  recipes,
  isLoading,
  onGenerateRecipes,
  onSelectRecipeForCooking,
  selectedIngredients,
  language,
}) => {
  const [cuisine, setCuisine] = useState('Any');
  const [dietary, setDietary] = useState('None');
  const [maxTime, setMaxTime] = useState(30);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleShare = (recipe: Recipe) => {
    const text = `🍳 *${recipe.title}* (${recipe.totalMinutes} mins)
Waste Saved: ${recipe.wasteRescueScore}% • Estimated Savings: ${recipe.estimatedSavings}
${recipe.subtitle}

🥬 *Ingredients Used:*
${recipe.ingredientsUsed.map((i) => `• ${i}`).join('\n')}

${
  recipe.smartSubstitutions && recipe.smartSubstitutions.length > 0
    ? `💡 *Smart Substitutions:*\n${recipe.smartSubstitutions
        .map((s) => `• No ${s.missingIngredient}? Use ${s.substitute} (${s.whyItWorks})`)
        .join('\n')}\n`
    : ''
}
👩‍🍳 *Quick Steps:*
${recipe.steps.map((st, i) => `${i + 1}. ${st}`).join('\n')}

Zero-Waste Tip: ${recipe.chefZeroWasteTip}
— Cooked with Fridge-to-Plate AI`;

    navigator.clipboard.writeText(text);
    setCopiedId(recipe.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleGenerate = () => {
    onGenerateRecipes({
      cuisine,
      dietary,
      maxTime,
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 mb-8">
      {/* Section Header & Filters */}
      <div className="border-b border-stone-200 pb-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                3
              </span>
              <h3 className="text-base sm:text-lg font-bold text-stone-900">
                {language === 'Urdu'
                  ? 'زیرو ویسٹ ریسیپیز بنائیں'
                  : language === 'Roman Urdu'
                  ? 'Bache Hue Saman se Mazedar Recipes Banayein'
                  : 'Zero-Waste Recipe Generator'}
              </h3>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Select your cooking style and time. Our AI will craft personalized recipes prioritizing your expiring items.
            </p>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isLoading || selectedIngredients.length === 0}
            className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {isLoading
                ? 'Cooking up zero-waste ideas...'
                : `Generate Recipes (${selectedIngredients.length} Items)`}
            </span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-bold text-stone-600 mb-1">Cuisine / Style:</label>
            <select
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Any">✨ Any Creative Style</option>
              <option value="Desi / South Asian">🍛 Desi / Pakistani / Indian Comfort</option>
              <option value="Asian Stir-Fry">🥢 Asian Quick Stir-Fry / Fried Rice</option>
              <option value="Hostel & Student Fast Food">🥪 Hostel Quick Fix / Toastie / Wrap</option>
              <option value="Mediterranean / Continental">🥗 Mediterranean / Pasta / Frittata</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-stone-600 mb-1">Max Cooking Time:</label>
            <select
              value={maxTime}
              onChange={(e) => setMaxTime(Number(e.target.value))}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value={15}>⚡ 15 mins (Super Fast Rescue)</option>
              <option value={30}>⏱️ 30 mins (Balanced Meal)</option>
              <option value={45}>🍲 45 mins (Hearty & Slow)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-stone-600 mb-1">Dietary Filter:</label>
            <select
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="None">None (Use All Selected)</option>
              <option value="Vegetarian">🌱 Pure Vegetarian</option>
              <option value="High Protein">💪 High Protein Focus</option>
              <option value="Minimal Equipment">🍳 One Pan / Single Skillet</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State Animation */}
      {isLoading && (
        <div className="py-16 text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h4 className="text-base font-bold text-stone-800 animate-pulse">
            Chef AI is Crafting Your Zero-Waste Menu...
          </h4>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Matching leftover rice, eggs, and veggies with smart pantry substitutes to rescue 100% of edible food!
          </p>
        </div>
      )}

      {/* Empty State before first generation */}
      {!isLoading && recipes.length === 0 && (
        <div className="py-12 text-center text-stone-500">
          <ChefHat className="w-12 h-12 text-stone-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-stone-700">No Recipes Generated Yet</p>
          <p className="text-xs text-stone-400 mt-1">
            Click the green "Generate Recipes" button above to turn your fridge leftovers into a delicious dish.
          </p>
        </div>
      )}

      {/* Generated Recipes List */}
      {!isLoading && recipes.length > 0 && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-stone-50/70 hover:bg-white rounded-3xl border border-stone-200/90 hover:border-emerald-500/80 p-5 flex flex-col justify-between transition-all hover:shadow-lg group"
              >
                <div>
                  {/* Badges Top Bar */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>{recipe.wasteRescueScore}% Leftovers Rescued</span>
                    </span>

                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      <DollarSign className="w-3 h-3 text-amber-600" />
                      <span>Saves ~{recipe.estimatedSavings}</span>
                    </span>
                  </div>

                  <h4 className="text-base sm:text-lg font-bold text-stone-900 group-hover:text-emerald-700 transition-colors leading-snug">
                    {recipe.title}
                  </h4>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    {recipe.subtitle}
                  </p>

                  {/* Cook stats */}
                  <div className="mt-3 flex items-center space-x-4 text-xs text-stone-500 font-medium">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span>{recipe.totalMinutes} mins</span>
                    </span>
                    <span>•</span>
                    <span>{recipe.difficulty}</span>
                    <span>•</span>
                    <span>{recipe.servings} Servings</span>
                  </div>

                  {/* Rescued Ingredients list */}
                  <div className="mt-4 pt-3 border-t border-stone-200/60">
                    <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block mb-1.5">
                      Rescued from Fridge:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {recipe.ingredientsUsed.map((ing, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-200/80 text-stone-700"
                        >
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Smart Substitutions Callout */}
                  {recipe.smartSubstitutions && recipe.smartSubstitutions.length > 0 && (
                    <div className="mt-3.5 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/70 text-[11px]">
                      <span className="font-bold text-amber-900 block mb-0.5">
                        🔄 Smart Pantry Substitution:
                      </span>
                      <p className="text-stone-700">
                        No {recipe.smartSubstitutions[0].missingIngredient}?{' '}
                        <strong className="text-emerald-700">
                          Use {recipe.smartSubstitutions[0].substitute}
                        </strong>
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-4 border-t border-stone-200/80 flex items-center space-x-2">
                  <button
                    onClick={() => onSelectRecipeForCooking(recipe)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <ChefHat className="w-3.5 h-3.5" />
                    <span>Cook Step-by-Step</span>
                    <ArrowRight className="w-3 h-3 ml-0.5" />
                  </button>

                  <button
                    onClick={() => handleShare(recipe)}
                    className="p-2.5 rounded-xl border border-stone-300 hover:border-emerald-500 hover:bg-emerald-50 text-stone-600 hover:text-emerald-700 transition-colors cursor-pointer"
                    title="Share recipe or copy to WhatsApp"
                  >
                    {copiedId === recipe.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
