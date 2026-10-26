const UNREACHABLE = "Impossible de joindre le serveur";

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string[]>;

  constructor(
    status: number,
    message: string,
    fieldErrors: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

// apiFetch ne lève que des ApiError : on l'indique à TanStack Query pour que
// `error` soit typé ApiError (au lieu de Error) dans useQuery/useMutation
declare module "@tanstack/react-query" {
  interface Register {
    defaultError: ApiError;
  }
}

type Options = {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
};

// Filtres non renseignés (undefined) ou vidés ("") : pas envoyés à l'API
function toQueryString(query: Options["query"] = {}): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

// Pas de credentials: "include" : le proxy Vite sert l'API sur la même
// origine que le front, le cookie d'authentification part donc tout seul
export async function apiFetch<T>(
  path: string,
  { method = "GET", body, query }: Options = {},
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api/v1${path}${toQueryString(query)}`, {
      method,
      headers:
        body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, UNREACHABLE);
  }

  if (res.status === 204) return undefined as T;

  // Corps non JSON : le proxy Vite répond lui-même quand l'API est arrêtée
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(
      res.status,
      data?.message ?? UNREACHABLE,
      data?.errors?.fieldErrors,
    );
  }
  return data as T;
}
