import { useState } from "react";
import { Bot, X, Send, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { motion, AnimatePresence } from "motion/react";
import { useAppContext } from "./GigFlowApp";
import { chatbotAPI } from "../../lib/api";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
};

const initialMessages: Message[] = [
  {
    id: "1",
    text: "Hi! I'm your GigFlow AI assistant powered by Google Gemini. I can help you with bidding strategies, proposal writing, gig analysis, and more. What would you like to know?",
    sender: "bot",
    timestamp: new Date(),
  },
];

const quickReplies = [
  "How do I write a winning bid?",
  "Tips for pricing my services",
  "How to improve my success rate?",
  "What makes a good proposal?",
];

export function ChatbotAssistant() {
  const { currentView, setCurrentView, jobs, bids, currentUserId } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const myBids = bids.filter((bid) => bid.freelancerId === currentUserId);
  const hiredBids = myBids.filter((bid) => bid.status === "hired");
  const successRate = myBids.length > 0 ? Math.round((hiredBids.length / myBids.length) * 100) : 0;

  const getBotResponse = async (userMessage: string): Promise<string> => {
    try {
      // Build conversation history for context
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      }));

      // Call real Gemini API
      const response = await chatbotAPI.chat({
        message: userMessage,
        conversationHistory,
      });

      return response.message;
    } catch (error: any) {
      console.error("Chatbot API error:", error);
      
      // Fallback to basic responses if API fails
      const lowerMessage = userMessage.toLowerCase();

      if (lowerMessage.includes("post") && lowerMessage.includes("job")) {
        setCurrentView("client-dashboard");
        return "I've navigated you to the Client Dashboard. Click 'Post New Job' to get started!";
      }

      if (lowerMessage.includes("bid") || lowerMessage.includes("proposal")) {
        setCurrentView("gig-feed");
        return "I've taken you to the Gig Feed. Browse available jobs and click 'Bid Now' on any that interest you!";
      }

      if (lowerMessage.includes("success rate")) {
        return `Your current success rate is ${successRate}%! ${
          successRate < 50
            ? "Keep submitting quality proposals to improve it."
            : successRate < 80
            ? "You're doing well! Keep up the good work."
            : "Excellent work! You're a top performer."
        }`;
      }

      return "I'm having trouble connecting to my AI service right now. Please try again in a moment, or ask me to navigate you somewhere specific!";
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Get AI response
    const botResponseText = await getBotResponse(inputValue);

    const botResponse: Message = {
      id: `bot-${Date.now()}`,
      text: botResponseText,
      sender: "bot",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, botResponse]);
    setIsTyping(false);
  };

  const handleQuickReply = (reply: string) => {
    setInputValue(reply);
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              size="lg"
              onClick={() => setIsOpen(true)}
              className="h-16 w-16 rounded-full shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 hover:scale-110 transition-all duration-300"
            >
              <Bot className="h-8 w-8" />
            </Button>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
              }}
              className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-background"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]"
          >
            <Card className="shadow-2xl overflow-hidden border-2 border-indigo-500/20">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Bot className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">GigFlow Assistant</h3>
                      <div className="flex items-center gap-1 text-xs">
                        <div className="h-2 w-2 bg-green-400 rounded-full" />
                        <span>Online</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="h-96 p-4 bg-background">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${
                        message.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender === "user"
                            ? "bg-indigo-500 text-white"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-line">{message.text}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))}

                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex gap-1">
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                            className="w-2 h-2 bg-muted-foreground rounded-full"
                          />
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.6, delay: 0.2, repeat: Infinity }}
                            className="w-2 h-2 bg-muted-foreground rounded-full"
                          />
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.6, delay: 0.4, repeat: Infinity }}
                            className="w-2 h-2 bg-muted-foreground rounded-full"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>

              {/* Quick Replies */}
              {messages.length === 1 && (
                <div className="p-4 border-t border-border bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Quick suggestions:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {quickReplies.map((reply) => (
                      <Button
                        key={reply}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickReply(reply)}
                        className="text-xs"
                      >
                        {reply}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t border-border bg-background">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
