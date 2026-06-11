/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Cpu, RotateCcw, AlertCircle, Terminal, HelpCircle } from 'lucide-react';
import { ImageUploader } from './components/ImageUploader';
import { DiagnosisReport } from './components/DiagnosisReport';
import { analyzePCB, type PCBAnalysisResult } from './services/geminiService';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PCBAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageAnalysis = async (base64: string, mimeType: string) => {
    setLoading(true);
    setError(null);
    try {
      const analysisResult = await analyzePCB(base64, mimeType);
      setResult(analysisResult);
    } catch (err: any) {
      console.error(err);
      const errMsg = err.message || "";
      if (errMsg.includes("CONFIG_ERROR")) {
        const isVercel = window.location.hostname.includes("vercel.app");
        if (isVercel) {
          setError("ERRO DE CONFIGURAÇÃO: A variável GEMINI_API_KEY não foi configurada nas variáveis de ambiente do seu projeto no Vercel.");
        } else {
          setError("ERRO DE CONFIGURAÇÃO: A variável GEMINI_API_KEY não está ativa nesta prévia do AI Studio. Adicione-a em Configurações > Secrets (ou Settings > Secrets) para usar a ferramenta.");
        }
      } else if (errMsg.includes("KEY_ERROR") || errMsg.includes("invalid key") || errMsg.includes("API_KEY_INVALID") || errMsg.includes("API key not valid")) {
        setError("CHAVE INVÁLIDA: A chave de API do Gemini (Começando com 'AIzaSy...') é inválida ou expirou. Verifique as configurações de ambiente ou do Vercel.");
      } else {
        setError(`Falha na análise: ${errMsg || "Certifique-se de que a imagem está clara e tente novamente."}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setResult(null);
    setError(null);
    setLoading(false);
    setPreview(null);
  };

  return (
    <div className="min-h-screen bg-app-bg text-app-text relative overflow-x-hidden">
      <div className="fixed inset-0 grid-overlay pointer-events-none opacity-40" />
      
      <header className="h-16 border-b border-app-border flex items-center justify-between px-8 bg-app-surface relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-app-accent rounded flex items-center justify-center">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight uppercase">
            PCB Vision Check <span className="text-white/30 font-light text-sm ml-2">v2.4.0</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="mono-label">Núcleo IA Ativo</span>
          </div>
          <button 
            onClick={resetAll}
            className="px-4 py-1.5 bg-white/5 border border-white/10 rounded text-[10px] hover:bg-white/10 transition-colors uppercase font-bold tracking-widest"
          >
            Reiniciar
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10 flex flex-col items-center">
        {!result && !loading && (
          <div className="mb-12 text-center max-w-2xl">
            <p className="mono-label mb-2">Sistema de Diagnóstico</p>
            <h2 className="text-4xl font-bold tracking-tighter mb-4 text-white">Inspeção Visual Assistida</h2>
            <p className="text-app-muted text-lg font-light leading-relaxed">
              Carregue uma imagem para identificar componentes e detectar falhas físicas em placas de circuito com precisão aeroespacial.
            </p>
          </div>
        )}

        <ImageUploader 
          onImageSelected={handleImageAnalysis} 
          isLoading={loading} 
          preview={preview}
          setPreview={setPreview}
        />

        {loading && (
          <div className="flex flex-col items-center justify-center p-12 space-y-6">
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                className="w-16 h-16 border-2 border-app-accent/20 border-t-app-accent rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-app-accent rounded-full animate-ping" />
              </div>
            </div>
            <div className="text-center">
              <p className="mono-label tracking-[0.3em]">Analisando Vetores de Dano...</p>
              <div className="flex gap-1 mt-3 justify-center">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                    className="w-1 h-1 bg-app-accent rounded-full"
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 p-4 app-card border-app-danger/50 bg-app-danger/10 flex items-center gap-3 max-w-xl self-center"
            >
              <AlertCircle className="w-5 h-5 text-app-danger" />
              <p className="text-xs font-mono text-app-danger font-bold uppercase tracking-wider">{error}</p>
            </motion.div>
          )}

          {result && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full mt-12 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/5 p-1 px-1 sm:p-4 lg:p-8"
            >
              <DiagnosisReport result={result} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="h-10 bg-app-surface border-t border-app-border fixed bottom-0 left-0 right-0 flex items-center px-8 justify-between z-20">
        <div className="flex gap-8">
          <div className="text-[10px] text-white/40 uppercase tracking-widest">
            <span className="text-white/60">ID do Dispositivo:</span> CV_SCAN_X1
          </div>
          <div className="text-[10px] text-white/40 uppercase tracking-widest hidden md:block">
            <span className="text-white/60">Latência:</span> 62ms
          </div>
        </div>
        <div className="text-[10px] text-white/20 uppercase tracking-widest font-medium">
          © 2024 Precision Optics AI • Sistemas Nominais
        </div>
      </footer>
    </div>
  );
}

