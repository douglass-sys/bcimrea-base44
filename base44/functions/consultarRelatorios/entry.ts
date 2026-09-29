import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    // Auth opcional: Relatorio tem leitura irrestrita (RLS read: null), então a consulta
    // funciona mesmo sem sessão válida. Não reinicia o sistema por token expirado.
    let user = null;
    try {
      user = await base44.auth.me();
    } catch(e) {
      console.log('[consultarRelatorios] Auth opcional falhou (consulta prossegue):', e.message);
    }

    const body = await req.json().catch(() => ({}));
    const { numero, data_inicio, data_fim, operador, tipo, modulo, status, limit, equipamento } = body;

    // Busca todos os relatórios (ordenados por número decrescente)
    const maxLimit = Math.min(limit || 200, 500);
    const allReports = await base44.entities.Relatorio.list('-data_emissao', 500);

    let filtered = allReports;

    if (numero) {
      const numLower = numero.toLowerCase();
      filtered = filtered.filter(r =>
        r.numero && r.numero.toLowerCase().includes(numLower)
      );
    }

    if (operador) {
      const opLower = operador.toLowerCase();
      filtered = filtered.filter(r =>
        (r.operador || '').toLowerCase().includes(opLower) ||
        (r.operador_id || '').toLowerCase().includes(opLower)
      );
    }

    if (tipo) {
      filtered = filtered.filter(r => r.tipo === tipo);
    }

    if (modulo) {
      filtered = filtered.filter(r => r.modulo === modulo);
    }

    if (status) {
      filtered = filtered.filter(r => r.status === status);
    }

    if (data_inicio) {
      const di = new Date(data_inicio);
      filtered = filtered.filter(r => r.data_emissao && new Date(r.data_emissao) >= di);
    }

    if (data_fim) {
      const df = new Date(data_fim);
      df.setHours(23, 59, 59, 999);
      filtered = filtered.filter(r => r.data_emissao && new Date(r.data_emissao) <= df);
    }

    if (equipamento) {
      const eqLower = equipamento.toLowerCase();
      filtered = filtered.filter(r =>
        (r.equipamento || '').toLowerCase().includes(eqLower) ||
        (r.proprietario || '').toLowerCase().includes(eqLower)
      );
    }

    const result = filtered.slice(0, maxLimit).map(r => ({
      id: r.id,
      numero: r.numero,
      tipo: r.tipo,
      modulo: r.modulo,
      modulo_titulo: r.modulo_titulo,
      norma: r.norma,
      resp_tecnico: r.resp_tecnico,
      proprietario: r.proprietario,
      equipamento: (r.equipamento || '').slice(0, 300),
      itens_avaliados: r.itens_avaliados,
      conformes: r.conformes,
      nao_conformes: r.nao_conformes,
      operador: r.operador,
      operador_id: r.operador_id,
      operador_perfil: r.operador_perfil,
      status: r.status,
      data_emissao: r.data_emissao
    }));

    // Registra a consulta na auditoria apenas se autenticado
    if (user) {
      try {
        await base44.entities.Auditoria.create({
          acao: 'consulta',
          entidade: 'relatorio',
          entidade_id: '',
          entidade_numero: '',
          detalhe: `Consulta de relatórios: ${result.length} resultado(s)`,
          operador: user.full_name || user.email || 'Sistema',
          operador_id: '',
          operador_perfil: '',
          timestamp: new Date().toISOString()
        });
      } catch(e) {
        console.log('[consultarRelatorios] Auditoria falhou (não bloqueia):', e.message);
      }
    }

    return Response.json({ success: true, relatorios: result, total: result.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}