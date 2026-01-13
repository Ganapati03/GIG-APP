import { useState } from "react";
import { Plus, Briefcase, DollarSign, Users } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { useAppContext } from "../GigFlowApp";
import { PostJobDialog } from "./PostJobDialog";
import { BidManagement } from "./BidManagement";
import { motion } from "motion/react";

export function ClientDashboard() {
  const { jobs, bids, currentUserId } = useAppContext();
  const [postJobOpen, setPostJobOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const myJobs = jobs.filter((job) => job.clientId === currentUserId);
  const openJobs = myJobs.filter((job) => job.status === "open");
  const assignedJobs = myJobs.filter((job) => job.status === "assigned");

  const totalBids = bids.filter((bid) => 
    myJobs.some((job) => job.id === bid.jobId)
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Client Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your posted jobs and hire talented freelancers
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => setPostJobOpen(true)}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Post New Job
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="hover:shadow-lg dark:hover:shadow-indigo-500/20 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myJobs.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {openJobs.length} open, {assignedJobs.length} assigned
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="hover:shadow-lg dark:hover:shadow-purple-500/20 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Bids</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBids}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all jobs
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="hover:shadow-lg dark:hover:shadow-green-500/20 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${myJobs.reduce((sum, job) => sum + job.budget, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all jobs
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">My Posted Jobs</h2>
        {myJobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center mb-4">
                You haven't posted any jobs yet
              </p>
              <Button onClick={() => setPostJobOpen(true)}>
                Post Your First Job
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {myJobs.map((job, index) => {
              const jobBids = bids.filter((bid) => bid.jobId === job.id);
              const pendingBids = jobBids.filter((bid) => bid.status === "pending");

              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg dark:hover:shadow-indigo-500/10 transition-all duration-300 group">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle>{job.title}</CardTitle>
                            <Badge
                              variant={job.status === "open" ? "default" : "secondary"}
                              className={
                                job.status === "open"
                                  ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                  : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                              }
                            >
                              {job.status === "open" ? "Open" : "Assigned"}
                            </Badge>
                          </div>
                          <CardDescription>{job.description}</CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                            ${job.budget.toLocaleString()}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {jobBids.length} {jobBids.length === 1 ? "bid" : "bids"}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {job.status === "open" && pendingBids.length > 0 && (
                          <Button
                            size="sm"
                            onClick={() => setSelectedJobId(job.id)}
                          >
                            View {pendingBids.length} {pendingBids.length === 1 ? "Bid" : "Bids"}
                          </Button>
                        )}
                        {job.status === "assigned" && (
                          <Badge variant="outline" className="bg-green-500/10">
                            Freelancer Hired
                          </Badge>
                        )}
                        {job.status === "open" && pendingBids.length === 0 && (
                          <p className="text-sm text-muted-foreground">
                            Waiting for bids...
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <PostJobDialog open={postJobOpen} onOpenChange={setPostJobOpen} />
      {selectedJobId && (
        <BidManagement
          jobId={selectedJobId}
          open={!!selectedJobId}
          onOpenChange={(open) => !open && setSelectedJobId(null)}
        />
      )}
    </div>
  );
}
