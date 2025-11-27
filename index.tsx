import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [dashboardView, setDashboardView] = useState('events'); // 'events', 'metrics', 'manageEvent', 'assistant'
    
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
    
    const viewAssistant = (event) => {
        setSelectedEvent(event);
        setDashboardView('assistant');
    };

    if (dashboardView === 'assistant' && isLoggedIn) {
        return <AssistantInterface event={selectedEvent} onBack={() => setDashboardView('events')} />;
    }

    if (!isLoggedIn) {
        return <LandingPage onLoginClick={() => setShowAuthModal(true)} showAuthModal={showAuthModal} onLogin={handleLogin} setShowAuthModal={setShowAuthModal} />;
    }

    return (
        <Dashboard 
            currentView={dashboardView} 
            setView={setDashboardView} 
            events={events}
            selectedEvent={selectedEvent}
            onManageEvent={manageEvent}
            onViewAssistant={viewAssistant}
            onLogout={handleLogout} 
        />
    );
};

const LandingPage = ({ onLoginClick, showAuthModal, onLogin, setShowAuthModal }) => {
    const [attendees, setAttendees] = useState(1000);
    const [estimatedPrice, setEstimatedPrice] = useState(0);
    const [showDemoModal, setShowDemoModal] = useState(false);
    const [demoSubmitted, setDemoSubmitted] = useState(false);

    useEffect(() => {
        const calculatePrice = () => {
            const numAttendees = Number(attendees) || 0;
            if (numAttendees <= 0) {
                setEstimatedPrice(0);
                return;
            }
            const price = ((numAttendees * 5 * 100 * (0.15 / 1000)) + 0.12 + 30) / (1 - 0.6);
            setEstimatedPrice(price);
        };
        calculatePrice();
    }, [attendees]);

    const handleDemoSubmit = (e) => {
        e.preventDefault();
        // Aquí iría la lógica para enviar los datos a un backend
        setDemoSubmitted(true);
        setTimeout(() => {
            setShowDemoModal(false);
            setDemoSubmitted(false);
        }, 3000);
    };

    const scrollToSection = (e, id) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

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
        .logo { font-weight: 700; font-size: 1.5rem; text-decoration: none; color: var(--text-primary); cursor: pointer; }
        .nav-links { display: flex; gap: 2rem; list-style: none; }
        .nav-links a { text-decoration: none; color: var(--text-secondary); transition: color 0.3s; cursor: pointer; }
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
        .benefits-list li { margin-bottom: 1rem; padding-left: 2rem; position: relative; color: var(--text-secondary); break-inside: avoid; }
        .benefits-list li::before { content: '✨'; position: absolute; left: 0; }
        .logos { display: flex; justify-content: center; align-items: center; gap: 3rem; flex-wrap: wrap; filter: grayscale(1) invert(1) brightness(1.5); opacity: 0.7; }
        .logos span { font-size: 1.5rem; font-weight: 600; }
        .cta-section { text-align: center; }
        .cta-section .glass-card { max-width: 800px; margin: 0 auto; }
        footer { text-align: center; padding: 2rem 0; color: var(--text-secondary); border-top: 1px solid var(--glass-border); }
        
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); backdrop-filter: blur(5px); display: flex; justify-content: center; align-items: center; z-index: 2000; opacity: 0; animation: fadeIn 0.3s forwards; }
        .modal-content { width: 90%; max-width: 450px; }
        .form-group { margin-bottom: 1.5rem; }
        .form-group label { display: block; margin-bottom: 0.5rem; color: var(--text-secondary); }
        .form-group input, .form-group textarea {
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
                <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
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
                            <p style={{textAlign: 'center', color: 'var(--text-secondary)', marginTop: '1rem'}}>¿No tienes cuenta? <a href="#" onClick={(e) => { e.preventDefault(); setShowAuthModal(false); setShowDemoModal(true); }} style={{color: 'var(--primary-glow)'}}>Solicita una demo</a></p>
                        </form>
                    </div>
                </div>
            )}

            {showDemoModal && (
                <div className="modal-overlay" onClick={() => setShowDemoModal(false)}>
                    <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
                        {!demoSubmitted ? (
                            <>
                                <h2 style={{textAlign: 'center', marginBottom: '1rem'}}>Solicita una Demo</h2>
                                <p style={{textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem'}}>Descubre cómo EventoIA puede transformar tu próximo evento.</p>
                                <form onSubmit={handleDemoSubmit}>
                                    <div className="form-group">
                                        <label htmlFor="demo-name">Nombre Completo</label>
                                        <input type="text" id="demo-name" placeholder="Tu nombre" required />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="demo-email">Correo Corporativo</label>
                                        <input type="email" id="demo-email" placeholder="nombre@empresa.com" required />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="demo-company">Empresa / Organización</label>
                                        <input type="text" id="demo-company" placeholder="Nombre de tu organización" required />
                                    </div>
                                     <div className="form-group">
                                        <label htmlFor="demo-details">Detalles del Evento (Opcional)</label>
                                        <textarea id="demo-details" rows="3" placeholder="Tipo de evento, fecha estimada, etc."></textarea>
                                    </div>
                                    <button type="submit" className="cta-button" style={{width: '100%'}}>Solicitar Demo Gratuita</button>
                                </form>
                            </>
                        ) : (
                            <div style={{textAlign: 'center', padding: '2rem 0'}}>
                                <div style={{fontSize: '3rem', marginBottom: '1rem'}}>✨</div>
                                <h3>¡Solicitud Recibida!</h3>
                                <p style={{color: 'var(--text-secondary)', margin: '1rem 0'}}>Gracias por tu interés. Uno de nuestros especialistas en eventos se pondrá en contacto contigo en breve.</p>
                                <button onClick={() => setShowDemoModal(false)} className="cta-button">Cerrar</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <header>
                <nav>
                    <a href="#hero" className="logo" onClick={(e) => scrollToSection(e, 'hero')}>EventoIA</a>
                    <ul className="nav-links">
                        <li><a href="#solution" onClick={(e) => scrollToSection(e, 'solution')}>Solución</a></li>
                        <li><a href="#howitworks" onClick={(e) => scrollToSection(e, 'howitworks')}>Cómo Funciona</a></li>
                        <li><a href="#benefits" onClick={(e) => scrollToSection(e, 'benefits')}>Beneficios</a></li>
                        <li><a href="#pricing" onClick={(e) => scrollToSection(e, 'pricing')}>Planes</a></li>
                    </ul>
                    <button onClick={onLoginClick} className="cta-button">Acceso Clientes</button>
                </nav>
            </header>
            <main>
                <section id="hero">
                    <div className="container">
                        <h1>Convierte tu evento en una experiencia inteligente con IA</h1>
                        <p>Permite que tus asistentes encuentren lo que buscan — stands, información y servicios — simplemente preguntando.</p>
                        <button onClick={() => setShowDemoModal(true)} className="cta-button" style={{padding: '1rem 2rem', fontSize: '1.1rem'}}>Solicita una demo gratuita</button>
                    </div>
                </section>
                
                <section id="problem">
                    <div className="container">
                        <h2 className="section-title">El caos de los eventos tradicionales ya quedó atrás</h2>
                        <div className="grid-2-col">
                            <div className="glass-card">
                                <h3>Asistentes Frustrados</h3>
                                <p style={{color: 'var(--text-secondary)'}}>En las ferias, los asistentes se frustran buscando lo que necesitan: nombres poco claros, mapas confusos y tiempo perdido.</p>
                            </div>
                            <div className="glass-card">
                                <h3>Organizadores Desbordados</h3>
                                <p style={{color: 'var(--text-secondary)'}}>Los organizadores pierden oportunidades de conexión y satisfacción del público al no poder responder a todas las dudas de forma instantánea.</p>
                            </div>
                        </div>
                    </div>
                </section>
                
                <section id="solution">
                    <div className="container">
                        <div className="grid-2-col">
                            <div>
                                <h2 className="section-title" style={{textAlign: 'left', marginBottom: '1.5rem'}}>Un asistente virtual que entiende, responde y guía</h2>
                                <p style={{color: 'var(--text-secondary)', marginBottom: '2rem'}}>Nuestra IA responde en lenguaje natural preguntas como:</p>
                                <ul className="solution-list">
                                    <li>“¿Dónde están los baños?”</li>
                                    <li>“¿Qué startups ofrecen soluciones sostenibles?”</li>
                                    <li>“¿Dónde puedo almorzar cerca?”</li>
                                </ul>
                                <p style={{color: 'var(--text-secondary)', marginTop: '1rem'}}>Todo sin apps adicionales, directamente desde la web o app del evento.</p>
                                <button onClick={() => setShowDemoModal(true)} className="cta-button" style={{marginTop: '2rem'}}>Quiero activarlo en mi evento</button>
                            </div>
                            <div className="glass-card" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                {/* Fixed type error: width and height must be numbers */}
                                <svg xmlns="http://www.w3.org/2000/svg" width={120} height={120} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--primary-glow)'}}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                            </div>
                        </div>
                    </div>
                </section>
                
                <section id="howitworks">
                    <div className="container">
                        <h2 className="section-title">Así funciona nuestra tecnología</h2>
                        <div className="steps-grid">
                            <div className="glass-card step-card">
                                <div className="step-number">1</div>
                                <h3>Conecta tus datos</h3>
                                <p style={{color: 'var(--text-secondary)'}}>Sube tu base de expositores y servicios en minutos.</p>
                            </div>
                             <div className="glass-card step-card">
                                <div className="step-number">2</div>
                                <h3>Entrenamos la IA</h3>
                                <p style={{color: 'var(--text-secondary)'}}>Nuestra plataforma procesa la información de tu evento.</p>
                            </div>
                             <div className="glass-card step-card">
                                <div className="step-number">3</div>
                                <h3>Lanzamiento</h3>
                                <p style={{color: 'var(--text-secondary)'}}>Tus asistentes interactúan en tiempo real con el asistente.</p>
                            </div>
                        </div>
                    </div>
                </section>
                
                <section id="benefits">
                    <div className="container">
                        <h2 className="section-title">Resultados medibles para todos</h2>
                        <div className="glass-card">
                            <ul className="benefits-list">
                                <li>Aumenta la satisfacción de los asistentes.</li>
                                <li>Mejora la visibilidad de los expositores.</li>
                                <li>Reduce las consultas operativas al staff.</li>
                                <li>Recoge insights valiosos sobre intereses.</li>
                                <li>Posiciona tu evento como pionero en innovación.</li>
                                <li>Mejora la experiencia post-evento.</li>
                            </ul>
                        </div>
                    </div>
                </section>
                
                <section id="social-proof">
                    <div className="container">
                         <h2 className="section-title">Organizadores que ya confían en nosotros</h2>
                         <div className="logos">
                             <span>TechCrunch</span>
                             <span>Web Summit</span>
                             <span>CES</span>
                             <span>MWC</span>
                         </div>
                    </div>
                </section>
                
                <section id="pricing">
                    <div className="container cta-section">
                        <div className="glass-card">
                             <h2 className="section-title" style={{marginTop: 0, marginBottom: '1.5rem'}}>Planes flexibles para tu evento</h2>
                             <p style={{color: 'var(--text-secondary)', marginBottom: '2.5rem'}}>Paga solo por el número de asistentes o el volumen de consultas. Obtén una estimación instantánea.</p>
                             
                             <div style={{maxWidth: '500px', margin: '0 auto 2.5rem auto'}}>
                                <div className="form-group">
                                   <label htmlFor="attendees" style={{textAlign: 'left'}}>Número de Asistentes: <strong>{Number(attendees).toLocaleString('es-ES')}</strong></label>
                                   <input 
                                     type="range" 
                                     id="attendees" 
                                     min="500" 
                                     max="50000" 
                                     step="500" 
                                     value={attendees} 
                                     onChange={(e) => setAttendees(Number(e.target.value))}
                                     style={{width: '100%', marginTop: '0.5rem'}}
                                   />
                                </div>
                                <div style={{marginTop: '2rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px'}}>
                                    <p style={{color: 'var(--text-secondary)', fontSize: '1rem'}}>Precio Estimado:</p>
                                    <p style={{color: 'var(--text-primary)', fontSize: '2.5rem', fontWeight: 'bold'}}>
                                        {estimatedPrice.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                                    </p>
                                </div>
                             </div>
                             
                             <button onClick={() => setShowDemoModal(true)} className="cta-button">Obtén una cotización personalizada</button>
                        </div>
                    </div>
                </section>
                
                <section id="final-cta" style={{paddingBottom: '8rem'}}>
                     <div className="container cta-section">
                         <h2 className="section-title">Lleva tu feria al siguiente nivel</h2>
                         <p style={{color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2.5rem auto'}}>Deja que la inteligencia artificial se encargue de las preguntas, y tú de crear experiencias memorables.</p>
                         <button onClick={() => setShowDemoModal(true)} className="cta-button" style={{padding: '1rem 2rem'}}>Agenda una demostración</button>
                     </div>
                </section>
            </main>
            <footer>
                <div className="container"><p>&copy; {new Date().getFullYear()} EventoIA. Todos los derechos reservados.</p></div>
            </footer>
        </>
    );
};

const Dashboard = ({ currentView, setView, events, selectedEvent, onManageEvent, onViewAssistant, onLogout }) => {
    
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
        body {
            font-family: 'Poppins', sans-serif; background-color: var(--dark-bg);
            color: var(--text-primary); overflow-x: hidden;
            background-image: radial-gradient(circle at 10% 10%, var(--primary-glow) 0%, transparent-content 30%),
                              radial-gradient(circle at 90% 80%, var(--secondary-glow) 0%, transparent 35%);
            background-attachment: fixed;
        }
        
        .dashboard-header {
            position: fixed; top: 0; left: 0; width: 100%; z-index: 1000; padding: 0 2rem;
            background: rgba(10, 7, 26, 0.6); backdrop-filter: blur(10px);
            border-bottom: 1px solid var(--glass-border); display: flex;
            justify-content: space-between; align-items: center; height: var(--header-height);
        }

        .dashboard-container { display: flex; margin-top: var(--header-height); }
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
            transition: all 0.3s ease; display: flex; align-items: center; gap: 0.75rem;
        }
        .sidebar-nav li button.active, .sidebar-nav li button:hover {
            background: var(--glass-bg); color: var(--text-primary);
        }
        .main-content {
            margin-left: 250px; width: calc(100% - 250px); padding: 2rem;
            animation: fadeIn 0.5s forwards;
        }
        .page-title { font-size: 2rem; font-weight: 600; margin-bottom: 2rem; }

        .glass-card {
            background: var(--glass-bg); border: 1px solid var(--glass-border);
            border-radius: 16px; backdrop-filter: blur(10px); padding: 2rem;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .cta-button {
            display: inline-block; padding: 0.7rem 1.5rem; background: var(--cta-bg);
            color: var(--text-primary); border: none; border-radius: 50px;
            text-decoration: none; font-weight: 600; cursor: pointer;
            transition: all 0.3s ease; box-shadow: 0 5px 20px rgba(74, 0, 224, 0.4);
        }
        .cta-button:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(142, 45, 226, 0.5); background: var(--cta-hover-bg); }
        .form-group { margin-bottom: 1.5rem; }
        .form-group label { display: block; margin-bottom: 0.5rem; color: var(--text-secondary); }
        .form-group input, .form-group textarea {
            width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border);
            border-radius: 8px; padding: 0.75rem; color: var(--text-primary);
        }
        .logo-preview { max-width: 150px; margin-top: 1rem; border-radius: 8px; border: 1px solid var(--glass-border); }

        .event-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; }
        .event-card { padding: 1.5rem; }
        .event-card h3 { font-size: 1.25rem; margin-bottom: 0.5rem; }
        .event-card p { color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.9rem; min-height: 40px; }
        .event-card-footer { display: flex; gap: 1rem; flex-wrap: wrap; }

        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
        .metric-card { text-align: center; }
        .metric-card .value { font-size: 3rem; font-weight: 700; color: var(--primary-glow); }
        .metric-card .label { color: var(--text-secondary); }
        
        .manage-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; align-items: flex-start; }
    `;
    
    const EventsList = () => (
        <div>
            <h1 className="page-title">Mis Eventos</h1>
            <div className="event-grid">
                {events.map(event => (
                    <div key={event.id} className="glass-card event-card">
                        <h3>{event.name}</h3>
                        <p>{event.description}</p>
                        <div className="event-card-footer">
                           <button onClick={() => onManageEvent(event)} className="cta-button">Gestionar</button>
                           <button onClick={() => onViewAssistant(event)} className="cta-button" style={{background: 'var(--glass-bg)', border: '1px solid var(--glass-border)'}}>Previsualizar Asistente</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const MetricsDashboard = () => (
        <div>
            <h1 className="page-title">Métricas de {selectedEvent.name}</h1>
            <div className="metrics-grid">
                <div className="glass-card metric-card">
                    <div className="value">12,482</div>
                    <div className="label">Consultas Totales</div>
                </div>
                <div className="glass-card metric-card">
                    <div className="value">4.8/5</div>
                    <div className="label">Satisfacción Media</div>
                </div>
                <div className="glass-card metric-card">
                     <div className="value">Stands</div>
                    <div className="label">Tema Más Consultado</div>
                </div>
            </div>
            <div className="glass-card">
                 <h3>Volumen de Preguntas (Últimos 7 días)</h3>
                 {/* Placeholder for a chart */}
                 <div style={{height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)'}}>Gráfico Próximamente</div>
            </div>
        </div>
    );

    const ManageEvent = () => {
        const [snippetButtonText, setSnippetButtonText] = useState('Copiar Snippet');
        const [logoPreview, setLogoPreview] = useState(null);

        const snippetCode = `
<div id="eventoia-fab" style="position: fixed; bottom: 20px; right: 20px; z-index: 1000; cursor: pointer;">
  <div style="width: 60px; height: 60px; background: linear-gradient(90deg, #8e2de2, #4a00e0); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 5px 20px rgba(74, 0, 224, 0.4);">
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect x="4" y="12" width="16" height="8" rx="2"/><path d="M2 12h20"/><path d="M17.5 12V4a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v8"/></svg>
  </div>
</div>
<script>
  document.getElementById('eventoia-fab').addEventListener('click', function() {
    window.open('https://eventfinder-43348506292.us-west1.run.app/eventos/asistente/${selectedEvent.slug}', '_blank');
  });
</script>
        `.trim();

        const handleCopySnippet = () => {
            navigator.clipboard.writeText(snippetCode).then(() => {
                setSnippetButtonText('¡Copiado!');
                setTimeout(() => setSnippetButtonText('Copiar Snippet'), 2000);
            });
        };

        const handleLogoChange = (event) => {
            if (event.target.files && event.target.files[0]) {
                const file = event.target.files[0];
                setLogoPreview(URL.createObjectURL(file));
            }
        };

        return (
             <div>
                <h1 className="page-title">Gestionar: {selectedEvent.name}</h1>
                <div className="manage-grid">
                    <div className="glass-card">
                        <h3>Datos del Evento</h3>
                        <div className="form-group">
                            <label htmlFor="csv-upload">Base de Datos de Expositores (.csv)</label>
                             <input type="file" id="csv-upload" accept=".csv" style={{padding: '0.5rem', background: 'transparent', border: 'none'}} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="logo-upload">Logo del Evento</label>
                            <input type="file" id="logo-upload" accept="image/*" onChange={handleLogoChange} style={{padding: '0.5rem', background: 'transparent', border: 'none'}}/>
                            {logoPreview && <img src={logoPreview} alt="Vista previa del logo" className="logo-preview" />}
                        </div>
                         <button className="cta-button">Guardar Cambios</button>
                    </div>
                    <div className="glass-card">
                        <h3>Integración del Asistente</h3>
                        <div className="form-group">
                            <label>Enlace público al asistente</label>
                            <input type="text" readOnly value={`https://.../asistente/${selectedEvent.slug}`} />
                        </div>
                        <div className="form-group">
                            <label>Snippet de Integración (Botón flotante)</label>
                            <textarea readOnly value={snippetCode} rows="8"></textarea>
                        </div>
                        <button onClick={handleCopySnippet} className="cta-button">{snippetButtonText}</button>
                    </div>
                </div>
                 <div className="glass-card" style={{marginTop: '2rem'}}>
                    <h3>Servicio de Integración Asistida</h3>
                    <p style={{color: 'var(--text-secondary)', marginBottom: '1.5rem'}}>¿Prefieres que nuestro equipo haga la integración por ti? Solicita nuestro servicio técnico por €200.</p>
                    <button className="cta-button">Solicitar Integración</button>
                </div>
            </div>
        );
    };

    return (
        <>
            <style>{styles}</style>
            <header className="dashboard-header">
                <span className="logo">EventoIA</span>
                <button onClick={onLogout} className="cta-button">Cerrar Sesión</button>
            </header>
            <div className="dashboard-container">
                <aside className="sidebar">
                    <nav>
                        <ul className="sidebar-nav">
                            <li><button onClick={() => setView('events')} className={currentView === 'events' ? 'active' : ''}>
                                {/* Fixed type error: width and height must be numbers */}
                                <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                                Mis Eventos</button></li>
                            <li><button onClick={() => setView('metrics')} className={currentView === 'metrics' ? 'active' : ''}>
                                <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
                                Métricas</button></li>
                        </ul>
                    </nav>
                </aside>
                <main className="main-content">
                    {currentView === 'events' && <EventsList />}
                    {currentView === 'metrics' && <MetricsDashboard />}
                    {currentView === 'manageEvent' && <ManageEvent />}
                </main>
            </div>
        </>
    );
};

const AssistantInterface = ({ event, onBack }) => {
    const [messages, setMessages] = useState([
        { from: 'ai', text: `¡Hola! Soy el asistente de IA para ${event.name}. ¿Cómo puedo ayudarte hoy?` }
    ]);
    const [input, setInput] = useState('');

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const newMessages = [...messages, { from: 'user', text: input }];
        setMessages(newMessages);
        setInput('');

        // Simulación de respuesta de IA
        setTimeout(() => {
            const aiResponse = `Estoy buscando información sobre "${input}". Un momento por favor...`;
            setMessages(prev => [...prev, { from: 'ai', text: aiResponse }]);
        }, 1000);
    };

    const styles = `
        .assistant-container {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background-color: var(--dark-bg);
            background-image: radial-gradient(circle at 10% 10%, var(--primary-glow) 0%, transparent 30%),
                              radial-gradient(circle at 90% 80%, var(--secondary-glow) 0%, transparent 35%);
            display: flex; flex-direction: column; justify-content: center; align-items: center;
            animation: fadeIn 0.5s forwards;
        }
        .assistant-window {
            width: 90%; max-width: 800px; height: 80vh; max-height: 700px;
            display: flex; flex-direction: column;
        }
        .assistant-header {
             padding: 1rem 1.5rem; border-bottom: 1px solid var(--glass-border);
             display: flex; justify-content: space-between; align-items: center;
        }
        .chat-history { flex-grow: 1; overflow-y: auto; padding: 1.5rem; }
        .message { margin-bottom: 1rem; display: flex; max-width: 80%; }
        .message.user { align-self: flex-end; flex-direction: row-reverse; }
        .message.ai { align-self: flex-start; }
        .message-bubble { padding: 0.8rem 1.2rem; border-radius: 20px; }
        .message.user .message-bubble { background: var(--cta-bg); color: var(--text-primary); border-bottom-right-radius: 5px; }
        .message.ai .message-bubble { background: var(--glass-bg); border: 1px solid var(--glass-border); color: var(--text-secondary); border-bottom-left-radius: 5px; }
        .chat-input-form { display: flex; gap: 1rem; padding: 1.5rem; border-top: 1px solid var(--glass-border); }
        .chat-input {
            flex-grow: 1; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border);
            border-radius: 50px; padding: 0.8rem 1.5rem; color: var(--text-primary);
            font-size: 1rem;
        }
    `;

    return (
        <>
            <style>{`
                :root {
                    --dark-bg: #0a071a; --primary-glow: #8e2de2; --secondary-glow: #4a00e0;
                    --text-primary: #ffffff; --text-secondary: #b0a8d9; --glass-bg: rgba(255, 255, 255, 0.05);
                    --glass-border: rgba(255, 255, 255, 0.15); --cta-bg: linear-gradient(90deg, #8e2de2, #4a00e0);
                }
                @keyframes fadeIn { to { opacity: 1; transform: translateY(0); } }
            `}</style>
            <style>{styles}</style>
            <div className="assistant-container">
                <div className="assistant-window glass-card">
                    <div className="assistant-header">
                        <div>
                            <h3 style={{margin: 0}}>{event.name}</h3>
                            <p style={{margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Asistente Virtual</p>
                        </div>
                        <button onClick={onBack} className="cta-button" style={{padding: '0.5rem 1rem'}}>Volver al Panel</button>
                    </div>
                    <div className="chat-history">
                       {messages.map((msg, index) => (
                           <div key={index} className={`message ${msg.from}`}>
                               <div className="message-bubble">{msg.text}</div>
                           </div>
                       ))}
                    </div>
                    <form onSubmit={handleSend} className="chat-input-form">
                        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Escribe tu pregunta aquí..." className="chat-input" />
                        <button type="submit" className="cta-button">Enviar</button>
                    </form>
                </div>
            </div>
        </>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);