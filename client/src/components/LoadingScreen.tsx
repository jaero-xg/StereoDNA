export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-6 h-6 border border-primary/40 border-t-primary rounded-full animate-spin" />
        <p className="text-[11px] uppercase tracking-widest text-text-dim">
          StereoDNA
        </p>
      </div>
    </div>
  );
}
