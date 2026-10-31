import React, { useState, useEffect } from 'react';
import {
  X,
  Shuffle,
  Clock,
  Sparkles,
  ChefHat,
  Flame,
  Scale,
  ArrowRight,
  RotateCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RouletteIdea, IngredientItem, LanguageCode } from '../types';

interface RouletteModalProps {
  onClose: () => void;
  ingredients: IngredientItem[];
  language: LanguageCode;
}

export const RouletteModal: React.FC<RouletteModalProps> = ({
  onClose,
  ingredients,
  language,
}) => {
  const [loading, setLoading] = useState(false);
  const [idea, setIdea] = useState<RouletteIdea | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRoulette = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/roulette-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: ingredients.length > 0 ? ingredients : ['Boiled rice', '2 eggs', 'onion', 'chili'],
          language,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate quick roulette idea.');
      }

      const data = await response.json();
      setIdea(data);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error spinning roulette.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoulette();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-orange-500/20">
            <Shuffle className={`w-7 h-7 ${loading ? 'animate-spin' : ''}`} />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-stone-900">
            {language === 'Urdu' ? 'آج کیا پکائیں؟' : 'Aaj Kya Pakayein?'}
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Zero-decision mode: 1 instant, effortless meal using what’s in front of you.
          </p>
        </div>

        {/* Content */}
        {loading && (
          <div className="py-12 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-semibold text-stone-700 animate-pulse">
              Spinning the leftover kitchen wheel...
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center">
            {error}
          </div>
        )}

        {!loading && idea && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-stone-50 border border-amber-200 text-center">
              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-200/80 text-amber-900 mb-2">
                <Clock className="w-3.5 h-3.5" />
                <span>{idea.prepTime} Ready!</span>
              </span>
              <h4 className="text-xl font-extrabold text-stone-900 mb-1">
                {idea.dishName}
              </h4>
              <p className="text-xs text-stone-600 italic">
                "{idea.catchyReason}"
              </p>
            </div>

            {/* 3 Rapid Steps */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wider block">
                3-Step Rapid Method:
              </span>
              {idea.threeStepSummary.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-start space-x-3 text-xs"
                >
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    {idx + 1}
                  </span>
                  <span className="text-stone-700 font-medium leading-relaxed">{step}</span>
                </div>
              ))}
            </div>

            {/* Food waste impact badge */}
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
              <div className="flex items-center space-x-1.5 font-semibold">
                <Scale className="w-4 h-4 text-emerald-600" />
                <span>Rescues ~{idea.wasteSavedGramEstimate}g of food waste!</span>
              </div>
              <span className="font-bold">Zero Waste 🌿</span>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center space-x-2">
              <button
                onClick={fetchRoulette}
                className="flex-1 py-3 px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Spin Again (Another Idea)</span>
              </button>

              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <span>Let's Cook This!</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
