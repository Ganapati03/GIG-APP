import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useAppContext, type Bid } from "../GigFlowApp";
import { CheckCircle, XCircle, User, DollarSign, AlertCircle, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

type BidManagementProps = {
  jobId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function BidManagement({ jobId, open, onOpenChange }: BidManagementProps) {
  const { jobs, bids, hireBid, createConversation, setCurrentView, currentUserId } = useAppContext();
  const [selectedBid, setSelectedBid] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isHiring, setIsHiring] = useState(false);

  const job = jobs.find((j) => j.id === jobId);
  const jobBids = bids.filter((bid) => bid.jobId === jobId);

  const handleHire = async (bidId: string) => {
    setSelectedBid(bidId);
    setShowConfirm(true);
  };

  const confirmHire = async () => {
    if (!selectedBid) return;

    setIsHiring(true);
    setShowConfirm(false);

    // Simulate loading
    await new Promise((resolve) => setTimeout(resolve, 1000));

    hireBid(jobId, selectedBid);
    setIsHiring(false);

    // Close after success animation
    setTimeout(() => {
      onOpenChange(false);
    }, 2000);
  };

  if (!job) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bids for: {job.title}</DialogTitle>
            <DialogDescription>
              Review proposals and hire the best freelancer for your project
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {jobBids.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No bids yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {jobBids.map((bid, index) => (
                    <motion.div
                      key={bid.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{
                        opacity: bid.status === "rejected" ? 0.5 : 1,
                        scale: 1,
                      }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        className={`transition-all duration-500 ${
                          bid.status === "hired"
                            ? "ring-2 ring-green-500 shadow-lg shadow-green-500/20"
                            : bid.status === "rejected"
                            ? "opacity-50"
                            : "hover:shadow-lg dark:hover:shadow-indigo-500/10"
                        }`}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                                  {getInitials(bid.freelancerName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <CardTitle className="text-lg">
                                  {bid.freelancerName}
                                </CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge
                                    variant={
                                      bid.status === "hired"
                                        ? "default"
                                        : bid.status === "rejected"
                                        ? "secondary"
                                        : "outline"
                                    }
                                    className={
                                      bid.status === "hired"
                                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                        : bid.status === "rejected"
                                        ? "bg-red-500/10 text-red-600 dark:text-red-400"
                                        : ""
                                    }
                                  >
                                    {bid.status === "hired" && (
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                    )}
                                    {bid.status === "rejected" && (
                                      <XCircle className="h-3 w-3 mr-1" />
                                    )}
                                    {bid.status.charAt(0).toUpperCase() +
                                      bid.status.slice(1)}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                <DollarSign className="h-5 w-5" />
                                {bid.amount.toLocaleString()}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Bid amount
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-semibold mb-2">Proposal</h4>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {bid.proposal}
                              </p>
                            </div>

                            {bid.status === "pending" && (
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  onClick={async () => {
                                    const convId = await createConversation(jobId, [bid.freelancerId, currentUserId]);
                                    if (convId) {
                                      onOpenChange(false);
                                      setCurrentView("messages");
                                    }
                                  }}
                                  className="flex-1 sm:flex-none border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-900/20"
                                >
                                  <MessageCircle className="h-4 w-4 mr-2" />
                                  Message
                                </Button>
                                <Button
                                  onClick={() => handleHire(bid.id)}
                                  disabled={isHiring}
                                  className="flex-1 sm:flex-none bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Hire {bid.freelancerName.split(" ")[0]}
                                </Button>
                              </div>
                            )}

                            {bid.status === "hired" && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex items-center gap-2 text-green-600 dark:text-green-400"
                              >
                                <CheckCircle className="h-5 w-5" />
                                <span className="font-semibold">
                                  Freelancer Hired!
                                </span>
                              </motion.div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hire Freelancer?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to hire{" "}
              <strong>
                {jobBids.find((b) => b.id === selectedBid)?.freelancerName}
              </strong>
              ? This will close the job and reject other bids.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmHire}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              Confirm & Hire
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
