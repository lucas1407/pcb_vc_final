# UNIVERSIDADE DE SOROCABA – UNISO
## CURSO DE ENGENHARIA DA COMPUTAÇÃO
### DISCIPLINA: COMPUTAÇÃO GRÁFICA

---

# PCB VISION CHECK: SISTEMA DE DIAGNÓSTICO E INSPEÇÃO VISUAL AUTOMATIZADA DE PLACAS DE CIRCUITO IMPRESSO ASSISTIDO POR INTELIGÊNCIA ARTIFICIAL MULTIMODAL

**Lucas Amaral Ferreira¹**  
RA: 00114555  
Prof.: Alex Frazatti  

---

## Resumo
Este trabalho apresenta o desenvolvimento dO **PCB Vision Check**, uma aplicação web de alta fidelidade projetada para automatizar e otimizar o processo de triagem e inspeção visual de Placas de Circuito Impresso (PCBs). O cenário técnico que motivou a solução reside no alto custo dos equipamentos industriais de Inspeção Óptica Automatizada (AOI) e na suscetibilidade a erros humanos em avaliações manuais de bancada. O objetivo geral foi criar uma ferramenta acessível, rápida e precisa para identificar componentes eletrônicos e detectar anomalias visuais como carbonização, capacitores estufados e oxidação. A metodologia adotada consistiu na utilização do framework React 18, TypeScript, Tailwind CSS v4 e o SDK de Inteligência Artificial `@google/genai` consumindo o modelo de fundação multimodal `gemini-3-flash-preview` através de Engenharia de Prompts estruturada com esquemas de resposta JSON rígidos. O deploy funcional foi estabelecido em containers na nuvem, permitindo que técnicos carreguem imagens diretamente de seus navegadores para obter diagnósticos instantâneos. Os resultados demonstram que a IA multimodal acelerou drasticamente o ciclo de desenvolvimento da aplicação e provou-se altamente eficaz na identificação rápida de assinaturas de falha física, concluindo que modelos fundacionais de visão são viáveis para aplicações práticas de manutenção de hardware de baixo custo.

**Palavras-chave:** Engenharia da Computação; Inteligência Artificial; Engenharia de Prompts; Deploy; Visão Computacional; Diagnóstico de PCB.

---

## Introdução
A inspeção técnica de Placas de Circuito Impresso (PCBs) é uma atividade crítica na manufatura eletrônica e em laboratórios de manutenção de peças de alta precisão. Com a constante miniaturização de componentes montados em superfície (SMD), a identificação manual de microfissuras, soldas frias, trilhas oxidadas ou semicondutores queimados tornou-se uma tarefa exaustiva, de alta latência e propensa a falhas visuais por parte do operador técnico.

Embora grandes montadoras operem com máquinas industriais de Inspeção Ópica Automatizada (AOI), o investimento financeiro para tais equipamentos é proibitivo para laboratórios educacionais, centros de reparo independentes e pequenas indústrias. Com a ascensão recente dos Modelos de Linguagem de Grande Porte com capacidades visuais nativas (Multimodais), abre-se uma nova fronteira técnica: o uso de APIs de IA para realizar diagnósticos visuais e estruturados a uma fração do custo de hardware proprietário. Este projeto descreve a concepção, o design, o desenvolvimento metodológico e a publicação do **PCB Vision Check**, uma plataforma web projetada para realizar essa tarefa com precisão e interface moderna.

---

## Ideia Original
A proposta original consistia em desenvolver um portal analítico dedicado a engenheiros e técnicos de hardware. O escopo pretendido visava a criação de uma tela unificada e de alta fidelidade que eliminasse a complexidade operacional de softwares de laboratório tradicionais.

### Proposta de Valor:
1. **Inspeção sem Contato**: Análise diagnóstica instantânea sem necessidade de instrumentação inicial de bancada (osciloscópios ou multímetros).
2. **Classificação Multimodal Estrita**: Identificação automática da classe da placa (placa de controle de potência, placa-mãe, módulo IoT) assim que a imagem é inserida.
3. **Mapeamento de Danos Visuais**: Indicação das violações físicas diretamente na interface, categorizadas por nível de gravidade analítica (Baixo, Médio, Alto).
4. **Protocolo Orientado a Solução**: O sistema não apenas aponta o defeito, mas instrui o técnico com procedimentos corretivos estruturados passo a passo (ex: dessoldagem de capacitor C14 com liga específica).

---

## Metodologia
O desenvolvimento do **PCB Vision Check** foi aceleradamente otimizado por meio de um pipeline integrado que combinou Inteligência Artificial Generativa e componentes React modulares de alta performance.

### 1. Tecnologias Adotadas e Arquitetura
*   **Linguagem & Tipagem**: TypeScript em modo de compilação estrito, garantindo type-safety em todas as chamadas de API e renderização de dados estruturados.
*   **Interface e Estilo**: Tailwind CSS v4, adotando variáveis CSS customizadas organizadas em arquitetura de tokens de design denominados *Elegant Dark* (tons de `#0A0A0C` para o fundo e `#0F0F12` para superfícies, realçados com azul `#2563eb`).
*   **Animações de Interface**: Biblioteca `motion/react` (antiga Framer Motion), essencial para desenhar a linha de varredura (*scan-line*) dinâmica que simula um processo de leitura por raio-x ou radar óptico.
*   **Motor de Inteligência Artificial**: O SDK `@google/genai` foi integrado no lado do servidor para garantir que a chave de API restrita (`GEMINI_API_KEY`) nunca seja exposta no código cliente exposto no navegador.

### 2. Engenharia de Prompts e Resposta Estruturada
Para garantir que a resposta da IA fosse 100% integrável com a interface visual de componentes, utilizou-se a funcionalidade de esquema de resposta rígido do SDK da Google (`responseSchema`). O prompt foi desenhado para agir como um inspetor óptico sênior:

```typescript
const prompt = `Você é uma IA de diagnóstico de PCB de alta precisão. Analise a imagem fornecida de uma Placa de Circuito Impresso.
  
  Tarefas:
  1. Identifique o tipo de placa (placa-mãe, fonte de alimentação, controlador, etc.).
  2. Localize e identifique os principais componentes (ICs, capacitores, resistores, conectores).
  3. Detecte sinais de danos:
     - Componentes queimados (carbonização, descoloração).
     - Capacitores eletrolíticos estufados ou vazando.
     - Trilhas ou pads corroídos (fuzz verde/branco típico).
     - Juntas de solda quebradas ou rachadas.
     - Resíduos de danos por líquidos.
     - Componentes ausentes.
  
  Forneça a análise em formato JSON estrito. Responda tudo em PORTUGUÊS.`;
```

---

## Resultados das Interações
O resultado final do **PCB Vision Check** é um sistema web responsivo, de carregamento rápido e altamente imersivo.

### Link de Produção Ativo:
[Acesse o PCB Vision Check Aqui](https://ais-pre-5e3bsix76nj5vgccgdzjme-501242896238.us-east1.run.app)

### Como Operar o Sistema:
1. **Etapa 1 - Carregamento**: Ao abrir a tela, o profissional se depara com a área de arraste ou seleção de arquivos. O sistema aceita imagens em alta resolução de formatos padrão (JPEG, PNG, HEIC).
2. **Etapa 2 - Escaneamento**: Uma linha horizontal azul neon com propriedades de glow pulsa verticalmente sobre a imagem, proporcionando indicação imersiva de que os vetores visuais estão sendo processados pela IA da Google.
3. **Etapa 3 - Relatório de Painel**:
    *   **Classificação**: Exibe o tipo de placa identificado (ex: Placa Controladora de Ar Condicionado Inverter).
    *   **Inventário**: Uma tabela de componentes detectados com chips integrados identificados e seu respectivo status operativo (Ex: "U1: Microcontrolador ARM Cortex - OK").
    *   **Danos Críticos**: Cartões destacados em vermelho explicitando o dano visualizado com exatidão científica (Ex: "Capacitor C12 apresenta fissura superior no invólucro de alumínio compatível com pico de tensão").
    *   **Protocolo de Remediação**: Passo a passo com ações corretivas indicadas para o técnico de laboratório.

---

## Lições Aprendidas
O desenvolvimento deste projeto envolveu transições cruciais do ambiente de prototipagem para servidores de produção de nuvem (Cloud Run, Vercel). Os maiores desafios identificados e resolvidos incluíram:

1. **Gestão de Chaves e Segurança de API**: Inicialmente, chaves de API declaradas de forma ingênua no frontend causam vazamentos de crédito. A modelagem precisou ser estruturalmente dividida de modo a proteger e ler as chaves estritamente através do escopo do processo do servidor (`process.env.GEMINI_API_KEY`).
2. **Variações de Resposta Visual**: Imagens de placas muito escuras ou com reflexos excessivos de iluminação podem confundir as inferências visuais da IA. Para contornar essa limitação e evitar quebras de layout na interface do usuário, foi implementada uma estrutura defensiva de validação no código do frontend que intercepta respostas incompletas e guia o usuário em como tirar fotos sob iluminação adequada.
3. **Estabilidade de Layout**: Aprendemos a importância de criar placeholders e esqueletos de carregamento para evitar o efeito degradante de salto de conteúdo (*layout shift*) enquanto o JSON de diagnóstico é baixado em segundo plano.

---

## Próximos Passos (Versão 2.0)
Para expandir o valor clínico do **PCB Vision Check** em futuras iterações acadêmicas ou operacionais, prevemos:
*   **Mapeamento de Coordenadas (Bounding Boxes)**: Utilização ativa da propriedade `rect` que já está declarada na tipagem de dados estruturados para renderizar molduras delimitadoras dinâmicas vermelhas ou amarelas diretamente no topo da foto enviada pela pessoa.
*   **Busca Automática de Datasheet**: Criação de link automatizado de busca de folha de dados técnica diretamente para o código de componente identificado (Ex: clicando em "U4" o técnico abre o PDF de fabricante do CI LM358).
*   **Integração com Câmeras Térmicas FLIR**: Permitir a sobreposição de imagens ópticas do circuito com assinaturas térmicas infravermelhas para detectar curtos-circuitos invisíveis a olho nu.

---

## Referências
1. GOOGLE. **Gemini API Documentation & SDK guidelines**. Disponível em: <https://ai.google.dev/gemini-api/docs>. Acesso em: 8 jun. 2026.
2. REACT. **React Documentation - Components and Hooks**. Disponível em: <https://react.dev>. Acesso em: 8 jun. 2026.
3. TAILWIND CSS. **Tailwind CSS v4.0 Docs**. Disponível em: <https://tailwindcss.com/docs>. Acesso em: 8 jun. 2026.
4. FRAMER. **Framer Motion for React (Motion)**. Disponível em: <https://motion.dev>. Acesso em: 8 jun. 2026.
