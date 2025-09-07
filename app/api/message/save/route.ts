import { NextResponse } from "next/server";
import connectToMongo from "../../../../lib/mongodb";
import Message from "../../../../models/Message";
import ChatSession from "../../../../models/ChatSession";



export async function POST(req: Request) {
  await connectToMongo();
  const { sessionId, chatMessages } = await req.json();
  console.log(sessionId,chatMessages)

  if (!sessionId || !Array.isArray(chatMessages)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  if(chatMessages.length == 0){
    return NextResponse.json({ success: true });
  }

  try {
    const updated = await Message.findOneAndUpdate(
      { sessionId },
      { $set: { chats: chatMessages } },
      { upsert: true, new: true } // create if not exists
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Error saving messages:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
