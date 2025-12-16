import mongoose from "mongoose";

const socialOptimizationSchema  = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "projects", required: true },
    platform: { type: String, required: true, enum: ["Facebook","Instagram","Linkedin","Twitter","YouTube","Pinterest"] },
    status: {type: String, enum: ["Optimized", "Not Optimized", "Not Found"], default: "Optimized" }
  }, {timestamps: true, versionKey: false });

export default mongoose.model("socialOptimizations", socialOptimizationSchema );