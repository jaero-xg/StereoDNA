import { Link, useLocation } from "react-router-dom";
import { useAppStore } from "@/store";
import { LayoutDashboard, User, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAppStore();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/profile", label: "Profile", icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link
            to="/"
            className="text-sm font-normal tracking-widest text-text-muted uppercase"
          >
            StereoDNA
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated &&
              navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-xs tracking-wide uppercase transition-colors ${
                    isActive(item.path)
                      ? "text-text"
                      : "text-text-dim hover:text-text-muted"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {user?.avatar && (
                  <img
                    src={user.avatar}
                    alt={user.displayName}
                    className="w-6 h-6 rounded-full opacity-80"
                  />
                )}
                <span className="text-xs text-text-dim">
                  {user?.displayName}
                </span>
                <button
                  onClick={logout}
                  className="text-text-dim hover:text-text-muted transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => (window.location.href = "/api/auth/spotify")}
                className="text-xs text-primary hover:text-primary/80 transition-colors tracking-wide"
              >
                Connect Spotify
              </button>
            )}
          </div>

          <button
            className="md:hidden text-text-dim hover:text-text-muted transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-surface border-b border-border">
          <div className="px-4 py-3 space-y-1">
            {isAuthenticated &&
              navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-2 py-2 text-xs uppercase tracking-wide ${
                    isActive(item.path) ? "text-text" : "text-text-dim"
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              ))}
            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 px-2 py-2 text-xs uppercase tracking-wide text-text-dim w-full"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            ) : (
              <button
                onClick={() => (window.location.href = "/api/auth/spotify")}
                className="px-2 py-2 text-xs text-primary tracking-wide"
              >
                Connect Spotify
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
