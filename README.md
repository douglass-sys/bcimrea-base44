# BOMBEIRO CIVIL CILO — FireCheck Pro

> **Plataforma de auditoria e conformidade técnica para gestão de vistorias de prevenção contra incêndio**

[![Conformidade](https://img.shields.io/badge/Conformidade-NBR%20%26%20IT-red)](https://bcimrea.base44.app)
[![Versão](https://img.shields.io/badge/Versão-RBAC%202.1%20%E2%80%A2%20Audit%C3%A1vel-blue)](https://bcimrea.base44.app)
[![Acesso](https://img.shields.io/badge/Acesso-bcimrea.base44.app-green)](https://bcimrea.base44.app)

---

## Identificação do Sistema

| Campo | Valor |
|---|---|
| **Nome principal** | BOMBEIRO CIVIL CILO |
| **Nome comercial/técnico** | FireCheck Pro |
| **Descrição** | Plataforma de auditoria e conformidade técnica para gestão de vistorias de prevenção contra incêndio |
| **Endereço de acesso** | [https://bcimrea.base44.app](https://bcimrea.base44.app) |
| **Conformidade** | NBR & IT (Normas Brasileiras e Instruções Técnicas do Corpo de Bombeiros) |
| **Versão** | RBAC 2.1 • Auditável |
| **Propriedade/Créditos** | © 2026 CILO IMREA HC VILA MARIANA • Segurança Técnica |
| **Plataforma** | Base44 |

---

## Acesso ao Sistema

O sistema está disponível em: **[https://bcimrea.base44.app](https://bcimrea.base44.app)**

### Fluxo de Acesso
1. Acesse o endereço acima
2. Na tela de login, informe:
   - **Matrícula ou Usuário** (exemplo: `CILOIMREA`)
   - **Senha**
3. Clique em **"Acessar Painel"**
4. O ambiente operacional será carregado conforme o perfil de acesso (RBAC)

---

## Arquitetura do Sistema

O FireCheck Pro é construído sobre a plataforma **Base44** com as seguintes tecnologias:

- **Frontend**: React + Tailwind CSS + Vite
- **Backend**: Base44 (entidades, funções, autenticação)
- **Persistência**: Base44 Database + Google Sheets (sincronização)
- **Tempo Real**: WebSockets (sincronização de vistorias entre usuários)
- **Autenticação**: RBAC (Role-Based Access Control) com perfis CILO, DIREX, BOMBEIRO, BRIGADISTA

### Estrutura de Diretórios

```
bcimrea-base44/
├── README.md              ← Apresentação e identificação do sistema
├── LICENSE                ← Direitos e termos de uso
├── docs/                  ← Documentação técnica e manual de uso
├── src/                   ← Código-fonte do frontend (React)
│   ├── pages/             ← Páginas da aplicação
│   ├── components/         ← Componentes reutilizáveis (shadcn/ui)
│   ├── lib/               ← Módulos e utilitários
│   ├── assets/            ← Estilos e HTML do FireCheck
│   └── api/               ← Cliente Base44 SDK
├── base44/                ← Configuração e lógica backend
│   ├── entities/          ← Esquemas de dados (Vistoria, Relatorio, DEA, etc.)
│   ├── functions/         ← Funções backend (APIs, integrações)
│   └── connectors/        ← Conectores OAuth (Google Sheets, GitHub)
├── index.html             ← Ponto de entrada HTML
├── package.json           ← Dependências do projeto
└── vite.config.js         ← Configuração do build
```

---

## Módulos do Sistema

| Módulo | Norma | Descrição |
|---|---|---|
| **IT-22** | Instrução Técnica 22 | Hidrantes e Mangotinhos |
| **IT-19** | Instrução Técnica 19 | Sistemas de Alarme e Detecção |
| **IT-21** | Instrução Técnica 21 | Extintores de Incêndio |
| **PCF** | NBR 11742 | Portas Corta-Fogo |
| **Saídas** | Rotas de Fuga | Sinalização e Rotas de Evacuação |
| **IT-16** | Instrução Técnica 16 | Gestão de Riscos |
| **RNC** | — | Registro de Não Conformidades |
| **APH** | — | Atendimento Pré-Hospitalar |
| **Kit Trauma** | — | Controle Mensal do Kit Trauma |
| **DEA** | — | Gestão de Desfibriladores |
| **Equipamentos** | — | Identificação de Equipamentos |

---

## Controle de Acesso (RBAC)

| Perfil | Descrição | Acesso |
|---|---|---|
| **CILO** | Administrador | Acesso total: gestão de usuários, vistorias, relatórios, equipamentos |
| **DIREX** | Gerencial | Dashboard gerencial, consultas, relatórios |
| **BOMBEIRO** | Operacional | Vistorias técnicas, checklists, RNC |
| **BRIGADISTA** | RNC Apenas | Registro de Não Conformidades apenas |

---

## Conformidade Técnica

O sistema atende às seguintes normas e instruções técnicas:

- **NBR 11742** — Portas corta-fogo
- **IT-16** — Gestão de riscos
- **IT-19** — Sistemas de alarme e detecção de incêndio
- **IT-21** — Extintores de incêndio
- **IT-22** — Hidrantes e mangotinhos
- **NBR & IT** — Diretrizes do Corpo de Bombeiros e Normas ABNT

---

## Licença e Direitos

**© 2026 CILO IMREA HC VILA MARIANA • Segurança Técnica**

Todos os direitos reservados. Consulte o arquivo [LICENSE](./LICENSE) para os termos completos.

---

*Documento preservado permanentemente no histórico de versões do GitHub.*
*Versão: RBAC 2.1 • Auditável • Conformidade NBR & IT*
