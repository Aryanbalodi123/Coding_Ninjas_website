import { Schema, model, models, Document } from "mongoose";

export interface IPastEvent extends Document {
  name: string;
  description: string;
  date: string; // ISO date string
  location?: string;
  poster: string;
  galleryLinks: string[];
}

const PastEventSchema = new Schema<IPastEvent>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    location: { type: String, trim: true },
    poster: { type: String, required: true },
    galleryLinks: { type: [String], default: [] },
  },
  { timestamps: true },
);

// Prevent mongoose from recompiling the model on hot reloads
if (models.PastEvent) {
  delete models.PastEvent;
}

export const PastEvent = model<IPastEvent>("PastEvent", PastEventSchema);