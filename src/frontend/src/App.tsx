import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Clock,
  Gamepad2,
  Home,
  Play,
  Search,
  Settings,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Game {
  id: number;
  name: string;
  cover: string;
  url: string;
  featured?: boolean;
}

interface RecentGame {
  id: number;
  name: string;
  cover: string;
}

interface AppSettings {
  darkMode: boolean;
  panicKey: string;
}

const COVER_BASE = "https://cdn.jsdelivr.net/gh/gn-math/covers@main";
const HTML_BASE = "https://cdn.jsdelivr.net/gh/gn-math/html@main";
const RECENT_KEY = "ig_recently_played";
const SETTINGS_KEY = "ig_settings";
const SKELETON_KEYS = Array.from({ length: 20 }, (_, i) => `skel-${i}`);

// ─── Particle Canvas ──────────────────────────────────────────────────────────
function ParticleCanvas({ darkMode }: { darkMode: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let width = canvas.width;
    let height = canvas.height;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      width = canvas.width;
      height = canvas.height;
    };
    window.addEventListener("resize", resize);

    const COUNT = 80;
    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      size: Math.random() * 2.5 + 0.5,
      hue: Math.random() > 0.5 ? 285 : 205,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        const alpha = darkMode ? 0.7 : 0.5;
        ctx.fillStyle =
          p.hue === 285
            ? `rgba(168,85,247,${alpha})`
            : `rgba(0,212,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const lineAlpha = (1 - dist / 120) * (darkMode ? 0.3 : 0.15);
            const mixed = (particles[i].hue + particles[j].hue) / 2;
            if (mixed > 250) {
              ctx.strokeStyle = `rgba(168,85,247,${lineAlpha})`;
            } else if (mixed < 240) {
              ctx.strokeStyle = `rgba(0,212,255,${lineAlpha})`;
            } else {
              ctx.strokeStyle = `rgba(100,150,255,${lineAlpha})`;
            }
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [darkMode]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: darkMode ? 1 : 0.6 }}
    />
  );
}

// ─── Game Card ────────────────────────────────────────────────────────────────
function GameCard({
  game,
  onPlay,
  index,
}: {
  game: Game;
  onPlay: (game: Game) => void;
  index: number;
}) {
  const [imgError, setImgError] = useState(false);
  const coverUrl = game.cover.replace("{COVER_URL}", COVER_BASE);
  const ocid = index <= 20 ? `games.item.${index}` : undefined;

  return (
    <button
      type="button"
      data-ocid={ocid}
      className="game-card group relative bg-card border border-border rounded-lg overflow-hidden cursor-pointer flex flex-col text-left"
      onClick={() => onPlay(game)}
    >
      <div className="relative aspect-square overflow-hidden bg-muted w-full">
        {!imgError ? (
          <img
            src={coverUrl}
            alt={game.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Gamepad2
              className="w-12 h-12"
              style={{ color: "#a855f7", opacity: 0.6 }}
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span
            className="font-display text-xs tracking-widest flex items-center gap-1 px-3 py-1.5 rounded"
            style={{
              background: "linear-gradient(135deg, #00d4ff, #a855f7)",
              color: "white",
              boxShadow: "0 0 20px rgba(168,85,247,0.6)",
            }}
          >
            <Play className="w-3 h-3" />
            PLAY
          </span>
        </div>
      </div>
      <div className="p-2 flex-1 flex flex-col justify-between">
        <p className="text-xs font-body font-semibold leading-tight line-clamp-2 text-foreground/90">
          {game.name}
        </p>
      </div>
    </button>
  );
}

// ─── Recently Played Card ─────────────────────────────────────────────────────
function RecentCard({
  game,
  onPlay,
  index,
}: {
  game: RecentGame;
  onPlay: (id: number) => void;
  index: number;
}) {
  const [imgError, setImgError] = useState(false);
  const coverUrl = game.cover.replace("{COVER_URL}", COVER_BASE);

  return (
    <button
      type="button"
      data-ocid={`recently_played.item.${index}`}
      className="game-card flex-shrink-0 w-28 cursor-pointer group text-left"
      onClick={() => onPlay(game.id)}
    >
      <div className="relative w-28 h-28 rounded-md overflow-hidden border border-border">
        {!imgError ? (
          <img
            src={coverUrl}
            alt={game.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Gamepad2
              className="w-8 h-8"
              style={{ color: "#a855f7", opacity: 0.6 }}
            />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
          <Play style={{ color: "#00d4ff", width: 24, height: 24 }} />
        </div>
      </div>
      <p className="text-xs font-body text-center mt-1 line-clamp-2 text-muted-foreground group-hover:text-foreground transition-colors">
        {game.name}
      </p>
    </button>
  );
}

// ─── Settings Panel ───────────────────────────────────────────────────────────
function SettingsPanel({
  open,
  onClose,
  darkMode,
  onDarkModeToggle,
  panicKey,
  onPanicKeyChange,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  darkMode: boolean;
  onDarkModeToggle: (v: boolean) => void;
  panicKey: string;
  onPanicKeyChange: (v: string) => void;
  onSave: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Close settings"
        className="flex-1 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
      />
      {/* Panel */}
      <div
        data-ocid="settings.panel"
        className="w-80 h-full flex flex-col bg-card border-l border-border animate-slide-in-right"
        style={{ boxShadow: "-4px 0 40px rgba(168,85,247,0.2)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2
            className="font-display text-sm tracking-widest"
            style={{
              color: "#a855f7",
              textShadow: "0 0 10px rgba(168,85,247,0.6)",
            }}
          >
            ⚙ SETTINGS
          </h2>
          <button
            type="button"
            data-ocid="settings.close_button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 space-y-6 overflow-y-auto">
          {/* Dark Mode */}
          <div className="space-y-3">
            <h3 className="font-display text-xs tracking-widest text-muted-foreground">
              DISPLAY
            </h3>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
              <Label
                className="font-body font-semibold text-sm cursor-pointer"
                htmlFor="dark-mode-switch"
              >
                Dark Mode
              </Label>
              <Switch
                id="dark-mode-switch"
                data-ocid="settings.toggle"
                checked={darkMode}
                onCheckedChange={onDarkModeToggle}
              />
            </div>
          </div>

          {/* Panic Key */}
          <div className="space-y-3">
            <h3 className="font-display text-xs tracking-widest text-muted-foreground">
              PANIC KEY
            </h3>
            <p className="text-xs text-muted-foreground font-body">
              Press this key anywhere to instantly redirect to Google.
            </p>
            <Input
              data-ocid="settings.input"
              value={panicKey}
              onChange={(e) => onPanicKeyChange(e.target.value.slice(-1))}
              placeholder="Single key (e.g. P)"
              maxLength={1}
              className="font-mono-game text-center text-lg tracking-widest"
              style={{
                borderColor: "#a855f7",
                boxShadow: "0 0 8px rgba(168,85,247,0.2)",
              }}
            />
            <p className="text-xs text-muted-foreground/60 font-body">
              Single character (e.g. F, P, Escape)
            </p>
          </div>

          {/* Info */}
          <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
            <p
              className="text-xs font-display tracking-widest"
              style={{ color: "#00d4ff" }}
            >
              TAB CLOAKING
            </p>
            <p className="text-xs text-muted-foreground font-body">
              Tab appears as "Google" with Google favicon to stay discreet.
            </p>
          </div>
        </div>

        {/* Save */}
        <div className="p-5 border-t border-border">
          <Button
            type="button"
            data-ocid="settings.save_button"
            onClick={onSave}
            className="w-full font-display text-xs tracking-widest"
            style={{
              background: "linear-gradient(135deg, #00d4ff, #a855f7)",
              border: "none",
              color: "white",
              boxShadow: "0 0 15px rgba(168,85,247,0.4)",
            }}
          >
            <Zap className="w-3 h-3 mr-2" />
            SAVE SETTINGS
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const s = localStorage.getItem(SETTINGS_KEY);
      if (s) return (JSON.parse(s) as AppSettings).darkMode ?? true;
    } catch {
      /* empty */
    }
    return true;
  });
  const [panicKey, setPanicKey] = useState<string>(() => {
    try {
      const s = localStorage.getItem(SETTINGS_KEY);
      if (s) return (JSON.parse(s) as AppSettings).panicKey ?? "";
    } catch {
      /* empty */
    }
    return "";
  });

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentGame[]>(() => {
    try {
      const r = localStorage.getItem(RECENT_KEY);
      if (r) return JSON.parse(r) as RecentGame[];
    } catch {
      /* empty */
    }
    return [];
  });

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const homeRef = useRef<HTMLDivElement>(null);
  const gamesRef = useRef<HTMLDivElement>(null);
  const recentRef = useRef<HTMLDivElement>(null);

  // Tab cloaking
  useEffect(() => {
    document.title = "Google";
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = "https://www.google.com/favicon.ico";
  }, []);

  // Apply dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Panic key listener
  useEffect(() => {
    if (!panicKey) return;
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === panicKey ||
        e.key.toLowerCase() === panicKey.toLowerCase()
      ) {
        window.location.href = "https://www.google.com";
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [panicKey]);

  // Fetch games
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await fetch(
          "https://cdn.jsdelivr.net/gh/gn-math/assets@main/zones.json",
        );
        if (!res.ok) throw new Error("Failed to fetch games");
        const data = (await res.json()) as Game[];
        setGames(data.filter((g) => g.id !== -1));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  const addToRecentlyPlayed = useCallback((game: Game) => {
    setRecentlyPlayed((prev) => {
      const filtered = prev.filter((r) => r.id !== game.id);
      const updated = [
        { id: game.id, name: game.name, cover: game.cover },
        ...filtered,
      ].slice(0, 10);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const playGame = useCallback(
    async (game: Game) => {
      addToRecentlyPlayed(game);
      const resolvedUrl = game.url.startsWith("http")
        ? game.url
        : game.url.replace("{HTML_URL}", HTML_BASE);

      if (game.url.startsWith("http")) {
        window.open(resolvedUrl, "_blank");
      } else {
        const popup = window.open("about:blank", "_blank");
        if (!popup) return;
        try {
          const html = await fetch(resolvedUrl).then((r) => r.text());
          popup.document.open();
          popup.document.write(html);
          popup.document.close();
        } catch {
          popup.close();
          window.open(resolvedUrl, "_blank");
        }
      }
    },
    [addToRecentlyPlayed],
  );

  const playById = useCallback(
    (id: number) => {
      const game = games.find((g) => g.id === id);
      if (game) playGame(game);
    },
    [games, playGame],
  );

  const saveSettings = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ darkMode, panicKey }));
    setSettingsOpen(false);
  };

  const scrollTo = (
    ref: React.RefObject<HTMLDivElement | null>,
    section: string,
  ) => {
    setActiveSection(section);
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  const filteredGames = games.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen relative" data-ocid="home.page">
      <ParticleCanvas darkMode={darkMode} />

      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b border-border glass"
        style={{
          background: darkMode ? "rgba(8,8,20,0.85)" : "rgba(240,240,255,0.85)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          {/* Logo as button */}
          <button
            type="button"
            className="flex items-center gap-2 mr-4 flex-shrink-0 bg-transparent border-0 p-0"
            onClick={() => scrollTo(homeRef, "home")}
          >
            <span className="font-display text-lg font-black tracking-wider gradient-text">
              ∞ INFINITE GAMES
            </span>
          </button>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1 flex-shrink-0">
            <button
              type="button"
              data-ocid="header.link.1"
              onClick={() => scrollTo(homeRef, "home")}
              className={`px-3 py-1.5 rounded font-display text-xs tracking-widest transition-all ${
                activeSection === "home"
                  ? "text-neon-blue"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              style={
                activeSection === "home"
                  ? { textShadow: "0 0 10px #00d4ff" }
                  : {}
              }
            >
              <Home className="inline w-3 h-3 mr-1" />
              HOME
            </button>
            <button
              type="button"
              data-ocid="header.link.2"
              onClick={() => scrollTo(gamesRef, "games")}
              className={`px-3 py-1.5 rounded font-display text-xs tracking-widest transition-all ${
                activeSection === "games"
                  ? "text-neon-blue"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              style={
                activeSection === "games"
                  ? { textShadow: "0 0 10px #00d4ff" }
                  : {}
              }
            >
              <Gamepad2 className="inline w-3 h-3 mr-1" />
              GAMES
            </button>
            <button
              type="button"
              data-ocid="header.link.3"
              onClick={() => scrollTo(recentRef, "recent")}
              className={`px-3 py-1.5 rounded font-display text-xs tracking-widest transition-all ${
                activeSection === "recent"
                  ? "text-neon-blue"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              style={
                activeSection === "recent"
                  ? { textShadow: "0 0 10px #00d4ff" }
                  : {}
              }
            >
              <Clock className="inline w-3 h-3 mr-1" />
              RECENT
            </button>
            <button
              type="button"
              data-ocid="header.link.4"
              onClick={() => setSettingsOpen(true)}
              className="px-3 py-1.5 rounded font-display text-xs tracking-widest text-muted-foreground hover:text-foreground transition-all"
            >
              <Settings className="inline w-3 h-3 mr-1" />
              SETTINGS
            </button>
          </nav>

          {/* Search */}
          <div className="flex-1 max-w-md relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "#00d4ff" }}
            />
            <Input
              data-ocid="search.search_input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search games..."
              className="pl-9 pr-9 font-body text-sm"
              style={{
                background: darkMode
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.05)",
                borderColor: search ? "#00d4ff" : undefined,
                boxShadow: search ? "0 0 10px rgba(0,212,255,0.3)" : undefined,
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Gear */}
          <button
            type="button"
            data-ocid="settings.open_modal_button"
            onClick={() => setSettingsOpen(true)}
            className="ml-auto p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-all hover:border-primary/50"
            style={{ flexShrink: 0 }}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Hero */}
        <section
          ref={homeRef}
          data-ocid="home.section"
          className="text-center py-12 space-y-4"
        >
          <h1
            className="font-display text-4xl md:text-6xl font-black tracking-widest"
            style={{
              background:
                "linear-gradient(135deg, #00d4ff 0%, #a855f7 50%, #00d4ff 100%)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "gradient-shift 4s ease infinite",
              textShadow: "none",
            }}
          >
            ∞ INFINITE GAMES
          </h1>
          <p className="font-body text-base text-muted-foreground max-w-lg mx-auto">
            Your gateway to endless gaming. Hundreds of games, one click away.
          </p>
          <div className="flex items-center justify-center gap-3">
            <div
              className="h-px flex-1 max-w-24"
              style={{
                background: "linear-gradient(90deg, transparent, #00d4ff)",
              }}
            />
            <span
              className="font-display text-xs tracking-widest"
              style={{ color: "#a855f7" }}
            >
              {loading ? "LOADING..." : `${games.length} GAMES`}
            </span>
            <div
              className="h-px flex-1 max-w-24"
              style={{
                background: "linear-gradient(90deg, #a855f7, transparent)",
              }}
            />
          </div>
        </section>

        {/* Recently Played */}
        {recentlyPlayed.length > 0 && (
          <section ref={recentRef} data-ocid="recently_played.section">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-4 h-4" style={{ color: "#00d4ff" }} />
              <h2
                className="font-display text-sm tracking-widest"
                style={{
                  color: "#00d4ff",
                  textShadow: "0 0 10px rgba(0,212,255,0.5)",
                }}
              >
                RECENTLY PLAYED
              </h2>
              <div
                className="h-px flex-1"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(0,212,255,0.4), transparent)",
                }}
              />
            </div>
            <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-neon">
              {recentlyPlayed.map((g, i) => (
                <RecentCard
                  key={g.id}
                  game={g}
                  onPlay={playById}
                  index={i + 1}
                />
              ))}
            </div>
          </section>
        )}

        {/* Games Grid */}
        <section ref={gamesRef} data-ocid="games.section">
          <div className="flex items-center gap-3 mb-5">
            <Gamepad2 className="w-4 h-4" style={{ color: "#a855f7" }} />
            <h2
              className="font-display text-sm tracking-widest"
              style={{
                color: "#a855f7",
                textShadow: "0 0 10px rgba(168,85,247,0.5)",
              }}
            >
              {search ? `RESULTS: "${search}"` : "ALL GAMES"}
            </h2>
            <span className="font-mono-game text-xs text-muted-foreground">
              {filteredGames.length}
            </span>
            <div
              className="h-px flex-1"
              style={{
                background:
                  "linear-gradient(90deg, rgba(168,85,247,0.4), transparent)",
              }}
            />
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div
              data-ocid="games.loading_state"
              className="grid gap-3"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              }}
            >
              {SKELETON_KEYS.map((key) => (
                <div key={key} className="rounded-lg overflow-hidden">
                  <Skeleton className="aspect-square w-full skeleton-pulse" />
                  <Skeleton className="h-3 w-3/4 mt-2 mx-2 skeleton-pulse" />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              data-ocid="games.error_state"
              className="text-center py-16 space-y-4"
            >
              <p className="font-display text-sm tracking-widest text-destructive">
                FAILED TO LOAD GAMES
              </p>
              <p className="font-body text-sm text-muted-foreground">{error}</p>
              <Button
                type="button"
                onClick={() => window.location.reload()}
                className="font-display text-xs tracking-widest"
                style={{
                  background: "linear-gradient(135deg, #00d4ff, #a855f7)",
                  border: "none",
                  color: "white",
                }}
              >
                RETRY
              </Button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filteredGames.length === 0 && (
            <div
              data-ocid="games.empty_state"
              className="text-center py-16 space-y-3"
            >
              <Gamepad2
                className="w-12 h-12 mx-auto"
                style={{ color: "#a855f7", opacity: 0.4 }}
              />
              <p className="font-display text-sm tracking-widest text-muted-foreground">
                NO GAMES FOUND
              </p>
              <p className="font-body text-sm text-muted-foreground/60">
                Try a different search term
              </p>
            </div>
          )}

          {/* Grid */}
          {!loading && !error && filteredGames.length > 0 && (
            <div
              className="grid gap-3"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              }}
            >
              {filteredGames.map((game, i) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onPlay={playGame}
                  index={i + 1}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-6 mt-16">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <span className="font-display text-xs tracking-widest gradient-text">
            ∞ INFINITE GAMES
          </span>
          <p className="font-body text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with ❤ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
              style={{ color: "#a855f7" }}
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      {/* Settings Panel */}
      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        darkMode={darkMode}
        onDarkModeToggle={setDarkMode}
        panicKey={panicKey}
        onPanicKeyChange={setPanicKey}
        onSave={saveSettings}
      />

      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .text-neon-blue { color: #00d4ff; }
        .text-neon-purple { color: #a855f7; }
      `}</style>
    </div>
  );
}
