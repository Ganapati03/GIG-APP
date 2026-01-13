import { useState, useEffect } from "react";
import { MessageCircle, Send, User, Check, CheckCheck } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useAppContext } from "../GigFlowApp";
import { motion } from "motion/react";

export function MessagesPage() {
  const { conversations, messages, currentUserId, sendMessage, fetchConversationMessages } = useAppContext();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");

  const myConversations = conversations.filter((conv) =>
    conv.participantIds.includes(currentUserId)
  );

  const selectedConversation = myConversations.find(
    (conv) => conv.id === selectedConversationId
  );

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      fetchConversationMessages(selectedConversationId);
    }
  }, [selectedConversationId]); // Note: excluding fetchConversationMessages to avoid loops if unstable

  const conversationMessages = selectedConversationId
    ? messages.filter((msg) => msg.conversationId === selectedConversationId)
    : [];

  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversationId || isSending) return;

    setIsSending(true);
    const success = await sendMessage(selectedConversationId, messageInput);
    setIsSending(false);

    if (success) {
      setMessageInput("");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground mt-1">
          Communicate with clients and freelancers
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <ScrollArea className="h-[600px] p-4">
            {myConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center text-sm">
                  No conversations yet
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {myConversations.map((conv) => (
                  <motion.div
                    key={conv.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant={selectedConversationId === conv.id ? "secondary" : "ghost"}
                      className="w-full justify-start h-auto p-4"
                      onClick={() => setSelectedConversationId(conv.id)}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <Avatar>
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left overflow-hidden">
                          <p className="font-semibold truncate">{conv.jobTitle}</p>
                          {conv.lastMessage && (
                            <p className="text-xs text-muted-foreground truncate">
                              {conv.lastMessage.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2">
          {!selectedConversation ? (
            <CardContent className="flex flex-col items-center justify-center h-[600px]">
              <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Select a conversation to start messaging</p>
            </CardContent>
          ) : (
            <div className="flex flex-col h-[600px]">
              {/* Chat Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{selectedConversation.jobTitle}</p>
                    <p className="text-xs text-muted-foreground">Active project</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {conversationMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <p className="text-muted-foreground text-sm">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    conversationMessages
                      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
                      .map((msg) => {
                        const isOwnMessage = msg.senderId === currentUserId;
                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                isOwnMessage
                                  ? "bg-indigo-500 text-white"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <div className={`flex items-end gap-1 ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}>
                                <p className={`text-xs mt-1 ${isOwnMessage ? "text-indigo-100" : "text-muted-foreground"}`}>
                                  {msg.timestamp.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                                {isOwnMessage && (
                                  <span className="mb-0.5">
                                    {msg.read ? (
                                      <CheckCheck className="h-3 w-3 text-blue-300" />
                                    ) : (
                                      <Check className="h-3 w-3 text-indigo-200" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                  )}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || isSending}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}