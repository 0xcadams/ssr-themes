import {createFileRoute} from '@tanstack/react-router';

function buildTargetUrl(
  request: Request,
  splat: string,
) {
  const target = new URL(
    `/_vercel/insights/${splat}`,
    request.url,
  );
  const requestUrl = new URL(request.url);

  target.search = requestUrl.search;

  return target;
}

export const Route = createFileRoute(
  '/api/insights/$',
)({
  server: {
    handlers: {
      ANY: async ({
        request,
        params,
      }: {
        request: Request;
        params: {
          _splat: string;
        };
      }) => {
        const headers = new Headers(request.headers);

        headers.delete('connection');
        headers.delete('content-length');
        headers.delete('host');

        const body =
          request.method === 'GET' ||
          request.method === 'HEAD'
            ? undefined
            : await request.arrayBuffer();

        const response = await fetch(
          buildTargetUrl(request, params._splat),
          {
            method: request.method,
            headers,
            body:
              body && body.byteLength > 0
                ? body
                : undefined,
          },
        );

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      },
    },
  },
});
