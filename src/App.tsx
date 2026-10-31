import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ScannerSection } from './components/ScannerSection';
import { InventoryShelf } from './components/InventoryShelf';
import { RecipeSection } from './components/RecipeSection';
import { CookingModeModal } from './components/CookingModeModal';
import { RouletteModal } from './components/RouletteModal';
import { SmartSubstitutionsModal } from './components/SmartSubstitutionsModal';
import { ZeroWasteGuideModal } from './components/ZeroWasteGuideModal';
import { IngredientItem, Recipe, LanguageCode, ImpactStats } from './types';
import { SAMPLE_SCENARIOS } from './data/samplePantry';
import {
  Sparkles,
  Flame,
  Scale,
  DollarSign,
  TrendingUp,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Share2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [language, setLanguage] = useState<LanguageCode>('Roman Urdu');
  const [inventory, setInventory] = useState<IngredientItem[]>(() => {
    const saved = localStorage.getItem('fridge_inventory');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    // Default initial preset: Hostel & Bachelor Leftovers
    return SAMPLE_SCENARIOS[0].items;
  });

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [activeCookingRecipe, setActiveCookingRecipe] = useState<Recipe | null>(null);
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);
  const [isSubstitutionsOpen, setIsSubstitutionsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Impact tracker
  const [impact, setImpact] = useState<ImpactStats>(() => {
    const saved = localStorage.getItem('fridge_impact');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      mealsRescued: 14,
      foodSavedKg: 4.2,
      moneySaved: 36,
      currency: '$',
    };
  });

  // Persist inventory
  useEffect(() => {
    localStorage.setItem('fridge_inventory', JSON.stringify(inventory));
  }, [inventory]);

  // Persist impact
  useEffect(() => {
    localStorage.setItem('fridge_impact', JSON.stringify(impact));
  }, [impact]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Callback when scanner detects items
  const handleItemsDetected = (items: IngredientItem[], summary?: string) => {
    // Merge without duplicates by name
    const existingNames = new Set(inventory.map((i) => i.name.toLowerCase()));
    const newItems = items.filter((i) => !existingNames.has(i.name.toLowerCase()));

    const merged = [
      ...inventory,
      ...newItems.map((item) => ({
        ...item,
        isSelected: true,
      })),
    ];

    setInventory(merged);
    showToast(summary || `Detected ${items.length} items from fridge!`);
  };

  // Manual add item
  const handleAddManualItem = (name: string, category: string, quantity: string) => {
    const newItem: IngredientItem = {
      id: `manual-${Date.now()}`,
      name,
      category: category as any,
      quantity,
      freshness: 'use_soon',
      daysLeft: 2,
      isSelected: true,
    };
    setInventory((prev) => [newItem, ...prev]);
    showToast(`Added ${name} to your fridge shelf!`);
  };

  const handleToggleItem = (id: string) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isSelected: !item.isSelected } : item
      )
    );
  };

  const handleDeleteItem = (id: string) => {
    setInventory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSelectAllUrgent = () => {
    setInventory((prev) =>
      prev.map((item) =>
        item.freshness === 'urgent_rescue' ? { ...item, isSelected: true } : item
      )
    );
    showToast('All urgent expiring items selected for rescue!');
  };

  const handleClearAll = () => {
    setInventory([]);
    setRecipes([]);
    showToast('Fridge shelf cleared.');
  };

  // Generate zero-waste recipes using server-side Gemini 3.8 Flash
  const handleGenerateRecipes = async (filters: {
    cuisine: string;
    dietary: string;
    maxTime: number;
  }) => {
    const selected = inventory.filter((i) => i.isSelected);
    if (selected.length === 0) {
      showToast('Please select at least 1 item from your fridge shelf!');
      return;
    }

    setIsLoadingRecipes(true);
    try {
      const response = await fetch('/api/generate-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: selected,
          cuisinePreference: filters.cuisine,
          dietary: filters.dietary,
          maxTimeMinutes: filters.maxTime,
          language,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate recipes.');
      }

      const data = await response.json();
      if (data.recipes && data.recipes.length > 0) {
        setRecipes(data.recipes);
        showToast(`Created ${data.recipes.length} zero-waste recipes!`);
      } else {
        throw new Error('No recipes returned.');
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error generating recipes. Please try again.');
    } finally {
      setIsLoadingRecipes(false);
    }
  };

  // Mark recipe cooked & increment savings
  const handleCompleteRecipe = (recipe: Recipe) => {
    setImpact((prev) => ({
      ...prev,
      mealsRescued: prev.mealsRescued + 1,
      foodSavedKg: prev.foodSavedKg + 0.35,
      moneySaved: prev.moneySaved + 4,
    }));
    showToast(`🎉 Recorded! You rescued 350g of food and saved ~$4 on this meal!`);
  };

  const selectedIngredients = inventory.filter((i) => i.isSelected);

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 pb-16">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-2 text-xs font-semibold animate-bounce-short border border-stone-800">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Header
        language={language}
        setLanguage={setLanguage}
        impact={impact}
        onOpenRoulette={() => setIsRouletteOpen(true)}
        onOpenSubstitutions={() => setIsSubstitutionsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Hero Welcome Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden mb-8 border border-emerald-700/50">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {language === 'Urdu'
                  ? 'بچے ہوئے سامان سے مزیدار کھانا'
                  : language === 'Roman Urdu'
                  ? 'Bache huye saman ka smart hal'
                  : 'AI Zero-Waste Culinary Engine'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
              {language === 'Urdu' ? (
                <span>فریج کھولیں، تصویر لیں، اور فوری مزیدار کھانا بنائیں!</span>
              ) : language === 'Roman Urdu' ? (
                <span>
                  Fridge mein thoda saamaan bacha hai?{' '}
                  <span className="text-emerald-300 underline decoration-amber-400">
                    "Aaj Kya Pakayein?"
                  </span>{' '}
                  ki tension khatam!
                </span>
              ) : (
                <span>
                  Never throw away leftovers again.{' '}
                  <span className="text-emerald-300">Turn fridge odds & ends</span> into delicious meals.
                </span>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100 mt-2.5 leading-relaxed">
              {language === 'Urdu'
                ? 'ہاسٹل اور گھر میں اکثر ابلے ہوئے چاول، انڈے، سالن، یا تھوڑی سبزی بچ جاتی ہے۔ گوگل جیمینائی وژن فوری طور پر آپ کے سامان کو اسکین کر کے کم خرچ میں شاہانہ ریسیپیز تیار کرتا ہے۔'
                : language === 'Roman Urdu'
                ? 'Hostels aur gharon mein bache hue chawal, anday, daal, ya thori si chicken zaya na karein. Gemini AI foran scan karke asaan, mazedar recipes banayega.'
                : 'Hostel students and busy homes waste hundreds of dollars each year. Snap your fridge, let Gemini AI detect ingredients, and cook restaurant-worthy comfort food in minutes.'}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsRouletteOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-sm transition-all cursor-pointer"
              >
                <Flame className="w-4 h-4" />
                <span>
                  {language === 'Urdu'
                    ? '1 سیکنڈ میں ڈش منتخب کریں (آج کیا پکائیں)'
                    : '1-Click Instant Meal (Aaj Kya Pakayein?)'}
                </span>
              </button>

              <button
                onClick={() => setIsSubstitutionsOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-emerald-100 font-bold text-xs sm:text-sm border border-emerald-500/50 flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>Smart Ingredient Substitutions</span>
              </button>
            </div>
          </div>
        </div>

        {/* STEP 1: Scanner Section (Photo, Voice, Staples) */}
        <ScannerSection
          onItemsDetected={handleItemsDetected}
          onAddManualItem={handleAddManualItem}
          isScanning={isScanning}
          setIsScanning={setIsScanning}
          language={language}
        />

        {/* STEP 2: Digital Fridge Shelf / Inventory */}
        <InventoryShelf
          items={inventory}
          onToggleItem={handleToggleItem}
          onDeleteItem={handleDeleteItem}
          onSelectAllUrgent={handleSelectAllUrgent}
          onClearAll={handleClearAll}
          language={language}
        />

        {/* STEP 3: Recipe Generator & Cards */}
        <RecipeSection
          recipes={recipes}
          isLoading={isLoadingRecipes}
          onGenerateRecipes={handleGenerateRecipes}
          onSelectRecipeForCooking={(r) => setActiveCookingRecipe(r)}
          selectedIngredients={selectedIngredients}
          language={language}
        />

        {/* Food Waste Impact Card */}
        <div className="mt-8 bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center space-x-1.5 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span>Your Community & Environmental Footprint</span>
              </span>
              <h3 className="text-xl font-bold text-stone-900">
                You're Fighting Food Waste with Every Bite
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-xl">
                By cooking from leftovers instead of ordering takeout or letting food spoil, you save household budget, reduce methane emissions from landfills, and inspire friends and family to live sustainably.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 shrink-0">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-xl sm:text-2xl font-extrabold text-emerald-800 block">
                  {impact.mealsRescued}
                </span>
                <span className="text-[11px] font-semibold text-emerald-700">Meals Rescued</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-center">
                <span className="text-xl sm:text-2xl font-extrabold text-teal-800 block">
                  {impact.foodSavedKg.toFixed(1)} kg
                </span>
                <span className="text-[11px] font-semibold text-teal-700">Waste Prevented</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                <span className="text-xl sm:text-2xl font-extrabold text-amber-800 block">
                  {impact.currency}{impact.moneySaved}
                </span>
                <span className="text-[11px] font-semibold text-amber-700">Money Saved</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {/* 1. Step-by-Step Cooking Mode Modal */}
      {activeCookingRecipe && (
        <CookingModeModal
          recipe={activeCookingRecipe}
          onClose={() => setActiveCookingRecipe(null)}
          onCompleteRecipe={handleCompleteRecipe}
          language={language}
        />
      )}

      {/* 2. "Aaj Kya Pakayein?" Roulette Modal */}
      {isRouletteOpen && (
        <RouletteModal
          onClose={() => setIsRouletteOpen(false)}
          ingredients={inventory.filter((i) => i.isSelected)}
          language={language}
        />
      )}

      {/* 3. Smart Substitutions Finder Modal */}
      {isSubstitutionsOpen && (
        <SmartSubstitutionsModal
          onClose={() => setIsSubstitutionsOpen(false)}
          language={language}
        />
      )}

      {/* 4. Zero Waste Kitchen Tips Modal */}
      {isGuideOpen && (
        <ZeroWasteGuideModal
          onClose={() => setIsGuideOpen(false)}
          language={language}
        />
      )}
    </div>
  );
}
