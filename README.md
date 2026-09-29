# CSV Lens

**Explore arquivos CSV de forma rápida, clara e privada.** O CSV Lens é uma aplicação web leve, feita em JavaScript puro, que roda no navegador e não envia seus arquivos para um servidor.

> A ferramenta foi pensada para inspeção rápida de tabelas. Ela não substitui um processo de validação, limpeza ou análise estatística.

## O que você pode fazer

- Abrir um CSV pelo seletor de arquivos ou arrastando-o para a área de importação.
- Consultar quantidade de linhas e colunas antes de explorar os dados.
- Pesquisar simultaneamente em todas as colunas, ignorando acentos e diferenças entre maiúsculas e minúsculas.
- Ordenar uma coluna em ordem crescente ou decrescente.
- Navegar por páginas de 25, 50 ou 100 linhas.
- Exportar os resultados filtrados em CSV compatível com Excel e LibreOffice.
- Trabalhar sem conta, instalação ou conexão com uma API.

## Começar

1. Baixe ou clone o repositório.
2. Abra `index.html` em um navegador moderno.
3. Escolha um arquivo `.csv` ou arraste-o para a área indicada.
4. Use a busca, a ordenação e a paginação para encontrar os dados.
5. Clique em **Exportar filtrados** para baixar o resultado atual.

O projeto não exige `npm install`, etapa de build ou servidor web. Para executar os testes, é necessário ter Node.js 20 ou superior:

```bash
npm test
```

## Formato de entrada

O parser reconhece automaticamente vírgula, ponto e vírgula ou tabulação como separador. Também trata BOM UTF-8, finais de linha LF/CRLF, campos entre aspas, aspas duplicadas e quebras de linha dentro de um campo.

Linhas com menos valores são completadas com células vazias. Se alguma linha tiver mais valores que o cabeçalho, novas colunas são criadas para preservar esses dados. Campos de fórmula são prefixados com apóstrofo ao exportar para reduzir o risco de execução como fórmula em planilhas.

## Privacidade e limites

- O arquivo é lido pela API `File` do navegador e permanece no dispositivo.
- Não há servidor, telemetria, armazenamento remoto ou dependências de terceiros.
- O limite atual é de **20 MB** para reduzir o risco de lentidão e consumo excessivo de memória.
- Arquivos precisam estar em UTF-8. Se a acentuação aparecer incorreta, converta o arquivo para UTF-8 antes de abri-lo.
- A ferramenta mantém os dados em memória durante a sessão. Fechar ou recarregar a página descarta o conteúdo.

## Acessibilidade e usabilidade

A interface foi projetada para funcionar em telas pequenas e grandes, oferece estados de erro e resultado vazio, usa controles nativos, informa o estado do carregamento a leitores de tela e permite acionar a busca com `Ctrl K` ou `⌘ K`. A ordenação é indicada visualmente e exposta na semântica da tabela.

Consulte [ANALISE-USABILIDADE.md](ANALISE-USABILIDADE.md) para o estudo do fluxo, público indicado, limitações e próximos passos.

## Estrutura

| Arquivo       | Responsabilidade                                     |
| ------------- | ---------------------------------------------------- |
| `index.html`  | Estrutura acessível da interface                     |
| `styles.css`  | Layout responsivo e identidade visual                |
| `app.js`      | Importação, busca, ordenação, paginação e exportação |
| `csv.js`      | Parser CSV e proteção contra fórmulas de planilha    |
| `csv.test.js` | Testes automatizados do parser                       |

## Contribuir

Leia [CONTRIBUTING.md](CONTRIBUTING.md) antes de enviar uma alteração. Relatos de falhas devem seguir o modelo de issue. Não publique arquivos CSV reais, pois eles podem conter dados pessoais ou confidenciais.

## Licença

Distribuído sob a licença MIT. Consulte [LICENSE](LICENSE).
