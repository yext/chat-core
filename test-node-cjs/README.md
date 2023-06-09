## test-node-cjs

This package contains setup to test node and commonjs compatibility of chat-core.

To test, make sure you have the following:

- a .env file setup following the .sample.env file.
- a build for @yext/chat-core (run `npm run build` in the **root directory**)

Then, run the following command to test:

```bash
cd test-node-cjs && npm i && npm run test
```

This will start a node server at http://localhost:3030/. Opening that up should trigger a request to the server, which will automatically make an initial request to chat API on domain "liveapi-dev.yext.com" using ChatCore and display the response (e.g. initial message).
