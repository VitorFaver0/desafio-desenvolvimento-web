$(document).ready(function() {
    const MAX_FILE_SIZE_MB = 1; // Define o tamanho máximo do arquivo em Megabytes
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024; // Converte para Bytes

    // --- LÓGICA DA PÁGINA INDEX (MODAL E FORMULÁRIO) ---

    const modal = $('#registerModal');
    const openModalBtn = $('#openModalBtn');
    const closeModalBtn = $('.close-btn');

    // Abrir o modal
    openModalBtn.on('click', function() {
        modal.show();
    });

    // Fechar o modal
    closeModalBtn.on('click', function() {
        modal.hide();
    });

    $(window).on('click', function(event) {
        if ($(event.target).is(modal)) {
            modal.hide();
        }
    });

    // --- NOVO TRECHO: VALIDAÇÃO IMEDIATA AO SELECIONAR A IMAGEM ---
    $('#animalPhoto').on('change', function() {
        const file = this.files[0];
        if (file && file.size > MAX_FILE_SIZE_BYTES) {
            // Avisa o usuário que o arquivo é muito grande
            alert(`A imagem selecionada é muito grande! Por favor, escolha um arquivo menor que ${MAX_FILE_SIZE_MB}MB.`);
            // Limpa o campo de seleção de arquivo
            $(this).val('');
        }
    });

    // Lidar com o envio do formulário
    $('#animalForm').on('submit', function(event) {
        event.preventDefault();

        const animalPhotoInput = $('#animalPhoto')[0];
        const animalLocation = $('#animalLocation').val();
        const animalDescription = $('#animalDescription').val();
        const contactInfo = $('#contactInfo').val();

        // --- VALIDAÇÃO ADICIONADA AQUI (GARANTIA EXTRA) ---
        if (animalPhotoInput.files && animalPhotoInput.files[0]) {
            const file = animalPhotoInput.files[0];

            if (file.size > MAX_FILE_SIZE_BYTES) {
                alert(`O arquivo de imagem é muito grande. O limite é de ${MAX_FILE_SIZE_MB}MB.`);
                return; // Impede o envio do formulário
            }
            // --- FIM DA VALIDAÇÃO ---

            const reader = new FileReader();

            reader.onload = function(e) {
                const photoBase64 = e.target.result;

                const newAnimal = {
                    id: Date.now(),
                    photo: photoBase64,
                    location: animalLocation,
                    description: animalDescription,
                    contact: contactInfo
                };

                saveAnimal(newAnimal);

                $('#animalForm')[0].reset();
                modal.hide();
                alert('Animal cadastrado com sucesso!');
            };

            reader.readAsDataURL(file);
        } else {
            // Caso o campo da foto seja obrigatório e esteja vazio
            alert('Por favor, adicione uma foto do animal.');
        }
    });

    function saveAnimal(animal) {
        let animals = JSON.parse(localStorage.getItem('registeredAnimals')) || [];
        animals.push(animal);
        localStorage.setItem('registeredAnimals', JSON.stringify(animals));
    }


    // --- LÓGICA DA PÁGINA FIND (LISTAGEM) ---

    if (window.location.pathname.endsWith('find.html')) {
        loadAnimals();
    }

    function loadAnimals() {
        const animalListContainer = $('#animalList');
        const animals = JSON.parse(localStorage.getItem('registeredAnimals')) || [];

        if (animals.length === 0) {
            animalListContainer.html('<p>Nenhum animal cadastrado ainda. Seja o primeiro!</p>');
            return;
        }

        animalListContainer.empty();

        animals.forEach(animal => {
            const animalCard = `
                <div class="animal-card">
                    <img src="${animal.photo}" alt="Foto de animal encontrado">
                    <h3>Visto em: ${animal.location}</h3>
                    <p><strong>Descrição:</strong> ${animal.description}</p>
                    ${animal.contact ? `<p><strong>Contato:</strong> ${animal.contact}</p>` : ''}
                </div>
            `;
            animalListContainer.append(animalCard);
        });
    }

});