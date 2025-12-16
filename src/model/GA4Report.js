import { Schema, model, mongoose } from 'mongoose';

const ga4Schema = new Schema({
    project: { type: mongoose.Schema.Types.ObjectId, ref: "projects", required: true },
    month: { type: String, required: true },
    metrics: {type: Map, of: Number},
    traffic_source: {type: Map, of: Number},
    traffic_country: {type: Map,of: Number},
    traffic_device: {type: Map,of: Number},      
}, {timestamps: true, versionKey: false });

// Avoid duplicate entries for the same project & month
ga4Schema.index({ project: 1, month: 1 }, { unique: true });

export default model('ga4reports', ga4Schema);