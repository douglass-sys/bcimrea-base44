// Dados estáticos do FireCheck Pro extraídos do firecheck.html para reduzir o tamanho do arquivo
// Injetados no iframe via script tag antes do script principal

export const FIRECHECK_DATA = `
const HYDRANT_DATA = {
    "Bloco 1": [
        { code: "H-32-B1-02-01", desc: "2º Pavimento - Corredor Bloco 1A" },
        { code: "H-32-B1-02-02", desc: "2º Pavimento - Escada Principal" },
        { code: "H-32-B1-02-03", desc: "2º Pavimento - Ala Sul" },
        { code: "H-32-B1-02-04", desc: "2º Pavimento - Hall de Elevadores" },
        { code: "H-32-B1-03-01", desc: "3º Pavimento - Corredor Leste" },
        { code: "H-32-B1-03-02", desc: "3º Pavimento - Escada de Emergência" },
        { code: "H-32-B1-04-01", desc: "4º Pavimento - Hall Central" },
        { code: "H-32-B1-04-02", desc: "4º Pavimento - Área Técnica" },
        { code: "H-32-B1-05-01", desc: "5º Pavimento - Corredor Norte" },
        { code: "H-32-B1-05-02", desc: "5º Pavimento - Escada" },
        { code: "H-32-B1-06-01", desc: "6º Pavimento - Sala de Reuniões" },
        { code: "H-32-B1-06-02", desc: "6º Pavimento - Corredor Principal" }
    ],
    "Bloco 2": [
        { code: "H-32-B2-01-01", desc: "1º Pavimento - Portaria Principal" },
        { code: "H-32-B2-02-01", desc: "2º Pavimento - Recepção" },
        { code: "H-32-B2-03-01", desc: "3º Pavimento - Ambulatório" },
        { code: "H-32-B2-04-01", desc: "4º Pavimento - Terapia Ocupacional" },
        { code: "H-32-B2-05-01", desc: "5º Pavimento - Internação Leste" },
        { code: "H-32-B2-06-01", desc: "6º Pavimento - Internação Oeste" },
        { code: "H-32-B2-TE-01", desc: "Térreo - Pátio Interno" },
        { code: "H-32-B2-TE-02", desc: "Térreo - DML / Manutenção" },
        { code: "H-32-B2-TE-03", desc: "Térreo - Estacionamento Coberto" }
    ],
    "Bloco 3": [
        { code: "H-32-B3-TE-01", desc: "Térreo - Refeitório e Cozinha" },
        { code: "H-32-B3-TE-02", desc: "Térreo - Central de Triagem" },
        { code: "H-32-B3-TE-03", desc: "Térreo - Almoxarifado" },
        { code: "H-32-B3-TE-04", desc: "Térreo - Casa de Bombas" }
    ]
};

const KIT_UNITS = [
    { id: 'P-32-B3-01', label: 'P-32-B3-01 - Térreo BL3 / ADM' },
    { id: 'P-32-B1-02', label: 'P-32-B1-02 - 2º Andar / Consultório' },
    { id: 'P-32-B1-03', label: 'P-32-B1-03 - 3º Andar / ADM/DIREX' },
    { id: 'P-32-B1-04', label: 'P-32-B1-04 - 4º Andar / Internação' },
    { id: 'P-32-B1-05', label: 'P-32-B1-05 - 5º Andar / Internação' },
    { id: 'P-32-B2-06', label: 'P-32-B2-06 - 2º Andar / Fisio' },
    { id: 'P-32-B2-07', label: 'P-32-B2-07 - 2º Andar / C.Físico' },
    { id: 'P-32-B2-08', label: 'P-32-B2-08 - 1º Andar / Ambulatório' },
    { id: 'P-32-B3-09', label: 'P-32-B3-09 - Térreo / ADM' }
];
const KIT_EXTERNO = [
    { desc: 'Head Block', unid: 'Par', prev: 1, validade: 'Indefinido' },
    { desc: 'Prancha Rígida de Remoção', unid: 'Unidade', prev: 1, validade: 'Indefinido' },
    { desc: 'Cintos Fixação (Vermelho, Amarelo, Preto)', unid: 'Unidade', prev: 3, validade: 'Indefinido' }
];
const KIT_BOLSA = [
    { desc: 'Cobertor Térmico Aluminisado 2,10x1,40m', unid: 'unidade', prev: 1 },
    { desc: 'Tesoura de Ponta Romba para Resgate', unid: 'unidade', prev: 1 },
    { desc: 'Atadura de Crepe 10cm x 1,80m', unid: 'unidade', prev: 3 },
    { desc: 'Atadura de Crepe 15cm x1,08m', unid: 'unidade', prev: 3 },
    { desc: 'Bandagens Triangular de Algodão 1,0x1,0x1,42cm', unid: 'unidade', prev: 2 },
    { desc: 'Colar cervical de resgate Infantil', unid: 'unidade', prev: 1 },
    { desc: 'Colar cervical de resgate P', unid: 'Unidade', prev: 1 },
    { desc: 'Colar cervical de resgate M', unid: 'Unidade', prev: 1 },
    { desc: 'Colar cervical de resgate G', unid: 'Unidade', prev: 1 },
    { desc: 'Esparadrapo 10cm x 4,5m', unid: 'Unidade', prev: 1 },
    { desc: 'Talafix dedo 20x2cm', unid: 'unidade', prev: 1 },
    { desc: 'Talafix infantil 25x5cm', unid: 'unidade', prev: 1 },
    { desc: 'Talafix resgate 30x8cm', unid: 'unidade', prev: 1 },
    { desc: 'Talafix resgate P 53x8cm', unid: 'unidade', prev: 1 },
    { desc: 'Talafix resgate M 63x9cm', unid: 'unidade', prev: 1 },
    { desc: 'Luva de Procedimentos M', unid: 'Par', prev: 3 },
    { desc: 'Óculos de proteção sem antiembaçante', unid: 'unidade', prev: 1 },
    { desc: 'Mascara facial reutilizável tipo Pocket Mask', unid: 'Unidade', prev: 1 },
    { desc: 'Bisturi descartável lâmina 15', unid: 'Unidade', prev: 1 },
    { desc: 'Curativo tipo Band-Aid', unid: 'caixa', prev: 1 },
    { desc: 'Fita Microporosa 2,5cmx10m', unid: 'Unidade', prev: 1 },
    { desc: 'Gazes estéreis 7,5x7,5cm', unid: 'pacote', prev: 5 }
];
const KIT_PARTO = [
    { desc: 'Absorvente para incontinência urinária', unid: 'unidade', prev: 1 },
    { desc: 'Álcool Swab sachê', unid: 'unidade', prev: 2 },
    { desc: 'Avental descartável impermeável manga longa', unid: 'unidade', prev: 1 },
    { desc: 'Bisturi descartável lâmina 12', unid: 'unidade', prev: 1 },
    { desc: 'Bracelete de identificação bebê', unid: 'unidade', prev: 1 },
    { desc: 'Clampe umbilical', unid: 'unidade', prev: 2 },
    { desc: 'Compressa de gaze algodonada 45x50cm (zobec)', unid: 'unidade', prev: 1 },
    { desc: 'Gazes estéreis 7,5x7,5cm', unid: 'pacote', prev: 2 },
    { desc: 'Luva cirúrgica estéril nº7', unid: 'Par', prev: 2 },
    { desc: 'Luva cirúrgica estéril nº8', unid: 'Par', prev: 2 }
];
`;