# apachttpter

### About

Simple HTTP server built for Deno using
[`URLPattern`](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern).

### Example

Simple example:

```ts
import { Application } from "https://github.com/apacheli/apachttpter/raw/dev/application.ts";

const application = new Application();

application.get("/", (request, response) => {
  response.body = "Hello, World!";
});

application.listen(1337);
```

Pattern matching:

```ts
application.get("/threads/:thread_id", (request, response, match) => {
  const threadId = match.pathname.groups.thread_id;
  const thread = threads.get(threadId);
  response.body = JSON.stringify(thread);
});
```

Built-in extensions:

```ts
import {
  methodNowAllowed,
  notFound,
} from "https://github.com/apacheli/apachttpter/raw/dev/extensions.ts";

application.route("*", notFound);

application.route("/books", methodNotAllowed(["GET", "POST"]));

application.get("/books", (request, response) => {
  response.body = "You got a book!";
});

application.post("/books", () => {
  response.body = "Your book has been submitted!";
});
```

Using the `next` function:

```ts
application.route("*", (request, response, match, next) => {
  response.headers.set("Content-Type", "application/json");
  response.headers.set("Date", new Date().toISOString());
  next();
});

application.put("/random", (request, response) => {
  response.body = JSON.stringify({ hello: "world" });
});
```
