import {
  DailyInsightResponse,
  Food,
  Meal,
  MealCategory,
  UserProfile,
  HealthPreference,
  WeeklyReportResponse,
  FoodSuggestion,
} from '../types/index.ts';

let currentAuthToken: string | null = null;

export function setApiAuthToken(token: string | null) {
  currentAuthToken = token;
}

export function getApiAuthToken(): string | null {
  return currentAuthToken;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (currentAuthToken) {
    headers.set('Authorization', `Bearer ${currentAuthToken}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const data = await response.json();
      if (data?.error) errorMsg = data.error;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Sync authenticated user
  syncUser: () => request<{ success: boolean; uid: string }>('/api/auth/sync', { method: 'POST' }),

  // User Profile & Health Preferences
  getProfile: () =>
    request<{
      user: any;
      profile: UserProfile | null;
      health: HealthPreference | null;
    }>('/api/profile'),

  updateProfile: (data: {
    profile?: Partial<UserProfile>;
    health?: Partial<HealthPreference>;
  }) =>
    request<{ success: boolean; message: string }>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Foods
  getFoods: (params?: { q?: string; cuisine?: string; category?: string }) => {
    const query = new URLSearchParams();
    if (params?.q) query.set('q', params.q);
    if (params?.cuisine) query.set('cuisine', params.cuisine);
    if (params?.category) query.set('category', params.category);
    return request<Food[]>(`/api/foods?${query.toString()}`);
  },

  createCustomFood: (foodData: Partial<Food>) =>
    request<Food>('/api/foods/custom', {
      method: 'POST',
      body: JSON.stringify(foodData),
    }),

  // Meals
  getMeals: (date?: string) => {
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    return request<Meal[]>(`/api/meals${query}`);
  },

  createMeal: (mealData: {
    category: MealCategory;
    date: string;
    time: string;
    notes?: string;
    items: any[];
  }) =>
    request<Meal>('/api/meals', {
      method: 'POST',
      body: JSON.stringify(mealData),
    }),

  updateMeal: (
    id: number,
    mealData: {
      category: MealCategory;
      date: string;
      time: string;
      notes?: string;
      items: any[];
    }
  ) =>
    request<Meal>(`/api/meals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(mealData),
    }),

  deleteMeal: (id: number) =>
    request<{ success: boolean }>(`/api/meals/${id}`, {
      method: 'DELETE',
    }),

  // Insights & Reports
  getDailyInsights: (date?: string) => {
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    return request<DailyInsightResponse>(`/api/insights/daily${query}`);
  },

  getWeeklyReport: (endDate?: string) => {
    const query = endDate ? `?endDate=${encodeURIComponent(endDate)}` : '';
    return request<WeeklyReportResponse>(`/api/reports/weekly${query}`);
  },

  getSuggestions: (date?: string) => {
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    return request<{ date: string; suggestions: FoodSuggestion[] }>(`/api/suggestions${query}`);
  },

  // Account Privacy & Data Deletion
  deleteUserData: () =>
    request<{ success: boolean; message: string }>('/api/user/delete-data', {
      method: 'POST',
    }),
};
