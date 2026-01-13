import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useAppContext } from "../GigFlowApp";
import { Bot, Send, CheckCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

type BidDialogProps = {
  jobId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type ChatbotStep = "proposal" | "amount" | "confirm" | "success";

export function BidDialog({ jobId, open, onOpenChange }: BidDialogProps) {
  const { jobs, addBid, currentUserId } = useAppContext();
  const [step, setStep] = useState<ChatbotStep>("proposal");
  const [proposal, setProposal] = useState("");
  const [amount, setAmount] = useState("");

  const job = jobs.find((j) => j.id === jobId);

  const handleSubmit = () => {
    if (!proposal || !amount) {
      toast.error("Please fill in all fields");
      return;
    }

    addBid({
      jobId,
      freelancerId: currentUserId,
      freelancerName: "You (Current User)",
      proposal,
      amount: parseFloat(amount),
      status: "pending",
    });

    setStep("success");
    setTimeout(() => {
      onOpenChange(false);
      resetForm();
    }, 2000);
  };

  const resetForm = () => {
    setProposal("");
    setAmount("");
    setStep("proposal");
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  const getChatbotMessage = () => {
    switch (step) {
      case "proposal":
        return "Hi! I'm here to help you craft a winning proposal. Tell the client why you're the best fit for this project. Highlight your relevant experience and approach.";
      case "amount":
        return "Great proposal! Now, what's your bid amount? The client's budget is $" +
          (job?.budget.toLocaleString() || "0") +
          ". You can bid at or below this amount.";
      case "confirm":
        return "Perfect! Review your bid details below and submit when ready. Good luck! 🍀";
      case "success":
        return "🎉 Your bid has been submitted successfully! The client will review it and may reach out to you.";
      default:
        return "";
    }
  };

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit a Bid</DialogTitle>
          <DialogDescription>
            Bidding on: <strong>{job.title}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Job Details Summary */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold">{job.title}</h4>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {job.description}
                </p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                  ${job.budget.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Client budget</p>
              </div>
            </div>
          </div>

          {/* Chatbot Message */}
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 p-4 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-lg border border-indigo-500/20"
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm leading-relaxed">{getChatbotMessage()}</p>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {step === "success" ? (
              <motion.div
                key="success"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <CheckCircle className="h-20 w-20 text-green-500 mb-4" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-2">Bid Submitted!</h3>
                <p className="text-muted-foreground text-center">
                  Your proposal is now with the client
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Proposal Field */}
                <div className="space-y-2">
                  <Label htmlFor="proposal">Your Proposal *</Label>
                  <Textarea
                    id="proposal"
                    placeholder="Explain your approach, relevant experience, and why you're the best fit..."
                    value={proposal}
                    onChange={(e) => setProposal(e.target.value)}
                    disabled={step !== "proposal" && step !== "confirm"}
                    rows={6}
                    className={step === "proposal" ? "ring-2 ring-indigo-500/50" : ""}
                  />
                  <p className="text-xs text-muted-foreground">
                    Tip: Be specific about your skills and deliverables
                  </p>
                </div>

                {/* Amount Field */}
                {(step === "amount" || step === "confirm") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="amount">Your Bid Amount (USD) *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="amount"
                        type="number"
                        placeholder={job.budget.toString()}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={step !== "amount" && step !== "confirm"}
                        className={`pl-7 ${step === "amount" ? "ring-2 ring-indigo-500/50" : ""}`}
                      />
                    </div>
                    {amount && parseFloat(amount) > job.budget && (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        ⚠️ Your bid is higher than the client's budget
                      </p>
                    )}
                  </motion.div>
                )}

                {/* Summary Preview */}
                {step === "confirm" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-lg"
                  >
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-indigo-500" />
                      Bid Summary
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Your bid:</span>
                        <span className="font-semibold">${parseFloat(amount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Client budget:</span>
                        <span>${job.budget.toLocaleString()}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (step === "amount") setStep("proposal");
                      else if (step === "confirm") setStep("amount");
                    }}
                    disabled={step === "proposal"}
                  >
                    Back
                  </Button>

                  {step === "confirm" ? (
                    <Button
                      onClick={handleSubmit}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Submit Bid
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        if (step === "proposal" && proposal) setStep("amount");
                        else if (step === "amount" && amount) setStep("confirm");
                        else {
                          toast.error("Please fill in the current field");
                        }
                      }}
                    >
                      Next
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
