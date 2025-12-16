import { Schema, model, mongoose } from 'mongoose';

const blogSchema = new Schema({
  articleId: { type: String, required: true, unique: true },
  project: { type: String, required: true },
  topic: { type: String, required: true },
  publishLink: { type: String },
  publishedAt: { type: String },
}, {versionKey: false });

export default model('blogs', blogSchema);