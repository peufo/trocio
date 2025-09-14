import express from "express";

import type { OpenCageResult } from "../../src/lib/types/index.js";
import config from "../config.js";
const router = express.Router();

router.get("/geocode/:query", (req, res, next) => {
  if (!config.TROCIO_OCD_API_KEY)
    return next(
      Error(
        "Variable environement TROCIO_OCD_API_KEY is undefined ! Please visite https://opencagedata.com/api"
      )
    );
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${req.params.query}&language=fr&key=${config.TROCIO_OCD_API_KEY}`;
  fetch(url)
    .then(async (response) => {
      if (!response.ok) {
        return next(Error("No result"));
      }
      const { results } = (await response.json()) as OpenCageResult;
      const formatted = results.map((r) => {
        return {
          address: r.formatted,
          location: r.geometry,
          _type: r.components._type,
          country_code: r.components.country_code,
          currency: r.annotations?.currency?.iso_code,
        };
      });
      res.json(formatted);
    })
    .catch(next);
});

export default router;
