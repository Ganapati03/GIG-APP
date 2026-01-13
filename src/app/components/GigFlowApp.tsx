import { useState, createContext, useContext, ReactNode, useEffect } from "react";
import { Navigation } from "./Navigation";
import { ClientDashboard } from "./client/ClientDashboard";
import { FreelancerDashboard } from "./freelancer/FreelancerDashboard";
import { GigFeed } from "./freelancer/GigFeed";
import { ChatbotAssistant } from "./ChatbotAssistant";
import { LoginPage } from "./auth/LoginPage";
import { SignupPage } from "./auth/SignupPage";
import { MessagesPage } from "./messaging/MessagesPage";
import { useAuth } from "./AuthContext";
import { gigAPI, bidAPI, messageAPI } from "../../lib/api";
import { useSocket } from "../../lib/socket";

export type Job = {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: "open" | "assigned";
  clientId: string;
  assignedTo?: string;
  createdAt: Date;
};

export type Bid = {
  id: string;
  jobId: string;
  freelancerId: string;
  freelancerName: string;
  proposal: string;
  amount: number;
  status: "pending" | "hired" | "rejected";
  createdAt: Date;
};

export type Notification = {
  id: string;
  message: string;
  type: "success" | "info" | "warning";
  timestamp: Date;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  content: string;
  timestamp: Date;
  read: boolean;
};

export type Conversation = {
  id: string;
  jobId: string;
  jobTitle: string;
  participantIds: string[];
  lastMessage?: Message;
};

type View = "client-dashboard" | "post-job" | "freelancer-dashboard" | "gig-feed" | "my-bids" | "messages";

type AppContextType = {
  jobs: Job[];
  bids: Bid[];
  notifications: Notification[];
  messages: Message[];
  conversations: Conversation[];
  currentView: View;
  currentUserId: string;
  addJob: (job: Omit<Job, "id" | "createdAt">) => void;
  addBid: (bid: Omit<Bid, "id" | "createdAt">) => void;
  hireBid: (jobId: string, bidId: string) => void;
  setCurrentView: (view: View) => void;
  addNotification: (notification: Omit<Notification, "id" | "timestamp">) => void;
  sendMessage: (conversationId: string, content: string) => Promise<boolean>;
  createConversation: (jobId: string, participantIds: string[]) => Promise<string>;
  fetchConversationMessages: (conversationId: string) => Promise<void>;
};

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};

export function GigFlowApp() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentView, setCurrentView] = useState<View>("gig-feed");
  const [authView, setAuthView] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(true);
  
  const currentUserId = user?.id || "";

  // Set initial view based on user role
  useEffect(() => {
    if (isAuthenticated && user && !loading) {
      if (user.role === "client") {
        setCurrentView("client-dashboard");
      } else if (user.role === "freelancer") {
        setCurrentView("gig-feed");
      }
      // If "both", stick to default or let user choose (defaults to gig-feed in state)
    }
  }, [isAuthenticated, user, loading]);

  // Fetch gigs and bids from backend when authenticated
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Parallel requests
        const [gigsRes, bidsRes, convRes] = await Promise.all([
          gigAPI.getAll(),
          bidAPI.getMyBids(),
          messageAPI.getConversations()
        ]);

        // Process Gigs
        let allJobs: Job[] = [];
        if (gigsRes.success && gigsRes.gigs) {
           allJobs = gigsRes.gigs.map((gig: any) => ({
            id: gig._id,
            title: gig.title,
            description: gig.description,
            budget: gig.budget,
            status: gig.status,
            clientId: gig.ownerId._id || gig.ownerId,
            assignedTo: gig.hiredFreelancerId,
            createdAt: new Date(gig.createdAt)
          }));
          setJobs(allJobs);
        }

        // Process Bids (Submitted by me)
        let allBids: Bid[] = [];
        if (bidsRes.success && bidsRes.bids) {
            allBids = bidsRes.bids.map((bid: any) => ({
            id: bid._id,
            jobId: bid.gigId._id || bid.gigId,
            freelancerId: bid.freelancerId._id || bid.freelancerId,
            freelancerName: bid.freelancerId.name || user?.name || "Unknown",
            proposal: bid.message,
            amount: bid.price,
            status: bid.status,
            createdAt: new Date(bid.createdAt)
          }));
        }

        // If I am a client, I need to fetch bids RECEIVED for my jobs
        if (user?.role === 'client' || user?.role === 'both') {
            const myJobIds = allJobs
                .filter(job => job.clientId === currentUserId)
                .map(job => job.id);
            
            // Parallel fetch for all my jobs
            const receivedBidsPromises = myJobIds.map(id => bidAPI.getForGig(id));
            const receivedBidsResponses = await Promise.all(receivedBidsPromises);
            
            receivedBidsResponses.forEach((res) => {
                if (res.success && res.bids) {
                    const mappedBids = res.bids.map((bid: any) => ({
                        id: bid._id,
                        jobId: bid.gigId,
                        freelancerId: bid.freelancerId._id || bid.freelancerId,
                        freelancerName: bid.freelancerId.name || "Unknown",
                        proposal: bid.message, // Ensure this field matches backend
                        amount: bid.price,
                        status: bid.status,
                        createdAt: new Date(bid.createdAt)
                    }));
                    allBids = [...allBids, ...mappedBids];
                }
            });
        }
        
        // Deduplicate bids just in case (though IDs should be unique)
        const uniqueBids = Array.from(new Map(allBids.map(item => [item.id, item])).values());
        setBids(uniqueBids);

        // Process Conversations
        if (convRes.success && convRes.conversations) {
          const formattedConversations: Conversation[] = convRes.conversations.map((conv: any) => ({
            id: conv._id,
            jobId: conv.gigId?._id || conv.gigId,
            jobTitle: conv.gigId?.title || "Direct Message",
            participantIds: conv.participants.map((p: any) => p._id || p),
            lastMessage: conv.lastMessage ? {
              id: conv.lastMessage._id,
              content: conv.lastMessage.content,
              timestamp: new Date(conv.lastMessage.createdAt),
              read: conv.lastMessage.read,
              senderId: conv.lastMessage.senderId,
              // Add other necessary message fields if missing
              conversationId: conv._id,
              senderName: conv.lastMessage.senderId === user?.id ? (user?.name || "Me") : "User", // Placeholder or fetched
              recipientId: conv.participants.find((p: any) => (p._id || p) !== conv.lastMessage.senderId)?._id || "" // Placeholder
            } : undefined
          }));
          setConversations(formattedConversations);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user]);

  // Real-time updates via Socket.io
  const { socket } = useSocket(user?.id);

  useEffect(() => {
    if (!socket) return;

    // Listen for new bids (as a client)
    socket.on('new_bid', (newBid: any) => {
      const mappedBid: Bid = {
        id: newBid._id,
        jobId: newBid.gigId,
        freelancerId: newBid.freelancerId._id || newBid.freelancerId,
        freelancerName: newBid.freelancerId.name || "Unknown",
        proposal: newBid.message,
        amount: newBid.price,
        status: newBid.status,
        createdAt: new Date(newBid.createdAt)
      };

      setBids((prev) => {
        if (prev.some(b => b.id === mappedBid.id)) return prev;
        return [mappedBid, ...prev];
      });

      addNotification({
        message: `New bid received from ${mappedBid.freelancerName}`,
        type: "info"
      });
    });

    // Listen for "You are Hired" (as a freelancer)
    socket.on('hired', (data: any) => {
      addNotification({
        message: data.message,
        type: "success"
      });

      setJobs(prev => prev.map(job => 
        job.id === data.gigId ? { ...job, status: 'assigned', assignedTo: currentUserId } : job
      ));

      setBids(prev => prev.map(bid => 
        bid.jobId === data.gigId && bid.freelancerId === currentUserId 
          ? { ...bid, status: 'hired' } 
          : bid
      ));
    });

    // Listen for new messages
    socket.on('new_message', (msg: any) => {
      const newMessage: Message = {
        id: msg._id,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        senderName: msg.senderName || "User",
        recipientId: currentUserId,
        content: msg.content,
        timestamp: new Date(msg.createdAt),
        read: false,
      };

      setMessages((prev) => {
        if (prev.some(m => m.id === newMessage.id)) return prev;
        return [newMessage, ...prev];
      });

      setConversations((prev) => {
        const exists = prev.some(c => c.id === msg.conversationId);
        if (exists) {
          return prev.map(c => c.id === msg.conversationId ? { ...c, lastMessage: newMessage } : c);
        }
        return prev;
      });

      addNotification({
        message: `New message from ${newMessage.senderName}`,
        type: "info"
      });
    });

    // Listen for new jobs (Broadcasted to everyone)
    socket.on('new_job', (job: any) => {
        if (user?.role === 'freelancer' || user?.role === 'both') {
            if (job.ownerId._id === currentUserId) return;

            const newJob: Job = {
                id: job._id,
                title: job.title,
                description: job.description,
                budget: job.budget,
                status: job.status,
                clientId: job.ownerId._id || job.ownerId,
                assignedTo: job.hiredFreelancerId,
                createdAt: new Date(job.createdAt)
            };

            setJobs(prev => {
                if (prev.some(j => j.id === newJob.id)) return prev;
                return [newJob, ...prev];
            });
            
             addNotification({
                message: `New Job Posted: ${newJob.title}`,
                type: "info"
            });
        }
    });

    return () => {
      socket.off('new_bid');
      socket.off('hired');
      socket.off('new_message');
      socket.off('new_job');
    };
  }, [socket, user]);

  // Show loading while checking auth
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth screens if not authenticated
  if (!isAuthenticated) {
    if (authView === "login") {
      return <LoginPage onSwitchToSignup={() => setAuthView("signup")} />;
    }
    return <SignupPage onSwitchToLogin={() => setAuthView("login")} />;
  }

  const addJob = async (jobData: Omit<Job, "id" | "createdAt">) => {
    try {
      const response = await gigAPI.create({
        title: jobData.title,
        description: jobData.description,
        budget: jobData.budget,
        category: "General"
      });

      if (response.success && response.gig) {
        const newJob: Job = {
          id: response.gig._id,
          title: response.gig.title,
          description: response.gig.description,
          budget: response.gig.budget,
          status: response.gig.status,
          // Handle both populated and unpopulated ownerId
          clientId: response.gig.ownerId?._id || response.gig.ownerId || currentUserId,
          createdAt: new Date(response.gig.createdAt)
        };
        setJobs((prev) => [newJob, ...prev]);
        addNotification({
          message: `Job "${newJob.title}" posted successfully!`,
          type: "success",
        });
      }
    } catch (error: any) {
      console.error("Error creating job:", error);
      addNotification({
        message: error.message || "Failed to post job. Please try again.",
        type: "warning",
      });
    }
  };

  const addBid = async (bidData: Omit<Bid, "id" | "createdAt">) => {
    try {
      const response = await bidAPI.create({
        gigId: bidData.jobId,
        message: bidData.proposal,
        price: bidData.amount,
        deliveryTime: 7 // Default 7 days
      });

      if (response.success && response.bid) {
        const newBid: Bid = {
          id: response.bid._id,
          jobId: response.bid.gigId,
          freelancerId: response.bid.freelancerId._id || response.bid.freelancerId,
          freelancerName: response.bid.freelancerId.name || user?.name || "You",
          proposal: response.bid.message,
          amount: response.bid.price,
          status: response.bid.status,
          createdAt: new Date(response.bid.createdAt)
        };
        setBids((prev) => [newBid, ...prev]);
        addNotification({
          message: "Bid submitted successfully!",
          type: "success",
        });
      }
    } catch (error: any) {
      console.error("Error submitting bid:", error);
      addNotification({
        message: error.message || "Failed to submit bid. Please try again.",
        type: "warning",
      });
    }
  };

  const hireBid = async (jobId: string, bidId: string) => {
    try {
      const response = await bidAPI.hire(bidId);

      if (response.success) {
        // Update job status locally
        setJobs((prev) =>
          prev.map((job) =>
            job.id === jobId
              ? { ...job, status: "assigned", assignedTo: response.bid.freelancerId }
              : job
          )
        );

        // Update bid statuses locally
        setBids((prev) =>
          prev.map((bid) =>
            bid.jobId === jobId
              ? { ...bid, status: bid.id === bidId ? "hired" : "rejected" }
              : bid
          )
        );

        const hiredBid = bids.find((b) => b.id === bidId);
        if (hiredBid) {
          addNotification({
            message: `${hiredBid.freelancerName} has been hired!`,
            type: "success",
          });
        }
      }
    } catch (error: any) {
      console.error("Error hiring bid:", error);
      addNotification({
        message: error.message || "Failed to hire freelancer. Please try again.",
        type: "warning",
      });
    }
  };

  const addNotification = (notif: Omit<Notification, "id" | "timestamp">) => {
    const newNotification: Notification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: new Date(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const fetchConversationMessages = async (conversationId: string) => {
    try {
      const response = await messageAPI.getMessages(conversationId);
      if (response.success && response.messages) {
        const newMessages: Message[] = response.messages.map((msg: any) => ({
          id: msg._id,
          conversationId: msg.conversationId,
          senderId: msg.senderId,
          senderName: msg.senderId === user?.id ? (user?.name || "Me") : "User", // Ideally needed from populated data
          recipientId: "", // Logic to determine recipient
          content: msg.content,
          timestamp: new Date(msg.createdAt),
          read: msg.read,
        }));

        // Merge messages avoiding duplicates
        setMessages((prev) => {
          const existingIds = new Set(prev.map(m => m.id));
          const uniqueNew = newMessages.filter(m => !existingIds.has(m.id));
          return [...prev, ...uniqueNew];
        });
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async (conversationId: string, content: string): Promise<boolean> => {
    try {
      const response = await messageAPI.sendMessage({ conversationId, content });
      
      if (response.success && response.message) {
        const newMessage: Message = {
            id: response.message._id,
            conversationId: response.message.conversationId,
            senderId: response.message.senderId,
            senderName: user?.name || "Me",
            recipientId: "", 
            content: response.message.content,
            timestamp: new Date(response.message.createdAt),
            read: false,
        };

        setMessages((prev) => [newMessage, ...prev]);

        // Update conversation last message
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId
              ? { ...conv, lastMessage: newMessage }
              : conv
          )
        );
        return true;
      }
      return false;
    } catch (error) {
        console.error("Error sending message:", error);
        addNotification({ message: "Failed to send message", type: "warning" });
        return false;
    }
  };

  const createConversation = async (jobId: string, participantIds: string[]) => {
    try {
       // Assume other participant is the one that is NOT me
       const otherUserId = participantIds.find(id => id !== currentUserId);
       if (!otherUserId) throw new Error("Recipient not found");

       const response = await messageAPI.startConversation({ 
           recipientId: otherUserId,
           gigId: jobId 
       });

       if (response.success && response.conversation) {
           const conv = response.conversation;
           const newConv: Conversation = {
               id: conv._id,
               jobId: conv.gigId?._id || conv.gigId,
               jobTitle: conv.gigId?.title || "New Conversation",
               participantIds: conv.participants.map((p: any) => p._id || p),
               lastMessage: undefined
           };
           
           // Check if exists
           setConversations(prev => {
               if (prev.some(c => c.id === newConv.id)) return prev;
               return [newConv, ...prev];
           });
           
           return newConv.id;
       }
       return "";
    } catch (error) {
        console.error("Error creating conversation:", error);
        return "";
    }
  };

  return (
    <AppContext.Provider
      value={{
        jobs,
        bids,
        notifications,
        messages,
        conversations,
        currentView,
        currentUserId,
        addJob,
        addBid,
        hireBid,
        setCurrentView,
        addNotification,
        sendMessage,
        createConversation,
        fetchConversationMessages,
      }}
    >
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <Navigation />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {currentView === "client-dashboard" && <ClientDashboard />}
          {currentView === "gig-feed" && <GigFeed />}
          {currentView === "my-bids" && <FreelancerDashboard />}
          {currentView === "messages" && <MessagesPage />}
        </main>
        <ChatbotAssistant />
      </div>
    </AppContext.Provider>
  );
}