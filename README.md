# apachttpter

### About

A Simple HTTP server built for Deno using
[`URLPattern`](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern).

### Needs Work

- [ ] Support modifying the body
- [ ] Support redirecting
- [ ] Support error handling when something goes wrong
- [ ] Add extension support for more `Content-Type`s

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
application.get("/threads/:thread_id", (_request, response, match) => {
  const threadId = match.pathname.groups.thread_id;
  const thread = threads.get(threadId);
  response.body = JSON.stringify(thread);
});
```

Using the `next` function:

```ts
application.route("*", (_request, response, _match, next) => {
  const date = new Date();
  response.headers.set("Content-Type", "application/json");
  response.headers.set("Date", date.toUTCString());
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
  authenticationCheck((authorization) => authorization === "secret"),
  methodNotAllowed(["GET", "POST"]),
);

application.get("/books", (_request, response) => {
  response.body = "You got a book!";
  response.status = 200;
  response.statusText = "OK";
});

application.post(
  "/books",
  unsupportedMediaType(["application/json"]),
  payloadTooLarge(100),
  (_request, response) => {
    response.body = "Your book has been submitted!";
    response.status = 201;
    response.statusText = "Created";
  },
);
```
