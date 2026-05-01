import React from 'react';
import { AlertTriangle, CheckCircle, Activity, Info, Zap, Wrench } from 'lucide-react';
import { motion } from 'motion/react';
import type { PCBAnalysisResult } from '../services/geminiService';

interface DiagnosisReportProps {
  result: PCBAnalysisResult;
}

export const DiagnosisReport: React.FC<DiagnosisReportProps> = ({ result }) => {
  return (
    <div className="w-full space-y-8">
      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="app-card p-5 border-l-4 border-app-accent bg-app-surface/50">
          <p className="mono-label !text-app-accent mb-1">Classificação do Alvo</p>
          <p className="text-lg font-bold tracking-tight uppercase">{result.boardType}</p>
        </div>
        <div className="app-card p-5 border-l-4 border-white/20 bg-app-surface/50">
          <p className="mono-label mb-1">Índice de Confiança</p>
          <p className="text-lg font-bold tracking-tight uppercase">{(result.confidence * 100).toFixed(1)}%</p>
        </div>
        <div className="app-card p-5 border-l-4 border-app-danger bg-app-surface/50">
          <p className="mono-label !text-app-danger mb-1">Anomalias Detectadas</p>
          <p className="text-lg font-bold tracking-tight uppercase">{result.damageDetected.length} Eventos Críticos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Summary and Components */}
        <div className="lg:col-span-4 space-y-8">
          <section className="app-card p-6 border-white/5 bg-white/[0.02]">
            <h3 className="mono-label mb-4 flex items-center gap-2">
              <Info className="w-3 h-3" /> Análise Central
            </h3>
            <p className="text-sm text-app-muted leading-relaxed font-light italic">
              {result.summary}
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="mono-label flex items-center gap-2">
              <Activity className="w-3 h-3" /> Manifesto de Inventário
            </h3>
            <div className="space-y-2">
              {result.componentsFound.map((comp, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="app-card px-4 py-3 flex items-center justify-between border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wide">{comp.name}</span>
                    <span className="text-[10px] text-app-muted font-mono">{comp.description}</span>
                  </div>
                  <div className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter
                    ${comp.status === 'ok' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                      comp.status === 'warning' ? 'bg-app-warning/10 text-app-warning border border-app-warning/20' : 
                      'bg-app-danger/10 text-app-danger border border-app-danger/20'}
                  `}>
                    {comp.status}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>

        {/* Right: Damage and Repairs */}
        <div className="lg:col-span-8 space-y-8">
          <section className="space-y-4">
            <h3 className="mono-label flex items-center gap-2 text-app-danger">
              <AlertTriangle className="w-3 h-3" /> Violações de Integridade
            </h3>
            {result.damageDetected.length === 0 ? (
              <div className="app-card p-12 flex flex-col items-center justify-center text-center border-dashed border-2 border-white/5 opacity-40">
                <CheckCircle className="w-10 h-10 text-green-500 mb-4" />
                <p className="mono-label">Todos os componentes operais. Nenhum desgaste físico detectado.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.damageDetected.map((damage, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="app-card overflow-hidden border-app-danger/30 bg-app-danger/[0.03] flex flex-col"
                  >
                    <div className="bg-app-danger/10 px-4 py-2 border-b border-app-danger/20 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-app-danger uppercase tracking-widest leading-none">Diagnóstico: {damage.type}</span>
                      <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded uppercase font-bold">{damage.severity}</span>
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-light text-app-text/90 italic leading-snug">
                        "{damage.description}"
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h3 className="mono-label flex items-center gap-2 text-app-accent">
              <Wrench className="w-3 h-3" /> Protocolo de Remediação
            </h3>
            <div className="app-card p-6 bg-app-accent/[0.02] border-app-accent/10">
              <ul className="space-y-3">
                {result.repairSuggestions.map((sug, idx) => (
                  <motion.li 
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + (idx * 0.1) }}
                    className="text-sm text-app-muted flex gap-3 items-start"
                  >
                    <span className="text-app-accent font-bold mt-1">→</span>
                    <span className="font-light tracking-wide">{sug}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
