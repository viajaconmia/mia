export interface MiaAiEnvelope<T> {
  ok: boolean;
  data?: T;
  error?: {
    code?: string;
    message?: string;
    retryable?: boolean;
    details?: unknown;
  };
}

export class MiaAiApiError extends Error {
  public readonly status: number;
  public readonly statusCode: number;
  public readonly code: string;
  public readonly retryable: boolean;
  public readonly details?: unknown;

  constructor(params: {
    message: string;
    status?: number;
    statusCode?: number;
    code?: string;
    retryable?: boolean;
    details?: unknown;
  }) {
    super(params.message);
    this.name = "MiaAiApiError";
    const resolvedStatus = params.status ?? params.statusCode ?? 500;
    this.status = resolvedStatus;
    this.statusCode = resolvedStatus;
    this.code = params.code || "MIA_AI_ERROR";
    this.retryable = params.retryable ?? true;
    this.details = params.details;
    Object.setPrototypeOf(this, MiaAiApiError.prototype);
  }
}

export class MiaAiApiClient {
  protected readonly baseUrl: string;
  protected readonly pathPrefix: string;

  constructor(
    pathPrefix = "",
    baseUrl = import.meta.env.VITE_MIA_AI_URL || "http://localhost:4005/api/v1"
  ) {
    this.pathPrefix = pathPrefix;
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  protected formatPath(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    return `${this.pathPrefix}${cleanEndpoint}`;
  }

  private buildQueryString(params: Record<string, unknown> = {}): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const qs = searchParams.toString();
    return qs ? `?${qs}` : "";
  }

  protected async parseEnvelope<T>(response: Response): Promise<T> {
    let payload: MiaAiEnvelope<T> | null = null;

    try {
      payload = (await response.json()) as MiaAiEnvelope<T>;
    } catch {
      throw new MiaAiApiError({
        message:
          "No se pudo conectar con el servidor de MIA AI. Verifica que el microservicio esté activo.",
        code: "NETWORK_PARSE_ERROR",
        retryable: true,
        status: response.status || 503,
      });
    }

    if (!response.ok || !payload?.ok) {
      const errObj = payload?.error || {};
      throw new MiaAiApiError({
        message:
          errObj.message ||
          "Ocurrió un problema al procesar la solicitud en MIA AI.",
        code: errObj.code || "API_ERROR",
        retryable:
          typeof errObj.retryable === "boolean" ? errObj.retryable : true,
        status: response.status,
        details: errObj.details,
      });
    }

    return payload.data as T;
  }

  protected async request<T>(
    method: string,
    endpoint: string,
    body?: unknown,
    customHeaders: Record<string, string> = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${this.formatPath(endpoint)}`;
    const isFormData =
      typeof FormData !== "undefined" && body instanceof FormData;

    const headers: Record<string, string> = isFormData
      ? { ...customHeaders }
      : {
          "Content-Type": "application/json",
          ...customHeaders,
        };

    const config: RequestInit = {
      method,
      headers,
    };

    if (body !== undefined && !["GET", "HEAD"].includes(method.toUpperCase())) {
      config.body = isFormData ? (body as FormData) : JSON.stringify(body);
    }

    let response: Response;
    try {
      response = await fetch(url, config);
    } catch (err) {
      throw new MiaAiApiError({
        message:
          "No fue posible comunicarse con el servicio multi-agente de MIA AI. Verifica tu conexión e intenta nuevamente.",
        code: "NETWORK_ERROR",
        retryable: true,
        status: 503,
        details: (err as Error)?.message,
      });
    }

    return this.parseEnvelope<T>(response);
  }

  protected async get<T>({
    path,
    params = {},
    headers = {},
  }: {
    path: string;
    params?: Record<string, unknown>;
    headers?: Record<string, string>;
  }): Promise<T> {
    const fullPath = `${path}${this.buildQueryString(params)}`;
    return this.request<T>("GET", fullPath, undefined, headers);
  }

  protected async post<T>({
    path,
    body,
    headers = {},
  }: {
    path: string;
    body?: unknown;
    headers?: Record<string, string>;
  }): Promise<T> {
    return this.request<T>("POST", path, body, headers);
  }

  protected async postFormData<T>({
    path,
    formData,
    headers = {},
  }: {
    path: string;
    formData: FormData;
    headers?: Record<string, string>;
  }): Promise<T> {
    return this.request<T>("POST", path, formData, headers);
  }
}
