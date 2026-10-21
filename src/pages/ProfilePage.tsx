import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  Target,
  Activity,
  Heart,
  Save,
  Trash2,
  AlertTriangle,
  Lock,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';

const GOALS = [
  { id: 'balanced_meals', label: 'Eat more balanced meals' },
  { id: 'dietary_variety', label: 'Improve dietary variety' },
  { id: 'increase_protein', label: 'Increase protein intake' },
  { id: 'reduce_sodium', label: 'Reduce excess sodium' },
  { id: 'improve_fibre', label: 'Improve fibre intake' },
  { id: 'manage_health_condition', label: 'Manage nutrition around a health condition' },
];

const HEALTH_CONDITIONS = [
  { id: 'high_blood_pressure', label: 'High blood pressure (Hypertension)' },
  { id: 'type_2_diabetes', label: 'Type 2 Diabetes / Prediabetes' },
  { id: 'type_1_diabetes', label: 'Type 1 Diabetes' },
  { id: 'elevated_cholesterol', label: 'Elevated Cholesterol' },
  { id: 'kidney_disease', label: 'Kidney Health Consideration' },
  { id: 'gerd', label: 'Acid Reflux / GERD' },
];

const ALLERGIES_LIST = [
  'peanuts',
  'tree_nuts',
  'shellfish',
  'fish',
  'dairy',
  'eggs',
  'soy',
  'wheat / gluten',
  'sesame',
];

const RESTRICTIONS_LIST = [
  'vegetarian',
  'vegan',
  'pescatarian',
  'halal',
  'kosher',
  'low_sodium',
];

export const ProfilePage: React.FC = () => {
  const { user, profile, health, refreshProfile, logout } = useAuth();

  const [primaryGoal, setPrimaryGoal] = useState<string>('balanced_meals');
  const [activityLevel, setActivityLevel] = useState<string>('moderately_active');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('prefer_not_to_say');
  const [heightCm, setHeightCm] = useState<string>('');
  const [weightKg, setWeightKg] = useState<string>('');

  // Nutrient targets
  const [targetCalories, setTargetCalories] = useState<string>('2000');
  const [targetProteinG, setTargetProteinG] = useState<string>('75');
  const [targetCarbsG, setTargetCarbsG] = useState<string>('250');
  const [targetFatG, setTargetFatG] = useState<string>('65');
  const [targetFibreG, setTargetFibreG] = useState<string>('28');
  const [targetSodiumMg, setTargetSodiumMg] = useState<string>('2000');

  // Health
  const [healthConditions, setHealthConditions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [customNotes, setCustomNotes] = useState<string>('');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (profile) {
      setPrimaryGoal(profile.primaryGoal || 'balanced_meals');
      setActivityLevel(profile.activityLevel || 'moderately_active');
      setAge(profile.age ? String(profile.age) : '');
      setGender(profile.gender || 'prefer_not_to_say');
      setHeightCm(profile.heightCm ? String(profile.heightCm) : '');
      setWeightKg(profile.weightKg ? String(profile.weightKg) : '');
      setTargetCalories(String(profile.targetCalories || 2000));
      setTargetProteinG(String(profile.targetProteinG || 75));
      setTargetCarbsG(String(profile.targetCarbsG || 250));
      setTargetFatG(String(profile.targetFatG || 65));
      setTargetFibreG(String(profile.targetFibreG || 28));
      setTargetSodiumMg(String(profile.targetSodiumMg || 2000));
    }
    if (health) {
      setHealthConditions(health.healthConditions || []);
      setAllergies(health.allergies || []);
      setDietaryRestrictions(health.dietaryRestrictions || []);
      setCustomNotes(health.customNotes || '');
    }
  }, [profile, health]);

  const toggleCondition = (id: string) => {
    setHealthConditions((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleAllergy = (allergy: string) => {
    setAllergies((prev) =>
      prev.includes(allergy) ? prev.filter((a) => a !== allergy) : [...prev, allergy]
    );
  };

  const toggleRestriction = (rest: string) => {
    setDietaryRestrictions((prev) =>
      prev.includes(rest) ? prev.filter((r) => r !== rest) : [...prev, rest]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await api.updateProfile({
        profile: {
          primaryGoal,
          activityLevel: activityLevel as any,
          age: age ? parseInt(age) : null,
          gender,
          heightCm: heightCm ? parseFloat(heightCm) : null,
          weightKg: weightKg ? parseFloat(weightKg) : null,
          targetCalories: parseInt(targetCalories) || 2000,
          targetProteinG: parseInt(targetProteinG) || 75,
          targetCarbsG: parseInt(targetCarbsG) || 250,
          targetFatG: parseInt(targetFatG) || 65,
          targetFibreG: parseInt(targetFibreG) || 28,
          targetSodiumMg: parseInt(targetSodiumMg) || 2000,
        },
        health: {
          healthConditions,
          allergies,
          dietaryRestrictions,
          customNotes,
          clinicalAdviceAcknowledged: true,
        },
      });

      await refreshProfile();
      setMessage('Profile and preferences updated successfully!');
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setMessage('Error updating profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAllData = async () => {
    try {
      await api.deleteUserData();
      await logout();
      alert('All your meal records and account data have been deleted.');
    } catch (err) {
      console.error('Delete data failed:', err);
      alert('Failed to delete data.');
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900">
              Profile & Health Preferences
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Personalize your nutritional reference baselines, health goals, and allergy constraints.
          </p>
        </div>

        {user && (
          <span className="text-xs font-mono text-stone-400 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200">
            {user.email}
          </span>
        )}
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2 text-xs font-semibold text-emerald-900">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Goal & Activity Card */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-stone-900">Personal Nutrition Goal</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {GOALS.map((g) => {
              const active = primaryGoal === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setPrimaryGoal(g.id)}
                  className={`p-3 rounded-xl border text-left font-medium transition ${
                    active
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {g.label}
                </button>
              );
            })}
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Activity Level
            </label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
              className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800"
            >
              <option value="sedentary">Sedentary (mostly sitting)</option>
              <option value="lightly_active">Lightly active (light walking 1-3 days)</option>
              <option value="moderately_active">Moderately active (exercise 3-5 days)</option>
              <option value="very_active">Very active (heavy physical activity)</option>
            </select>
          </div>
        </div>

        {/* Nutritional Reference Targets */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-stone-900">
                Daily Reference Targets
              </h2>
            </div>
            <span className="text-[11px] text-stone-400">
              Customize values or keep evidence-based defaults
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Target Calories (kcal)</label>
              <input
                type="number"
                value={targetCalories}
                onChange={(e) => setTargetCalories(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-mono text-stone-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Target Protein (g)</label>
              <input
                type="number"
                value={targetProteinG}
                onChange={(e) => setTargetProteinG(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-mono text-stone-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Target Carbs (g)</label>
              <input
                type="number"
                value={targetCarbsG}
                onChange={(e) => setTargetCarbsG(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-mono text-stone-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Target Fat (g)</label>
              <input
                type="number"
                value={targetFatG}
                onChange={(e) => setTargetFatG(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-mono text-stone-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Target Fibre (g)</label>
              <input
                type="number"
                value={targetFibreG}
                onChange={(e) => setTargetFibreG(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-mono text-stone-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Target Sodium (mg)</label>
              <input
                type="number"
                value={targetSodiumMg}
                onChange={(e) => setTargetSodiumMg(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-mono text-stone-900"
              />
            </div>
          </div>
        </div>

        {/* Health Conditions & Allergies */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-600" />
            <h2 className="text-base font-bold text-stone-900">
              Health Considerations & Allergies
            </h2>
          </div>

          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-600 leading-relaxed">
            These selections allow the application to provide condition-specific educational observations (e.g. sodium intake alerts for hypertension, carb consistency notes for diabetes, and strict avoidance of listed food allergens in suggestions).
          </div>

          {/* Health Conditions */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-2">
              Diagnosed Health Conditions
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {HEALTH_CONDITIONS.map((cond) => {
                const active = healthConditions.includes(cond.id);
                return (
                  <button
                    key={cond.id}
                    type="button"
                    onClick={() => toggleCondition(cond.id)}
                    className={`p-2.5 rounded-xl border text-left font-medium transition ${
                      active
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {cond.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Allergies */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-2">
              Food Allergies (Strictly filtered out of meal suggestions)
            </label>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {ALLERGIES_LIST.map((allergy) => {
                const active = allergies.includes(allergy);
                return (
                  <button
                    key={allergy}
                    type="button"
                    onClick={() => toggleAllergy(allergy)}
                    className={`px-3 py-1.5 rounded-lg border capitalize transition ${
                      active
                        ? 'bg-rose-50 border-rose-300 text-rose-800 font-bold'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {allergy}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-2">
              Dietary Restrictions
            </label>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {RESTRICTIONS_LIST.map((res) => {
                const active = dietaryRestrictions.includes(res);
                return (
                  <button
                    key={res}
                    type="button"
                    onClick={() => toggleRestriction(res)}
                    className={`px-3 py-1.5 rounded-lg border capitalize transition ${
                      active
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {res}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-sm transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>

      {/* Privacy, Data Security & Deletion Card */}
      <div className="bg-white rounded-3xl border border-rose-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-rose-900">
          <Lock className="w-5 h-5 text-rose-600" />
          <h2 className="text-base font-bold">Privacy & Data Governance</h2>
        </div>
        <p className="text-xs text-stone-600 leading-relaxed">
          Health and dietary data are sensitive. Your meal records are private to your authenticated user account in PostgreSQL. In full compliance with privacy best practices, you can delete all your meal logs, health preferences, and profile data permanently at any time.
        </p>

        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete All My Data</span>
          </button>
        ) : (
          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-300 space-y-3 text-xs text-rose-900">
            <p className="font-bold">
              Are you sure? This action is permanent and will wipe all your meal entries, profile details, and health data.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDeleteAllData}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition"
              >
                Yes, Permanently Delete Everything
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 text-stone-600 hover:bg-rose-100 rounded-xl text-xs transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
