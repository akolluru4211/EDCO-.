import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
  CustomProvider,
  getToken,
  getLimitedUseToken,
  AppCheck,
} from "firebase/app-check";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyMockKeyForDevelopmentOnly12345",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "edworld-co-prod.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "edworld-co-prod",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "edworld-co-prod.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789012:web:abcdef123456789",
};

// Initialize Firebase safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// Initialize App Check (Web Client)
let appCheck: AppCheck | null = null;
if (typeof window !== "undefined") {
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const isDebug = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN;

  if (isDebug && typeof window !== "undefined") {
    // @ts-ignore
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN || true;
  }

  try {
    if (recaptchaSiteKey) {
      appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(recaptchaSiteKey),
        isTokenAutoRefreshEnabled: true,
      });
    } else if (isDebug) {
      appCheck = initializeAppCheck(app, {
        provider: new CustomProvider({
          getToken: async () => {
            return {
              token: "mock-debug-app-check-token",
              expireTimeMillis: Date.now() + 60 * 60 * 1000,
            };
          },
        }),
        isTokenAutoRefreshEnabled: true,
      });
    }
  } catch (err) {
    console.warn("[App Check Initialization Note]:", err);
  }
}

/**
 * Retrieve a standard App Check token for API requests
 */
export async function getAppCheckHeader(): Promise<Record<string, string>> {
  if (!appCheck) return {};
  try {
    const tokenResponse = await getToken(appCheck, /* forceRefresh= */ false);
    return { "X-Firebase-AppCheck": tokenResponse.token };
  } catch (err) {
    console.warn("[App Check Error]: Failed to retrieve token", err);
    return {};
  }
}

/**
 * Retrieve a limited-use App Check token for high-security endpoints (payments, heavy compute)
 */
export async function getLimitedUseAppCheckHeader(): Promise<Record<string, string>> {
  if (!appCheck) return {};
  try {
    const tokenResponse = await getLimitedUseToken(appCheck);
    return { "X-Firebase-AppCheck": tokenResponse.token };
  } catch (err) {
    console.warn("[App Check Error]: Failed to retrieve limited-use token", err);
    return {};
  }
}

// Connect to emulators if specified
if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
  try {
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "localhost", 8080);
    connectStorageEmulator(storage, "localhost", 9199);
    connectFunctionsEmulator(functions, "localhost", 5001);
    console.log("Connected to Firebase Emulator Suite");
  } catch (e) {
    // Emulator already connected
  }
}

export { app, auth, db, storage, functions, appCheck };

