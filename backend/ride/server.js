const http = require("http");
const app = require("./index");

const server = http.createServer(app);
const PORT = process.env.PORT || 3003;

server.listen(PORT, () => {
  console.log(`Ride service is running on port ${PORT}`);
});
