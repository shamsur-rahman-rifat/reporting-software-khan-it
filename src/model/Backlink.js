import { Schema, model, mongoose } from 'mongoose';

const backlinkSchema = new Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: "projects", required: true },
  createdBy: { type: String },
  targetUrl: { type: String, required: true },
  reportMonth: { type: String }  
},{timestamps: true, versionKey: false });

export default model('backlinks', backlinkSchema);