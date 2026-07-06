# organizer

Kanban diário estilo Plane: tarefas recorrentes (resetam por dia da semana) e
tarefas com data única, filtradas por um seletor de dia tipo calendário.

## Diretrizes de comportamento

Reduzem erros comuns de LLM ao codar. Tradeoff: priorizam cautela sobre
velocidade — pra tarefa trivial, use bom senso.

### 1. Pense antes de codar
Não assuma. Não esconda confusão. Traga os tradeoffs à tona.
- Declare suas suposições explicitamente. Se tiver incerteza, pergunte.
- Se existem múltiplas interpretações, apresente-as — não escolha em silêncio.
- Se existe abordagem mais simples, diga isso. Questione quando fizer sentido.
- Se algo não está claro, pare. Nomeie o que está confuso. Pergunte.

### 2. Simplicidade primeiro
Código mínimo que resolve o problema. Nada especulativo.
- Nenhuma feature além do que foi pedido.
- Nenhuma abstração pra código de uso único.
- Nenhuma "flexibilidade" ou "configurabilidade" que não foi pedida.
- Nenhum tratamento de erro pra cenário impossível.
- Se escreveu 200 linhas e podia ser 50, reescreva.
Pergunte-se: um engenheiro sênior acharia isso complicado demais? Se sim,
simplifique.

### 3. Mudanças cirúrgicas
Toque só no que precisa. Limpe só a sua própria bagunça.
- Não "melhore" código, comentário ou formatação adjacentes.
- Não refatore o que não está quebrado.
- Combine com o estilo existente, mesmo que faria diferente.
- Notou código morto não relacionado? Mencione — não delete.
- Remova imports/variáveis/funções que SUAS mudanças tornaram inúteis.
- Não remova código morto pré-existente a menos que eu peça.
Teste: toda linha alterada deve rastrear diretamente até o meu pedido.

### 4. Execução orientada a objetivo
Defina critério de sucesso. Repita até verificar.
- "Adicionar validação" → escrever testes pra inputs inválidos, fazer passar.
- "Corrigir o bug" → escrever teste que reproduz, fazer passar.
- "Refatorar X" → garantir que os testes passam antes e depois.
Pra tarefa multi-etapa, declare um plano breve antes de começar:
1. [Etapa] → verificar: [checagem]
2. [Etapa] → verificar: [checagem]

Sinal de que está funcionando: menos mudança desnecessária no diff, menos
reescrita por complicação excessiva, perguntas vêm antes da implementação,
não depois do erro.

## Contexto do projeto

## Stack
- Next.js 14+ (App Router, TypeScript)
- Supabase (Postgres + Auth via @supabase/ssr) — projeto "organizer" já criado
- Tailwind CSS
- dnd-kit para drag and drop (não usar react-beautiful-dnd, descontinuado)
- date-fns para datas, zod para validação de forms

## Schema (fonte da verdade — não inventar colunas ou tabelas diferentes disso)

\`\`\`sql
create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  priority text not null check (priority in ('baixa','media','alta','urgente')) default 'media',
  type text not null check (type in ('recurring','scheduled')),
  recurrence_days int[],   -- 0=dom ... 6=sab, só p/ recurring
  due_date date,           -- só p/ scheduled
  tag text,
  archived boolean default false,
  created_at timestamptz default now()
);

create table task_statuses (
  task_id uuid references tasks(id) on delete cascade,
  user_id uuid references auth.users not null,
  status_date date not null,
  status text not null check (status in ('todo','doing','done')) default 'todo',
  updated_at timestamptz default now(),
  primary key (task_id, status_date)
);
\`\`\`

RLS habilitada nas duas, política sempre `user_id = auth.uid()`.

O pulo do gato do produto: status vive em (task_id, status_date), não na tarefa.
Isso é o que faz uma recorrente "resetar" a cada dia novo.

## Convenções
- Nunca commitar `.env.local` nem qualquer credencial real do Supabase.
- Se faltar uma env var real (URL/anon key), parar e pedir — nunca inventar
  ou usar valor placeholder que pareça real.
- Server Components para leitura, Server Actions para escrita. Evitar API
  routes REST manuais a menos que eu peça explicitamente.
- Commits pequenos, um por unidade lógica de mudança, mensagens em português.
- Antes de decisões estruturais não especificadas aqui (ex: biblioteca de
  toast, forma exata do modal), perguntar em vez de assumir.
