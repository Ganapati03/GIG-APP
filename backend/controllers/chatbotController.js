import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI lazily to ensure env vars are loaded
let genAI;

const getGenAI = () => {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing from environment variables");
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

// Helper function to generate content with fallback
const generateResponseWithFallback = async (prompt) => {
  const ai = getGenAI();
  const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash-lite-001', 'gemini-2.0-flash'];
  
  let lastError;

  for (const modelName of modelsToTry) {
    try {
      // console.log(`Trying model: ${modelName}`);
      const model = ai.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.warn(`Model ${modelName} failed:`, error.message);
      lastError = error;
      
      // If valid key but quota/server error, continue to next model
      if (error.status === 429 || error.status === 503 || error.message?.includes('quota')) {
        continue;
      }
      
      // If key invalid or other fatal error, stop trying
      if (error.message?.includes('API key')) {
        throw error;
      }
    }
  }
  
  console.error('All models failed.');
  throw lastError;
};

/**
 * @route   POST /api/chatbot
 * @desc    Chat with Gemini AI assistant for freelancers
 * @access  Private
 */
export const chatWithBot = async (req, res, next) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message'
      });
    }

    // System prompt for freelancer assistant
    const systemPrompt = `You are an AI assistant for GigFlow, a freelance marketplace platform. 
Your role is to help freelancers with:
- Finding the right gigs to bid on
- Writing compelling bid proposals
- Pricing their services competitively
- Managing their freelance career
- Understanding platform features
- Best practices for winning projects

Be helpful, professional, and concise. If asked about specific gigs or user data, 
remind users to check their dashboard. Focus on general advice and guidance.

User: ${req.user.name}
User Email: ${req.user.email}`;

    // Build conversation context
    let prompt = systemPrompt + '\n\n';
    
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.forEach(msg => {
        prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
    }
    
    prompt += `User: ${message}\nAssistant:`;

    // Generate response with fallback
    const botReply = await generateResponseWithFallback(prompt);

    res.status(200).json({
      success: true,
      message: botReply,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    
    // Handle specific Gemini API errors
    if (error.message?.includes('API key')) {
      return res.status(500).json({
        success: false,
        message: `Config Error: ${error.message}`
      });
    }

    if (error.message?.includes('quota') || error.status === 429) {
      return res.status(429).json({
        success: false,
        message: 'Chatbot service is temporarily unavailable due to high traffic. Please try again later.'
      });
    }

    next(error);
  }
};

/**
 * @route   POST /api/chatbot/suggest-bid
 * @desc    Get AI suggestions for bid proposal
 * @access  Private
 */
export const suggestBidProposal = async (req, res, next) => {
  try {
    const { gigTitle, gigDescription, gigBudget, userSkills } = req.body;

    if (!gigTitle || !gigDescription) {
      return res.status(400).json({
        success: false,
        message: 'Please provide gig title and description'
      });
    }

    const prompt = `As a freelance bid writing expert, create a compelling bid proposal for the following gig:

Gig Title: ${gigTitle}
Gig Description: ${gigDescription}
Budget: $${gigBudget || 'Not specified'}
Freelancer Skills: ${userSkills?.join(', ') || 'General'}

Generate a professional, concise bid proposal (max 200 words) that:
1. Shows understanding of the project requirements
2. Highlights relevant skills and experience
3. Proposes a clear approach
4. Sounds confident but not arrogant
5. Includes a call to action

Format the response as a ready-to-use bid message.`;

    const suggestion = await generateResponseWithFallback(prompt);

    res.status(200).json({
      success: true,
      suggestion,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Bid suggestion error:', error);
    next(error);
  }
};

/**
 * @route   POST /api/chatbot/analyze-gig
 * @desc    Get AI analysis of a gig opportunity
 * @access  Private
 */
export const analyzeGig = async (req, res, next) => {
  try {
    const { gigTitle, gigDescription, gigBudget, userSkills } = req.body;

    if (!gigTitle || !gigDescription) {
      return res.status(400).json({
        success: false,
        message: 'Please provide gig title and description'
      });
    }

    const prompt = `Analyze this freelance gig opportunity:

Gig Title: ${gigTitle}
Description: ${gigDescription}
Budget: $${gigBudget || 'Not specified'}
My Skills: ${userSkills?.join(', ') || 'General'}

Provide a brief analysis (max 150 words) covering:
1. Skill match score (1-10)
2. Estimated time commitment
3. Red flags or concerns (if any)
4. Recommended bid range
5. Overall recommendation (Should I bid? Yes/No/Maybe)

Be honest and practical.`;

    const analysis = await generateResponseWithFallback(prompt);

    res.status(200).json({
      success: true,
      analysis,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Gig analysis error:', error);
    next(error);
  }
};
