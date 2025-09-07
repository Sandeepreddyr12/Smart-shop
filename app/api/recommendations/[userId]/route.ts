import { NextRequest, NextResponse } from 'next/server';
import { getUserRecommendations } from '@/lib/actions/recommendation.actions';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    if (!userId) {
      return NextResponse.json(
        { message: 'userId is required' },
        { status: 400 }
      );
    }

    const result = await getUserRecommendations(userId);
    if (!result.success) {
      return NextResponse.json(
        { message: result.message ?? 'Failed to fetch recommendations' },
        { status: 502 }
      );
    }

    return NextResponse.json({ recommendations: result.data ?? [] });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // console.log(error)
    return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
  }
}
