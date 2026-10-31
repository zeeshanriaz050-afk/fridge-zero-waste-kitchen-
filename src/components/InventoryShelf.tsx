import React from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  Trash2,
  CheckSquare,
  Square,
  Sparkles,
  ShoppingBag,
  Flame,
  ShieldAlert,
} from 'lucide-react';
import { IngredientItem, LanguageCode, FreshnessLevel } from '../types';

interface InventoryShelfProps {
  items: IngredientItem[];
  onToggleItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onSelectAllUrgent: () => void;
  onClearAll: () => void;
  language: LanguageCode;
}

export const InventoryShelf: React.FC<InventoryShelfProps> = ({
  items,
  onToggleItem,
  onDeleteItem,
  onSelectAllUrgent,
  onClearAll,
  language,
}) => {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-dashed border-stone-300 p-8 text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-400 mx-auto flex items-center justify-center mb-3">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-stone-700">Your Fridge Shelf is Empty</h3>
        <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
          Take a photo, dictate what leftovers you have, or choose a 1-click preset above to fill your fridge inventory!
        </p>
      </div>
    );
  }

  const urgentItems = items.filter((i) => i.freshness === 'urgent_rescue');
  const soonItems = items.filter((i) => i.freshness === 'use_soon');
  const freshItems = items.filter((i) => i.freshness === 'fresh');
  const selectedCount = items.filter((i) => i.isSelected).length;

  const renderBadge = (level: FreshnessLevel, days: number) => {
    switch (level) {
      case 'urgent_rescue':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <Flame className="w-3 h-3 text-rose-600 animate-pulse" />
            <span>Urgent: {days}d left</span>
          </span>
        );
      case 'use_soon':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Use in {days}d</span>
          </span>
        );
      case 'fresh':
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>Fresh ({days}d)</span>
          </span>
        );
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Protein':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Grain/Carb':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Vegetable':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Dairy':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Condiment/Sauce':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-stone-50 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 mb-8">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-stone-200 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
              2
            </span>
            <h3 className="text-base sm:text-lg font-bold text-stone-900">
              {language === 'Urdu'
                ? 'فریج کا سامان اور ایکسپائری الرٹس'
                : language === 'Roman Urdu'
                ? 'Fridge Shelf: Expiring Items & Selection'
                : 'Current Fridge Shelf & Waste Risk'}
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 font-bold text-stone-700 border border-stone-200">
              {selectedCount} / {items.length} Selected
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Check the items you want to cook with today. Uncheck anything you want to save for later.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {urgentItems.length > 0 && (
            <button
              onClick={onSelectAllUrgent}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Select {urgentItems.length} Urgent</span>
            </button>
          )}

          <button
            onClick={onClearAll}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
            title="Clear all items"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Urgent Warning Banner */}
      {urgentItems.length > 0 && (
        <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200/90 text-rose-900 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-lg bg-rose-200 text-rose-800">
              <Flame className="w-4 h-4" />
            </span>
            <span>
              <strong>Food Waste Danger!</strong> You have {urgentItems.length} item(s) that must be cooked within 24 hours to prevent spoilage.
            </span>
          </div>
        </div>
      )}

      {/* Grid of Items */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onToggleItem(item.id)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
              item.isSelected
                ? 'bg-stone-50/80 border-emerald-500 shadow-xs ring-1 ring-emerald-500/30'
                : 'bg-white border-stone-200/80 opacity-60 hover:opacity-100'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start space-x-2.5">
                  <button
                    type="button"
                    className="mt-0.5 text-emerald-600 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleItem(item.id);
                    }}
                  >
                    {item.isSelected ? (
                      <CheckSquare className="w-4 h-4 fill-emerald-100" />
                    ) : (
                      <Square className="w-4 h-4 text-stone-400" />
                    )}
                  </button>

                  <div>
                    <h4 className="text-sm font-bold text-stone-900 leading-tight">
                      {item.name}
                    </h4>
                    {item.localName && (
                      <span className="text-[11px] text-stone-500 block">
                        {item.localName}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteItem(item.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-600 transition-opacity"
                  title="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-2.5 flex items-center space-x-2">
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${getCategoryColor(
                    item.category
                  )}`}
                >
                  {item.category}
                </span>
                <span className="text-[11px] text-stone-600 font-medium">
                  {item.quantity}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between">
              {renderBadge(item.freshness, item.daysLeft)}

              {item.rescueTip && (
                <span
                  className="text-[10px] text-stone-500 truncate max-w-[140px]"
                  title={item.rescueTip}
                >
                  💡 {item.rescueTip}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
