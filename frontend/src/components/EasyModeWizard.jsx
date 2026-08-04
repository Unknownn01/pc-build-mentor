import React, { useState, useMemo } from 'react';
import { FaGamepad, FaBriefcase, FaLayerGroup, FaArrowLeft, FaArrowRight, FaCheck } from 'react-icons/fa';
import { GAMES_TIER_LIST } from '../gamesTierList';
import './EasyModeWizard.css';

const USO_OPTIONS = [
    { id: 'jogos', label: 'Jogos', icon: FaGamepad },
    { id: 'trabalho', label: 'Trabalho', icon: FaBriefcase },
    { id: 'ambos', label: 'Ambos (Jogos + Trabalho)', icon: FaLayerGroup },
];

const TRABALHO_OPTIONS = [
    { id: 'renderizacao', label: 'Renderização / Edição de Vídeo' },
    { id: 'desenvolvimento', label: 'Desenvolvimento / Programação' },
    { id: 'simples', label: 'Uso simples (web, escritório, planilhas)' },
];

const MARCA_OPTIONS = [
    { id: 'amd', label: 'AMD' },
    { id: 'intel', label: 'Intel' },
    { id: 'nvidia', label: 'Nvidia (GPU)' },
    { id: 'sem_preferencia', label: 'Sem preferência' },
];

const COR_OPTIONS = [
    { id: 'preto', label: 'Peças pretas' },
    { id: 'branco', label: 'Peças brancas' },
    { id: 'sem_preferencia', label: 'Sem preferência' },
];

const ORCAMENTO_MIN = 1500;
const ORCAMENTO_MAX = 15000;

function formatarPreco(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

function EasyModeWizard({ onComplete }) {
    const [stepIndex, setStepIndex] = useState(0);
    const [answers, setAnswers] = useState({
        uso: null,
        jogos: [],
        trabalho: null,
        orcamentoValor: 5000,
        marca: null,
        cor: null,
    });

    const steps = useMemo(() => {
        const s = ['uso'];
        if (answers.uso === 'jogos' || answers.uso === 'ambos') s.push('jogos');
        if (answers.uso === 'trabalho' || answers.uso === 'ambos') s.push('trabalho');
        s.push('orcamento', 'marca', 'cor');
        return s;
    }, [answers.uso]);

    const currentStepId = steps[stepIndex];
    const isLastStep = stepIndex === steps.length - 1;
    const progressPercent = ((stepIndex + 1) / steps.length) * 100;

    const goNext = () => {
        if (isLastStep) onComplete(answers);
        else setStepIndex(i => Math.min(i + 1, steps.length - 1));
    };

    const goBack = () => setStepIndex(i => Math.max(i - 1, 0));

    const canAdvance = () => {
        switch (currentStepId) {
            case 'uso': return !!answers.uso;
            case 'jogos': return answers.jogos.length > 0;
            case 'trabalho': return !!answers.trabalho;
            case 'orcamento': return answers.orcamentoValor >= ORCAMENTO_MIN;
            default: return true; // marca e cor são opcionais
        }
    };

    const toggleJogo = (nomeJogo) => {
        setAnswers(prev => {
            const jaTem = prev.jogos.includes(nomeJogo);
            return { ...prev, jogos: jaTem ? prev.jogos.filter(j => j !== nomeJogo) : [...prev.jogos, nomeJogo] };
        });
    };

    const renderStep = () => {
        switch (currentStepId) {
            case 'uso':
                return (
                    <div className="wizard-step">
                        <h3>O que você vai fazer com o PC?</h3>
                        <div className="wizard-options-grid">
                            {USO_OPTIONS.map(opt => (
                                <button key={opt.id} className={`wizard-option-card ${answers.uso === opt.id ? 'selected' : ''}`} onClick={() => setAnswers(prev => ({ ...prev, uso: opt.id }))}>
                                    <opt.icon className="wizard-option-icon" />
                                    <span>{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'jogos':
                return (
                    <div className="wizard-step">
                        <h3>Quais jogos você quer jogar?</h3>
                        <p className="wizard-step-subtitle">Selecione um ou mais</p>
                        <div className="wizard-games-grid">
                            {GAMES_TIER_LIST.map(jogo => (
                                <button key={jogo.nome} className={`wizard-game-chip ${answers.jogos.includes(jogo.nome) ? 'selected' : ''}`} onClick={() => toggleJogo(jogo.nome)}>
                                    {jogo.nome}
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'trabalho':
                return (
                    <div className="wizard-step">
                        <h3>Com o que você trabalha?</h3>
                        <div className="wizard-options-list">
                            {TRABALHO_OPTIONS.map(opt => (
                                <button key={opt.id} className={`wizard-option-row ${answers.trabalho === opt.id ? 'selected' : ''}`} onClick={() => setAnswers(prev => ({ ...prev, trabalho: opt.id }))}>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'orcamento':
                return (
                    <div className="wizard-step">
                        <h3>Qual seu orçamento?</h3>
                        <p className="wizard-step-subtitle">Arraste para ajustar o valor</p>
                        <div className="wizard-budget-display">{formatarPreco(answers.orcamentoValor)}</div>
                        <input
                            type="range"
                            min={ORCAMENTO_MIN}
                            max={ORCAMENTO_MAX}
                            step={100}
                            value={answers.orcamentoValor}
                            onChange={(e) => setAnswers(prev => ({ ...prev, orcamentoValor: parseInt(e.target.value) }))}
                            className="wizard-budget-slider"
                        />
                        <div className="wizard-budget-range-labels">
                            <span>{formatarPreco(ORCAMENTO_MIN)}</span>
                            <span>{formatarPreco(ORCAMENTO_MAX)}+</span>
                        </div>
                    </div>
                );

            case 'marca':
                return (
                    <div className="wizard-step">
                        <h3>Tem preferência de marca?</h3>
                        <p className="wizard-step-subtitle">Opcional — pode pular</p>
                        <div className="wizard-options-list">
                            {MARCA_OPTIONS.map(opt => (
                                <button key={opt.id} className={`wizard-option-row ${answers.marca === opt.id ? 'selected' : ''}`} onClick={() => setAnswers(prev => ({ ...prev, marca: opt.id }))}>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'cor':
                return (
                    <div className="wizard-step">
                        <h3>Preferência visual das peças?</h3>
                        <p className="wizard-step-subtitle">Opcional — pode pular</p>
                        <div className="wizard-options-list">
                            {COR_OPTIONS.map(opt => (
                                <button key={opt.id} className={`wizard-option-row ${answers.cor === opt.id ? 'selected' : ''}`} onClick={() => setAnswers(prev => ({ ...prev, cor: opt.id }))}>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                );

            default: return null;
        }
    };

    return (
        <div className="easy-wizard-container">
            <div className="wizard-progress-bar">
                <div className="wizard-progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="wizard-progress-label">Passo {stepIndex + 1} de {steps.length}</div>

            {renderStep()}

            <div className="wizard-nav-buttons">
                {stepIndex > 0 && <button className="wizard-btn-back" onClick={goBack}><FaArrowLeft /> Voltar</button>}
                <button className="wizard-btn-next" onClick={goNext} disabled={!canAdvance()}>
                    {isLastStep ? <><FaCheck /> Montar meu PC</> : <>Próximo <FaArrowRight /></>}
                </button>
            </div>
        </div>
    );
}

export default EasyModeWizard;