// Main app — landing page with game grid + signup flow
const { useState: useAppState, useEffect: useAppEffect, useRef: useAppRef } = React;

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useAppState(() => window.innerWidth < breakpoint);
  useAppEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [breakpoint]);
  return isMobile;
}

function App() {
  const [tweaks, setTweak] = useTweaks(window.__TWEAK_DEFAULTS);
  const [activeGame, setActiveGame] = useAppState(null);

  // Lock palette to pure white + black
  useAppEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--ink", "#000000");
    root.style.setProperty("--paper", "#ffffff");
    root.style.setProperty("--line", "#e5e5e5");
    root.style.setProperty("--mute", "#7a7a7a");
  }, []);

  return (
    <div data-screen-label="01 Landing">
      <Header date={tweaks.festivalDate} />
      <Hero date={tweaks.festivalDate} location={tweaks.festivalLocation} displayFont={tweaks.displayFont} />
      <PrizeBanner />
      <VideoSection />
      <GameGrid onPick={setActiveGame} displayFont={tweaks.displayFont} />
      <Footer />

      {activeGame && (
        <SignupForm
          game={activeGame}
          onClose={() => setActiveGame(null)}
          onSubmit={() => {}}
        />
      )}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Tipografija" />
        <TweakRadio
          label="Naslov"
          value={tweaks.displayFont}
          onChange={(v) => setTweak("displayFont", v)}
          options={[
            { value: "Archivo Black", label: "Archivo" },
            { value: "Anton", label: "Anton" },
            { value: "Fraunces", label: "Fraunces" },
          ]}
        />
        <TweakSection label="Festival" />
        <TweakText label="Datum" value={tweaks.festivalDate} onChange={(v) => setTweak("festivalDate", v)} />
        <TweakText label="Lokacija" value={tweaks.festivalLocation} onChange={(v) => setTweak("festivalLocation", v)} />
      </TweaksPanel>
    </div>
  );
}

function Header({ date }) {
  const [menuOpen, setMenuOpen] = useAppState(false);

  return (
    <>
      <header style={{
        position: "sticky", top: 0, zIndex: 20,
        background: "#000000",
        color: "#ffffff",
        padding: "14px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img
            src="uploads/domski-odbor.png"
            alt="Domski odbor Cvjetno"
            style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", display: "block", border: "1px solid rgba(255,255,255,0.35)", flexShrink: 0 }}
          />
          <span className="mono" style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff" }}>
            Dani Cvjetnog · 26
          </span>
        </div>

        <nav className="nav-links mono" style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>
          <a href="#igre" style={{ color: "#fff", textDecoration: "none" }}>Igre</a>
          <a href="#videi" style={{ color: "inherit", textDecoration: "none" }}>Videi</a>
          <span style={{ color: "#fff" }}>{date}</span>
        </nav>

        <button
          className="hamburger-btn"
          onClick={() => setMenuOpen(true)}
          aria-label="Otvori meni"
        >
          <span className="ham-line" />
          <span className="ham-line" />
          <span className="ham-line" />
        </button>
      </header>

      {menuOpen && <MobileMenu date={date} onClose={() => setMenuOpen(false)} />}
    </>
  );
}

function MobileMenu({ date, onClose }) {
  const links = [
    { href: "#igre", label: "Igre" },
    { href: "#videi", label: "Videi" },
  ];

  return (
    <div className="mobile-overlay">
      <button
        className="mobile-close-btn"
        onClick={onClose}
        aria-label="Zatvori meni"
      >
        <span className="ham-line" style={{ transform: "rotate(45deg) translate(4.5px, 4.5px)" }} />
        <span className="ham-line" style={{ opacity: 0 }} />
        <span className="ham-line" style={{ transform: "rotate(-45deg) translate(4.5px, -4.5px)" }} />
      </button>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {links.map((link, i) => (
          <a
            key={link.href}
            href={link.href}
            className="menu-stagger-link"
            style={{ animationDelay: `${i * 90}ms` }}
            onClick={onClose}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className="menu-stagger-date" style={{ animationDelay: "320ms" }}>
        {date}
      </div>
    </div>
  );
}


function headerFontFamily(displayFont) {
  if (displayFont === "Anton") return '"Anton", Impact, sans-serif';
  if (displayFont === "Fraunces") return '"Fraunces", serif';
  return '"Archivo Black", "Helvetica Neue", sans-serif';
}

function HeroLogoDecoration() {
  return (
    <div style={{
      position: "absolute",
      right: -55,
      top: "50%",
      transform: "translateY(-48%) rotate(-12deg)",
      width: 360,
      height: 360,
      opacity: 0.22,
      pointerEvents: "none",
      zIndex: 0,
    }}>
      <svg
        width="360" height="360" viewBox="0 0 360 360"
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
        aria-hidden="true"
      >
        <defs>
          <path id="hero-logo-ring" d="M180,180 m-160,0 a160,160 0 1,1 320,0 a160,160 0 1,1-320,0" />
        </defs>
        <g className="hero-logo-spin">
          <text
            fontFamily='"JetBrains Mono", ui-monospace, monospace'
            fontSize="11"
            letterSpacing="7"
            fill="#000"
          >
            <textPath href="#hero-logo-ring">
              DOMSKI ODBOR CVJETNO · DOMSKI ODBOR CVJETNO · DOMSKI ODBOR CVJETNO ·
            </textPath>
          </text>
        </g>
      </svg>
      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 224, height: 224,
        borderRadius: "50%",
        overflow: "hidden",
        border: "1.5px solid rgba(0,0,0,0.25)",
      }}>
        <img
          src="uploads/domski-odbor.png"
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
    </div>
  );
}

function Hero({ date, location, displayFont }) {
  return (
    <section style={{
      paddingTop: "clamp(72px, 12vw, 120px)",
      paddingBottom: "clamp(64px, 8vw, 96px)",
      borderBottom: "1px solid var(--line)",
      position: "relative",
      overflow: "hidden",
      textAlign: "center",
    }}>
      <HeroLogoDecoration />

      <div style={{ position: "relative", zIndex: 1, padding: "0 24px", marginBottom: 36 }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--mute)" }}>
          Prijava na turnire · sezona 2026.
        </div>
      </div>

      <h1 style={{
        fontFamily: headerFontFamily(displayFont),
        fontSize: "clamp(36px, 13vw, 200px)",
        lineHeight: 0.86, margin: 0, fontWeight: 900,
        letterSpacing: "-0.025em",
        textTransform: "uppercase",
        textAlign: "center",
        position: "relative", zIndex: 1,
      }}>
        DANI<br/>CVJETNOG
      </h1>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
        <p style={{
          fontFamily: "Inter, sans-serif", fontSize: "clamp(15px, 1.5vw, 19px)",
          lineHeight: 1.6, margin: "48px 0 0", color: "var(--ink)", fontWeight: 400,
        }}>
          Devet igara, osam paviljona, jedan dan. Skupi ekipu, izaberi disciplinu i prijavi se prije nego popune mjesta.
        </p>

        <div className="mono" style={{
          fontSize: 11, letterSpacing: "0.16em", color: "var(--mute)",
          textTransform: "uppercase", marginTop: 40,
          display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap",
        }}>
          <span>{date}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{location}</span>
        </div>

        <a href="#igre" className="mono" style={{ fontSize: 11, letterSpacing: "0.2em", color: "var(--ink)", textTransform: "uppercase", marginTop: 56, display: "inline-block", textDecoration: "none" }}>
          ↓ Odaberi igru
        </a>
      </div>
    </section>
  );
}

function PrizeBanner() {
  return (
    <section style={{
      background: "#000",
      color: "#fff",
      padding: "clamp(48px, 7vw, 80px) 24px",
      textAlign: "center",
      borderBottom: "1px solid #222",
    }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <p style={{
          fontFamily: '"Archivo Black", "Helvetica Neue", sans-serif',
          fontSize: "clamp(32px, 6vw, 80px)",
          fontWeight: 900,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
          margin: 0,
        }}>
          Top 3 dobivaju<br />Dani Cvjetnog majicu :)
        </p>
        <p style={{
          fontFamily: '"Inter", system-ui, sans-serif',
          fontSize: "clamp(13px, 1.8vw, 18px)",
          fontWeight: 400,
          color: "rgba(255,255,255,0.55)",
          marginTop: "clamp(16px, 2vw, 24px)",
          marginBottom: 0,
          letterSpacing: "0.01em",
        }}>
          u svakoj igri posebno<br />+ ostale nagrade: boca u Zagsu, ulaznice i više
        </p>
      </div>
    </section>
  );
}

function VideoSection() {
  const videos = [
    {
      src: "uploads/video1.mp4",
      igLink: "https://www.instagram.com/reel/DXo5LArDFx7/?igsh=d2QzbXVpcDMxejNu",
      title: "Dođi na Dane Cvjetnog",
      description: "Cvita poziva u Cvjetno 29. svibnja, osam paviljona, devet igara, jedno mjesto gdje će biti gužva i biti će dobro. Prijave idu brzo, mjesta su ograničena pa nemoj čekati zadnji tren pa onda žaliti. Ekipa se skuplja, turniri se pune, a Cvita ne čeka nikoga.",
    },
    {
      src: "uploads/video2.mp4",
      igLink: "https://www.instagram.com/reel/DYAQHYxMXl5/?igsh=MXJmcDRsanBtMGMwMA==",
      title: "Koliko paviljona?",
      description: "Ovo je možda naš omiljeni video. Cvita je izašla na ulicu i pitala prolaznike koliko paviljona ima Cvjetno, i odgovori su bili... zanimljivi. Ima svega, od onih koji su sigurni u krivi broj, do onih koji su rekli nešto sasvim slučajno točno. Tko pogodi osvaja majicu, a tko ne, dođe 29.5. pa vidi uživo.",
    },
  ];

  return (
    <section id="videi" style={{ borderBottom: "1px solid var(--line)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 24px 40px" }}>
        <div className="vidi-header">
          <div />
          <h2 style={{
            fontFamily: '"Archivo Black", "Helvetica Neue", sans-serif',
            fontSize: "clamp(48px, 9vw, 120px)",
            fontWeight: 900, lineHeight: 0.9, margin: 0,
            letterSpacing: "-0.03em", textTransform: "uppercase",
            textAlign: "center",
          }}>
            Vidi što<br/>stiže
          </h2>
          <div className="vidi-header-link">
            <a
              href="https://www.instagram.com/cvjetno.odbor?igsh=MXh5eXEwMnkxOGJtcQ=="
              target="_blank"
              rel="noopener noreferrer"
              className="mono"
              style={{
                fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase",
                color: "var(--ink)", textDecoration: "none",
                border: "1px solid var(--ink)", padding: "10px 16px",
                display: "inline-flex", alignItems: "center", gap: 8,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5"/>
                <circle cx="12" cy="12" r="4.5"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
              @cvjetno.odbor
            </a>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 24px 16px" }}>
        {videos.map((v, i) => (
          <VideoCard key={i} {...v} number={i + 1} last={i === videos.length - 1} igLink={v.igLink} />
        ))}
      </div>
    </section>
  );
}

function VideoCard({ src, title, description, igLink, number, last }) {
  const videoRef = useAppRef(null);
  const barRef = useAppRef(null);
  const [playing, setPlaying] = useAppState(false);
  const [progress, setProgress] = useAppState(0);
  const [dragging, setDragging] = useAppState(false);

  useAppEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onEnded = () => setPlaying(false);
    const onTimeUpdate = () => { if (v.duration) setProgress(v.currentTime / v.duration); };
    v.addEventListener("ended", onEnded);
    v.addEventListener("timeupdate", onTimeUpdate);
    return () => {
      v.removeEventListener("ended", onEnded);
      v.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, []);

  function seekFromClientX(clientX) {
    const bar = barRef.current;
    const v = videoRef.current;
    if (!bar || !v || !v.duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min((clientX - rect.left) / rect.width, 1));
    v.currentTime = ratio * v.duration;
    setProgress(ratio);
  }

  useAppEffect(() => {
    if (!dragging) return;
    const onMove = (e) => seekFromClientX(e.clientX);
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (playing) {
      v.pause();
      setPlaying(false);
    } else {
      v.play().catch(() => {});
      setPlaying(true);
    }
  }

  return (
    <div className="video-card" style={{ borderBottom: last ? "none" : "1px solid var(--line)" }}>
      <div className="video-player" onClick={togglePlay} style={{ userSelect: "none" }}>
        <video
          ref={videoRef}
          src={src}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          playsInline
          preload="metadata"
        />
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: playing ? "transparent" : "rgba(0,0,0,0.28)",
          transition: "background 0.2s",
          pointerEvents: "none",
        }}>
          {!playing && (
            <div style={{
              width: 54, height: 54, borderRadius: "50%",
              border: "1.5px solid rgba(255,255,255,0.9)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path d="M5.5 3.5 L14.5 9 L5.5 14.5 Z" fill="#fff" />
              </svg>
            </div>
          )}
        </div>
        {/* Progress bar */}
        <div
          ref={barRef}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => { e.stopPropagation(); setDragging(true); seekFromClientX(e.clientX); }}
          onTouchStart={(e) => { e.stopPropagation(); seekFromClientX(e.touches[0].clientX); }}
          onTouchMove={(e) => { e.preventDefault(); seekFromClientX(e.touches[0].clientX); }}
          style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            height: 32, display: "flex", alignItems: "center",
            padding: "0 12px", cursor: "pointer",
            background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)",
          }}
        >
          <div style={{ position: "relative", width: "100%", height: 2, background: "rgba(255,255,255,0.3)", borderRadius: 2 }}>
            <div style={{
              position: "absolute", left: 0, top: 0, height: "100%",
              width: `${progress * 100}%`,
              background: "#fff", borderRadius: 2,
              transition: dragging ? "none" : "width 0.1s linear",
            }} />
            <div style={{
              position: "absolute", top: "50%",
              left: `${progress * 100}%`,
              transform: "translate(-50%, -50%)",
              width: 10, height: 10, borderRadius: "50%",
              background: "#fff", boxShadow: "0 0 4px rgba(0,0,0,0.5)",
            }} />
          </div>
        </div>
      </div>

      <div className="video-desc">
        <div className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--mute)", marginBottom: 12 }}>
          {String(number).padStart(2, "0")} · Reel
        </div>
        <h3 style={{
          fontFamily: '"Archivo Black", "Helvetica Neue", sans-serif',
          fontSize: "clamp(22px, 3vw, 40px)",
          fontWeight: 900, lineHeight: 1.1, margin: "0 0 14px",
          letterSpacing: "-0.02em", textTransform: "uppercase",
        }}>
          {title}
        </h3>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--mute)", margin: "0 0 20px" }}>
          {description}
        </p>
        {igLink && (
          <a
            href={igLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mono"
            style={{
              fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase",
              color: "#fff", textDecoration: "none",
              background: "#000", padding: "10px 16px",
              display: "inline-flex", alignItems: "center", gap: 8,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5"/>
              <circle cx="12" cy="12" r="4.5"/>
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
            </svg>
            Pogledaj na Instagramu
          </a>
        )}
      </div>
    </div>
  );
}

function GameGrid({ onPick, displayFont }) {
  const isMobile = useIsMobile();
  return (
    <section id="igre" style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "32px 0 64px" : "48px 0 96px" }}>
      <div style={{
        textAlign: "center",
        padding: "20px 24px 32px", borderBottom: "1px solid var(--line)", marginBottom: 0,
      }}>
        <h2 className="mono" style={{ fontSize: 17, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--mute)", margin: 0, fontWeight: 700 }}>
          Discipline · 09
        </h2>
      </div>

      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {GAMES.map((g, i) => (
          <GameRow
            key={g.id}
            game={g}
            index={i}
            onPick={onPick}
            displayFont={displayFont}
            isMobile={isMobile}
          />
        ))}
      </ul>

      <div style={{ marginTop: 48, textAlign: "center", padding: "0 24px" }}>
        <p className="mono" style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--mute)", margin: 0, lineHeight: 1.9, textTransform: "uppercase" }}>
          Za promjene kontaktiraj odbor · <a href="mailto:domski.cvjetno@gmail.com" style={{ color: "var(--ink)" }}>domski.cvjetno@gmail.com</a>
        </p>
      </div>
    </section>
  );
}

function GameRow({ game, index, onPick, displayFont, isMobile }) {
  const [hover, setHover] = useAppState(false);

  return (
    <li
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onPick(game)}
      style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "36px 1fr 28px" : "60px 1fr 60px",
        alignItems: "center",
        padding: isMobile ? "18px 16px" : "32px 24px",
        borderBottom: "1px solid var(--line)",
        cursor: "pointer",
        position: "relative",
        transition: "all .2s ease",
        gap: isMobile ? 8 : 16,
        background: hover ? "#000" : "transparent",
        color: hover ? "#fff" : "var(--ink)",
      }}
    >
      <span className="mono" style={{
        fontSize: 10, color: hover ? "rgba(255,255,255,0.5)" : "var(--mute)",
        letterSpacing: "0.1em",
      }}>
        {String(index + 1).padStart(2, "0")}
      </span>

      <div style={{ textAlign: "center" }}>
        <h3 style={{
          margin: 0,
          fontFamily: headerFontFamily(displayFont),
          fontSize: isMobile ? "clamp(22px, 6.5vw, 40px)" : "clamp(32px, 5vw, 56px)",
          fontWeight: 900,
          letterSpacing: "-0.015em",
          lineHeight: 1,
          textTransform: "uppercase",
        }}>
          {game.name}
        </h3>
        <div className="mono" style={{
          fontSize: isMobile ? 9 : 11, letterSpacing: "0.1em", textTransform: "uppercase",
          color: hover ? "rgba(255,255,255,0.6)" : "var(--mute)",
          marginTop: isMobile ? 6 : 12,
          display: "flex", justifyContent: "center", gap: isMobile ? 6 : 16, flexWrap: "wrap",
        }}>
          <span>{game.players === 1 ? "1 igrač" : game.players === 2 ? "Par · 2 igrača" : `Ekipa · ${game.players} igrača`}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{game.schedule}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{game.venue}</span>
        </div>
      </div>

      <span className="mono" style={{
        fontSize: isMobile ? 13 : 18, textAlign: "right",
        transform: hover ? "translateX(4px)" : "translateX(0)",
        transition: "all .25s",
      }}>
        →
      </span>
    </li>
  );
}

function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid var(--line)",
      padding: "40px 24px",
      textAlign: "center",
    }}>
      <div className="mono" style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--mute)", lineHeight: 2 }}>
        © 2026 Cvjetni Odbor<br/>
        Vidimo se :)
      </div>
    </footer>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
