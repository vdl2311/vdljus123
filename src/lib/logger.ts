import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "./firebase";

export type LogLevel = "info" | "warning" | "error";
export type LogCategory = "auth" | "action" | "error" | "system";

export interface LogEntry {
  level: LogLevel;
  category: LogCategory;
  message: string;
  details?: any;
  userId?: string | null;
  userEmail?: string | null;
  timestamp: string;
}

function serializeForFirestore(obj: any, depth = 0): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  if (typeof obj === "number" || typeof obj === "boolean" || typeof obj === "string") {
    return obj;
  }
  if (typeof obj === "function" || typeof obj === "symbol") {
    return String(obj);
  }
  if (depth > 5) {
    return "[Max Depth Reached]";
  }

  // Handle Error instances (including _FirebaseError or custom error classes)
  if (obj instanceof Error || (typeof obj === "object" && (obj.name || obj.message || obj.code))) {
    const errorDetails: Record<string, any> = {};
    if (obj.name) errorDetails.name = String(obj.name);
    if (obj.message) errorDetails.message = String(obj.message);
    if (obj.code) errorDetails.code = String(obj.code);
    if (obj.stack) errorDetails.stack = String(obj.stack);

    try {
      for (const key of Object.keys(obj)) {
        if (!(key in errorDetails)) {
          errorDetails[key] = serializeForFirestore(obj[key], depth + 1);
        }
      }
    } catch {
      // ignore key iteration error
    }

    return errorDetails;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => serializeForFirestore(item, depth + 1));
  }

  if (typeof obj === "object") {
    const plainObj: Record<string, any> = {};
    try {
      for (const key of Object.keys(obj)) {
        plainObj[key] = serializeForFirestore(obj[key], depth + 1);
      }
    } catch {
      return String(obj);
    }
    return plainObj;
  }

  return String(obj);
}

export const logger = {
  log: async (level: LogLevel, category: LogCategory, message: string, details?: any) => {
    try {
      const user = auth.currentUser;
      const sanitizedDetails = details !== undefined ? serializeForFirestore(details) : null;
      const logEntry: LogEntry = {
        level,
        category,
        message,
        details: sanitizedDetails,
        userId: user?.uid || null,
        userEmail: user?.email || null,
        timestamp: new Date().toISOString(),
      };
      
      // We don't await this to avoid blocking the main thread
      addDoc(collection(db, "logs"), logEntry).catch((err) => {
        if (process.env.NODE_ENV !== "production") {
          console.error("Failed to write log to Firestore:", err);
        }
      });
      
      // Also log to console in development
      if (process.env.NODE_ENV !== "production") {
        if (level === "error") {
          console.error(`[${category.toUpperCase()}] ${message}`, details);
        } else if (level === "warning") {
          console.warn(`[${category.toUpperCase()}] ${message}`, details);
        } else {
          console.log(`[${category.toUpperCase()}] ${message}`, details);
        }
      }
    } catch (e) {
      console.error("Failed to write log", e);
    }
  },

  info: (category: LogCategory, message: string, details?: any) => {
    return logger.log("info", category, message, details);
  },

  warn: (category: LogCategory, message: string, details?: any) => {
    return logger.log("warning", category, message, details);
  },

  error: (category: LogCategory, message: string, error?: any) => {
    return logger.log("error", category, message, error);
  },
  
  action: (message: string, details?: any) => {
    return logger.log("info", "action", message, details);
  }
};
