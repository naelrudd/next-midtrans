import type { MidtransEnvironment } from "./types";
import type { MidtransErrorBody } from "./types";

export class MidtransClientError extends Error {
  status: string;
  body: MidtransErrorBody;

  constructor(message: string, status: string, body: MidtransErrorBody) {
    super(message);
    this.name = "MidtransClientError";
    this.status = status;
    this.body = body;
  }
}

type BaseUrls = { snap: string; core: string };

const BASE_URL: Record<MidtransEnvironment, BaseUrls> = {
  sandbox: {
    snap: "https://app.sandbox.midtrans.com/snap/v1",
    core: "https://api.sandbox.midtrans.com/v2",
  },
  production: {
    snap: "https://app.midtrans.com/snap/v1",
    core: "https://api.midtrans.com/v2",
  },
};

export interface HttpClientConfig {
  serverKey: string;
  isProduction?: boolean;
  timeoutMs?: number;
}

export interface HttpResponse<T> {
  status: string;
  body: T;
}

export function createHttpClient(config: HttpClientConfig) {
  const environment: MidtransEnvironment =
    config.isProduction === true ? "production" : "sandbox";
  const baseUrls = BASE_URL[environment];
  const auth = "Basic " + Buffer.from(config.serverKey + ":").toString("base64");

  async function request<T>(
    path: string,
    method: "GET" | "POST" | "PUT",
    body?: unknown,
    baseUrlType?: "snap" | "core"
  ): Promise<T> {
    const isSnap = baseUrlType === "snap";
    const url = (isSnap ? baseUrls.snap : baseUrls.core) + path;
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: auth,
        Accept: "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(config.timeoutMs ?? 30_000),
    });

    const responseBody = await response.json();

    if (!response.ok) {
      throw new MidtransClientError(
        (responseBody as { status_message?: string }).status_message ?? response.statusText,
        String(response.status),
        responseBody as MidtransErrorBody
      );
    }

    return responseBody as T;
  }

  return {
    request,
    environment,
    serverKey: config.serverKey,
  };
}