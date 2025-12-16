import { Schema, model, mongoose } from 'mongoose';

const projectSchema = new Schema({
  website: { type: String, required: true },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },  
  status: { type: String, enum: ['ongoing', 'paused'], default: 'ongoing' },
  startMonth: String,
  propertyId: String,
},{timestamps: true, versionKey: false});

export default model('projects', projectSchema);