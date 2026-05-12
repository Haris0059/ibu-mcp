import { loadAuth } from "./auth.js";

const BASE_URL = "https://rest.ibu.edu.ba/rest/";

const ERROR_MESSAGES: Record<number, string> = {
  401: "Session expired. Update IBU_USER_JWT in your .env file.",
  402: "Account blocked: unpaid fees. Contact accounting@ibu.edu.ba",
  403: "Account locked. Contact student-affairs-office@ibu.edu.ba",
  301: "Mandatory survey pending. Complete it at mine.ibu.edu.ba/#survey",
};

export async function ibufetch(path: string, init: RequestInit = {}): Promise<unknown> {
  const { accessToken, userJwt } = loadAuth();

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "sis-access-token": accessToken,
      "sis-user-token": userJwt,
      Origin: "https://mine.ibu.edu.ba",
      Referer: "https://mine.ibu.edu.ba/",
      ...(init.headers ?? {}),
    },
  });

  const message = ERROR_MESSAGES[response.status];
  if (message) throw new Error(message);

  if (response.status === 500) {
    throw new Error(`The IBU API is returning a 500 Internal Server Error for this request — this appears to be a server-side issue on IBU's end, not a problem with the tool.\n\nYou can try again in a few minutes, or check directly on the IBU student portal.`);
  }

  if (!response.ok) {
    throw new Error(`IBU API error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}
