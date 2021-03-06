# apachttpter

### About

A Simple HTTP server built for Deno using
[`URLPattern`](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern).

### Needs Work

- [x] Support modifying the request body when chaining the context
- [ ] Support redirecting
- [ ] Support error handling when something goes wrong
- [x] Built-in extension support for more `Content-Type`s
  - [x] `application/json`
  - [x] `application/x-www-form-urlencoded`
  - [x] `multipart/form-data`

### Example

Simple example:

```ts
import { Application } from "https://github.com/apacheli/apachttpter/raw/master/application.ts";

const application = new Application();

application.get("/", ({ response }) => {
  response.body = "Hello, World!";
});

application.listen(1337);
```

Pattern matching using `URLPattern.exec()` under the hood:

```ts
application.get("/threads/:thread_id", ({ response, result }) => {
  const threadId = result.pathname.groups.thread_id;
  const thread = threads.get(threadId);
  if (thread) {
    response.body = `${thread.name}: ${thread.description}`;
  } else {
    response.body = "I could not find that thread.";
    response.status = 404;
  }
});
```

Using `Context.next()`, you can make cool middleware chains like this:

```ts
application.get("/trending", async ({ next, response }) => {
  const start = Date.now();
  await next();
  response.body = JSON.stringify(response.body);
  const end = Date.now() - start;
  console.log(end);
});

application.get("/trending", ({ response }) => {
  response.body = [{ id: 123 }];
});
```

Built-in extensions:

```ts
import { Application } from "https://github.com/apacheli/apachttpter/raw/master/application.ts";
import {
  authenticationCheck,
  methodNotAllowed,
  notFound,
  payloadTooLarge,
  unsupportedMediaType,
} from "https://github.com/apacheli/apachttpter/raw/master/extensions.ts";

const application = new Application();

application.route(
  "/books",
  methodNotAllowed(["GET", "POST"]),
  authenticationCheck((authorization) => authorization === "secret"),
);

application.get("/books", ({ response }) => {
  response.body = "You got a book!";
  response.status = 200;
});

application.post(
  "/books",
  unsupportedMediaType(["application/json"]),
  payloadTooLarge(100),
  ({ response }) => {
    response.body = "Your book has been submitted!";
    response.status = 201;
  },
);

application.route("*", notFound);

application.listen(8080);
```
