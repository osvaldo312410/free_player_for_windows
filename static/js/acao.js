let categoriaSelecionada = null;

// Função para carregar os canais com base na categoria selecionada
function carregarCanais(categoria) {
    // Exibe o spinner
    document.getElementById('spinner').style.display = 'block';  // Mostra o spinner

    fetch(`/obter_canais?categoria=${categoria}`)
        .then(response => response.json())
        .then(canais => {
            const lista = document.getElementById('canais-lista');
            lista.innerHTML = '';  // Limpa a lista antes de adicionar novos canais

            // Verifique se há canais retornados
            if (canais.length > 0) {
                // Cria um contêiner flex para as cartas
                let rowDiv = document.createElement('div');
                rowDiv.classList.add('div-lista');  // Flexível e com quebra de linha

                canais.forEach((canal, index) => {
                    // Criação de uma div para cada canal com a classe canal-item
                    const divCanalItem = document.createElement('div');
                    divCanalItem.classList.add('p-2');  // Adiciona espaçamento entre as cartas

                    // Adiciona o conteúdo da carta de canal dentro da div canal-item
                    divCanalItem.innerHTML = `
                        <div class="card" style="
                            background-color: white;
                            padding: 8px;
                            border-radius: 8px;
                            width: 167px;
                            height: 150px;
                            margin-bottom: 20px;
                            margin-right: 10px
                        ">
                            <img src="${canal.logo}" class="card-img-top" alt="${canal.nome}">
                            <div class="card-body d-flex justify-content-between align-items-center" style="width: 100%">
                                <span class="card-title" onclick="openPlayer('${canal.url}')">${canal.nome}</span>
                            </div>
                        </div>
                    `;

                    // Adiciona a div canal-item ao contêiner
                    rowDiv.appendChild(divCanalItem);
                });

                // Adiciona o contêiner de canais à lista
                lista.appendChild(rowDiv);
            } else {
                lista.innerHTML = '<p>Nenhum canal encontrado.</p>';
            }
        })
        .catch(error => {
            console.error('Erro ao carregar canais:', error);
        })
        .finally(() => {
            // Esconde o spinner após o carregamento do conteúdo
            document.getElementById('spinner').style.display = 'none';
        });
}


// Função chamada ao clicar em uma categoria
function filtrarCanais(categoria) {
    categoriaSelecionada = categoria;  // Atualiza a categoria selecionada
    
    // Exibe o spinner antes de carregar os canais
    document.getElementById('spinner').style.display = 'block';
    
    // Carrega os canais dessa categoria
    carregarCanais(categoria);
}

// Se você quiser carregar os canais com a categoria selecionada ao recarregar a página
document.addEventListener('DOMContentLoaded', function() {
    if (categoriaSelecionada) {
        carregarCanais(categoriaSelecionada);  // Carrega canais da categoria selecionada
    }
});

// Função para abrir o player de vídeo
// Função para abrir o VLC com o URL do canal
function openPlayer(url) {
    fetch('/abrir_vlc', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ url: url })
    })
    .then(response => response.json())
    .then(data => {
        // Exibe a mensagem de sucesso ou erro retornada pelo Flask
        alert(data.message);
    })
    .catch(error => {
        console.error("Erro ao tentar abrir o VLC:", error);
        alert("Erro ao tentar abrir o VLC.");
    });
}


// Função para esconder o player de vídeo
function closePlayer() {
    const playerContainer = document.getElementById('player-container');
    const videoPlayer = document.getElementById('video-player');
    
    playerContainer.style.display = 'none';
    videoPlayer.pause();
    videoPlayer.src = '';  // Limpa o source do vídeo
}


// Espera 2 segundos e remove as mensagens flash
setTimeout(function() {
    let flashMessages = document.querySelectorAll('.flash-message');
    flashMessages.forEach(function(message) {
        message.style.transition = "opacity 0.5s ease"; // Suaviza o desaparecimento
        message.style.opacity = "0"; // Deixa invisível
        setTimeout(() => message.remove(), 500); // Remove completamente após a transição
    });
}, 2000); // 2 segundos


function salvarUrl() {
    const url = document.getElementById("urlInput").value;
    if (url) {
        alert("URL salva: " + url);
    } else {
        alert("Por favor, insira uma URL.");
    }
}

function abrirVlc(url) {
    fetch('/abrir_vlc', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ url: url })
    })
    .then(response => response.json())
    .then(data => alert(data.message))
    .catch(error => alert("Erro ao tentar abrir o VLC."));
}



