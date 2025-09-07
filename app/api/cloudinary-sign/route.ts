import { NextResponse } from "next/server";
import cloudinary from "../../../lib/cloudinary";

export async function GET() {
  const timestamp = Math.round(new Date().getTime() / 1000);

  // signature = SHA1(api_secret + public_id + timestamp + ...)
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: "chat_uploads" },
    process.env.CLOUDINARY_API_SECRET!
  );

  return NextResponse.json({
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
}
