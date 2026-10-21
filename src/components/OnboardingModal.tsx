import React, { useState } from 'react';
import {
  Heart,
  Target,
  ShieldCheck,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Info,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const GOALS = [
  { id: 'balanced_meals', label: 'Eat more balanced meals', desc: 'Focus on proportion and satisfying nourishment' },
  { id: 'dietary_variety', label: 'Improve dietary variety', desc: 'Diversify vegetables, plant fibers, and traditional grains' },
  { id: 'increase_protein', label: 'Increase protein intake', desc: 'Support energy, muscle preservation, and satiety' },
  { id: 'reduce_sodium', label: 'Reduce excess sodium', desc: 'Support healthy blood pressure and heart function' },
  { id: 'improve_fibre', label: 'Improve fibre intake', desc: 'Aid healthy digestion and metabolic wellness' },
  { id: 'manage_health_condition', label: 'Manage nutrition around a health condition', desc: 'Personalized evidence-based guidance for hypertension, diabetes, etc.' },
];

const HEALTH_CONDITIONS = [
  { id: 'high_blood_pressure', label: 'High blood pressure (Hypertension)' },
  { id: 'type_2_diabetes', label: 'Type 2 Diabetes / Prediabetes' },
  { id: 'type_1_diabetes', label: 'Type 1 Diabetes' },
  { id: 'elevated_cholesterol', label: 'Elevated Cholesterol' },
  { id: 'kidney_disease', label: 'Kidney Health Consideration' },
  { id: 'gerd', label: 'Acid Reflux / GERD' },
];

const COMMON_ALLERGIES = [
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

const DIETARY_RESTRICTIONS = [
  'vegetarian',
  'vegan',
  'pescatarian',
  'halal',
  'kosher',
  'low_sodium',
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
}) => {
  const { profile, health, refreshProfile } = useAuth();
  const [step, setStep] = useState<number>(1);

  // Profile fields
  const [primaryGoal, setPrimaryGoal] = useState<string>(
    profile?.primaryGoal || 'balanced_meals'
  );
  const [activityLevel, setActivityLevel] = useState<string>(
    profile?.activityLevel || 'moderately_active'
  );
  const [age, setAge] = useState<string>(profile?.age ? String(profile.age) : '');
  const [gender, setGender] = useState<string>(profile?.gender || 'prefer_not_to_say');
  const [heightCm, setHeightCm] = useState<string>(
    profile?.heightCm ? String(profile.heightCm) : ''
  );
  const [weightKg, setWeightKg] = useState<string>(
    profile?.weightKg ? String(profile.weightKg) : ''
  );

  // Health & Safety fields
  const [healthConditions, setHealthConditions] = useState<string[]>(
    health?.healthConditions || []
  );
  const [allergies, setAllergies] = useState<string[]>(health?.allergies || []);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(
    health?.dietaryRestrictions || []
  );
  const [customNotes, setCustomNotes] = useState<string>(health?.customNotes || '');

  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

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

  const handleFinish = async () => {
    setSaving(true);
    try {
      await api.updateProfile({
        profile: {
          primaryGoal,
          activityLevel: activityLevel as any,
          age: age ? parseInt(age) : null,
          gender,
          heightCm: heightCm ? parseFloat(heightCm) : null,
          weightKg: weightKg ? parseFloat(weightKg) : null,
          onboardingCompleted: true,
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
      onComplete();
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
        {/* Header with Step Tracker */}
        <div className="px-6 py-5 border-b border-stone-100 bg-stone-50/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Welcome to NourishTrack · Step {step} of 3
            </span>
            <h2 className="text-lg font-bold text-stone-900 mt-1">
              {step === 1 && 'What is your primary wellness focus?'}
              {step === 2 && 'Activity & Optional Measurements'}
              {step === 3 && 'Health Considerations & Allergies'}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  s === step
                    ? 'w-6 bg-emerald-600'
                    : s < step
                    ? 'bg-emerald-300'
                    : 'bg-stone-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
          {step === 1 && (
            <div className="space-y-2.5">
              <p className="text-xs text-stone-500 mb-3">
                Select your main nutrition goal. NourishTrack focuses on sustainable dietary patterns, not restrictive crash dieting.
              </p>
              {GOALS.map((goal) => {
                const isSelected = primaryGoal === goal.id;
                return (
                  <div
                    key={goal.id}
                    onClick={() => setPrimaryGoal(goal.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-400 shadow-xs'
                        : 'bg-white border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-stone-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-900">{goal.label}</p>
                      <p className="text-xs text-stone-500 mt-0.5">{goal.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Physical measurements are completely optional. Feel free to skip any sensitive question.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Daily Physical Activity Level
                </label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="sedentary">Sedentary (Desk job, limited exercise)</option>
                  <option value="lightly_active">Lightly Active (Light exercise 1-3 days/week)</option>
                  <option value="moderately_active">Moderately Active (Moderate exercise 3-5 days/week)</option>
                  <option value="very_active">Very Active (Heavy training or physical labor)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Age (Years) <span className="text-stone-400 font-normal">Optional</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 28"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Gender / Sex <span className="text-stone-400 font-normal">Optional</span>
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800"
                  >
                    <option value="prefer_not_to_say">Prefer not to say</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="non_binary">Non-binary</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Height (cm) <span className="text-stone-400 font-normal">Optional</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 175"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Weight (kg) <span className="text-stone-400 font-normal">Optional</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 70"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Evidence-Based Educational Safety:</strong> NourishTrack uses your health considerations to personalize educational reminders (e.g., sodium caution for blood pressure, carb balance for diabetes). We never diagnose or replace your clinician's guidance.
                </span>
              </div>

              {/* Health Conditions */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Optional Diagnosed Health Conditions
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {HEALTH_CONDITIONS.map((cond) => {
                    const active = healthConditions.includes(cond.id);
                    return (
                      <button
                        key={cond.id}
                        type="button"
                        onClick={() => toggleCondition(cond.id)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-medium transition flex items-center justify-between ${
                          active
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold'
                            : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <span>{cond.label}</span>
                        {active && <Check className="w-4 h-4 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Allergies */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Food Allergies (Strictly excluded from suggestions)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_ALLERGIES.map((allergy) => {
                    const active = allergies.includes(allergy);
                    return (
                      <button
                        key={allergy}
                        type="button"
                        onClick={() => toggleAllergy(allergy)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition capitalize ${
                          active
                            ? 'bg-rose-50 border-rose-300 text-rose-800 font-semibold'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        {allergy}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dietary Preferences */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Dietary Preferences
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {DIETARY_RESTRICTIONS.map((res) => {
                    const active = dietaryRestrictions.includes(res);
                    return (
                      <button
                        key={res}
                        type="button"
                        onClick={() => toggleRestriction(res)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition capitalize ${
                          active
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
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
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/60 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-3.5 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-200/60 rounded-xl transition flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={handleFinish}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              {saving ? 'Completing...' : 'Finish & Go to Dashboard'}
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
