import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppStore } from "@/store";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function CallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, setAuthenticated } = useAppStore();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      toast.error("Authentication failed. Please try again.");
      navigate("/");
      return;
    }

    if (token) {
      localStorage.setItem("access_token", token);
      api
        .get("/users/me")
        .then((response) => {
          setUser(response.data);
          setAuthenticated(true);
          toast.success("Welcome to StereoDNA!");
          navigate("/dashboard");
        })
        .catch(() => {
          toast.error("Failed to load user data");
          localStorage.removeItem("access_token");
          navigate("/");
        });
    } else {
      navigate("/");
    }
  }, [searchParams, navigate, setUser, setAuthenticated]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-5">
        <div className="w-5 h-5 border border-primary/30 border-t-primary rounded-full animate-spin" />
        <div className="text-center space-y-1">
          <p className="text-xs uppercase tracking-widest text-text-muted">
            Connecting
          </p>
          <p className="text-[11px] text-text-dim">Syncing your Spotify data</p>
        </div>
      </div>
    </div>
  );
}
