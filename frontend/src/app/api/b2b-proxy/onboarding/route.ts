import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = request.cookies.get('zeyro_b2b_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // Map the onboarding fields to the profile fields
    const profileUpdate = {
      full_name: body.user_name || body.userName || '',
      role: body.role || '',
      company_name: body.company_name || body.companyName || ''
    };

    const res = await fetch(`${authApiUrl}/api/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileUpdate)
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Backend update failed:', res.status, errorText);
      return NextResponse.json({ error: 'Backend update failed', details: errorText }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Onboarding proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
