import { pgTable, text, serial, integer, real, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table (keyed directly by Firebase Auth UID)
export const users = pgTable('users', {
  uid: text('uid').primaryKey(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User Profile & Nutritional reference goals
export const userProfiles = pgTable('user_profiles', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.uid, { onDelete: 'cascade' }).notNull().unique(),
  age: integer('age'),
  gender: text('gender'), // 'female', 'male', 'non_binary', 'prefer_not_to_say'
  heightCm: real('height_cm'),
  weightKg: real('weight_kg'),
  activityLevel: text('activity_level').default('moderately_active'), // 'sedentary', 'lightly_active', 'moderately_active', 'very_active'
  primaryGoal: text('primary_goal').default('balanced_meals'), // 'balanced_meals', 'dietary_variety', 'increase_protein', 'reduce_sodium', 'improve_fibre', 'manage_health_condition'
  targetCalories: integer('target_calories').default(2000),
  targetProteinG: integer('target_protein_g').default(75),
  targetCarbsG: integer('target_carbs_g').default(250),
  targetFatG: integer('target_fat_g').default(65),
  targetFibreG: integer('target_fibre_g').default(28),
  targetSodiumMg: integer('target_sodium_mg').default(2000),
  targetSugarG: integer('target_sugar_g').default(35),
  onboardingCompleted: boolean('onboarding_completed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Health Preferences, Conditions, Allergies, Dietary Restrictions
export const healthPreferences = pgTable('health_preferences', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.uid, { onDelete: 'cascade' }).notNull().unique(),
  // Conditions array: e.g. ['high_blood_pressure', 'type_2_diabetes', 'kidney_disease', 'gerd', 'elevated_cholesterol']
  healthConditions: jsonb('health_conditions').$type<string[]>().default([]).notNull(),
  // Allergies array: e.g. ['peanuts', 'tree_nuts', 'shellfish', 'fish', 'dairy', 'eggs', 'soy', 'wheat']
  allergies: jsonb('allergies').$type<string[]>().default([]).notNull(),
  // Dietary restrictions: e.g. ['vegetarian', 'vegan', 'pescatarian', 'halal', 'kosher', 'low_sodium']
  dietaryRestrictions: jsonb('dietary_restrictions').$type<string[]>().default([]).notNull(),
  customNotes: text('custom_notes'),
  clinicalAdviceAcknowledged: boolean('clinical_advice_acknowledged').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Curated Food Composition Database (USDA + Nigerian Local Foods + Custom)
export const foods = pgTable('foods', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  cuisineRegion: text('cuisine_region').default('Global').notNull(), // 'Nigerian', 'Global', 'Custom'
  category: text('category').notNull(), // 'grains_tubers', 'legumes', 'vegetables', 'fruits', 'meat_poultry', 'fish_seafood', 'soups_stews', 'snacks_sweets', 'beverages', 'dairy_alternatives', 'fats_oils'
  servingSize: real('serving_size').notNull(),
  servingUnit: text('serving_unit').notNull(), // 'g', 'cup', 'wrap', 'piece', 'bowl', 'portion', 'tbsp', 'ml'
  servingWeightGrams: real('serving_weight_grams').default(100).notNull(),
  calories: real('calories').notNull(),
  proteinG: real('protein_g').notNull(),
  carbsG: real('carbs_g').notNull(),
  fatG: real('fat_g').notNull(),
  fibreG: real('fibre_g').default(0).notNull(),
  sodiumMg: real('sodium_mg').default(0).notNull(),
  addedSugarG: real('added_sugar_g').default(0).notNull(),
  potassiumMg: real('potassium_mg').default(0),
  dataSource: text('data_source').notNull(), // 'USDA FoodData Central', 'Nigerian Food Composition Tables (NBS/FAO)', 'User Defined'
  dataQuality: text('data_quality').default('verified').notNull(), // 'verified', 'estimate', 'partial'
  allergens: jsonb('allergens').$type<string[]>().default([]),
  description: text('description'),
  isCustom: boolean('is_custom').default(false).notNull(),
  createdByUser: text('created_by_user').references(() => users.uid, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Meals logged by users
export const meals = pgTable('meals', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.uid, { onDelete: 'cascade' }).notNull(),
  category: text('category').notNull(), // 'Breakfast', 'Brunch', 'Lunch', 'Midday snack', 'Dinner', 'Evening snack', 'Other'
  date: text('date').notNull(), // 'YYYY-MM-DD'
  time: text('time').notNull(), // 'HH:MM'
  notes: text('notes'),
  totalCalories: real('total_calories').default(0).notNull(),
  totalProteinG: real('total_protein_g').default(0).notNull(),
  totalCarbsG: real('total_carbs_g').default(0).notNull(),
  totalFatG: real('total_fat_g').default(0).notNull(),
  totalFibreG: real('total_fibre_g').default(0).notNull(),
  totalSodiumMg: real('total_sodium_mg').default(0).notNull(),
  totalSugarG: real('total_sugar_g').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Individual Food Items in a Meal
export const mealItems = pgTable('meal_items', {
  id: serial('id').primaryKey(),
  mealId: integer('meal_id').references(() => meals.id, { onDelete: 'cascade' }).notNull(),
  foodId: integer('food_id').references(() => foods.id, { onDelete: 'set null' }),
  foodName: text('food_name').notNull(),
  portionSize: real('portion_size').notNull(),
  portionUnit: text('portion_unit').notNull(),
  quantity: real('quantity').default(1).notNull(),
  preparationMethod: text('preparation_method'), // 'Boiled', 'Fried', 'Grilled', 'Steamed', 'Roasted', 'Raw', 'Stewed'
  calories: real('calories').notNull(),
  proteinG: real('protein_g').notNull(),
  carbsG: real('carbs_g').notNull(),
  fatG: real('fat_g').notNull(),
  fibreG: real('fibre_g').default(0).notNull(),
  sodiumMg: real('sodium_mg').default(0).notNull(),
  addedSugarG: real('added_sugar_g').default(0).notNull(),
  dataQuality: text('data_quality').default('verified').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Daily Nutrition Insights (Generated evidence-based review)
export const dailyInsights = pgTable('daily_insights', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.uid, { onDelete: 'cascade' }).notNull(),
  date: text('date').notNull(), // 'YYYY-MM-DD'
  whatWentWell: jsonb('what_went_well').$type<string[]>().default([]).notNull(),
  whatCouldImprove: jsonb('what_could_improve').$type<string[]>().default([]).notNull(),
  suggestedImprovements: jsonb('suggested_improvements').$type<string[]>().default([]).notNull(),
  dataConfidence: text('data_confidence').default('medium').notNull(), // 'high', 'medium', 'low'
  healthConditionNotes: text('health_condition_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.uid],
    references: [userProfiles.userId],
  }),
  healthPreference: one(healthPreferences, {
    fields: [users.uid],
    references: [healthPreferences.userId],
  }),
  meals: many(meals),
  dailyInsights: many(dailyInsights),
}));

export const mealsRelations = relations(meals, ({ one, many }) => ({
  user: one(users, {
    fields: [meals.userId],
    references: [users.uid],
  }),
  items: many(mealItems),
}));

export const mealItemsRelations = relations(mealItems, ({ one }) => ({
  meal: one(meals, {
    fields: [mealItems.mealId],
    references: [meals.id],
  }),
  food: one(foods, {
    fields: [mealItems.foodId],
    references: [foods.id],
  }),
}));
