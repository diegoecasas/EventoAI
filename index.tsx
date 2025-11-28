import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

const EventsList = ({ events, onManageEvent, onViewAssistant, onDuplicateEvent, onDeleteEvent, setView }) => (
    <div>
        <h1 className="page-title">Mis Eventos</h1>
        <div className="event-grid">
            {events.map(event => (
                <div key={event.id} className="glass-card event-card">
                    <h3>{event.name}</h3>
                    <p>{event.description}</p>
                    <div className="event-card-footer">
                       <button onClick={() => onManageEvent(event)} className="cta-button">Gestionar</button>
                       <button onClick={() => onViewAssistant(event)} className="cta-button" style={{background: 'var(--glass-bg)', border: '1px solid var(--glass-border)'}}>Previsualizar</button>
                       
                       <div style={{marginLeft: 'auto', display: 'flex', gap: '0.5rem'}}>
                            <button onClick={() => onDuplicateEvent(event)} className="icon-btn" title="Duplicar Evento">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            </button>
                            <button onClick={() => onDeleteEvent(event.id)} className="icon-btn delete" title="Eliminar Evento">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>
                       </div>
                    </div>
                </div>
            ))}
            {/* New Event Card */}
            <div className="glass-card event-card" style={{borderStyle: 'dashed', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: 0.8, minHeight: '230px'}} onClick={() => setView('createEvent')}>
                <div style={{fontSize: '3rem', color: 'var(--primary-glow)', marginBottom: '0.5rem'}}>+</div>
                <h3 style={{color: 'var(--text-secondary)'}}>Crear Nuevo Evento</h3>
            </div>
        </div>
    </div>
);

const CreateEvent = ({ onCreateEvent, setView }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreateEvent({ name, description });
    };

    return (
        <div>
            <h1 className="page-title">Crear Nuevo Evento</h1>
            <div className="glass-card" style={{maxWidth: '600px'}}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="event-name">Nombre del Evento</label>
                        <input 
                            type="text" 
                            id="event-name" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            placeholder="Ej: TechConference 2024" 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="event-desc">Descripción Breve</label>
                        <textarea 
                            id="event-desc" 
                            rows={3} 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            placeholder="Describe el propósito del evento..."
                            required
                        ></textarea>
                    </div>
                    <div style={{display:'flex', gap:'1rem', marginTop:'2rem'}}>
                         <button type="submit" className="cta-button">Crear Evento</button>
                         <button type="button" className="cta-button" style={{background:'transparent', border:'1px solid var(--glass-border)'}} onClick={() => setView('events')}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const MetricsDashboard = ({ selectedEvent }) => (
    <div>
        <h1 className="page-title">Métricas de {selectedEvent?.name}</h1>
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
             <div style={{height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)'}}>Gráfico Próximamente</div>
        </div>
    </div>
);

const ManageEvent = ({ selectedEvent, onUpdateEvent }) => {
    const [snippetButtonText, setSnippetButtonText] = useState('Copiar Snippet');
    const [linkButtonText, setLinkButtonText] = useState('Copiar');
    const [logoPreview, setLogoPreview] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle'); // idle, success
    const [csvFile, setCsvFile] = useState(null);
    const [agendaFile, setAgendaFile] = useState(null);

    // Ensure robust URL generation avoiding double slashes or undefined window issues
    const getBaseUrl = () => {
        if (typeof window === 'undefined') return '';
        // Get full URL, remove hash, remove trailing slash
        const url = new URL(window.location.href);
        url.hash = '';
        return url.href.replace(/\/$/, '');
    };
    
    const publicLink = `${getBaseUrl()}/#/event/${selectedEvent.slug}`;

    const snippetCode = `
<div id="eventoia-fab" style="position: fixed; bottom: 20px; right: 20px; z-index: 1000; cursor: pointer;">
<div style="width: 60px; height: 60px; background: linear-gradient(90deg, #8e2de2, #4a00e0); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 5px 20px rgba(74, 0, 224, 0.4);">
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect x="4" y="12" width="16" height="8" rx="2"/><path d="M2 12h20"/><path d="M17.5 12V4a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v8"/></svg>
</div>
</div>
<script>
document.getElementById('eventoia-fab').addEventListener('click', function() {
window.open('${publicLink}', '_blank');
});
</script>
    `.trim();

    const handleCopySnippet = () => {
        navigator.clipboard.writeText(snippetCode).then(() => {
            setSnippetButtonText('¡Copiado!');
            setTimeout(() => setSnippetButtonText('Copiar Snippet'), 2000);
        });
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(publicLink).then(() => {
            setLinkButtonText('¡Copiado!');
            setTimeout(() => setLinkButtonText('Copiar'), 2000);
        });
    };

    const handleLogoChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setCsvFile(e.target.files[0]);
        }
    };
    
    const handleAgendaFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setAgendaFile(e.target.files[0]);
        }
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        setSaveStatus('idle');
        
        let contextData = selectedEvent.csvContext || '';
        let agendaData = selectedEvent.agendaContext || '';

        // Read Exhibitors CSV
        if (csvFile) {
            try {
                contextData = await csvFile.text();
            } catch (error) {
                console.error("Error reading Exhibitor CSV:", error);
            }
        }
        
        // Read Agenda CSV
        if (agendaFile) {
            try {
                agendaData = await agendaFile.text();
            } catch (error) {
                console.error("Error reading Agenda CSV:", error);
            }
        }

        // Update the event
        const updatedEvent = {
            ...selectedEvent,
            csvContext: contextData,
            agendaContext: agendaData
        };
        
        // Pass the update back to App to persist in localStorage
        if (onUpdateEvent) {
            onUpdateEvent(updatedEvent);
        }

        // Simulation of API call latency
        setTimeout(() => {
            setIsSaving(false);
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 4000);
        }, 1000);
    };

    return (
            <div>
            <h1 className="page-title">Gestionar: {selectedEvent.name}</h1>
            <div className="manage-grid">
                <div className="glass-card">
                    <h3>Datos del Evento</h3>
                    <div className="form-group">
                        <label htmlFor="csv-upload">Base de Datos de Expositores/Servicios (.csv)</label>
                        <input type="file" id="csv-upload" accept=".csv" onChange={handleFileChange} style={{padding: '0.5rem', background: 'transparent', border: 'none'}} />
                        {selectedEvent.csvContext && <p style={{fontSize: '0.8rem', color: '#00ff7f', marginTop: '0.5rem'}}>✓ Datos cargados</p>}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="agenda-upload">Agenda del Evento (.csv)</label>
                        <p style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem'}}>
                            Formato recomendado: Hora, Título, Descripción
                        </p>
                        <input type="file" id="agenda-upload" accept=".csv" onChange={handleAgendaFileChange} style={{padding: '0.5rem', background: 'transparent', border: 'none'}} />
                        {selectedEvent.agendaContext && <p style={{fontSize: '0.8rem', color: '#00ff7f', marginTop: '0.5rem'}}>✓ Agenda cargada</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="logo-upload">Logo del Evento</label>
                        <input type="file" id="logo-upload" accept="image/*" onChange={handleLogoChange} style={{padding: '0.5rem', background: 'transparent', border: 'none'}}/>
                        {logoPreview && <img src={logoPreview} alt="Vista previa del logo" className="logo-preview" />}
                    </div>
                        <button 
                        className="cta-button" 
                        onClick={handleSaveChanges} 
                        disabled={isSaving}
                        style={{width: '100%', position: 'relative', overflow: 'hidden'}}
                    >
                        {isSaving ? 'Procesando & Sincronizando...' : 'Guardar Cambios'}
                    </button>
                    {saveStatus === 'success' && (
                        <div style={{marginTop: '1rem', padding: '0.8rem', background: 'rgba(0, 255, 127, 0.1)', border: '1px solid rgba(0, 255, 127, 0.3)', borderRadius: '8px', color: '#00ff7f', textAlign: 'center', animation: 'fadeIn 0.5s'}}>
                            <strong>¡Sincronización Exitosa!</strong><br/>
                            <span style={{fontSize: '0.85rem'}}>Agenda y datos actualizados correctamente.</span>
                        </div>
                    )}
                </div>
                <div className="glass-card">
                    <h3>Integración del Asistente</h3>
                    <div className="form-group">
                        <label>Enlace público para Asistentes</label>
                        <div style={{display: 'flex', gap: '0.5rem'}}>
                            <input type="text" readOnly value={publicLink} />
                            <button onClick={() => window.open(publicLink, '_blank')} className="cta-button" style={{padding: '0.5rem 1rem', fontSize: '0.9rem'}}>Probar</button>
                            <button onClick={handleCopyLink} className="cta-button" style={{padding: '0.5rem 1rem', fontSize: '0.9rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)'}}>{linkButtonText}</button>
                        </div>
                        <p style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem'}}>
                            * Comparte este enlace con tus asistentes para que accedan a la página del evento.
                        </p>
                    </div>
                    <div className="form-group">
                        <label>Snippet de Integración (Botón flotante)</label>
                        <textarea readOnly value={snippetCode} rows={8}></textarea>
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

const Dashboard = ({ currentView, setView, events, selectedEvent, onManageEvent, onViewAssistant, onLogout, onCreateEvent, onDuplicateEvent, onDeleteEvent, onUpdateEvent }) => {
    
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
            background-image: radial-gradient(circle at 10% 10%, var(--primary-glow) 0%, transparent 30%),
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
        .cta-button:disabled { opacity: 0.7; cursor: not-allowed; transform: none; box-shadow: none; }
        
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
        .event-card-footer { display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; }
        
        .icon-btn {
            background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border);
            border-radius: 50%; width: 40px; height: 40px; display: flex; justify-content: center; align-items: center;
            color: var(--text-secondary); cursor: pointer; transition: all 0.3s;
        }
        .icon-btn:hover { background: var(--glass-bg); color: var(--text-primary); transform: translateY(-2px); }
        .icon-btn.delete:hover { background: rgba(255, 77, 77, 0.2); border-color: rgba(255, 77, 77, 0.4); color: #ff4d4d; }

        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
        .metric-card { text-align: center; }
        .metric-card .value { font-size: 3rem; font-weight: 700; color: var(--primary-glow); }
        .metric-card .label { color: var(--text-secondary); }
        
        .manage-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; align-items: flex-start; }
    `;
    
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
                                <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                                Mis Eventos</button></li>
                            <li><button onClick={() => setView('metrics')} className={currentView === 'metrics' ? 'active' : ''}>
                                <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
                                Métricas</button></li>
                        </ul>
                    </nav>
                </aside>
                <main className="main-content">
                    {currentView === 'events' && (
                        <EventsList 
                            events={events} 
                            onManageEvent={onManageEvent} 
                            onViewAssistant={onViewAssistant}
                            onDuplicateEvent={onDuplicateEvent}
                            onDeleteEvent={onDeleteEvent}
                            setView={setView}
                        />
                    )}
                    {currentView === 'createEvent' && (
                        <CreateEvent onCreateEvent={onCreateEvent} setView={setView} />
                    )}
                    {currentView === 'metrics' && (
                        <MetricsDashboard selectedEvent={selectedEvent} />
                    )}
                    {currentView === 'manageEvent' && (
                        <ManageEvent selectedEvent={selectedEvent} onUpdateEvent={onUpdateEvent} />
                    )}
                </main>
            </div>
        </>
    );
};

const PublicEventPage = ({ event, onStartAssistant, onClose = undefined }) => {
    const [showAgenda, setShowAgenda] = useState(false);

    // Parse agenda from agendaContext (preferred) or csvContext (fallback)
    const agendaItems = useMemo(() => {
        // Source data: prioritize specific agenda file, fall back to general CSV
        const sourceData = event.agendaContext || event.csvContext;

        if (!sourceData) {
            // Default demo agenda if no data is present
            return [
                { time: '09:00', title: 'Registro y Networking', description: 'Hall Principal' },
                { time: '10:00', title: 'Apertura: El Futuro de la IA', description: 'Auditorio A - Keynote Speaker' },
                { time: '11:30', title: 'Break / Café', description: 'Zona de Catering' },
                { time: '12:00', title: 'Panel: Sostenibilidad Tech', description: 'Sala B' },
                { time: '13:30', title: 'Almuerzo Libre', description: 'Food Trucks' },
                { time: '15:00', title: 'Workshop: Robótica', description: 'Lab 1' },
                { time: '17:00', title: 'Cierre y Premios', description: 'Auditorio Principal' },
            ];
        }

        const lines = sourceData.split('\n');
        const items = [];
        const timeRegex = /\b([0-1]?[0-9]|2[0-3]):[0-5][0-9]\b/;

        lines.forEach(line => {
            if (!line.trim()) return;
            const parts = line.split(',');
            // Heuristic: If a part looks like a time, assume it's an agenda item
            const timePartIndex = parts.findIndex(p => timeRegex.test(p));
            
            if (timePartIndex !== -1 && parts.length > 1) {
                const time = parts[timePartIndex].trim();
                // Assume the longest other part is the title
                const otherParts = parts.filter((_, i) => i !== timePartIndex);
                const title = otherParts.reduce((a, b) => a.length > b.length ? a : b, "").trim();
                const description = otherParts.filter(p => p.trim() !== title).join(' ').trim();
                
                items.push({ time, title, description });
            }
        });

        // If parsing failed to find items
        if (items.length === 0) {
             return [
                { time: '--:--', title: 'Agenda no disponible', description: 'Verifica el formato de tu archivo CSV (Hora, Título, Descripción).' }
            ];
        }

        return items.sort((a, b) => a.time.localeCompare(b.time));
    }, [event.agendaContext, event.csvContext]);

    const styles = `
        .public-page-container {
            min-height: 100vh;
            background-color: #0a071a;
            background-image: radial-gradient(circle at 10% 10%, #8e2de2 0%, transparent 30%),
                              radial-gradient(circle at 90% 80%, #4a00e0 0%, transparent 35%);
            background-attachment: fixed;
            color: #ffffff;
            font-family: 'Poppins', sans-serif;
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            padding: 2rem;
            animation: fadeIn 0.8s ease-out;
            position: relative;
            overflow: hidden;
        }
        .event-hero {
            text-align: center; max-width: 600px;
            margin-bottom: 3rem;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            padding: 3rem 2rem; border-radius: 24px;
            box-shadow: 0 15px 40px rgba(0,0,0,0.4);
            z-index: 10;
        }
        .event-title {
            font-size: 3rem; font-weight: 700;
            background: linear-gradient(90deg, #fff, #b0a8d9);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            margin-bottom: 1rem;
        }
        .event-status {
            display: inline-block; padding: 0.4rem 1rem;
            border-radius: 20px; font-size: 0.9rem;
            background: rgba(142, 45, 226, 0.2);
            color: #e0c3fc; border: 1px solid rgba(142, 45, 226, 0.4);
            margin-bottom: 1.5rem;
        }
        .start-button {
            background: linear-gradient(90deg, #8e2de2, #4a00e0);
            color: white; border: none; padding: 1.2rem 2.5rem;
            border-radius: 50px; font-size: 1.2rem; font-weight: 600;
            cursor: pointer; box-shadow: 0 5px 20px rgba(74, 0, 224, 0.5);
            transition: transform 0.2s, box-shadow 0.2s;
            display: flex; align-items: center; justify-content: center; gap: 0.8rem;
            width: 100%;
        }
        .start-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 30px rgba(142, 45, 226, 0.6);
        }
        .features-grid {
            display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;
            margin-top: 2rem; width: 100%;
        }
        .feature-item {
            background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 12px;
            text-align: center; border: 1px solid rgba(255,255,255,0.05);
            cursor: pointer; transition: background 0.3s;
        }
        .feature-item:hover {
            background: rgba(255,255,255,0.1);
        }
        .close-preview-btn {
            position: fixed; top: 20px; right: 20px; z-index: 1000;
            padding: 0.6rem 1.2rem; background: rgba(0,0,0,0.6); color: white;
            border: 1px solid rgba(255,255,255,0.2); border-radius: 30px; cursor: pointer;
            backdrop-filter: blur(5px); font-size: 0.9rem;
            transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem;
        }
        .close-preview-btn:hover { background: rgba(255, 77, 77, 0.3); border-color: rgba(255, 77, 77, 0.5); }
        
        /* Agenda Styles */
        .agenda-overlay {
            position: fixed; bottom: 0; left: 0; width: 100%; height: 85vh;
            background: rgba(10, 7, 26, 0.95);
            backdrop-filter: blur(20px);
            border-top-left-radius: 24px; border-top-right-radius: 24px;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
            z-index: 100;
            transform: translateY(100%);
            transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            display: flex; flex-direction: column;
        }
        .agenda-overlay.open {
            transform: translateY(0);
        }
        .agenda-header {
            padding: 1.5rem 2rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            display: flex; justify-content: space-between; align-items: center;
        }
        .agenda-content {
            flex-grow: 1; overflow-y: auto; padding: 1rem 2rem;
        }
        .agenda-item {
            display: flex; gap: 1.5rem; padding: 1.2rem 0;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .agenda-time {
            font-size: 1.1rem; font-weight: 700; color: #b0a8d9;
            min-width: 60px;
        }
        .agenda-details h4 {
            font-size: 1.1rem; margin-bottom: 0.3rem; color: #fff;
        }
        .agenda-details p {
            font-size: 0.9rem; color: #8e8e9e;
        }
        .close-agenda {
            background: none; border: none; color: #fff; font-size: 1.5rem; cursor: pointer;
        }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @media(max-width: 600px) { .event-title { font-size: 2rem; } .agenda-item { flex-direction: column; gap: 0.5rem; } }
    `;

    return (
        <div className="public-page-container">
            <style>{styles}</style>
            
            {onClose && (
                <button onClick={onClose} className="close-preview-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    Cerrar Vista Previa
                </button>
            )}

            <div className="event-hero">
                <div className="event-status">Evento Activo</div>
                <h1 className="event-title">{event.name}</h1>
                <p style={{color: '#b0a8d9', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: '1.6'}}>
                    {event.description}
                </p>
                
                <button onClick={onStartAssistant} className="start-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    Abrir Asistente Virtual
                </button>

                <div className="features-grid">
                    <div className="feature-item">
                        <div style={{fontSize:'1.5rem', marginBottom:'0.5rem'}}>📍</div>
                        <div style={{fontSize:'0.9rem', color:'#b0a8d9'}}>Mapa Interactivo</div>
                    </div>
                    <div className="feature-item" onClick={() => setShowAgenda(true)}>
                        <div style={{fontSize:'1.5rem', marginBottom:'0.5rem'}}>📅</div>
                        <div style={{fontSize:'0.9rem', color:'#b0a8d9'}}>Agenda en Vivo</div>
                    </div>
                </div>
            </div>

            {/* Agenda Overlay Component */}
            <div className={`agenda-overlay ${showAgenda ? 'open' : ''}`}>
                <div className="agenda-header">
                    <h2 style={{fontSize: '1.5rem', margin: 0}}>Agenda del Evento</h2>
                    <button onClick={() => setShowAgenda(false)} className="close-agenda">×</button>
                </div>
                <div className="agenda-content">
                    {agendaItems.map((item, index) => (
                        <div key={index} className="agenda-item">
                            <div className="agenda-time">{item.time}</div>
                            <div className="agenda-details">
                                <h4>{item.title}</h4>
                                <p>{item.description}</p>
                            </div>
                        </div>
                    ))}
                    {!event.agendaContext && !event.csvContext && (
                        <div style={{textAlign: 'center', padding: '2rem', color: '#b0a8d9', fontSize: '0.8rem', fontStyle: 'italic'}}>
                            * Agenda de demostración. Sube un archivo de Agenda en el panel de gestión para ver tus datos reales.
                        </div>
                    )}
                </div>
            </div>

            <footer style={{position: 'fixed', bottom: '10px', color: '#b0a8d9', fontSize: '0.8rem', opacity: 0.6}}>
                Powered by EventoIA
            </footer>
        </div>
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
                                        <textarea id="demo-details" rows={3} placeholder="Tipo de evento, fecha estimada, etc."></textarea>
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
                                     min={500} 
                                     max={50000} 
                                     step={500} 
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

const AssistantInterface = ({ event, onBack, isPublic = false }) => {
    const [messages, setMessages] = useState([
        { from: 'ai', text: `¡Hola! Soy el asistente de IA para ${event.name}. ¿Cómo puedo ayudarte hoy?` }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input;
        setMessages(prev => [...prev, { from: 'user', text: userMessage }]);
        setInput('');
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // Construct context based on available event data
            const eventContext = event.csvContext 
                ? `Here is the data about exhibitors and services (in CSV/Text format): \n${event.csvContext}` 
                : "No detailed exhibitor data (CSV) has been uploaded yet.";
            
            const agendaContext = event.agendaContext
                ? `Here is the detailed AGENDA/SCHEDULE of the event: \n${event.agendaContext}`
                : "No detailed agenda data has been uploaded yet.";

            const systemInstruction = `You are a helpful, polite, and efficient virtual assistant for the event "${event.name}". 
            Your goal is to assist attendees by answering questions about the agenda, exhibitors, locations, and services based EXCLUSIVELY on the provided context.
            
            CONTEXT DATA:
            ${eventContext}
            
            ${agendaContext}
            
            Rules:
            1. If the answer is found in the provided data, answer concisely.
            2. If the answer is NOT in the data, politely say you don't have that information.
            3. Do not make up information.
            4. Keep responses short and helpful for someone walking around a fair.
            5. Respond in the same language as the user (default to Spanish if unsure).`;

            // We use generateContent to ensure the latest system instruction (with potentially new CSV data) is always used.
            // We pass the conversation history to maintain context.
            const historyParts = messages.map(msg => ({
                role: msg.from === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));

            // Add current message
            historyParts.push({ role: 'user', parts: [{ text: userMessage }] });

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: historyParts,
                config: {
                    systemInstruction: systemInstruction,
                    temperature: 0.2, // Low temperature for factual accuracy based on CSV
                }
            });

            const aiText = response.text;
            setMessages(prev => [...prev, { from: 'ai', text: aiText }]);

        } catch (error) {
            console.error("Error generating AI response:", error);
            setMessages(prev => [...prev, { from: 'ai', text: "Lo siento, tuve un problema al procesar tu solicitud. Por favor intenta de nuevo." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const styles = `
        .assistant-container {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background-color: var(--dark-bg);
            background-image: radial-gradient(circle at 10% 10%, var(--primary-glow) 0%, transparent 30%),
                              radial-gradient(circle at 90% 80%, var(--secondary-glow) 0%, transparent 35%);
            display: flex; flex-direction: column; justify-content: center; align-items: center;
            animation: fadeIn 0.5s forwards;
            z-index: 5000;
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
        .typing-indicator { font-size: 0.8rem; color: var(--text-secondary); padding-left: 1rem; margin-top: -0.5rem; margin-bottom: 0.5rem; font-style: italic; }
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
                        {/* Only show "Back" button if it's the preview mode, or change text if public */}
                        <button onClick={onBack} className="cta-button" style={{padding: '0.5rem 1rem'}}>
                            {isPublic ? 'Volver' : 'Volver al Panel'}
                        </button>
                    </div>
                    <div className="chat-history">
                       {messages.map((msg, index) => (
                           <div key={index} className={`message ${msg.from}`}>
                               <div className="message-bubble">{msg.text}</div>
                           </div>
                       ))}
                       <div ref={messagesEndRef} />
                    </div>
                    {isLoading && <div className="typing-indicator">EventoIA está escribiendo...</div>}
                    <form onSubmit={handleSend} className="chat-input-form">
                        <input 
                            type="text" 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)} 
                            placeholder="Escribe tu pregunta aquí..." 
                            className="chat-input" 
                            disabled={isLoading}
                        />
                        <button type="submit" className="cta-button" disabled={isLoading || !input.trim()}>
                            {isLoading ? '...' : 'Enviar'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    // 'events', 'metrics', 'manageEvent', 'assistant', 'createEvent', 'publicAssistant', 'publicLanding', 'previewLanding', 'previewAssistant'
    const [dashboardView, setDashboardView] = useState('events'); 
    
    // Initialize events from localStorage or default
    const [events, setEvents] = useState(() => {
        const saved = localStorage.getItem('eventoia_events');
        return saved ? JSON.parse(saved) : [
            { id: 1, name: 'INNOVFEST 2024', slug: 'innovfest-2024', description: 'El festival de innovación más grande del año.', status: 'Activo', csvContext: '', agendaContext: '' },
            { id: 2, name: 'TECHSUMMIT Global', slug: 'techsummit-global', description: 'Conectando mentes brillantes en tecnología.', status: 'Finalizado', csvContext: '', agendaContext: '' },
        ];
    });

    const [selectedEvent, setSelectedEvent] = useState(events[0]);

    // Persist events to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('eventoia_events', JSON.stringify(events));
    }, [events]);

    // Handle Hash Routing for Public Links
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            if (hash.startsWith('#/event/')) {
                const slug = hash.replace('#/event/', '');
                const foundEvent = events.find(e => e.slug === slug);
                if (foundEvent) {
                    setSelectedEvent(foundEvent);
                    // Route to the new Public Landing Page for the event instead of direct chat
                    setDashboardView('publicLanding'); 
                }
            } else if (hash === '' && (dashboardView === 'publicLanding' || dashboardView === 'publicAssistant')) {
                 // Return to main flow if hash is cleared
                 setDashboardView('events');
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        // Check on mount
        handleHashChange();

        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [events, dashboardView]);

    const handleLogin = () => {
        setIsLoggedIn(true);
        setShowAuthModal(false);
    };
    
    const handleLogout = () => {
        setIsLoggedIn(false);
        setDashboardView('events');
        window.location.hash = '';
    };

    const manageEvent = (event) => {
        setSelectedEvent(event);
        setDashboardView('manageEvent');
    };
    
    const viewAssistant = (event) => {
        setSelectedEvent(event);
        // Changed: now goes to previewLanding to match public experience
        setDashboardView('previewLanding');
    };

    const handleCreateEvent = (newEventData) => {
        const newEvent = {
            id: Date.now(), // Use timestamp for unique ID
            name: newEventData.name,
            slug: newEventData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') + '-' + Date.now().toString().slice(-4),
            description: newEventData.description,
            status: 'Borrador',
            csvContext: '',
            agendaContext: ''
        };
        const updatedEvents = [...events, newEvent];
        setEvents(updatedEvents);
        setSelectedEvent(newEvent);
        // Trigger save immediately
        localStorage.setItem('eventoia_events', JSON.stringify(updatedEvents));
        setDashboardView('manageEvent');
    };

    const handleUpdateEvent = (updatedEvent) => {
        const updatedEvents = events.map(e => e.id === updatedEvent.id ? updatedEvent : e);
        setEvents(updatedEvents);
        setSelectedEvent(updatedEvent);
        localStorage.setItem('eventoia_events', JSON.stringify(updatedEvents));
    };

    const handleDuplicateEvent = (eventToCopy) => {
        const timestamp = Date.now();
        const newEvent = {
            ...eventToCopy,
            id: timestamp,
            name: `${eventToCopy.name} (Copia)`,
            slug: `${eventToCopy.slug}-copia-${timestamp.toString().slice(-4)}`,
            status: 'Borrador'
        };
        const updatedEvents = [...events, newEvent];
        setEvents(updatedEvents);
        localStorage.setItem('eventoia_events', JSON.stringify(updatedEvents));
    };

    const handleDeleteEvent = (eventId) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer.')) {
            const updatedEvents = events.filter(e => e.id !== eventId);
            setEvents(updatedEvents);
            localStorage.setItem('eventoia_events', JSON.stringify(updatedEvents));
            
            // If we deleted the currently selected event, select another one or null
            if (selectedEvent && selectedEvent.id === eventId) {
                setSelectedEvent(updatedEvents.length > 0 ? updatedEvents[0] : null);
            }
        }
    };

    // Render Public Views (No Login Required)
    if (dashboardView === 'publicLanding') {
        return (
            <PublicEventPage 
                event={selectedEvent} 
                onStartAssistant={() => setDashboardView('publicAssistant')}
            />
        );
    }

    if (dashboardView === 'publicAssistant') {
        return (
            <AssistantInterface 
                event={selectedEvent} 
                onBack={() => setDashboardView('publicLanding')} 
                isPublic={true}
            />
        );
    }

    // Render Preview Views (Logged In but simulating public)
    if (dashboardView === 'previewLanding' && isLoggedIn) {
        return (
            <PublicEventPage 
                event={selectedEvent} 
                onStartAssistant={() => setDashboardView('previewAssistant')}
                onClose={() => setDashboardView('events')}
            />
        );
    }

    if (dashboardView === 'previewAssistant' && isLoggedIn) {
        return (
            <AssistantInterface 
                event={selectedEvent} 
                onBack={() => setDashboardView('previewLanding')} 
                isPublic={true}
            />
        );
    }

    if (dashboardView === 'assistant' && isLoggedIn) {
        return <AssistantInterface event={selectedEvent} onBack={() => setDashboardView('events')} isPublic={false} />;
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
            onCreateEvent={handleCreateEvent}
            onUpdateEvent={handleUpdateEvent}
            onDuplicateEvent={handleDuplicateEvent}
            onDeleteEvent={handleDeleteEvent}
        />
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);