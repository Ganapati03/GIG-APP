import { useState } from "react";
import { Search, Briefcase, DollarSign, Clock, Filter, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { useAppContext } from "../GigFlowApp";
import { BidDialog } from "./BidDialog";
import { motion } from "motion/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "../ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";

type SortOption = "newest" | "oldest" | "budget-high" | "budget-low" | "bids-high" | "bids-low";

export function GigFeed() {
  const { jobs, bids, currentUserId } = useAppContext();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [budgetRange, setBudgetRange] = useState<[number, number]>([0, 10000]);
  const [showFilters, setShowFilters] = useState(false);

  const openJobs = jobs.filter((job) => job.status === "open");
  
  // Apply search filter
  let filteredJobs = openJobs.filter((job) =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Apply budget filter
  filteredJobs = filteredJobs.filter((job) =>
    job.budget >= budgetRange[0] && job.budget <= budgetRange[1]
  );

  // Apply sorting
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    const getBidCount = (jobId: string) => bids.filter((bid) => bid.jobId === jobId).length;
    
    switch (sortBy) {
      case "newest":
        return b.createdAt.getTime() - a.createdAt.getTime();
      case "oldest":
        return a.createdAt.getTime() - b.createdAt.getTime();
      case "budget-high":
        return b.budget - a.budget;
      case "budget-low":
        return a.budget - b.budget;
      case "bids-high":
        return getBidCount(b.id) - getBidCount(a.id);
      case "bids-low":
        return getBidCount(a.id) - getBidCount(b.id);
      default:
        return 0;
    }
  });

  const getMyBidForJob = (jobId: string) => {
    return bids.find(
      (bid) => bid.jobId === jobId && bid.freelancerId === currentUserId
    );
  };

  const getTimeSincePost = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return "Just now";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Browse Gigs</h1>
        <p className="text-muted-foreground mt-1">
          Find your next opportunity and submit winning proposals
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search gigs by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="sm:w-auto" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-indigo-500" />
          <span className="text-sm">
            <strong>{openJobs.length}</strong> open gigs
          </span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-green-500" />
          <span className="text-sm">
            <strong>
              ${openJobs.reduce((sum, job) => sum + job.budget, 0).toLocaleString()}
            </strong>{" "}
            total value
          </span>
        </div>
      </div>

      {/* Gig Cards */}
      {sortedJobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              {searchQuery ? "No gigs match your search" : "No open gigs available"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sortedJobs.map((job, index) => {
            const myBid = getMyBidForJob(job.id);
            const bidCount = bids.filter((bid) => bid.jobId === job.id).length;

            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg dark:hover:shadow-indigo-500/10 transition-all duration-300 group">
                  <CardHeader>
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <CardTitle className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {job.title}
                          </CardTitle>
                          <Badge
                            variant="secondary"
                            className="bg-green-500/10 text-green-600 dark:text-green-400"
                          >
                            Open
                          </Badge>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {job.description}
                        </CardDescription>

                        <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {getTimeSincePost(job.createdAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            {bidCount} {bidCount === 1 ? "bid" : "bids"}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-start lg:items-end gap-3">
                        <div>
                          <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                            ${job.budget.toLocaleString()}
                          </div>
                          <p className="text-xs text-muted-foreground text-right mt-1">
                            Fixed price
                          </p>
                        </div>

                        {myBid ? (
                          <Badge
                            variant="outline"
                            className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                          >
                            Bid Submitted
                          </Badge>
                        ) : (
                          <Button
                            onClick={() => setSelectedJobId(job.id)}
                            className="w-full lg:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                          >
                            Bid Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Bid Dialog */}
      {selectedJobId && (
        <BidDialog
          jobId={selectedJobId}
          open={!!selectedJobId}
          onOpenChange={(open) => !open && setSelectedJobId(null)}
        />
      )}

      {/* Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-4">Filters</h2>
          <div className="mb-4">
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Budget Range</Label>
            <Slider
              value={budgetRange}
              onValueChange={setBudgetRange}
              max={10000}
              step={100}
              className="mt-2"
            />
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
              <span>${budgetRange[0]}</span>
              <span>${budgetRange[1]}</span>
            </div>
          </div>
          <div className="mb-4">
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sort By</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  {sortBy}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                  <DropdownMenuRadioItem value="newest">
                    Newest
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="oldest">
                    Oldest
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="budget-high">
                    Budget High
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="budget-low">
                    Budget Low
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="bids-high">
                    Bids High
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="bids-low">
                    Bids Low
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </div>
  );
}