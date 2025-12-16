import { Schema, model, mongoose } from 'mongoose';

const smmLinkkSchema = new Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: "projects", required: true },
  publishDate: { type: String },
  postUrl: { type: String, required: true },
  platform: {    
    type: String,
    enum: ['Facebook', 'Instagram', 'GBP', 'Linkdin', 'Pinterest', 'YouTube' ]}
},{timestamps: true, versionKey: false });

export default model('smmlinks', smmLinkkSchema);