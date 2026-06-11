import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ImageUploaderProps {
  onImageSelected: (base64: string, mimeType: string) => void;
  isLoading: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, isLoading }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreview(base64);
        onImageSelected(base64, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            key="upload-choice"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full"
          >
            <button
              onClick={() => fileInputRef.current?.click()}
              className="group app-card p-12 w-full flex flex-col items-center justify-center gap-6 border-dashed border-2 border-white/5 hover:border-app-accent/50 hover:bg-app-accent/5 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-app-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-5 rounded-xl bg-white/5 group-hover:bg-app-accent/10 transition-colors">
                <Upload className="w-12 h-12 text-app-muted group-hover:text-app-accent" />
              </div>
              <div className="text-center relative z-10">
                <p className="mono-label !text-white text-sm tracking-widest font-bold">Importar Fonte de Hardware</p>
                <p className="text-[10px] text-app-muted mt-2 uppercase tracking-tight">JPG, PNG OU HEIC • MÁX 10MB</p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative app-card overflow-hidden group border-white/5 bg-black"
          >
            <img src={preview!} alt="Preview" className="w-full h-auto max-h-[600px] object-contain" />
            
            {isLoading && <div className="scan-line" />}
            
            <div className="absolute inset-0 pointer-events-none border-[20px] border-black/20" />
            
            <button
              onClick={clearImage}
              disabled={isLoading}
              className="absolute top-6 right-6 p-3 rounded-xl bg-black/60 text-white hover:bg-app-danger transition-colors opacity-0 group-hover:opacity-100 disabled:hidden backdrop-blur-md border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
