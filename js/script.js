$(document).ready(function () {

    // Exibir/ocultar menu de navegação ao clicar no ícone de hambúrguer
    $('.hamburger-menu').on('click', function() {
        // Alterna a classe 'active' no próprio hambúrguer (para estilizar o X)
        $(this).toggleClass('active'); 
        // Alterna a classe 'active' na lista do menu (para exibir/ocultar)
        $('header nav ul').toggleClass('active'); 
    });

    // Abrir modal
    $('#openModalBtn').on('click', function () {
        $('#registerModal').show();
    });

    // Fechar modal ao clicar no X
    $('.close-btn').on('click', function () {
        $('#registerModal').hide();
    });

    // Fechar modal ao clicar fora do conteúdo
    $(window).on('click', function (e) {
        if ($(e.target).is('#registerModal')) {
            $('#registerModal').hide();
        }
    });

    // Pegar localização atual no formulário
    $('#pegarLocalizacaoBtn').on('click', function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                $('#latitude').val(position.coords.latitude);
                $('#longitude').val(position.coords.longitude);
            }, function () {
                alert('Não foi possível obter sua localização.');
            });
        } else {
            alert('Geolocalização não suportada pelo seu navegador.');
        }
    });

    $('#contactInfo').on('input', function () {
        let valor = $(this).val().replace(/\D/g, ''); // Remove tudo que não for número

        if (valor.length > 11) {
            valor = valor.slice(0, 11); // Limita a 11 dígitos
        }

        if (valor.length >= 2) {
            valor = '(' + valor.slice(0, 2) + ') ' + valor.slice(2);
        }
        if (valor.length >= 10) {
            valor = valor.slice(0, 10) + '-' + valor.slice(10);
        }

        $(this).val(valor);
    });

    // Controle do envio do formulário
    $('#animalForm').on('submit', function (e) {
        e.preventDefault();

        const tipo = $('#animalType').val().trim();
        const local = $('#animalLocation').val().trim();
        const referencia = $('#referenceLocation').val().trim();
        const descricao = $('#animalDescription').val().trim();
        const nome_pessoa = $('#nameInfo').val().trim();
        const telefone = $('#contactInfo').val().trim();
        const latitude = $('#latitude').val().trim();
        const longitude = $('#longitude').val().trim();
        const data = new Date().toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });


        // Validação básica dos campos obrigatórios
        if (!tipo || !local || !descricao) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        // Seleciona foto padrão conforme o tipo
        let foto = '';
        if (tipo === 'Cachorro') {
            foto = 'https://www.patasdacasa.com.br/sites/default/files/noticias/2021/09/cachorro-de-rua-o-que-fazer-ao-resgatar-um-animal-abandonado.jpg';
        } else if (tipo === 'Gato') {
            foto = 'https://blog-static.petlove.com.br/wp-content/uploads/2022/08/gato-abandonado-petlove.jpg';
        } else {
            foto = 'https://projetoanjinhosdarua.com.br/wp-content/uploads/2019/04/anjinhos-da-rua-coelhos-0410-1024x683.jpg';
        }

        const animal = {
            tipo,
            localizacao: {
                local,
                referencia,
                latitude,
                longitude
            },
            descricao,
            nome_pessoa,
            telefone,
            foto,
            data,
            resgatado: false
        };

        function mostrarMensagemSucesso() {
            $.toast({
                text: "Dados salvos com sucesso!",
                position: "down-right",
                showHideTransition: "slide",
                loaderBg: "#4CAF50",
                bgColor: "#4CAF50",
                textColor: "white",
                hideAfter: 3000,
                icon: "success"
            });
        }

        let animais = JSON.parse(localStorage.getItem('animais')) || [];
        animais.push(animal);

        try {
            localStorage.setItem('animais', JSON.stringify(animais));
            mostrarMensagemSucesso();
            $('#animalForm')[0].reset();
            $('#registerModal').hide();
        } catch (error) {
            alert('Erro ao salvar os dados: ' + error.message);
        }
    });

    // Exibir lista de animais cadastrados
    if ($('#animalList').length) {
        const animais = JSON.parse(localStorage.getItem('animais')) || [];
        const container = $('#animalList');
        container.empty();

        if (animais.length === 0) {
            container.append('<p>Nenhum animal encontrado.</p>');
            return;
        }

        animais.forEach((animal, index) => {
            const card = $(`
        <div class="animal-card" data-id="${index}">
            <img src="${animal.foto}" alt="Foto do animal" />
            <h2>${animal.tipo}</h2>
            <p><strong>Local:</strong> ${animal.localizacao.local}</p>
            <p><strong>Referência:</strong> ${animal.localizacao.referencia || '-'}</p>
            <p><strong>Descrição:</strong> ${animal.descricao}</p>
            <p><strong>Contato:</strong> ${animal.nome_pessoa || '-'} - ${animal.telefone || '-'}</p>
            <p><strong>Data de cadastro:</strong> ${animal.data}</p>
            <p><strong>Localização:</strong> <a href="https://www.google.com/maps?q=${animal.localizacao.latitude},${animal.localizacao.longitude}" target="_blank">Ver no mapa</a></p>
            <p><strong>Status:</strong> <span class="status-text">${animal.resgatado ? '✅ Resgatado' : '❌ Não resgatado'}</span></p>
            <button class="btn-resgatar" ${animal.resgatado ? 'disabled' : ''}>
                ${animal.resgatado ? 'Já resgatado' : 'Marcar como resgatado'}
            </button>
        </div>
    `);

            container.append(card);
        });

        // Adicione este evento depois do forEach
        $(document).on('click', '.btn-resgatar', function () {
            const card = $(this).closest('.animal-card');
            const id = card.data('id');
            const animais = JSON.parse(localStorage.getItem('animais')) || [];

            // Atualiza o status no LocalStorage
            animais[id].resgatado = true;
            localStorage.setItem('animais', JSON.stringify(animais));

            // Atualiza a UI
            card.find('.status-text').text('✅ Resgatado');
            $(this).text('Já resgatado').prop('disabled', true);

            // Mostra mensagem de confirmação (opcional)
            $.toast({
                text: "Animal marcado como resgatado!",
                position: "top-right",
                bgColor: "#4CAF50",
                textColor: "white",
                hideAfter: 2000
            });
        });
    }
});