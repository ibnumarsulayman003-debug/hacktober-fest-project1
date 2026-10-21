import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Search,
  Check,
  AlertCircle,
  Sparkles,
  Utensils,
  Flame,
  Info,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { Food, Meal, MealCategory, MealItem } from '../types/index.ts';

interface MealLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMealSaved: () => void;
  initialMeal?: Meal | null;
  defaultDate?: string;
  defaultCategory?: MealCategory;
}

const MEAL_CATEGORIES: MealCategory[] = [
  'Breakfast',
  'Brunch',
  'Lunch',
  'Midday snack',
  'Dinner',
  'Evening snack',
  'Other',
];

const PREPARATION_METHODS = [
  'Standard',
  'Boiled / Steamed',
  'Fried / Sautéed',
  'Grilled / Roasted',
  'Stewed / In Broth',
  'Raw / Fresh',
  'Baked',
];

export const MealLoggerModal: React.FC<MealLoggerModalProps> = ({
  isOpen,
  onClose,
  onMealSaved,
  initialMeal,
  defaultDate,
  defaultCategory = 'Lunch',
}) => {
  const [category, setCategory] = useState<MealCategory>(defaultCategory);
  const [date, setDate] = useState<string>(
    defaultDate || new Date().toISOString().split('T')[0]
  );
  const [time, setTime] = useState<string>('13:00');
  const [notes, setNotes] = useState<string>('');
  const [items, setItems] = useState<MealItem[]>([]);

  // Food search & staging state
  const [searchQuery, setSearchQuery] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState<'all' | 'Nigerian' | 'Global'>('all');
  const [availableFoods, setAvailableFoods] = useState<Food[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [portionSize, setPortionSize] = useState<number>(1);
  const [portionUnit, setPortionUnit] = useState<string>('serving');
  const [prepMethod, setPrepMethod] = useState<string>('Standard');

  // Custom food tab state
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState<string>('');
  const [customProtein, setCustomProtein] = useState<string>('');
  const [customCarbs, setCustomCarbs] = useState<string>('');
  const [customFat, setCustomFat] = useState<string>('');
  const [customFibre, setCustomFibre] = useState<string>('');
  const [customSodium, setCustomSodium] = useState<string>('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize or reset when opened
  useEffect(() => {
    if (isOpen) {
      if (initialMeal) {
        setCategory(initialMeal.category);
        setDate(initialMeal.date);
        setTime(initialMeal.time);
        setNotes(initialMeal.notes || '');
        setItems(initialMeal.items || []);
      } else {
        setCategory(defaultCategory);
        setDate(defaultDate || new Date().toISOString().split('T')[0]);
        const now = new Date();
        setTime(
          `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
        );
        setNotes('');
        setItems([]);
      }
      setSelectedFood(null);
      setSearchQuery('');
      setError(null);
      loadFoods();
    }
  }, [isOpen, initialMeal, defaultDate, defaultCategory]);

  const loadFoods = async (query = '', cuisine = cuisineFilter) => {
    try {
      const results = await api.getFoods({
        q: query,
        cuisine: cuisine === 'all' ? undefined : cuisine,
      });
      setAvailableFoods(results);
      if (!selectedFood && results.length > 0) {
        selectFoodForInput(results[0]);
      }
    } catch (err) {
      console.error('Failed to load foods:', err);
    }
  };

  const selectFoodForInput = (food: Food) => {
    setSelectedFood(food);
    setPortionSize(food.servingSize);
    setPortionUnit(food.servingUnit);
    setQuantity(1);
    setPrepMethod('Standard');
  };

  // Trigger search on query / filter change
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    loadFoods(val, cuisineFilter);
  };

  const handleCuisineFilterChange = (c: 'all' | 'Nigerian' | 'Global') => {
    setCuisineFilter(c);
    loadFoods(searchQuery, c);
  };

  // Add currently staged food to items array
  const handleAddItem = () => {
    if (isCustomMode) {
      if (!customName.trim()) {
        setError('Please provide a food name.');
        return;
      }
      const cal = parseFloat(customCalories) || 0;
      const pro = parseFloat(customProtein) || 0;
      const car = parseFloat(customCarbs) || 0;
      const fat = parseFloat(customFat) || 0;
      const fib = parseFloat(customFibre) || 0;
      const sod = parseFloat(customSodium) || 0;

      const newItem: MealItem = {
        foodId: null,
        foodName: customName.trim(),
        portionSize: 1,
        portionUnit: 'portion',
        quantity: Math.max(1, quantity),
        preparationMethod: prepMethod,
        calories: Math.round(cal * quantity),
        proteinG: Math.round(pro * quantity * 10) / 10,
        carbsG: Math.round(car * quantity * 10) / 10,
        fatG: Math.round(fat * quantity * 10) / 10,
        fibreG: Math.round(fib * quantity * 10) / 10,
        sodiumMg: Math.round(sod * quantity),
        addedSugarG: 0,
        dataQuality: 'estimate',
      };

      setItems([...items, newItem]);
      setCustomName('');
      setCustomCalories('');
      setCustomProtein('');
      setCustomCarbs('');
      setCustomFat('');
      setCustomFibre('');
      setCustomSodium('');
      setIsCustomMode(false);
      setError(null);
      return;
    }

    if (!selectedFood) {
      setError('Please select a food from the database or enter a custom one.');
      return;
    }

    const mult = quantity;
    const newItem: MealItem = {
      foodId: selectedFood.id,
      foodName: selectedFood.name,
      portionSize: selectedFood.servingSize,
      portionUnit: selectedFood.servingUnit,
      quantity: mult,
      preparationMethod: prepMethod,
      calories: Math.round(selectedFood.calories * mult),
      proteinG: Math.round(selectedFood.proteinG * mult * 10) / 10,
      carbsG: Math.round(selectedFood.carbsG * mult * 10) / 10,
      fatG: Math.round(selectedFood.fatG * mult * 10) / 10,
      fibreG: Math.round((selectedFood.fibreG || 0) * mult * 10) / 10,
      sodiumMg: Math.round((selectedFood.sodiumMg || 0) * mult),
      addedSugarG: Math.round((selectedFood.addedSugarG || 0) * mult * 10) / 10,
      dataQuality: selectedFood.dataQuality,
    };

    setItems([...items, newItem]);
    setError(null);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Compute live meal total
  const liveTotal = items.reduce(
    (acc, it) => {
      acc.calories += it.calories;
      acc.proteinG += it.proteinG;
      acc.carbsG += it.carbsG;
      acc.fatG += it.fatG;
      acc.fibreG += it.fibreG;
      acc.sodiumMg += it.sodiumMg;
      return acc;
    },
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, fibreG: 0, sodiumMg: 0 }
  );

  const handleSaveMeal = async () => {
    if (items.length === 0) {
      setError('Please add at least one food item to this meal.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (initialMeal) {
        await api.updateMeal(initialMeal.id, {
          category,
          date,
          time,
          notes,
          items,
        });
      } else {
        await api.createMeal({
          category,
          date,
          time,
          notes,
          items,
        });
      }

      onMealSaved();
      onClose();
    } catch (err: any) {
      console.error('Failed to save meal:', err);
      setError(err.message || 'Failed to save meal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                {initialMeal ? 'Edit Meal Entry' : 'Record a Meal'}
              </h2>
              <p className="text-xs text-stone-500">
                Add one or multiple food items with verified nutrition data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Meal Details: Category, Date, Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Meal Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MealCategory)}
                className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {MEAL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Time Consumed
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Food Selection Section */}
          <div className="bg-stone-50/80 p-4 rounded-2xl border border-stone-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Add Food to this Meal
              </span>
              <div className="flex items-center bg-stone-200/80 p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className={`px-2.5 py-1 rounded-md font-medium transition ${
                    !isCustomMode
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Database Search
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomMode(true)}
                  className={`px-2.5 py-1 rounded-md font-medium transition ${
                    isCustomMode
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Custom Food
                </button>
              </div>
            </div>

            {!isCustomMode ? (
              <div className="space-y-3">
                {/* Search Bar & Region Filters */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search Jollof, Amala, Plantain, Salmon, Beans, Oats..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {(['all', 'Nigerian', 'Global'] as const).map((reg) => (
                      <button
                        key={reg}
                        type="button"
                        onClick={() => handleCuisineFilterChange(reg)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition ${
                          cuisineFilter === reg
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        {reg === 'all' ? 'All Foods' : reg}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Available food pill list */}
                <div className="max-h-36 overflow-y-auto space-y-1 pr-1 border border-stone-200/60 rounded-xl p-2 bg-white">
                  {availableFoods.length === 0 ? (
                    <div className="text-center py-4 text-xs text-stone-400">
                      No foods found matching "{searchQuery}". You can add it via the "Custom Food" tab!
                    </div>
                  ) : (
                    availableFoods.map((f) => {
                      const isSel = selectedFood?.id === f.id;
                      return (
                        <div
                          key={f.id}
                          onClick={() => selectFoodForInput(f)}
                          className={`p-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition ${
                            isSel
                              ? 'bg-emerald-50 border border-emerald-300 text-emerald-950 font-medium'
                              : 'hover:bg-stone-50 border border-transparent text-stone-700'
                          }`}
                        >
                          <div className="truncate mr-2">
                            <span className="font-semibold">{f.name}</span>
                            <span className="text-[11px] text-stone-500 ml-1.5">
                              ({f.servingSize} {f.servingUnit})
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-stone-100 text-stone-600 font-mono">
                              {Math.round(f.calories)} kcal
                            </span>
                            <span
                              className={`text-[9px] px-1 py-0.5 rounded uppercase font-semibold ${
                                f.cuisineRegion === 'Nigerian'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-sky-100 text-sky-800'
                              }`}
                            >
                              {f.cuisineRegion}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Selected Food Specs: Quantity, Prep Method, Preview */}
                {selectedFood && (
                  <div className="p-3 bg-white rounded-xl border border-emerald-200/80 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-900">
                        Selected: {selectedFood.name}
                      </span>
                      <span className="text-[11px] text-stone-500">
                        Base: {selectedFood.servingSize} {selectedFood.servingUnit}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-stone-600 font-medium mb-1">
                          Portion / Serving Multiplier
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0.25"
                            step="0.25"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(0.1, parseFloat(e.target.value) || 1))}
                            className="w-24 bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-800 font-medium"
                          />
                          <span className="text-stone-500 text-[11px]">
                            x ({selectedFood.servingUnit})
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-stone-600 font-medium mb-1">
                          Preparation Method
                        </label>
                        <select
                          value={prepMethod}
                          onChange={(e) => setPrepMethod(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-800"
                        >
                          {PREPARATION_METHODS.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Calculated Live Nutrition for this portion */}
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 p-2 bg-stone-50 rounded-lg text-center text-[11px]">
                      <div>
                        <span className="text-stone-400 block text-[9px]">Calories</span>
                        <span className="font-bold text-stone-800">
                          {Math.round(selectedFood.calories * quantity)}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[9px]">Protein</span>
                        <span className="font-semibold text-emerald-700">
                          {Math.round(selectedFood.proteinG * quantity * 10) / 10}g
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[9px]">Carbs</span>
                        <span className="font-semibold text-amber-700">
                          {Math.round(selectedFood.carbsG * quantity * 10) / 10}g
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[9px]">Fat</span>
                        <span className="font-semibold text-stone-700">
                          {Math.round(selectedFood.fatG * quantity * 10) / 10}g
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[9px]">Fibre</span>
                        <span className="font-semibold text-teal-700">
                          {Math.round((selectedFood.fibreG || 0) * quantity * 10) / 10}g
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[9px]">Sodium</span>
                        <span className="font-semibold text-stone-700">
                          {Math.round((selectedFood.sodiumMg || 0) * quantity)}mg
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <Plus className="w-4 h-4" />
                      Add This Food Item
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Custom Food Form */
              <div className="space-y-3 bg-white p-3.5 rounded-xl border border-stone-200">
                <div className="text-xs text-stone-600 mb-1">
                  Food not listed in our database? Enter details below (marked as user-estimate).
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-stone-600 mb-0.5">Food Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Grandma's Ofe Nsala"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-800"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-0.5">Estimated Calories *</label>
                    <input
                      type="number"
                      placeholder="e.g. 280"
                      value={customCalories}
                      onChange={(e) => setCustomCalories(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-xs">
                  <div>
                    <label className="block text-stone-500 text-[10px]">Protein (g)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={customProtein}
                      onChange={(e) => setCustomProtein(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg p-1.5 text-stone-800"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-500 text-[10px]">Carbs (g)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={customCarbs}
                      onChange={(e) => setCustomCarbs(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg p-1.5 text-stone-800"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-500 text-[10px]">Fat (g)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={customFat}
                      onChange={(e) => setCustomFat(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg p-1.5 text-stone-800"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-500 text-[10px]">Fibre (g)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={customFibre}
                      onChange={(e) => setCustomFibre(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg p-1.5 text-stone-800"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-500 text-[10px]">Sodium (mg)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={customSodium}
                      onChange={(e) => setCustomSodium(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg p-1.5 text-stone-800"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  Add Custom Food
                </button>
              </div>
            )}
          </div>

          {/* Staged Items List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Foods in this meal ({items.length})
              </span>
              {items.length > 0 && (
                <span className="text-xs text-stone-500 font-mono">
                  Total: {Math.round(liveTotal.calories)} kcal
                </span>
              )}
            </div>

            {items.length === 0 ? (
              <div className="p-6 border-2 border-dashed border-stone-200 rounded-2xl text-center text-xs text-stone-400">
                No items added yet. Select food above to build your meal plate.
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white border border-stone-200 rounded-xl flex items-center justify-between text-xs hover:border-stone-300 transition"
                  >
                    <div>
                      <p className="font-semibold text-stone-900">{item.foodName}</p>
                      <p className="text-[11px] text-stone-500">
                        {item.quantity} {item.portionUnit}
                        {item.preparationMethod && item.preparationMethod !== 'Standard' && (
                          <span className="ml-1 text-stone-400">({item.preparationMethod})</span>
                        )}
                        <span
                          className={`ml-2 text-[10px] px-1 py-0.5 rounded font-mono ${
                            item.dataQuality === 'verified'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {item.dataQuality}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-bold text-stone-800">{Math.round(item.calories)} kcal</span>
                        <div className="text-[10px] text-stone-400">
                          {item.proteinG}g P · {item.carbsG}g C · {item.fibreG}g Fib
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Meal Total Nutrients Card */}
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-bold text-emerald-950">Meal Total:</span>
                    <span className="ml-1 font-extrabold text-emerald-800 text-sm">
                      {Math.round(liveTotal.calories)} kcal
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-medium text-emerald-900">
                    <span>Protein: {Math.round(liveTotal.proteinG)}g</span>
                    <span>Carbs: {Math.round(liveTotal.carbsG)}g</span>
                    <span>Fat: {Math.round(liveTotal.fatG)}g</span>
                    <span>Fibre: {Math.round(liveTotal.fibreG * 10) / 10}g</span>
                    <span>Sodium: {Math.round(liveTotal.sodiumMg)}mg</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Optional Meal Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Optional Notes (e.g. restaurant name, seasoning, satiety)
            </label>
            <input
              type="text"
              placeholder="e.g. Light oil used; feeling satisfied without heaviness"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-stone-100 flex items-center justify-end gap-2.5 bg-stone-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-200/60 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving || items.length === 0}
            onClick={handleSaveMeal}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
          >
            {saving ? (
              'Saving...'
            ) : (
              <>
                <Check className="w-4 h-4" />
                {initialMeal ? 'Update Meal' : 'Save Meal Entry'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
