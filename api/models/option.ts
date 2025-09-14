import { model, Schema, Document } from "mongoose";

import type { Option } from "../../src/lib/types/index.js";

const optionModel = new Schema({
  name: { type: String, unique: true, required: true },
  value: { type: String, required: true },
  description: String,
});

optionModel.set("timestamps", true);

export default model<Option & Document>("option", optionModel);
