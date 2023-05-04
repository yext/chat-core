## test-browser-esm

This package contains setup to test browser and esm compatibility of chat-core.

To test, first make sure there is a build constructed for @yext/chat-core. If not, run `npm run build` in  the **root directory**

Then, run the following command to test:
```bash
cd test-browser-esm && npm i && npm run build && npm run test
```

This will serve the index.html page on http://localhost:5050. Opening that up should show a button to trigger send a request with empty message array to chat API using ChatCore and display the response (e.g. initial message) below.