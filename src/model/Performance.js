import mongoose from "mongoose";

const perfomanceSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "projects", required: true },
    platform: { type: String, required: true, enum: ['Mobile', 'Desktop'] },
    score: {type: Number, default: 0 },
    fcp: String,
    lcp: String,
    tbt: String,
    cls: String,    
    si: String,
    reportMonth: { type: String }   
  }, {timestamps: true, versionKey: false });

export default mongoose.model("perfomanceReports", perfomanceSchema);