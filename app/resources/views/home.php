<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TrapMap - Home</title>
    <style>
        :root {
            color-scheme: light;
            --bg: #0f172a;
            --panel: #111827;
            --accent: #f97316;
            --text: #e5e7eb;
            --muted: #9ca3af;
        }
        * {
            box-sizing: border-box;
        }
        body {
            margin: 0;
            font-family: "Inter", system-ui, -apple-system, sans-serif;
            background: radial-gradient(circle at 20% 20%, rgba(249, 115, 22, 0.12), transparent 25%),
                        radial-gradient(circle at 80% 10%, rgba(56, 189, 248, 0.10), transparent 24%),
                        var(--bg);
            color: var(--text);
            min-height: 100vh;
        }
        header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 24px 32px;
            position: sticky;
            top: 0;
            background: linear-gradient(180deg, rgba(15, 23, 42, 0.96) 0%, rgba(15, 23, 42, 0.75) 100%);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .logo {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            font-weight: 700;
            letter-spacing: 0.02em;
            font-size: 18px;
        }
        .logo span {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 34px;
            height: 34px;
            border-radius: 12px;
            background: linear-gradient(135deg, #f97316 0%, #fb923c 60%, #fed7aa 100%);
            color: #0b1020;
            font-weight: 800;
            box-shadow: 0 10px 40px rgba(249, 115, 22, 0.35);
        }
        nav {
            display: flex;
            align-items: center;
            gap: 18px;
        }
        nav a {
            color: var(--muted);
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
            padding: 8px 12px;
            border-radius: 10px;
            transition: color 0.2s ease, background-color 0.2s ease;
        }
        nav a:hover {
            color: var(--text);
            background-color: rgba(255, 255, 255, 0.04);
        }
        .hero {
            max-width: 1100px;
            margin: 60px auto 30px;
            padding: 0 24px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 28px;
        }
        .hero-copy h1 {
            font-size: clamp(32px, 4vw, 46px);
            margin: 0 0 12px;
            line-height: 1.05;
            letter-spacing: -0.02em;
        }
        .hero-copy p {
            margin: 0 0 20px;
            color: var(--muted);
            font-size: 16px;
            line-height: 1.6;
        }
        .cta-row {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            align-items: center;
        }
        .btn-primary,
        .btn-ghost {
            padding: 12px 18px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 14px;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        .btn-primary {
            background: linear-gradient(135deg, #f97316 0%, #fb923c 60%, #fed7aa 100%);
            color: #0b1020;
            box-shadow: 0 14px 45px rgba(249, 115, 22, 0.35);
        }
        .btn-ghost {
            color: var(--text);
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.06);
        }
        .glass {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.05);
            box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
            border-radius: 18px;
            padding: 22px;
        }
        .badge-row {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(249, 115, 22, 0.10);
            color: #fb923c;
            padding: 8px 12px;
            border-radius: 50px;
            font-weight: 700;
            font-size: 12px;
            letter-spacing: 0.04em;
            text-transform: uppercase;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 12px;
            margin: 20px 0 0;
        }
        .stat {
            padding: 14px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .stat strong {
            display: block;
            font-size: 22px;
            margin-bottom: 6px;
        }
        .stat span {
            color: var(--muted);
            font-size: 13px;
        }
        .panel {
            max-width: 1100px;
            margin: 0 auto;
            padding: 0 24px 60px;
        }
        .panel h2 {
            margin: 0 0 12px;
            letter-spacing: -0.01em;
        }
        .panel p {
            margin: 0 0 18px;
            color: var(--muted);
        }
        .cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 18px;
        }
        .card {
            position: relative;
            overflow: hidden;
        }
        .card h3 {
            margin: 0 0 6px;
        }
        .pill {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.05);
            color: var(--muted);
            font-weight: 700;
            font-size: 12px;
        }
        footer {
            padding: 26px 32px;
            border-top: 1px solid rgba(255, 255, 255, 0.06);
            color: var(--muted);
            text-align: center;
            font-size: 13px;
            background: rgba(0, 0, 0, 0.2);
        }
    </style>
</head>
<body>
<header>
    <div class="logo"><span>T</span>TrapMap</div>
    <nav>
        <a href="#missione">Missione</a>
        <a href="#funzioni">Cosa puoi fare</a>
        <a href="#community">Community</a>
    </nav>
</header>
<main>
    <section class="hero">
        <div class="hero-copy">
            <div class="badge-row">Nuova esperienza TrapMap</div>
            <h1>Scopri, segnala e vivi le location trap della tua città.</h1>
            <p>Un hub progettato per connettere artisti, creator e fan. Mappa i luoghi iconici, condividi suggerimenti e resta aggiornato sugli eventi della scena.</p>
            <div class="cta-row">
                <a class="btn-primary" href="#funzioni">Esplora le funzioni</a>
                <a class="btn-ghost" href="#community">Partecipa alla community</a>
            </div>
            <div class="stats">
                <div class="stat"><strong>250+</strong><span>Segnalazioni verificate</span></div>
                <div class="stat"><strong>80</strong><span>Artisti in evidenza</span></div>
                <div class="stat"><strong>12</strong><span>Eventi in arrivo</span></div>
            </div>
        </div>
        <div class="hero-visual glass">
            <h3 style="margin-top:0">Un'unica mappa, più prospettive</h3>
            <p style="color:var(--muted); margin-top:8px;">Filtro per mood, artista o quartiere. Visualizza info rapide, media e suggerimenti in un colpo d'occhio.</p>
            <div class="cards">
                <div class="card glass">
                    <div class="pill">Artista · New entry</div>
                    <h3>NovaWave</h3>
                    <p style="color:var(--muted);">Live session al Neon Club il 21/07 — RSVP aperto</p>
                </div>
                <div class="card glass">
                    <div class="pill">Location · Milano</div>
                    <h3>Locker Studio</h3>
                    <p style="color:var(--muted);">Recording spot con setup analogico e area lounge.</p>
                </div>
                <div class="card glass">
                    <div class="pill">Suggerimento</div>
                    <h3>Scatta qui</h3>
                    <p style="color:var(--muted);">Murales "Metro 98" — Golden hour 19:30 per visual perfette.</p>
                </div>
            </div>
        </div>
    </section>
    <section id="missione" class="panel">
        <div class="glass">
            <h2>Missione TrapMap</h2>
            <p>Costruiamo un ecosistema collaborativo per dare visibilità a chi crea e vive la scena trap. Segnala i luoghi, racconta le storie e porta la community dove succede qualcosa.</p>
            <div class="cta-row">
                <span class="pill">Verifica comunitaria</span>
                <span class="pill">Eventi curati</span>
                <span class="pill">Upload media sicuro</span>
            </div>
        </div>
    </section>
    <section id="funzioni" class="panel">
        <div class="glass">
            <h2>Funzionalità principali</h2>
            <p>La nuova architettura introduce API pulite e moduli indipendenti per crescere senza frizioni.</p>
            <div class="cards">
                <div class="card glass">
                    <h3>Segnalazioni smart</h3>
                    <p style="color:var(--muted);">Invia suggerimenti con validazione server-side e allegati sicuri.</p>
                </div>
                <div class="card glass">
                    <h3>Profilo artisti</h3>
                    <p style="color:var(--muted);">Gestisci schede con social link, media e categorie personalizzate.</p>
                </div>
                <div class="card glass">
                    <h3>Eventi & notifiche</h3>
                    <p style="color:var(--muted);">Ricevi update via feed o email grazie all'event dispatcher tipizzato.</p>
                </div>
            </div>
        </div>
    </section>
    <section id="community" class="panel">
        <div class="glass">
            <h2>Community & trasparenza</h2>
            <p>Ogni contributo è verificato e tracciato. Le modifiche passano da servizi dedicati con controlli di ruolo e log centralizzato.</p>
            <div class="cards">
                <div class="card glass">
                    <h3>Moderazione</h3>
                    <p style="color:var(--muted);">Flussi di approvazione per location e card artista.</p>
                </div>
                <div class="card glass">
                    <h3>Roadmap pubblica</h3>
                    <p style="color:var(--muted);">Segui l'avanzamento delle feature e proponi integrazioni.</p>
                </div>
                <div class="card glass">
                    <h3>Open API</h3>
                    <p style="color:var(--muted);">Integrazioni future per app mobile e bot grazie a contratti chiari.</p>
                </div>
            </div>
        </div>
    </section>
</main>
<footer>
    Nuovo TrapMap · Architettura modulare pronta per crescere.
</footer>
</body>
</html>
