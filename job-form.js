async function sendJobApplication(formData) {
    const emailData = {
        from: 'VMB Advisor Carreiras <onboarding@resend.dev>',
        to: ['robertoathos22@gmail.com'], // Email de RH da VMB
        subject: `Nova candidatura: ${formData.name} - ${formData.area}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7f7f7;">
                <div style="background-color: #161616; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="color: #25c5ef; margin: 0;">VMB Advisor</h1>
                    <p style="color: #ffffff; margin: 10px 0 0 0;">Nova Candidatura Recebida</p>
                </div>
                <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px;">
                    <h2 style="color: #161616; margin-top: 0;">Informações do Candidato</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                                <strong style="color: #25c5ef;">Nome:</strong>
                            </td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                                ${formData.name}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                                <strong style="color: #25c5ef;">Email:</strong>
                            </td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                                <a href="mailto:${formData.email}" style="color: #161616; text-decoration: none;">
                                    ${formData.email}
                                </a>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                                <strong style="color: #25c5ef;">Telefone:</strong>
                            </td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                                <a href="tel:${formData.phone}" style="color: #161616; text-decoration: none;">
                                    ${formData.phone}
                                </a>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                                <strong style="color: #25c5ef;">Área de Interesse:</strong>
                            </td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                                ${formData.area}
                            </td>
                        </tr>
                    </table>
                    ${formData.message ? `
                    <div style="margin-top: 20px;">
                        <strong style="color: #25c5ef;">Mensagem:</strong>
                        <div style="background-color: #f7f7f7; padding: 15px; border-radius: 8px; margin-top: 10px; white-space: pre-wrap;">
                            ${formData.message}
                        </div>
                    </div>
                    ` : ''}
                </div>
                <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
                    <p style="margin: 0;">© 2024 VMB Advisor. Todos os direitos reservados.</p>
                    <p style="margin: 5px 0 0 0;">Este email foi enviado através do formulário de carreiras do site.</p>
                </div>
            </div>
        `
    };

    try {
        const response = await fetch("https://function-bun-production-8100.up.railway.app/api/send-email", {
            method: 'POST',
            headers: {             
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(emailData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Erro ao enviar candidatura');
        }

        return { success: true, data: result };
    } catch (error) {
        console.error('Erro ao enviar candidatura:', error);
        return { success: false, error: error.message };
    }
}

// Função para mostrar notificação
function showNotification(message, type = 'success') {
    // Remove notificação existente se houver
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        max-width: 400px;
    `;

    if (type === 'success') {
        notification.style.backgroundColor = '#25c5ef';
    } else {
        notification.style.backgroundColor = '#ef4444';
    }

    notification.textContent = message;
    document.body.appendChild(notification);

    // Adicionar animação
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Remover após 5 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Função para formatar o nome da área
function formatAreaName(area) {
    const areas = {
        'investimentos': 'Investimentos',
        'planejamento': 'Planejamento Financeiro',
        'tecnologia': 'Tecnologia',
        'operacoes': 'Operações'
    };
    return areas[area] || area;
}

// Event listener para o formulário
document.addEventListener('DOMContentLoaded', function() {
    const jobForm = document.getElementById('job-form');
    
    if (jobForm) {
        jobForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Validar área de interesse
            const areaSelect = document.getElementById('area');
            if (!areaSelect.value) {
                showNotification('Por favor, selecione uma área de interesse.', 'error');
                return;
            }

            // Desabilitar botão de submit
            const submitButton = jobForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = `
                <svg class="animate-spin h-5 w-5 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
            `;

            // Coletar dados do formulário
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                area: formatAreaName(document.getElementById('area').value),
                message: document.getElementById('message').value
            };

            // Enviar candidatura
            const result = await sendJobApplication(formData);

            // Reabilitar botão
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;

            if (result.success) {
                showNotification('Candidatura enviada com sucesso! Entraremos em contato em breve.', 'success');
                jobForm.reset(); // Limpar formulário
            } else {
                showNotification('Erro ao enviar candidatura. Por favor, tente novamente.', 'error');
            }
        });
    }
});
