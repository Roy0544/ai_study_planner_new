import { headers } from "next/headers";

const ipCache = new Map();
const LIMIT = 5;
const WINDOW_MS = 60 * 1000;

export async function checkRateLimit() {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const now = Date.now();

  let clientRecord = ipCache.get(ip);

  if (!clientRecord) {
    clientRecord = { count: 1, resetTime: now + WINDOW_MS };
    ipCache.set(ip, clientRecord);
  } else {
    if (now > clientRecord.resetTime) {
      clientRecord.count = 1;
      clientRecord.resetTime = now + WINDOW_MS;
    } else {
      clientRecord.count += 1;
    }
  }

  // Periodic garbage collection
  if (ipCache.size > 1000) {
    for (const [key, value] of ipCache.entries()) {
      if (now > value.resetTime) {
        ipCache.delete(key);
      }
    }
  }

  if (clientRecord.count > LIMIT) {
    const retryAfter = Math.ceil((clientRecord.resetTime - now) / 1000);
    return { limited: true, retryAfter };
  }

  return { limited: false };
}
