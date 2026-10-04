const DEFAULT_GRAPHQL_API_URL = 'http://localhost:4000/';

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: Array<string | number>;
    extensions?: Record<string, unknown>;
  }>;
}

export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const url = process.env.GRAPHQL_API_URL || DEFAULT_GRAPHQL_API_URL;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `GraphQL 요청 네트워크 실패: ${url} 에 연결할 수 없습니다. apps/api가 켜져 있는지 확인하세요. (${message})`
    );
  }

  if (!response.ok) {
    throw new Error(
      `GraphQL HTTP 오류 [${response.status} ${response.statusText}]: ${url} 요청 실패. apps/api가 켜져 있는지 확인하세요.`
    );
  }

  const result = (await response.json()) as GraphQLResponse<T>;

  if (result.errors && result.errors.length > 0) {
    const errorDetails = result.errors.map((e) => e.message).join('; ');
    throw new Error(
      `GraphQL 실행 오류: ${url} 응답에 오류가 포함되어 있습니다. apps/api가 켜져 있는지 확인하세요. [${errorDetails}]`
    );
  }

  if (result.data === undefined) {
    throw new Error(
      `GraphQL 응답 누락: ${url} 에서 data 필드를 수신하지 못했습니다. apps/api가 켜져 있는지 확인하세요.`
    );
  }

  return result.data;
}
