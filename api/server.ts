import app from "./app.js";
import config from "../config";

app.listen(config.TROCIO_API_PORT, () =>
  console.log(`API listen on port ${config.TROCIO_API_PORT}`)
);
