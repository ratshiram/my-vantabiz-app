
import { NextResponse, type NextRequest } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const proPriceId = process.env.STRIPE_PRO_PRICE_ID;

  if (!stripeSecretKey || String(stripeSecretKey).trim() === "") {
    console.error("CRITICAL_STRIPE_CONFIG: STRIPE_SECRET_KEY is not set or is empty in environment variables.");
    return NextResponse.json({ error: 'Stripe Secret Key is not configured. Please check server environment variables.' }, { status: 500 });
  }

  if (!proPriceId || String(proPriceId).trim() === "") {
    console.error("CRITICAL_STRIPE_CONFIG: STRIPE_PRO_PRICE_ID is not set or is empty in environment variables.");
    return NextResponse.json({ error: 'Stripe Pro Price ID is not configured. Please check server environment variables.' }, { status: 500 });
  }

  let userIdFromRequest: string | undefined;

  try {
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-06-20',
    });

    const body: { userId?: string } = await req.json();
    userIdFromRequest = body.userId;

    if (!userIdFromRequest) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }
    
    const origin = req.headers.get('origin') || 'http://localhost:9002';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: proPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/profile?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      client_reference_id: userIdFromRequest,
    });

    if (!session.id) {
        console.error(`Failed to create Stripe session ID for userId [${userIdFromRequest}], session.id is missing.`);
        return NextResponse.json({ error: 'Failed to create Stripe session ID.' }, { status: 500 });
    }

    return NextResponse.json({ sessionId: session.id });

  } catch (error) {
    const userIdForLog = userIdFromRequest || 'N/A (or error before userId was parsed)';
    console.error(`Stripe session creation error for userId [${userIdForLog}]:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: `Failed to create checkout session: ${errorMessage}` }, { status: 500 });
  }
}
