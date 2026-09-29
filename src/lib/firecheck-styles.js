// Estilos CSS do FireCheck Pro injetados no iframe via srcDoc
// Movidos para módulo JS para garantir injeção confiável (fetch de public/ e ?raw falhavam)

export const FIRECHECK_STYLES = `
/* --- ESTILOS GERAIS DE INTERFACE --- */
body {
    background-color: #f8fafc;
    font-family: 'Inter', sans-serif;
    color: #1e293b;
}

.option-btn {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    transition: all 0.15s ease;
    user-select: none;
}
.option-btn:hover { filter: brightness(0.95); }
.option-btn:active { transform: scale(0.95); }

/* Custom scrollbar para navegadores WebKit */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: #f1f5f9; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

/* --- IMPRESSÃO (MODO RELATÓRIO TÉCNICO A4) --- */
@media print {
    @page {
        size: A4 vertical;
        margin: 12mm 10mm;
    }
    body {
        background: white !important;
        color: black !important;
        font-size: 9.5pt;
    }
    .no-print, .sidebar, #bottom-nav, #save-status, #login-screen, #modal-overlay, #toast-container, header {
        display: none !important;
    }
    .main-content {
        margin: 0 !important; padding: 0 !important; width: 100% !important;
        max-width: none !important; height: auto !important; overflow: visible !important; display: block !important;
    }
    #content-area {
        box-shadow: none !important; margin: 0 !important; width: 100% !important;
        max-width: none !important; padding: 0 !important; border: none !important; border-radius: 0 !important;
    }
    #scroll-container { overflow: visible !important; padding: 0 !important; background: white !important; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    input, textarea, select {
        border: none !important; background: transparent !important; padding: 0 !important;
        margin: 0 !important; resize: none !important;
        font-family: 'Roboto Mono', monospace !important; color: black !important; box-shadow: none !important;
    }
    select { appearance: none; padding-right: 0 !important; }
    ::placeholder { color: transparent !important; }
    .page-break { page-break-before: always; }
    .avoid-break { break-inside: avoid; }
}

/* --- user-select: none em navegação estática --- */
.sidebar, #bottom-nav, header, .nav-item, .bottom-nav-item {
    user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;
}

/* --- NAVEGAÇÃO INFERIOR (MOBILE) --- */
#bottom-nav { display: none; padding-bottom: env(safe-area-inset-bottom); }
#hamburger-btn { display: none !important; }
.bottom-nav-item { transition: color 0.15s ease; }

/* --- MOBILE: LAYOUT RESPONSIVO (@media max-width: 768px) --- */
@media (max-width: 768px) {
    .sidebar {
        position: fixed !important; left: 0; top: 0; bottom: 0; z-index: 55 !important;
        transform: translateX(-100%); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex !important; box-shadow: 2xl !important;
    }
    .sidebar.open { transform: translateX(0) !important; }
    .sidebar-backdrop {
        display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 50; backdrop-filter: blur(2px);
    }
    .sidebar-backdrop.open { display: block !important; }
    #hamburger-btn { display: flex !important; }
    #bottom-nav { display: flex !important; }
    #main-panel { padding-bottom: 0 !important; }
    .main-content { padding-bottom: calc(64px + env(safe-area-inset-bottom)); }
    #content-area {
        max-width: 100% !important; min-height: auto !important; width: 100% !important;
        border-radius: 0.75rem !important; padding: 1rem !important; margin: 0 !important;
    }
    #scroll-container { padding: 0.5rem !important; }
    header {
        padding-left: 0.75rem !important; padding-right: 0.75rem !important;
        padding-top: env(safe-area-inset-top) !important; height: auto !important; min-height: 3.25rem !important;
    }
    #page-title { font-size: 0.9rem !important; }
    #action-buttons { gap: 0.25rem !important; }
    #action-buttons button { padding: 0.4rem 0.6rem !important; font-size: 0.7rem !important; }
    .option-btn { min-width: 44px !important; min-height: 44px !important; width: 44px !important; }
    #toast-container { bottom: calc(5rem + env(safe-area-inset-bottom)) !important; right: 0.75rem !important; left: 0.75rem !important; }
    #modal-overlay > div { max-width: 92vw !important; }
    #login-screen .max-w-4xl { max-width: 100% !important; }
}

/* --- MODO ESCURO NATIVO (prefers-color-scheme: dark) --- */
@media screen and (prefers-color-scheme: dark) {
    body { background-color: #0f172a !important; color: #f1f5f9 !important; }
    .main-content { background-color: #0f172a !important; }
    #scroll-container { background-color: #0f172a !important; }
    #content-area { background-color: #1e293b !important; color: #f1f5f9 !important; }
    header { background-color: #1e293b !important; border-color: #334155 !important; }
    #page-title { color: #f1f5f9 !important; }
    #save-status { background-color: #064e3b !important; border-color: #065f46 !important; color: #6ee7b7 !important; }
    input, textarea, select { background-color: #0f172a !important; color: #f1f5f9 !important; border-color: #334155 !important; }
    input::placeholder, textarea::placeholder { color: #64748b !important; }
    .bg-white { background-color: #1e293b !important; }
    .bg-slate-50, .bg-slate-100 { background-color: #0f172a !important; }
    .bg-slate-200 { background-color: #334155 !important; }
    .text-slate-800, .text-slate-700 { color: #e2e8f0 !important; }
    .text-slate-600, .text-slate-500 { color: #94a3b8 !important; }
    .text-slate-400 { color: #64748b !important; }
    .text-slate-300 { color: #475569 !important; }
    .border-slate-200, .border-slate-100 { border-color: #334155 !important; }
    .divide-slate-100 > * { border-color: #334155 !important; }
    .divide-slate-200 > * { border-color: #334155 !important; }
    #bottom-nav { background-color: #1e293b !important; border-color: #334155 !important; }
    #bottom-nav button { color: #94a3b8 !important; }
    #bottom-nav button.active { color: #f87171 !important; }
    #hamburger-btn { color: #f1f5f9 !important; }
    .sidebar-backdrop { background: rgba(0,0,0,0.7) !important; }
    #modal-overlay > div { background-color: #1e293b !important; border-color: #334155 !important; }
    #modal-title { color: #f1f5f9 !important; }
    #modal-message { color: #cbd5e1 !important; }
}
`;