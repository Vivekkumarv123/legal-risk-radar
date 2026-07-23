import { NextResponse } from 'next/server';
import { verifyToken } from '@/middleware/auth.middleware';
import { checkUsageLimit, trackUsage } from '@/middleware/usage.middleware';

export async function POST(request) {
  try {
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authResult.user.uid;

    const usageCheck = await checkUsageLimit(userId, 'glossary_lookup');
    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          upgradeRequired: true,
          upgradeMessage: usageCheck.upgradeMessage,
          limitType: usageCheck.limitType,
        },
        { status: 403 }
      );
    }

    await trackUsage(userId, 'glossary_lookup');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Glossary usage tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track usage' },
      { status: 500 }
    );
  }
}
