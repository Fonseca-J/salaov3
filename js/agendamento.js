// agendamento.js - Código completo para o sistema de agendamento

document.addEventListener('DOMContentLoaded', function() {
    // 1. ELEMENTOS DO FORMULÁRIO
    const dataInput = document.getElementById('data');
    const horaSelect = document.getElementById('hora');
    const form = document.getElementById('agendamentoForm');
    const hoje = new Date();

    // 2. CONFIGURAÇÃO INICIAL
    // ========================
    function configurarDataInicial() {
        // Formata data para YYYY-MM-DD (ignorando fuso horário)
        const offset = hoje.getTimezoneOffset();
        const dataLocal = new Date(hoje.getTime() - (offset * 60 * 1000));
        dataInput.min = dataLocal.toISOString().split('T')[0];
    }

    // 3. GERENCIAMENTO DE HORÁRIOS
    // ============================
    function gerarHorariosDisponiveis(dataSelecionada) {
        const agora = new Date();
        const isHoje = dataSelecionada.toDateString() === hoje.toDateString();
        
        // Limpa o select
        horaSelect.innerHTML = '<option value="" selected disabled>⏳ Escolha um horário</option>';
        
        // Horário de funcionamento: 9h às 19h
        const horaInicio = isHoje ? Math.max(9, agora.getHours() + 1) : 9;
        const horaFim = 19;
        let horariosGerados = 0;

        // Gera horários a cada 30 minutos
        for (let hora = horaInicio; hora < horaFim; hora++) {
            for (let minuto = 0; minuto < 60; minuto += 30) {
                // Pula horários passados se for hoje
                if (isHoje && hora === agora.getHours() && minuto <= agora.getMinutes()) {
                    continue;
                }
                
                const horaFormatada = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
                horaSelect.innerHTML += `<option value="${horaFormatada}">${horaFormatada}</option>`;
                horariosGerados++;
            }
        }

        // Feedback visual se não houver horários
        if (horariosGerados === 0) {
            horaSelect.innerHTML = '<option value="" selected disabled> 😢 Nenhum horário disponível</option>';
        }
    }

    // 4. VALIDAÇÃO DE DATA
    // ====================
    function validarDataSelecionada(data) {
        const diaSemana = data.getDay(); // 0=Domingo, 1=Segunda...
        
        // Bloqueia domingo (0) e segunda (1)
        if (diaSemana === 0 || diaSemana === 1) {
            dataInput.value = '';
            horaSelect.innerHTML = '<option value="" selected disabled>❌ Fechado às segundas e domingos</option>';
            alert('Atendemos apenas de terça a sábado!');
            return false;
        }
        return true;
    }

    // 5. ENVIO DO FORMULÁRIO
    // ======================
    function prepararDadosAgendamento() {
        const servicos = Array.from(document.querySelectorAll('input[name="servicos[]"]:checked'))
                          .map(servico => servico.value)
                          .join(', ');

        const [ano, mes, dia] = dataInput.value.split('-');
        const [hora, minuto] = horaSelect.value.split(':');
        
        return {
            nome: document.getElementById('nome').value,
            telefone: document.getElementById('telefone').value,
            servicos,
            data: `${dia}/${mes}/${ano}`,
            hora: horaSelect.value,
            dataISO: new Date(ano, mes - 1, dia, hora, minuto)
        };
    }

    function criarLinkGoogleCalendar(dados) {
        const dataInicio = dados.dataISO;
        const dataFim = new Date(dataInicio);
        
        // Define duração baseada no serviço (exemplo simplificado)
        if (dados.servicos.includes("Manicure") || dados.servicos.includes("Sobrancelhas")) {
            dataFim.setHours(dataFim.getHours(), dataFim.getMinutes() + 30);
        } else {
            dataFim.setHours(dataFim.getHours() + 1);
        }

        // Formata para o Google Calendar
        const formatarParaGoogle = (date) => {
            return date.toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
        };

        // E-mail do salão como convidado
    const emailSalon = 'dantasandrew05@gmail.com'; // Substitua pelo e-mail real
    

    return `https://www.google.com/calendar/render?action=TEMPLATE` +
    `&text=Agendamento+Shalon+Adonai+-+${encodeURIComponent(dados.nome.split(' ')[0])}` +
    `&dates=${formatarParaGoogle(dataInicio)}/${formatarParaGoogle(dataFim)}` +
    `&details=Cliente%3A+${encodeURIComponent(dados.nome)}%0ATelefone%3A+${encodeURIComponent(dados.telefone)}` +
    `%0AServiços%3A+${encodeURIComponent(dados.servicos)}%0A%0AEndereço%3A+R.+Nhatumani,+496` +
    `&location=Salão+Shalon+Adonai,+R.+Nhatumani,+496` +
    `&add=${encodeURIComponent(emailSalon)}` + // Adiciona o salão como convidado
    `&sf=true` + // Mostra o formulário de convite
    `&output=xml`; // Formato de saída
}

    // 6. EVENT LISTENERS
    // ==================
    dataInput.addEventListener('change', function() {
        const dataSelecionada = new Date(this.value + 'T12:00:00'); // Meio-dia evita bugs de fuso
        
        if (validarDataSelecionada(dataSelecionada)) {
            gerarHorariosDisponiveis(dataSelecionada);
        }
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validação básica
        if (!dataInput.value || !horaSelect.value) {
            alert('Selecione uma data e horário válidos!');
            return;
        }

        const servicosSelecionados = document.querySelectorAll('input[name="servicos[]"]:checked');
        if (servicosSelecionados.length === 0) {
            alert('Selecione pelo menos um serviço!');
            return;
        }

        // Prepara dados
        const dados = prepararDadosAgendamento();
        
        // Atualiza modal de confirmação
        document.getElementById('confirmacaoTexto').textContent = 
            `Olá ${dados.nome}, seu agendamento para ${dados.servicos} no dia ${dados.data} às ${dados.hora} foi confirmado!`;
        
        document.getElementById('googleCalendarLink').href = criarLinkGoogleCalendar(dados);
        
        // Mostra modal
        new bootstrap.Modal(document.getElementById('confirmacaoModal')).show();
    });

    // No evento submit, após preparar os dados:
const whatsappLink = `https://wa.me/5511967036990?text=${encodeURIComponent(
    `Olá Shalon Adonai! Confirme meu agendamento:\n\n` +
    `*Nome:* ${dados.nome}\n` +
    `*Telefone:* ${dados.telefone}\n` +
    `*Data:* ${dados.data} às ${dados.hora}\n` +
    `*Serviços:* ${dados.servicos}\n\n` +
    `Por favor, confirme recebimento.`
)}`;

document.getElementById('whatsappLink').href = whatsappLink;

    // 7. INICIALIZAÇÃO
    // ================
    configurarDataInicial();
});