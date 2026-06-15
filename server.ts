import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize the Google Gemini API client
// Always use process.env.GEMINI_API_KEY on the server.
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('Google Gemini AI client successfully initialized on backend.');
  } catch (error) {
    console.error('Failed to initialize Google Gen AI client:', error);
  }
} else {
  console.log('WARNING: GEMINI_API_KEY is not defined or is placeholder. AI Assistant will operate under simulated offline fallback mode.');
}

// --------------------------------------------------------------------------
// API ENDPOINTS FOR EDUVERSE AI
// --------------------------------------------------------------------------

// 1. AI Assistant Chat and Tools Endpoint
app.post('/api/ai/chat', async (req, res) => {
  const { messages, type, context } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Missing or invalid "messages" array.' });
  }

  const userPrompt = messages[messages.length - 1]?.text || 'Hello';

  // If Gemini client is not initialized, fallback to highly robust, structured offline mocks
  if (!ai) {
    return res.json({
      text: getOfflineFallbackResponse(userPrompt, type, context),
      isFallback: true
    });
  }

  try {
    let systemInstruction = 'You are EduVerse AI, an expert, enthusiastic educational AI mentor and academic guide. ' +
      'You support high schoolers, college graduates, research scholars, teachers, and university managers. ' +
      'Be encouraging, clear, and highly structured with Markdown lists, inline code blocks, and headers.';

    if (type === 'doubt') {
      systemInstruction += ' You are now in doubt-solving mode. Deconstruct any mathematical, scientific, literary, or technical query step-by-step. Use real examples, cite logical axioms, and finish with a 1-sentence recap.';
    } else if (type === 'planner') {
      systemInstruction += ' You are now in study-planner mode. Format the custom study program beautifully using Markdown calendars, day-by-day objectives, milestones, and specific book suggestions.';
    } else if (type === 'notes') {
      systemInstruction += ' You are now in notes-generator mode. Turn the text or query into high-yield educational study cards with Bold Key terms, concise bullet points, FAQs, and self-test quiz questions.';
    }

    const contents = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // Generate content using gemini-3.5-flash as default as instructed in the skill guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({
      text: response.text || 'I analyzed that request but generated no text. Please try again! Enjoy your learning journey.',
      isFallback: false
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.json({
      text: `[Authentication/API Key Offline, using Safe Tutor Companion Database]\n\n${getOfflineFallbackResponse(userPrompt, type, context)}`,
      error: error.message,
      isFallback: true
    });
  }
});

// 2. AI Smart Search Suggestions Endpoint
app.post('/api/ai/suggest', async (req, res) => {
  const { query } = req.body;
  if (!query || typeof query !== 'string') {
    return res.json({ suggestions: [] });
  }

  if (!ai) {
    const offlineSugg = [
      'Advanced Calculus guide books',
      'Organic chemistry 3D virtual simulation models',
      'SAT Prep Masterclass syllabus',
      'Aero-elastic mathematical formula references',
      'Rotring premium mechanical drafting pencils'
    ].filter(s => s.toLowerCase().includes(query.toLowerCase()));
    return res.json({ suggestions: offlineSugg });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Provide a quick, comma-separated list of 5 educational Search suggestions (e.g., books, scientific tools, digital programs, courses) matching this user seed query: "${query}". Return absolutely nothing except the comma-separated strings.`,
    });

    const listText = response.text || '';
    const suggestions = listText
      .split(',')
      .map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '').trim())
      .filter(s => s.length > 0);

    res.json({ suggestions });
  } catch (error) {
    res.json({ suggestions: [`${query} guide`, `${query} core lessons`, `${query} workbook`] });
  }
});

// 3. AI-Powered Products Custom Recommendation Endpoint
app.post('/api/ai/recommend-products', async (req, res) => {
  const { academicLevel, interestQuery } = req.body;
  
  if (!ai) {
    // Generate helpful products recommendation based on categories
    return res.json({
      explanation: `Based on your level (${academicLevel || 'All'}), we highly recommend combining practical books with active study accessories like fine-liners and study lamps! These are optimized with student discount tiers up to 50% for standard campuses.`,
      productIds: academicLevel === 'University' ? ['b3', 'd3', 'a3'] : ['b1', 's3', 's5']
    });
  }

  try {
    const prompt = `We have these educational products with IDs:
    - b1: NCERT Class 10 Science Exemplar Solutions (₹150.00, level: School)
    - b2: Advanced Principles of Organic Chemistry (₹480.00, level: College)
    - b3: JEE Mains & Advanced Prep Physics Volume 1 (₹450.00, level: University)
    - b4: Oxford Student Reference Atlas for India (₹290.00, level: All)
    - b5: Visual Calculus Concepts [Interactive E-Book] (₹99.00, level: College)
    - s1: Luxury Executive Finish Gel Pens (Pack of 5) (₹120.00, level: All)
    - s2: Fine Charcoal Matte Pencils (12 Pack) (₹80.00, level: School)
    - s3: Premium Spiral Grid Subject Notebook (₹140.00, level: All)
    - s4: Artistic Fine-Tip Drawing Fineliners Set (₹240.00, level: University)
    - s5: Mathematical High-Grade Instrument Geometry Box (₹190.00, level: School)
    - a1: Ergonomic Water-Resistant Class Backpack (₹499.00, level: All)
    - a2: Pocket Scientific Trigonometric Calculator (₹350.00, level: College)
    - a3: Heavy-Duty Drafting Compass & Divider Set (₹160.00, level: University)
    - a4: Rechargeable Eye-Care Flexible Study Lamp (₹390.00, level: All)
    - d1: STEM Formulas Quick PDF Guide (₹49.00, level: All)
    - d2: Advanced Molecular Biology Digital Study Guide (₹120.00, level: College)
    - d3: All-Chapter Topper Hand-Written Notes (₹99.00, level: University)
    - d4: Simulated Board & Competitive Practice Papers (₹180.00, level: School)

    Recommend the top 3 best matching products for a user with academic level: "${academicLevel || 'All'}" and interests: "${interestQuery || 'Mathematics, Study planning, science'}".
    Provide custom expert explanation of exactly WHY you selected these for their educational success. Do not return raw code, write a clear, helpful response explaining your choices. Also include a line at the end with this format: "RECOMMENDED_IDS: id1, id2, id3"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    const text = response.text || '';
    const recommendedIds: string[] = [];
    const match = text.match(/RECOMMENDED_IDS:\s*([a-z0-9,\s]+)/i);
    if (match && match[1]) {
      match[1].split(',').forEach(id => {
        const cleaned = id.trim().toLowerCase();
        if (cleaned) recommendedIds.push(cleaned);
      });
    }

    res.json({
      explanation: text.replace(/RECOMMENDED_IDS:\s*([a-z0-9,\s]+)/i, '').trim(),
      productIds: recommendedIds.length > 0 ? recommendedIds : ['b1', 'd1', 's3']
    });
  } catch (error) {
    res.json({
      explanation: "Our systems selected top calculus guides and digital notes assets to enrich your active research tracks.",
      productIds: ['b3', 'd1', 's3']
    });
  }
});

// 4. Razorpay simulated payload signing route
app.post('/api/checkout/simulate-rzp', (req, res) => {
  const { amount, currency, address } = req.body;
  const orderId = 'rzp_order_' + Math.floor(Math.random() * 899999 + 100000);
  res.json({
    success: true,
    orderId,
    amount,
    currency: currency || 'INR',
    merchantName: 'EduVerse AI Payments',
    studentDiscountApplied: true,
    key_id: 'rzp_test_edu_7aBcD123XyZ'
  });
});

// --------------------------------------------------------------------------
// LOCAL FALLBACK GENERATORS FOR OFFLINE RESILIENCE
// --------------------------------------------------------------------------
function getOfflineFallbackResponse(prompt: string, type?: string, context?: any): string {
  const qStr = prompt.toLowerCase();

  if (type === 'doubt' || qStr.includes('solving') || qStr.includes('solve')) {
    return `### 💡 EduVerse Study Assistant • Doubt Solved

Here is a structured explanation curated by our academic engine for: **"${prompt}"**

1. **Core Concept Theory**: When analyzing this scientific or mathematical paradigm, we must evaluate the fundamental constraints. For calculations, write down the known values and state independent coordinates. For humanities, isolate the context-driven historical theme.
2. **Step-by-Step Breakdown**:
   * *Phase 1*: Define standard coordinates and formulas (e.g. $F = m \\cdot a$ or $\\int_{a}^{b} f(x)dx$).
   * *Phase 2*: Isolate modern boundary variables and apply linear constraints.
   * *Phase 3*: Solve iteratively. Check algebraic symbols to avoid early signs errors.
3. **Illustrative Sample**:
   \`\`\`typescript
   // Quantitative simulation of vector forces
   const massPrism = 5.8; // kg
   const accelGravity = 9.81; // m/s^2
   const forceTotal = massPrism * accelGravity;
   console.log(\`Calculated Gravitational Force: \${forceTotal} Newtons\`);
   \`\`\`
   
**Key takeaway**: Always double-check dimensional physical values. Let me know if you would like to run another problem set! Ensure you check the **Advanced Calculus & Physics** courses in the EduVerse store today for a deep dive!`;
  }

  if (type === 'planner' || qStr.includes('study plan') || qStr.includes('schedule') || qStr.includes('calendar')) {
    const hours = context?.hoursPerDay || 3;
    const subj = context?.subject || 'STEM Core Modules';
    return `### 📅 Recommended Study Program & Milestone Syllabus
**Focus**: ${subj} • **Target Time**: ${hours} Hours/Day (Curated by EduVerse AI)

| Timeline | Study Topics | Daily Goals | Recommended Store Assets |
| :--- | :--- | :--- | :--- |
| **Days 1-2** | Foundations & Nomenclature | Core notations review (30m) & reading sample proofs (60m). | *Prep Physics Volume 1* (b3) |
| **Days 3-5** | Analytical Deep Dive | Deep calculations practice. Set up structural flow charts. | *Exemplar solutions* (b1) |
| **Days 6-8** | Mind-Mapping & Synthesis | Synthesize logic models. Practice previous standard papers. | *Graphite Pencils* (s2) |
| **Days 9-10** | Continuous Assessment | Simulating exams under timed conditions. Clear doubts. | *Quick PDF Guide* (d1) |

**AI Strategy Tips**:
* Avoid continuous studying above 90 minutes. Practice the Pomodoro technique (45m study, 5m break).
* Use the **Interactive Fluid Simulations Pass** within our portal to physically visualize thermodynamics curves!`;
  }

  if (type === 'notes' || qStr.includes('notes') || qStr.includes('summary') || qStr.includes('explain')) {
    return `### 📝 Custom Study Notes • High-Yield Revision Slate
**Main Subject**: ${prompt}

#### 🎯 Critical Definitions & Axioms
* **Core Phenomenon**: The fundamental analytical theory is centered around maximizing student attention and providing real-time cognitive reinforcement.
* **Variable Isolation**: Maintaining high density notes structured with markdown helps visual remembrance during examination conditions.

#### 💡 Structured Key Concepts
* **Dynamic Active Learning**: The method of immediate retrieval of concepts (e.g. solving active revision cards).
* **Distributed Practice**: Spacing revision cycles across 3 to 4 days to maximize retention.

#### ❓ Short Exam Self-Test Sandbox
1. *Question*: What is the quickest formula to optimize active storage?
   *Answer*: Spaced retrieval cycles combined with comprehensive mind-maps built using fine-liners.
2. *Question*: How does the student discount apply?
   *Answer*: Apply code **STUDENT30** at checkout for an instant extra 30% discount off physical textbooks!`;
  }

  // General chat response
  return `### 🎓 Welcome to EduVerse AI Assistant!

I am your responsive educational companion. I am fully integrated server-side with Google's **Gemini 3.5 Flash** models to handle any academic challenge.

**How I can skyrocket your academic performance today:**
1. 💡 **Doubt Solver**: Ask me any question, double integrals list, formulas, biology doubts, or code logic.
2. 📅 **Custom Study Planners**: Provide your upcoming test dates, and I will generate a comprehensive daily grid.
3. 📝 **Exhaustive Interactive Notes**: Provide raw text or topics, and I will instantly compose visual checklists and flashcards.
4. 🛒 **Smart Book Recommendations**: Tell me your academic level (School, College, or University) and I will select premium discounted materials from our catalog.

*Prompt suggestions: type "Write a revision guide for photosynthesis" or "Solve a thermodynamic double integral problem" to begin!*`;
}

// --------------------------------------------------------------------------
// VITE DEV SERVER OR STATIC PRODUCTION INGRESS
// --------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware mounted in Development mode.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving production static assets.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduVerse AI Server boot absolute success. Listening on http://localhost:${PORT}`);
  });
}

startServer();
