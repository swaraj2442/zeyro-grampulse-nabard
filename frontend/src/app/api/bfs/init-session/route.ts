import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userName, role, stage, companyName, companyDescription } = body;

    // Generate a mock session ID
    const sessionId = crypto.randomUUID();
    
    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    return NextResponse.json({
      sessionId,
      agentResponse: `I'm Zeyro, and I'm excited to build ${companyName || 'your company'} with you. We'll sharpen who you serve, what the product actually does, your business model, go-to-market path, and the mission behind the credit analytics.`,
      toolExecution: {
        toolName: "AskUserQuestion",
        questionData: {
          id: "q1",
          type: "multiple_choice",
          step: 1,
          totalSteps: 3,
          question: `What best describes ${companyName || 'your company'}'s target market?`,
          options: [
            {
              id: "opt_1",
              title: "Lenders and NBFCs",
              description: "Banks, fintech lenders, and NBFCs that need better risk decisions.",
              recommended: true
            },
            {
              id: "opt_2",
              title: "Consumer fintech apps",
              description: "Apps that embed credit insights for end users.",
              recommended: false
            },
            {
              id: "opt_3",
              title: "SMBs and merchants",
              description: "Businesses that underwrite customers, partners, or suppliers.",
              recommended: false
            },
            {
              id: "opt_4",
              title: "Direct to consumers",
              description: "Individuals who want their own score and financial insights.",
              recommended: false
            }
          ]
        }
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
