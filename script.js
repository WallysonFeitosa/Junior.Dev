let cardContainer = document.querySelector(".card-container");
let campoBusca = document.querySelector("header input");
let radiosTipo = document.querySelectorAll('input[name="tipo"]');
let radiosNivel = document.querySelectorAll('input[name="nivel"]');
let dados = [];

// Função para formatar a data para o padrão brasileiro (dd/mm/yyyy)
function formatarData(data) {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
}

// Carrega e renderiza os dados iniciais assim que a página é carregada
document.addEventListener("DOMContentLoaded", async () => {
    try {
        let resposta = await fetch("data.json");
        dados = await resposta.json();
        
        // Ordena os dados pela data de postagem, do mais recente para o mais antigo
        dados.sort((a, b) => new Date(b.data_postagem) - new Date(a.data_postagem));
        
        renderizarCards(dados);
    } catch (error) {
        console.error("Falha ao buscar ou processar dados:", error);
        cardContainer.innerHTML = "<p>Não foi possível carregar as vagas. Tente novamente mais tarde.</p>";
    }
});

function removerAcentos(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function filtrarVagas() {
    const termoBusca = removerAcentos(campoBusca.value.toLowerCase().trim());

    const tipoSelecionadoValue = document.querySelector('input[name="tipo"]:checked')?.value;
    const tipoSelecionado = tipoSelecionadoValue ? removerAcentos(tipoSelecionadoValue) : null;
    
    const nivelSelecionadoValue = document.querySelector('input[name="nivel"]:checked')?.value;
    const nivelSelecionado = nivelSelecionadoValue ? removerAcentos(nivelSelecionadoValue) : null;

    let dadosFiltrados = dados;

    // Filtro por termo de busca
    if (termoBusca) {
        dadosFiltrados = dadosFiltrados.filter(dado => 
            removerAcentos(dado.titulo.toLowerCase()).includes(termoBusca) || 
            removerAcentos(dado.descricao.toLowerCase()).includes(termoBusca) ||
            removerAcentos(dado.cidade.toLowerCase()).includes(termoBusca) ||
            removerAcentos(dado.tipo_trabalho.toLowerCase()).includes(termoBusca)
        );
    }

    // Filtro por tipo de vaga
    if (tipoSelecionado) {
        dadosFiltrados = dadosFiltrados.filter(dado => 
            removerAcentos(dado.tipo_trabalho.toLowerCase()) === tipoSelecionado
        );
    }

    // Filtro por nível
    if (nivelSelecionado) {
        dadosFiltrados = dadosFiltrados.filter(dado => 
            removerAcentos(dado.nivel.toLowerCase()) === nivelSelecionado
        );
    }

    renderizarCards(dadosFiltrados);
}

function renderizarCards(dadosParaRenderizar) {
    cardContainer.innerHTML = ""; // Limpa os cards existentes

    if (dadosParaRenderizar.length === 0) {
        cardContainer.innerHTML = "<p>Nenhuma vaga encontrada para os critérios selecionados.</p>";
        return;
    }

    for (let dado of dadosParaRenderizar) {
        let article = document.createElement("article");
        article.classList.add("card");
        article.innerHTML = `
            <h2>${dado.titulo}</h2>
            <p><strong>Publicado em:</strong> ${formatarData(dado.data_postagem)}</p>
            <p>${dado.descricao}</p>
            <p><strong>Localização:</strong> ${dado.cidade} (${dado.tipo_trabalho})</p>
            <p><strong>Nível:</strong> ${dado.nivel}</p>
            <a href="${dado.link}" target="_blank">Ver vaga completa</a>
        `;
        cardContainer.appendChild(article);
    }
}

// Adiciona listeners para o campo de busca e radios
campoBusca.addEventListener("input", filtrarVagas);
radiosTipo.forEach(radio => radio.addEventListener('change', filtrarVagas));
radiosNivel.forEach(radio => radio.addEventListener('change', filtrarVagas));

document.getElementById('limpar-filtros').addEventListener('click', () => {
    // Desmarca todos os radios de tipo
    radiosTipo.forEach(radio => radio.checked = false);
    // Desmarca todos os radios de nível
    radiosNivel.forEach(radio => radio.checked = false);
    // Limpa o campo de busca
    campoBusca.value = '';
    // Renderiza todos os cards novamente
    renderizarCards(dados);
});