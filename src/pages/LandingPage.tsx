import React from 'react';
import {
  UtensilsCrossed,
  ShieldCheck,
  Sparkles,
  BarChart3,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  Flame,
  HeartHandshake,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const { signInWithGoogle, signInDemoGuest, loading } = useAuth();

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col selection:bg-emerald-200">
      {/* Top Header */}
      <header className="border-b border-stone-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-stone-900">
                NourishTrack
              </span>
              <p className="text-[11px] text-stone-500 hidden sm:block">
                Eat. Track. Understand. Improve.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => signInDemoGuest()}
              disabled={loading}
              className="text-xs font-semibold text-stone-700 hover:text-emerald-700 px-3.5 py-2 rounded-xl hover:bg-stone-100 transition"
            >
              Explore Instant Demo
            </button>
            <button
              onClick={() => onGetStarted()}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
            >
              Sign In
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-stone-200/80 bg-gradient-to-b from-emerald-50/40 via-stone-50 to-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 text-emerald-900 text-xs font-semibold border border-emerald-200/60 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Evidence-Based Nutrition & Food Tracking</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-950 tracking-tight leading-[1.15]">
              Turn your daily meals into <span className="text-emerald-700 underline decoration-emerald-300 decoration-wavy">understandable</span> nutrition insights.
            </h1>

            <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl mx-auto">
              Record everything you eat across breakfast, lunch, dinner, and snacks. NourishTrack pairs authentic Nigerian food tables with USDA FoodData Central for honest, deterministic nutrition estimates — without AI guesswork or guilt.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={() => onGetStarted()}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/25 transition active:scale-95 flex items-center justify-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => signInDemoGuest()}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 font-semibold text-sm transition shadow-xs flex items-center justify-center gap-2"
              >
                <span>Try Demo with Sample Data</span>
              </button>
            </div>

            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-stone-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Real Nigerian & USDA Foods
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Safe Health Guidance
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Nonjudgmental Feedback
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Designed for real human eating habits
          </h2>
          <p className="text-sm text-stone-600">
            Nutrition isn’t about perfection or punishment. NourishTrack empowers you with clarity, cultural familiarity, and medical responsibility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-sm space-y-4 hover:border-emerald-300 transition group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">
              Authentic Food Composition
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Track Jollof rice, Amala, Eba, Egusi, Moi Moi, plantain, and seafood pepper soup alongside global foods. Accurate numbers derived from Nigerian Food Composition Tables and USDA FoodData Central.
            </p>
            <div className="pt-2 text-xs text-emerald-700 font-semibold flex items-center gap-1">
              Deterministic calculations · No hallucinations
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-sm space-y-4 hover:border-emerald-300 transition group">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">
              Safe Health Considerations
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Record high blood pressure, diabetes, or food allergies. We highlight sodium caution, carbohydrate balance, and allergen safety without generating dangerous unverified diagnoses.
            </p>
            <div className="pt-2 text-xs text-amber-700 font-semibold flex items-center gap-1">
              Educational feedback · Clinically responsible
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-sm space-y-4 hover:border-emerald-300 transition group">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center group-hover:scale-105 transition">
              <Lightbulb className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">
              "What Should I Eat?" Suggestions
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Need dinner inspiration? NourishTrack examines what you’ve logged so far and recommends delicious meals that complete your fiber or protein goals while respecting your preferences.
            </p>
            <div className="pt-2 text-xs text-sky-700 font-semibold flex items-center gap-1">
              Affordable · Culturally relevant · Allergen-checked
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Educational Disclaimer Notice */}
      <section className="bg-stone-100 py-10 border-t border-stone-200">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-600">
            <HeartHandshake className="w-4 h-4 text-emerald-600" />
            Our Health & Ethics Standard
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            NourishTrack is an educational lifestyle and nutrition tool designed to help you understand your dietary choices. It does not provide medical diagnoses, prescribe prescription pharmaceutical plans, or replace the clinical expertise of a qualified physician or registered dietitian.
          </p>
          <p className="text-[11px] text-stone-400">
            © {new Date().getFullYear()} NourishTrack. Built for reliable nutrition awareness.
          </p>
        </div>
      </section>
    </div>
  );
};
