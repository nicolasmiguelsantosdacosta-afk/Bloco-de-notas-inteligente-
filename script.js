
const campoPesquisa = document.getElementById("campoPesquisa");
const botaoNovaNota = document.getElementById("botaoNovaNota");
const listaNotas = document.getElementById("listaNotas");
const contadorNotas = document.getElementById("contadorNotas");

const modal = document.getElementById("modalNota");
const tituloModal = document.getElementById("tituloModal");
const tituloNota = document.getElementById("tituloNota");
const conteudoNota = document.getElementById("conteudoNota");
const categoriaNota = document.getElementById("categoriaNota");

const salvarBotao = document.getElementById("salvarNota");
const fecharBotao = document.getElementById("fecharModal");
const cancelarBotao = document.getElementById("cancelarNota");

let notas = JSON.parse(localStorage.getItem("minhasNotas")) || [];
let categoriaAtual = "Todas";
let notaEditando = null;

function salvarNotas() {
    localStorage.setItem("minhasNotas", JSON.stringify(notas));
}

function abrirModal(id = null) {
    notaEditando = id;

    if (id !== null) {
        const nota = notas.find(n => n.id === id);

        if (!nota) return;

        tituloModal.textContent = "Editar anotação";
        tituloNota.value = nota.titulo;
        conteudoNota.value = nota.conteudo;
        categoriaNota.value = nota.categoria;
    } else {
        tituloModal.textContent = "Nova anotação";
        tituloNota.value = "";
        conteudoNota.value = "";
        categoriaNota.value = "Pessoal";
    }

    modal.classList.add("aberto");
    tituloNota.focus();
}

function fecharModal() {
    modal.classList.remove("aberto");
    notaEditando = null;
}

function salvarNota() {
    const titulo = tituloNota.value.trim();
    const conteudo = conteudoNota.value.trim();

    if (!titulo || !conteudo) {
        alert("Preencha o título e o conteúdo da anotação.");
        return;
    }

    if (notaEditando !== null) {
        const nota = notas.find(n => n.id === notaEditando);

        if (!nota) return;

        nota.titulo = titulo;
        nota.conteudo = conteudo;
        nota.categoria = categoriaNota.value;
    } else {
        notas.unshift({
            id: Date.now(),
            titulo: titulo,
            conteudo: conteudo,
            categoria: categoriaNota.value,
            favorita: false,
            data: new Date().toLocaleDateString("pt-BR")
        });
    }

    salvarNotas();
    mostrarNotas();
    fecharModal();
}

function excluirNota(id) {
    if (!confirm("Deseja excluir esta anotação?")) return;

    notas = notas.filter(n => n.id !== id);

    salvarNotas();
    mostrarNotas();
}

function alternarFavorito(id) {
    const nota = notas.find(n => n.id === id);

    if (!nota) return;

    nota.favorita = !nota.favorita;

    salvarNotas();
    mostrarNotas();
}

function mostrarNotas() {
    listaNotas.innerHTML = "";

    const pesquisa = campoPesquisa.value.toLowerCase();

    const filtradas = notas.filter(nota => {
        const combinaCategoria =
            categoriaAtual === "Todas" ||
            nota.categoria === categoriaAtual;

        const combinaPesquisa =
            nota.titulo.toLowerCase().includes(pesquisa) ||
            nota.conteudo.toLowerCase().includes(pesquisa);

        return combinaCategoria && combinaPesquisa;
    });

    contadorNotas.textContent =
        notas.length + (notas.length === 1 ? " nota" : " notas");

    if (filtradas.length === 0) {
        listaNotas.innerHTML = `
            <div class="estado-vazio">
                <span>📝</span>
                <h3>Nenhuma anotação encontrada</h3>
                <p>Crie uma nova anotação para começar!</p>
            </div>
        `;
        return;
    }

    filtradas.forEach(nota => {
        const cartao = document.createElement("article");

        cartao.style.background = "#1b1c2b";
        cartao.style.padding = "18px";
        cartao.style.borderRadius = "15px";
        cartao.style.border = "1px solid #292a3b";

        const titulo = document.createElement("h3");
        titulo.textContent = nota.titulo;
        titulo.style.marginBottom = "10px";

        const conteudo = document.createElement("p");
        conteudo.textContent = nota.conteudo;
        conteudo.style.color = "#a3a4b6";
        conteudo.style.whiteSpace = "pre-wrap";
        conteudo.style.marginBottom = "15px";

        const info = document.createElement("small");
        info.textContent = nota.categoria + " • " + nota.data;
        info.style.color = "#9b85ed";

        const acoes = document.createElement("div");
        acoes.style.display = "flex";
        acoes.style.flexWrap = "wrap";
        acoes.style.gap = "10px";
        acoes.style.marginTop = "15px";

        const favorito = document.createElement("button");
        favorito.textContent = nota.favorita ? "★ Favorito" : "☆ Favoritar";
        favorito.onclick = () => alternarFavorito(nota.id);

        const editar = document.createElement("button");
        editar.textContent = "✏️ Editar";
        editar.onclick = () => abrirModal(nota.id);

        const excluir = document.createElement("button");
        excluir.textContent = "🗑 Excluir";
        excluir.onclick = () => excluirNota(nota.id);

        [favorito, editar, excluir].forEach(botao => {
            botao.style.background = "#302456";
            botao.style.color = "white";
            botao.style.border = "none";
            botao.style.padding = "9px";
            botao.style.borderRadius = "8px";
        });

        acoes.append(favorito, editar, excluir);
        cartao.append(titulo, conteudo, info, acoes);

        listaNotas.appendChild(cartao);
    });
}

botaoNovaNota.addEventListener("click", () => abrirModal());

salvarBotao.addEventListener("click", salvarNota);
fecharBotao.addEventListener("click", fecharModal);
cancelarBotao.addEventListener("click", fecharModal);

modal.addEventListener("click", event => {
    if (event.target === modal) fecharModal();
});

campoPesquisa.addEventListener("input", mostrarNotas);

document.querySelectorAll(".categoria").forEach(botao => {
    botao.addEventListener("click", () => {
        categoriaAtual = botao.dataset.categoria;

        document.querySelectorAll(".categoria").forEach(item => {
            item.classList.remove("ativa");
        });

        botao.classList.add("ativa");

        mostrarNotas();
    });
});

salvarNotas();
mostrarNotas();
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js");
    });
}