import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

// PRIVATE - Only loads YOUR key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  // Rate limit protection
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ 
      error: 'API Key not configured. Check .env.local' 
    }, { status: 500 });
  }

  try {
    const { messages } = await req.json();
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',  // CHEAPEST GPT-4 quality
      stream: true,
      messages: [
        {
          role: 'system',
          content: `You are BlackBox AI Clone - Ultimate Code Assistant.

EXPERTISE:
- Fullstack apps (React/Next.js/Node/Python)
- Debug complex code  
- Framework expert (Tailwind, shadcn, Prisma)
- Production ready code
- VSCode-like formatting

RESPONSE FORMAT:
\`\`\`javascript
// Your perfect code here
\`\`\`
+ Explanation below

Current date: ${new Date().toLocaleDateString()}`
        },
        ...messages.slice(-10) // Context window optimization
      ],
      temperature: 0.1,
      max_tokens: 8000, // MAX code generation
      top_p: 0.9
    });

    const stream = OpenAIStream(response, {
      onCompletion: async (completion) => {
        // Auto-extract code to editor
        const codeMatch = completion.match(/```[\s\S]*?```/);
        if (codeMatch) {
          // Could send to frontend via SSE
          console.log('Code extracted:', codeMatch[0]);
        }
      }
    });

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('OpenAI error:', error);
    return NextResponse.json({ 
      error: 'AI service error. Check usage limits.' 
    }, { status: 500 });
  }
}
