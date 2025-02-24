document.addEventListener('DOMContentLoaded', function() {
    const cadastrarBtn = document.getElementById('cadastrar-btn');
    const consultarBtn = document.getElementById('consultar-btn');
    const graficosBtn = document.getElementById('graficos-btn');
    
    const sections = {
        cadastro: document.getElementById('cadastro-form'),
        consulta: document.getElementById('consulta-section'),
        graficos: document.getElementById('graficos-section')
    };

    function showSection(sectionId) {
        Object.values(sections).forEach(section => section.style.display = 'none');
        sections[sectionId].style.display = 'block';
    }

    cadastrarBtn.addEventListener('click', () => showSection('cadastro'));
    consultarBtn.addEventListener('click', () => showSection('consulta'));
    graficosBtn.addEventListener('click', () => showSection('graficos'));

    // Formulário de cadastro
    document.getElementById('fraud-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        try {
            const response = await fetch('/api/fraudes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                alert('Cadastro realizado com sucesso!');
                e.target.reset();
            }
        } catch (error) {
            alert('Erro ao cadastrar: ' + error);
        }
    });
});
