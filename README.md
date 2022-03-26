# apachttpter

### About

A Simple HTTP server built for Deno using
[`URLPattern`](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern).

### Needs Work

- [ ] Support modifying the request body when chaining the context
- [ ] Support redirecting
- [ ] Support error handling when something goes wrong
- [ ] Built-in extension support for more `Content-Type`s
  - [ ] `application/json`
  - [ ] `application/x-www-form-urlencoded`
  - [ ] `multipart/form-data`
  - [ ] `text/plain`

### Example

Simple example:

```ts
import { Application } from "https://github.com/apacheli/apachttpter/raw/master/application.ts";

const application = new Application();

application.get("/", (_request, response) => {
  response.body = "Hello, World!";
});

application.listen(1337);
```

Pattern matching:

```ts
application.get("/threads/:thread_id", (_request, response, _next, match) => {
  const threadId = match.pathname.groups.thread_id;
  const thread = threads.get(threadId);
  if (thread) {
    response.body = `${thread.name}: ${thread.description}`;
  } else {
    response.body = "I could not find that thread.";
    response.status = 404;
  }
});
```

Using the `next` function:

```ts
application.route("*", (_request, response, next) => {
  response.headers.set("Content-Type", "application/json");
  next();
});

application.put("/random", (_request, response) => {
  response.body = JSON.stringify({ hello: "world" });
});
```

Built-in extensions:

```ts
import {
  authenticationCheck,
  methodNotAllowed,
  notFound,
  payloadTooLarge,
  unsupportedMediaType,
} from "https://github.com/apacheli/apachttpter/raw/master/extensions.ts";

application.route("*", notFound);

application.route(
  "/books",
  methodNotAllowed(["GET", "POST"]),
  authenticationCheck((authorization) => authorization === "secret"),
);

application.get("/books", (_request, response) => {
  response.body = "You got a book!";
  response.status = 200;
});

application.post(
  "/books",
  unsupportedMediaType(["application/json"]),
  payloadTooLarge(100),
  (_request, response) => {
    response.body = "Your book has been submitted!";
    response.status = 201;
  },
);
```
