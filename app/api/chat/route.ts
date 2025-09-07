import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, UIMessage } from "ai";

export async function POST(req:Request){
  try{
    const {messages} : {messages : UIMessage[] } = await req.json();
  const result = streamText({
    model:openai("gpt-4.1-nano"),
    messages:convertToModelMessages(messages)
  });

 return result.toUIMessageStreamResponse();

  }
  catch(error){
    console.log(error);
    return new Response('failed to complete chat completion',{status:500})
  }
  

}