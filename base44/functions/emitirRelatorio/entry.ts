import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const TYPE_PREFIXES = {
  it22: 'VST', it19: 'VST', pcf: 'VST', saida: 'VST', it16: 'VST', it21: 'VST',
  rnc: 'RNC',
  aph: 'APH',
  kittrauma: 'KIT'
};

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    // Auth opcional: o frontend já envia os dados do operador no payload.
    // Não bloqueia a emissão se auth.me() falhar — as operações de entidade
    // usam o token da requisição e funcionam independentemente.
    let user = null;
    try {
      user = await base44.auth.me();
    } catch(e) {
      console.log('[emitirRelatorio] Auth opcional falhou (emissão prossegue):', e.message);
    }

    const body = await req.json();
    const {
      modulo, modulo_titulo, norma, resp_tecnico, proprietario,
      equipamento, itens_avaliados, conformes, nao_conformes,
      justificativas, rncs, operador, operador_id, operador_perfil,
      checklist_data, vistoria_id
    } = body;

    if (!modulo || !modulo_titulo) {
      return Response.json({ error: 'Módulo e título são obrigatórios' }, { status: 400 });
    }

    const tipo = TYPE_PREFIXES[modulo] || 'VST';

    // Busca o maior número sequencial existente para este tipo
    const existing = await base44.entities.Relatorio.list('-numero', 500);
    const prefix = tipo + '-';
    let maxSeq = 0;
    for (const r of existing) {
      if (r.numero && r.numero.startsWith(prefix)) {
        const seq = parseInt(r.numero.slice(prefix.length), 10);
        if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
      }
    }
    const nextSeq = maxSeq + 1;
    const numero = `${tipo}-${String(nextSeq).padStart(3, '0')}`;

    const now = new Date().toISOString();

    // Cria o relatório
    const relatorio = await base44.entities.Relatorio.create({
      numero,
      tipo,
      modulo,
      modulo_titulo,
      norma: norma || '',
      resp_tecnico: resp_tecnico || '',
      proprietario: proprietario || '',
      equipamento: (equipamento || '').slice(0, 50000),
      itens_avaliados: itens_avaliados || 0,
      conformes: conformes || 0,
      nao_conformes: nao_conformes || 0,
      justificativas: (justificativas || '').slice(0, 50000),
      rncs: (rncs || '').slice(0, 50000),
      operador: operador || (user ? (user.full_name || user.email) : '') || 'Sistema',
      operador_id: operador_id || '',
      operador_perfil: operador_perfil || '',
      status: 'Emitido',
      data_emissao: now,
      checklist_data: checklist_data || {}
    });

    // Marca a Vistoria correspondente como emitida
    if (vistoria_id) {
      try {
        await base44.entities.Vistoria.update(vistoria_id, { status: 'emitida' });
      } catch(e) {
        console.log('[emitirRelatorio] Falha ao marcar vistoria:', e.message);
      }
    }

    // Registra na trilha de auditoria (não bloqueia a emissão se falhar)
    try {
      await base44.entities.Auditoria.create({
        acao: 'emissao',
        entidade: 'relatorio',
        entidade_id: relatorio.id,
        entidade_numero: numero,
        detalhe: `Relatório ${numero} emitido via módulo ${modulo_titulo}`,
        operador: operador || (user ? user.full_name : '') || 'Sistema',
        operador_id: operador_id || '',
        operador_perfil: operador_perfil || '',
        timestamp: now
      });
    } catch(e) {
      console.log('[emitirRelatorio] Auditoria falhou (não bloqueia):', e.message);
    }

    return Response.json({
      success: true,
      relatorio: {
        id: relatorio.id,
        numero,
        tipo,
        data_emissao: now
      },
      message: `Relatório ${numero} emitido com sucesso`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}