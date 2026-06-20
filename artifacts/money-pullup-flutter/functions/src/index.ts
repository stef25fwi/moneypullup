import { setGlobalOptions } from "firebase-functions/v2";
import * as admin from "firebase-admin";

admin.initializeApp();
setGlobalOptions({ region: "europe-west1" });

export { createDjConnectAccount, createDjOnboardingLink, getDjAccountStatus } from "./connect";
export { createTipPaymentIntent, acceptTip, refuseTip } from "./tips";
export { stripeWebhook } from "./webhook";
