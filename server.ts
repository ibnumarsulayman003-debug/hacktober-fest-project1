import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { eq, and, desc, gte, lte, ilike, sql } from 'drizzle-orm';
import { db } from './src/db/index.ts';
import {
  users,
  userProfiles,
  healthPreferences,
  foods,
  meals,
  mealItems,
  dailyInsights,
} from './src/db/schema.ts';
import { seedFoodsIfNeeded } from './src/db/seed-foods.ts';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import {
  calculateMealTotals,
  generateDailyInsights,
  generateMealSuggestions,
} from './src/services/nutrition-engine.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Run initial database seeding lazily in background
seedFoodsIfNeeded().catch((err) => console.error('Database seed error:', err));

// --- API ROUTES ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Auth Sync: Ensure user and default profile exist in PostgreSQL
app.post('/api/auth/sync', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { uid, email, name, picture } = req.user!;

    // 1. Upsert User
    await db
      .insert(users)
      .values({
        uid,
        email: email || 'user@nourishtrack.app',
        displayName: name || 'NourishTrack Member',
        photoUrl: picture || null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: email || 'user@nourishtrack.app',
          displayName: name || 'NourishTrack Member',
          updatedAt: new Date(),
        },
      });

    // 2. Ensure Profile exists
    const existingProfile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, uid));

    if (!existingProfile.length) {
      await db.insert(userProfiles).values({
        userId: uid,
        onboardingCompleted: false,
        primaryGoal: 'balanced_meals',
        targetCalories: 2000,
        targetProteinG: 75,
        targetCarbsG: 250,
        targetFatG: 65,
        targetFibreG: 28,
        targetSodiumMg: 2000,
        targetSugarG: 35,
      });
    }

    // 3. Ensure Health Preference exists
    const existingHealth = await db
      .select()
      .from(healthPreferences)
      .where(eq(healthPreferences.userId, uid));

    if (!existingHealth.length) {
      await db.insert(healthPreferences).values({
        userId: uid,
        healthConditions: [],
        allergies: [],
        dietaryRestrictions: [],
        clinicalAdviceAcknowledged: true,
      });
    }

    res.json({ success: true, uid });
  } catch (error: any) {
    console.error('Failed to sync auth user:', error);
    res.status(500).json({ error: 'Failed to synchronize user profile' });
  }
});

// GET /api/profile: Fetch full user profile & health preferences
app.get('/api/profile', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;

    const userRows = await db.select().from(users).where(eq(users.uid, uid));
    const profileRows = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, uid));
    const healthRows = await db
      .select()
      .from(healthPreferences)
      .where(eq(healthPreferences.userId, uid));

    const user = userRows[0] || null;
    const profile = profileRows[0] || null;
    const health = healthRows[0] || null;

    res.json({ user, profile, health });
  } catch (error: any) {
    console.error('Failed to fetch profile:', error);
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

// PUT /api/profile: Update profile and health preferences
app.put('/api/profile', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const { profile, health } = req.body;

    if (profile) {
      await db
        .insert(userProfiles)
        .values({
          userId: uid,
          age: profile.age ? Number(profile.age) : null,
          gender: profile.gender || null,
          heightCm: profile.heightCm ? Number(profile.heightCm) : null,
          weightKg: profile.weightKg ? Number(profile.weightKg) : null,
          activityLevel: profile.activityLevel || 'moderately_active',
          primaryGoal: profile.primaryGoal || 'balanced_meals',
          targetCalories: Number(profile.targetCalories) || 2000,
          targetProteinG: Number(profile.targetProteinG) || 75,
          targetCarbsG: Number(profile.targetCarbsG) || 250,
          targetFatG: Number(profile.targetFatG) || 65,
          targetFibreG: Number(profile.targetFibreG) || 28,
          targetSodiumMg: Number(profile.targetSodiumMg) || 2000,
          targetSugarG: Number(profile.targetSugarG) || 35,
          onboardingCompleted: true,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: userProfiles.userId,
          set: {
            age: profile.age ? Number(profile.age) : null,
            gender: profile.gender || null,
            heightCm: profile.heightCm ? Number(profile.heightCm) : null,
            weightKg: profile.weightKg ? Number(profile.weightKg) : null,
            activityLevel: profile.activityLevel || 'moderately_active',
            primaryGoal: profile.primaryGoal || 'balanced_meals',
            targetCalories: Number(profile.targetCalories) || 2000,
            targetProteinG: Number(profile.targetProteinG) || 75,
            targetCarbsG: Number(profile.targetCarbsG) || 250,
            targetFatG: Number(profile.targetFatG) || 65,
            targetFibreG: Number(profile.targetFibreG) || 28,
            targetSodiumMg: Number(profile.targetSodiumMg) || 2000,
            targetSugarG: Number(profile.targetSugarG) || 35,
            onboardingCompleted: true,
            updatedAt: new Date(),
          },
        });
    }

    if (health) {
      await db
        .insert(healthPreferences)
        .values({
          userId: uid,
          healthConditions: health.healthConditions || [],
          allergies: health.allergies || [],
          dietaryRestrictions: health.dietaryRestrictions || [],
          customNotes: health.customNotes || '',
          clinicalAdviceAcknowledged: health.clinicalAdviceAcknowledged ?? true,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: healthPreferences.userId,
          set: {
            healthConditions: health.healthConditions || [],
            allergies: health.allergies || [],
            dietaryRestrictions: health.dietaryRestrictions || [],
            customNotes: health.customNotes || '',
            clinicalAdviceAcknowledged: health.clinicalAdviceAcknowledged ?? true,
            updatedAt: new Date(),
          },
        });
    }

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error: any) {
    console.error('Failed to update profile:', error);
    res.status(500).json({ error: 'Failed to update profile settings' });
  }
});

// GET /api/foods: Searchable foods (USDA + Nigerian + User Custom)
app.get('/api/foods', async (req: Request, res: Response) => {
  try {
    const q = req.query.q ? String(req.query.q).trim().toLowerCase() : '';
    const cuisine = req.query.cuisine ? String(req.query.cuisine) : '';
    const category = req.query.category ? String(req.query.category) : '';

    let query = db.select().from(foods);

    // Apply conditions
    const conditions = [];
    if (q) {
      conditions.push(ilike(foods.name, `%${q}%`));
    }
    if (cuisine && cuisine !== 'all') {
      conditions.push(eq(foods.cuisineRegion, cuisine));
    }
    if (category && category !== 'all') {
      conditions.push(eq(foods.category, category));
    }

    const results = conditions.length
      ? await query.where(and(...conditions)).limit(60)
      : await query.limit(60);

    res.json(results);
  } catch (error: any) {
    console.error('Error fetching foods:', error);
    res.status(500).json({ error: 'Failed to fetch food composition records' });
  }
});

// POST /api/foods/custom: Add custom or unlisted food item
app.post('/api/foods/custom', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const {
      name,
      cuisineRegion = 'Custom',
      category = 'other',
      servingSize = 1,
      servingUnit = 'portion',
      calories,
      proteinG = 0,
      carbsG = 0,
      fatG = 0,
      fibreG = 0,
      sodiumMg = 0,
      addedSugarG = 0,
      dataSource = 'User Defined',
      dataQuality = 'estimate',
    } = req.body;

    if (!name || calories === undefined) {
      return res.status(400).json({ error: 'Name and estimated calories are required.' });
    }

    const inserted = await db
      .insert(foods)
      .values({
        name,
        cuisineRegion,
        category,
        servingSize: Number(servingSize),
        servingUnit,
        servingWeightGrams: 100,
        calories: Number(calories),
        proteinG: Number(proteinG),
        carbsG: Number(carbsG),
        fatG: Number(fatG),
        fibreG: Number(fibreG),
        sodiumMg: Number(sodiumMg),
        addedSugarG: Number(addedSugarG),
        dataSource,
        dataQuality,
        isCustom: true,
        createdByUser: uid,
      })
      .returning();

    res.status(201).json(inserted[0]);
  } catch (error: any) {
    console.error('Failed to create custom food:', error);
    res.status(500).json({ error: 'Failed to save custom food item' });
  }
});

// GET /api/meals: Fetch meals for user (optionally filtered by date)
app.get('/api/meals', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const date = req.query.date ? String(req.query.date) : null;

    const mealQuery = date
      ? db
          .select()
          .from(meals)
          .where(and(eq(meals.userId, uid), eq(meals.date, date)))
          .orderBy(desc(meals.time))
      : db
          .select()
          .from(meals)
          .where(eq(meals.userId, uid))
          .orderBy(desc(meals.date), desc(meals.time))
          .limit(50);

    const mealRows = await mealQuery;

    // Fetch items for each meal
    const results = await Promise.all(
      mealRows.map(async (m) => {
        const items = await db
          .select()
          .from(mealItems)
          .where(eq(mealItems.mealId, m.id));
        return {
          ...m,
          items,
        };
      })
    );

    res.json(results);
  } catch (error: any) {
    console.error('Failed to fetch meals:', error);
    res.status(500).json({ error: 'Failed to retrieve meal log records' });
  }
});

// POST /api/meals: Log a new meal with multiple food items
app.post('/api/meals', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const { category, date, time, notes, items } = req.body;

    if (!category || !date || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Meal category, date, and at least one food item are required.',
      });
    }

    // Deterministically calculate nutrient totals across items
    const totals = calculateMealTotals(items);

    // Insert Meal
    const [insertedMeal] = await db
      .insert(meals)
      .values({
        userId: uid,
        category,
        date,
        time: time || '12:00',
        notes: notes || null,
        totalCalories: totals.calories,
        totalProteinG: totals.proteinG,
        totalCarbsG: totals.carbsG,
        totalFatG: totals.fatG,
        totalFibreG: totals.fibreG,
        totalSodiumMg: totals.sodiumMg,
        totalSugarG: totals.addedSugarG,
      })
      .returning();

    // Insert Meal Items
    const itemRecords = items.map((it: any) => ({
      mealId: insertedMeal.id,
      foodId: it.foodId || null,
      foodName: it.foodName || 'Food Item',
      portionSize: Number(it.portionSize) || 1,
      portionUnit: it.portionUnit || 'serving',
      quantity: Number(it.quantity) || 1,
      preparationMethod: it.preparationMethod || null,
      calories: Number(it.calories) || 0,
      proteinG: Number(it.proteinG) || 0,
      carbsG: Number(it.carbsG) || 0,
      fatG: Number(it.fatG) || 0,
      fibreG: Number(it.fibreG) || 0,
      sodiumMg: Number(it.sodiumMg) || 0,
      addedSugarG: Number(it.addedSugarG) || 0,
      dataQuality: it.dataQuality || 'verified',
    }));

    const insertedItems = await db.insert(mealItems).values(itemRecords).returning();

    res.status(201).json({
      ...insertedMeal,
      items: insertedItems,
    });
  } catch (error: any) {
    console.error('Failed to create meal:', error);
    res.status(500).json({ error: 'Failed to record meal' });
  }
});

// PUT /api/meals/:id: Update existing meal and its items
app.put('/api/meals/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const mealId = Number(req.params.id);
    const { category, date, time, notes, items } = req.body;

    // Verify ownership
    const existing = await db
      .select()
      .from(meals)
      .where(and(eq(meals.id, mealId), eq(meals.userId, uid)));

    if (!existing.length) {
      return res.status(404).json({ error: 'Meal not found or unauthorized' });
    }

    const totals = calculateMealTotals(items);

    // Update parent meal
    const [updatedMeal] = await db
      .update(meals)
      .set({
        category,
        date,
        time: time || '12:00',
        notes: notes || null,
        totalCalories: totals.calories,
        totalProteinG: totals.proteinG,
        totalCarbsG: totals.carbsG,
        totalFatG: totals.fatG,
        totalFibreG: totals.fibreG,
        totalSodiumMg: totals.sodiumMg,
        totalSugarG: totals.addedSugarG,
        updatedAt: new Date(),
      })
      .where(eq(meals.id, mealId))
      .returning();

    // Replace items
    await db.delete(mealItems).where(eq(mealItems.mealId, mealId));

    const itemRecords = items.map((it: any) => ({
      mealId,
      foodId: it.foodId || null,
      foodName: it.foodName || 'Food Item',
      portionSize: Number(it.portionSize) || 1,
      portionUnit: it.portionUnit || 'serving',
      quantity: Number(it.quantity) || 1,
      preparationMethod: it.preparationMethod || null,
      calories: Number(it.calories) || 0,
      proteinG: Number(it.proteinG) || 0,
      carbsG: Number(it.carbsG) || 0,
      fatG: Number(it.fatG) || 0,
      fibreG: Number(it.fibreG) || 0,
      sodiumMg: Number(it.sodiumMg) || 0,
      addedSugarG: Number(it.addedSugarG) || 0,
      dataQuality: it.dataQuality || 'verified',
    }));

    const insertedItems = await db.insert(mealItems).values(itemRecords).returning();

    res.json({
      ...updatedMeal,
      items: insertedItems,
    });
  } catch (error: any) {
    console.error('Failed to update meal:', error);
    res.status(500).json({ error: 'Failed to update meal entry' });
  }
});

// DELETE /api/meals/:id: Delete meal
app.delete('/api/meals/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const mealId = Number(req.params.id);

    const existing = await db
      .select()
      .from(meals)
      .where(and(eq(meals.id, mealId), eq(meals.userId, uid)));

    if (!existing.length) {
      return res.status(404).json({ error: 'Meal not found or unauthorized' });
    }

    await db.delete(meals).where(eq(meals.id, mealId));
    res.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete meal:', error);
    res.status(500).json({ error: 'Failed to delete meal' });
  }
});

// GET /api/insights/daily: Evidence-based daily nutrition summary & insights
app.get('/api/insights/daily', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const date = req.query.date ? String(req.query.date) : new Date().toISOString().split('T')[0];

    // Fetch user context
    const profileRows = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, uid));
    const healthRows = await db
      .select()
      .from(healthPreferences)
      .where(eq(healthPreferences.userId, uid));

    const profile = profileRows[0] || {};
    const health = healthRows[0] || {};

    // Fetch meals for this day
    const dayMeals = await db
      .select()
      .from(meals)
      .where(and(eq(meals.userId, uid), eq(meals.date, date)));

    const detailedMeals = await Promise.all(
      dayMeals.map(async (m) => {
        const items = await db.select().from(mealItems).where(eq(mealItems.mealId, m.id));
        return { ...m, items };
      })
    );

    const context = {
      primaryGoal: profile.primaryGoal,
      targetCalories: profile.targetCalories,
      targetProteinG: profile.targetProteinG,
      targetCarbsG: profile.targetCarbsG,
      targetFatG: profile.targetFatG,
      targetFibreG: profile.targetFibreG,
      targetSodiumMg: profile.targetSodiumMg,
      targetSugarG: profile.targetSugarG,
      healthConditions: health.healthConditions || [],
      allergies: health.allergies || [],
      dietaryRestrictions: health.dietaryRestrictions || [],
      customNotes: health.customNotes || '',
    };

    const insights = generateDailyInsights(detailedMeals, context);

    // Compute aggregated daily intake
    let totalCalories = 0;
    let totalProteinG = 0;
    let totalCarbsG = 0;
    let totalFatG = 0;
    let totalFibreG = 0;
    let totalSodiumMg = 0;
    let totalSugarG = 0;

    for (const m of detailedMeals) {
      totalCalories += m.totalCalories;
      totalProteinG += m.totalProteinG;
      totalCarbsG += m.totalCarbsG;
      totalFatG += m.totalFatG;
      totalFibreG += m.totalFibreG;
      totalSodiumMg += m.totalSodiumMg;
      totalSugarG += m.totalSugarG;
    }

    res.json({
      date,
      mealsCount: detailedMeals.length,
      totals: {
        calories: Math.round(totalCalories),
        proteinG: Math.round(totalProteinG * 10) / 10,
        carbsG: Math.round(totalCarbsG * 10) / 10,
        fatG: Math.round(totalFatG * 10) / 10,
        fibreG: Math.round(totalFibreG * 10) / 10,
        sodiumMg: Math.round(totalSodiumMg),
        sugarG: Math.round(totalSugarG * 10) / 10,
      },
      targets: {
        calories: profile.targetCalories || 2000,
        proteinG: profile.targetProteinG || 75,
        carbsG: profile.targetCarbsG || 250,
        fatG: profile.targetFatG || 65,
        fibreG: profile.targetFibreG || 28,
        sodiumMg: profile.targetSodiumMg || 2000,
        sugarG: profile.targetSugarG || 35,
      },
      insights,
    });
  } catch (error: any) {
    console.error('Failed to compute daily insights:', error);
    res.status(500).json({ error: 'Failed to generate daily insights' });
  }
});

// GET /api/reports/weekly: Multi-day weekly nutrition report
app.get('/api/reports/weekly', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const endDateStr = req.query.endDate
      ? String(req.query.endDate)
      : new Date().toISOString().split('T')[0];

    // Compute past 7 days range
    const endDate = new Date(endDateStr);
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 6);
    const startDateStr = startDate.toISOString().split('T')[0];

    const profileRows = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, uid));
    const healthRows = await db
      .select()
      .from(healthPreferences)
      .where(eq(healthPreferences.userId, uid));

    const profile = profileRows[0] || {};
    const health = healthRows[0] || {};

    const weekMeals = await db
      .select()
      .from(meals)
      .where(
        and(
          eq(meals.userId, uid),
          gte(meals.date, startDateStr),
          lte(meals.date, endDateStr)
        )
      )
      .orderBy(meals.date);

    // Group meals by date
    const dayMap = new Map<string, any[]>();
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const ds = d.toISOString().split('T')[0];
      dayMap.set(ds, []);
    }

    for (const m of weekMeals) {
      if (dayMap.has(m.date)) {
        dayMap.get(m.date)!.push(m);
      }
    }

    const daysLogged = Array.from(dayMap.values()).filter((arr) => arr.length > 0).length;

    // Daily breakdown for charts
    const dailyBreakdown = Array.from(dayMap.entries()).map(([dateStr, mealList]) => {
      let cal = 0;
      let pro = 0;
      let car = 0;
      let fat = 0;
      let fib = 0;
      let sod = 0;
      for (const m of mealList) {
        cal += m.totalCalories;
        pro += m.totalProteinG;
        car += m.totalCarbsG;
        fat += m.totalFatG;
        fib += m.totalFibreG;
        sod += m.totalSodiumMg;
      }
      return {
        date: dateStr,
        dayName: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }),
        calories: Math.round(cal),
        proteinG: Math.round(pro),
        carbsG: Math.round(car),
        fatG: Math.round(fat),
        fibreG: Math.round(fib),
        sodiumMg: Math.round(sod),
        mealsCount: mealList.length,
      };
    });

    // Compute averages across logged days
    const activeDays = daysLogged > 0 ? daysLogged : 1;
    let sumCal = 0;
    let sumPro = 0;
    let sumCar = 0;
    let sumFat = 0;
    let sumFib = 0;
    let sumSod = 0;

    for (const d of dailyBreakdown) {
      sumCal += d.calories;
      sumPro += d.proteinG;
      sumCar += d.carbsG;
      sumFat += d.fatG;
      sumFib += d.fibreG;
      sumSod += d.sodiumMg;
    }

    const averages = {
      calories: Math.round(sumCal / activeDays),
      proteinG: Math.round(sumPro / activeDays),
      carbsG: Math.round(sumCar / activeDays),
      fatG: Math.round(sumFat / activeDays),
      fibreG: Math.round((sumFib / activeDays) * 10) / 10,
      sodiumMg: Math.round(sumSod / activeDays),
    };

    // Category variety analysis
    const categoryCounts: Record<string, number> = {};
    for (const m of weekMeals) {
      categoryCounts[m.category] = (categoryCounts[m.category] || 0) + 1;
    }

    // Practical recommendations
    const recommendations = [];
    if (daysLogged < 4) {
      recommendations.push(
        'Consistent Logging: Recording meals on at least 5 days this coming week will provide more accurate insights into your dietary trends.'
      );
    } else {
      recommendations.push(
        `Great habit! You recorded meals across ${daysLogged} of the last 7 days, giving you dependable data on your eating habits.`
      );
    }

    if (averages.fibreG < (profile.targetFibreG || 28) * 0.75) {
      recommendations.push(
        'Incorporate More Whole Plant Foods: Your average fibre is lower than recommended. Adding beans (Ewa), vegetable soups (Efo Riro), garden eggs, or oats can bridge this.'
      );
    } else {
      recommendations.push(
        'Excellent Fiber Consistency: Your recorded fiber intake supports optimal gut microbiome health and stable energy.'
      );
    }

    if (
      health.healthConditions?.includes('high_blood_pressure') &&
      averages.sodiumMg > 2000
    ) {
      recommendations.push(
        'Mind the Sodium Baseline: Weekly average sodium is elevated. Experiment with fresh aromatics (ginger, garlic, dawadawa) in place of extra bouillon cubes.'
      );
    } else {
      recommendations.push(
        'Balanced Variety: Continue pairing lean protein sources (fish, chicken, beans) with antioxidant-dense vegetables for steady nourishment.'
      );
    }

    res.json({
      startDate: startDateStr,
      endDate: endDateStr,
      daysLogged,
      totalMeals: weekMeals.length,
      averages,
      targets: {
        calories: profile.targetCalories || 2000,
        proteinG: profile.targetProteinG || 75,
        carbsG: profile.targetCarbsG || 250,
        fatG: profile.targetFatG || 65,
        fibreG: profile.targetFibreG || 28,
        sodiumMg: profile.targetSodiumMg || 2000,
      },
      dailyBreakdown,
      categoryCounts,
      recommendations,
    });
  } catch (error: any) {
    console.error('Failed to generate weekly report:', error);
    res.status(500).json({ error: 'Failed to generate weekly report' });
  }
});

// GET /api/suggestions: "What Should I Eat?" personalized meal suggestions
app.get('/api/suggestions', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const date = req.query.date ? String(req.query.date) : new Date().toISOString().split('T')[0];

    const profileRows = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, uid));
    const healthRows = await db
      .select()
      .from(healthPreferences)
      .where(eq(healthPreferences.userId, uid));

    const profile = profileRows[0] || {};
    const health = healthRows[0] || {};

    const dayMeals = await db
      .select()
      .from(meals)
      .where(and(eq(meals.userId, uid), eq(meals.date, date)));

    const allFoods = await db.select().from(foods).limit(100);

    const context = {
      primaryGoal: profile.primaryGoal,
      targetCalories: profile.targetCalories,
      targetProteinG: profile.targetProteinG,
      targetCarbsG: profile.targetCarbsG,
      targetFatG: profile.targetFatG,
      targetFibreG: profile.targetFibreG,
      targetSodiumMg: profile.targetSodiumMg,
      healthConditions: health.healthConditions || [],
      allergies: health.allergies || [],
      dietaryRestrictions: health.dietaryRestrictions || [],
      customNotes: health.customNotes || '',
    };

    const suggestions = generateMealSuggestions(dayMeals, context, allFoods);

    res.json({
      date,
      suggestions,
    });
  } catch (error: any) {
    console.error('Failed to generate meal suggestions:', error);
    res.status(500).json({ error: 'Failed to generate food suggestions' });
  }
});

// POST /api/user/delete-data: Complete privacy data deletion
app.post('/api/user/delete-data', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;

    // Delete cascading meal items and meals, user profiles, health preferences, and user
    await db.delete(meals).where(eq(meals.userId, uid));
    await db.delete(userProfiles).where(eq(userProfiles.userId, uid));
    await db.delete(healthPreferences).where(eq(healthPreferences.userId, uid));
    await db.delete(users).where(eq(users.uid, uid));

    res.json({ success: true, message: 'All your data has been permanently deleted.' });
  } catch (error: any) {
    console.error('Failed to delete user data:', error);
    res.status(500).json({ error: 'Failed to complete data deletion request' });
  }
});

// --- VITE MIDDLEWARE SETUP ---
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NourishTrack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
