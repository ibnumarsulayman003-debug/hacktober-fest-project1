import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { MealLoggerModal } from './components/MealLoggerModal.tsx';
import { OnboardingModal } from './components/OnboardingModal.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { AuthPage } from './pages/AuthPage.tsx';
import { Dashboard } from './pages/Dashboard.tsx';
import { MealJournalPage } from './pages/MealJournalPage.tsx';
import { InsightsPage } from './pages/InsightsPage.tsx';
import { WeeklyReportsPage } from './pages/WeeklyReportsPage.tsx';
import { SuggestionsPage } from './pages/SuggestionsPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { Meal, MealCategory } from './types/index.ts';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showAuthPage, setShowAuthPage] = useState<boolean>(false);

  // Meal Logger Modal state
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [editMealTarget, setEditMealTarget] = useState<Meal | null>(null);
  const [defaultCategory, setDefaultCategory] = useState<MealCategory>('Lunch');
  const [defaultLogDate, setDefaultLogDate] = useState<string | undefined>(undefined);

  // Refresh trigger counter to notify child pages when a meal is added/edited
  const [dataVersion, setDataVersion] = useState<number>(0);

  const openLogMeal = (category?: MealCategory, date?: string) => {
    setEditMealTarget(null);
    setDefaultCategory(category || 'Lunch');
    setDefaultLogDate(date || new Date().toISOString().split('T')[0]);
    setIsLogModalOpen(true);
  };

  const openEditMeal = (meal: Meal) => {
    setEditMealTarget(meal);
    setDefaultCategory(meal.category);
    setDefaultLogDate(meal.date);
    setIsLogModalOpen(true);
  };

  const handleMealSaved = () => {
    setDataVersion((v) => v + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center animate-pulse shadow-lg shadow-emerald-600/20 mb-3">
          <svg className="w-6 h-6 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        <p className="text-xs font-semibold text-stone-600">Loading NourishTrack...</p>
      </div>
    );
  }

  // Unauthenticated experience
  if (!user) {
    if (showAuthPage) {
      return <AuthPage onBackToLanding={() => setShowAuthPage(false)} />;
    }
    return <LandingPage onGetStarted={() => setShowAuthPage(true)} />;
  }

  const showOnboarding = Boolean(profile && !profile.onboardingCompleted);

  return (
    <div className="min-h-screen bg-stone-50/70 text-stone-900 flex flex-col font-sans selection:bg-emerald-200">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLogMeal={() => openLogMeal()}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            key={dataVersion}
            onOpenLogMeal={openLogMeal}
            onNavigateToJournal={() => setActiveTab('journal')}
            onNavigateToInsights={() => setActiveTab('insights')}
            onNavigateToSuggestions={() => setActiveTab('suggestions')}
            onEditMeal={openEditMeal}
          />
        )}

        {activeTab === 'journal' && (
          <MealJournalPage
            key={dataVersion}
            onOpenLogMeal={openLogMeal}
            onEditMeal={openEditMeal}
          />
        )}

        {activeTab === 'insights' && <InsightsPage key={dataVersion} />}

        {activeTab === 'reports' && <WeeklyReportsPage key={dataVersion} />}

        {activeTab === 'suggestions' && (
          <SuggestionsPage onOpenLogMeal={() => openLogMeal()} />
        )}

        {activeTab === 'profile' && <ProfilePage />}
      </main>

      {/* Global Meal Logger Modal */}
      <MealLoggerModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onMealSaved={handleMealSaved}
        initialMeal={editMealTarget}
        defaultDate={defaultLogDate}
        defaultCategory={defaultCategory}
      />

      {/* Guided Onboarding Modal (shown on first user login) */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={() => {
          // Onboarding completed
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
