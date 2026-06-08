import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store";
import {
  BarChart3,
  Flame,
  Brain,
  Sparkles,
  TrendingUp,
  Clock,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const features = [
  {
    icon: BarChart3,
    title: "Deep Analytics",
    description:
      "Visualize listening habits with interactive charts and insights.",
  },
  {
    icon: Flame,
    title: "Listening Heatmap",
    description: "See when you listen most with a GitHub-style activity grid.",
  },
  {
    icon: Brain,
    title: "AI Personality",
    description: "Discover your music archetype through personality analysis.",
  },
  {
    icon: Sparkles,
    title: "Music Roast",
    description:
      "Get humorously roasted about your questionable music choices.",
  },
  {
    icon: TrendingUp,
    title: "Trend Tracking",
    description: "Watch your taste evolve over time with detailed trends.",
  },
  {
    icon: Clock,
    title: "Real-time Stats",
    description: "Track streaks, peak hours, and daily listening averages.",
  },
];

export default function LandingPage() {
  const { isAuthenticated } = useAppStore();
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard");
  }, [isAuthenticated, navigate]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch("/api/health", {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        window.location.href = "/api/auth/spotify";
      } else {
        throw new Error();
      }
    } catch {
      try {
        await fetch("http://localhost:3001/api/health", {
          method: "GET",
          mode: "no-cors",
        });
        window.location.href = "http://localhost:3001/api/auth/spotify";
        return;
      } catch {
        toast.error(
          "Cannot connect to backend server. Make sure it is running on port 3001.",
        );
        setIsConnecting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <span className="tag-pill">Powered by Spotify</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extralight tracking-tight text-text leading-none mb-6">
          Decode Your
          <br />
          <span className="text-primary">Music DNA</span>
        </h1>
        <p className="text-text-muted text-base max-w-lg leading-relaxed mb-10">
          Discover patterns hidden in your playlists. Visualize listening
          habits, uncover your musical personality, and get roasted for your
          guilty pleasures.
        </p>
        <div className="flex items-center gap-4">
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="px-6 py-2.5 rounded-lg bg-primary text-background text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isConnecting ? "Connecting..." : "Connect Spotify"}
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2.5 rounded-lg border border-border text-sm text-text-muted hover:text-text hover:border-text-dim transition-colors"
          >
            View Demo
          </button>
        </div>
      </section>

      <div className="border-t border-border" />

      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <p className="section-label mb-10">What you get</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {features.map((feature) => (
            <div key={feature.title} className="bg-background p-6 space-y-3">
              <feature.icon className="w-4 h-4 text-primary" />
              <p className="text-sm text-text font-medium">{feature.title}</p>
              <p className="text-[12px] text-text-dim leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="border-t border-border" />

      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-extralight text-text mb-4">
          Ready to start?
        </h2>
        <p className="text-text-dim text-sm mb-8 max-w-sm">
          Connect your Spotify account and unlock insights about your listening
          habits.
        </p>
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="px-6 py-2.5 rounded-lg bg-primary text-background text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isConnecting ? "Connecting..." : "Get Started Free"}
        </button>
      </section>

      <footer className="border-t border-border py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-xs text-text-dim uppercase tracking-widest">
            StereoDNA
          </span>
          <p className="text-xs text-text-dim">Not affiliated with Spotify.</p>
        </div>
      </footer>
    </div>
  );
}
