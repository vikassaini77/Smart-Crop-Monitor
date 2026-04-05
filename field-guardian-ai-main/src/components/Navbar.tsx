import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, LayoutDashboard, User, CloudSun, Scan, History, LogIn, LogOut, AlertTriangle, Users, Activity } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const links = [
    { to: "/", label: "Home", icon: Leaf },
    { to: "/problem", label: "Why This Matters", icon: AlertTriangle },
    { to: "/detect", label: "Detect", icon: Scan },
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/history", label: "History", icon: History },
    { to: "/weather", label: "Weather", icon: CloudSun },
    { to: "/community", label: "Community", icon: Users },
    { to: "/iot-dashboard", label: "IoT Monitor", icon: Activity },
    ...(user
      ? [
          { to: "/profile", label: "Profile", icon: User },
          { to: "/signout", label: "Sign Out", icon: LogOut }
        ]
      : [{ to: "/auth", label: "Sign In", icon: LogIn }]),
  ];

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 glass-card border-b border-border/50"
      style={{ zIndex: 50 }}
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/20">
            <span className="text-lg">🌱</span>
          </div>
          <span className="font-display text-lg text-foreground hidden sm:inline">Smart Crop Monitor</span>
        </Link>

        <div className="flex items-center gap-1 overflow-x-auto">
          {links.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <link.icon className="w-4 h-4" />
                <span className="hidden lg:inline">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
