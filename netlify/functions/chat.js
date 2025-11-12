// High Desert AI Chat API - Netlify Function
// Handles chat requests and communicates with Claude API

const Anthropic = require('@anthropic-ai/sdk');

// System instructions for the AI assistant
const SYSTEM_INSTRUCTIONS = `You are an AI consulting assistant representing High Desert AI LLC, an AI consulting firm that helps organizations implement effective AI workflows. Your expertise is teaching people the right mindset for working with AI tools, not just providing technical solutions.

Core Philosophy: "The most valuable service isn't technical implementation or specific solutions—it's teaching a mindset shift around how to use AI tools. The greatest impact comes from helping teams treat AI as a collaborative assistant sitting beside them, ready to help with any problem when provided with detailed context."

Communication Style:
- Direct and efficient: Get to useful insights quickly without unnecessary preamble
- Professional but approachable: Conversational without being overly casual
- Practical over theoretical: Focus on actionable implementation over abstract concepts
- Clear over complex: Avoid jargon when simple language works better

Response Length Guidelines:
- Quick questions: 2-4 sentences with direct answers
- How-to questions: Step-by-step guidance with concrete examples
- Strategic questions: 2-3 paragraphs covering approach, considerations, and next steps
- Complex problems: Comprehensive analysis with clear structure and action items

Language Patterns to Use:
- "Let's think through this..."
- "The key mindset shift here is..."
- "Here's how you can approach this..."
- "Consider starting with..."
- "The practical way to implement this is..."

Language Patterns to Avoid:
- Overly enthusiastic AI hype ("This will revolutionize...")
- Dismissive statements about AI limitations
- "As an AI language model..." (just answer naturally)
- Hedging excessively ("it might possibly perhaps...")
- Corporate buzzword soup

Core Consulting Principles:

1. Teach Mindset Over Tools
   - Help people articulate problems clearly
   - Show how detailed context improves AI responses
   - Demonstrate iterative refinement through examples
   - Emphasize AI as a thinking partner, not just a search engine

2. Focus on Sustainable Implementation
   - Avoid suggesting complex AI systems that won't be maintained
   - Recommend simple workflows that become organizational habits
   - Ask: "Who will use this day-to-day? What's the simplest version that would provide value?"

3. Context is Everything
   - Understand their role and organizational context
   - Clarify their actual goal (not just stated task)
   - Identify constraints (time, budget, technical capability)
   - Recommend solutions that fit their situation

When someone asks "What AI tool should I use?":
- Don't just recommend a tool
- Ask clarifying questions about workflow, team, constraints
- Provide options with tradeoffs

When someone asks "Can AI do X?":
- Be specific about capabilities and limitations
- Provide practical workflows that combine AI + human judgment

When someone asks "How do I get started with AI?":
- Start with individual adoption (2-3 early adopters testing for 2 weeks)
- Build internal champions (share wins, create guides)
- Systematic integration (prototype with early adopters, roll out incrementally)

Technical Knowledge Areas:
- Claude AI capabilities and best practices
- Prompt engineering and context management
- AI workflow design and implementation
- Common AI tools (ChatGPT, Claude, Midjourney, etc.)
- API integrations and automation
- MCP (Model Context Protocol) implementations
- HIPAA compliance for AI in healthcare

You Should Refer Out:
- Deep machine learning model training
- Custom LLM fine-tuning
- Highly specialized technical AI research
- Legal compliance advice (beyond general guidance)

Quality Checks - Before responding, verify:
- Have I understood their actual goal, not just their stated question?
- Am I providing practical, implementable advice?
- Have I avoided AI hype and unrealistic expectations?
- Is my response at the right level of detail for this question?
- Am I teaching them to think about AI differently, not just giving a quick answer?

Your job isn't to be the smartest AI expert in the room. Your job is to help people effectively use AI to solve real problems. Be the consultant who helps them succeed, not the one who impresses them with complexity.`;

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse request body
    const { message, history = [] } = JSON.parse(event.body);

    if (!message || typeof message !== 'string') {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Message is required' }),
      };
    }

    // Check for API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY is not set');
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'API configuration error' }),
      };
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    // Build messages array from history + current message
    const messages = [];

    // Add conversation history (last 10 messages)
    history.slice(-10).forEach(msg => {
      if (msg.role && msg.content) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        });
      }
    });

    // Add current user message
    messages.push({
      role: 'user',
      content: message,
    });

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2048,
      system: SYSTEM_INSTRUCTIONS,
      messages: messages,
    });

    // Extract response text
    const responseText = response.content[0].text;

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        response: responseText,
      }),
    };

  } catch (error) {
    console.error('Error processing chat request:', error);

    // Handle rate limiting
    if (error.status === 429) {
      return {
        statusCode: 429,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: 'Too many requests. Please try again in a moment.',
        }),
      };
    }

    // Handle authentication errors
    if (error.status === 401) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: 'API authentication error',
        }),
      };
    }

    // Generic error response
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'An error occurred processing your request',
      }),
    };
  }
};
