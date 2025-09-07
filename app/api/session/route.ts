import { NextResponse } from "next/server";
import connectToMongo from "../../../lib/mongodb";
import ChatSession from "../../../models/ChatSession";


export async function POST(req: Request) {
  await connectToMongo();
  const { email, firstMessage } = await req.json();

  const session = new ChatSession({
    email,
    title: firstMessage || `Session ${Date.now()}`,
  });

  await session.save();
  return NextResponse.json(session);
}



