import mongoose from "mongoose";

const healthSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "projects", required: true },
    gsc: { type: String, required: true, default: 'No manual actions required' },
    security: { type: String, required: true, default: 'No security issues detected' },
    httpsUrls: {type: Number, default: 0 },
    nonHttpsUrls: {type: Number, default: 0},
    reportMonth: { type: String }   
  }, {timestamps: true, versionKey: false });

export default mongoose.model("healthReports", healthSchema);
