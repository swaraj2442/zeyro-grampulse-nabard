import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, questionId, selectedOptionIds, customAnswer } = body;

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (questionId === 'q1') {
      return NextResponse.json({
        status: 'in_progress',
        nextQuestion: {
          id: 'q2',
          type: 'multiple_choice',
          step: 2,
          totalSteps: 3,
          question: `What is your primary revenue model?`,
          options: [
            {
              id: 'opt_1',
              title: 'SaaS Subscriptions',
              description: 'Recurring monthly or annual software fees.',
              recommended: true
            },
            {
              id: 'opt_2',
              title: 'Usage-based Pricing',
              description: 'Pay per API call, transaction, or compute used.',
              recommended: false
            },
            {
              id: 'opt_3',
              title: 'One-time licenses',
              description: 'Perpetual licenses or implementation fees.',
              recommended: false
            },
            {
              id: 'opt_4',
              title: 'Ad-supported / Free',
              description: 'Free for users, monetized via ads or data.',
              recommended: false
            }
          ]
        }
      });
    }

    if (questionId === 'q2') {
      return NextResponse.json({
        status: 'in_progress',
        nextQuestion: {
          id: 'q3',
          type: 'text',
          step: 3,
          totalSteps: 3,
          question: `Is there anything else you want to share about your vision or any specific questions you have for me?`,
          options: [] // No options for text input
        }
      });
    }

    // After q3 (or any fallback), we finish onboarding
    return NextResponse.json({
      status: "completed",
      nextQuestion: null,
      dashboardRedirectUrl: "/bfs-dashboard"
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
