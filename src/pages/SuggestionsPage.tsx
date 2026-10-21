import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Utensils,
  Plus,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { FoodSuggestion } from '../types/index.ts';

interface SuggestionsPageProps {
  onOpenLogMeal: () => void;
}

export const SuggestionsPage: React.FC<SuggestionsPageProps> = ({ onOpenLogMeal }) => {
  const { profile, health } = useAuth();
  const [suggestions, setSuggestions] = useState<FoodSuggestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const res = await api.getSuggestions();
      setSuggestions(res.suggestions);
    } catch (err) {
      console.error('Failed to load meal suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Lightbulb className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900">
              What Should I Eat?
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Intelligent recommendations tailored to today's logged meals, health goals, and allergy exclusions.
          </p>
        </div>

        <button
          onClick={loadSuggestions}
          disabled={loading}
          className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Ideas</span>
        </button>
      </div>

      {/* Safety & Allergy Guarantee Pill */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-3xl flex items-start gap-3 text-xs text-emerald-950">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-emerald-900">
            Allergen & Health Constraint Filter Active
          </p>
          <p className="text-emerald-800 leading-relaxed">
            {health?.allergies && health.allergies.length > 0 ? (
              <>
                Excluding your listed allergens: <span className="font-bold underline">{health.allergies.join(', ')}</span>.
              </>
            ) : (
              'No specific allergies recorded in profile.'
            )}{' '}
            {health?.healthConditions && health.healthConditions.length > 0 && (
              <>
                Adjusted for: <span className="font-semibold">{health.healthConditions.map((c) => c.replace(/_/g, ' ')).join(', ')}</span>.
              </>
            )}
          </p>
        </div>
      </div>

      {/* Suggestions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {suggestions.length === 0 ? (
          <div className="col-span-3 bg-white rounded-3xl border border-stone-200 p-8 text-center text-xs text-stone-500">
            No suggestions available. Log your meals today to trigger contextual recommendations!
          </div>
        ) : (
          suggestions.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-stone-200/90 p-6 shadow-xs space-y-4 hover:border-emerald-300 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {item.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-stone-900">
                    {item.calories} kcal
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-stone-900 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Serving: <span className="font-semibold text-stone-700">{item.serving}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2.5 bg-stone-50 rounded-xl text-center text-xs">
                  <div>
                    <span className="text-[10px] text-stone-400 block">Protein</span>
                    <span className="font-bold text-emerald-800">{item.proteinG}g</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Fibre</span>
                    <span className="font-bold text-teal-800">{item.fibreG}g</span>
                  </div>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed bg-stone-50/60 p-3 rounded-xl border border-stone-100">
                  <strong className="text-stone-800">Why this fits:</strong> {item.reason}
                </p>

                <div className="text-[11px] text-stone-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{item.allergensWarning}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100">
                <button
                  onClick={onOpenLogMeal}
                  className="w-full py-2 px-3 rounded-xl bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-stone-700 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log this Meal</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
