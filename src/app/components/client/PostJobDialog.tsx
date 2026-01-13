import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useAppContext } from "../GigFlowApp";
import { Bot, Sparkles, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

type PostJobDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type ChatbotStep = "title" | "description" | "budget" | "confirm" | "success";

export function PostJobDialog({ open, onOpenChange }: PostJobDialogProps) {
  const { addJob } = useAppContext();
  const [step, setStep] = useState<ChatbotStep>("title");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");

  const handleSubmit = () => {
    if (!title || !description || !budget) {
      toast.error("Please fill in all fields");
      return;
    }

    addJob({
      title,
      description,
      budget: parseFloat(budget),
      status: "open",
      clientId: "", // explicit placeholder, though ignored by addJob
    });

    setStep("success");
    setTimeout(() => {
      onOpenChange(false);
      resetForm();
    }, 2000);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setBudget("");
    setStep("title");
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  const getChatbotMessage = () => {
    switch (step) {
      case "title":
        return "Hi! I'm here to help you post a job. Let's start with the job title. What would you like to call this project?";
      case "description":
        return "Great title! Now, can you describe what you need? Be specific about the requirements and deliverables.";
      case "budget":
        return "Perfect! What's your budget for this project? Enter an amount in USD.";
      case "confirm":
        return "Looks good! Review your job details below and click 'Publish' when you're ready.";
      case "success":
        return "🎉 Your job has been published successfully! Freelancers can now submit bids.";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post a New Job</DialogTitle>
          <DialogDescription>
            Our AI assistant will guide you through the process
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
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
                <h3 className="text-xl font-semibold mb-2">Job Published!</h3>
                <p className="text-muted-foreground text-center">
                  Your job is now live and visible to freelancers
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
                {/* Title Field */}
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Build a React Dashboard"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={step !== "title" && step !== "confirm"}
                    className={step === "title" ? "ring-2 ring-indigo-500/50" : ""}
                  />
                </div>

                {/* Description Field */}
                {(step === "description" || step === "budget" || step === "confirm") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your project requirements, deliverables, and any specific skills needed..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={step !== "description" && step !== "confirm"}
                      rows={4}
                      className={step === "description" ? "ring-2 ring-indigo-500/50" : ""}
                    />
                  </motion.div>
                )}

                {/* Budget Field */}
                {(step === "budget" || step === "confirm") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="budget">Budget (USD) *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="budget"
                        type="number"
                        placeholder="2500"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        disabled={step !== "budget" && step !== "confirm"}
                        className={`pl-7 ${step === "budget" ? "ring-2 ring-indigo-500/50" : ""}`}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (step === "description") setStep("title");
                      else if (step === "budget") setStep("description");
                      else if (step === "confirm") setStep("budget");
                    }}
                    disabled={step === "title"}
                  >
                    Back
                  </Button>

                  {step === "confirm" ? (
                    <Button
                      onClick={handleSubmit}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Publish Job
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        if (step === "title") {
                          if (!title) {
                            toast.error("Please enter a job title");
                          } else if (title.length < 5) {
                            toast.error("Title must be at least 5 characters");
                          } else if (title.length > 100) {
                            toast.error("Title cannot exceed 100 characters");
                          } else {
                            setStep("description");
                          }
                        } else if (step === "description") {
                          if (!description) {
                            toast.error("Please enter a description");
                          } else if (description.length < 20) {
                            toast.error("Description must be at least 20 characters");
                          } else if (description.length > 2000) {
                            toast.error("Description cannot exceed 2000 characters");
                          } else {
                            setStep("budget");
                          }
                        } else if (step === "budget") {
                          if (!budget || parseFloat(budget) < 1) {
                            toast.error("Please enter a valid budget (min $1)");
                          } else {
                            setStep("confirm");
                          }
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
