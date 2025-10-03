(() => {
  'use strict';

  const $ = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

  const tentativasMax = 6;
  let palavraSecreta = "";
  let dicaAtual = "";
  let categoriaAtual = "aleatorio";
  let letrasAdivinhadas = new Set();
  let erros = 0;

  // BANCO DE PALAVRAS / DICAS (ampliado)
  const palavras = {
    frontend: [
      ["HTML", "Estrutura do conteúdo de páginas web."],
      ["CSS", "Estiliza e posiciona elementos na página."],
      ["JAVASCRIPT", "Linguagem para interatividade no navegador."],
      ["REACT", "Biblioteca para construir interfaces."],
      ["ACESSIBILIDADE", "Práticas para tornar a web inclusiva."],
      ["RESPONSIVIDADE", "Layout que se adapta a diferentes telas."],
      ["SEMANTICA", "Uso correto de tags e significado do conteúdo."],
      ["COMPONENTE", "Parte reutilizável da interface."],
      ["ESTADO", "Dados que mudam o que é renderizado."],
      ["PROPRIEDADES", "Dados passados para componentes."],
      ["BUNDLE", "Pacote otimizado de arquivos para o navegador."],
      ["MINIFICACAO", "Remoção de espaços/comentários para reduzir tamanho."],
      ["OTIMIZACAO", "Melhorias de desempenho (lazy load, cache, etc.)."],
      ["ARIALABEL", "Atributo de acessibilidade para rótulos."],
      ["MEDIAQUERY", "Regra CSS condicional por tamanho de tela."],
      ["GRID", "Sistema bidimensional para layout."],
      ["FLEXBOX", "Sistema unidimensional para layout."],
      ["SERVICEWORKER", "Base para PWA e cache offline."]
    ],
    backend: [
      ["NODE", "Ambiente de execução do JavaScript no servidor."],
      ["EXPRESS", "Framework minimalista para rotas e APIs."],
      ["APIREST", "Padrão para comunicação entre cliente e servidor."],
      ["POSTGRESQL", "Banco de dados relacional robusto e open-source."],
      ["MONGODB", "Banco de dados NoSQL orientado a documentos."],
      ["AUTENTICACAO", "Processo de verificar a identidade do usuário."],
      ["JWT", "Token compacto para autenticação e autorização."],
      ["MIDDLEWARE", "Função que intercepta requisições/respostas."],
      ["ROTAS", "Caminhos de URL que direcionam para handlers."],
      ["CONTROLADOR", "Camada que lida com lógica de requisição/resposta."],
      ["ORM", "Mapeia objetos para tabelas do banco."],
      ["MIGRACAO", "Script para alterar a estrutura do banco."],
      ["SEMENTE", "Popular o banco com dados iniciais (seed)."],
      ["CACHE", "Armazenamento temporário para acelerar respostas."],
      ["WEBSOCKET", "Comunicação bidirecional em tempo real."],
      ["RATELIMIT", "Limitar número de requisições por período."],
      ["BALANCEADOR", "Distribui carga entre múltiplos servidores."],
      ["ESCALABILIDADE", "Capacidade de crescer mantendo desempenho."]
    ],
    seguranca: [
      ["CONFIDENCIALIDADE", "Evitar acesso não autorizado às informações."],
      ["INTEGRIDADE", "Garantir que os dados não sejam alterados indevidamente."],
      ["DISPONIBILIDADE", "As informações precisam estar acessíveis quando necessário."],
      ["SENHAFORTE", "Combina letras, números e símbolos."],
      ["CRIPTOGRAFIA", "Torna dados ilegíveis para terceiros."],
      ["FIREWALL", "Barreira que filtra tráfego de rede."],
      ["PHISHING", "Golpe que tenta enganar para roubar dados."],
      ["MFA", "Autenticação por múltiplos fatores."],
      ["HASH", "Resumo irreversível para verificar integridade."],
      ["SQLINJECTION", "Ataque que manipula consultas ao banco."],
      ["XSS", "Inserção de scripts maliciosos em páginas."],
      ["CSRF", "Ataque que força ações usando sessão do usuário."],
      ["BACKUP", "Cópia de segurança para recuperação de dados."],
      ["ENDPOINTSEGURO", "Rotas com autenticação e autorização corretas."],
      ["POLITICASENHA", "Regras para criação e expiração de senhas."],
      ["VPN", "Túnel seguro entre redes."],
      ["ISO27001", "Padrão de gestão de segurança da informação."],
      ["AUDITORIA", "Registro e análise de eventos de segurança."]
    ]
  };

  // DECKS ALEATÓRIOS POR CATEGORIA (sem repetição até esgotar)
  const decks = {};
  function buildDeck(cat){
    const arr = palavras[cat];
    const idx = [...arr.keys()];
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    decks[cat] = idx;
  }
  function nextFromDeck(cat){
    if (!decks[cat] || decks[cat].length === 0) buildDeck(cat);
    const i = decks[cat].shift();
    return palavras[cat][i];
  }

  const alfabeto = "ABCDEFGHIJKLMNOPQRSTUVWXYZÇ".split("");

  const el = {
    tentativas: $("#tentativas"),
    catSel: $("#categoria"),
    catAtual: $("#catAtual"),
    dica: $("#dica"),
    dicaBox: $("#dicaBox"),
    palavra: $("#palavra"),
    teclado: $("#teclado"),
    msg: $("#mensagem"),
    novoJogo: $("#novoJogo"),
    revelar: $("#revelar"),
    reiniciar: $("#reiniciar"),
    tema: $("#modoTema"),
    svg: $(".forca svg"),
    character: $(".forca svg .character"),
    gifOverlay: $("#gifOverlay")
  };

  function escolherPalavra(cat) {
    const categorias = Object.keys(palavras);
    let c = cat;
    if (cat === "aleatorio") {
      c = categorias[Math.floor(Math.random() * categorias.length)];
    }
    categoriaAtual = c;
    const [pal, dica] = nextFromDeck(c);
    palavraSecreta = pal.toUpperCase();
    dicaAtual = dica;
  }

  function renderForca() {
    // Remove e recoloca classes show-n no SVG para revelar partes
    for (let i=1;i<=tentativasMax;i++){ el.svg.classList.remove(`show-${i}`); }
    for (let i=1;i<=erros;i++){ el.svg.classList.add(`show-${i}`); }
  }

  function renderStatus() {
    el.tentativas.textContent = String(tentativasMax - erros);
    const nomes = {frontend: "Front-end", backend: "Back-end", seguranca: "Segurança"};
    el.catAtual.textContent = categoriaAtual === "aleatorio" ? "Aleatório" : (nomes[categoriaAtual] || categoriaAtual);
    el.dica.textContent = dicaAtual || "—";
    el.dicaBox.title = dicaAtual ? `Dica: ${dicaAtual}` : "";
  }

  function renderPalavra() {
    el.palavra.innerHTML = "";
    const frag = document.createDocumentFragment();
    for (const ch of palavraSecreta) {
      const span = document.createElement("span");
      span.style.minWidth = "1ch";
      if (ch === " " || ch === "-") {
        span.textContent = ch;
      } else if (letrasAdivinhadas.has(ch)) {
        span.textContent = ch;
      } else {
        span.textContent = "_";
      }
      frag.appendChild(span);
    }
    el.palavra.appendChild(frag);
  }

  function criarTeclado() {
    el.teclado.innerHTML = "";
    const frag = document.createDocumentFragment();
    for (const letra of alfabeto) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = letra;
      btn.setAttribute("aria-label", `Letra ${letra}`);
      btn.addEventListener("click", () => tentativa(letra));
      frag.appendChild(btn);
    }
    el.teclado.appendChild(frag);
  }

  function atualizarTeclas() {
    const erradas = getLetrasErradas();
    $$(".teclado button").forEach(btn => {
      const l = btn.textContent;
      btn.disabled = letrasAdivinhadas.has(l) || erradas.has(l) || estadoFinal();
      btn.classList.toggle("acertou", letrasAdivinhadas.has(l));
      btn.classList.toggle("errou", erradas.has(l));
    });
  }

  function getLetrasErradas() {
    const set = new Set();
    const tentadas = new Set([...letrasAdivinhadas, ...historicoErros]);
    for (const l of tentadas) if (!palavraSecreta.includes(l)) set.add(l);
    return set;
  }

  let historicoErros = new Set();

  function tentativa(letra) {
    if (estadoFinal()) return;
    letra = letra.toUpperCase();

    if (palavraSecreta.includes(letra)) {
      letrasAdivinhadas.add(letra);
      el.msg.textContent = "Boa!";
      el.msg.className = "mensagem ok";
      if (el.character){ el.character.classList.add('dance'); setTimeout(()=>el.character.classList.remove('dance'), 1000); }
    } else {
      if (!historicoErros.has(letra)) {
        historicoErros.add(letra);
        erros++;
      }
      el.msg.textContent = "Letra não existe.";
      el.msg.className = "mensagem bad";
    }
    renderPalavra();
    atualizarTeclas();
    renderForca();
    renderStatus();
    verificarFim();
  }

  function verificarFim() {
    if (erros >= tentativasMax) {
      el.msg.textContent = `Você perdeu! A palavra era: ${palavraSecreta}`;
      // Limpa figura imediatamente e mostra GIF de derrota
      if (el.svg) el.svg.classList.add('hide-figure');
      showGif('lose');
      bloquearTeclado(true);
      // Após 5s, troca para GIF de choro
      setTimeout(() => {
        if (el.gifOverlay){
          el.gifOverlay.innerHTML = '<img src="assets/img/crying.gif" alt="Chorando" />';
          el.gifOverlay.classList.add('show');
        }
      }, 5000);
    } else if (palavraCompleta()) {
      el.msg.textContent = "Parabéns! Você ganhou!";
      showGif('win');
      bloquearTeclado(true);
    }
  }

  function palavraCompleta() {
    for (const ch of palavraSecreta) {
      if (ch !== " " && ch !== "-" && !letrasAdivinhadas.has(ch)) return false;
    }
    return true;
  }

  function bloquearTeclado(flag) {
    $$(".teclado button").forEach(b => b.disabled = flag || b.disabled);
  }

  function estadoFinal() {
    return erros >= tentativasMax || palavraCompleta();
  }

  function revelarLetra() {
    if (estadoFinal()) return;
    const restantes = new Set();
    for (const ch of palavraSecreta) {
      if (ch !== " " && ch !== "-" && !letrasAdivinhadas.has(ch)) restantes.add(ch);
    }
    if (restantes.size === 0) return;
    const arr = Array.from(restantes);
    const letra = arr[Math.floor(Math.random() * arr.length)];
    letrasAdivinhadas.add(letra);
    el.msg.textContent = `Dica: revelamos a letra "${letra}"`;
    el.msg.className = "mensagem ok";
    renderPalavra();
    atualizarTeclas();
    renderStatus();
    verificarFim();
  }

  function novoJogo() {
    // Limpa overlays/figura
    if (el.svg) el.svg.classList.remove('hide-figure');
    if (el.gifOverlay){ el.gifOverlay.classList.remove('show'); el.gifOverlay.innerHTML=''; }

    erros = 0;
    letrasAdivinhadas.clear();
    historicoErros.clear();

    escolherPalavra(el.catSel.value);
    renderStatus();
    renderPalavra();
    criarTeclado();
    atualizarTeclas();
    renderForca();
    el.msg.textContent = "Novo jogo iniciado. Boa sorte!";
    el.msg.className = "mensagem";
  }

  // Tema claro/escuro persistente
  function carregarTema() {
    const tema = localStorage.getItem("forca_tema") || "dark";
    if (tema === "light") document.body.classList.add("light");
    el.tema.textContent = document.body.classList.contains("light") ? "🌞" : "🌙";
  }
  function alternarTema() {
    document.body.classList.toggle("light");
    localStorage.setItem("forca_tema", document.body.classList.contains("light") ? "light" : "dark");
    el.tema.textContent = document.body.classList.contains("light") ? "🌞" : "🌙";
  }

  function showGif(type) {
    const imgSrc = type === 'win' ? 'assets/img/win.gif' : 'assets/img/lose.gif';
    if (el.gifOverlay){
      el.gifOverlay.innerHTML = '<img src="'+imgSrc+'" alt="'+(type==='win'?'Vitória':'Derrota')+'" />';
      el.gifOverlay.classList.add('show');
      setTimeout(() => { 
        // No loss we keep overlay for 5s more (crying), so only auto-hide on win
        if (type === 'win'){ el.gifOverlay.classList.remove('show'); el.gifOverlay.innerHTML=''; }
      }, 3000);
    }
  }

  // Eventos
  el.novoJogo.addEventListener("click", novoJogo);
  el.revelar.addEventListener("click", revelarLetra);
  el.reiniciar.addEventListener("click", novoJogo);
  el.catSel.addEventListener("change", () => novoJogo());
  el.tema.addEventListener("click", alternarTema);

  // Teclado físico
  window.addEventListener("keydown", (e) => {
    const k = e.key.toUpperCase();
    if (/^[A-ZÇ]$/.test(k)) tentativa(k);
    if (k === "ENTER") novoJogo();
  });

  // Inicialização
  carregarTema();
  criarTeclado();
  // Prepara decks por categoria
  Object.keys(palavras).forEach(c => buildDeck(c));
  novoJogo();
})();


// === Tela cheia (não interfere no jogo) ===
(() => {
  const btnFull = document.getElementById('btnFullscreen');
  if (!btnFull) return; // se o botão não estiver no HTML, não faz nada

  btnFull.addEventListener('click', () => {
    const root = document.documentElement;
    if (!document.fullscreenElement) {
      root.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  });
})();
