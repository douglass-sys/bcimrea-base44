/* eslint-disable no-undef */
// Módulo Consultar Relatórios - injetado no iframe FireCheck (executa dentro do iframe, App e KIT_UNITS são globais)
// Adiciona métodos à classe App para consulta de relatórios emitidos

App.prototype.buildChecklistSnapshot = function(modId) {
    const snapshot = { modulo: modId, answers: {}, justifications: [], extra: {} };
    Object.keys(this.state.answers).forEach(k => {
        if (k.startsWith(modId + '-')) snapshot.answers[k] = this.state.answers[k];
    });
    snapshot.justifications = this.state.justifications[modId] || [];
    if (modId === 'it22') snapshot.extra = { selectedHydrant: this.state.selectedHydrant };
    if (modId === 'it21') snapshot.extra = { extintores: this.state.it21 };
    if (modId === 'it16') snapshot.extra = { dados: this.state.it16 };
    if (modId === 'aph') snapshot.extra = { ocorrencias: this.state.aph };
    if (modId === 'rnc') snapshot.extra = { rncs: this.state.rnc.map(r => ({ sys: r.sys, risk: r.risk, loc: r.loc, desc: r.desc, img: r.img, author: r.author, date: r.date })) };
    if (modId === 'kittrauma') {
        const unitId = this._ktUnit || (typeof KIT_UNITS !== 'undefined' ? KIT_UNITS[0].id : '');
        snapshot.extra = { unitId, checks: (this.state.kittrauma?.checks || {})[unitId] || {} };
    }
    return snapshot;
};

App.prototype.buscarRelatorios = function() {
    const num = document.getElementById('rel-numero')?.value?.trim() || '';
    const operador = document.getElementById('rel-operador')?.value?.trim() || '';
    const tipo = document.getElementById('rel-tipo')?.value || '';
    const modulo = document.getElementById('rel-modulo')?.value || '';
    const dataInicio = document.getElementById('rel-data-inicio')?.value || '';
    const dataFim = document.getElementById('rel-data-fim')?.value || '';
    this.relatoriosLoading = true;
    this.relatorioDetalhe = null;
    this.render();
    window.parent.postMessage({ type: 'firecheck-consultar-relatorios', filtros: { numero: num, operador, tipo, modulo, data_inicio: dataInicio, data_fim: dataFim } }, '*');
};

App.prototype.verRelatorioDetalhe = function(id) {
    window.parent.postMessage({ type: 'firecheck-buscar-relatorio', id }, '*');
};

App.prototype.fecharRelatorioDetalhe = function() {
    this.relatorioDetalhe = null;
    this.render();
};

App.prototype.registrarAuditoria = function(acao, entidadeId, entidadeNumero, detalhe) {
    window.parent.postMessage({ type: 'firecheck-registrar-auditoria', payload: { acao, entidade_id: entidadeId, entidade_numero: entidadeNumero, detalhe, operador: this.currentUser ? this.currentUser.nome : '', operador_id: this.currentUser ? this.currentUser.matricula : '', operador_perfil: this.currentUser ? this.currentUser.nivel : '' } }, '*');
};

App.prototype.renderConsultarRelatorios = function() {
    if (this.relatorioDetalhe) return this.renderRelatorioDetalhe();
    const tipoLabel = t => ({ VST: 'Vistoria', RNC: 'RNC', APH: 'APH', KIT: 'Kit Trauma' }[t] || t);
    const tipoBadge = t => ({ VST: 'bg-blue-100 text-blue-700', RNC: 'bg-red-100 text-red-700', APH: 'bg-emerald-100 text-emerald-700', KIT: 'bg-amber-100 text-amber-700' }[t] || 'bg-slate-100 text-slate-700');
    const fmtData = d => d ? new Date(d).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : '—';

    let html = `<div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
        <div><h3 class="font-bold text-slate-800 text-lg mb-1">Consulta de Relatórios Emitidos</h3>
        <p class="text-xs text-slate-500">Pesquise por número, data, usuário ou tipo de checklist. Todos os relatórios emitidos estão disponíveis para consulta.</p></div>
        <div class="grid grid-cols-1 md:grid-cols-6 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div class="md:col-span-2"><label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Número</label>
                <input id="rel-numero" class="w-full p-2.5 border border-slate-200 rounded-lg bg-white text-xs font-mono outline-none focus:border-slate-800" placeholder="Ex: VST-001"></div>
            <div><label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tipo</label>
                <select id="rel-tipo" class="w-full p-2.5 border border-slate-200 rounded-lg bg-white text-xs outline-none focus:border-slate-800"><option value="">Todos</option><option value="VST">Vistoria</option><option value="RNC">RNC</option><option value="APH">APH</option><option value="KIT">Kit Trauma</option></select></div>
            <div><label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Módulo</label>
                <select id="rel-modulo" class="w-full p-2.5 border border-slate-200 rounded-lg bg-white text-xs outline-none focus:border-slate-800"><option value="">Todos</option><option value="it22">IT 22 - Hidrantes</option><option value="it19">IT 19 - Alarme</option><option value="it21">IT 21 - Extintores</option><option value="pcf">NBR 11742 - PCF</option><option value="saida">Rotas de Fuga</option><option value="it16">IT 16 - Gestão</option><option value="rnc">RNC</option><option value="aph">APH</option><option value="kittrauma">Kit Trauma</option></select></div>
            <div><label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Operador</label>
                <input id="rel-operador" class="w-full p-2.5 border border-slate-200 rounded-lg bg-white text-xs outline-none focus:border-slate-800" placeholder="Nome ou matrícula"></div>
            <div class="md:col-span-2 grid grid-cols-2 gap-2">
                <div><label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Data Início</label>
                    <input id="rel-data-inicio" type="date" class="w-full p-2.5 border border-slate-200 rounded-lg bg-white text-xs outline-none focus:border-slate-800"></div>
                <div><label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Data Fim</label>
                    <input id="rel-data-fim" type="date" class="w-full p-2.5 border border-slate-200 rounded-lg bg-white text-xs outline-none focus:border-slate-800"></div>
            </div>
            <div class="md:col-span-6 flex justify-end">
                <button onclick="app.buscarRelatorios()" class="px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-all flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>Buscar Relatórios</button>
            </div>
        </div>`;

    if (this.relatoriosLoading) {
        html += `<div class="p-12 text-center"><div class="inline-block w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div><p class="text-xs text-slate-500 mt-3">Consultando banco centralizado...</p></div>`;
    } else if (this.relatorios.length === 0) {
        html += `<div class="p-8 text-center text-slate-400 italic bg-slate-50 rounded-xl border border-slate-200">Nenhum relatório encontrado. Use os filtros acima ou clique em "Buscar Relatórios" para listar todos.</div>`;
    } else {
        html += `<h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">${this.relatorios.length} relatório(s) encontrado(s)</h4>
        <div class="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto"><table class="w-full text-xs text-left">
            <thead class="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200"><tr>
                <th class="p-3">Número</th><th class="p-3">Tipo</th><th class="p-3">Módulo</th><th class="p-3">Operador</th><th class="p-3">Data Emissão</th><th class="p-3 text-center">Itens</th><th class="p-3 text-center">Conf.</th><th class="p-3 text-center">NC</th><th class="p-3 text-center">Status</th><th class="p-3 text-center">Ação</th>
            </tr></thead><tbody class="divide-y divide-slate-100">
            ${this.relatorios.map(r => `<tr class="hover:bg-slate-50">
                <td class="p-3 font-mono font-bold text-slate-800">${r.numero}</td>
                <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${tipoBadge(r.tipo)}">${tipoLabel(r.tipo)}</span></td>
                <td class="p-3 text-slate-600">${r.modulo_titulo || r.modulo}</td>
                <td class="p-3 text-slate-700 font-medium">${r.operador || '—'}${r.operador_perfil ? '<br><span class="text-[9px] text-slate-400">'+r.operador_perfil+'</span>' : ''}</td>
                <td class="p-3 font-mono text-slate-500 text-[10px]">${fmtData(r.data_emissao)}</td>
                <td class="p-3 text-center font-bold text-slate-700">${r.itens_avaliados || 0}</td>
                <td class="p-3 text-center font-bold text-emerald-600">${r.conformes || 0}</td>
                <td class="p-3 text-center font-bold text-fire-600">${r.nao_conformes || 0}</td>
                <td class="p-3 text-center"><span class="px-2 py-0.5 rounded-full text-[9px] font-bold ${r.status === 'Emitido' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}">${r.status}</span></td>
                <td class="p-3 text-center"><button onclick="app.verRelatorioDetalhe('${r.id}')" class="px-3 py-1.5 text-[10px] font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-lg">Visualizar</button></td>
            </tr>`).join('')}
            </tbody></table></div>`;
    }
    html += `</div>`;
    return html;
};

App.prototype.renderRelatorioDetalhe = function() {
    const r = this.relatorioDetalhe;
    const tipoLabel = t => ({ VST: 'Vistoria Técnica', RNC: 'Não Conformidade', APH: 'Atendimento Pré-Hospitalar', KIT: 'Kit Trauma' }[t] || t);
    const fmtData = d => d ? new Date(d).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : '—';
    const cd = r.checklist_data || {};
    const answers = cd.answers || {};
    const justs = cd.justifications || [];
    const extra = cd.extra || {};

    let checklistHtml = '';
    if (Object.keys(answers).length > 0) {
        checklistHtml = `<div class="mt-4"><h4 class="text-xs font-bold text-slate-600 uppercase mb-3">Respostas do Checklist</h4>
            <div class="border border-slate-200 rounded-xl overflow-hidden"><table class="w-full text-xs text-left">
            <thead class="bg-slate-50 border-b text-slate-500 font-bold uppercase"><tr><th class="p-2.5">Item</th><th class="p-2.5 text-center w-20">Resposta</th></tr></thead><tbody class="divide-y divide-slate-100">
            ${Object.entries(answers).map(([k,v]) => {
                const badge = v === 'sim' ? 'bg-emerald-100 text-emerald-700' : v === 'nao' ? 'bg-red-100 text-red-700' : v === 'nc' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600';
                const label = v === 'sim' ? 'SIM ✓' : v === 'nao' ? 'NÃO ✕' : v === 'nc' ? 'NC !' : v;
                return `<tr><td class="p-2.5 font-mono text-slate-700">${k}</td><td class="p-2.5 text-center"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${badge}">${label}</span></td></tr>`;
            }).join('')}</tbody></table></div></div>`;
    }

    let justsHtml = '';
    if (Array.isArray(justs) && justs.length > 0) {
        justsHtml = `<div class="mt-4"><h4 class="text-xs font-bold text-slate-600 uppercase mb-3">Justificativas de NC</h4><div class="space-y-2">
            ${justs.map(j => `<div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs"><span class="font-mono font-bold text-amber-700">[${j.item}]</span> <span class="text-slate-700">${j.text || '—'}</span></div>`).join('')}</div></div>`;
    }

    let extraHtml = '';
    if (extra.selectedHydrant) extraHtml += `<div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs mt-3"><span class="font-bold text-blue-700">Equipamento:</span> <span class="font-mono text-slate-700">${extra.selectedHydrant.block || ''} / ${extra.selectedHydrant.code || ''}</span></div>`;
    if (extra.extintores?.length) extraHtml += `<div class="mt-3"><h4 class="text-xs font-bold text-slate-600 uppercase mb-2">Extintores</h4><div class="border border-slate-200 rounded-lg overflow-hidden"><table class="w-full text-xs text-left"><thead class="bg-slate-50 text-slate-500 font-bold"><tr><th class="p-2">Local</th><th class="p-2">ID</th><th class="p-2">Tipo</th><th class="p-2">Status</th></tr></thead><tbody class="divide-y divide-slate-100">${extra.extintores.map(e => `<tr><td class="p-2">${e.loc}</td><td class="p-2 font-mono">${e.id}</td><td class="p-2">${e.type}</td><td class="p-2 font-bold ${e.status === 'OK' ? 'text-emerald-600' : 'text-fire-600'}">${e.status}</td></tr>`).join('')}</tbody></table></div></div>`;
    if (extra.ocorrencias?.length) extraHtml += `<div class="mt-3"><h4 class="text-xs font-bold text-slate-600 uppercase mb-2">Ocorrências APH (${extra.ocorrencias.length})</h4><div class="space-y-2">${extra.ocorrencias.map(o => `<div class="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs"><div class="font-bold text-slate-800">${o.tipoApoio}</div><div class="text-slate-600 mt-1">Destino: ${o.destino || 'N/A'} | Glasgow: ${o.glasgow || 'N/A'} | PA: ${o.pa || 'N/A'} | FC: ${o.fc || 'N/A'}</div></div>`).join('')}</div></div>`;
    if (extra.rncs?.length) extraHtml += `<div class="mt-3"><h4 class="text-xs font-bold text-slate-600 uppercase mb-2">Não Conformidades (${extra.rncs.length})</h4><div class="space-y-3">${extra.rncs.map((rnc, i) => `<div class="bg-red-50 border border-red-200 rounded-lg p-3 text-xs avoid-break"><div class="flex items-center justify-between mb-2"><div class="font-bold text-red-700">${rnc.sys} - ${rnc.risk} Risco</div><span class="bg-slate-900 text-white text-[9px] font-mono px-2 py-0.5 rounded font-bold">RNC #${i + 1}</span></div><div class="text-slate-700 mt-1"><b>Local:</b> ${rnc.loc}</div><div class="text-slate-600 mt-1">${rnc.desc}</div>${rnc.img ? `<div class="mt-3"><span class="text-[9px] text-slate-400 uppercase font-bold block mb-1">Evidência Fotográfica</span><img src="${rnc.img}" class="w-full max-w-sm h-40 object-cover rounded-lg border border-red-200 shadow-sm" style="page-break-inside: avoid;"></div>` : '<div class="mt-2 text-[10px] text-slate-400 italic">Sem evidência fotográfica</div>'}</div>`).join('')}</div></div>`;
    if (extra.dados && Object.keys(extra.dados).length) extraHtml += `<div class="mt-3"><h4 class="text-xs font-bold text-slate-600 uppercase mb-2">Dados IT-16</h4><div class="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs grid grid-cols-2 gap-2">${Object.entries(extra.dados).map(([k,v]) => `<div><span class="font-bold text-slate-500 uppercase text-[9px] block">${k}</span><span class="text-slate-700">${v}</span></div>`).join('')}</div></div>`;
    if (extra.checks && Object.keys(extra.checks).length) extraHtml += `<div class="mt-3"><h4 class="text-xs font-bold text-slate-600 uppercase mb-2">Checklist Kit Trauma - ${extra.unitId || ''}</h4><div class="border border-slate-200 rounded-lg overflow-hidden"><table class="w-full text-xs text-left"><thead class="bg-slate-50 text-slate-500 font-bold"><tr><th class="p-2">Item</th><th class="p-2 text-center">Qtd</th><th class="p-2 text-center">Lote</th><th class="p-2 text-center">Status</th></tr></thead><tbody class="divide-y divide-slate-100">${Object.entries(extra.checks).map(([k,c]) => `<tr><td class="p-2 font-mono">${k}</td><td class="p-2 text-center">${c.qtd||'—'}</td><td class="p-2 text-center">${c.lote||'—'}</td><td class="p-2 text-center font-bold ${c.status==='OK'?'text-emerald-600':c.status==='Vencido'?'text-red-600':'text-amber-600'}">${c.status||'—'}</td></tr>`).join('')}</tbody></table></div></div>`;

    return `<div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 max-w-4xl mx-auto">
        <div class="flex items-center justify-between mb-6">
            <div><div class="flex items-center gap-3 mb-2">
                <span class="text-2xl font-black font-mono text-slate-900">${r.numero}</span>
                <span class="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-white">${tipoLabel(r.tipo)}</span>
                <span class="px-3 py-1 rounded-full text-xs font-bold ${r.status === 'Emitido' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}">${r.status}</span>
            </div><p class="text-xs text-slate-500">${r.modulo_titulo} &bull; ${r.norma || ''}</p></div>
            <button onclick="app.fecharRelatorioDetalhe()" class="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>Voltar</button>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
            <div><span class="text-[9px] text-slate-400 uppercase font-bold block">Responsável Técnico</span><span class="font-semibold text-slate-800">${r.resp_tecnico || '—'}</span></div>
            <div><span class="text-[9px] text-slate-400 uppercase font-bold block">Proprietário</span><span class="font-semibold text-slate-800">${r.proprietario || '—'}</span></div>
            <div><span class="text-[9px] text-slate-400 uppercase font-bold block">Operador</span><span class="font-semibold text-slate-800">${r.operador || '—'}${r.operador_perfil ? ' ('+r.operador_perfil+')' : ''}</span></div>
            <div><span class="text-[9px] text-slate-400 uppercase font-bold block">Data de Emissão</span><span class="font-semibold text-slate-800 font-mono">${fmtData(r.data_emissao)}</span></div>
        </div>
        <div class="grid grid-cols-3 gap-3 mt-4">
            <div class="bg-slate-50 border rounded-xl p-4 text-center"><div class="text-2xl font-extrabold text-slate-800">${r.itens_avaliados || 0}</div><div class="text-[10px] text-slate-400 uppercase font-bold">Itens Avaliados</div></div>
            <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center"><div class="text-2xl font-extrabold text-emerald-600">${r.conformes || 0}</div><div class="text-[10px] text-emerald-500 uppercase font-bold">Conformes</div></div>
            <div class="bg-red-50 border border-red-200 rounded-xl p-4 text-center"><div class="text-2xl font-extrabold text-fire-600">${r.nao_conformes || 0}</div><div class="text-[10px] text-fire-500 uppercase font-bold">Não Conformes</div></div>
        </div>
        ${r.equipamento ? `<div class="mt-4"><h4 class="text-xs font-bold text-slate-600 uppercase mb-2">Equipamento / Detalhes</h4><div class="bg-slate-50 border rounded-lg p-3 text-xs text-slate-700">${r.equipamento}</div></div>` : ''}
        ${r.justificativas ? `<div class="mt-4"><h4 class="text-xs font-bold text-slate-600 uppercase mb-2">Justificativas</h4><div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-slate-700">${r.justificativas}</div></div>` : ''}
        ${r.rncs ? `<div class="mt-4"><h4 class="text-xs font-bold text-slate-600 uppercase mb-2">RNCs</h4><div class="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-slate-700">${r.rncs}</div></div>` : ''}
        ${checklistHtml}${justsHtml}${extraHtml}
        <div class="mt-6 pt-4 border-t flex justify-end">
            <button onclick="window.print()" class="px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>Imprimir</button>
        </div>
    </div>`;
};