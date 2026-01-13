import { DollarSign, CheckCircle, Clock, XCircle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { useAppContext } from "../GigFlowApp";
import { motion } from "motion/react";

export function FreelancerDashboard() {
  const { bids, jobs, currentUserId } = useAppContext();

  const myBids = bids.filter((bid) => bid.freelancerId === currentUserId);
  const pendingBids = myBids.filter((bid) => bid.status === "pending");
  const hiredBids = myBids.filter((bid) => bid.status === "hired");
  const rejectedBids = myBids.filter((bid) => bid.status === "rejected");

  const totalEarnings = hiredBids.reduce((sum, bid) => sum + bid.amount, 0);
  const potentialEarnings = pendingBids.reduce((sum, bid) => sum + bid.amount, 0);

  const getJobForBid = (jobId: string) => {
    return jobs.find((job) => job.id === jobId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "hired":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
      case "hired":
        return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "rejected":
        return "bg-red-500/10 text-red-600 dark:text-red-400";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Bids</h1>
        <p className="text-muted-foreground mt-1">
          Track your proposals and celebrate your wins
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="hover:shadow-lg dark:hover:shadow-indigo-500/20 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Bids</CardTitle>
              <TrendingUp className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myBids.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Submitted proposals
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="hover:shadow-lg dark:hover:shadow-amber-500/20 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingBids.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                ${potentialEarnings.toLocaleString()} potential
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
              <CardTitle className="text-sm font-medium">Hired</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hiredBids.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Success rate: {myBids.length > 0 ? Math.round((hiredBids.length / myBids.length) * 100) : 0}%
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="hover:shadow-lg dark:hover:shadow-purple-500/20 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalEarnings.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                From won projects
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bids List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">All Bids</h2>
        {myBids.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center mb-2">
                You haven't submitted any bids yet
              </p>
              <p className="text-sm text-muted-foreground text-center">
                Browse available gigs and submit your first proposal
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {myBids
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
              .map((bid, index) => {
                const job = getJobForBid(bid.jobId);
                if (!job) return null;

                return (
                  <motion.div
                    key={bid.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={`transition-all duration-300 ${
                        bid.status === "hired"
                          ? "ring-2 ring-green-500 shadow-lg shadow-green-500/20"
                          : "hover:shadow-lg dark:hover:shadow-indigo-500/10"
                      }`}
                    >
                      <CardHeader>
                        <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle>{job.title}</CardTitle>
                              <Badge
                                variant="outline"
                                className={getStatusColor(bid.status)}
                              >
                                {getStatusIcon(bid.status)}
                                <span className="ml-1">
                                  {bid.status.charAt(0).toUpperCase() +
                                    bid.status.slice(1)}
                                </span>
                              </Badge>
                            </div>
                            <CardDescription className="line-clamp-2">
                              {job.description}
                            </CardDescription>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                              ${bid.amount.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Your bid
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div>
                            <h4 className="text-sm font-semibold mb-1">
                              Your Proposal
                            </h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {bid.proposal}
                            </p>
                          </div>

                          {bid.status === "hired" && (
                            <motion.div
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20 mt-3"
                            >
                              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                              <div>
                                <p className="font-semibold text-green-600 dark:text-green-400">
                                  Congratulations! 🎉
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  You've been hired for this project
                                </p>
                              </div>
                            </motion.div>
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
    </div>
  );
}
