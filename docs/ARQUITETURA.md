# Arquitetura Técnica — FireCheck Pro

## Visão Geral
Aplicação web construída sobre a plataforma Base44, utilizando React + Tailwind CSS para o frontend e o backend-as-a-service da Base44 para persistência, autenticação e integrações.

## Stack Tecnológica
| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Tailwind CSS + Vite |
| UI Components | shadcn/ui + Radix UI |
| Icons | lucide-react |
| Backend | Base44 (BaaS) |
| Database | Base44 Entities (NoSQL) |
| Auth | Base44 Auth + RBAC customizado |
| Realtime | Base44 WebSocket subscriptions |
| Integrações | Google Sheets, GitHub |

## Entidades de Dados
- **Vistoria**: Checklists em andamento com sincronização em tempo real
- **Relatorio**: Relatórios emitidos com numeração sequencial
- **Auditoria**: Trilha de auditoria para conformidade
- **EquipamentoCodigo**: Códigos únicos de equipamentos
- **DEA/DEAVerificacao/DEAManutencao**: Gestão de desfibriladores

## Funções Backend
- emitirRelatorio — Emite relatório numerado
- consultarRelatorios — Consulta relatórios com filtros
- registrarAuditoria — Registra evento na trilha
- resolverNC — Atualiza status de NC
- sendVistoriaToSheets — Envia para Google Sheets
- gerarCodigoEquipamento — Gera/valida códigos
- syncToGitHub — Sincroniza código com GitHub

## Segurança (RLS)
Row-Level Security configurado por entidade: Create/Read aberto para usuários autenticados, Update/Delete restrito a admin.

---

© 2026 CILO IMREA HC VILA MARIANA • Segurança Técnica
FireCheck Pro • RBAC 2.1 • Auditável • NBR & IT
