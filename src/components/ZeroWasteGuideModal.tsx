import React from 'react';
import { X, BookOpen, Sparkles, ShieldCheck, Flame, Droplets, Leaf } from 'lucide-react';
import { ZERO_WASTE_TIPS } from '../data/samplePantry';
import { LanguageCode } from '../types';

interface ZeroWasteGuideModalProps {
  onClose: () => void;
  language: LanguageCode;
}

export const ZeroWasteGuideModal: React.FC<ZeroWasteGuideModalProps> = ({
  onClose,
  language,
}) => {
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
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-emerald-600 mb-1">
            <Leaf className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Zero-Waste Culinary Masterclass
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-stone-900">
            {language === 'Urdu'
              ? 'کھانا ضائع ہونے سے بچانے کے گھریلو ٹوٹکے'
              : 'Kitchen Secrets: Stop Wasting Good Food'}
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Proven food science methods to preserve freshness, store leftovers safely, and save money every week.
          </p>
        </div>

        {/* Tips list */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {ZERO_WASTE_TIPS.map((tip, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-stone-50 border border-stone-200/90 hover:border-emerald-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-sm font-bold text-stone-900 flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span>{tip.title}</span>
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100/70 text-emerald-800 border border-emerald-200">
                  {tip.tag}
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed pl-7">
                {tip.tip}
              </p>
            </div>
          ))}

          {/* Golden Rules */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-xs space-y-2">
            <span className="font-bold text-amber-900 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Three Golden Zero-Waste Kitchen Habits:</span>
            </span>
            <ul className="list-disc list-inside space-y-1 text-stone-700">
              <li>
                <strong>FIFO (First In, First Out):</strong> Always place newly purchased groceries at the back of the fridge, bringing older leftovers to the front row.
              </li>
              <li>
                <strong>The Freezer Stash:</strong> Never let cooked meat or chicken sit past 3 days in the fridge—shred and freeze for instant emergency tacos or fried rice.
              </li>
              <li>
                <strong>Veggie Scrap Broth:</strong> Keep a bag in the freezer for onion skins, carrot tips, and coriander stems. Simmer with salt & water for 30 minutes for rich homemade broth!
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Got It, Back to Cooking
          </button>
        </div>
      </div>
    </div>
  );
};
