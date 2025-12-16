import mongoose from "mongoose";

const webVitalSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "projects", required: true },
    platform: { type: String, required: true, enum: ['Mobile', 'Desktop'] },
    poorUrls: {type: Number, default: 0 },
    improvementUrls: {type: Number, default: 0},
    goodUrls: {type: Number, default: 0},
    reportMonth: { type: String }   
  }, {timestamps: true, versionKey: false });

export default mongoose.model("webVitals", webVitalSchema);