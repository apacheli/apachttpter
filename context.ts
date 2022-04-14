/** Route callback. */
export type Callback = (context: Context) => void | Promise<void>;

/** A route e.g. `/posts/:post_id`. */
export interface Route {
  /** Route callbacks. */
  callbacks: Callback[];
  /** The pattern used for matching the `.pathname`. */
  pattern: URLPattern;
}

/** Context passing for HTTP server handling. */
export class Context {
  /** Empty object for modifying. Use in conjuction with `.rawRequest`. */
  request: Record<string, unknown> = {};
  /** Context response. */
  response: ContextResponse = { headers: new Headers() };

  #index = 0;

  /**
   * @param rawRequest Raw request from `Deno.RequestEvent`.
   * @param result A `URLPatternResult` object.
   * @param route The route or something.
   */
  constructor(
    public rawRequest: Request,
    public result: URLPatternResult,
    public route: Route,
  ) {
  }

  // Make this an arrow function so you can use destructing syntax.
  /** Next the next callback for the route. */
  next = () => this.route.callbacks[this.#index++]?.(this);
}

/** Context response very good documentation yes. */
export interface ContextResponse {
  /** Response body. Make sure that the final type is `BodyInit`. */
  body?: unknown;
  /** Response headers. */
  headers: Headers;
  /** Response status. */
  status?: number;
}
