const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");

const app = express();
const PORT = 4000;

app.use(cors());

// Maps stream names to grpcurl argument arrays
const grpcCommands = {
  StreamCouponIssues: ["-d", '{"languageCode": "en"}', "-proto", "c.proto", "grpc-api.wawinners.com:443", "coupon.CouponStreamService/StreamCouponIssues"],
  StreamActiveCoupons: ["-d", '{"userId": "7c91edefc3be40c8c6b3d5fb"}', "-proto", "c.proto", "grpc-api.wawinners.com:443", "coupon.CouponStreamService/StreamActiveCoupons"],
  StreamActiveBusinessesStream: ["-d", '{"languageCode": "en"}', "-proto", "c.proto", "grpc-api.wawinners.com:443", "coupon.CouponStreamService/StreamActiveBusinessesStream"],
  StreamMoreCouponRequests: ["-d", '{"userId": "7c91edefc3be40c8c6b3d5fb"}', "-proto", "c.proto", "grpc-api.wawinners.com:443", "coupon.CouponStreamService/StreamMoreCouponRequests"],
  ActiveCouponIssuesWithBusinessesStream: ["-d", '{"languageCode": "en"}', "-proto", "c.proto", "grpc-api.wawinners.com:443", "coupon.CouponStreamService/ActiveCouponIssuesWithBusinessesStream"],
  WalletStream: ["-d", '{"userId": "7c91edefc3be40c8c6b3d5fb"}', "-proto", "c.proto", "grpc-api.wawinners.com:443", "coupon.CouponStreamService/WalletStream"],
  StreamActiveDrawn: ["-d", '{"languageCode": "en"}', "-proto", "c.proto", "grpc-api.wawinners.com:443", "coupon.CouponStreamService/StreamActiveDrawn"],
  TicketsStream: ["-d", '{"userId": "7c91edefc3be40c8c6b3d5fb"}', "-proto", "c.proto", "grpc-api.wawinners.com:443", "coupon.CouponStreamService/TicketsStream"],
  ZonesStream: ["-d", '{"languageCode": "en"}', "-proto", "c.proto", "grpc-api.wawinners.com:443", "coupon.CouponStreamService/ZonesStream"],
  BusinessBranchStream: ["-d", '{"languageCode": "en"}', "-proto", "c.proto", "grpc-api.wawinners.com:443", "coupon.CouponStreamService/BusinessBranchStream"],
  StreamUserCarts: ["-d", '{"userId": "7c91edefc3be40c8c6b3d5fb"}', "-proto", "c.proto", "grpc-api.wawinners.com:443", "coupon.CouponStreamService/StreamUserCarts"],
  StreamUserNotifications: ["-d", '{"userId": "7c91edefc3be40c8c6b3d5fb", "userPrefrences": { "languageCode": "en", "brightness": "light" }}', "-proto", "c.proto", "grpc-api.wawinners.com:443", "coupon.CouponStreamService/StreamUserNotifications"],
  EnvironmentStream: ["-d", "{}", "-proto", "c.proto", "grpc-api.wawinners.com:443", "coupon.CouponStreamService/EnvironmentStream"]
};

app.get("/check/:streamName", (req, res) => {
  const { streamName } = req.params;
  const args = grpcCommands[streamName];

  if (!args) {
    return res.status(400).json({ error: "Invalid stream name" });
  }

  const proc = spawn("grpcurl", args);
  let hasOutput = false;
  let responseSent = false;

  proc.stdout.on("data", (data) => {
    if (responseSent) return;
    hasOutput = true;
    console.log(`Success checking ${streamName}: ${data}`);
    res.json({ isUp: true });
    responseSent = true;
    proc.kill();
  });

  proc.stderr.on("data", (data) => {
    console.error(`Error checking ${streamName}: ${data}`);
  });

  proc.on("close", (code) => {
    if (responseSent) return;
    console.error(`No output for ${streamName}, marking as down`);
    res.json({ isUp: false });
    responseSent = true;
  });
});

app.listen(PORT, () => {
  console.log(`Health check backend running on http://localhost:${PORT}`);
});