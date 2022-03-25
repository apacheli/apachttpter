export interface ApplicationResponse extends ResponseInit {
  body?: BodyInit;
  headers: Headers;
}

export type Callback = (
  request: Request,
  response: ApplicationResponse,
  match: URLPatternResult,
  next: () => void,
) => void | Promise<void>;

/** A route. */
export interface Route {
  /** Functions to run for the route. */
  callbacks: Callback[];
  /** Route pattern. */
  pattern: URLPattern;
}

/** Simple HTTP web server application. */
export class Application {
  /** Server listener. */
  listener?: Deno.Listener;
  /** Routes being processed by the application. */
  routes = new Map<string, Route>();

  /**
   * Add a route handler.
   *
   * @param pathname The pathname of the route. E.g., `/threads/:thread_id`.
   * @param callback The functions to run.
   */
  route(pathname: string, ...callbacks: Callback[]) {
    if (this.routes.get(pathname)?.callbacks.push(...callbacks) === undefined) {
      this.routes.set(pathname, {
        callbacks,
        pattern: new URLPattern({ pathname }),
      });
    }
  }

  /**
   * Add a method layer over the `route` method.
   *
   * @param method The supported method.
   * @param pathname The pathname of the route.
   * @param callbacks The functions to run.
   */
  method(method: string, pathname: string, ...callbacks: Callback[]) {
    callbacks = callbacks.map((callback) =>
      (request, context, match, next) => {
        if (request.method === method) {
          callback(request, context, match, next);
        } else {
          next();
        }
      }
    );
    this.route(pathname, ...callbacks);
  }

  //#region methods
  /**
   * Handle `GET` methods for the route.
   *
   * @param pathname The pathname of the route.
   * @param callbacks The functions to run.
   */
  get(pathname: string, ...callbacks: Callback[]) {
    this.method("GET", pathname, ...callbacks);
  }

  /**
   * Handle `HEAD` methods for the route.
   *
   * @param pathname The pathname of the route.
   * @param callbacks The functions to run.
   */
  head(pathname: string, ...callbacks: Callback[]) {
    this.method("HEAD", pathname, ...callbacks);
  }

  /**
   * Handle `POST` methods for the route.
   *
   * @param pathname The pathname of the route.
   * @param callbacks The functions to run.
   */
  post(pathname: string, ...callbacks: Callback[]) {
    this.method("POST", pathname, ...callbacks);
  }

  /**
   * Handle `PUT` methods for the route.
   *
   * @param pathname The pathname of the route.
   * @param callbacks The functions to run.
   */
  put(pathname: string, ...callbacks: Callback[]) {
    this.method("PUT", pathname, ...callbacks);
  }

  /**
   * Handle `DELETE` methods for the route.
   *
   * @param pathname The pathname of the route.
   * @param callbacks The functions to run.
   */
  delete(pathname: string, ...callbacks: Callback[]) {
    this.method("DELETE", pathname, ...callbacks);
  }

  /**
   * Handle `CONNECT` methods for the route.
   *
   * @param pathname The pathname of the route.
   * @param callbacks The functions to run.
   */
  connect(pathname: string, ...callbacks: Callback[]) {
    this.method("CONNECT", pathname, ...callbacks);
  }

  /**
   * Handle `OPTIONS` methods for the route.
   *
   * @param pathname The pathname of the route.
   * @param callbacks The functions to run.
   */
  options(pathname: string, ...callbacks: Callback[]) {
    this.method("OPTIONS", pathname, ...callbacks);
  }

  /**
   * Handle `TRACE` methods for the route.
   *
   * @param pathname The pathname of the route.
   * @param callbacks The functions to run.
   */
  trace(pathname: string, ...callbacks: Callback[]) {
    this.method("TRACE", pathname, ...callbacks);
  }

  /**
   * Handle `PATCH` methods for the route.
   *
   * @param pathname The pathname of the route.
   * @param callbacks The functions to run.
   */
  patch(pathname: string, ...callbacks: Callback[]) {
    this.method("PATCH", pathname, ...callbacks);
  }
  //#endregion methods

  /** Handle a `Deno.RequestEvent`. */
  async handle({ request, respondWith }: Deno.RequestEvent) {
    const response: ApplicationResponse = {
      headers: new Headers(),
    };
    let end;
    const next = () => {
      end = false;
    };
    routes:
    for (const route of this.routes.values()) {
      const match = route.pattern.exec(request.url);
      if (match === null) {
        continue;
      }
      for (const callback of route.callbacks) {
        end = true;
        await callback(request, response, match, next);
        if (end) {
          break routes;
        }
      }
    }
    await respondWith(new Response(response.body, response));
  }

  /**
   * Utility method for `Deno.serveHttp`.
   *
   * @param conn A connection received from `Deno.Listener`.
   */
  async serve(conn: Deno.Conn) {
    const httpConn = Deno.serveHttp(conn);
    for await (const event of httpConn) {
      this.handle(event);
    }
  }

  /**
   * Utility method for `Deno.listen`.
   *
   * @param port The port to listen on.
   */
  async listen(port: number | Deno.Listener) {
    const listener = typeof port === "number" ? Deno.listen({ port }) : port;
    this.listener = listener;
    for await (const conn of listener) {
      this.serve(conn);
    }
  }

  /** Close the server. */
  close() {
    this.listener?.close();
    this.listener = undefined;
  }
}
