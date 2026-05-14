import { Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'

const capabilities = [
  { icon: '⬡', label: 'Адаптивные тесты в формате ЕНТ', desc: 'Вопросы подстраиваются под ваш уровень' },
  { icon: '✦', label: 'AI-разбор ошибок и объяснений', desc: 'Детальный анализ каждого ответа' },
  { icon: '◈', label: 'Прогноз итогового результата', desc: 'Оценка финального балла в реальном времени' },
  { icon: '◉', label: 'Дашборды прогресса по темам', desc: 'Визуальная карта знаний по предметам' },
  { icon: '❋', label: 'Персональные рекомендации', desc: 'Индивидуальный план подготовки' },
  { icon: '⬟', label: 'Единый учебный трек по целям', desc: 'Путь к целевому баллу шаг за шагом' },
]

const tech = [
  { name: 'React + Tailwind', sub: 'Современный и быстрый UI', tag: 'Frontend' },
  { name: 'Go + Gin', sub: 'Надёжный backend для API', tag: 'Backend' },
  { name: 'SQLite + GORM', sub: 'Хранение тестов и прогресса', tag: 'Database' },
]

const stats = [
  { value: '3', label: 'Обязательных предмета ЕНТ' },
  { value: '5 000+', label: 'Вопросов в базе' },
  { value: 'AI', label: 'Разбор ошибок' },
]

export default function Home() {
  const heroRef = useRef(null)

  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    const items = el.querySelectorAll('[data-reveal]')
    items.forEach((item, i) => {
      item.style.opacity = '0'
      item.style.transform = 'translateY(28px)'
      item.style.transition = `opacity 0.6s ease ${i * 0.12}s, transform 0.6s ease ${i * 0.12}s`
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          item.style.opacity = '1'
          item.style.transform = 'translateY(0)'
        })
      })
    })
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;700;900&family=Onest:wght@300;400;500;600&display=swap');

        :root {
          --ink: #0d0b18;
          --fog: #f4f2fb;
          --accent: #7c3aed;
          --accent2: #a855f7;
          --muted: #8b83a3;
          --card-bg: #ffffff;
          --border: rgba(124, 58, 237, 0.12);
          --glow: rgba(124, 58, 237, 0.18);
        }

        .home-root {
          font-family: 'Onest', sans-serif;
          background: var(--fog);
          min-height: 100vh;
          color: var(--ink);
        }

        .display-font { font-family: 'Unbounded', sans-serif; }

        /* HERO */
        .hero {
          position: relative;
          overflow: hidden;
          background: var(--ink);
          border-radius: 28px;
          padding: 72px 56px 64px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: center;
        }
        @media(max-width: 768px){.hero{grid-template-columns:1fr;padding:48px 28px;}}

        .hero-bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        .orb1 { width: 420px; height: 420px; background: rgba(124,58,237,0.35); top: -120px; right: -80px; }
        .orb2 { width: 260px; height: 260px; background: rgba(168,85,247,0.2); bottom: -60px; left: 60px; }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(124,58,237,0.25);
          border: 1px solid rgba(168,85,247,0.4);
          border-radius: 99px;
          padding: 6px 16px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #c4b5fd;
          margin-bottom: 24px;
        }
        .hero-badge::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #a855f7; animation: pulse-dot 2s ease-in-out infinite; }
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .hero-title {
          font-family: 'Unbounded', sans-serif;
          font-size: clamp(2rem, 4vw, 3.2rem);
          font-weight: 900;
          line-height: 1.1;
          color: #fff;
          margin-bottom: 20px;
        }
        .hero-title span { color: #c4b5fd; }

        .hero-desc {
          font-size: 1rem;
          line-height: 1.7;
          color: rgba(255,255,255,0.6);
          max-width: 420px;
          margin-bottom: 36px;
        }

        .hero-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          color: #fff;
          font-weight: 700;
          font-size: 0.95rem;
          padding: 14px 32px;
          border-radius: 14px;
          text-decoration: none;
          box-shadow: 0 8px 32px rgba(124,58,237,0.45);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .hero-cta:hover { transform: translateY(-2px); box-shadow: 0 14px 40px rgba(124,58,237,0.55); }
        .hero-cta-arrow { font-size: 1.1rem; transition: transform 0.2s ease; }
        .hero-cta:hover .hero-cta-arrow { transform: translateX(4px); }

        /* STATS STRIP in hero */
        .hero-stats {
          display: flex;
          flex-direction: column;
          gap: 20px;
          position: relative;
          z-index: 1;
        }
        .stat-card {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 18px;
          padding: 24px 28px;
          backdrop-filter: blur(8px);
          transition: background 0.25s;
        }
        .stat-card:hover { background: rgba(255,255,255,0.1); }
        .stat-value {
          font-family: 'Unbounded', sans-serif;
          font-size: 2rem;
          font-weight: 900;
          color: #c4b5fd;
          line-height: 1;
        }
        .stat-label { font-size: 0.85rem; color: rgba(255,255,255,0.5); margin-top: 4px; }

        /* MISSION */
        .mission {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          padding: 52px 56px;
          background: linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #6d28d9 100%);
        }
        @media(max-width:768px){.mission{padding:36px 28px;}}
        .mission::before {
          content: '⬡';
          position: absolute;
          font-size: 280px;
          opacity: 0.06;
          right: -40px;
          top: -60px;
          color: #fff;
          line-height: 1;
          pointer-events: none;
        }
        .mission-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
          margin-bottom: 14px;
        }
        .mission-title {
          font-family: 'Unbounded', sans-serif;
          font-size: clamp(1.4rem, 3vw, 2rem);
          font-weight: 900;
          color: #fff;
          margin-bottom: 16px;
          line-height: 1.2;
        }
        .mission-text {
          font-size: 1.05rem;
          color: rgba(255,255,255,0.75);
          max-width: 640px;
          line-height: 1.75;
        }

        /* SECTION HEADER */
        .section-header {
          display: flex;
          align-items: baseline;
          gap: 14px;
          margin-bottom: 24px;
        }
        .section-title {
          font-family: 'Unbounded', sans-serif;
          font-size: 1.5rem;
          font-weight: 900;
          color: var(--ink);
        }
        .section-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(to right, rgba(124,58,237,0.3), transparent);
        }

        /* CAPABILITIES GRID */
        .cap-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }
        @media(max-width:900px){.cap-grid{grid-template-columns:repeat(2,1fr);}}
        @media(max-width:560px){.cap-grid{grid-template-columns:1fr;}}

        .cap-card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 22px 22px;
          transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;
          cursor: default;
        }
        .cap-card:hover {
          border-color: rgba(124,58,237,0.4);
          box-shadow: 0 4px 24px var(--glow);
          transform: translateY(-3px);
        }
        .cap-icon {
          font-size: 1.4rem;
          color: var(--accent2);
          margin-bottom: 10px;
          display: block;
        }
        .cap-label {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 6px;
          line-height: 1.35;
        }
        .cap-desc { font-size: 0.78rem; color: var(--muted); line-height: 1.5; }

        /* TECH */
        .tech-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 14px;
        }
        @media(max-width:700px){.tech-grid{grid-template-columns:1fr;}}

        .tech-card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 28px 24px;
          transition: border-color 0.25s, box-shadow 0.25s;
        }
        .tech-card:hover { border-color: rgba(124,58,237,0.35); box-shadow: 0 4px 20px var(--glow); }

        .tech-tag {
          display: inline-block;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          background: var(--fog);
          color: var(--accent);
          border-radius: 6px;
          padding: 3px 10px;
          margin-bottom: 14px;
        }
        .tech-name {
          font-family: 'Unbounded', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 6px;
        }
        .tech-sub { font-size: 0.83rem; color: var(--muted); }

        /* CTA */
        .cta-section {
          border-radius: 24px;
          overflow: hidden;
          position: relative;
          background: var(--ink);
          padding: 72px 40px;
          text-align: center;
        }
        .cta-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.4) 0%, transparent 65%);
          pointer-events: none;
        }
        .cta-title {
          font-family: 'Unbounded', sans-serif;
          font-size: clamp(1.6rem, 3.5vw, 2.6rem);
          font-weight: 900;
          color: #fff;
          margin-bottom: 12px;
          position: relative;
        }
        .cta-sub { font-size: 1rem; color: rgba(255,255,255,0.5); margin-bottom: 36px; position: relative; }

        .cta-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          color: #fff;
          font-weight: 700;
          font-size: 1rem;
          padding: 16px 42px;
          border-radius: 16px;
          text-decoration: none;
          box-shadow: 0 8px 40px rgba(124,58,237,0.5);
          transition: transform 0.2s, box-shadow 0.2s;
          font-family: 'Unbounded', sans-serif;
          letter-spacing: 0.01em;
        }
        .cta-btn:hover { transform: translateY(-3px); box-shadow: 0 16px 50px rgba(124,58,237,0.65); }

        .root-layout { display: flex; flex-direction: column; gap: 20px; padding: 0; }
      `}</style>

      <div className="home-root" ref={heroRef}>
        <div className="root-layout">

          {/* ── HERO ── */}
          <section className="hero" data-reveal>
            <div className="hero-bg-orb orb1" />
            <div className="hero-bg-orb orb2" />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div className="hero-badge">О проекте</div>
              <h1 className="hero-title">
                AI‑тренажер<br /><span>ЕНТ</span>
              </h1>
              <p className="hero-desc">
                Платформа объединяет тестирование, аналитику и искусственный интеллект, чтобы готовиться к ЕНТ быстрее и эффективнее.
              </p>
              <Link to="/test" className="hero-cta">
                Начать тест <span className="hero-cta-arrow">→</span>
              </Link>
            </div>

            <div className="hero-stats" data-reveal>
              {stats.map(s => (
                <div className="stat-card" key={s.label}>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── MISSION ── */}
          <section className="mission" data-reveal>
            <div className="mission-label">Наша миссия</div>
            <h2 className="mission-title">Персональный AI‑наставник<br />для каждого ученика</h2>
            <p className="mission-text">
              Дать каждому ученику AI‑наставника, который объясняет ошибки, показывает прогресс и строит реальный путь к высокому баллу.
            </p>
          </section>

          {/* ── CAPABILITIES ── */}
          <section data-reveal>
            <div className="section-header">
              <h3 className="section-title">Возможности</h3>
              <div className="section-line" />
            </div>
            <div className="cap-grid">
              {capabilities.map(c => (
                <div className="cap-card" key={c.label}>
                  <span className="cap-icon">{c.icon}</span>
                  <div className="cap-label">{c.label}</div>
                  <div className="cap-desc">{c.desc}</div>
                </div>
              ))}
            </div>
          </section>

         

          {/* ── CTA ── */}
          <section className="cta-section" data-reveal>
            <h3 className="cta-title">Готовы начать?</h3>
            <p className="cta-sub">Запустите свой первый тест и получите AI‑разбор ошибок.</p>
            <Link to="/test" className="cta-btn">
              Начать тест →
            </Link>
          </section>

        </div>
      </div>
    </>
  )
}