import type { Callback } from "./application.ts";

/**
 * Check the `Authorization` header. If the header is missing, respond with
 * `401 Unauthorized`. If the verification fails, respond with `403 Forbidden`.
 *
 * @param verify Verification function.
 */
export const authenticationCheck = (
  verify: (authorization: string) => boolean | Promise<boolean>,
): Callback =>
  async (request, response, next) => {
    const authorization = request.headers.get("Authorization");
    if (!authorization) {
      response.body = "401 Unauthorized";
      response.status = 401;
    } else if (!await verify(authorization)) {
      response.body = "403 Forbidden";
      response.status = 403;
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
export const notFound: Callback = (_request, response, next) => {
  response.body = "404 Not Found";
  response.status = 404;
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
  (_request, response, next) => {
    response.body = "405 Method Not Allowed";
    response.status = 405;
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
  (request, response, next) => {
    const contentLength = request.headers.get("Content-Length");
    if (!contentLength) {
      response.body = "411 Length Required";
      response.status = 411;
    } else if (parseInt(contentLength) > limit) {
      response.body = "413 Payload Too Large";
      response.status = 413;
      if (retryAfter !== undefined) {
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
  (request, response, next) => {
    const contentType = request.headers.get("Content-Type");
    if (!contentType || !types.some((type) => type === contentType)) {
      response.body = "415 Unsupported Media Type";
      response.status = 415;
    } else {
      next();
    }
  };
