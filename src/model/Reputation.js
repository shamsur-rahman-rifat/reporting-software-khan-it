import mongoose from "mongoose";

const reputationSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "projects", required: true },
    platform: { type: String, required: true, enum: ["GBP", "Facebook", "Trustpilot"] },
    totalReviews: {type: Number, default: 0 },
    reviewUpdates: {type: Number, default: 0 },
    reportMonth: { type: String }   
  }, {timestamps: true, versionKey: false });

export default mongoose.model("reputations", reputationSchema);