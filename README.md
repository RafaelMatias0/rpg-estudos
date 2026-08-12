# ⚔️ Crônicas do Aprendiz

Um aplicativo, 100% feito por IA, de acompanhamento de estudos com estética de **RPG medieval/fantasia**. Em vez de um dashboard de produtividade, sua jornada de aprendizado vira uma campanha: você tem um personagem que evolui, um mapa de regiões para conquistar, quests com XP e Bosses que são, na verdade, projetos práticos reais.

## Sobre o projeto

Este é um projeto simples e sem overengineering — HTML, CSS e JavaScript puros, sem build, sem backend, sem autenticação. Todo o progresso fica salvo no `localStorage` do próprio navegador.

A ideia central: quando bater a preguiça de estudar, abrir o app e pensar *"meu personagem ainda precisa evoluir"*, *"falta pouco para derrotar o Boss"*, *"quero desbloquear aquele equipamento"*.

## Funcionalidades

- **Personagem evolutivo** — ilustração em SVG que muda com o nível (5 faixas de evolução, de Aventureiro Iniciante a Mestre da Jornada) e ganha equipamentos visuais (espada, escudo, armadura, ferramenta, capa, coroa) ao derrotar cada Boss.
- **Mapa da Campanha** — 6 regiões temáticas representando temporadas de estudo (Python, SQL/PostgreSQL, Backend, Engenharia de Dados, Cloud, Entrevistas), com região atual destacada, futuras bloqueadas e concluídas marcadas.
- **Quests** — missões de estudo realistas e objetivas, com recompensa de XP definida por você. É possível criar novas quests a qualquer momento pelo formulário na aba Quests.
- **Temporadas bem definidas** — cada temporada tem uma meta clara de XP total, com barra de progresso mostrando exatamente quanto falta para desbloquear o desafio do Boss.
- **Boss = projeto real** — cada temporada exige um projeto prático específico da área (ex.: construir do zero, sem ajuda de IA, um sistema financeiro em terminal para "derrotar" a temporada de Python) para ser marcado como concluído.
- **Cronômetro de estudo** — inicie, pause e conclua uma sessão de estudo; os minutos estudados viram XP automaticamente ao finalizar.
- **Progresso salvo automaticamente** — tudo é gravado no `localStorage` a cada ação, com botões de **exportar** e **restaurar backup** em arquivo `.json`.

## Como rodar

Não precisa de instalação nem de servidor. Basta abrir o `index.html` diretamente no navegador:

```bash
git clone https://github.com/<seu-usuario>/<seu-repositorio>.git
cd <seu-repositorio>
# abra o index.html no navegador (duplo clique ou "abrir com")
```

Ou publique com **GitHub Pages**: em *Settings → Pages*, selecione a branch principal e a raiz do projeto como origem. O app estará disponível em `https://<seu-usuario>.github.io/<seu-repositorio>/`.

## Estrutura do projeto

```
.
├── index.html   # estrutura das telas (Vila, Personagem, Mapa, Quests, Estudo)
├── style.css    # tema visual (pergaminho, madeira, pedra, metal, brilho dourado)
├── script.js    # estado do personagem, temporadas, XP, cronômetro e persistência
└── README.md
```

## Personalizando

- **Temporadas e Bosses**: edite o array `SEASONS` em `script.js` para ajustar temas, metas de XP e a descrição do projeto de cada Boss.
- **Ritmo de XP**: a constante `XP_PER_MINUTE` controla quanto XP cada minuto de estudo cronometrado vale.
- **Faixas de evolução do personagem**: o array `LEVEL_TITLES` define os intervalos de nível e os títulos exibidos.

## Backup e restauração

O progresso vive no `localStorage` do navegador — ou seja, é local a esse navegador/dispositivo. Use o botão **Exportar Backup** (aba Personagem) regularmente para gerar um arquivo `.json` de segurança, e **Restaurar Backup** para recuperar o progresso a partir dele em outro navegador ou dispositivo.

## Roadmap

Funcionalidades previstas para versões futuras, em ordem de prioridade:

- [ ] Diário de estudos
- [ ] Estatísticas simples (tempo total estudado, XP por temporada, etc.)
- [ ] Mais variações visuais de equipamento por sub-nível dentro de cada temporada
- [ ] Conquistas/badges adicionais

## Licença

Projeto pessoal — sinta-se livre para usar como referência ou adaptar para sua própria jornada de estudos.
