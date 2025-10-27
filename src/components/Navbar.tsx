import { Link, useLocation } from "react-router-dom";
import { Home, Gamepad2, Receipt, HelpCircle, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

export const Navbar = () => {
  const location = useLocation();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Gagal logout. Silakan coba lagi.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Berhasil",
        description: "Anda telah logout.",
      });
    }
  };

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/games", label: "Game", icon: Gamepad2 },
    ...(user ? [
      { path: "/vault", label: "Vault", icon: Receipt },
      { path: "/auth", label: "Profile", icon: User }
    ] : []),
    { path: "/help", label: "Help", icon: HelpCircle },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-gradient">Cool Top-Pay</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant="ghost"
                    className={`flex items-center space-x-2 ${
                      isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-2">
            {user ? (
              <>
                <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-lg bg-card border border-border">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-sm">Halo, {user.email?.split('@')[0]}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline ml-2">Logout</span>
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm" className="bg-primary text-primary-foreground hover:bg-primary-glow">
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};