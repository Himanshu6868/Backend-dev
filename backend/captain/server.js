const http = require("http");
const app = require("./index");

const server = http.createServer(app);
const PORT = process.env.PORT || 3002;

server.listen(PORT, () => {
  console.log(`Captain service is running on port ${PORT}`);
});
