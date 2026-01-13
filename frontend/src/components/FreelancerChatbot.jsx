import React, { useState, useRef, useEffect } from 'react';
import { chatbotAPI } from '../lib/api';

export const FreelancerChatbot = () => {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hi! I\'m your GigFlow AI assistant. I can help you find gigs, write proposals, and grow your freelance career. How can I help you today?',
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();

        if (!input.trim() || loading) return;

        const userMessage = {
            role: 'user',
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // Get conversation history (last 10 messages)
            const conversationHistory = messages.slice(-10).map(msg => ({
                role: msg.role,
                content: msg.content,
            }));

            const response = await chatbotAPI.chat({
                message: input,
                conversationHistory,
            });

            const botMessage = {
                role: 'assistant',
                content: response.message,
                timestamp: new Date(response.timestamp),
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            const errorMessage = {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date(),
                isError: true,
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] max-w-2xl mx-auto border rounded-lg shadow-lg bg-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg">
                <h2 className="text-xl font-bold">🤖 AI Freelancer Assistant</h2>
                <p className="text-sm opacity-90">Powered by Google Gemini</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-lg p-3 ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : msg.isError
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}
                        >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            <span className="text-xs opacity-70 mt-1 block">
                                {msg.timestamp.toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg p-3">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="border-t p-4">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask me anything about freelancing..."
                        className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
};

// Quick Actions Component
export const ChatbotQuickActions = ({ gigData, onSuggestionReceived }) => {
    const [loading, setLoading] = useState(false);

    const getSuggestion = async () => {
        setLoading(true);
        try {
            const response = await chatbotAPI.suggestBid({
                gigTitle: gigData.title,
                gigDescription: gigData.description,
                gigBudget: gigData.budget,
                userSkills: gigData.userSkills || [],
            });

            onSuggestionReceived?.(response.suggestion);
        } catch (error) {
            console.error('Error getting suggestion:', error);
        } finally {
            setLoading(false);
        }
    };

    const analyzeGig = async () => {
        setLoading(true);
        try {
            const response = await chatbotAPI.analyzeGig({
                gigTitle: gigData.title,
                gigDescription: gigData.description,
                gigBudget: gigData.budget,
                userSkills: gigData.userSkills || [],
            });

            alert(response.analysis);
        } catch (error) {
            console.error('Error analyzing gig:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex space-x-2">
            <button
                onClick={getSuggestion}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
                ✨ AI Suggest Bid
            </button>
            <button
                onClick={analyzeGig}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
                🔍 Analyze Gig
            </button>
        </div>
    );
};
