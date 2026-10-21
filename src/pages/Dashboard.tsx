import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Flame,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  CheckCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Heart,
  Edit2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { DailyInsightResponse, Meal } from '../types/index.ts';

interface DashboardProps {
  onOpenLogMeal: (category?: any) => void;
  onNavigateToJournal: () => void;
  onNavigateToInsights: () => void;
  onNavigateToSuggestions: () => void;
  onEditMeal: (meal: Meal) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenLogMeal,
  onNavigateToJournal,
  onNavigateToInsights,
  onNavigateToSuggestions,
  onEditMeal,
}) => {
  const { user, profile, health } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [dailyData, setDailyData] = useState<DailyInsightResponse | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async (dateStr: string) => {
    setLoading(true);
    try {
      const [insightRes, mealList] = await Promise.all([
        api.getDailyInsights(dateStr),
        api.getMeals(dateStr),
      ]);
      setDailyData(insightRes);
      setMeals(mealList);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedDate);
  }, [selectedDate]);

  const handleDeleteMeal = async (mealId: number) => {
    if (!window.confirm('Are you sure you want to delete this meal record?')) return;
    try {
      await api.deleteMeal(mealId);
      loadData(selectedDate);
    } catch (err) {
      console.error('Failed to delete meal:', err);
    }
  };

  // Formatted date string
  const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const totals = dailyData?.totals || {
    calories: 0,
    proteinG: 0,
    carbsG: 0,
    fatG: 0,
    fibreG: 0,
    sodiumMg: 0,
    sugarG: 0,
  };

  const targets = dailyData?.targets || {
    calories: 2000,
    proteinG: 75,
    carbsG: 250,
    fatG: 65,
    fibreG: 28,
    sodiumMg: 2000,
  };

  const caloriePercent = Math.min(100, Math.round((totals.calories / targets.calories) * 100));
  const proteinPercent = Math.min(100, Math.round((totals.proteinG / targets.proteinG) * 100));
  const carbsPercent = Math.min(100, Math.round((totals.carbsG / targets.carbsG) * 100));
  const fatPercent = Math.min(100, Math.round((totals.fatG / targets.fatG) * 100));
  const fibrePercent = Math.min(100, Math.round((totals.fibreG / targets.fibreG) * 100));

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome & Date Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/60">
            Daily Nutrition Snapshot
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
            Welcome back, {user?.displayName?.split(' ')[0] || 'Friend'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Focus: <span className="font-semibold text-stone-700">{profile?.primaryGoal?.replace(/_/g, ' ') || 'Balanced meals'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-2xl text-xs text-stone-700">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent font-medium text-stone-800 focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => onOpenLogMeal()}
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Meal</span>
          </button>
        </div>
      </div>

      {/* Main Nutrition Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calories Card */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Total Energy
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-stone-900 tracking-tight">
              {totals.calories}{' '}
              <span className="text-xs font-semibold text-stone-400">/ {targets.calories} kcal</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              {targets.calories - totals.calories > 0
                ? `${targets.calories - totals.calories} kcal remaining to reference target`
                : `${totals.calories - targets.calories} kcal above reference target`}
            </p>
          </div>
          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${caloriePercent}%` }}
            />
          </div>
        </div>

        {/* Protein Card */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Protein
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-stone-900 tracking-tight">
              {totals.proteinG}g{' '}
              <span className="text-xs font-semibold text-stone-400">/ {targets.proteinG}g</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              {proteinPercent}% of daily goal
            </p>
          </div>
          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${proteinPercent}%` }}
            />
          </div>
        </div>

        {/* Fibre Card */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Dietary Fibre
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-stone-900 tracking-tight">
              {totals.fibreG}g{' '}
              <span className="text-xs font-semibold text-stone-400">/ {targets.fibreG}g</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Digestive health & satiety
            </p>
          </div>
          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-teal-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${fibrePercent}%` }}
            />
          </div>
        </div>

        {/* Sodium Card */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Sodium
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-stone-900 tracking-tight">
              {totals.sodiumMg}{' '}
              <span className="text-xs font-semibold text-stone-400">/ {targets.sodiumMg} mg</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              {totals.sodiumMg > targets.sodiumMg ? (
                <span className="text-amber-600 font-semibold">Above daily recommended threshold</span>
              ) : (
                <span className="text-emerald-700 font-semibold">Within reference baseline</span>
              )}
            </p>
          </div>
          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                totals.sodiumMg > targets.sodiumMg ? 'bg-amber-500' : 'bg-sky-500'
              }`}
              style={{ width: `${Math.min(100, Math.round((totals.sodiumMg / targets.sodiumMg) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Daily Personalized Insight Callout Card */}
      {dailyData && (
        <div className="bg-gradient-to-r from-emerald-900 to-stone-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  Evidence-Based Daily Review
                </span>
                <span className="text-[11px] text-stone-300">
                  Confidence: <span className="uppercase font-mono text-emerald-300">{dailyData.insights.dataConfidence}</span>
                </span>
              </div>
              <h3 className="text-lg font-bold">
                {dailyData.insights.whatWentWell[0] || 'Keep recording your meals.'}
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                {dailyData.insights.suggestedImprovements[0] ||
                  'Consistent tracking helps uncover subtle trends in your diet.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
              <button
                onClick={onNavigateToInsights}
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-white/20 transition flex items-center justify-center gap-1.5"
              >
                <span>Full Daily Review</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={onNavigateToSuggestions}
                className="bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <span>What to Eat Next</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meals Recorded Today */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-stone-900">
              Meals Recorded for {formattedDate}
            </h2>
            <p className="text-xs text-stone-500">
              {meals.length} meal window{meals.length === 1 ? '' : 's'} recorded
            </p>
          </div>

          <button
            onClick={onNavigateToJournal}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition"
          >
            <span>View Full Meal Journal</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {meals.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-stone-300 p-10 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-stone-800">
                No meals recorded for this day yet
              </h3>
              <p className="text-xs text-stone-500">
                Start tracking what you ate today to reveal detailed nutrition metrics and personalized guidance.
              </p>
            </div>
            <button
              onClick={() => onOpenLogMeal('Breakfast')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Log Breakfast or Snack
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {meals.map((meal) => (
              <div
                key={meal.id}
                className="bg-white rounded-3xl border border-stone-200/80 p-5 shadow-xs space-y-3 hover:border-emerald-200 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-stone-900">
                        {meal.category}
                      </span>
                      <span className="text-xs text-stone-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {meal.time}
                      </span>
                    </div>
                    {meal.notes && (
                      <p className="text-xs text-stone-500 italic mt-0.5">"{meal.notes}"</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onEditMeal(meal)}
                      className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
                      title="Edit meal"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteMeal(meal.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete meal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Foods list */}
                <div className="space-y-1.5 pt-1">
                  {meal.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="text-xs flex items-center justify-between text-stone-700 bg-stone-50/80 p-2 rounded-xl"
                    >
                      <div className="truncate mr-2">
                        <span className="font-semibold text-stone-800">{it.foodName}</span>
                        <span className="text-stone-500 ml-1.5">
                          ({it.quantity} {it.portionUnit})
                        </span>
                      </div>
                      <span className="font-mono text-stone-600 shrink-0 font-medium">
                        {Math.round(it.calories)} kcal
                      </span>
                    </div>
                  ))}
                </div>

                {/* Meal Totals Pill */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-900">
                    Total: {Math.round(meal.totalCalories)} kcal
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-stone-500">
                    <span>{Math.round(meal.totalProteinG)}g P</span>
                    <span>·</span>
                    <span>{Math.round(meal.totalCarbsG)}g C</span>
                    <span>·</span>
                    <span>{Math.round(meal.totalFibreG * 10) / 10}g Fib</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
