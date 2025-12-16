import mongoose from "mongoose";

const keywordReportSchema = new mongoose.Schema({
  keyword: { type: mongoose.Schema.Types.ObjectId, ref: "keywords", required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "projects", required: true },
  url: String,
  previousPosition: String,
  currentPosition: String,
  status: String,
  reportMonth: { type: String }
}, { versionKey: false });

export default mongoose.model("keywordReports", keywordReportSchema);
