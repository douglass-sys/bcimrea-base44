import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    // Auth opcional: a resolução de NC usa asServiceRole para bypass do RLS.
    let user = null;
    try {
      user = await base44.auth.me();
    } catch(e) {
      console.log('[resolverNC] Auth opcional falhou (operação prossegue):', e.message);
    }

    const body = await req.json();
    const {
      relatorio_id, nc_key,
      resolvida, data_resolucao, responsavel_resolucao,
      informado_gestor, data_informado_gestor
    } = body;

    if (!relatorio_id || !nc_key) {
      return Response.json({ error: 'relatorio_id e nc_key são obrigatórios' }, { status: 400 });
    }

    // Busca o relatório (read é irrestrito)
    const relatorio = await base44.entities.Relatorio.get(relatorio_id);
    if (!relatorio) {
      return Response.json({ error: 'Relatório não encontrado' }, { status: 404 });
    }

    const checklist_data = relatorio.checklist_data || {};
    if (!checklist_data.resolucoes) checklist_data.resolucoes = {};

    // Armazena a resolução sob a chave da NC (rnc-0, nc-it22-1.1, ext-0, kit-ext-0, etc.)
    checklist_data.resolucoes[nc_key] = {
      resolvida: resolvida,
      data_resolucao: data_resolucao || '',
      responsavel_resolucao: responsavel_resolucao || '',
      informado_gestor: informado_gestor || false,
      data_informado_gestor: data_informado_gestor || ''
    };

    // Usa asServiceRole para bypass do RLS (update é admin-only)
    await base44.asServiceRole.entities.Relatorio.update(relatorio_id, { checklist_data });

    // Registra auditoria (não bloqueia se falhar)
    try {
      const detalhe = resolvida
        ? `NC [${nc_key}] resolvida por ${responsavel_resolucao || (user ? user.full_name : 'Sistema')}`
        : `NC [${nc_key}] marcada como não resolvida${informado_gestor ? ' (informada ao gestor)' : ''}`;
      await base44.entities.Auditoria.create({
        acao: 'edicao',
        entidade: 'relatorio',
        entidade_id: relatorio_id,
        entidade_numero: relatorio.numero,
        detalhe,
        operador: (user ? (user.full_name || user.email) : '') || 'Sistema',
        operador_id: '',
        operador_perfil: '',
        timestamp: new Date().toISOString()
      });
    } catch(e) {
      console.log('[resolverNC] Auditoria falhou (não bloqueia):', e.message);
    }

    return Response.json({ success: true, message: 'Situação da NC atualizada com sucesso' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}