import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongodb";
import ChatSession from "../../../../models/ChatSession";


export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    await dbConnect();

    // find all sessions of this user
    const sessions = await ChatSession.find({ email }).sort({ createdAt: -1 }) ?? [];

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}




