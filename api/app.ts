/// <reference types="./app.d.ts" />

import express, {
  type ErrorRequestHandler,
  type RequestHandler,
} from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import session from "express-session";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";
import compression from "compression";
import createError from "http-errors";

import { ensureIsRootUser } from "./controllers/access.js";
import config from "../config.js";
import { initOptions } from "./controllers/option.js";

import routesArticle from "./routes/article.js";
import routesIndex from "./routes/index.js";
import routesPayment from "./routes/payment.js";
import routesRoot from "./routes/root.js";
import routesSubscribe from "./routes/subscribe.js";
import routesTroc from "./routes/troc.js";
import routesUser from "./routes/user.js";
import routesMessage from "./routes/message.js";
import routesSSE from "./routes/sse.js";

// Connection database
try {
  console.log(`TRY TO CONNECT TO "${config.TROCIO_DB}"`);
  mongoose.set({ strictQuery: true });
  mongoose.connect(config.TROCIO_DB).then(() => {
    console.log(`DB connected: ${config.TROCIO_DB}`);
    initOptions();
  });
} catch (error) {
  console.log(error);
}

const app = express();

app.use(logger("dev"));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    secret: config.TROCIO_SECRET_STRING_COOKIE,
    cookie: { maxAge: 72 * 60 * 60 * 1000 },
    store: MongoStore.create({ mongoUrl: config.TROCIO_DB }),
    resave: false,
    saveUninitialized: true,
  })
);
app.use(compression({ threshold: 0 }));

app.use("/", routesIndex);
app.use("/users", routesUser);
app.use("/articles", routesArticle);
app.use("/trocs", routesTroc);
app.use("/payments", routesPayment);
app.use("/subscribes", routesSubscribe);
app.use("/messages", routesMessage);
app.use("/sse", routesSSE);
app.use("/root", ensureIsRootUser, routesRoot);

const catchError404: RequestHandler = (req, res, next) => {
  res.status(404);
  next(createError(404, `Not found: ${req.path}`));
};
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (req.app.get("env") === "development" || err.message.match(/^public: /)) {
    const message = err.message?.replace(/^public: /, "") || err;
    res.json({ error: true, message });
    console.log(err);
  } else {
    res.json({ error: true });
  }
};

app.use(catchError404);
app.use(errorHandler);

export default app;
