# Análise de usabilidade — CSV Lens

## Objetivo e público

O CSV Lens atende quem precisa conferir rapidamente o conteúdo de uma planilha exportada — por exemplo, encontrar uma linha, verificar o cabeçalho, localizar valores inconsistentes e compartilhar um recorte — sem instalar um editor completo ou enviar o arquivo a um serviço online.

É apropriado para arquivos pequenos e médios em UTF-8. Não é indicado para edição de células, junção de bases, fórmulas, análise estatística, arquivos muito grandes ou dados que exijam controle de acesso organizacional.

## Fluxo principal avaliado

1. A pessoa identifica a promessa de privacidade e o limite de tamanho antes do envio.
2. Seleciona o CSV ou arrasta o arquivo.
3. Recebe nome, tamanho, quantidade de linhas e colunas.
4. Pesquisa ou ordena para localizar o trecho de interesse.
5. Exporta os resultados filtrados.

Esse fluxo resolve uma tarefa concreta em poucos passos. A busca global reduz a necessidade de conhecer previamente a coluna correta, e os estados de erro indicam como corrigir problemas de arquivo.

## Revisão heurística

| Critério                     | Estado           | Observação                                                                                                                                                    |
| ---------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Clareza da tarefa            | Bom              | Título e chamada descrevem o benefício, e há instrução para selecionar ou arrastar o CSV.                                                                     |
| Feedback                     | Bom              | O nome do arquivo, métricas, contagem de resultados, página atual e alertas ficam visíveis.                                                                   |
| Controle do usuário          | Bom              | É possível fechar o arquivo, ajustar o tamanho da página e exportar apenas os resultados atuais.                                                              |
| Prevenção de erros           | Bom              | O limite de 20 MB é informado; estrutura inválida e aspas não fechadas geram mensagens explícitas.                                                            |
| Responsividade               | Bom              | A tabela pode rolar horizontalmente em telas menores e as ações se reorganizam no mobile.                                                                     |
| Acessibilidade               | Parcialmente bom | Há rótulos, foco por teclado, status ao vivo, cabeçalho semântico e anúncio de ordenação. Testes com leitores de tela e auditoria WCAG ainda são necessários. |
| Adequação a arquivos grandes | Limitado         | O arquivo e as linhas ficam em memória e a busca é síncrona. O limite reduz, mas não elimina, a possibilidade de lentidão em dispositivos modestos.           |

## Limites conhecidos

- O app não modifica o arquivo original.
- A busca é textual e global; não oferece filtros por tipo, intervalo ou valor nulo.
- O suporte a codificações está limitado a UTF-8.
- A ordenação considera os valores como texto com comparação numérica natural; datas não são interpretadas como datas.
- O limite de 20 MB é fixo.
- A segurança contra fórmula na exportação usa apóstrofo como prefixo; a aparência do valor pode variar conforme o aplicativo de planilha.

## Próxima pesquisa recomendada

Antes de aumentar escopo, testar com 5 a 8 pessoas que recebem CSVs no trabalho. Pedir que encontrem um registro por nome, filtrem por um termo com acento, ordenem uma coluna e exportem o resultado. Observar sucesso sem ajuda, tempo até concluir e dúvidas sobre privacidade/exportação. Só então priorizar Web Worker, filtros por coluna ou suporte a arquivos maiores.
