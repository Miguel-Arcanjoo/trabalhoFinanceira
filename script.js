document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================================================
    // ESTADOS GERAIS DO ORÇAMENTO
    // ==========================================================================
    let orcamentoState = {
        receitaBase: 100000,
        manutencaoBase: 30000,
        eventosBase: 20000,
        contasBase: 15000,
        
        // Dilemas
        dilema1Escolha: null, // 'A' ou 'B' ou null
        dilema1Custo: 0,
        dilema2Escolha: null, // 'A' ou 'B' ou null
        dilema2Custo: 0,
        
        // Imprevistos
        imprevistoNome: '',
        imprevistoValor: 0,
        imprevistoTipo: '', // 'receita' ou 'despesa'
        
        // Estratégia Aplicada
        estrategiaAtiva: null // 'A' ou 'B' ou null
    };

    // Círculo SVG de Progresso
    const circle = document.getElementById('progress-indicator');
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = circumference;

    // ==========================================================================
    // CONTROLES DE NAVEGAÇÃO E HEADER STICKY
    // ==========================================================================
    const header = document.querySelector('.main-header');
    const navLinks = document.querySelectorAll('.nav-menu a');
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');

    // Header fixo ao rolar
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        highlightNavLink();
    });

    // Toggle menu mobile
    mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('open');
        const icon = mobileToggle.querySelector('i');
        if (navMenu.classList.contains('open')) {
            icon.className = 'fa-solid fa-xmark';
        } else {
            icon.className = 'fa-solid fa-bars';
        }
    });

    // Fechar menu mobile ao clicar nos links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('open');
            mobileToggle.querySelector('i').className = 'fa-solid fa-bars';
        });
    });

    // Destacar link ativo conforme scroll
    function highlightNavLink() {
        let scrollPosition = window.scrollY + 150;
        const sections = document.querySelectorAll('section');
        
        sections.forEach(section => {
            if (scrollPosition >= section.offsetTop && scrollPosition < (section.offsetTop + section.offsetHeight)) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${section.id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // ==========================================================================
    // SEÇÃO 1: EQUAÇÃO MATEMÁTICA E ATUALIZAÇÃO DO PAINEL
    // ==========================================================================
    const inputReceita = document.getElementById('input-receita');
    const inputManutencao = document.getElementById('input-manutencao');
    const inputEventos = document.getElementById('input-eventos');
    const inputContas = document.getElementById('input-contas');

    // Labels e exibições
    const lblReceitaVal = document.getElementById('val-receita');
    const lblManutencaoVal = document.getElementById('val-manutencao');
    const lblEventosVal = document.getElementById('val-eventos');
    const lblContasVal = document.getElementById('val-contas');

    const totalReceitaEl = document.getElementById('total-receita');
    const totalDespesaEl = document.getElementById('total-despesa');
    const saldoLiquidoEl = document.getElementById('saldo-liquido');
    const percentLabel = document.getElementById('percent-label');

    // Elementos da tabela
    const tblReceita = document.getElementById('table-receita');
    const tblManutencao = document.getElementById('table-manutencao');
    const tblEventos = document.getElementById('table-eventos');
    const tblContas = document.getElementById('table-contas');
    const tblRowImprevisto = document.getElementById('row-imprevisto');
    const tblImprevistoNome = document.getElementById('table-imprevisto-nome');
    const tblImprevistoValor = document.getElementById('table-imprevisto-valor');

    // Inputs Sliders Event Listeners
    inputReceita.addEventListener('input', (e) => {
        orcamentoState.receitaBase = parseInt(e.target.value);
        atualizarOrcamento();
    });
    inputManutencao.addEventListener('input', (e) => {
        orcamentoState.manutencaoBase = parseInt(e.target.value);
        atualizarOrcamento();
    });
    inputEventos.addEventListener('input', (e) => {
        orcamentoState.eventosBase = parseInt(e.target.value);
        atualizarOrcamento();
    });
    inputContas.addEventListener('input', (e) => {
        orcamentoState.contasBase = parseInt(e.target.value);
        atualizarOrcamento();
    });

    // Formatação de Moeda
    function formatarReal(valor) {
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
    }

    // Função Principal de Cálculo e Atualização Visual
    function atualizarOrcamento() {
        // Obter valores base
        let receitaTotal = orcamentoState.receitaBase;
        
        let despesaManutencao = orcamentoState.manutencaoBase;
        let despesaEventos = orcamentoState.eventosBase;
        let despesaContas = orcamentoState.contasBase;

        // Somar dilemas e escolhas
        if (orcamentoState.dilema1Escolha === 'A') {
            // Robótica adiciona em eventos
            despesaEventos += orcamentoState.dilema1Custo;
        } else if (orcamentoState.dilema1Escolha === 'B') {
            // Biblioteca adiciona em manutenção
            despesaManutencao += orcamentoState.dilema1Custo;
        }

        if (orcamentoState.dilema2Escolha === 'A') {
            // Climatização adiciona em manutenção
            despesaManutencao += orcamentoState.dilema2Custo;
        } else if (orcamentoState.dilema2Escolha === 'B') {
            // Quadra adiciona em manutenção
            despesaManutencao += orcamentoState.dilema2Custo;
        }

        // Adicionar impactos de imprevistos
        let despesaImprevisto = 0;
        if (orcamentoState.imprevistoValor > 0) {
            if (orcamentoState.imprevistoTipo === 'despesa') {
                despesaImprevisto = orcamentoState.imprevistoValor;
            } else if (orcamentoState.imprevistoTipo === 'receita') {
                receitaTotal = Math.max(0, receitaTotal - orcamentoState.imprevistoValor);
            }
        }

        // Cálculo das Despesas Totais e Saldo
        let despesasTotais = despesaManutencao + despesaEventos + despesaContas + despesaImprevisto;
        let saldoLiquido = receitaTotal - despesasTotais;

        // Atualizar os labels do formulário
        lblReceitaVal.textContent = formatarReal(orcamentoState.receitaBase);
        lblManutencaoVal.textContent = formatarReal(orcamentoState.manutencaoBase);
        lblEventosVal.textContent = formatarReal(orcamentoState.eventosBase);
        lblContasVal.textContent = formatarReal(orcamentoState.contasBase);

        // Atualizar painel de totais numéricos
        totalReceitaEl.textContent = formatarReal(receitaTotal);
        totalDespesaEl.textContent = formatarReal(despesasTotais);
        saldoLiquidoEl.textContent = formatarReal(saldoLiquido);

        // Atualizar tabela física
        tblReceita.textContent = formatarReal(receitaTotal);
        
        // Destacar na tabela a inclusão dos dilemas
        let txtDilema1 = orcamentoState.dilema1Escolha ? ` (+ Dilema 01)` : '';
        let txtDilema2_M = (orcamentoState.dilema2Escolha === 'A' || orcamentoState.dilema2Escolha === 'B') ? ` (+ Dilema 02)` : '';
        
        tblManutencao.textContent = formatarReal(despesaManutencao);
        if (txtDilema1 && orcamentoState.dilema1Escolha === 'B') {
            tblManutencao.textContent += " (Inclui Biblioteca)";
        }
        if (txtDilema2_M) {
            tblManutencao.textContent += orcamentoState.dilema2Escolha === 'A' ? " (Inclui Climatização)" : " (Inclui Quadra)";
        }

        tblEventos.textContent = formatarReal(despesaEventos);
        if (txtDilema1 && orcamentoState.dilema1Escolha === 'A') {
            tblEventos.textContent += " (Inclui Robótica)";
        }
        
        tblContas.textContent = formatarReal(despesaContas);

        // Exibir ou ocultar linha de imprevisto na tabela
        if (orcamentoState.imprevistoValor > 0 && orcamentoState.imprevistoTipo === 'despesa') {
            tblRowImprevisto.style.display = 'table-row';
            tblImprevistoNome.textContent = orcamentoState.imprevistoNome;
            tblImprevistoValor.textContent = formatarReal(orcamentoState.imprevistoValor);
        } else {
            tblRowImprevisto.style.display = 'none';
        }

        // Estilização do saldo com base no resultado matemático
        const saldoCard = document.querySelector('.num-box.highlighted');
        if (saldoLiquido < 0) {
            saldoLiquidoEl.className = "num-val neon-red";
            saldoCard.style.borderColor = "var(--neon-red)";
            saldoCard.style.background = "rgba(255, 0, 60, 0.05)";
            saldoCard.style.boxShadow = "var(--shadow-red-glow)";
        } else if (saldoLiquido === 0) {
            saldoLiquidoEl.className = "num-val";
            saldoCard.style.borderColor = "rgba(255,255,255,0.1)";
            saldoCard.style.background = "rgba(255,255,255,0.02)";
            saldoCard.style.boxShadow = "none";
        } else {
            saldoLiquidoEl.className = "num-val neon-green";
            saldoCard.style.borderColor = "var(--neon-green)";
            saldoCard.style.background = "rgba(57, 255, 20, 0.03)";
            saldoCard.style.boxShadow = "var(--shadow-green-glow)";
        }

        // Atualizar Gráfico Radial (SVG Ring)
        let percent = Math.round((despesasTotais / (receitaTotal || 1)) * 100);
        percentLabel.textContent = `${percent}%`;

        // Limitar percent para o gráfico circular não inverter
        let displayPercent = Math.min(percent, 100);
        const offset = circumference - (displayPercent / 100) * circumference;
        circle.style.strokeDashoffset = offset;

        // Alterar cor do anel de acordo com a porcentagem
        if (percent > 100) {
            circle.style.stroke = "var(--neon-red)";
            circle.style.filter = "drop-shadow(0 0 8px rgba(255, 0, 60, 0.7))";
        } else if (percent > 85) {
            circle.style.stroke = "var(--neon-yellow)";
            circle.style.filter = "drop-shadow(0 0 8px rgba(255, 215, 0, 0.7))";
        } else {
            circle.style.stroke = "var(--neon-cyan)";
            circle.style.filter = "drop-shadow(0 0 8px rgba(0, 240, 255, 0.7))";
        }

        // Atualizar painel de pressão se houver déficit
        const simStatusText = document.getElementById('sim-status-text');
        if (saldoLiquido < 0) {
            simStatusText.textContent = "ALERTA: CRÍTICO";
            simStatusText.className = "sim-status-indicator neon-red";
        } else if (orcamentoState.imprevistoValor > 0) {
            simStatusText.textContent = "PRESSÃO ATIVA";
            simStatusText.className = "sim-status-indicator neon-yellow";
        } else {
            simStatusText.textContent = "NOMINAL";
            simStatusText.className = "sim-status-indicator neon-green";
        }
    }

    // ==========================================================================
    // SEÇÃO 2: DELEMAS E ESCOLHAS CONFLITANTES (Priorização)
    // ==========================================================================
    const dilemaCards = document.querySelectorAll('.dilema-card');
    const lblAccumulatedCost = document.getElementById('accumulated-cost-label');

    // Justificativas dinâmicas para o dilema
    const justificativas = {
        1: {
            A: "Com a inclusão do Laboratório de Robótica (+R$ 12.000), a escola prioriza o desenvolvimento de habilidades de programação e lógica. Custo de oportunidade: A biblioteca física foi excluída e continuará desatualizada. Matemática da Restrição: Toda inclusão força o saldo para baixo, exigindo cortes compensatórios em outras categorias.",
            B: "Ao priorizar a Modernização da Biblioteca (+R$ 8.000), o foco é na pesquisa, leitura básica e inclusão clássica. Custo de oportunidade: O laboratório de robótica e cultura maker foram excluídos, postergando o aprendizado prático tecnológico dos alunos."
        },
        2: {
            A: "A climatização total (+R$ 15.000) foca na otimização ambiental imediata do aprendizado em sala. Custo de oportunidade: A quadra esportiva continuará danificada, prejudicando o desenvolvimento físico e esportivo dos alunos. Essa decisão de infraestrutura fixa adiciona despesas imediatas de manutenção.",
            B: "A reforma da quadra esportiva (+R$ 10.000) eleva o bem-estar físico e incentiva esportes coletivos. Custo de oportunidade: Os alunos continuarão estudando sob calor excessivo, o que reduz a capacidade cognitiva e a retenção de conteúdo em sala de aula."
        }
    };

    dilemaCards.forEach(card => {
        const dilemaNum = card.getAttribute('data-dilema');
        const options = card.querySelectorAll('.dilema-option');
        const justificationText = card.querySelector('.justification-text');
        const tags = card.querySelectorAll('.status-tag');
        const tagIncluded = card.querySelector('.status-included');
        const tagExcluded = card.querySelector('.status-excluded');

        options.forEach(opt => {
            opt.addEventListener('click', () => {
                const selectedOption = opt.getAttribute('data-option');
                const cost = parseInt(opt.getAttribute('data-cost'));

                // Desmarcar todas as outras opções deste dilema
                options.forEach(o => o.classList.remove('selected'));
                
                // Marcar opção atual
                opt.classList.add('selected');
                card.classList.add('has-selection');

                // Atualizar estado
                if (dilemaNum === "1") {
                    orcamentoState.dilema1Escolha = selectedOption;
                    orcamentoState.dilema1Custo = cost;
                } else if (dilemaNum === "2") {
                    orcamentoState.dilema2Escolha = selectedOption;
                    orcamentoState.dilema2Custo = cost;
                }

                // Atualizar textos de justificativa (Efeito máquina de escrever ou transição de opacidade)
                justificationText.style.opacity = 0;
                setTimeout(() => {
                    justificationText.textContent = justificativas[dilemaNum][selectedOption];
                    justificationText.style.opacity = 1;
                }, 150);

                // Atualizar Tags de Incluído e Excluído
                tagIncluded.style.display = 'none';
                tagExcluded.style.display = 'none';

                // Mostrar o que foi incluído e excluído
                const otherOptText = selectedOption === 'A' ? 'Opção B' : 'Opção A';
                
                // Atualizar badges
                tagIncluded.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${opt.querySelector('h4').textContent} INCLUÍDO`;
                
                let outText = '';
                options.forEach(o => {
                    if (o.getAttribute('data-option') !== selectedOption) {
                        outText = o.querySelector('h4').textContent;
                    }
                });
                tagExcluded.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> ${outText} EXCLUÍDO`;
                
                tagIncluded.style.display = 'inline-flex';
                tagExcluded.style.display = 'inline-flex';

                // Recalcular custos acumulados e atualizar orçamento
                atualizarAcumuladoDilemas();
                atualizarOrcamento();
            });
        });
    });

    function atualizarAcumuladoDilemas() {
        let totalAcumulado = orcamentoState.dilema1Custo + orcamentoState.dilema2Custo;
        lblAccumulatedCost.textContent = formatarReal(totalAcumulado);
    }

    // ==========================================================================
    // SEÇÃO 3: SIMULADOR DE IMPREVISTOS (Cenário de Pressão)
    // ==========================================================================
    const btnSimular = document.getElementById('btn-simular');
    const btnReorganizar = document.getElementById('btn-reorganizar');
    const terminalContent = document.getElementById('terminal-content');
    const panelImpact = document.getElementById('alert-impact-panel');
    const severityEl = document.getElementById('impact-severity');
    const varianceEl = document.getElementById('impact-variance');

    // Lista de Imprevistos
    const imprevistos = [
        {
            nome: "Ruptura da Tubulação Principal",
            valor: 14000,
            tipo: "despesa",
            gravidade: "ALTA",
            mensagem: "Vazamento subterrâneo crítico na tubulação da quadra. Reparo emergencial exigido de imediato."
        },
        {
            nome: "Queda de 12% do Repasse Governamental",
            valor: 12000,
            tipo: "receita",
            gravidade: "CRÍTICA",
            mensagem: "Ajuste fiscal no orçamento municipal reduz o aporte financeiro escolar deste semestre."
        },
        {
            nome: "Multa por Descumprimento de Normas de Incêndio",
            valor: 9000,
            tipo: "despesa",
            gravidade: "MÉDIA",
            mensagem: "Vistoria dos bombeiros aponta necessidade urgente de substituição de extintores e sinalização de emergência."
        },
        {
            nome: "Picos de Alta Tensão nas Contas de Luz",
            valor: 7000,
            tipo: "despesa",
            gravidade: "MÉDIA",
            mensagem: "Aumento extraordinário de consumo e tarifas energéticas aplicadas ao setor educacional."
        }
    ];

    btnSimular.addEventListener('click', () => {
        // Escolher imprevisto aleatório
        const randomItem = imprevistos[Math.floor(Math.random() * imprevistos.length)];
        
        // Atualizar estado
        orcamentoState.imprevistoNome = randomItem.nome;
        orcamentoState.imprevistoValor = randomItem.valor;
        orcamentoState.imprevistoTipo = randomItem.tipo;

        // Ativar alarme visual no body
        document.body.classList.add('alert-active');
        
        // Imprimir no terminal simulado
        terminalContent.innerHTML = ""; // Limpar console
        escreverTerminal(`> [ALERTA] INICIALIZANDO SIMULAÇÃO DE ESTRESSE FINANCEIRO...`);
        
        setTimeout(() => {
            escreverTerminal(`> DETECTADO: ${randomItem.nome.toUpperCase()}`);
        }, 500);

        setTimeout(() => {
            escreverTerminal(`> DIAGNÓSTICO: ${randomItem.mensagem}`, 'critical');
        }, 1200);

        setTimeout(() => {
            let sinal = randomItem.tipo === 'despesa' ? '+' : '-';
            escreverTerminal(`> IMPACTO FINANCEIRO: ${sinal} ${formatarReal(randomItem.valor)}`, 'critical');
            
            // Atualizar cartão de impacto
            severityEl.textContent = randomItem.gravidade;
            severityEl.className = randomItem.gravidade === 'CRÍTICA' || randomItem.gravidade === 'ALTA' ? 'stat-high text-error' : 'stat-high text-purple';
            varianceEl.textContent = `${sinal} ${formatarReal(randomItem.valor)}`;
            
            // Recalcular e atualizar painel geral
            atualizarOrcamento();
        }, 1800);

        // Habilitar / Desabilitar botões
        btnSimular.disabled = true;
        btnReorganizar.disabled = false;
    });

    btnReorganizar.addEventListener('click', () => {
        // Limpar imprevistos do estado
        orcamentoState.imprevistoNome = '';
        orcamentoState.imprevistoValor = 0;
        orcamentoState.imprevistoTipo = '';

        // Remover alarmes
        document.body.classList.remove('alert-active');

        // Log de restauração no terminal
        terminalContent.innerHTML = "";
        escreverTerminal(`> [SISTEMA] INICIANDO PROTOCOLO DE RECOMPOSIÇÃO ORÇAMENTÁRIA...`);
        
        setTimeout(() => {
            escreverTerminal(`> ANALISANDO PLANILHA DE CONTENÇÃO...`);
        }, 600);

        setTimeout(() => {
            escreverTerminal(`> INTEGRIDADE RESTAURADA. ESTADO NOMINAL REATIVADO.`, 'action');
            
            // Resetar painel de impacto
            severityEl.textContent = "-";
            severityEl.className = "stat-high";
            varianceEl.textContent = "-";

            // Atualizar e recalcular
            atualizarOrcamento();
        }, 1200);

        // Habilitar / Desabilitar botões
        btnSimular.disabled = false;
        btnReorganizar.disabled = true;
    });

    // Função auxiliar para escrever linhas com efeito no terminal
    function escreverTerminal(texto, classe = '') {
        const p = document.createElement('span');
        p.className = `term-line ${classe}`;
        p.textContent = texto;
        terminalContent.appendChild(p);
        // Scroll para o fim do terminal
        terminalContent.scrollTop = terminalContent.scrollHeight;
    }

    // ==========================================================================
    // SEÇÃO 4: ESTRATÉGIAS ALTERNATIVAS (Aplicação de Cenários)
    // ==========================================================================
    const strategyBtns = document.querySelectorAll('.btn-apply-strategy');
    const strategyCards = document.querySelectorAll('.strategy-card');

    strategyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const strategyType = btn.getAttribute('data-strategy');

            // Desmarcar cartões de estratégia anteriores
            strategyCards.forEach(card => card.classList.remove('applied'));
            strategyBtns.forEach(b => {
                b.className = "btn btn-outline btn-full btn-apply-strategy";
                b.querySelector('.btn-text').textContent = b.getAttribute('data-strategy') === 'A' ? "APLICAR CORTES IMEDIATOS" : "APLICAR OTIMIZAÇÃO E PARCERIAS";
            });

            // Selecionar o cartão clicado e destacar
            const currentCard = btn.closest('.strategy-card');
            currentCard.classList.add('applied');
            btn.className = "btn btn-neon btn-full btn-apply-strategy";
            btn.querySelector('.btn-text').textContent = "ESTRATÉGIA ATIVADA";

            // Alterar dinamicamente os valores de acordo com a estratégia matemática
            if (strategyType === 'A') {
                orcamentoState.estrategiaAtiva = 'A';
                
                // Reduzir drasticamente as despesas flexíveis ao mínimo
                inputManutencao.value = 18000;
                inputEventos.value = 10000;
                
                orcamentoState.manutencaoBase = 18000;
                orcamentoState.eventosBase = 10000;
                
                // Escrever no console do simulador
                escreverTerminal(`> APLICADO: ESTRATÉGIA A (CORTES LINEARES). Manutenção reduzida para R$ 18.000, Eventos reduzidos para R$ 10.000.`, 'action');
            } else if (strategyType === 'B') {
                orcamentoState.estrategiaAtiva = 'B';
                
                // Reduzir contas de consumo pela eficiência energética (Investimento Solar)
                inputContas.value = 10000;
                orcamentoState.contasBase = 10000;
                
                // Obter receita com patrocínio (+R$ 15.000 de fundos extras)
                inputReceita.value = 115000;
                orcamentoState.receitaBase = 115000;

                // Escrever no console do simulador
                escreverTerminal(`> APLICADO: ESTRATÉGIA B (EFICIÊNCIA & PARCERIAS). Contas básicas reduzidas para R$ 10.000. Captação de Patrocínios (+R$ 15.000 na Receita).`, 'action');
            }

            // Recalcular orçamento geral
            atualizarOrcamento();
        });
    });

    // ==========================================================================
    // INICIALIZAÇÃO DO SISTEMA
    // ==========================================================================
    atualizarOrcamento();
});
