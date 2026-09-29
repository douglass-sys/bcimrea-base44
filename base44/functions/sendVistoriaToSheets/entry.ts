import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const SPREADSHEET_ID = '1li3ydLtKJSQsf5xwOYefGvrRTAljrHGsZrDIF1wq3Lw';
const HEADERS = [
  'Data do Envio', 'Módulo', 'Norma', 'Responsável Técnico', 'Proprietário',
  'Equipamento / Detalhes', 'Itens Avaliados', 'Conformes', 'Não Conformes',
  'Justificativas', 'RNCs', 'Operador'
];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    // Auth opcional: o envio para Sheets usa asServiceRole (credenciais do app),
    // não depende do token do usuário. Não bloqueia por sessão expirada.
    try {
      await base44.auth.me();
    } catch(e) {
      console.log('[sendVistoriaToSheets] Auth opcional falhou (envio prossegue):', e.message);
    }

    const body = await req.json();
    const {
      modulo, norma, respTecnico, proprietario, equipamento,
      itensAvaliados, conformes, naoConformes, justificativas, rncs, operador
    } = body;

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlesheets');
    const authHeader = { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' };

    // Verifica se a linha de cabeçalho já existe; se não, cria
    const checkRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/A1:L1`,
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );
    const checkData = await checkRes.json();
    const hasHeaders = checkData.values && checkData.values[0] && checkData.values[0].length > 0;

    if (!hasHeaders) {
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/A1:L1?valueInputOption=RAW`,
        { method: 'PUT', headers: authHeader, body: JSON.stringify({ values: [HEADERS] }) }
      );
    }

    const rowData = [
      new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      modulo || '', norma || '', respTecnico || '', proprietario || '',
      (equipamento || '').slice(0, 50000),
      itensAvaliados || 0, conformes || 0, naoConformes || 0,
      (justificativas || '').slice(0, 50000),
      (rncs || '').slice(0, 50000),
      operador || ''
    ];

    const appendRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/A:L:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
      { method: 'POST', headers: authHeader, body: JSON.stringify({ values: [rowData] }) }
    );

    if (!appendRes.ok) {
      const err = await appendRes.json();
      return Response.json({ error: err.error?.message || 'Falha ao enviar para a planilha' }, { status: 502 });
    }

    return Response.json({ success: true, message: 'Vistoria enviada para a planilha com sucesso' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}