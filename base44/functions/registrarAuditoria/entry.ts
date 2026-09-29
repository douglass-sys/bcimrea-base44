import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    // Auth opcional: auditoria é best-effort, não bloqueia o fluxo principal
    let user = null;
    try {
      user = await base44.auth.me();
    } catch(e) {
      console.log('[registrarAuditoria] Auth opcional falhou (registro prossegue):', e.message);
    }

    const body = await req.json();
    const { acao, entidade_id, entidade_numero, detalhe, operador, operador_id, operador_perfil } = body;

    if (!acao) return Response.json({ error: 'Ação é obrigatória' }, { status: 400 });

    const entry = await base44.entities.Auditoria.create({
      acao,
      entidade: 'relatorio',
      entidade_id: entidade_id || '',
      entidade_numero: entidade_numero || '',
      detalhe: detalhe || '',
      operador: operador || (user ? (user.full_name || user.email) : '') || 'Sistema',
      operador_id: operador_id || '',
      operador_perfil: operador_perfil || '',
      timestamp: new Date().toISOString()
    });

    return Response.json({ success: true, id: entry.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}