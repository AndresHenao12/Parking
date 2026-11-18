import { Head } from '@inertiajs/react';
import {
    CalendarDays,
    Clock3,
    Film,
    MapPin,
    Ticket,
    Video,
} from 'lucide-react';

interface Funcion {
    id: number;
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    precio: number | string;
    estado: boolean;
    pelicula?: { titulo: string } | null;
    sala?: { nombre: string } | null;
}

interface Props {
    funciones: Funcion[];
    peliculas: Array<{ id: number; titulo: string }>;
    salas: Array<{ id: number; nombre: string }>;
}

const gradients = [
    'linear-gradient(135deg, rgba(193,141,255,0.9), rgba(95,126,255,0.8))',
    'linear-gradient(135deg, rgba(255,143,168,0.9), rgba(118,83,255,0.8))',
    'linear-gradient(135deg, rgba(60,210,200,0.9), rgba(42,112,255,0.8))',
    'linear-gradient(135deg, rgba(255,191,97,0.9), rgba(242,104,104,0.8))',
    'linear-gradient(135deg, rgba(139,170,240,0.9), rgba(59,92,173,0.8))',
];

const formatDate = (value: string): string => {
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
};

export default function Index({ funciones, peliculas, salas }: Props) {
    return (
        <>
            <Head title="Funciones" />
            <style>{`
                .nocturne-funciones {
                    --night-bg: #1d1f2b;
                    --night-panel: rgba(38, 42, 55, 0.82);
                    --night-surface: rgba(25, 28, 37, 0.9);
                    --night-line: rgba(255, 255, 255, 0.08);
                    --night-text: #f5f6ff;
                    --night-muted: #b9bed5;
                    --night-soft: #8f9bc8;
                    --night-accent: #b67cff;
                    --night-accent-2: #7ac6ff;
                    min-height: 100vh;
                    background:
                        radial-gradient(circle at top, rgba(166, 130, 255, 0.25), transparent 30%),
                        linear-gradient(180deg, #171922, #11141b 40%, #0d1017 100%);
                    color: var(--night-text);
                    font-family: 'Instrument Sans', 'Segoe UI', sans-serif;
                }

                .fn-shell {
                    width: min(1200px, calc(100% - 48px));
                    margin: 0 auto;
                    padding: 52px 0 64px;
                }

                .fn-topbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                    margin-bottom: 28px;
                }

                .fn-brand {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 13px;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                    color: var(--night-muted);
                }

                .fn-brand-mark {
                    display: grid;
                    place-items: center;
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #ff8dc7, #a36dff);
                    box-shadow: 0 0 18px rgba(182, 124, 255, 0.9);
                }

                .fn-button {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 11px 16px;
                    border: 1px solid var(--night-line);
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.04);
                    color: var(--night-text);
                    cursor: pointer;
                    font-weight: 600;
                    transition: transform 0.2s ease, border-color 0.2s ease;
                }

                .fn-button:hover {
                    transform: translateY(-1px);
                    border-color: rgba(182, 124, 255, 0.6);
                }

                .fn-hero {
                    display: grid;
                    grid-template-columns: 1.3fr 0.7fr;
                    gap: 18px;
                    margin-bottom: 26px;
                }

                .fn-hero-panel {
                    position: relative;
                    overflow: hidden;
                    border: 1px solid var(--night-line);
                    border-radius: 26px;
                    background: linear-gradient(135deg, rgba(24, 26, 35, 0.9), rgba(39, 44, 58, 0.85));
                    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.26);
                }

                .fn-hero-main {
                    min-height: 210px;
                    padding: 26px 28px;
                    background:
                        linear-gradient(135deg, rgba(129, 92, 255, 0.3), rgba(255, 120, 150, 0.12)),
                        url('https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1400&q=80') center/cover no-repeat;
                }

                .fn-kicker {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 10px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 999px;
                    background: rgba(12, 14, 20, 0.38);
                    color: #e8e9ff;
                    font-size: 11px;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                }

                .fn-hero-main h1 {
                    margin: 18px 0 10px;
                    font-size: clamp(2.2rem, 3vw, 3.5rem);
                    line-height: 0.96;
                    letter-spacing: -0.08em;
                }

                .fn-hero-main p {
                    margin: 0;
                    max-width: 600px;
                    color: var(--night-muted);
                    font-size: 14px;
                    line-height: 1.6;
                }

                .fn-stats {
                    display: grid;
                    gap: 14px;
                    padding: 18px;
                }

                .fn-stat {
                    padding: 16px 18px;
                    border: 1px solid var(--night-line);
                    border-radius: 18px;
                    background: rgba(25, 28, 37, 0.88);
                }

                .fn-stat-label {
                    display: block;
                    margin-bottom: 6px;
                    color: var(--night-soft);
                    font-size: 11px;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                }

                .fn-stat-value {
                    font-size: clamp(1.5rem, 2vw, 2.15rem);
                    font-weight: 700;
                    letter-spacing: -0.06em;
                }

                .fn-layout {
                    display: grid;
                    grid-template-columns: 1.9fr 0.8fr;
                    gap: 24px;
                    align-items: start;
                }

                .fn-section {
                    border: 1px solid var(--night-line);
                    border-radius: 24px;
                    background: rgba(18, 21, 30, 0.74);
                    padding: 22px;
                }

                .fn-section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    margin-bottom: 16px;
                }

                .fn-section-header h2 {
                    margin: 0;
                    font-size: 1.08rem;
                    letter-spacing: -0.04em;
                }

                .fn-section-header span {
                    color: var(--night-soft);
                    font-size: 12px;
                }

                .fn-grid {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 18px;
                }

                .fn-card {
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: 22px;
                    background: linear-gradient(180deg, rgba(38, 42, 55, 0.9), rgba(20, 23, 31, 0.98));
                    box-shadow: 0 18px 28px rgba(0, 0, 0, 0.16);
                    transition: transform 0.22s ease, border-color 0.2s ease;
                }

                .fn-card:hover {
                    transform: translateY(-2px);
                    border-color: rgba(182, 124, 255, 0.55);
                }

                .fn-card-cover {
                    position: relative;
                    min-height: 170px;
                    padding: 18px;
                    display: flex;
                    align-items: flex-end;
                    background: var(--card-gradient, linear-gradient(135deg, #8a6dff, #5ca2ff));
                }

                .fn-card-cover::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(180deg, rgba(0,0,0,0.02), rgba(0,0,0,0.4));
                }

                .fn-card-badge,
                .fn-card-price {
                    position: relative;
                    z-index: 1;
                }

                .fn-card-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 9px;
                    border-radius: 999px;
                    background: rgba(15, 16, 24, 0.38);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    font-size: 10px;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                }

                .fn-card-price {
                    margin-left: auto;
                    padding: 8px 10px;
                    border-radius: 12px;
                    background: rgba(12, 14, 20, 0.5);
                    font-weight: 700;
                    letter-spacing: -0.05em;
                }

                .fn-card-body {
                    padding: 18px 18px 20px;
                }

                .fn-card-body h3 {
                    margin: 0 0 10px;
                    font-size: 1.3rem;
                    letter-spacing: -0.05em;
                }

                .fn-details {
                    display: grid;
                    gap: 8px;
                    color: var(--night-muted);
                    font-size: 13px;
                }

                .fn-details-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .fn-side-panel {
                    display: grid;
                    gap: 20px;
                }

                .fn-mini-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: grid;
                    gap: 10px;
                }

                .fn-mini-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 12px 14px;
                    border: 1px solid var(--night-line);
                    border-radius: 14px;
                    background: rgba(24, 28, 38, 0.7);
                }

                .fn-mini-copy {
                    min-width: 0;
                }

                .fn-mini-copy strong {
                    display: block;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    font-size: 13px;
                }

                .fn-mini-copy span {
                    color: var(--night-soft);
                    font-size: 11px;
                }

                .fn-mini-chip {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 48px;
                    height: 26px;
                    border-radius: 999px;
                    background: rgba(182, 124, 255, 0.12);
                    border: 1px solid rgba(182, 124, 255, 0.34);
                    color: #edddff;
                    font-size: 11px;
                    font-weight: 700;
                }

                @media (max-width: 900px) {
                    .fn-hero,
                    .fn-layout {
                        grid-template-columns: 1fr;
                    }

                    .fn-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 560px) {
                    .fn-shell {
                        width: min(100% - 24px, 1200px);
                        padding-top: 28px;
                    }

                    .fn-topbar {
                        margin-bottom: 18px;
                    }

                    .fn-brand {
                        letter-spacing: 0.08em;
                        font-size: 10px;
                    }
                }
            `}</style>

            <main className="nocturne-funciones">
                <div className="fn-shell">
                    <header className="fn-topbar">
                        <div className="fn-brand">
                            <span className="fn-brand-mark" />
                            Cartelera nocturna
                        </div>
                        <button type="button" className="fn-button">
                            <Ticket size={15} />
                            Ver programación
                        </button>
                    </header>

                    <section className="fn-hero">
                        <div className="fn-hero-panel fn-hero-main">
                            <span className="fn-kicker">
                                <Video size={12} />
                                En cartelera
                            </span>
                            <h1>Funciones</h1>
                            <p>
                                Descubre la programación actual con proyección nocturna,
                                salas premium y horarios pensados para cada película.
                            </p>
                        </div>

                        <div className="fn-hero-panel fn-stats">
                            <div className="fn-stat">
                                <span className="fn-stat-label">Películas</span>
                                <span className="fn-stat-value">{peliculas.length}</span>
                            </div>
                            <div className="fn-stat">
                                <span className="fn-stat-label">Salas</span>
                                <span className="fn-stat-value">{salas.length}</span>
                            </div>
                            <div className="fn-stat">
                                <span className="fn-stat-label">Programación</span>
                                <span className="fn-stat-value">{funciones.length}</span>
                            </div>
                        </div>
                    </section>

                    <section className="fn-layout">
                        <div className="fn-section">
                            <div className="fn-section-header">
                                <h2>Funciones activas</h2>
                                <span>{funciones.length} en total</span>
                            </div>

                            <div className="fn-grid">
                                {funciones.length > 0 ? (
                                    funciones.map((funcion, index) => (
                                        <article className="fn-card" key={funcion.id}>
                                            <div
                                                className="fn-card-cover"
                                                style={{
                                                    ['--card-gradient' as string]:
                                                        gradients[index % gradients.length],
                                                }}
                                            >
                                                <span className="fn-card-badge">
                                                    {funcion.estado ? 'Activa' : 'Inactiva'}
                                                </span>
                                                <span className="fn-card-price">
                                                    ${Number(funcion.precio).toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="fn-card-body">
                                                <h3>{funcion.pelicula?.titulo ?? 'Película sin título'}</h3>
                                                <div className="fn-details">
                                                    <div className="fn-details-item">
                                                        <CalendarDays size={14} />
                                                        {formatDate(funcion.fecha)}
                                                    </div>
                                                    <div className="fn-details-item">
                                                        <Clock3 size={14} />
                                                        {funcion.hora_inicio} - {funcion.hora_fin}
                                                    </div>
                                                    <div className="fn-details-item">
                                                        <Film size={14} />
                                                        {funcion.sala?.nombre ?? 'Sala sin asignar'}
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    ))
                                ) : (
                                    <p style={{ color: 'var(--night-muted)' }}>
                                        No hay funciones registradas.
                                    </p>
                                )}
                            </div>
                        </div>

                        <aside className="fn-side-panel">
                            <div className="fn-section">
                                <div className="fn-section-header">
                                    <h2>Películas</h2>
                                </div>
                                <ul className="fn-mini-list">
                                    {peliculas.length > 0 ? (
                                        peliculas.slice(0, 5).map((pelicula) => (
                                            <li key={pelicula.id} className="fn-mini-item">
                                                <div className="fn-mini-copy">
                                                    <strong>{pelicula.titulo}</strong>
                                                    <span>Disponibles</span>
                                                </div>
                                                <span className="fn-mini-chip">{pelicula.id}</span>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="fn-mini-item">
                                            <div className="fn-mini-copy">
                                                <strong>No hay películas</strong>
                                            </div>
                                        </li>
                                    )}
                                </ul>
                            </div>

                            <div className="fn-section">
                                <div className="fn-section-header">
                                    <h2>Salas</h2>
                                </div>
                                <ul className="fn-mini-list">
                                    {salas.length > 0 ? (
                                        salas.slice(0, 5).map((sala) => (
                                            <li key={sala.id} className="fn-mini-item">
                                                <div className="fn-mini-copy">
                                                    <strong>{sala.nombre}</strong>
                                                    <span>Disponibilidad</span>
                                                </div>
                                                <span className="fn-mini-chip">
                                                    <MapPin size={12} />
                                                </span>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="fn-mini-item">
                                            <div className="fn-mini-copy">
                                                <strong>No hay salas</strong>
                                            </div>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </aside>
                    </section>
                </div>
            </main>
        </>
    );
}
