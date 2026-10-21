import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Info,
  ChevronLeft,
  ChevronRight,
  Utensils,
  Leaf,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { api } from '../services/api.ts';
import { WeeklyReportResponse } from '../types/index.ts';

export const WeeklyReportsPage: React.FC = () => {
  const [report, setReport] = useState<WeeklyReportResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const loadReport = async (dateStr: string) => {
    setLoading(true);
    try {
      const data = await api.getWeeklyReport(dateStr);
      setReport(data);
    } catch (err) {
      console.error('Failed to load weekly report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport(endDate);
  }, [endDate]);

  const averages = report?.averages || {
    calories: 0,
    proteinG: 0,
    carbsG: 0,
    fatG: 0,
    fibreG: 0,
    sodiumMg: 0,
  };

  const targets = report?.targets || {
    calories: 2000,
    proteinG: 75,
    carbsG: 250,
    fatG: 65,
    fibreG: 28,
    sodiumMg: 2000,
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900">
              Weekly Nutrition Report
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Analyzing patterns from {report?.startDate || '...'} to {report?.endDate || '...'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-stone-500">Ending on:</span>
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-xl text-stone-700">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent font-medium text-stone-800 focus:outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Days Logged Card */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Recording Consistency
          </span>
          <div className="text-3xl font-extrabold text-stone-900 font-mono">
            {report?.daysLogged ?? 0}{' '}
            <span className="text-xs font-semibold text-stone-400">/ 7 Days Logged</span>
          </div>
          <p className="text-[11px] text-stone-500">
            {report?.daysLogged && report.daysLogged >= 5
              ? 'Excellent tracking frequency for reliable weekly insights.'
              : 'Days with no entries are treated as unrecorded, not skipped meals.'}
          </p>
        </div>

        {/* Avg Daily Calories */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Average Daily Energy
          </span>
          <div className="text-3xl font-extrabold text-stone-900 font-mono">
            {averages.calories}{' '}
            <span className="text-xs font-semibold text-stone-400">/ {targets.calories} kcal</span>
          </div>
          <p className="text-[11px] text-stone-500">
            Average across {report?.daysLogged || 1} logged day(s)
          </p>
        </div>

        {/* Avg Daily Protein */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Average Protein
          </span>
          <div className="text-3xl font-extrabold text-emerald-800 font-mono">
            {averages.proteinG}g{' '}
            <span className="text-xs font-semibold text-stone-400">/ {targets.proteinG}g</span>
          </div>
          <p className="text-[11px] text-stone-500">
            {Math.round((averages.proteinG / targets.proteinG) * 100)}% of recommended intake
          </p>
        </div>

        {/* Avg Daily Fibre */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Average Fibre
          </span>
          <div className="text-3xl font-extrabold text-teal-800 font-mono">
            {averages.fibreG}g{' '}
            <span className="text-xs font-semibold text-stone-400">/ {targets.fibreG}g</span>
          </div>
          <p className="text-[11px] text-stone-500">
            {Math.round((averages.fibreG / targets.fibreG) * 100)}% of daily target
          </p>
        </div>
      </div>

      {/* 7-Day Trend Chart */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900">
            7-Day Calorie & Protein Intake Trends
          </h2>
          <p className="text-xs text-stone-500">
            Shows daily totals for days with recorded meals
          </p>
        </div>

        <div className="h-72 w-full pt-4">
          {report && report.dailyBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.dailyBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="dayName" stroke="#78716c" fontSize={12} />
                <YAxis stroke="#78716c" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e7e5e4',
                    fontSize: '12px',
                  }}
                />
                <Legend />
                <Bar dataKey="calories" name="Calories (kcal)" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="proteinG" name="Protein (g)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-stone-400">
              No meal data found for this week.
            </div>
          )}
        </div>
      </div>

      {/* Practical Weekly Recommendations */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-bold text-stone-900">
            Actionable Recommendations for Next Week
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {report?.recommendations?.map((rec, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-700 leading-relaxed flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
