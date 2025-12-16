import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  whatsapp: String,
  password: String,
  roles: {    
    type: [String],
    enum: ['admin', 'social media expert', 'project manager', 'backlink expert']}
},{timestamps: true, versionKey: false});

export default model('users', userSchema);