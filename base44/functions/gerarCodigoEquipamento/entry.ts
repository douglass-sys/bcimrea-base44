import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

const TIPOS = ['H', 'PC', 'EX', 'MG', 'DF', 'AM', 'SAV', 'PCH'];
const PREDIO_FIXO = 32;

function montarCodigo(tipo, predio, bloco, andar, num) {
  const andarStr = andar === 'T' ? 'T' : String(andar).padStart(2, '0');
  const numStr = String(num).padStart(2, '0');
  return `${tipo}-${predio}-${bloco}-${andarStr}-${numStr}`;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    let user = null;
    try { user = await base44.auth.me(); } catch(e) { /* auth opcional */ }

    const body = await req.json().catch(() => ({}));
    const { action } = body;

    if (action === 'sugerir') {
      const { tipo, bloco, andar } = body;
      if (!TIPOS.includes(tipo)) return Response.json({ error: 'Tipo inválido' }, { status: 400 });
      if (!['B1', 'B2', 'B3'].includes(bloco)) return Response.json({ error: 'Bloco inválido' }, { status: 400 });
      const andarStr = String(andar);
      const all = await base44.entities.EquipamentoCodigo.filter(
        { tipo, predio: PREDIO_FIXO, bloco, andar: andarStr },
        '-numero_equipamento', 500
      );
      let maxNum = 0;
      (all || []).forEach(e => { if (e.numero_equipamento > maxNum) maxNum = e.numero_equipamento; });
      return Response.json({ success: true, proximo_numero: maxNum + 1 });
    }

    if (action === 'criar') {
      const { tipo, bloco, andar, numero_equipamento, descricao, data_ultima_inspecao, status, observacoes, responsavel } = body;
      if (!TIPOS.includes(tipo)) return Response.json({ error: 'Tipo de equipamento inválido' }, { status: 400 });
      if (!['B1', 'B2', 'B3'].includes(bloco)) return Response.json({ error: 'Bloco inválido' }, { status: 400 });
      const num = Number(numero_equipamento);
      if (!num || num < 1) return Response.json({ error: 'Número do equipamento inválido' }, { status: 400 });

      const andarStr = String(andar);
      const codigo = montarCodigo(tipo, PREDIO_FIXO, bloco, andarStr, num);

      const existing = await base44.entities.EquipamentoCodigo.filter({ codigo }, undefined, 1);
      if (existing && existing.length > 0) {
        return Response.json({ error: 'Código já cadastrado! Não é permitida duplicidade de identificação.' }, { status: 409 });
      }

      const record = await base44.entities.EquipamentoCodigo.create({
        codigo, tipo, predio: PREDIO_FIXO, bloco, andar: andarStr,
        numero_equipamento: num,
        descricao: (descricao || '').slice(0, 5000),
        data_ultima_inspecao: data_ultima_inspecao || '',
        status: status || 'Conforme',
        observacoes: (observacoes || '').slice(0, 5000),
        responsavel_cadastro: user ? (user.full_name || user.email || '') : (responsavel || 'Sistema'),
        ativo: true
      });

      return Response.json({ success: true, equipamento: record, message: `Código ${codigo} cadastrado com sucesso` });
    }

    if (action === 'editar') {
      const { id, tipo, bloco, andar, numero_equipamento, descricao, data_ultima_inspecao, status, observacoes } = body;
      if (!id) return Response.json({ error: 'ID é obrigatório para edição' }, { status: 400 });
      if (!TIPOS.includes(tipo)) return Response.json({ error: 'Tipo de equipamento inválido' }, { status: 400 });
      const num = Number(numero_equipamento);
      if (!num || num < 1) return Response.json({ error: 'Número do equipamento inválido' }, { status: 400 });

      const andarStr = String(andar);
      const codigo = montarCodigo(tipo, PREDIO_FIXO, bloco, andarStr, num);

      const existing = await base44.entities.EquipamentoCodigo.filter({ codigo }, undefined, 500);
      if (existing && existing.some(e => e.id !== id)) {
        return Response.json({ error: 'Código já cadastrado! Não é permitida duplicidade de identificação.' }, { status: 409 });
      }

      const updated = await base44.entities.EquipamentoCodigo.update(id, {
        codigo, tipo, bloco, andar: andarStr,
        numero_equipamento: num,
        descricao: (descricao || '').slice(0, 5000),
        data_ultima_inspecao: data_ultima_inspecao || '',
        status: status || 'Conforme',
        observacoes: (observacoes || '').slice(0, 5000)
      });

      return Response.json({ success: true, equipamento: updated, message: `Código ${codigo} atualizado com sucesso` });
    }

    if (action === 'excluir') {
      const { id } = body;
      if (!id) return Response.json({ error: 'ID é obrigatório' }, { status: 400 });
      try {
        await base44.entities.EquipamentoCodigo.delete(id);
        return Response.json({ success: true, message: 'Código excluído com sucesso' });
      } catch(e) {
        return Response.json({ error: 'Sem permissão para excluir. Apenas administradores (CILO) podem excluir códigos.' }, { status: 403 });
      }
    }

    return Response.json({ error: 'Ação inválida. Use: sugerir, criar, editar ou excluir.' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}