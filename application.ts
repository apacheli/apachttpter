import { type Callback, Context, type Route } from "./context.ts";

/** Simple HTTP web server application. */
export class Application {
  /** Routes being processed by the application. */
  routes = new Map<string, Route>();

  route(pathname: string, ...callbacks: Callback[]) {
    if (this.routes.get(pathname)?.callbacks.push(...callbacks) === undefined) {
      this.routes.set(pathname, {
        callbacks,
        pattern: new URLPattern({ pathname }),
      });
    }
  }

  #method(method: string, pathname: string, ...callbacks: Callback[]) {
    callbacks = callbacks.map((callback) => {
      return (context) => {
        if (context.rawRequest.method === method) {
          return callback(context);
        } else {
          return context.next();
        }
      };
    });
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
    this.#method("GET", pathname, ...callbacks);
  }

  /**
   * Handle `POST` methods for the route.
   *
   * @param pathname The pathname of the route.
   * @param callbacks The functions to run.
   */
  post(pathname: string, ...callbacks: Callback[]) {
    this.#method("POST", pathname, ...callbacks);
  }

  /**
   * Handle `PUT` methods for the route.
   *
   * @param pathname The pathname of the route.
   * @param callbacks The functions to run.
   */
  put(pathname: string, ...callbacks: Callback[]) {
    this.#method("PUT", pathname, ...callbacks);
  }

  /**
   * Handle `DELETE` methods for the route.
   *
   * @param pathname The pathname of the route.
   * @param callbacks The functions to run.
   */
  delete(pathname: string, ...callbacks: Callback[]) {
    this.#method("DELETE", pathname, ...callbacks);
  }

  /**
   * Handle `PATCH` methods for the route.
   *
   * @param pathname The pathname of the route.
   * @param callbacks The functions to run.
   */
  patch(pathname: string, ...callbacks: Callback[]) {
    this.#method("PATCH", pathname, ...callbacks);
  }

  /** Handle a `Request`. */
  async handle(request: Request) {
    for (const route of this.routes.values()) {
      const result = route.pattern.exec(request.url);
      if (result) {
        const context = new Context(request, result, route);
        await context.next();
        return context;
      }
    }
  }

  /** Handle a `Deno.RequestEvent`. */
  async handleEvent(event: Deno.RequestEvent) {
    const context = await this.handle(event.request);
    let response;
    if (context) {
      response = new Response(context.response.body as BodyInit, {
        headers: context.response.headers,
        status: context.response.status,
      });
    } else {
      response = new Response();
    }
    await event.respondWith(response);
  }

  /**
   * Utility method for `Deno.serveHttp`.
   *
   * @param conn A connection received from `Deno.Listener`.
   */
  async serve(conn: Deno.Conn) {
    for await (const event of Deno.serveHttp(conn)) {
      this.handleEvent(event);
    }
  }

  /**
   * Utility method for `Deno.listen`.
   *
   * @param port The port to listen on.
   */
  async listen(port: number | Deno.Listener) {
    const listener = typeof port === "number" ? Deno.listen({ port }) : port;
    for await (const conn of listener) {
      this.serve(conn);
    }
  }
}
