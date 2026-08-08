import Stripe from "stripe";
import config from "../config/index.js";

// Initialize Stripe conditionally to prevent startup crashes when API keys are not yet configured in .env
export const stripe = config.stripe_secret_key
  ? new Stripe(config.stripe_secret_key, {
      apiVersion: "2023-10-16" as any,
    })
  : null;
