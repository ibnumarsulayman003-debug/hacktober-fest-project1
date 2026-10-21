import React, { useState, useEffect } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Edit2,
  Trash2,
  Sparkles,
  BookOpen,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Utensils,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { Meal, MealCategory, Food } from '../types/index.ts';

interface MealJournalPageProps {
  onOpenLogMeal: (category?: MealCategory, date?: string) => void;
  onEditMeal: (meal: Meal) => void;
}

const ALL_CATEGORIES: MealCategory[] = [
  'Breakfast',
  'Brunch',
  'Lunch',
  'Midday snack',
  'Dinner',
  'Evening snack',
  'Other',
];

export const MealJournalPage: React.FC<MealJournalPageProps> = ({
  onOpenLogMeal,
  onEditMeal,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Searchable food composition browser
  const [foodSearch, setFoodSearch] = useState('');
  const [foodCuisineFilter, setFoodCuisineFilter] = useState<'all' | 'Nigerian' | 'Global'>('all');
  const [foodsList, setFoodsList] = useState<Food[]>([]);

  const loadMeals = async (dateStr: string) => {
    setLoading(true);
    try {
      const data = await api.getMeals(dateStr);
      setMeals(data);
    } catch (err) {
      console.error('Failed to load meals:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFoodsCatalog = async (q = '', cuisine = foodCuisineFilter) => {
    try {
      const res = await api.getFoods({
        q,
        cuisine: cuisine === 'all' ? undefined : cuisine,
      });
      setFoodsList(res);
    } catch (err) {
      console.error('Failed to load food catalogue:', err);
    }
  };

  useEffect(() => {
    loadMeals(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    loadFoodsCatalog(foodSearch, foodCuisineFilter);
  }, [foodSearch, foodCuisineFilter]);

  const changeDateBy = (days: number) => {
    const cur = new Date(selectedDate);
    cur.setDate(cur.getDate() + days);
    setSelectedDate(cur.toISOString().split('T')[0]);
  };

  const handleDelete = async (mealId: number) => {
    if (!window.confirm('Delete this meal entry?')) return;
    try {
      await api.deleteMeal(mealId);
      loadMeals(selectedDate);
    } catch (err) {
      console.error('Failed to delete meal:', err);
    }
  };

  // Group meals by category
  const mealsByCategory: Record<string, Meal[]> = {};
  for (const cat of ALL_CATEGORIES) {
    mealsByCategory[cat] = [];
  }
  for (const m of meals) {
    if (!mealsByCategory[m.category]) {
      mealsByCategory[m.category] = [];
    }
    mealsByCategory[m.category].push(m);
  }

  // Day Total calculations
  const dayTotals = meals.reduce(
    (acc, m) => {
      acc.calories += m.totalCalories;
      acc.proteinG += m.totalProteinG;
      acc.carbsG += m.totalCarbsG;
      acc.fatG += m.totalFatG;
      acc.fibreG += m.totalFibreG;
      acc.sodiumMg += m.totalSodiumMg;
      return acc;
    },
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, fibreG: 0, sodiumMg: 0 }
  );

  const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Date Navigation & Summary Banner */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => changeDateBy(-1)}
              className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition"
              title="Previous Day"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900">
                  {formattedDate}
                </h1>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {meals.length} meal entries recorded
              </p>
            </div>

            <button
              onClick={() => changeDateBy(1)}
              className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition"
              title="Next Day"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition"
            >
              Today
            </button>

            <button
              onClick={() => onOpenLogMeal(undefined, selectedDate)}
              className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Log Meal</span>
            </button>
          </div>
        </div>

        {/* Day Totals Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-3 border-t border-stone-100 text-xs text-stone-600">
          <div className="bg-stone-50 p-2.5 rounded-xl">
            <span className="text-[10px] text-stone-400 block uppercase font-bold">Total Energy</span>
            <span className="text-base font-extrabold text-stone-900 font-mono">
              {Math.round(dayTotals.calories)} kcal
            </span>
          </div>
          <div className="bg-stone-50 p-2.5 rounded-xl">
            <span className="text-[10px] text-stone-400 block uppercase font-bold">Protein</span>
            <span className="text-base font-extrabold text-emerald-800 font-mono">
              {Math.round(dayTotals.proteinG)}g
            </span>
          </div>
          <div className="bg-stone-50 p-2.5 rounded-xl">
            <span className="text-[10px] text-stone-400 block uppercase font-bold">Carbohydrates</span>
            <span className="text-base font-extrabold text-amber-800 font-mono">
              {Math.round(dayTotals.carbsG)}g
            </span>
          </div>
          <div className="bg-stone-50 p-2.5 rounded-xl">
            <span className="text-[10px] text-stone-400 block uppercase font-bold">Total Fat</span>
            <span className="text-base font-extrabold text-stone-800 font-mono">
              {Math.round(dayTotals.fatG)}g
            </span>
          </div>
          <div className="bg-stone-50 p-2.5 rounded-xl">
            <span className="text-[10px] text-stone-400 block uppercase font-bold">Dietary Fibre</span>
            <span className="text-base font-extrabold text-teal-800 font-mono">
              {Math.round(dayTotals.fibreG * 10) / 10}g
            </span>
          </div>
          <div className="bg-stone-50 p-2.5 rounded-xl">
            <span className="text-[10px] text-stone-400 block uppercase font-bold">Sodium</span>
            <span className="text-base font-extrabold text-sky-800 font-mono">
              {Math.round(dayTotals.sodiumMg)} mg
            </span>
          </div>
        </div>
      </div>

      {/* Meal Journal Timeline by Category */}
      <div className="space-y-5">
        {ALL_CATEGORIES.map((cat) => {
          const categoryMeals = mealsByCategory[cat] || [];
          return (
            <div
              key={cat}
              className="bg-white rounded-3xl border border-stone-200/80 p-5 sm:p-6 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-stone-900">{cat}</h3>
                    <p className="text-[11px] text-stone-400">
                      {categoryMeals.length} recorded entry{categoryMeals.length === 1 ? '' : 'ies'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onOpenLogMeal(cat, selectedDate)}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-3 py-1.5 rounded-xl transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add to {cat}
                </button>
              </div>

              {categoryMeals.length === 0 ? (
                <div className="p-4 rounded-2xl bg-stone-50/50 border border-dashed border-stone-200 text-center text-xs text-stone-400">
                  No food logged for {cat} today.
                </div>
              ) : (
                <div className="space-y-3">
                  {categoryMeals.map((meal) => (
                    <div
                      key={meal.id}
                      className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-stone-800 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-stone-400" />
                            {meal.time}
                          </span>
                          {meal.notes && (
                            <span className="text-stone-500 italic">· "{meal.notes}"</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onEditMeal(meal)}
                            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(meal.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Items table */}
                      <div className="space-y-1.5">
                        {meal.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 bg-white rounded-xl border border-stone-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-stone-900">
                                  {item.foodName}
                                </span>
                                <span className="text-stone-500">
                                  ({item.quantity} {item.portionUnit})
                                </span>
                                {item.preparationMethod && item.preparationMethod !== 'Standard' && (
                                  <span className="text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                                    {item.preparationMethod}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-stone-400 flex items-center gap-1.5 mt-0.5">
                                <span
                                  className={`px-1 py-0.2 rounded font-mono ${
                                    item.dataQuality === 'verified'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {item.dataQuality} data
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 text-stone-600 font-mono shrink-0">
                              <span className="font-bold text-stone-900">
                                {Math.round(item.calories)} kcal
                              </span>
                              <span className="text-[11px] text-stone-400">
                                {item.proteinG}g P · {item.carbsG}g C · {item.fibreG}g Fib
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Meal Subtotal */}
                      <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between text-xs">
                        <span className="font-bold text-stone-800">
                          Meal Subtotal: {Math.round(meal.totalCalories)} kcal
                        </span>
                        <div className="text-stone-500 text-[11px] font-mono">
                          {Math.round(meal.totalProteinG)}g P · {Math.round(meal.totalCarbsG)}g C · {Math.round(meal.totalFatG)}g F · {Math.round(meal.totalFibreG * 10) / 10}g Fibre · {Math.round(meal.totalSodiumMg)}mg Na
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Verified Food Composition Browser (USDA + Nigerian Tables) */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-stone-900">
                Food Composition Database
              </h2>
            </div>
            <p className="text-xs text-stone-500">
              Browse nutrient tables compiled from Nigerian Food Composition Tables (NBS/FAO) & USDA FoodData Central.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {(['all', 'Nigerian', 'Global'] as const).map((reg) => (
              <button
                key={reg}
                onClick={() => setFoodCuisineFilter(reg)}
                className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition ${
                  foodCuisineFilter === reg
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                }`}
              >
                {reg === 'all' ? 'All' : reg}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search verified foods by name (e.g. Egusi, Jollof, Amala, Salmon, Beans)..."
            value={foodSearch}
            onChange={(e) => setFoodSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Food table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 text-stone-400 text-[10px] uppercase font-bold border-b border-stone-200">
              <tr>
                <th className="py-2.5 px-3">Food Name</th>
                <th className="py-2.5 px-3">Standard Serving</th>
                <th className="py-2.5 px-3">Energy</th>
                <th className="py-2.5 px-3">Protein</th>
                <th className="py-2.5 px-3">Carbs</th>
                <th className="py-2.5 px-3">Fat</th>
                <th className="py-2.5 px-3">Fibre</th>
                <th className="py-2.5 px-3">Sodium</th>
                <th className="py-2.5 px-3">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {foodsList.map((f) => (
                <tr key={f.id} className="hover:bg-stone-50/70 transition">
                  <td className="py-2 px-3 font-semibold text-stone-900">
                    {f.name}
                    {f.allergens && f.allergens.length > 0 && (
                      <span className="block text-[10px] text-rose-600 font-normal">
                        Allergens: {f.allergens.join(', ')}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-stone-500">
                    {f.servingSize} {f.servingUnit}
                  </td>
                  <td className="py-2 px-3 font-bold font-mono text-stone-900">
                    {Math.round(f.calories)} kcal
                  </td>
                  <td className="py-2 px-3 font-mono text-emerald-700 font-medium">{f.proteinG}g</td>
                  <td className="py-2 px-3 font-mono text-amber-700 font-medium">{f.carbsG}g</td>
                  <td className="py-2 px-3 font-mono text-stone-700">{f.fatG}g</td>
                  <td className="py-2 px-3 font-mono text-teal-700 font-medium">{f.fibreG}g</td>
                  <td className="py-2 px-3 font-mono text-stone-700">{f.sodiumMg}mg</td>
                  <td className="py-2 px-3 text-[10px] text-stone-400">
                    <span className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 truncate max-w-[120px] block">
                      {f.dataSource}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
