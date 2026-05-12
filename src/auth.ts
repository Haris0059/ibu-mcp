import "dotenv/config";

export interface StudentIdentity {
  id: number;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
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

  const identity: StudentIdentity = {
    id: payload.id as number,
    student_id: payload.student_id as string,
    first_name: payload.first_name as string,
    last_name: payload.last_name as string,
    email: payload.email as string,
  };

  return { accessToken, userJwt, identity };
}
