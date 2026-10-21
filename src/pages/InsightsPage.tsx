import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ShieldCheck,
  Calendar,
  HelpCircle,
  Info,
  ChevronLeft,
  ChevronRight,
  HeartHandshake,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { DailyInsightResponse } from '../types/index.ts';

export const InsightsPage: React.FC = () => {
  const { profile, health } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [insightData, setInsightData] = useState<DailyInsightResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadInsights = async (dateStr: string) => {
    setLoading(true);
    try {
      const data = await api.getDailyInsights(dateStr);
      setInsightData(data);
    } catch (err) {
      console.error('Failed to load insights:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights(selectedDate);
  }, [selectedDate]);

  const changeDateBy = (days: number) => {
    const cur = new Date(selectedDate);
    cur.setDate(cur.getDate() + days);
    setSelectedDate(cur.toISOString().split('T')[0]);
  };

  const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const insights = insightData?.insights;

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Date Switcher */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900">
              Daily Nutrition Insights
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Supportive, evidence-based review of your recorded eating patterns for {formattedDate}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => changeDateBy(-1)}
            className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-xl text-xs text-stone-700">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent font-medium text-stone-800 focus:outline-none cursor-pointer"
            />
          </div>
          <button
            onClick={() => changeDateBy(1)}
            className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Nonjudgmental Evidence Philosophy Notice */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-3xl flex items-start gap-3 text-xs text-emerald-950">
        <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-emerald-900">
            Our Nonjudgmental Philosophy
          </p>
          <p className="text-emerald-800 leading-relaxed">
            One single day of eating is never proof of a deficiency or medical condition. Nutrition fluctuates naturally. Our goal is simply to observe patterns, provide context, and suggest gentle, realistic additions.
          </p>
        </div>
      </div>

      {/* Data Confidence Card */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Measurement Certainty
          </span>
          <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
            Data Confidence Level:
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase ${
                insights?.dataConfidence === 'high'
                  ? 'bg-emerald-100 text-emerald-800'
                  : insights?.dataConfidence === 'medium'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {insights?.dataConfidence || 'Medium'}
            </span>
          </h3>
          <p className="text-xs text-stone-500">
            {insights?.dataConfidence === 'high'
              ? 'Most foods logged today match verified USDA or Nigerian Food Composition Tables with standard portion units.'
              : insights?.dataConfidence === 'medium'
              ? 'Partial day logged or estimates used. Calculations provide a helpful approximation.'
              : 'Several foods contain estimated or custom portions. Use metrics as a general directional guideline.'}
          </p>
        </div>

        <div className="text-right shrink-0">
          <div className="text-2xl font-extrabold font-mono text-stone-900">
            {insightData?.mealsCount || 0}
          </div>
          <span className="text-[11px] text-stone-400">Meals Recorded Today</span>
        </div>
      </div>

      {/* 3 Pillar Daily Review Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* What Went Well */}
        <div className="bg-white rounded-3xl border border-emerald-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 text-emerald-800">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            </div>
            <h2 className="text-base font-bold">What Went Well</h2>
          </div>

          <div className="space-y-3">
            {insights?.whatWentWell?.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-stone-700 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* What Could Improve */}
        <div className="bg-white rounded-3xl border border-amber-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 text-amber-800">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-amber-700" />
            </div>
            <h2 className="text-base font-bold">What Could Improve</h2>
          </div>

          <div className="space-y-3">
            {insights?.whatCouldImprove?.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-stone-700 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Improvements */}
        <div className="bg-white rounded-3xl border border-sky-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 text-sky-800">
            <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-sky-700" />
            </div>
            <h2 className="text-base font-bold">Practical Suggestions</h2>
          </div>

          <div className="space-y-3">
            {insights?.suggestedImprovements?.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-stone-700 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Personalized Health Considerations Section */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900">
              Personalized Health & Medical Considerations
            </h2>
            <p className="text-xs text-stone-500">
              Evidence-based educational commentary based on your profile preferences
            </p>
          </div>
        </div>

        {insights?.healthConditionNotes ? (
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-700 leading-relaxed whitespace-pre-line space-y-2">
            {insights.healthConditionNotes}
          </div>
        ) : (
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-500">
            No specific health conditions (such as high blood pressure or diabetes) are recorded in your profile. You can add them in the Health & Profile settings at any time to receive tailored guidance.
          </div>
        )}

        <div className="pt-2 flex items-center gap-2 text-[11px] text-stone-400">
          <HeartHandshake className="w-4 h-4 text-stone-400" />
          <span>Educational guidance only. Always confirm clinical modifications with your doctor or clinical dietitian.</span>
        </div>
      </div>
    </div>
  );
};
