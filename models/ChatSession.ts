import mongoose, { Schema, Document } from "mongoose";

export interface IChatSession extends Document {
  email: string;       // logged-in user ka email
  title: string;       // first message ya session title
  createdAt: Date;
}

const ChatSessionSchema: Schema = new Schema({
  email: { type: String, required: true },
  title: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.ChatSession || mongoose.model<IChatSession>("ChatSession", ChatSessionSchema);
