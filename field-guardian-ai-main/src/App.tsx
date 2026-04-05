import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import ParticleSystem from "@/components/ParticleSystem";
import AIChatbot from "@/components/AIChatbot";
import Index from "./pages/Index.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Detect from "./pages/Detect.tsx";
import History from "./pages/History.tsx";
import Weather from "./pages/Weather.tsx";
import Profile from "./pages/Profile.tsx";
import Auth from "./pages/Auth.tsx";
import SignOut from "./pages/SignOut.tsx";
import Problem from "./pages/Problem.tsx";
import Community from "./pages/Community.tsx";
import IoTDashboard from "./pages/IoTDashboard.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ParticleSystem />
        <Navbar />
        <div className="relative" style={{ zIndex: 2 }}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/problem" element={<Problem />} />
            <Route path="/detect" element={<Detect />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/community" element={<Community />} />
            <Route path="/iot-dashboard" element={<IoTDashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/signout" element={<SignOut />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <AIChatbot />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
