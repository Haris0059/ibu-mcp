import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// MCP clients may launch the server from any working directory. Resolve .env
// relative to this package so credentials do not depend on the client's cwd.
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(packageRoot, ".env"), quiet: true });

export interface StudentIdentity {
  id: number;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  status?: string;
  city?: unknown;
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Malformed JWT: expected 3 parts");
  const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(Buffer.from(payload, "base64").toString("utf-8"));
}

export function loadAuth(): { accessToken: string; userJwt: string; identity: StudentIdentity } {
  const accessToken = process.env.IBU_ACCESS_TOKEN;
  const userJwt = process.env.IBU_USER_JWT;

  if (!accessToken) throw new Error("Missing IBU_ACCESS_TOKEN in .env");
  if (!userJwt) throw new Error("Missing IBU_USER_JWT in .env");

  let payload: Record<string, unknown>;
  try {
    payload = decodeJwtPayload(userJwt);
  } catch {
    throw new Error("IBU_USER_JWT is not a valid JWT. Check your .env file.");
  }

  // Current IBU tokens nest student claims under `data`; older tokens exposed
  // the same claims at the payload root.
  const nestedData = payload.data;
  const claims = nestedData && typeof nestedData === "object" && !Array.isArray(nestedData)
    ? nestedData as Record<string, unknown>
    : payload;

  const id = typeof claims.id === "number" ? claims.id : Number(claims.id);
  const requiredStrings = ["student_id", "first_name", "last_name", "email"] as const;
  if (!Number.isFinite(id) || requiredStrings.some((key) => typeof claims[key] !== "string")) {
    throw new Error("IBU_USER_JWT does not contain the expected student identity claims. Re-copy it from DevTools.");
  }

  const identity: StudentIdentity = {
    id,
    student_id: claims.student_id as string,
    first_name: claims.first_name as string,
    last_name: claims.last_name as string,
    email: claims.email as string,
    ...(typeof claims.status === "string" ? { status: claims.status } : {}),
    ...(claims.city !== undefined ? { city: claims.city } : {}),
  };

  return { accessToken, userJwt, identity };
}
