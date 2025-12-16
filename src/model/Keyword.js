import mongoose from "mongoose";

const keywordSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "projects", required: true },
    createdBy: { type: String },
    keyword: { type: String },
    country: String,
    location: String,
  }, {timestamps: true, versionKey: false });

keywordSchema.index({ keyword: 1, project: 1 }, { unique: true });

export default mongoose.model("keywords", keywordSchema);
