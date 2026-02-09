const http = require("http");
const app = require(".");

const server = http.createServer(app);
const PORT = process.env.PORT || 3002;

server.listen(PORT, () => {
  console.log(`Captain service is running on port ${PORT}`);
});
