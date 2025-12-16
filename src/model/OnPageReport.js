import mongoose from "mongoose";

const onPageSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "projects", required: true },
    createdBy: { type: String },
    status: { type: Boolean, default: true },
    url: String,
    reportMonth: { type: String }
  }, {timestamps: true, versionKey: false });

export default mongoose.model("onPageReports", onPageSchema);
