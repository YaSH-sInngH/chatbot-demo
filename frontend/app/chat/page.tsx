"use client";
import { useEffect, useRef, useState } from "react";
import { apiFetch } from "../utils/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { clear } from "console";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatHistoryItem {
  prompt: string;
  response: string;
  conversationId?: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: ChatHistoryItem[];
}

export default function ChatPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [authError, setAuthError] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  // Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log("Fetching user...");
        const token = localStorage.getItem("token");
        console.log("Current token:", token);
        const me = await apiFetch<{ id: string; name: string; }>("/auth/me");
        console.log("User data:", me);
        setUserId(me.id);
        setUserName(me.name);
      } catch (err) {
        console.error("Auth error:", err);
        setAuthError(true);
        // Delayed redirect to show error message
        setTimeout(() => router.push("/"), 2000);
      }
    };
    fetchUser();
  }, [router]);

  // Fetch chat history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { chats } = await apiFetch<{ chats: ChatHistoryItem[] }>("/chat/history");
        const groupedConversations: { [key: string]: Conversation } = {};

        chats.forEach(chat => {
          const convId = chat.conversationId || 'default';
          if (!groupedConversations[convId]) {
            groupedConversations[convId] = {
              id: convId,
              title: chat.prompt.slice(0, 30) || 'New Chat',
              messages: [],
            };
          }
          groupedConversations[convId].messages.push(chat);
        });

        // Sort conversations by the createdAt of their latest message (descending)
        const sortedConversations = Object.values(groupedConversations).sort((a, b) => {
          const lastMessageA = a.messages[a.messages.length - 1];
          const lastMessageB = b.messages[b.messages.length - 1];
          return new Date(lastMessageB.createdAt).getTime() - new Date(lastMessageA.createdAt).getTime();
        });

        setConversations(sortedConversations);
      } catch (err) {
        console.error("Failed to load history", err);
      }
    };
    if (userId) fetchHistory();
  }, [userId]);

  // Scroll to bottom on new message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Safe fallback rendering — after all hooks
  if (authError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500 text-lg font-medium">
          Unauthorized access, please login.
        </p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Checking authentication...</p>
      </div>
    );
  }

  // --- Main UI ---
  const handleSelectConversation = (conv: Conversation) => {
    setCurrentConversationId(conv.id);
    setMessages(conv.messages.flatMap(msg => [
      { role: "user", content: msg.prompt },
      { role: "assistant", content: msg.response }
    ]));
    // Ensure the selected conversation is highlighted
    setSelectedIndex(conversations.findIndex(c => c.id === conv.id));
  };

  const startNewChat = () => {
    setCurrentConversationId(null);
    setMessages([]);
    setInput('');
    setSelectedIndex(null); // Clear selected history item
  };

  const sendMessage = async () => {
    if (!input.trim() || !userId) return;

    let conversationToUse = currentConversationId;
    if (!conversationToUse) {
      conversationToUse = `${userId}-${Date.now()}`;
      setCurrentConversationId(conversationToUse);
    }

    const newMessages = [...messages, { role: "user" as const, content: input }];
    setMessages(newMessages as ChatMessage[]);
    setInput("");
    setLoading(true);
    try {
      const res = await apiFetch<{ success: boolean; response: string }>("/chat", {
        method: "POST",
        body: JSON.stringify({ userId, message: input, conversationId: conversationToUse }),
      });
      const newAssistantMessage = { role: "assistant" as const, content: res.response };
      setMessages((prev) => [...prev, newAssistantMessage]);

      setConversations(prevConversations => {
        const existingConversationIndex = prevConversations.findIndex(conv => conv.id === conversationToUse);
        if (existingConversationIndex > -1) {
          const updatedConversations = [...prevConversations];
          updatedConversations[existingConversationIndex] = {
            ...updatedConversations[existingConversationIndex],
            messages: [...updatedConversations[existingConversationIndex].messages, { prompt: input, response: res.response, conversationId: conversationToUse, createdAt: new Date().toISOString() }]
          };
          return updatedConversations;
        } else {
          // New conversation
          return [
            ...prevConversations,
            {
              id: conversationToUse,
              title: input.slice(0, 30) || 'New Chat',
              messages: [{ prompt: input, response: res.response, conversationId: conversationToUse, createdAt: new Date().toISOString() }]
            }
          ];
        }
      });
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: "assistant", content: err.message }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-80 lg:w-80 md:w-72 sm:w-64 hidden sm:flex bg-blue-700 text-white flex-col">
        {/* Header */}
        <div className="p-4 border-b border-blue-400">
          <button
            onClick={startNewChat}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-blue-400 hover:bg-blue-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm font-medium">New chat</span>
          </button>
        </div>
        
        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.length === 0 && (
            <div className="p-4 text-center text-black text-sm">
              No conversations yet
            </div>
          )}
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => handleSelectConversation(conv)}
              className={`w-full text-left p-3 rounded-lg mb-1 text-sm hover:bg-pink-600 transition-colors group relative ${
                currentConversationId === conv.id ? "bg-pink-600" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="truncate">{conv.title}</span>
              </div>
            </button>
          ))}
        </div>
        
        {/* Bottom User Section */}
        <div className="p-4 border-t border-blue-200 backdrop-blur-sm">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-500/50 cursor-pointer transition-all duration-200 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-base font-medium">{userName}</span>
          </div>
          <Link href="/" className="flex items-center justify-center bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] text-white font-medium shadow-lg hover:shadow-xl">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </Link>
        </div>
      </aside>

      {/* Mobile Menu Button - Only visible on small screens */}
      <div className="sm:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <>
          <div 
            className="sm:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="sm:hidden fixed left-0 top-0 h-full w-80 bg-blue-500 text-white flex flex-col z-50 transform transition-transform">
            <div className="p-4 border-b border-blue-400 flex items-center justify-between">
              <button
                onClick={startNewChat}
                className="flex-1 flex items-center gap-3 p-3 rounded-lg border border-blue-400 hover:bg-blue-600 transition-colors mr-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm font-medium">New chat</span>
              </button>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-blue-600 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
              {conversations.length === 0 && (
                <div className="p-4 text-center text-blue-200 text-sm">
                  No conversations yet
                </div>
              )}
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    handleSelectConversation(conv);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg mb-1 text-sm hover:bg-blue-600 transition-colors ${
                    currentConversationId === conv.id ? "bg-blue-600" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="truncate">{conv.title}</span>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="p-4 border-t border-blue-400">
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-600 transition-colors">
                <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-sm">User</span>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="border-b border-blue-200 bg-white px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-black truncate">
              {currentConversationId ? 
                conversations.find(c => c.id === currentConversationId)?.title || "Chat" 
                : "New Chat"
              }
            </h1>
          </div>
        </header>

        {/* Messages Area */}
        <main className="flex-1 overflow-y-auto bg-white">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center p-4">
              <div className="text-center max-w-md mx-auto">
                <h2 className="text-black text-3xl font-bold mb-5">ChatBot <span className="text-blue-500">AI</span></h2>
                <h2 className="text-xl sm:text-2xl font-semibold text-black mb-2">How can I help you <span className="text-green-500">today</span>?</h2>
                <p className="text-gray-700">Start a conversation by typing a message below.</p>
              </div>
            </div>
          ) : (
            <div className="w-full">
              {messages.map((message, idx) => (
                <div key={idx} className={`py-4 sm:py-6 px-4 sm:px-6 border-b border-blue-200 ${
                  message.role === "assistant" ? "bg-blue-50" : "bg-white"
                }`}>
                  <div className="flex gap-3 sm:gap-6 max-w-4xl mx-auto">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === "user" 
                          ? "bg-purple-600 text-white" 
                          : "bg-green-500 text-white"
                      }`}>
                        {message.role === "user" ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        )}
                      </div>
                    </div>
                    
                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-black mb-1">
                        {message.role === "user" ? "You" : "Assistant"}
                      </div>
                      <div className="prose prose-sm max-w-none text-black leading-relaxed whitespace-pre-wrap break-words">
                        {message.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="py-4 sm:py-6 px-4 sm:px-6 bg-blue-500 border-b border-blue-100">
                  <div className="flex gap-3 sm:gap-6 max-w-4xl mx-auto">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-violet-700 mb-1">Assistant</div>
                      <div className="flex items-center gap-2 text-blue-500">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                        </div>
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          )}
        </main>

        {/* Input Area */}
        <footer className="border-t border-blue-200 bg-white p-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative flex items-end gap-3">
              <div className="flex-1 relative">
                <input
                  className="w-full resize-none border border-blue-300 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-blue-400 text-black"
                  placeholder="Message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="text-xs text-blue-400 text-center mt-2 hidden sm:block">
              Press Enter to send
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
