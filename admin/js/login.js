  // Função para realizar o logout (limpar o token do sessionStorage e localStorage)
  function logout() {
      sessionStorage.removeItem("token");
      localStorage.removeItem("token");
      console.log("Usuário deslogado.");
      location.href = '/'
  }

  // Função para verificar a expiração do token e realizar o logout quando expirar
  function checkTokenExpiration() {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      if (!token) {
          console.log("Usuário não está logado.");
          return;
      }

      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const expirationTime = decodedToken.exp * 1000; // Expiração em milissegundos
      const currentTime = Date.now();

      if (currentTime > expirationTime) {
          logout();
      } else {
          console.log("Token válido. O usuário está logado.");
          // Verificar novamente a expiração após um intervalo de tempo (por exemplo, 1 minuto)
          setTimeout(checkTokenExpiration, 60000);
      }
  }

  document.getElementById("form-login").addEventListener("submit", function(event) {
      event.preventDefault();

      const data = {
          username: document.querySelector("#username").value,
          password: document.querySelector("#password").value,
      };
      sendData(data);
  });

  
async function sendData(data) {
    try {
        const response = await fetch("/api/loginadmin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.status === 200) {
            const result = await response.json();
            // Salvar o token no sessionStorage ou localStorage
            sessionStorage.setItem("token", result.token);
            sessionStorage.setItem("username", data.username)
            sessionStorage.setItem("loja", result.loja)
            sessionStorage.setItem("nome", result.nome)
            let timerInterval
            Swal.fire({
                title: 'Seja Bem-Vindo ao GerenciaGL',
                html: '',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
                willClose: () => {
                    clearInterval(timerInterval)
                }
            }).then((result) => {
                if (result.dismiss === Swal.DismissReason.timer && sessionStorage.getItem("loja") != undefined) {
                    location.href = '/home-' + sessionStorage.getItem("loja")
                }
            });

            checkTokenExpiration();
            console.log(result);
        } else if (response.status === 401) {
            // Erro de autenticação (senha incorreta)
            Swal.fire({
                icon: 'error',
                title: 'Senha incorreta',
                text: 'A senha fornecida está incorreta. Tente novamente.',
            });
        } else {
            console.error("Erro de autenticação:", response);
        }
    } catch (error) {
        console.error("Erro ao enviar dados para o servidor", error);
    }
}