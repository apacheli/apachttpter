import type { ApplicationResponse, Callback } from "./application.ts";

const setResponse = (
  response: ApplicationResponse,
  status: number,
  statusText: string,
) => {
  response.body = `${status} ${statusText}`;
  response.status = status;
  response.statusText = statusText;
};

/**
 * Check the `Authorization` header. If the header is missing, respond with
 * `401 Unauthorized`. If the verification fails, respond with `403 Forbidden`.
 *
 * @param verify Verification function.
 */
export const authenticationCheck = (
  verify: (authorization: string) => boolean | Promise<boolean>,
): Callback =>
  async (request, response, _match, next) => {
    const authorization = request.headers.get("Authorization");
    if (!authorization) {
      setResponse(response, 401, "Unauthorized");
    } else if (!await verify(authorization)) {
      setResponse(response, 403, "Forbidden");
    } else {
      next();
    }
  };

/**
 * 404 Not Found
 *
 * ```ts
 * application.route("*", notFound);
 * ```
 */
export const notFound: Callback = (_request, response, _match, next) => {
  setResponse(response, 404, "Not Found");
  next();
};

/**
 * Disallow all methods except for the specified methods.
 *
 * ```ts
 * application.route("/books", methodNotAllowed(["GET"]));
 *
 * application.get("/books", () => {});
 * ```
 *
 * @param methods The methods to allow.
 */
export const methodNotAllowed = (methods: string[]): Callback =>
  (_request, response, _match, next) => {
    setResponse(response, 405, "Method Not Allowed");
    response.headers.set("Allow", methods.join(", "));
    next();
  };

/**
 * Disallow payloads if their `Content-Length` exceeds the `limit`.
 *
 * @param limit The maximum limit.
 * @param retryAfter Time to retry after.
 */
export const payloadTooLarge = (limit: number, retryAfter?: number): Callback =>
  (request, response, _match, next) => {
    const contentLength = request.headers.get("Content-Length");
    if (!contentLength) {
      setResponse(response, 411, "Length Required");
    } else if (parseInt(contentLength) > limit) {
      setResponse(response, 413, "Payload Too Large");
      if (retryAfter) {
        request.headers.set("Retry-After", `${retryAfter}`);
      }
    } else {
      next();
    }
  };

/**
 * Disallow certain `Content-Type`s. You do not have to account for parameters
 * after `;`.
 *
 * @param types The types to support.
 */
export const unsupportedMediaType = (types: string[]): Callback =>
  (request, response, _match, next) => {
    const contentType = request.headers.get("Content-Type");
    if (!contentType || !types.some((type) => type.startsWith(contentType))) {
      setResponse(response, 415, "Unsupported Media Type");
    } else {
      next();
    }
  };
