import type { Callback } from "./context.ts";

/**
 * JSON middleware. Runs `Request.json()` under the hood. The final response
 * body result runs through `JSON.stringify()`.
 *
 * ```ts
 * application.post("/posts/:post_id/comments", json);
 *
 * application.post("/posts/:post_id/comments", (context) => {
 *   const content = context.request.body.content;
 *   if (content.length > 2_000) {
 *     request.body = { message: "content is too long" };
 *     response.status = 400;
 *   }
 * });
 * ```
 */
export const json: Callback = async (context) => {
  context.request.body = await context.rawRequest.json();
  context.response.headers.set("Content-Type", "application/json");
  await context.next();
  context.response.body = JSON.stringify(context.response.body);
};

/**
 * `application/x-www-form-urlencoded` middleware. `context.request.body`
 * becomes `URLSearchParams`.
 *
 * ```ts
 * application.get("/posts", urlSearchParams);
 *
 * application.get("/posts", (context) => {
 *   const filter = context.request.body.get("filter");
 * });
 * ```
 */
export const urlSearchParams: Callback = async (context) => {
  context.request.body = new URLSearchParams(await context.rawRequest.text());
  await context.next();
};

/**
 * `multipart/form-data` middleware. `context.request.body` becomes `FormData`.
 *
 * ```ts
 * application.post("/images", formData);
 * ```
 */
export const formData: Callback = async (context) => {
  context.request.body = await context.rawRequest.formData();
  await context.next();
};
