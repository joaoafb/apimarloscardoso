document.querySelector("#quantity").addEventListener("input", function() {
    document.querySelector("#total").value = Number(document.querySelector("#price").value) * Number(document.querySelector("#quantity").value)
})

$(document).ready(function() {

    $(document).ready(function() {
        $.ajax({
            url: 'https://192.168.1.105/api/marloscardoso/listprodutos',
            dataType: 'json',
            success: function(data) {
                if (data && Array.isArray(data)) {
                    const titulos = data.map(item => item.titulo);

                    $("#title").autocomplete({
                        source: titulos,
                        minLength: 0 // Mostrar sugestões ao focar no campo
                    }).focus(function() {
                        $(this).autocomplete('search');
                    });

                    // Manipulação do valor do campo 'price' ao selecionar um título
                    $("#title").on("autocompleteselect", function(event, ui) {
                        const selectedTitle = ui.item.value;
                        const selectedProduct = data.find(item => item.titulo === selectedTitle);
                        if (selectedProduct) {
                            $("#price").val(selectedProduct.valor);
                        }
                    });
                } else {
                    console.log('Dados inválidos ou não no formato esperado.');
                }
            },
            error: function(xhr, status, error) {
                console.log('Erro na requisição:', error);
            }
        });
    });



    setInterval(() => {
        const productsString = localStorage.getItem('products');
        const productsArray = JSON.parse(productsString);

        let totalSum = 0;

        for (const product of productsArray) {
            if (product.pricetotal && product.quantity) {
                const total = parseFloat(product.pricetotal);

                totalSum += total;

            }
        }

        localStorage.setItem("pricetotal", totalSum);
        document.querySelector("#price-total").innerHTML = `Total: R$${localStorage.getItem("pricetotal")}`;

    }, 500);

    let productIndex = 1;

    // Carregar produtos do localStorage (se existirem)
    const savedProducts = JSON.parse(localStorage.getItem('products')) || [];
    savedProducts.forEach(product => {
        addProductToTable(product);
    });


    function updateTable() {
        $('#productTable tbody').empty();
        savedProducts.forEach(product => {
            addProductToTable(product);
        });

    }



    $('#form').submit(function(event) {
        event.preventDefault();
        document.querySelector("#btnFinalizar").disabled = false

        const title = $('#title').val();
        const quantity = $('#quantity').val();
        const pricetotal = parseFloat($('#total').val());
        const price = parseFloat($('#price').val());
        const observation = $('#observation').val();

        const product = {
            id: productIndex,
            title: title,
            quantity,
            price,
            pricetotal,
            observation
        };

        savedProducts.push(product);
        saveProductsToLocalstorage(savedProducts);

        // Limpar campos após adicionar produto
        $('#title').val('');
        $('#quantity').val('');
        $('#total').val('');
        $('#observation').val('');

        productIndex++;

        updateTable();
    });

    // Remover linha da tabela ao clicar no botão "Apagar"
    $(document).on('click', '.apagar', function() {
        const productId = $(this).closest('tr').data('product-id');
        const updatedProducts = savedProducts.filter(product => product.id !== productId);
        saveProductsToLocalstorage(updatedProducts);

        savedProducts.splice(productId - 1, 1); // Remove o produto do array
        updateTable();
    });

    // Função para adicionar produto à tabela
    function addProductToTable(product) {
        const tableRow = `
        <tr data-product-id="${product.id}">
          <td>${product.quantity}</td>
          <td>${product.title}</td>
          <td>R$${product.price}</td>
          <td>R$${(product.pricetotal)}</td>
          <td><button class="apagar">Apagar</button></td>
        </tr>
      `;

        $('#productTable tbody').append(tableRow);
    }

    // Função para salvar produtos no localStorage
    function saveProductsToLocalstorage(products) {
        localStorage.setItem('products', JSON.stringify(products));
    }
});




document.querySelector("#add-pedido").addEventListener("submit", function(event) {
    event.preventDefault()


    const firstNameInput = document.getElementById('firstName').value
    const emailInput = document.getElementById('email').value
    const phoneInput = document.getElementById('phone').value
    const cpf = document.getElementById('cpf').value
    const pedido = JSON.parse(localStorage.getItem('products')) || [];


    const dataHoraAtual = moment();
    const formatoDesejado = 'DD/MM/YYYY HH:mm';
    const dataHoraFormatada = dataHoraAtual.format(formatoDesejado);
    // Envia os dados para o servidor usando o fetch
    function generateToken() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const tokenLength = 10;
        let token = '';

        for (let i = 0; i < tokenLength; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            token += characters[randomIndex];
        }

        return token;
    }

    // Exemplo de uso:
    const tokenp = generateToken();


    const Pedido = {
        pedido,
        firstNameInput,

        emailInput,
        phoneInput,
        cpf,
        token: tokenp,
        pricetotal: document.querySelector("#pricetotal").value,
        status: 'Aguardando Pagamento',
        data: dataHoraFormatada
    }
    fetch("api/marloscardoso/addpedidos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(Pedido)
        })
        .then(response => response.json())
        .then(data => {

            if (data.message == 'Pedido Cadastrado') {
                Swal.fire({

                    icon: 'success',
                    title: 'Pedido Realizado',
                    showConfirmButton: false,
                    timer: 1500
                })
                localStorage.removeItem("products")

            }
            // Aqui você pode realizar alguma ação após o servidor processar os dados
        })
        .catch(error => {
            console.error("Erro ao enviar dados:", error);
        })

})



function pdf() {
    window.print();
}

document.querySelector("#enviar-whatsapp").addEventListener("submit", function() {
    whatsapp(document.querySelector("#phoneWhats").value)
})

function whatsapp(phone) {

    const savedProducts = JSON.parse(localStorage.getItem('products')) || [];

    let output = '\n';

    for (const product of savedProducts) {
        if (product.title && product.pricetotal) {
            output += `${product.title} | R$${parseFloat(product.pricetotal).toFixed(2)}\n`;
        }
    }

    const prod = {
        message: `
        Olá ,

        Segue abaixo o orçamento para os itens solicitados:
    
        ` + output +
            `
        
        Total: R$${localStorage.getItem("pricetotal")}
    
        Para mais detalhes ou para prosseguir com o pedido, entre em contato conosco.
    
        Atenciosamente,
        Marlos Cardoso
        www.marloscardoso.com
        @marloscard
        
        `,
        phone
    }
    fetch("api/marloscardoso/orcamento", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(prod)
        })
        .then(response => response.json())

    .catch(error => {
        console.error("Erro ao enviar dados:", error);
    })
}