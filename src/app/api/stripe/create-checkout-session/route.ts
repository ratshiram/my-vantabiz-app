
import { NextResponse, type NextRequest } from 'next/server';
import Stripe from 'stripe';
// import { auth as firebaseAuth } from '@/lib/firebase'; // For potential server-side auth check if needed later

// Moved initialization inside POST after checks
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2024-04-10', // Use a fixed API version
// });

export async function POST(req: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const proPriceId = process.env.STRIPE_PRO_PRICE_ID;

    if (!stripeSecretKey) {
      console.error("STRIPE_SECRET_KEY is not set in environment variables.");
      return NextResponse.json({ error: 'Stripe Secret Key is not configured.' }, { status: 500 });
    }

    if (!proPriceId) {
      console.error("STRIPE_PRO_PRICE_ID is not set in environment variables.");
      return NextResponse.json({ error: 'Stripe Pro Price ID is not configured.' }, { status: 500 });
    }
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-04-10', // Use a fixed API version
    });

    const body: { userId?: string } = await req.json();
    const userId = body.userId; // User ID passed from the client

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }
    
    const origin = req.headers.get('origin') || 'http://localhost:9002'; // Fallback for local dev

    // Create a Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: proPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription', // Assuming "Pro" is a recurring subscription
      success_url: `${origin}/profile?session_id={CHECKOUT_SESSION_ID}`, // Redirect here after successful payment
      cancel_url: `${origin}/pricing`, // Redirect here if the user cancels
      client_reference_id: userId, // Associate this session with your internal user ID
      // To prefill email, you might fetch user's email from Firebase Admin SDK using userId
      // customer_email: userEmail, (requires fetching user data server-side)
    });

    if (!session.id) {
        throw new Error('Failed to create Stripe session.');
    }

    return NextResponse.json({ sessionId: session.id });

  } catch (error) {
    console.error("Stripe session creation error:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: `Failed to create checkout session: ${errorMessage}` }, { status: 500 });
  }
}

