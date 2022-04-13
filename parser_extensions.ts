import type { Callback } from "./context.ts";

/**
 * JSON middleware.
 *
 * ```ts
 * application.post("/comments", json);
 *
 * application.post("/comments", (context) => {
 *   if (context.tags.length > 5) {
 *     response.body = { message: "too many tags" };
 *     response.status = 400;
 *   } else {
 *     response.body = { message: "success" };
 *   }}
 * });
 * ```
 */
export const json: Callback = async (
  { rawRequest, request, response, next },
) => {
  request.body = await rawRequest.json();
  response.headers.set("Content-Type", "application/json; charset=utf-8");
  await next();
  response.body = JSON.stringify(response.body);
};

/**
 * `application/x-www-form-urlencoded` middleware. `request.body` becomes
 * `URLSearchParams`.
 */
export const urlSearchParams: Callback = async (
  { rawRequest, request, next },
) => {
  request.body = new URLSearchParams(await rawRequest.text());
  await next();
};

/** `multipart/form-data` middleware. `request.body` becomes `FormData`. */
export const formData: Callback = async ({ rawRequest, request, next }) => {
  request.body = await rawRequest.formData();
  await next();
};
