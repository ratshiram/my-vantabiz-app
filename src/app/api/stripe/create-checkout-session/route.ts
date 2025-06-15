
import { NextResponse, type NextRequest } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  // Enhanced logging for environment variables - this will appear in your server-side logs
  console.log(`API Route: create-checkout-session invoked. Checking Stripe ENV VARS.`);
  console.log(`STRIPE_SECRET_KEY is set: ${!!process.env.STRIPE_SECRET_KEY}`);
  console.log(`STRIPE_SECRET_KEY length (0 means empty or not set): ${process.env.STRIPE_SECRET_KEY?.length || 0}`);
  console.log(`STRIPE_PRO_PRICE_ID is set: ${!!process.env.STRIPE_PRO_PRICE_ID}`);
  console.log(`STRIPE_PRO_PRICE_ID length (0 means empty or not set): ${process.env.STRIPE_PRO_PRICE_ID?.length || 0}`);

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const proPriceId = process.env.STRIPE_PRO_PRICE_ID;
  let userIdFromRequest: string | undefined; // Moved for wider scope in case of early error

  // It's crucial that these checks happen before attempting to use Stripe
  if (!stripeSecretKey || String(stripeSecretKey).trim() === "") {
    console.error("CRITICAL_STRIPE_CONFIG: STRIPE_SECRET_KEY is not set or is empty in environment variables. Refer to server logs for details provided at the start of this route handler.");
    // This response should be sent to the client if this condition is met.
    // If an HTML error page is shown instead, the problem is more fundamental and likely related to environment variable provisioning.
    return NextResponse.json({ error: 'Stripe Secret Key is not configured. Please check server environment variables and review server logs for more details.' }, { status: 500 });
  }

  if (!proPriceId || String(proPriceId).trim() === "") {
    console.error("CRITICAL_STRIPE_CONFIG: STRIPE_PRO_PRICE_ID is not set or is empty in environment variables. Refer to server logs for details provided at the start of this route handler.");
    return NextResponse.json({ error: 'Stripe Pro Price ID is not configured. Please check server environment variables and review server logs for more details.' }, { status: 500 });
  }

  try {
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-06-20',
    });

    const body: { userId?: string } = await req.json();
    userIdFromRequest = body.userId;

    if (!userIdFromRequest) {
      console.warn("Stripe session request: User ID is missing from the request body.");
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || 'http://localhost:9002'; // Default for local dev if origin not present

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
        console.error(`Failed to create Stripe session ID for userId [${userIdFromRequest}], session.id is missing after successful API call. This is unexpected.`);
        return NextResponse.json({ error: 'Stripe session was created but ID is missing. Please contact support.' }, { status: 500 });
    }

    return NextResponse.json({ sessionId: session.id });

  } catch (error) {
    const userIdForLog = userIdFromRequest || 'N/A (or error before userId was parsed)';
    console.error(`Stripe session creation error for userId [${userIdForLog}]:`, error);

    let errorMessage = 'An unknown error occurred while creating the checkout session.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }

    // Check if it's a Stripe error object for more specific messages
    if (error && typeof error === 'object' && 'type' in error) {
        const stripeError = error as Stripe.StripeRawError; // Type assertion updated here
        console.error(`Stripe Error Type: ${stripeError.type}, Message: ${stripeError.message}`);
        if (stripeError.message) { // Use Stripe's error message if available
          errorMessage = `Stripe Error: ${stripeError.message}`;
        }
    }

    return NextResponse.json({ error: `Failed to create checkout session: ${errorMessage}. PLEASE CHECK SERVER LOGS for detailed error information, especially regarding environment variable configuration and the exact error encountered.` }, { status: 500 });
  }
}
