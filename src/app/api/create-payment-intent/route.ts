import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function POST(req: Request) {
  const { amount, currency } = await req.json();
  const paymentIntent = await stripe.paymentIntents.create({
    amount, // in cents
    currency,
  });
  return NextResponse.json({ clientSecret: paymentIntent.client_secret });
}
