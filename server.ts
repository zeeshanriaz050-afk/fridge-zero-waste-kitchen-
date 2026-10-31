import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Increase payload limit for base64 image uploads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Initialize Google GenAI with required telemetry User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint: Scan fridge photo or parse text/voice for ingredients
app.post('/api/scan-fridge', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', textPrompt } = req.body;

    if (!imageBase64 && !textPrompt) {
      return res.status(400).json({ error: 'Please provide either an image or a text description of your ingredients.' });
    }

    const contents: any[] = [];

    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      contents.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: cleanBase64,
        },
      });
    }

    const promptText = `
You are an expert chef and zero-waste kitchen specialist analyzing a user's fridge, pantry, or leftover ingredients.
${textPrompt ? `User's added note/voice input: "${textPrompt}"` : ''}

Analyze the provided image and/or description thoroughly. Identify all edible ingredients, leftovers, vegetables, condiments, dairy, carbs, and proteins.
For each item detected:
1. Identify its name in clear English (and common Urdu/Hindi colloquial name if applicable, e.g. "Leftover Boiled Rice (Bache Hue Chawal)").
2. Category: one of ["Vegetable", "Protein", "Dairy", "Grain/Carb", "Fruit", "Condiment/Sauce", "Spice/Pantry"].
3. Estimated quantity or state (e.g. "1 bowl", "2 eggs", "half bunch", "half bottle", "leftover cup").
4. Freshness status: one of ["fresh", "use_soon", "urgent_rescue"].
5. Estimated days left before spoiling (e.g. 1, 2, 5).
6. Short tip for preservation or rescue.

Return your response strictly adhering to the JSON schema.`;

    contents.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts: contents },
      config: {
        systemInstruction: 'You are an ultra-observant zero-waste culinary expert. Detect all visible food items, packaged or loose leftovers, half-used items, and assess food waste risk realistically.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  localName: { type: Type.STRING },
                  category: { type: Type.STRING },
                  quantity: { type: Type.STRING },
                  freshness: { type: Type.STRING },
                  daysLeft: { type: Type.INTEGER },
                  rescueTip: { type: Type.STRING },
                },
                required: ['id', 'name', 'category', 'quantity', 'freshness', 'daysLeft'],
              },
            },
            summary: { type: Type.STRING },
            highRiskCount: { type: Type.INTEGER },
          },
          required: ['detectedItems', 'summary', 'highRiskCount'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error scanning fridge:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to scan fridge image. Please check your image and try again.',
    });
  }
});

// Endpoint: Generate zero-waste recipes based on detected/selected ingredients
app.post('/api/generate-recipes', async (req, res) => {
  try {
    const {
      ingredients = [],
      cuisinePreference = 'Any',
      dietary = 'None',
      maxTimeMinutes = 30,
      language = 'English', // 'English', 'Roman Urdu', 'Urdu'
      pantryStaplesIncluded = true, // assume salt, oil, basic spices are available
    } = req.body;

    if (!ingredients.length) {
      return res.status(400).json({ error: 'Please provide at least one ingredient to generate recipes.' });
    }

    const promptText = `
You are a zero-waste master chef specializing in hostel, home, and quick daily cooking ("Aaj Kya Pakayein?").
Ingredients available in the user's kitchen:
${ingredients.map((ing: any) => `- ${typeof ing === 'string' ? ing : `${ing.name} (${ing.quantity || 'available'}) - status: ${ing.freshness || 'fresh'}`}`).join('\n')}

Preferences:
- Cuisine Style: ${cuisinePreference}
- Dietary Filter: ${dietary}
- Max Cooking Time: ${maxTimeMinutes} minutes
- Language for recipe titles, descriptions, and tips: ${language} (if 'Roman Urdu', write friendly conversational Roman Urdu like "Mazedar Masala Fried Rice: Bache hue chawal aur anday se 10 minute mein tayar!"; if 'Urdu', provide Urdu script; if 'English', English with optional desi subtitles).
- Kitchen Staples: ${pantryStaplesIncluded ? 'User has basic oil, salt, red chili, pepper, garlic/ginger, turmeric, water' : 'Strictly only what is listed above'}.

Generate 3 creative, high-utility, zero-waste recipes:
1. A super-fast 10-15 min quick fix (e.g. Masala Egg scramble or Fried Rice or Bread Toastie)
2. A wholesome hearty main dish that completely rescues the highest-risk leftovers
3. A creative fusion or comfort dish

For each recipe, provide:
- id: unique string
- title: catchy recipe name in requested language
- subtitle: short appetizing hook highlighting the rescued ingredients
- prepTime: e.g. "5 mins"
- cookTime: e.g. "12 mins"
- totalMinutes: number
- difficulty: "Easy", "Medium", or "Quick"
- wasteRescueScore: integer from 80 to 100 (% of leftovers used)
- estimatedSavings: string (e.g. "$4.50" or "Rs. 450")
- servings: integer (e.g. 1-2 or 3-4)
- ingredientsUsed: array of items used from the fridge
- smartSubstitutions: array of objects { missingIngredient: string, substitute: string, whyItWorks: string } for anything a typical cook might not have
- steps: array of step-by-step instructions with clear, friendly guidance
- chefZeroWasteTip: golden advice on how to avoid future waste or store leftovers
- nutritionSummary: calories, protein, highlight

Return strictly valid JSON adhering to schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: 'You are a warm, ingenious chef who turns scraps and random fridge leftovers into restaurant-worthy comfort food. You prioritize zero food waste and practical pantry substitutions.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            recipes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  subtitle: { type: Type.STRING },
                  prepTime: { type: Type.STRING },
                  cookTime: { type: Type.STRING },
                  totalMinutes: { type: Type.INTEGER },
                  difficulty: { type: Type.STRING },
                  wasteRescueScore: { type: Type.INTEGER },
                  estimatedSavings: { type: Type.STRING },
                  servings: { type: Type.INTEGER },
                  ingredientsUsed: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  smartSubstitutions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        missingIngredient: { type: Type.STRING },
                        substitute: { type: Type.STRING },
                        whyItWorks: { type: Type.STRING },
                      },
                      required: ['missingIngredient', 'substitute', 'whyItWorks'],
                    },
                  },
                  steps: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  chefZeroWasteTip: { type: Type.STRING },
                  nutritionSummary: { type: Type.STRING },
                },
                required: [
                  'id',
                  'title',
                  'subtitle',
                  'prepTime',
                  'cookTime',
                  'totalMinutes',
                  'difficulty',
                  'wasteRescueScore',
                  'estimatedSavings',
                  'servings',
                  'ingredientsUsed',
                  'steps',
                  'chefZeroWasteTip',
                ],
              },
            },
          },
          required: ['headline', 'recipes'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating recipes:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate recipes. Please try again.',
    });
  }
});

// Endpoint: Smart Ingredient Substitution
app.post('/api/find-substitution', async (req, res) => {
  try {
    const { ingredient, recipeContext, currentKitchenPantry = [] } = req.body;

    if (!ingredient) {
      return res.status(400).json({ error: 'Please specify the ingredient you need a substitute for.' });
    }

    const promptText = `
User needs an emergency zero-waste culinary substitution for: "${ingredient}".
${recipeContext ? `Recipe or Dish context: "${recipeContext}"` : ''}
${currentKitchenPantry.length ? `Items currently available in their kitchen: ${currentKitchenPantry.join(', ')}` : ''}

Provide 3 practical substitutions that ordinary households, hostel students, and busy cooks actually have:
- Title/Substitute Name
- Ratio (e.g. "1:1 swap", "1 tablespoon yogurt + 1 teaspoon water for milk")
- Flavor & texture profile
- Best suited for (baking, frying, gravy, seasoning)
- Practical adjustment tips`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: 'You are a culinary science master and practical home economist. Suggest real-world pantry swaps.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            targetIngredient: { type: Type.STRING },
            bestQuickFix: { type: Type.STRING },
            substitutes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  ratio: { type: Type.STRING },
                  howToPrepare: { type: Type.STRING },
                  flavorDifference: { type: Type.STRING },
                  ratingStars: { type: Type.INTEGER },
                },
                required: ['name', 'ratio', 'howToPrepare', 'flavorDifference'],
              },
            },
          },
          required: ['targetIngredient', 'bestQuickFix', 'substitutes'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error finding substitution:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to find substitution.',
    });
  }
});

// Endpoint: "Aaj Kya Pakayein?" 1-Click Instant Idea Roulette
app.post('/api/roulette-idea', async (req, res) => {
  try {
    const { ingredients = [], language = 'English' } = req.body;

    const promptText = `
The user is tired, standing in front of the fridge asking: "Aaj kya pakayein?" (What to cook today?).
Give 1 single, irresistible, 15-minute rescue dish using some or all of these items:
${ingredients.map((i: any) => typeof i === 'string' ? i : i.name).join(', ') || 'Leftover rice, eggs, onion, chili, spices'}

Language: ${language}.
Keep it concise, energetic, and mouthwatering.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dishName: { type: Type.STRING },
            catchyReason: { type: Type.STRING },
            prepTime: { type: Type.STRING },
            threeStepSummary: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            wasteSavedGramEstimate: { type: Type.INTEGER },
          },
          required: ['dishName', 'catchyReason', 'prepTime', 'threeStepSummary', 'wasteSavedGramEstimate'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error getting roulette idea:', error);
    return res.status(500).json({ error: error?.message || 'Failed to get roulette idea.' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Fridge-to-Plate server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
