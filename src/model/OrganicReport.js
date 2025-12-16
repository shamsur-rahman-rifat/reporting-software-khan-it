import { Schema, model, mongoose } from 'mongoose';

const organicSchema = new Schema({
    project: { type: mongoose.Schema.Types.ObjectId, ref: "projects", required: true },
    month: { type: String, required: true },
    traffic_source: {type: Map, of: Number},
    top_country: {type: Map,of: Number},
    device: {type: Map,of: Number},      
}, {timestamps: true, versionKey: false });

export default model('organicReports', organicSchema);