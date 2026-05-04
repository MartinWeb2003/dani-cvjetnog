// Sign-up form modal — handles dynamic player slots based on game.players
const { useState, useEffect, useRef } = React;

function FormField({ label, hint, children, idx }) {
  return (
    <label style={{ display: "block", marginBottom: 18 }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        marginBottom: 6,
      }}>
        <span className="mono" style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--mute)" }}>
          {idx != null ? `${String(idx).padStart(2,"0")} · ` : ""}{label}
        </span>
        {hint && <span className="mono" style={{ fontSize: 10, color: "var(--mute)", opacity: 0.7 }}>{hint}</span>}
      </div>
      {children}
    </label>
  );
}

const TextInput = React.forwardRef(function TextInput(props, ref) {
  return (
    <input
      ref={ref}
      {...props}
      style={{
        width: "100%",
        background: "transparent",
        border: 0,
        borderBottom: "1px solid var(--ink)",
        padding: "8px 0 10px",
        fontSize: 18,
        outline: "none",
        fontFamily: "Inter, sans-serif",
        ...(props.style || {}),
      }}
    />
  );
});

function SignupForm({ game, onClose, onSubmit }) {
  const isTeam = game.players > 1;
  const initialPlayers = Array.from({ length: game.players }, () => ({ name: "", phone: "" }));
  const [teamName, setTeamName] = useState("");
  const [players, setPlayers] = useState(initialPlayers);
  const [agree, setAgree] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [confirmCode] = useState(() => {
    return "DC-" + Math.random().toString(36).slice(2, 6).toUpperCase() + "-" + Math.floor(Math.random()*90+10);
  });
  const firstInputRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    setTimeout(() => firstInputRef.current && firstInputRef.current.focus(), 80);
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  function updatePlayer(i, key, value) {
    setPlayers(prev => prev.map((p, idx) => idx === i ? { ...p, [key]: value } : p));
  }

  function canSubmit() {
    if (!agree) return false;
    if (isTeam && !teamName.trim()) return false;
    return players.every(p => p.name.trim().length > 1 && p.phone.trim().length > 5);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit()) return;
    setSubmitted(true);
    onSubmit && onSubmit({ game, teamName, players, code: confirmCode });
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(10,10,10,0.42)",
        display: "flex", alignItems: "stretch", justifyContent: "flex-end",
        animation: "fadeIn .25s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="signup-sheet"
        style={{
          width: "min(620px, 100%)",
          background: "var(--paper)",
          height: "100vh",
          overflowY: "auto",
          position: "relative",
          animation: "slideIn .35s cubic-bezier(.2,.8,.2,1)",
          borderLeft: "1px solid var(--line)",
        }}
      >
        <style>{`
          @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
          @keyframes slideIn { from { transform: translateX(40px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
          .signup-sheet input::placeholder { color: #b9b5ac; font-style: italic; }
        `}</style>

        {/* close button */}
        <button onClick={onClose} aria-label="Zatvori"
          style={{
            position: "absolute", top: 22, right: 22,
            width: 36, height: 36, borderRadius: "50%",
            border: "1px solid var(--ink)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 5, background: "var(--paper)",
          }}>
          <svg width="12" height="12" viewBox="0 0 12 12"><path d="M1 1 L11 11 M11 1 L1 11" stroke="currentColor" strokeWidth="1.2"/></svg>
        </button>

        {!submitted ? (
          <form onSubmit={handleSubmit} style={{ padding: "56px 56px 80px" }}>
            <div className="mono" style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--mute)", marginBottom: 24 }}>
              Prijava · {String(GAMES.findIndex(g => g.id === game.id) + 1).padStart(2, "0")} / {String(GAMES.length).padStart(2, "0")}
            </div>

            <h2 style={{
              fontFamily: '"Archivo Black", "Helvetica Neue", sans-serif',
              fontSize: "clamp(44px, 6vw, 72px)", lineHeight: 0.92, margin: "0 0 16px",
              fontWeight: 900, letterSpacing: "-0.02em",
              textTransform: "uppercase",
            }}>
              {game.name}
            </h2>

            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 32, paddingBottom: 28, borderBottom: "1px solid var(--line)" }}>
              <Tag>{game.type}</Tag>
              <Tag>{game.players === 1 ? "1 igrač" : `${game.players} igrača`}</Tag>
              <Tag>{game.schedule}</Tag>
              <Tag>{game.venue}</Tag>
            </div>

            <p style={{ fontSize: 16, lineHeight: 1.5, color: "var(--mute)", margin: "0 0 36px", maxWidth: 480 }}>
              {game.blurb} Ispuni podatke ispod — potvrdu prijave šaljemo SMS-om kapetanu ekipe.
            </p>

            {isTeam && (
              <div style={{ marginBottom: 32 }}>
                <FormField label="Ime ekipe" idx={1} hint="max 30 znakova">
                  <TextInput
                    ref={firstInputRef}
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value.slice(0, 30))}
                    placeholder="npr. Cvjetni Lavovi"
                    maxLength={30}
                  />
                </FormField>
              </div>
            )}

            <div className="mono" style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--mute)", margin: "0 0 16px" }}>
              {isTeam ? "Igrači" : "Igrač"} · {game.players}
            </div>

            {players.map((p, i) => (
              <div key={i} style={{
                marginBottom: 18, paddingBottom: 18,
                borderBottom: i < players.length - 1 ? "1px dashed var(--line)" : "none",
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18,
              }}>
                <FormField label={isTeam ? `Igrač ${i + 1} · ime i prezime` : "Ime i prezime"} idx={isTeam ? i + 2 : 1}>
                  <TextInput
                    ref={!isTeam && i === 0 ? firstInputRef : null}
                    value={p.name}
                    onChange={(e) => updatePlayer(i, "name", e.target.value)}
                    placeholder={i === 0 ? "Ana Horvat" : "Ime Prezime"}
                  />
                </FormField>
                <FormField label="Mobitel" hint={i === 0 && isTeam ? "kapetan" : ""}>
                  <TextInput
                    type="tel"
                    value={p.phone}
                    onChange={(e) => updatePlayer(i, "phone", e.target.value)}
                    placeholder="+385 9_ ___ ____"
                  />
                </FormField>
              </div>
            ))}

            <label style={{
              display: "flex", alignItems: "flex-start", gap: 12,
              marginTop: 28, cursor: "pointer",
              fontSize: 13, lineHeight: 1.5, color: "var(--mute)",
            }}>
              <span style={{
                width: 16, height: 16, marginTop: 2, flexShrink: 0,
                border: "1px solid var(--ink)",
                background: agree ? "var(--ink)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background .15s",
              }}>
                {agree && <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1.5 5 L4 7.5 L8.5 2.5" stroke="var(--paper)" strokeWidth="1.4" fill="none"/></svg>}
              </span>
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ display: "none" }} />
              <span>
                Slažem se s pravilima turnira i potvrđujem da su podaci točni. Igraj fer, nemoj se ljutiti.
              </span>
            </label>

            <div style={{ display: "flex", gap: 12, marginTop: 40, alignItems: "center" }}>
              <button type="submit" disabled={!canSubmit()}
                style={{
                  background: canSubmit() ? "var(--ink)" : "transparent",
                  color: canSubmit() ? "var(--paper)" : "var(--mute)",
                  border: "1px solid " + (canSubmit() ? "var(--ink)" : "var(--line)"),
                  padding: "16px 32px",
                  fontSize: 14, letterSpacing: "0.02em",
                  cursor: canSubmit() ? "pointer" : "not-allowed",
                  transition: "all .2s",
                  fontWeight: 500,
                  flex: "1 1 auto",
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                }}>
                <span>Pošalji prijavu</span>
                <span className="mono" style={{ fontSize: 12, opacity: 0.7 }}>↵</span>
              </button>
              <button type="button" onClick={onClose}
                style={{ padding: "16px 20px", fontSize: 13, color: "var(--mute)", textDecoration: "underline", textUnderlineOffset: 4 }}>
                Odustani
              </button>
            </div>
          </form>
        ) : (
          <ConfirmationView code={confirmCode} game={game} teamName={teamName} players={players} onClose={onClose} />
        )}
      </div>
    </div>
  );
}

function Tag({ children }) {
  return (
    <span className="mono" style={{
      fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase",
      padding: "5px 10px", border: "1px solid var(--ink)", borderRadius: 999,
    }}>{children}</span>
  );
}

function ConfirmationView({ code, game, teamName, players, onClose }) {
  return (
    <div style={{ padding: "80px 56px", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div className="mono" style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--mute)", marginBottom: 32 }}>
        Prijava potvrđena
      </div>

      <div style={{ marginBottom: 48 }}>
        <svg width="56" height="56" viewBox="0 0 56 56" style={{ marginBottom: 24 }}>
          <circle cx="28" cy="28" r="27" fill="none" stroke="var(--ink)" strokeWidth="1" />
          <path d="M16 28 L25 37 L41 19" stroke="var(--ink)" strokeWidth="1.4" fill="none" />
        </svg>
        <h2 style={{
          fontFamily: '"Archivo Black", "Helvetica Neue", sans-serif',
          fontSize: 60, lineHeight: 0.95, margin: "0 0 16px", fontWeight: 900,
          letterSpacing: "-0.02em", textTransform: "uppercase",
        }}>
          Vidimo se<br/>na terenu.
        </h2>
        <p style={{ color: "var(--mute)", fontSize: 16, margin: 0, maxWidth: 420, lineHeight: 1.5 }}>
          Tvoja prijava za <strong style={{ color: "var(--ink)" }}>{game.name}</strong> je zaprimljena. Potvrdu šaljemo na navedeni broj u sljedećih nekoliko minuta.
        </p>
      </div>

      <div style={{ borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", padding: "24px 0", marginBottom: 32 }}>
        <Row label="Šifra prijave"><span className="mono" style={{ fontSize: 16 }}>{code}</span></Row>
        <Row label="Igra">{game.name}</Row>
        {teamName && <Row label="Ekipa">{teamName}</Row>}
        <Row label={players.length > 1 ? "Igrači" : "Igrač"}>
          {players.map(p => p.name).filter(Boolean).join(", ")}
        </Row>
        <Row label="Termin">{game.schedule} · {game.venue}</Row>
      </div>

      <div style={{ marginTop: "auto", display: "flex", gap: 12 }}>
        <button onClick={onClose}
          style={{
            background: "var(--ink)", color: "var(--paper)",
            padding: "16px 28px", fontSize: 14, fontWeight: 500,
            border: "1px solid var(--ink)",
          }}>
          Natrag na popis igara
        </button>
      </div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", padding: "10px 0", gap: 16 }}>
      <span className="mono" style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--mute)", paddingTop: 2 }}>{label}</span>
      <span style={{ fontSize: 15 }}>{children}</span>
    </div>
  );
}

Object.assign(window, { SignupForm });
