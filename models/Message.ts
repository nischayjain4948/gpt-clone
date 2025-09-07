import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  sessionId: mongoose.Types.ObjectId;   // link to ChatSession
  chats : []
}

const MessageSchema: Schema<IMessage> = new Schema(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: "ChatSession", required: true },
    chats : {type : []}
  },
  { versionKey: false } // disables __v field
);

export default mongoose.models.Message ||
  mongoose.model<IMessage>("Message", MessageSchema);
