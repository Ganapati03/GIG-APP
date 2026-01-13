import { useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Bell, User, Briefcase, Search, LogOut, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useAppContext } from "./GigFlowApp";
import { useAuth } from "./AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { motion, AnimatePresence } from "motion/react";
import { Menu } from "lucide-react";

export function Navigation() {
  const { theme, setTheme } = useTheme();
  const { notifications, setCurrentView, currentView } = useAppContext();
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.length;

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <h1 className="font-bold text-2xl bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              GigFlow
            </h1>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-2">
              {(user?.role === "freelancer" || user?.role === "both") && (
                <>
                  <Button
                    variant={currentView === "gig-feed" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentView("gig-feed")}
                  >
                    Browse Gigs
                  </Button>
                  <Button
                    variant={currentView === "my-bids" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentView("my-bids")}
                  >
                    My Bids
                  </Button>
                </>
              )}
              
              {(user?.role === "client" || user?.role === "both") && (
                <Button
                  variant={currentView === "client-dashboard" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentView("client-dashboard")}
                >
                  My Jobs
                </Button>
              )}

              <Button
                variant={currentView === "messages" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setCurrentView("messages")}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Messages
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search gigs..."
                className="pl-10 bg-muted/50"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Post Job Button */}
            {(user?.role === "client" || user?.role === "both") && (
              <Button
                size="sm"
                className="hidden sm:flex bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                onClick={() => setCurrentView("client-dashboard")}
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Post a Job
              </Button>
            )}

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="relative"
            >
              <AnimatePresence mode="wait">
                {theme === "dark" ? (
                  <motion.div
                    key="moon"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="sun"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Badge className="h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  </motion.div>
                )}
              </Button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
                  >
                    <div className="p-4 border-b border-border">
                      <h3 className="font-semibold">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className="p-4 border-b border-border hover:bg-muted/50 transition-colors"
                          >
                            <p className="text-sm">{notif.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notif.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email || ""}</p>
                    {user?.role && (
                      <div className="flex gap-1 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {user.role === "both" ? "Client & Freelancer" : user.role}
                        </Badge>
                      </div>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(user?.role === "client" || user?.role === "both") && (
                  <DropdownMenuItem onClick={() => setCurrentView("client-dashboard")}>
                    <Briefcase className="h-4 w-4 mr-2" />
                    My Jobs
                  </DropdownMenuItem>
                )}
                {(user?.role === "freelancer" || user?.role === "both") && (
                  <DropdownMenuItem onClick={() => setCurrentView("my-bids")}>
                    <User className="h-4 w-4 mr-2" />
                    My Bids
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setCurrentView("messages")}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Messages
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={async () => {
                    await logout();
                    window.location.reload(); // Refresh to show login page
                  }}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <div className="md:hidden ml-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle className="text-left font-bold text-2xl bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                      GigFlow
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-4 mt-6">
                    {/* Mobile Search */}
                    <div className="relative w-full">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search gigs..."
                        className="pl-10 bg-muted/50"
                      />
                    </div>

                    {/* Mobile Nav Links */}
                    {(user?.role === "freelancer" || user?.role === "both") && (
                      <>
                        <Button
                          variant={currentView === "gig-feed" ? "secondary" : "ghost"}
                          className="justify-start"
                          onClick={() => setCurrentView("gig-feed")}
                        >
                          Browse Gigs
                        </Button>
                        <Button
                          variant={currentView === "my-bids" ? "secondary" : "ghost"}
                          className="justify-start"
                          onClick={() => setCurrentView("my-bids")}
                        >
                          My Bids
                        </Button>
                      </>
                    )}
                    
                    {(user?.role === "client" || user?.role === "both") && (
                      <Button
                        variant={currentView === "client-dashboard" ? "secondary" : "ghost"}
                        className="justify-start"
                        onClick={() => setCurrentView("client-dashboard")}
                      >
                       My Jobs
                      </Button>
                    )}

                    <Button
                      variant={currentView === "messages" ? "secondary" : "ghost"}
                      className="justify-start"
                      onClick={() => setCurrentView("messages")}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Messages
                    </Button>

                     {(user?.role === "client" || user?.role === "both") && (
                      <Button
                        className="justify-start bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                        onClick={() => setCurrentView("client-dashboard")}
                      >
                        <Briefcase className="h-4 w-4 mr-2" />
                        Post a Job
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}