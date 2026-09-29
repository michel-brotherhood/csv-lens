# Como contribuir

Obrigado por considerar uma contribuição ao CSV Lens.

## Antes de abrir uma alteração

1. Abra uma issue para falhas ou propostas que mudem o comportamento.
2. Mantenha o projeto sem dependências de runtime quando possível.
3. Não inclua CSVs de clientes, dados pessoais, credenciais ou arquivos internos.
4. Prefira mudanças pequenas e explique o problema que elas resolvem.

## Desenvolvimento local

O app abre diretamente pelo `index.html`. Para validar as mudanças com Node.js 20 ou superior:

```bash
npm test
node --check app.js
node --check csv.js
```

Adicione testes para mudanças no parser, sobretudo para aspas, separadores, linhas irregulares e finais de linha.

## Pull requests

Descreva o comportamento anterior, o novo comportamento e a forma de validação. Se a interface mudar, inclua capturas de tela próprias com dados fictícios. Não use dados reais ou confidenciais nas imagens.
