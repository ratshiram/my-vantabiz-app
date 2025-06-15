
import { NextResponse, type NextRequest } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const proPriceId = process.env.STRIPE_PRO_PRICE_ID;

    if (!stripeSecretKey) {
      console.error("CRITICAL: STRIPE_SECRET_KEY is not set in environment variables.");
      return NextResponse.json({ error: 'Stripe Secret Key is not configured. Please check server environment variables.' }, { status: 500 });
    }

    if (!proPriceId) {
      console.error("CRITICAL: STRIPE_PRO_PRICE_ID is not set in environment variables.");
      return NextResponse.json({ error: 'Stripe Pro Price ID is not configured. Please check server environment variables.' }, { status: 500 });
    }
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-04-10', 
    });

    const body: { userId?: string } = await req.json();
    const userId = body.userId; 

    if (!userId) {
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
      client_reference_id: userId, 
    });

    if (!session.id) {
        console.error('Failed to create Stripe session, session.id is missing.');
        return NextResponse.json({ error: 'Failed to create Stripe session ID.' }, { status: 500 });
    }

    return NextResponse.json({ sessionId: session.id });

  } catch (error) {
    console.error("Stripe session creation error:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: `Failed to create checkout session: ${errorMessage}` }, { status: 500 });
  }
}

