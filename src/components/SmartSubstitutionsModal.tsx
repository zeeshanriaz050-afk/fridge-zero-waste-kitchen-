import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Search,
  CheckCircle,
  HelpCircle,
  ChefHat,
  Star,
  ArrowRight,
} from 'lucide-react';
import { SubstitutionResult, LanguageCode } from '../types';

interface SmartSubstitutionsModalProps {
  onClose: () => void;
  language: LanguageCode;
}

const POPULAR_SUB_QUERIES = [
  'Heavy Cream / Fresh Malai',
  'Soy Sauce',
  'Egg (for binding)',
  'Buttermilk / Chaas',
  'Tomato Paste',
  'Cornstarch / Flour',
  'Vinegar / Sirka',
  'Brown Sugar',
];

export const SmartSubstitutionsModal: React.FC<SmartSubstitutionsModalProps> = ({
  onClose,
  language,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SubstitutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (target: string) => {
    if (!target.trim()) return;
    setLoading(true);
    setError(null);
    setQuery(target);

    try {
      const response = await fetch('/api/find-substitution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredient: target,
          currentKitchenPantry: ['Milk', 'Yogurt', 'Flour', 'Oil', 'Butter', 'Lemon', 'Spices'],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to find substitution.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error finding substitution.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative max-h-[90vh] flex flex-col overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center space-x-2 text-emerald-600 mb-1">
            <Sparkles className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Zero-Waste Culinary Engine
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-stone-900">
            Smart Ingredient Substitution Finder
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Missing an ingredient mid-recipe? Never discard dinner or rush to the store—swap it smartly with everyday staples.
          </p>
        </div>

        {/* Search input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
          className="flex items-center space-x-2 mb-4"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What ingredient are you missing? (e.g. Cream, Soy sauce, Buttermilk...)"
              className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-10 pr-4 py-3 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm cursor-pointer transition-colors shadow-sm"
          >
            {loading ? 'Finding...' : 'Find Swap'}
          </button>
        </form>

        {/* Popular chips */}
        <div className="mb-5">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5">
            Common Missing Ingredients:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_SUB_QUERIES.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSearch(item)}
                className="text-[11px] font-medium px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-emerald-50 hover:text-emerald-700 border border-stone-200 text-stone-700 transition-colors cursor-pointer"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Body Results */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {loading && (
            <div className="py-12 text-center">
              <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm font-semibold text-stone-700 animate-pulse">
                Consulting culinary chemistry for optimal kitchen swaps...
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {!loading && result && (
            <div className="space-y-4">
              {/* Quick Best Fix */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
                <span className="text-xs font-bold text-emerald-900 block mb-0.5">
                  ⭐ Best Emergency Swap for {result.targetIngredient}:
                </span>
                <p className="text-sm font-medium text-emerald-800">
                  {result.bestQuickFix}
                </p>
              </div>

              {/* Substitutions list */}
              <div className="space-y-3">
                {result.substitutes.map((sub, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl border border-stone-200 bg-stone-50/70 hover:bg-white transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-stone-900 flex items-center space-x-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>{sub.name}</span>
                      </h4>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Ratio: {sub.ratio}
                      </span>
                    </div>

                    <p className="text-xs text-stone-700">
                      <strong>How to Prepare:</strong> {sub.howToPrepare}
                    </p>
                    <p className="text-xs text-stone-500">
                      <strong>Flavor & Texture Note:</strong> {sub.flavorDifference}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && !result && (
            <div className="py-8 text-center text-stone-400">
              <ChefHat className="w-10 h-10 mx-auto mb-2 text-stone-300" />
              <p className="text-xs">
                Pick a popular ingredient above or type any item to discover real-world pantry swaps.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
