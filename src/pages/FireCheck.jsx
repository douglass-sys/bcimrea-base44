import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import relatoriosModuleUrl from "../lib/relatorios-module.txt?url";
import equipamentosModuleUrl from "../lib/equipamentos-module.txt?url";
import equipmentSelectorUrl from "../lib/equipment-selector.txt?url";
import deaModuleUrl from "../lib/dea-module.txt?url";
import { FIRECHECK_STYLES } from "@/lib/firecheck-styles";
import { FIRECHECK_DATA } from "@/lib/firecheck-data";
import firecheckHtmlUrl from "../assets/firecheck.txt?url";

const BG_URL = "https://media.base44.com/images/public/6a8884b9d9b646b5d7ecc699/8d56f01cc_generated_364b15d2.png";

export default function FireCheck() {
  const iframeRef = useRef(null);
  const [html, setHtml] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(firecheckHtmlUrl).then((r) => r.text()),
      fetch(relatoriosModuleUrl).then((r) => r.text()),
      fetch(equipamentosModuleUrl).then((r) => r.text()),
      fetch(equipmentSelectorUrl).then((r) => r.text()),
      fetch(deaModuleUrl).then((r) => r.text())
    ])
      .then(([htmlContent, moduleJs, equipModuleJs, equipSelectorJs, deaModuleJs]) => {
        const injected = htmlContent
          .replace("<!-- STYLES_INJECTED_BY_REACT -->", `<style>${FIRECHECK_STYLES}</style>`)
          .replace("// DADOS_INJECTED_BY_REACT", FIRECHECK_DATA)
          .replace("</body>", `<script>${moduleJs}</script><script>${equipModuleJs}</script><script>${equipSelectorJs}</script><script>${deaModuleJs}</script></body>`);
        setHtml(injected);
      })
      .catch(() => setHtml("<h1>Erro ao carregar o sistema FireCheck Pro.</h1>"));
  }, []);

  useEffect(() => {
    const handler = async (event) => {
      if (!event.data) return;

      // Envio de vistoria para Google Sheets
      if (event.data.type === 'firecheck-vistoria') {
        try {
          const res = await base44.functions.invoke('sendVistoriaToSheets', event.data.payload);
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-vistoria-result',
            success: true,
            message: res.data?.message || 'Enviado para a planilha'
          }, '*');
        } catch (err) {
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-vistoria-result',
            success: false,
            message: err?.response?.data?.error || 'Falha ao enviar para a planilha'
          }, '*');
        }
      }

      // Emissão de relatório numerado no banco centralizado
      else if (event.data.type === 'firecheck-emitir-relatorio') {
        try {
          const res = await base44.functions.invoke('emitirRelatorio', event.data.payload);
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-emitir-relatorio-result',
            success: true,
            numero: res.data?.relatorio?.numero || '',
            message: res.data?.message || 'Relatório emitido'
          }, '*');
        } catch (err) {
          const errData = err?.response?.data || {};
          const isAuth = errData.authError || err?.response?.status === 401;
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-emitir-relatorio-result',
            success: false,
            message: isAuth ? 'Sessão expirada' : (errData.error || err?.message || 'Falha ao emitir relatório')
          }, '*');
        }
      }

      // Consulta de relatórios com filtros
      else if (event.data.type === 'firecheck-consultar-relatorios') {
        try {
          const res = await base44.functions.invoke('consultarRelatorios', event.data.filtros || {});
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-consultar-relatorios-result',
            success: true,
            relatorios: res.data?.relatorios || [],
            total: res.data?.total || 0
          }, '*');
        } catch (err) {
          const errData = err?.response?.data || {};
          const isAuth = errData.authError || err?.response?.status === 401;
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-consultar-relatorios-result',
            success: false,
            message: isAuth ? 'Sessão expirada' : (errData.error || err?.message || 'Erro na consulta')
          }, '*');
        }
      }

      // Buscar relatório individual para visualização detalhada
      else if (event.data.type === 'firecheck-buscar-relatorio') {
        try {
          const relatorio = await base44.entities.Relatorio.get(event.data.id);
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-buscar-relatorio-result',
            success: true,
            relatorio
          }, '*');
        } catch (err) {
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-buscar-relatorio-result',
            success: false,
            message: err?.message || 'Relatório não encontrado'
          }, '*');
        }
      }

      // Resolver NC (atualizar status de resolução da não conformidade)
      else if (event.data.type === 'firecheck-resolver-nc') {
        try {
          const res = await base44.functions.invoke('resolverNC', event.data.payload);
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-resolver-nc-result',
            success: true,
            message: res.data?.message || 'NC atualizada'
          }, '*');
        } catch (err) {
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-resolver-nc-result',
            success: false,
            message: err?.response?.data?.error || err?.message || 'Falha ao atualizar NC'
          }, '*');
        }
      }

      // Registrar evento na trilha de auditoria
      else if (event.data.type === 'firecheck-registrar-auditoria') {
        try {
          await base44.functions.invoke('registrarAuditoria', event.data.payload || {});
        } catch (err) {
          // Silencioso - auditoria não deve bloquear o fluxo
        }
      }

      // Auto-save de vistoria na nuvem (debounced pelo iframe)
      else if (event.data.type === 'firecheck-save-vistoria') {
        try {
          const payload = event.data.payload;
          const filter = { modulo: payload.modulo, status: 'em_andamento' };
          if (payload.equipamento_id) filter.equipamento_id = payload.equipamento_id;
          const existing = await base44.entities.Vistoria.filter(filter, '-updated_date', 5);
          let vistoria;
          const data = {
            header: payload.header,
            answers: payload.answers,
            justifications: payload.justifications,
            selectedHydrant: payload.selectedHydrant,
            it16: payload.it16,
            it21: payload.it21,
            operador: payload.operador,
            operador_id: payload.operador_id,
            operador_perfil: payload.operador_perfil
          };
          if (existing && existing.length > 0) {
            vistoria = await base44.entities.Vistoria.update(existing[0].id, data);
          } else {
            vistoria = await base44.entities.Vistoria.create({
              modulo: payload.modulo,
              equipamento_id: payload.equipamento_id || '',
              status: 'em_andamento',
              ...data
            });
          }
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-save-vistoria-result',
            success: true,
            vistoria_id: vistoria.id,
            modulo: payload.modulo
          }, '*');
        } catch (err) {
          const errData = err?.response?.data || {};
          const isAuth = errData.authError || err?.response?.status === 401;
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-save-vistoria-result',
            success: false,
            message: isAuth ? 'Sessão expirada' : (errData.error || err?.message || 'Falha ao salvar')
          }, '*');
        }
      }

      // Carregar vistoria em_andamento do módulo
      else if (event.data.type === 'firecheck-load-vistoria') {
        try {
          const { modulo, equipamento_id } = event.data;
          const filter = { modulo, status: 'em_andamento' };
          if (equipamento_id) filter.equipamento_id = equipamento_id;
          const existing = await base44.entities.Vistoria.filter(filter, '-updated_date', 5);
          const vistoria = existing && existing.length > 0 ? existing[0] : null;
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-load-vistoria-result',
            success: true,
            modulo,
            vistoria
          }, '*');
        } catch (err) {
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-load-vistoria-result',
            success: false,
            modulo: event.data.modulo,
            message: err?.message || 'Erro ao carregar'
          }, '*');
        }
      }

      // Listar todas as vistorias em_andamento para o Gerenciador
      else if (event.data.type === 'firecheck-list-vistorias') {
        try {
          const all = await base44.entities.Vistoria.filter({ status: 'em_andamento' }, '-updated_date', 500);
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-list-vistorias-result',
            success: true,
            vistorias: all || []
          }, '*');
        } catch (err) {
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-list-vistorias-result',
            success: false,
            vistorias: []
          }, '*');
        }
      }

      // Listar códigos de equipamentos filtrados por tipo (para seleção em silo)
      else if (event.data.type === 'firecheck-equipamento-listar-by-tipo') {
        try {
          const tipos = event.data.tipos || [];
          const all = await base44.entities.EquipamentoCodigo.list('-updated_date', 500);
          const filtered = (all || []).filter(e => tipos.includes(e.tipo));
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-equipamento-listar-by-tipo-result',
            success: true,
            modId: event.data.modId,
            tipos,
            codigos: filtered
          }, '*');
        } catch (err) {
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-equipamento-listar-by-tipo-result',
            success: false,
            modId: event.data.modId,
            tipos: event.data.tipos || [],
            message: err?.message || 'Erro ao listar equipamentos'
          }, '*');
        }
      }

      // Listar códigos de equipamentos cadastrados
      else if (event.data.type === 'firecheck-equipamento-listar') {
        try {
          const all = await base44.entities.EquipamentoCodigo.list('-updated_date', 500);
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-equipamento-listar-result',
            success: true,
            codigos: all || []
          }, '*');
        } catch (err) {
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-equipamento-listar-result',
            success: false,
            message: err?.message || 'Erro ao listar códigos'
          }, '*');
        }
      }

      // Sugerir próximo número de equipamento
      else if (event.data.type === 'firecheck-equipamento-sugerir') {
        try {
          const res = await base44.functions.invoke('gerarCodigoEquipamento', event.data.payload);
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-equipamento-sugerir-result',
            success: true,
            proximo_numero: res.data?.proximo_numero || 1
          }, '*');
        } catch (err) {
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-equipamento-sugerir-result',
            success: false,
            message: err?.response?.data?.error || err?.message || 'Erro'
          }, '*');
        }
      }

      // Criar ou editar código de equipamento
      else if (event.data.type === 'firecheck-equipamento-salvar') {
        try {
          const res = await base44.functions.invoke('gerarCodigoEquipamento', event.data.payload);
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-equipamento-salvar-result',
            success: true,
            message: res.data?.message || 'Operação realizada',
            equipamento: res.data?.equipamento
          }, '*');
        } catch (err) {
          const errData = err?.response?.data || {};
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-equipamento-salvar-result',
            success: false,
            message: errData.error || err?.message || 'Falha na operação'
          }, '*');
        }
      }

      // Excluir código de equipamento
      else if (event.data.type === 'firecheck-equipamento-excluir') {
        try {
          const res = await base44.functions.invoke('gerarCodigoEquipamento', event.data.payload);
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-equipamento-excluir-result',
            success: true,
            message: res.data?.message || 'Código excluído'
          }, '*');
        } catch (err) {
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-equipamento-excluir-result',
            success: false,
            message: err?.response?.data?.error || err?.message || 'Falha ao excluir'
          }, '*');
        }
      }

      // Consultar relatórios por código de equipamento
      else if (event.data.type === 'firecheck-equipamento-consultar-relatorios') {
        try {
          const res = await base44.functions.invoke('consultarRelatorios', event.data.filtros || {});
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-equipamento-consultar-relatorios-result',
            success: true,
            relatorios: res.data?.relatorios || [],
            total: res.data?.total || 0
          }, '*');
        } catch (err) {
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-equipamento-consultar-relatorios-result',
            success: false,
            message: err?.message || 'Erro na consulta'
          }, '*');
        }
      }

      // ── MÓDULO DEA (Desfibriladores) ──
      // Listar DEAs
      else if (event.data.type === 'firecheck-dea-listar') {
        try {
          const all = await base44.entities.DEA.list('-updated_date', 500);
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-dea-listar-result',
            success: true,
            deas: all || []
          }, '*');
        } catch (err) {
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-dea-listar-result',
            success: false,
            message: err?.message || 'Erro ao listar DEAs'
          }, '*');
        }
      }

      // Salvar/criar/editar DEA
      else if (event.data.type === 'firecheck-dea-salvar') {
        try {
          const payload = event.data.payload;
          let dea;
          if (payload.id) {
            const { id, ...data } = payload;
            dea = await base44.entities.DEA.update(id, data);
          } else {
            dea = await base44.entities.DEA.create(payload);
          }
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-dea-salvar-result',
            success: true,
            message: payload.id ? 'DEA atualizado' : 'DEA cadastrado',
            dea
          }, '*');
        } catch (err) {
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-dea-salvar-result',
            success: false,
            message: err?.response?.data?.error || err?.message || 'Falha ao salvar'
          }, '*');
        }
      }

      // Arquivar DEA (soft delete via ativo=false)
      else if (event.data.type === 'firecheck-dea-arquivar') {
        try {
          await base44.entities.DEA.update(event.data.id, { ativo: false });
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-dea-arquivar-result',
            success: true,
            message: 'DEA arquivado com sucesso'
          }, '*');
        } catch (err) {
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-dea-arquivar-result',
            success: false,
            message: err?.response?.data?.error || err?.message || 'Falha ao arquivar'
          }, '*');
        }
      }

      // Listar verificações
      else if (event.data.type === 'firecheck-dea-verificacao-listar') {
        try {
          const all = await base44.entities.DEAVerificacao.list('-updated_date', 500);
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-dea-verificacao-listar-result',
            success: true,
            verificacoes: all || []
          }, '*');
        } catch (err) {
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-dea-verificacao-listar-result',
            success: false,
            verificacoes: []
          }, '*');
        }
      }

      // Salvar verificação
      else if (event.data.type === 'firecheck-dea-verificacao-salvar') {
        try {
          await base44.entities.DEAVerificacao.create(event.data.payload);
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-dea-verificacao-salvar-result',
            success: true,
            message: 'Verificação registrada'
          }, '*');
        } catch (err) {
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-dea-verificacao-salvar-result',
            success: false,
            message: err?.response?.data?.error || err?.message || 'Falha ao registrar'
          }, '*');
        }
      }

      // Listar manutenções
      else if (event.data.type === 'firecheck-dea-manutencao-listar') {
        try {
          const all = await base44.entities.DEAManutencao.list('-updated_date', 500);
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-dea-manutencao-listar-result',
            success: true,
            manutencoes: all || []
          }, '*');
        } catch (err) {
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-dea-manutencao-listar-result',
            success: false,
            manutencoes: []
          }, '*');
        }
      }

      // Salvar manutenção
      else if (event.data.type === 'firecheck-dea-manutencao-salvar') {
        try {
          await base44.entities.DEAManutencao.create(event.data.payload);
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-dea-manutencao-salvar-result',
            success: true,
            message: 'Ordem de manutenção criada'
          }, '*');
        } catch (err) {
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-dea-manutencao-salvar-result',
            success: false,
            message: err?.response?.data?.error || err?.message || 'Falha ao criar'
          }, '*');
        }
      }

      // Concluir manutenção
      else if (event.data.type === 'firecheck-dea-manutencao-concluir') {
        try {
          await base44.entities.DEAManutencao.update(event.data.id, {
            status: 'Concluída',
            data_execucao: new Date().toLocaleDateString('sv-SE')
          });
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-dea-manutencao-concluir-result',
            success: true,
            message: 'Manutenção concluída'
          }, '*');
        } catch (err) {
          iframeRef.current?.contentWindow?.postMessage({
            type: 'firecheck-dea-manutencao-concluir-result',
            success: false,
            message: err?.response?.data?.error || err?.message || 'Falha ao concluir'
          }, '*');
        }
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // Assinatura realtime: repassa mudanças de Vistoria ao iframe
  useEffect(() => {
    const unsubscribe = base44.entities.Vistoria.subscribe((event) => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'firecheck-vistoria-changed',
          vistoria: event.data,
          eventType: event.type
        }, '*');
      }
    });
    return unsubscribe;
  }, []);

  if (!html) {
    return (
      <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
        <Image
          src={BG_URL}
          alt="FireCheck Pro"
          fittingType="fill"
          className="absolute inset-0 w-full h-full"
        />
        <div className="relative z-10 w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden">
      <Image
        src={BG_URL}
        alt="FireCheck Pro"
        fittingType="fill"
        className="absolute inset-0 w-full h-full"
      />
      <iframe
        ref={iframeRef}
        title="FireCheck Pro"
        srcDoc={html}
        className="relative z-10 w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-print"
      />
    </div>
  );
}