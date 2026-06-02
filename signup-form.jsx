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
  const initialPlayers = Array.from({ length: game.players }, () => ({ name: "", email: "", phone: "" }));
  const [teamName, setTeamName] = useState("");
  const [players, setPlayers] = useState(initialPlayers);
  const [agree, setAgree] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
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
    if (!players[0].email.trim().includes("@")) return false;
    return players.every(p => p.name.trim().length > 1);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit() || submitting) return;
    setSubmitting(true);
    setSubmitError(null);

    const payload = {
      igra:             game.name,
      igra_id:          game.id,
      ekipa:            teamName || null,
      igraci:           players.map(p => p.name).filter(Boolean),
      kontakt_email:    players[0].email,
      kontakt_mobitel:  players[0].phone || null,
      sifra:            confirmCode,
      termin:           game.schedule,
      lokacija:         game.venue,
      timestamp:        firebase.database.ServerValue.TIMESTAMP,
    };

    try {
      await firebase.database().ref("prijave").push(payload);
    } catch (err) {
      console.error("Database error:", err);
      setSubmitError("Greška pri slanju. Pokušaj ponovo ili nas kontaktiraj na domski.cvjetno@gmail.com.");
      setSubmitting(false);
      return;
    }

    // Send confirmation email — non-blocking, failure doesn't cancel submission
    const ejs = window.__EMAILJS;
    if (ejs && ejs.serviceId !== "YOUR_SERVICE_ID") {
      emailjs.send(ejs.serviceId, ejs.templateId, {
        to_name:  players[0].name,
        to_email: players[0].email,
        igra:     game.name,
      }).catch((err) => console.error("EmailJS error:", err));
    }

    setSubmitting(false);
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
          @media (max-width: 600px) { .signup-form-inner { padding: 40px 24px 60px !important; } }
          @media (max-width: 480px) { .player-row { grid-template-columns: 1fr !important; } }
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

        {/* ── Prijave zatvorene overlay ── */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 4,
          background: "rgba(247,245,240,0.90)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 20, padding: "0 40px",
          textAlign: "center",
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            border: "1px solid var(--ink)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h2 style={{
            fontFamily: '"Archivo Black", "Helvetica Neue", sans-serif',
            fontSize: "clamp(40px, 7vw, 64px)",
            fontWeight: 900, lineHeight: 0.92, margin: 0,
            letterSpacing: "-0.025em", textTransform: "uppercase",
          }}>
            Prijave<br/>zatvorene
          </h2>
          <p style={{
            fontFamily: '"Inter", sans-serif',
            fontSize: 14, color: "var(--mute)",
            margin: 0, maxWidth: 300, lineHeight: 1.65,
          }}>
            Prijave za <strong style={{ color: "var(--ink)" }}>{game.name}</strong> su zatvorene. Hvala svima koji su se prijavili — vidimo se na terenu!
          </p>
          <button onClick={onClose} style={{
            marginTop: 8,
            fontFamily: '"Inter", sans-serif',
            fontSize: 13, letterSpacing: "0.04em",
            border: "1px solid var(--ink)", padding: "12px 28px",
            background: "var(--ink)", color: "var(--paper)",
            cursor: "pointer",
          }}>
            Zatvori
          </button>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="signup-form-inner" style={{ padding: "56px 56px 80px" }}>
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
              }}>
                {(!isTeam && i === 0) ? (
                  /* Solo: name + email side by side, phone below */
                  <>
                    <div className="player-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
                      <FormField label="Ime i prezime" idx={1}>
                        <TextInput
                          ref={firstInputRef}
                          value={p.name}
                          onChange={(e) => updatePlayer(0, "name", e.target.value)}
                          placeholder="Ana Horvat"
                        />
                      </FormField>
                      <FormField label="E-mail" idx={2}>
                        <TextInput
                          type="email"
                          value={p.email}
                          onChange={(e) => updatePlayer(0, "email", e.target.value)}
                          placeholder="ana@primjer.hr"
                        />
                      </FormField>
                    </div>
                    <FormField label="Mobitel" hint="nije obavezno">
                      <TextInput
                        type="tel"
                        value={p.phone}
                        onChange={(e) => updatePlayer(0, "phone", e.target.value)}
                        placeholder="+385 9_ ___ ____"
                      />
                    </FormField>
                  </>
                ) : (
                  /* Team: name only per player */
                  <FormField label={`Igrač ${i + 1} · ime i prezime`} idx={i + 2}>
                    <TextInput
                      value={p.name}
                      onChange={(e) => updatePlayer(i, "name", e.target.value)}
                      placeholder={i === 0 ? "Ana Horvat" : "Ime Prezime"}
                    />
                  </FormField>
                )}
              </div>
            ))}

            {/* Team contact — email + optional phone after all player names */}
            {isTeam && (
              <div style={{ marginTop: 8, paddingTop: 24, borderTop: "1px solid var(--line)" }}>
                <div className="mono" style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--mute)", margin: "0 0 16px" }}>
                  Kontakt · kapetan
                </div>
                <FormField label="E-mail" idx={players.length + 2}>
                  <TextInput
                    type="email"
                    value={players[0].email}
                    onChange={(e) => updatePlayer(0, "email", e.target.value)}
                    placeholder="ana@primjer.hr"
                  />
                </FormField>
                <FormField label="Mobitel" hint="nije obavezno">
                  <TextInput
                    type="tel"
                    value={players[0].phone}
                    onChange={(e) => updatePlayer(0, "phone", e.target.value)}
                    placeholder="+385 9_ ___ ____"
                  />
                </FormField>
              </div>
            )}

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
              <button type="submit" disabled={!canSubmit() || submitting}
                style={{
                  background: canSubmit() && !submitting ? "var(--ink)" : "transparent",
                  color: canSubmit() && !submitting ? "var(--paper)" : "var(--mute)",
                  border: "1px solid " + (canSubmit() && !submitting ? "var(--ink)" : "var(--line)"),
                  padding: "16px 32px",
                  fontSize: 14, letterSpacing: "0.02em",
                  cursor: canSubmit() && !submitting ? "pointer" : "not-allowed",
                  transition: "all .2s",
                  fontWeight: 500,
                  flex: "1 1 auto",
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                }}>
                <span>{submitting ? "Šalje se..." : "Pošalji prijavu"}</span>
                {!submitting && <span className="mono" style={{ fontSize: 12, opacity: 0.7 }}>↵</span>}
              </button>
              <button type="button" onClick={onClose} disabled={submitting}
                style={{ padding: "16px 20px", fontSize: 13, color: "var(--mute)", textDecoration: "underline", textUnderlineOffset: 4 }}>
                Odustani
              </button>
            </div>

            {submitError && (
              <p className="mono" style={{ fontSize: 11, color: "#c00", marginTop: 14, letterSpacing: "0.04em", lineHeight: 1.6 }}>
                {submitError}
              </p>
            )}
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
          Tvoja prijava za <strong style={{ color: "var(--ink)" }}>{game.name}</strong> je zaprimljena. Potvrdu šaljemo na navedenu e-mail adresu.
        </p>
      </div>

      <div style={{ borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", padding: "24px 0", marginBottom: 32 }}>
        <Row label="Šifra prijave"><span className="mono" style={{ fontSize: 16 }}>{code}</span></Row>
        <Row label="Igra">{game.name}</Row>
        {teamName && <Row label="Ekipa">{teamName}</Row>}
        <Row label={players.length > 1 ? "Igrači" : "Igrač"}>
          {players.map(p => p.name).filter(Boolean).join(", ")}
        </Row>
        {players[0].email && <Row label="Kontakt">{players[0].email}</Row>}
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
