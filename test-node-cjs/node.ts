const http = require('http');
const { ChatCore } = require('@yext/chat-core');
const dotenv = require('dotenv');

dotenv.config();

const config = {
  apiKey: process.env['TEST_BOT_API_KEY'] || 'API_KEY_PLACEHOLDER',
  botId: 'red-dog-bot',
  apiDomain: 'liveapi-dev.yext.com',
};

const server = http.createServer(async (_req: unknown, res: any) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  const chatCore = new ChatCore(config);
  const reply = await chatCore.getNextMessage({
    messages: []
  });
  res.end(JSON.stringify(reply, null, 2));
});

const hostname = 'localhost';
const port = 3030;

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});