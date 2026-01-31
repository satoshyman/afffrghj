import { Link, useLocation } from "wouter";
import { Gamepad2, Users, Wallet, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Game", icon: Gamepad2 },
    { href: "/tasks", label: "Tasks", icon: ListTodo },
    { href: "/referrals", label: "Friends", icon: Users },
    { href: "/wallet", label: "Wallet", icon: Wallet },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-white/10 pb-safe">
      <div className="flex justify-around items-center h-20 px-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={cn(
                  "flex flex-col items-center justify-center gap-1 w-16 cursor-pointer transition-all duration-200",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-white"
                )}
                whileTap={{ scale: 0.9 }}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <motion.div 
                  className={cn(
                    "p-2 rounded-xl transition-all",
                    isActive && "bg-primary/15 neon-border-blue"
                  )}
                  animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.5, repeat: isActive ? Infinity : 0, repeatDelay: 2 }}
                >
                  <item.icon className={cn("w-5 h-5", isActive && "animate-icon-pulse")} />
                </motion.div>
                <span className="text-[10px] font-bold">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
