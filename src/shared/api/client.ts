const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://k8s.mectest.ru/test-app";
const API_TOKEN =
  process.env.EXPO_PUBLIC_API_TOKEN ?? "550e8400-e29b-41d4-a716-446655440000";

type PrimitiveQuery = string | number | boolean;

type RequestOptions = RequestInit & {
  query?: Record<string, PrimitiveQuery | null | undefined>;
};

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const normalizedBaseUrl = API_BASE_URL.endsWith("/")
    ? API_BASE_URL
    : `${API_BASE_URL}/`;
  const normalizedPath = path.replace(/^\/+/, "");
  // const url = new URL(API_BASE_URL);
  const url = new URL(normalizedPath, normalizedBaseUrl);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { query, headers, ...restOptions } = options;

  const response = await fetch(buildUrl(path, query), {
    ...restOptions,
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json",
      ...headers,
    },
  });

  if (!response.ok) {
    throw new Error("Не удалось загрузить публикации");
  }

  return (await response.json()) as T;
}
