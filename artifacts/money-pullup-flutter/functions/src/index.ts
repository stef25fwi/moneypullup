import { setGlobalOptions } from "firebase-functions/v2";
import * as admin from "firebase-admin";

admin.initializeApp();
setGlobalOptions({ region: "europe-west1" });

export { createDjConnectAccount, createDjOnboardingLink, getDjAccountStatus } from "./connect";
export { createTipPaymentIntent, confirmTip, acceptTip, refuseTip } from "./tips";
export { stripeWebhook } from "./webhook";
