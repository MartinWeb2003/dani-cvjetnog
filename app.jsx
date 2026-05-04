// Main app — landing page with game grid + signup flow
const { useState: useAppState, useEffect: useAppEffect } = React;

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
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 20,
      background: "#000000",
      color: "#ffffff",
      padding: "14px 32px",
      display: "flex", justifyContent: "space-between", alignItems: "center",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <DCMonogram />
        <span className="mono" style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff" }}>
          Dani Cvjetnog · 26
        </span>
      </div>
      <nav className="mono" style={{ display: "flex", gap: 28, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>
        <a href="#igre" style={{ color: "#fff", textDecoration: "none" }}>Igre</a>
        <a href="#raspored" style={{ color: "inherit", textDecoration: "none" }}>Raspored</a>
        <a href="#pravila" style={{ color: "inherit", textDecoration: "none" }}>Pravila</a>
        <span style={{ color: "#fff" }}>{date}</span>
      </nav>
    </header>
  );
}

function DCMonogram() {
  return (
    <svg width="26" height="26" viewBox="0 0 28 28">
      <circle cx="14" cy="14" r="13" fill="none" stroke="#fff" strokeWidth="1" />
      <text x="14" y="18.5" textAnchor="middle" fontFamily="Archivo Black, sans-serif" fontSize="11" fill="#fff">DC</text>
    </svg>
  );
}

function headerFontFamily(displayFont) {
  if (displayFont === "Anton") return '"Anton", Impact, sans-serif';
  if (displayFont === "Fraunces") return '"Fraunces", serif';
  return '"Archivo Black", "Helvetica Neue", sans-serif';
}

function Hero({ date, location, displayFont }) {
  return (
    <section style={{
      padding: "120px 32px 96px",
      maxWidth: 1100, margin: "0 auto",
      borderBottom: "1px solid var(--line)",
      textAlign: "center",
    }}>
      <div className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--mute)", marginBottom: 36 }}>
        Prijava na turnire · sezona 2026.
      </div>

      <h1 style={{
        fontFamily: headerFontFamily(displayFont),
        fontSize: "clamp(64px, 13vw, 200px)",
        lineHeight: 0.86, margin: 0, fontWeight: 900,
        letterSpacing: "-0.025em",
        textTransform: "uppercase",
      }}>
        DANI<br/>CVJETNOG
      </h1>

      <p style={{
        fontFamily: "Inter, sans-serif", fontSize: "clamp(16px, 1.5vw, 19px)",
        lineHeight: 1.6, maxWidth: 560, margin: "56px auto 0", color: "var(--ink)", fontWeight: 400,
      }}>
        Devet igara, tri dana, jedno naselje. Skupi ekipu, izaberi disciplinu i prijavi se prije nego popune mjesta.
        Bez kotizacija, bez izgovora — samo poštene utakmice i po jedna piva za pobjednike.
      </p>

      <div className="mono" style={{
        fontSize: 11, letterSpacing: "0.16em", color: "var(--mute)",
        textTransform: "uppercase", marginTop: 48,
        display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap",
      }}>
        <span>{date}</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span>{location}</span>
      </div>

      <div className="mono" style={{ fontSize: 11, letterSpacing: "0.2em", color: "var(--ink)", textTransform: "uppercase", marginTop: 64 }}>
        ↓ Odaberi igru
      </div>
    </section>
  );
}

function GameGrid({ onPick, displayFont }) {
  return (
    <section id="igre" style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 32px 96px" }}>
      <div style={{
        textAlign: "center",
        padding: "20px 0 32px", borderBottom: "1px solid var(--line)", marginBottom: 0,
      }}>
        <h2 className="mono" style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--mute)", margin: 0, fontWeight: 400 }}>
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
          />
        ))}
      </ul>

      <div style={{ marginTop: 64, textAlign: "center" }}>
        <p className="mono" style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--mute)", margin: 0, lineHeight: 1.9, textTransform: "uppercase" }}>
          Prijave se zatvaraju četvrtak u 22:00.<br/>
          Za promjene kontaktiraj odbor · <a href="mailto:cvjetni.odbor@gmail.com" style={{ color: "var(--ink)" }}>cvjetni.odbor@gmail.com</a>
        </p>
      </div>
    </section>
  );
}

function GameRow({ game, index, onPick, displayFont }) {
  const [hover, setHover] = useAppState(false);

  return (
    <li
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onPick(game)}
      style={{
        display: "grid",
        gridTemplateColumns: "60px 1fr 60px",
        alignItems: "center",
        padding: "32px 24px",
        borderBottom: "1px solid var(--line)",
        cursor: "pointer",
        position: "relative",
        transition: "all .2s ease",
        gap: 16,
        background: hover ? "#000" : "transparent",
        color: hover ? "#fff" : "var(--ink)",
      }}
    >
      <span className="mono" style={{
        fontSize: 11, color: hover ? "rgba(255,255,255,0.5)" : "var(--mute)",
        letterSpacing: "0.1em",
      }}>
        {String(index + 1).padStart(2, "0")}
      </span>

      <div style={{ textAlign: "center" }}>
        <h3 style={{
          margin: 0,
          fontFamily: headerFontFamily(displayFont),
          fontSize: "clamp(32px, 5vw, 56px)",
          fontWeight: 900,
          letterSpacing: "-0.015em",
          lineHeight: 1,
          textTransform: "uppercase",
        }}>
          {game.name}
        </h3>
        <div className="mono" style={{
          fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase",
          color: hover ? "rgba(255,255,255,0.6)" : "var(--mute)",
          marginTop: 12,
          display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap",
        }}>
          <span>{game.players === 1 ? "1 igrač" : game.players === 2 ? "Par · 2 igrača" : `Ekipa · ${game.players} igrača`}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{game.schedule}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{game.venue}</span>
        </div>
      </div>

      <span className="mono" style={{
        fontSize: 18, textAlign: "right",
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
      padding: "40px 32px",
      textAlign: "center",
    }}>
      <div className="mono" style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--mute)", lineHeight: 2 }}>
        © 2026 Cvjetni Odbor<br/>
        Sve igre, sva prava igračima
      </div>
    </footer>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
