import React from 'react';
import { ChefHat, Sparkles, Scale, DollarSign, BookOpen, Shuffle, HelpCircle } from 'lucide-react';
import { LanguageCode, ImpactStats } from '../types';

interface HeaderProps {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  impact: ImpactStats;
  onOpenRoulette: () => void;
  onOpenSubstitutions: () => void;
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  setLanguage,
  impact,
  onOpenRoulette,
  onOpenSubstitutions,
  onOpenGuide,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 transform hover:scale-105 transition-transform">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
                  Fridge<span className="text-emerald-600">-to-</span>Plate
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  AI Zero-Waste
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">
                {language === 'Urdu'
                  ? 'روز کی ٹینشن ختم: "آج کیا پکائیں؟"'
                  : language === 'Roman Urdu'
                  ? 'Roz ki tension khatam: "Aaj Kya Pakayein?"'
                  : 'Turn fridge leftovers into delicious meals & save food'}
              </p>
            </div>
          </div>

          {/* Impact Stats Ribbon */}
          <div className="hidden lg:flex items-center space-x-6 text-xs bg-stone-50 px-4 py-2 rounded-xl border border-stone-200/80">
            <div className="flex items-center space-x-1.5 text-stone-700">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="font-semibold text-stone-900">{impact.mealsRescued}</span>
              <span className="text-stone-500">Meals Rescued</span>
            </div>
            <div className="w-px h-3 bg-stone-300"></div>
            <div className="flex items-center space-x-1.5 text-stone-700">
              <Scale className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold text-stone-900">{impact.foodSavedKg.toFixed(1)} kg</span>
              <span className="text-stone-500">Food Saved</span>
            </div>
            <div className="w-px h-3 bg-stone-300"></div>
            <div className="flex items-center space-x-1.5 text-stone-700">
              <DollarSign className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-semibold text-stone-900">
                {impact.currency}{impact.moneySaved}
              </span>
              <span className="text-stone-500">Saved</span>
            </div>
          </div>

          {/* Actions & Language Selector */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Aaj Kya Pakayein Roulette button */}
            <button
              onClick={onOpenRoulette}
              className="relative inline-flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-xl shadow-sm shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
              title="Aaj Kya Pakayein? Instant 1-Click Recipe"
            >
              <Shuffle className="w-4 h-4 animate-spin-slow" />
              <span className="hidden md:inline font-bold">
                {language === 'Urdu' ? 'آج کیا پکائیں؟' : 'Aaj Kya Pakayein?'}
              </span>
              <span className="md:hidden font-bold">Idea!</span>
            </button>

            {/* Smart Substitutions button */}
            <button
              onClick={onOpenSubstitutions}
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-stone-700 hover:text-emerald-700 hover:bg-emerald-50 border border-stone-200 text-xs sm:text-sm font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Smart Ingredient Substitutions"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="hidden xl:inline">Substitutions</span>
            </button>

            {/* Zero Waste Tips */}
            <button
              onClick={onOpenGuide}
              className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 transition-colors cursor-pointer"
              title="Zero-Waste Kitchen Tips & Guide"
            >
              <BookOpen className="w-4 h-4" />
            </button>

            {/* Language Picker */}
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                className="appearance-none bg-stone-100 hover:bg-stone-200/80 text-stone-800 text-xs font-semibold px-2.5 sm:px-3 py-2 rounded-xl border border-stone-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="English">🇬🇧 English</option>
                <option value="Roman Urdu">🇵🇰 Roman Urdu</option>
                <option value="Urdu">🇵🇰 اردو</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
