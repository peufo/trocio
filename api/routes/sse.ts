import express from "express";
import { EventEmitter } from "node:events";
import { createSSE } from "../controllers/sse.js";

const router = express.Router();
const bus = new EventEmitter();

router
  .get("/subscribe", async (req, res, next) => {
    if (!req.session.user) return next(Error("Login required"));

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const { emitSSE } = createSSE(res);
    bus.on(req.session.user._id, emitSSE);

    req.on("close", () => {
      bus.off(req.session.user._id, emitSSE);
      res.end();
    });
  })
  .post("/emit/:event", (req, res, next) => {
    if (!req.session.user) return next(Error("Login required"));
    bus.emit(req.session.user._id, {
      event: req.params.event,
      data: req.body,
    });
    res.send("ok");
  });

export default router;
