import { NextResponse } from "next/server";
import connectToMongo from "../../../../lib/mongodb";
import Message from "../../../../models/Message";
import mongoose from "mongoose";
import ChatSession from "../../../../models/ChatSession";


interface Params {
  params: { sessionId: string };
}


export async function GET(req: Request, { params }: any) {
  await connectToMongo();

  const { sessionId } = params;

  let sessionMongoID;
  try {
    sessionMongoID = new mongoose.Types.ObjectId(sessionId);
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid sessionId format" },
      { status: 400 }
    );
  }

  // Sirf yeh fields return honge: _id, text, sender, createdAt
  const messages = await Message.findOne({ sessionId: sessionMongoID })
    .sort({ createdAt: 1 })
    .select("chats");

    console.log(messages);

  return NextResponse.json(messages);
}



export async function DELETE(req: Request, { params }: any) {
  await connectToMongo();

  const { sessionId } = params;
  console.log(sessionId);

  try {
    // Delete all messages for this session
    await Message.deleteMany({ sessionId: new mongoose.Types.ObjectId(sessionId) });

    // Delete the session itself
    await ChatSession.findByIdAndDelete(sessionId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting session:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

