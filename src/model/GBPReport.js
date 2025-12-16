import mongoose from "mongoose";

const gbpReportSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "projects", required: true },
    totalInteractions: Number,
    calls: Number,
    chatClicks: Number,
    bookings : Number,
    directions: Number,
    websiteVisits: Number,
    reportMonth: { type: String }    
  }, {timestamps: true, versionKey: false });

export default mongoose.model("gbpreports", gbpReportSchema);