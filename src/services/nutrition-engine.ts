export interface NutrientSummary {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fibreG: number;
  sodiumMg: number;
  addedSugarG: number;
  hasIncompleteData: boolean;
}

export interface InsightResult {
  whatWentWell: string[];
  whatCouldImprove: string[];
  suggestedImprovements: string[];
  dataConfidence: 'high' | 'medium' | 'low';
  healthConditionNotes?: string;
}

export interface UserHealthContext {
  primaryGoal?: string | null;
  targetCalories?: number | null;
  targetProteinG?: number | null;
  targetCarbsG?: number | null;
  targetFatG?: number | null;
  targetFibreG?: number | null;
  targetSodiumMg?: number | null;
  targetSugarG?: number | null;
  healthConditions?: string[] | null;
  allergies?: string[] | null;
  dietaryRestrictions?: string[] | null;
  customNotes?: string | null;
}

/**
 * Calculates sum of nutritional values from an array of meal items
 */
export function calculateMealTotals(
  items: Array<{
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fibreG?: number | null;
    sodiumMg?: number | null;
    addedSugarG?: number | null;
    dataQuality?: string | null;
  }>
): NutrientSummary {
  let calories = 0;
  let proteinG = 0;
  let carbsG = 0;
  let fatG = 0;
  let fibreG = 0;
  let sodiumMg = 0;
  let addedSugarG = 0;
  let hasIncompleteData = false;

  for (const item of items) {
    calories += Number(item.calories || 0);
    proteinG += Number(item.proteinG || 0);
    carbsG += Number(item.carbsG || 0);
    fatG += Number(item.fatG || 0);
    fibreG += Number(item.fibreG || 0);
    sodiumMg += Number(item.sodiumMg || 0);
    addedSugarG += Number(item.addedSugarG || 0);

    if (item.dataQuality === 'partial' || item.dataQuality === 'estimate') {
      hasIncompleteData = true;
    }
  }

  return {
    calories: Math.round(calories * 10) / 10,
    proteinG: Math.round(proteinG * 10) / 10,
    carbsG: Math.round(carbsG * 10) / 10,
    fatG: Math.round(fatG * 10) / 10,
    fibreG: Math.round(fibreG * 10) / 10,
    sodiumMg: Math.round(sodiumMg * 10) / 10,
    addedSugarG: Math.round(addedSugarG * 10) / 10,
    hasIncompleteData,
  };
}

/**
 * Generates evidence-based daily insights from structured meal logs
 */
export function generateDailyInsights(
  meals: Array<{
    category: string;
    totalCalories: number;
    totalProteinG: number;
    totalCarbsG: number;
    totalFatG: number;
    totalFibreG: number;
    totalSodiumMg: number;
    totalSugarG: number;
    items?: Array<{
      foodName: string;
      dataQuality: string;
      fibreG: number;
      proteinG: number;
      sodiumMg: number;
    }>;
  }>,
  context: UserHealthContext
): InsightResult {
  const whatWentWell: string[] = [];
  const whatCouldImprove: string[] = [];
  const suggestedImprovements: string[] = [];
  const conditionNotesList: string[] = [];

  if (!meals || meals.length === 0) {
    return {
      whatWentWell: ['Ready to begin recording your meals for today.'],
      whatCouldImprove: ['No meals have been recorded yet today.'],
      suggestedImprovements: ['Log your first meal or snack to receive personalized feedback.'],
      dataConfidence: 'high',
      healthConditionNotes: 'Tracking consistently provides the most useful baseline for your health goals.',
    };
  }

  // Calculate day totals
  let dayCalories = 0;
  let dayProtein = 0;
  let dayCarbs = 0;
  let dayFat = 0;
  let dayFibre = 0;
  let daySodium = 0;
  let daySugar = 0;
  let totalItemCount = 0;
  let estimatedItemCount = 0;

  for (const m of meals) {
    dayCalories += Number(m.totalCalories || 0);
    dayProtein += Number(m.totalProteinG || 0);
    dayCarbs += Number(m.totalCarbsG || 0);
    dayFat += Number(m.totalFatG || 0);
    dayFibre += Number(m.totalFibreG || 0);
    daySodium += Number(m.totalSodiumMg || 0);
    daySugar += Number(m.totalSugarG || 0);

    if (m.items) {
      for (const it of m.items) {
        totalItemCount++;
        if (it.dataQuality !== 'verified') {
          estimatedItemCount++;
        }
      }
    }
  }

  // Determine data confidence
  let dataConfidence: 'high' | 'medium' | 'low' = 'high';
  if (meals.length < 2) {
    dataConfidence = 'medium'; // Partial day logged
  }
  if (totalItemCount > 0 && estimatedItemCount / totalItemCount > 0.4) {
    dataConfidence = 'low';
  }

  const targetProtein = context.targetProteinG || 75;
  const targetFibre = context.targetFibreG || 28;
  const targetSodium = context.targetSodiumMg || 2000;
  const targetSugar = context.targetSugarG || 35;

  // 1. Protein Intake Evaluation
  if (dayProtein >= targetProtein * 0.85) {
    whatWentWell.push(
      `Solid protein intake: You reached ${Math.round(dayProtein)}g, providing strong support for satiety and muscle maintenance.`
    );
  } else if (dayProtein < targetProtein * 0.6) {
    whatCouldImprove.push(
      `Recorded protein intake is currently lower (${Math.round(dayProtein)}g vs reference of ~${targetProtein}g).`
    );
    suggestedImprovements.push(
      `Consider including a familiar protein source such as Moi Moi, boiled eggs, grilled fish (e.g. Titus or catfish), or Greek yogurt in your next meal.`
    );
  }

  // 2. Fibre Evaluation
  if (dayFibre >= targetFibre * 0.8) {
    whatWentWell.push(
      `Generous dietary fibre recorded (${Math.round(dayFibre)}g), which supports steady digestion and cardiovascular health.`
    );
  } else if (dayFibre < 15) {
    whatCouldImprove.push(
      `Fibre intake recorded so far is modest (${Math.round(dayFibre)}g vs ~${targetFibre}g). Whole plant foods help slow digestion and moderate blood sugar spikes.`
    );
    suggestedImprovements.push(
      `Adding fiber-dense local foods like Efo Riro, brown beans (Ewa Oloyin), roasted corn with pear, garden eggs, or oats can easily increase your intake.`
    );
  }

  // 3. Sodium Evaluation & Health Condition logic
  const hasHypertension = context.healthConditions?.some((c) =>
    ['high_blood_pressure', 'hypertension', 'elevated_bp'].includes(c.toLowerCase())
  );
  if (hasHypertension) {
    conditionNotesList.push(
      'Blood Pressure Consideration: Evidence-based guidelines suggest moderating sodium intake and emphasizing potassium-rich vegetables and fruits. Seasoning with herbs, garlic, ginger, and reducing bouillon cubes can make a meaningful difference without sacrificing flavor.'
    );
    if (daySodium > 2000) {
      whatCouldImprove.push(
        `Recorded sodium is ${Math.round(daySodium)}mg. For managing blood pressure, keeping daily sodium under 1,800–2,000mg is beneficial.`
      );
      suggestedImprovements.push(
        'When enjoying soups like Egusi or Ogbono, or suya seasoning, try balancing with unsalted boiled plantain, fresh garden eggs, or extra leafy greens (ugwu/spinach).'
      );
    } else {
      whatWentWell.push(
        `Great job managing sodium intake today (${Math.round(daySodium)}mg), supporting healthy blood pressure.`
      );
    }
  } else if (daySodium > 2400) {
    whatCouldImprove.push(
      `Recorded sodium reached ${Math.round(daySodium)}mg. Packaged condiments and savory broths can accumulate quickly.`
    );
    suggestedImprovements.push(
      'Drinking ample water and balancing salty meals with fresh fruit (like oranges, watermelon, or banana) helps support electrolyte balance.'
    );
  }

  // 4. Diabetes / Carbohydrate Consistency Consideration
  const hasDiabetes = context.healthConditions?.some((c) =>
    ['diabetes', 'type_2_diabetes', 'type_1_diabetes', 'prediabetes'].includes(c.toLowerCase())
  );
  if (hasDiabetes) {
    conditionNotesList.push(
      'Blood Sugar Balance: Rather than eliminating carbohydrates, evidence supports pairing carbohydrates with protein, healthy fats, and soluble fiber to slow glucose absorption. Note: This educational insight does not replace direct clinical guidance or medication management from your physician.'
    );
    if (daySugar > targetSugar) {
      whatCouldImprove.push(
        `Added sugar intake reached ${Math.round(daySugar)}g. Limiting concentrated sweet beverages helps prevent steep blood glucose fluctuations.`
      );
      suggestedImprovements.push(
        'Substitute sweetened drinks with cold Zobo infused with fresh ginger/pineapple rind (without added sugar), or infused chilled water.'
      );
    }
  }

  // 5. Chronic Kidney Disease (CKD) Consideration
  const hasCKD = context.healthConditions?.some((c) =>
    ['kidney_disease', 'ckd', 'renal'].includes(c.toLowerCase())
  );
  if (hasCKD) {
    conditionNotesList.push(
      'Kidney Health Notice: Individual nutrient requirements (such as potassium, phosphorus, protein, and fluid allowances) vary substantially across stages of kidney health. We deliberately refrain from automatic restriction targets. Please consult your nephrologist or registered renal dietitian for personalized targets.'
    );
  }

  // 6. Food Group Variety
  if (meals.length >= 3) {
    whatWentWell.push(
      `Consistent meal structure: Logging across ${meals.length} meal windows gives a clear picture of your nourishment throughout the day.`
    );
  }

  // Fallbacks if lists are minimal
  if (whatWentWell.length === 0) {
    whatWentWell.push('You took an active step by tracking your food intake today.');
  }
  if (whatCouldImprove.length === 0) {
    whatCouldImprove.push('Your nutrient breakdown aligns well with balanced dietary guidelines for today.');
  }
  if (suggestedImprovements.length === 0) {
    suggestedImprovements.push('Maintain your current meal rhythm and prioritize staying well-hydrated.');
  }

  return {
    whatWentWell,
    whatCouldImprove,
    suggestedImprovements,
    dataConfidence,
    healthConditionNotes: conditionNotesList.join('\n\n'),
  };
}

/**
 * Meal suggestions for "What Should I Eat?" based on recorded intake & dietary constraints
 */
export function generateMealSuggestions(
  mealsToday: Array<{
    totalCalories: number;
    totalProteinG: number;
    totalCarbsG: number;
    totalFatG: number;
    totalFibreG: number;
    totalSodiumMg: number;
  }>,
  context: UserHealthContext,
  allFoods: Array<{
    id: number;
    name: string;
    cuisineRegion: string;
    category: string;
    servingSize: number;
    servingUnit: string;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fibreG: number;
    sodiumMg: number;
    allergens?: string[] | null;
    description?: string | null;
  }>
) {
  let todayProtein = 0;
  let todayFibre = 0;
  let todaySodium = 0;

  for (const m of mealsToday) {
    todayProtein += Number(m.totalProteinG || 0);
    todayFibre += Number(m.totalFibreG || 0);
    todaySodium += Number(m.totalSodiumMg || 0);
  }

  const userAllergens = (context.allergies || []).map((a) => a.toLowerCase().trim());
  const userRestrictions = (context.dietaryRestrictions || []).map((r) => r.toLowerCase().trim());
  const hasHypertension = context.healthConditions?.some((c) =>
    ['high_blood_pressure', 'hypertension'].includes(c.toLowerCase())
  );
  const targetProtein = context.targetProteinG || 75;
  const targetFibre = context.targetFibreG || 28;

  const needsProtein = todayProtein < targetProtein * 0.7;
  const needsFibre = todayFibre < targetFibre * 0.6;

  // Filter safe foods
  const safeFoods = allFoods.filter((f) => {
    // Check allergens
    if (f.allergens && Array.isArray(f.allergens)) {
      for (const itemAllergen of f.allergens) {
        if (
          userAllergens.some((userAllergy) =>
            itemAllergen.toLowerCase().includes(userAllergy) || userAllergy.includes(itemAllergen.toLowerCase())
          )
        ) {
          return false;
        }
      }
    }

    // Check vegetarian/vegan
    if (userRestrictions.includes('vegetarian')) {
      if (['meat_poultry', 'fish_seafood'].includes(f.category)) return false;
    }
    if (userRestrictions.includes('vegan')) {
      if (['meat_poultry', 'fish_seafood', 'dairy_alternatives'].includes(f.category)) return false;
    }
    if (userRestrictions.includes('pescatarian')) {
      if (f.category === 'meat_poultry') return false;
    }

    // If hypertension, avoid very high sodium foods (>500mg)
    if (hasHypertension && f.sodiumMg > 500) {
      return false;
    }

    return true;
  });

  // Build suggestion recommendations
  const suggestions = [];

  // 1. Nigerian balanced dinner suggestion
  const nigerianProteinFibre = safeFoods.filter(
    (f) =>
      f.cuisineRegion === 'Nigerian' &&
      (needsProtein ? f.proteinG >= 10 : true) &&
      (needsFibre ? f.fibreG >= 4 : true)
  );

  if (nigerianProteinFibre.length > 0) {
    const selected = nigerianProteinFibre[0];
    suggestions.push({
      title: `Wholesome Local Plate: ${selected.name}`,
      category: 'Dinner / Main Meal',
      foodName: selected.name,
      serving: `${selected.servingSize} ${selected.servingUnit}`,
      calories: Math.round(selected.calories),
      proteinG: selected.proteinG,
      fibreG: selected.fibreG,
      reason: needsProtein
        ? `Provides ${selected.proteinG}g of natural protein and ${selected.fibreG}g of dietary fiber to close your daily protein gap without excess sodium.`
        : `A hearty, comforting traditional meal rich in fiber (${selected.fibreG}g) to support sustained satiety overnight.`,
      allergensWarning: selected.allergens?.length
        ? `Contains: ${selected.allergens.join(', ')}`
        : 'Allergen free',
    });
  }

  // 2. Light Vegetable or Soup pairing
  const veggieOption = safeFoods.find(
    (f) =>
      (f.category === 'vegetables' || f.category === 'soups_stews') &&
      f.fibreG >= 3 &&
      f.calories <= 250
  );
  if (veggieOption) {
    suggestions.push({
      title: `Nutrient-Rich Greens: ${veggieOption.name}`,
      category: 'Side / Lunch Addition',
      foodName: veggieOption.name,
      serving: `${veggieOption.servingSize} ${veggieOption.servingUnit}`,
      calories: Math.round(veggieOption.calories),
      proteinG: veggieOption.proteinG,
      fibreG: veggieOption.fibreG,
      reason:
        'Adds micronutrients, antioxidants, and gentle bulk with minimal caloric density, perfect for balancing carbohydrate-rich swallows or rice.',
      allergensWarning: veggieOption.allergens?.length
        ? `Contains: ${veggieOption.allergens.join(', ')}`
        : 'Allergen free',
    });
  }

  // 3. Smart Snack / Recovery option
  const snackOption = safeFoods.find(
    (f) =>
      (f.category === 'fruits' || f.category === 'legumes' || f.category === 'dairy_alternatives') &&
      f.calories < 220 &&
      f.sodiumMg < 150
  );
  if (snackOption) {
    suggestions.push({
      title: `Energizing Snack: ${snackOption.name}`,
      category: 'Midday Snack',
      foodName: snackOption.name,
      serving: `${snackOption.servingSize} ${snackOption.servingUnit}`,
      calories: Math.round(snackOption.calories),
      proteinG: snackOption.proteinG,
      fibreG: snackOption.fibreG,
      reason:
        'A quick, unprocessed snack providing clean energy, electrolytes, and healthy satiety between main meals.',
      allergensWarning: snackOption.allergens?.length
        ? `Contains: ${snackOption.allergens.join(', ')}`
        : 'Allergen free',
    });
  }

  return suggestions;
}
