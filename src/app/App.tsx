import { ThemeProvider } from "next-themes";
import { Toaster } from "./components/ui/sonner";
import { GigFlowApp } from "./components/GigFlowApp";
import { AuthProvider } from "./components/AuthContext";

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <AuthProvider>
        <GigFlowApp />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}