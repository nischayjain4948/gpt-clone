"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Menu, Plus, X, ArrowUp, Pencil, Trash } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
const sleep = (ms:number) => new Promise(resolve => setTimeout(()=>ms))

export default function ChatApp() {
  const { data: session, status: authStatus } = useSession();
  const [mounted, setMounted] = useState(false);

  // Sidebar + session states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSession, setCurrentSession] = useState<any>(null);

  // Message input + editing
  const [input, setInput] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState("");

  // handling file uploaing....
 const [uploading, setUploading] = useState(false);


  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Chat SDK
  const { messages, sendMessage, status, setMessages, regenerate } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  //  prevent hydration issues
  useEffect(() => setMounted(true), []);

  // 🚀 Load sessions + latest messages
  useEffect(() => {
    if (!session?.user?.email) return;

    const loadSessions = async () => {
      const res = await fetch("/api/session/list", {
        method: "POST",
        body: JSON.stringify({ email: session?.user?.email }),
      });

      const data = await res.json();
      sleep(2000);
      setSessions(data);

      if (data.length > 0) {
        const latestSession = data[0];
        setCurrentSession(latestSession);

        const msgRes = await fetch(`/api/message/${latestSession._id}`);
        const msgs = await msgRes.json();
        setMessages(msgs.chats);
      } else {
        handleNewChat();
      }
    };

    loadSessions();
  }, [ session]);

  //  Create new chat session
  const handleNewChat = async () => {
    const res = await fetch("/api/session", {
      method: "POST",
      body: JSON.stringify({
        email: session?.user?.email,
        firstMessage: "",
      }),
    });
    const newSession = await res.json();
    setCurrentSession(newSession);
    setSessions((prev) => [newSession, ...prev]);
    setMessages([]);
  };

  //  Load selected session
  const loadSession = async (s: any) => {
    setCurrentSession(s);
    const res = await fetch(`/api/message/${s._id}`);
    const msgs = await res.json();
    setMessages(msgs.chats);
  };

  //  Send message
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentSession) return;

    sendMessage({ text: input });

    await fetch("/api/message/save", {
      method: "POST",
      body: JSON.stringify({
        sessionId: currentSession._id,
        chatMessages: messages,
      }),
    });

    setInput("");
  };

  //  Edit + regenerate
  const handleEditSubmit = (e: FormEvent, messageId: string) => {
    e.preventDefault();

   setMessages((prev) => {
  return prev.map((msg) => {
    if (msg.id === messageId) {
      // Clone the original parts but update text
      const newParts = msg.parts.map((p) => ({ ...p, text: editInput }));
      return { ...msg, parts: newParts };
    }
    return msg;
  });
});

    setEditingMessageId(null);
    setEditInput("");
  };

  //  Delete session + chats
  const handleDeleteSession = async (sessionId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this chat session and all its messages?"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/message/${sessionId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete session");

      setSessions((prev) => prev.filter((s) => s._id !== sessionId));

      if (currentSession?._id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
      }
      else{
        setCurrentSession(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      alert("Failed to delete session. Try again.");
    }
  };

  //  Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  //  Hydration safe
  if (!mounted) return null;

  // Auth loading
  if (authStatus === "loading") {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }



  // file handling.
const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setUploading(true);

  try {
    // 1. Get signature + creds from backend
    const sigRes = await fetch("/api/cloudinary-sign");
    const { timestamp, signature, apiKey, cloudName } = await sigRes.json();

    // 2. Upload directly to Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("folder", "chat_uploads");

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      { method: "POST", body: formData }
    );
    const data = await uploadRes.json();

    console.log("✅ Uploaded:", data);

    // 3. Save into chat (send message with file url)
    sendMessage({
      text: `📎 Uploaded file: ${data.secure_url}`,
    });
  } catch (err) {
    console.error("Upload error", err);
  } finally {
    setUploading(false);
  }
};



  // Not signed in
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-6">
        <h1 className="text-2xl font-bold">Welcome to ChatGPT Clone</h1>
        <button
          onClick={() => signIn("google")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white text-black flex flex-col 
        transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold">ChatGPT Clone</h2>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={handleNewChat}
          className="flex items-center gap-2 p-3 m-3 bg-gray-200 hover:bg-gray-400 rounded-lg"
        >
          <Plus className="w-5 h-5" />
          <span>New Chat</span>
        </button>

        <ul className="flex-1 overflow-y-auto px-2 space-y-2">
          {sessions.length > 0 ? (
            sessions.map((s) => (
              <li
                key={s._id}
                className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                  currentSession?._id === s._id ? "bg-gray-300" : "hover:bg-gray-200"
                }`}
              >
                <span onClick={() => loadSession(s)} className="flex-1 cursor-pointer">
                  {s.title}
                </span>
                <button
                  onClick={() => handleDeleteSession(s._id)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash size={16} />
                </button>
              </li>
            ))
          ) : (
            <li className="text-gray-400 text-sm px-2">No chats yet</li>
          )}
        </ul>

        <div className="p-3 border-t border-gray-200 text-sm">
          <p suppressHydrationWarning>Hey! {session.user?.name}</p>
          <button
            onClick={() => signOut()}
            className="mt-2 w-full px-3 py-1 bg-red-500 rounded hover:bg-red-600 text-white"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay (mobile only) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Chat Area */}
      <main className="flex flex-col flex-1 bg-gray-100">
        {/* Top Bar (mobile) */}
        <div className="flex items-center p-2 border-b bg-white md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded hover:bg-gray-200"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="ml-2 text-lg font-semibold">Chat</h1>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`relative rounded-lg px-4 py-3 max-w-xl whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-900 shadow-sm"
                }`}
              >
                {editingMessageId === m.id ? (
                  <form
                    onSubmit={(e) => handleEditSubmit(e, m.id)}
                    className="flex flex-col gap-2"
                  >
                    <textarea
                      value={editInput}
                      onChange={(e) => setEditInput(e.target.value)}
                      className="w-full rounded-md border p-2 text-sm text-black"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setEditingMessageId(null)}
                        className="px-2 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300 text-black"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-2 py-1 text-sm rounded bg-blue-500 text-white hover:bg-blue-600"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                   {m.parts?.map((p: any, idx: number) => {
  if (p.type === "text") {
    if (p.text.startsWith("📎 Uploaded file:")) {
      // URL nikal lo
      const url = p.text.replace("📎 Uploaded file:", "").trim();
      return (
        <div key={idx} className="mt-2">
          <img
            src={url}
            alt="uploaded"
            className="max-w-xs rounded-lg border border-gray-300"
          />
        </div>
      );
    }
    // normal text
    return <p key={idx}>{p.text}</p>;
  }
  return null;
})}

                    {m.role === "user" && (
                      <button
                        onClick={() => {
                          setEditingMessageId(m.id);
                          const firstPart = m.parts?.[0];
                      setEditInput(

  firstPart && "text" in firstPart
    ? firstPart.text
    : ""
);

                        }}
                        className="absolute -bottom-6 right-0 text-xs text-gray-400 hover:text-gray-600"
                      >
                        <Pencil width={15} />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {status === "streaming" && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 text-gray-500 rounded-lg px-4 py-3 shadow-sm flex items-center gap-2">
                <span className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        

        <form onSubmit={handleSubmit} className="p-4 border-t bg-white flex gap-2">
  <label className="cursor-pointer flex items-center">
    <input
      type="file"
      className="hidden"
      onChange={handleFileUpload}
      disabled={uploading}
    />
    <span
      className={`p-2 rounded-full ${
        uploading ? "bg-gray-300 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"
      }`}
    >
      {uploading ? "⏳" : "📎"}
    </span>
  </label>

  <textarea
    value={input}
    onChange={(e) => setInput(e.target.value)}
    placeholder="Send a message..."
    rows={1}
    className="flex w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm"
    disabled={uploading}
  />
  <button
    type="submit"
    className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition"
    disabled={status === "streaming" || !currentSession || uploading}
  >
    <ArrowUp size={18} />
  </button>
</form>


      </main>
    </div>
  );
}