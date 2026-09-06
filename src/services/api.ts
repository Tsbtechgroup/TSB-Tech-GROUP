/* =========================================================
   TSB API CLIENT SAFE V1.0
   Client partagé par le site React et l'application Capacitor.
   ========================================================= */

const DEFAULT_API_BASE_URL =
  "https://api.tsbtechgroup.com";

const REQUEST_TIMEOUT_MS = 10_000;

type JsonRecord = Record<string, unknown>;

export type PublicStats = Readonly<{
  clients: number;
  completed_services: number;
  orders: number;
  quote_requests: number;
  published_products: number;
  launch_at: string | null;
}>;

const isRecord = (
  value: unknown
): value is JsonRecord =>
  Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value)
  );

const normalizeApiBaseUrl = (
  value: string
) => {
  const normalized = value
    .trim()
    .replace(/\/+$/, "");

  const parsedUrl = new URL(
    normalized
  );

  if (
    parsedUrl.protocol !== "https:" &&
    parsedUrl.protocol !== "http:"
  ) {
    throw new Error(
      "VITE_API_BASE_URL doit utiliser HTTP ou HTTPS."
    );
  }

  return normalized;
};

const configuredApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL as
    | string
    | undefined;

export const API_BASE_URL =
  normalizeApiBaseUrl(
    configuredApiBaseUrl ||
      DEFAULT_API_BASE_URL
  );

export class ApiRequestError extends Error {
  readonly status: number;

  constructor(
    message: string,
    status = 0
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

const getApiErrorMessage = (
  payload: unknown,
  fallback: string
) => {
  if (
    isRecord(payload) &&
    typeof payload.error === "string" &&
    payload.error.trim()
  ) {
    return payload.error;
  }

  return fallback;
};

const requestApiData = async (
  path: string
): Promise<unknown> => {
  const normalizedPath =
    path.startsWith("/")
      ? path
      : `/${path}`;

  const controller =
    new AbortController();

  const timeoutId =
    globalThis.setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS
    );

  try {
    const response = await fetch(
      `${API_BASE_URL}${normalizedPath}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      }
    );

    const payload: unknown =
      await response
        .json()
        .catch(() => null);

    if (
      !response.ok ||
      !isRecord(payload) ||
      payload.ok !== true
    ) {
      throw new ApiRequestError(
        getApiErrorMessage(
          payload,
          `Erreur API HTTP ${response.status}`
        ),
        response.status
      );
    }

    return payload.data;
  } catch (error) {
    if (
      error instanceof DOMException &&
      error.name === "AbortError"
    ) {
      throw new ApiRequestError(
        "Le serveur TSB ne répond pas dans le délai prévu."
      );
    }

    throw error;
  } finally {
    globalThis.clearTimeout(
      timeoutId
    );
  }
};

const readNonNegativeInteger = (
  value: unknown,
  field: string
) => {
  const parsed = Number(value);

  if (
    !Number.isSafeInteger(parsed) ||
    parsed < 0
  ) {
    throw new ApiRequestError(
      `Réponse API invalide : ${field}`
    );
  }

  return parsed;
};

const parsePublicStats = (
  value: unknown
): PublicStats => {
  if (!isRecord(value)) {
    throw new ApiRequestError(
      "Réponse API invalide : statistiques absentes."
    );
  }

  const launchAt =
    value.launch_at;

  if (
    launchAt !== null &&
    typeof launchAt !== "string"
  ) {
    throw new ApiRequestError(
      "Réponse API invalide : launch_at"
    );
  }

  return Object.freeze({
    clients:
      readNonNegativeInteger(
        value.clients,
        "clients"
      ),
    completed_services:
      readNonNegativeInteger(
        value.completed_services,
        "completed_services"
      ),
    orders:
      readNonNegativeInteger(
        value.orders,
        "orders"
      ),
    quote_requests:
      readNonNegativeInteger(
        value.quote_requests,
        "quote_requests"
      ),
    published_products:
      readNonNegativeInteger(
        value.published_products,
        "published_products"
      ),
    launch_at: launchAt,
  });
};

export const getPublicStats =
  async (): Promise<PublicStats> =>
    parsePublicStats(
      await requestApiData(
        "/v1/public/stats"
      )
    );
