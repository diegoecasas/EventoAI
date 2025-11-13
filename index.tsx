import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [dashboardView, setDashboardView] = useState('events'); // 'events', 'metrics', 'manageEvent'
    
    // Simulación de datos de eventos
    const [events, setEvents] = useState([
        { id: 1, name: 'INNOVFEST 2024', slug: 'innovfest-2024', description: 'El festival de innovación más grande del año.', status: 'Activo' },
        { id: 2, name: 'TECHSUMMIT Global', slug: 'techsummit-global', description: 'Conectando mentes brillantes en tecnología.', status: 'Finalizado' },
    ]);
    const [selectedEvent, setSelectedEvent] = useState(events[0]);

    const handleLogin = () => {
        setIsLoggedIn(true);
        setShowAuthModal(false);
    };
    
    const handleLogout = () => {
        setIsLoggedIn(false);
        setDashboardView('events');
    };

    const manageEvent = (event) => {
        setSelectedEvent(event);
        setDashboardView('manageEvent');
    };

    if (!isLoggedIn) {
        return <LandingPage onLoginClick={() => setShowAuthModal(true)} showAuthModal={showAuthModal} onLogin={handleLogin} />;
    }

    return (
        <Dashboard 
            currentView={dashboardView} 
            setView={setDashboardView} 
            events={events}
            selectedEvent={selectedEvent}
            onManageEvent={manageEvent}
            onLogout={handleLogout} 
        />
    );
};

const LandingPage = ({ onLoginClick, showAuthModal, onLogin }) => {
    // Note: styles are now scoped inside the components for better organization
    const styles = `
        :root {
            --dark-bg: #0a071a;
            --primary-glow: #8e2de2;
            --secondary-glow: #4a00e0;
            --text-primary: #ffffff;
            --text-secondary: #b0a8d9;
            --glass-bg: rgba(255, 255, 255, 0.05);
            --glass-border: rgba(255, 255, 255, 0.15);
            --cta-bg: linear-gradient(90deg, #8e2de2, #4a00e0);
            --cta-hover-bg: linear-gradient(90deg, #a149f1, #5e15ff);
            --header-height: 70px;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
            font-family: 'Poppins', sans-serif; background-color: var(--dark-bg);
            color: var(--text-primary); overflow-x: hidden;
            background-image: radial-gradient(circle at 10% 10%, var(--primary-glow) 0%, transparent 30%),
                              radial-gradient(circle at 90% 80%, var(--secondary-glow) 0%, transparent 35%);
            background-attachment: fixed;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }
        header {
            position: fixed; top: 0; left: 0; width: 100%; z-index: 1000; padding: 0 2rem;
            background: rgba(10, 7, 26, 0.6); backdrop-filter: blur(10px);
            border-bottom: 1px solid var(--glass-border);
        }
        nav { display: flex; justify-content: space-between; align-items: center; height: var(--header-height); max-width: 1200px; margin: 0 auto; }
        .logo { font-weight: 700; font-size: 1.5rem; text-decoration: none; color: var(--text-primary); }
        .nav-links { display: flex; gap: 2rem; list-style: none; }
        .nav-links a { text-decoration: none; color: var(--text-secondary); transition: color 0.3s; }
        .nav-links a:hover { color: var(--text-primary); }
        section { padding: 6rem 0; opacity: 0; transform: translateY(20px); animation: fadeIn 1s forwards; scroll-margin-top: var(--header-height); }
        @keyframes fadeIn { to { opacity: 1; transform: translateY(0); } }
        .section-title { font-size: 2.5rem; text-align: center; margin-bottom: 3rem; background: linear-gradient(90deg, #e7d9ff, #c3a4f8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .cta-button {
            display: inline-block; padding: 0.8rem 1.8rem; background: var(--cta-bg);
            color: var(--text-primary); border: none; border-radius: 50px;
            text-decoration: none; font-weight: 600; cursor: pointer;
            transition: all 0.3s ease; box-shadow: 0 5px 20px rgba(74, 0, 224, 0.4);
        }
        .cta-button:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(142, 45, 226, 0.5); background: var(--cta-hover-bg); }
        .glass-card {
            background: var(--glass-bg); border: 1px solid var(--glass-border);
            border-radius: 16px; backdrop-filter: blur(10px); padding: 2rem;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .glass-card:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        #hero { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding-top: var(--header-height); }
        #hero h1 { font-size: clamp(2.5rem, 5vw, 4.5rem); font-weight: 700; line-height: 1.2; margin-bottom: 1.5rem; max-width: 800px; }
        #hero p { font-size: 1.25rem; color: var(--text-secondary); max-width: 600px; margin-bottom: 2.5rem; }
        .grid-2-col { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 3rem; align-items: center; }
        .solution-list { list-style: none; }
        .solution-list li { margin-bottom: 1rem; padding-left: 2rem; position: relative; color: var(--text-secondary); }
        .solution-list li::before { content: '✓'; position: absolute; left: 0; color: var(--primary-glow); font-weight: bold; }
        .steps-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; }
        .step-card { text-align: center; }
        .step-card .step-number { font-size: 3rem; font-weight: 700; color: var(--primary-glow); margin-bottom: 1rem; }
        .benefits-list { list-style: none; columns: 2; column-gap: 2rem; }
        .benefits-list li { margin-bottom: 1rem; padding-left: 2rem; position: relative; color: var(--text-secondary); }
        .benefits-list li::before { content: '✨'; position: absolute; left: 0; }
        .logos { display: flex; justify-content: center; align-items: center; gap: 3rem; flex-wrap: wrap; filter: grayscale(1) invert(1) brightness(1.5); opacity: 0.7; }
        .logos span { font-size: 1.5rem; font-weight: 600; }
        .cta-section { text-align: center; }
        .cta-section .glass-card { max-width: 800px; margin: 0 auto; }
        footer { text-align: center; padding: 2rem 0; color: var(--text-secondary); border-top: 1px solid var(--glass-border); }
        
        /* Modal Styles */
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); backdrop-filter: blur(5px); display: flex; justify-content: center; align-items: center; z-index: 2000; opacity: 0; animation: fadeIn 0.3s forwards; }
        .modal-content { width: 90%; max-width: 450px; }
        .form-group { margin-bottom: 1.5rem; }
        .form-group label { display: block; margin-bottom: 0.5rem; color: var(--text-secondary); }
        .form-group input {
            width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border);
            border-radius: 8px; padding: 0.9rem; color: var(--text-primary);
            font-family: 'Poppins', sans-serif; font-size: 1rem;
        }
        
        @media (max-width: 900px) { .nav-links { display: none; } }
        @media (max-width: 768px) { .section-title { font-size: 2rem; } .benefits-list { columns: 1; } section { padding: 4rem 0; } #hero { padding-top: 5rem; } }
    `;
    return (
        <>
            <style>{styles}</style>
             {showAuthModal && (
                <div className="modal-overlay" onClick={() => onLoginClick(false)}>
                    <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
                        <h2 style={{textAlign: 'center', marginBottom: '2rem'}}>Acceso Clientes</h2>
                        <form onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input type="email" id="email" defaultValue="organizador@evento.com" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Contraseña</label>
                                <input type="password" id="password" defaultValue="password" required />
                            </div>
                            <button type="submit" className="cta-button" style={{width: '100%'}}>Iniciar Sesión</button>
                            <p style={{textAlign: 'center', color: 'var(--text-secondary)', marginTop: '1rem'}}>¿No tienes cuenta? <a href="#" style={{color: 'var(--primary-glow)'}}>Regístrate</a></p>
                        </form>
                    </div>
                </div>
            )}
            <header>
                <nav>
                    <a href="#hero" className="logo">EventoIA</a>
                    <ul className="nav-links">
                        <li><a href="#solution">Solución</a></li>
                        <li><a href="#benefits">Beneficios</a></li>
                        <li><a href="#pricing">Planes</a></li>
                    </ul>
                    <button onClick={onLoginClick} className="cta-button">Acceso Clientes</button>
                </nav>
            </header>
            <main>
                <section id="hero">
                    <div className="container">
                        <h1>Convierte tu evento en una experiencia inteligente con IA</h1>
                        <p>Permite que tus asistentes encuentren lo que buscan — stands, información y servicios — simplemente preguntando.</p>
                        <a href="#pricing" className="cta-button" style={{padding: '1rem 2rem'}}>Solicita una demo gratuita</a>
                    </div>
                </section>
                 {/* Other sections... */}
            </main>
            <footer>
                <div className="container"><p>&copy; {new Date().getFullYear()} EventoIA. Todos los derechos reservados.</p></div>
            </footer>
        </>
    );
};

const Dashboard = ({ currentView, setView, events, selectedEvent, onManageEvent, onLogout }) => {
    const [snippetButtonText, setSnippetButtonText] = useState('Copiar Snippet');
    const [logoPreview, setLogoPreview] = useState(null);

    const handleCopySnippet = () => {
        const snippetCode = `<script src="https://eventsmart.ai/widget.js" data-event="${selectedEvent.id}" async></script>`;
        navigator.clipboard.writeText(snippetCode).then(() => {
            setSnippetButtonText('¡Copiado!');
            setTimeout(() => setSnippetButtonText('Copiar Snippet'), 2000);
        });
    };

    const handleLogoChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            setLogoPreview(URL.createObjectURL(event.target.files[0]));
        }
    };
    
    const styles = `
        /* Uses the same root variables from LandingPage */
        body { padding-top: var(--header-height); }
        .dashboard-container { display: flex; }
        .sidebar {
            width: 250px; height: calc(100vh - var(--header-height)); position: fixed;
            background: rgba(10, 7, 26, 0.8); backdrop-filter: blur(10px);
            border-right: 1px solid var(--glass-border); padding: 2rem 1rem;
        }
        .sidebar-nav { list-style: none; }
        .sidebar-nav li button {
            background: none; border: none; color: var(--text-secondary);
            font-family: 'Poppins', sans-serif; font-size: 1rem; width: 100%;
            text-align: left; padding: 1rem; border-radius: 8px; cursor: pointer;
            transition: all 0.3s ease;
        }
        .sidebar-nav li button.active, .sidebar-nav li button:hover {
            background: var(--glass-bg); color: var(--text-primary);
        }
        .main-content {
            margin-left: 250px; width: calc(100% - 250px); padding: 2rem;
            animation: fadeIn 0.5s forwards;
        }
        .page-title { font-size: 2rem; font-weight: 600; margin-bottom: 2rem; }

        /* Event List Styles */
        .event-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
        .event-card { padding: 1.5rem; }
        .event-card h3 { font-size: 1.25rem; margin-bottom: 0.5rem; }
        .event-card p { color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.9rem; }

        /* Metrics Styles */
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
        .metric-card { text-align: center; }
        .metric-card .value { font-size: 3rem; font-weight: 700; color: var(--primary-glow); }
        .metric-card .label { color: var(--text-secondary); }

        /* Manage Event Styles */
        .grid-2-col { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; align-items: flex-start; }
        .form-group label { display: block; margin-bottom: 0.5rem; color: var(--text-secondary); }
        .form-group input, .form-group textarea {
            width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border);
            border-radius: 8px; padding: 0.75rem; color: var(--text-primary);
        }
        .logo-preview {
            max-width: 150px;
            margin-top: 1rem;
            border-radius: 8px;
            border: 1px solid var(--glass-border);
            padding: 0.5rem;
            background: rgba(0,0,0,0.2);
        }
        pre { background: rgba(0,0,0,0.3); border-radius: 8px; padding: 1rem; white-space: pre-wrap; word-break: break-all; color: #c3a4f8; margin-bottom: 1rem; }
        .integration-card { border: 1px solid var(--primary-glow); }
    `;

    return (
        <>
            <style>{`:root { --dark-bg: #0a071a; --primary-glow: #8e2de2; --secondary-glow: #4a00e0; --text-primary: #ffffff; --text-secondary: #b0a8d9; --glass-bg: rgba(255, 255, 255, 0.05); --glass-border: rgba(255, 255, 255, 0.15); --cta-bg: linear-gradient(90deg, #8e2de2, #4a00e0); --cta-hover-bg: linear-gradient(90deg, #a149f1, #5e15ff); --header-height: 70px; } * { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: 'Poppins', sans-serif; background-color: var(--dark-bg); color: var(--text-primary); } .container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; } header { position: fixed; top: 0; left: 0; width: 100%; z-index: 1000; background: rgba(10, 7, 26, 0.6); backdrop-filter: blur(10px); border-bottom: 1px solid var(--glass-border); } nav { display: flex; justify-content: space-between; align-items: center; height: var(--header-height); max-width: 1200px; margin: 0 auto; padding: 0 2rem;} .logo { font-weight: 700; font-size: 1.5rem; text-decoration: none; color: var(--text-primary); } .cta-button { display: inline-block; padding: 0.8rem 1.8rem; background: var(--cta-bg); color: var(--text-primary); border: none; border-radius: 50px; text-decoration: none; font-weight: 600; cursor: pointer; transition: all 0.3s ease; } .cta-button:hover { background: var(--cta-hover-bg); } .glass-card { background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 16px; backdrop-filter: blur(10px); padding: 2rem; } @keyframes fadeIn { to { opacity: 1; transform: translateY(0); } }`}</style>
            <style>{styles}</style>
            <header>
                <nav>
                    <span className="logo">Panel de EventoIA</span>
                    <button onClick={onLogout} className="cta-button">Cerrar Sesión</button>
                </nav>
            </header>
            <div className="dashboard-container">
                <aside className="sidebar">
                    <ul className="sidebar-nav">
                        <li><button className={currentView === 'events' ? 'active' : ''} onClick={() => setView('events')}>Mis Eventos</button></li>
                        <li><button className={currentView === 'metrics' ? 'active' : ''} onClick={() => setView('metrics')}>Métricas</button></li>
                    </ul>
                </aside>
                <main className="main-content">
                    {currentView === 'events' && (
                        <div>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                                <h1 className="page-title">Mis Eventos</h1>
                                <button className="cta-button">Crear Evento</button>
                            </div>
                            <div className="event-grid">
                                {events.map(event => (
                                    <div key={event.id} className="glass-card event-card">
                                        <h3>{event.name}</h3>
                                        <p>{event.description}</p>
                                        <button onClick={() => onManageEvent(event)} className="cta-button">Gestionar</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                     {currentView === 'metrics' && (
                        <div>
                            <h1 className="page-title">Métricas de {selectedEvent.name}</h1>
                            <div className="metrics-grid">
                                <div className="glass-card metric-card">
                                    <div className="value">12,845</div>
                                    <div className="label">Consultas Totales</div>
                                </div>
                                <div className="glass-card metric-card">
                                    <div className="value">4.7/5</div>
                                    <div className="label">Satisfacción Media</div>
                                </div>
                                 <div className="glass-card metric-card">
                                    <div className="value">92%</div>
                                    <div className="label">Tasa de Resolución</div>
                                </div>
                            </div>
                            <div className="glass-card">
                                <h3>Temas más Consultados</h3>
                                <p style={{color: 'var(--text-secondary)'}}>Ubicaciones (baños, comida), Startups de Sostenibilidad, Horarios de charlas.</p>
                            </div>
                        </div>
                    )}
                    {currentView === 'manageEvent' && (
                         <div>
                            <h1 className="page-title">Gestionar: {selectedEvent.name}</h1>
                             <div className="grid-2-col">
                                <div className="glass-card">
                                    <h3>1. Carga la información</h3>
                                    <div className="form-group">
                                        <label>Logo del Evento (.png, .jpg)</label>
                                        <input type="file" accept="image/png, image/jpeg" onChange={handleLogoChange} />
                                        {logoPreview && <img src={logoPreview} alt="Previsualización del logo" className="logo-preview" />}
                                    </div>
                                    <div className="form-group">
                                        <label>Mapa del Venue (.png, .jpg)</label><input type="file" />
                                    </div>
                                    <div className="form-group">
                                        <label>Base de Datos de Expositores (.csv)</label>
                                        <input type="file" accept=".csv" />
                                    </div>
                                    <button className="cta-button">Procesar Datos</button>
                                </div>
                                <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
                                    <div className="glass-card">
                                        <h3>2. Integra el Asistente</h3>
                                        <p style={{color: 'var(--text-secondary)', marginBottom: '1rem'}}>Copia este snippet en tu web:</p>
                                        <pre><code>{`<script src="https://eventsmart.ai/widget.js" data-event="${selectedEvent.id}" async></script>`}</code></pre>
                                        <button onClick={handleCopySnippet} className="cta-button">{snippetButtonText}</button>
                                        <p style={{color: 'var(--text-secondary)', marginTop: '1.5rem', marginBottom: '1rem'}}>O comparte este enlace directo:</p>
                                        <pre><code style={{wordBreak: 'break-all'}}>{`https://eventsmart.ai/evento/${selectedEvent.slug}`}</code></pre>
                                    </div>
                                    <div className="glass-card integration-card">
                                        <h3>Integración Asistida</h3>
                                        <p style={{color: 'var(--text-secondary)', marginBottom: '1.5rem'}}>Nuestro equipo lo hace por ti. Costo único: €200.</p>
                                        <button className="cta-button">Solicitar Servicio</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);