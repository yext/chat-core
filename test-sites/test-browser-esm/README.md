## test-browser-esm

This package contains setup to test browser and esm compatibility of all chat core libraries (e.g. standard, Amazon connect integration, and Zendesk integration).

To test, make sure you have the following:

- a .env file setup following the .sample.env file.
- a build for @yext/chat-core (run `npm run build` in the **root directory**)

Then, run the following command to test:

```bash
cd test-browser-esm && npm i && npm run build && npm run test
```

This will serve the index.html page on http://localhost:5050. Opening that up should show a button to trigger send a request with empty message array to chat API on domain "liveapi-dev.yext.com" using ChatCore and display the response (e.g. initial message) below.

### Chat Core Integrations

#### Zendesk

To test Zendesk integration, ensures that the bot is configured with Zendesk handoff goal and provided appropriate credentials. In the `.env` file, provide the value for `TEST_ZENDESK_INTEGRATION_ID`. The test site should switch to use ChatCoreZendesk instance if it detects a zendesk-specific handoff step.

For agent handoff with zendesk user assigned as requester, authentication is needed via providing JWT token and externalId to zendesk core. In the `.env` field, provide the value for `TEST_EXTERNAL_ID` and `TEST_JWT`. To test jwt refresh logic, provide `TEST_REFRESH_JWT`, which should be used when the initial jwt token expires.
