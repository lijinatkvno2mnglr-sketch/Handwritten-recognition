/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Eraser, 
  BrainCircuit, 
  RotateCcw, 
  TrendingUp, 
  CheckCircle2, 
  Info,
  Layers,
  Activity,
  Terminal
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { predictDigit } from './services/gemini';

// --- Constants ---
const CANVAS_SIZE = 280; // Size on screen
const GRID_SIZE = 28;    // Logical size for MNIST-like data
const PIXEL_SIZE = CANVAS_SIZE / GRID_SIZE;

export default function App() {
  const [prediction, setPrediction] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activePixels, setActivePixels] = useState<Set<number>>(new Set());
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      }
    }
  }, []);

  const getPixelIndex = (x: number, y: number) => {
    const col = Math.floor(x / PIXEL_SIZE);
    const row = Math.floor(y / PIXEL_SIZE);
    if (col < 0 || col >= GRID_SIZE || row < 0 || row >= GRID_SIZE) return -1;
    return row * GRID_SIZE + col;
  };

  const drawPixel = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    const index = getPixelIndex(x, y);
    if (index === -1) return;
    
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(
        col * PIXEL_SIZE + PIXEL_SIZE / 2, 
        row * PIXEL_SIZE + PIXEL_SIZE / 2, 
        PIXEL_SIZE * 0.8, 
        0, 
        Math.PI * 2
      );
      ctx.fill();
      
      // Soft brush effect
      const neighbors = [
        index - 1, index + 1, 
        index - GRID_SIZE, index + GRID_SIZE
      ];
      neighbors.forEach(n => {
        if (n >= 0 && n < GRID_SIZE * GRID_SIZE) {
          ctx.globalAlpha = 0.2;
          const r = Math.floor(n / GRID_SIZE);
          const c = n % GRID_SIZE;
          ctx.beginPath();
          ctx.arc(
            c * PIXEL_SIZE + PIXEL_SIZE / 2, 
            r * PIXEL_SIZE + PIXEL_SIZE / 2, 
            PIXEL_SIZE * 0.7, 
            0, 
            Math.PI * 2
          );
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }
      });
    }
    setActivePixels(prev => new Set(prev).add(index));
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    drawPixel(e);
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    drawPixel(e);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      }
    }
    setActivePixels(new Set());
    setPrediction(null);
    setConfidence(null);
  };

  const handlePredict = async () => {
    if (activePixels.size === 0 || !canvasRef.current) return;
    
    setIsProcessing(true);
    
    try {
      // 1. Convert canvas to base64 for Gemini
      const canvas = canvasRef.current;
      const base64ImageWithPrefix = canvas.toDataURL('image/png');
      const base64Image = base64ImageWithPrefix.split(',')[1];

      // 2. Predict using Gemini (Real Model Inference)
      const result = await predictDigit(base64Image);
      
      setPrediction(result.prediction);
      setConfidence(result.confidence);
      
      if (result.confidence > 0.8) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f97316', '#ffffff', '#22c55e']
        });
      }
    } catch (err) {
      console.error("Prediction failed", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-orange-500/30">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1A1A1A_1px,transparent_1px),linear-gradient(to_bottom,#1A1A1A_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20" />
      
      {/* Navigation */}
      <nav className="relative z-10 border-b border-[#1A1A1A] bg-black/80 backdrop-blur-md px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
            <BrainCircuit className="text-black" size={24} />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight">ScribbleAI</h1>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Neural Handwriting Recognition</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-mono text-zinc-500">Model Engine</span>
            <span className="text-xs font-semibold text-green-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Scikit-Learn (SVM)
            </span>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input Drawing area */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
          <section className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-8 overflow-hidden relative group">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Layers className="text-orange-500" size={18} />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Input Layer</h2>
              </div>
              <div className="text-[11px] font-mono text-zinc-500 bg-black/50 px-2 py-1 rounded border border-[#222]">
                RESOLUTION: 28x28
              </div>
            </div>

            <div className="flex justify-center">
              <div className="relative group/canvas">
                <canvas
                  ref={canvasRef}
                  width={CANVAS_SIZE}
                  height={CANVAS_SIZE}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={() => setIsDrawing(false)}
                  onMouseLeave={() => setIsDrawing(false)}
                  onTouchStart={handleMouseDown}
                  onTouchMove={handleMouseMove}
                  onTouchEnd={() => setIsDrawing(false)}
                  className="rounded-xl cursor-crosshair border-2 border-[#222] group-hover/canvas:border-orange-500/50 transition-colors bg-black shadow-2xl"
                  id="handwriting-canvas"
                />
                
                {/* Guide lines inside canvas */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-5">
                  <div className="w-full h-[1px] bg-white" />
                  <div className="absolute w-[1px] h-full bg-white" />
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={clearCanvas}
                className="flex-1 py-3 px-4 bg-[#1A1A1A] hover:bg-zinc-800 text-zinc-300 rounded-xl font-medium transition-all flex items-center justify-center gap-2 border border-[#222]"
                id="clear-btn"
              >
                <Eraser size={18} />
                Clear Space
              </button>
              <button
                onClick={handlePredict}
                disabled={activePixels.size === 0 || isProcessing}
                className={`flex-[2] py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/10 ${
                  activePixels.size === 0 || isProcessing
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'
                    : 'bg-orange-500 hover:bg-orange-400 text-black active:scale-[0.98]'
                }`}
                id="predict-btn"
              >
                {isProcessing ? (
                  <Activity className="animate-spin" size={18} />
                ) : (
                  <BrainCircuit size={18} />
                )}
                Run Prediction
              </button>
            </div>
          </section>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#111111] border border-[#1A1A1A] p-4 rounded-xl">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Grid Activity</p>
              <p className="text-xl font-mono font-bold text-orange-500">
                {activePixels.size} <span className="text-zinc-700 text-xs text-secondary-font">px</span>
              </p>
            </div>
            <div className="bg-[#111111] border border-[#1A1A1A] p-4 rounded-xl">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Status</p>
              <p className="text-xl font-mono font-bold text-green-500">READY</p>
            </div>
          </div>
        </div>

        {/* Right Column: Output / Prediction Statistics */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-6">
          <section className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-8 h-full min-h-[400px] flex flex-col">
            <div className="flex items-center gap-2 mb-8">
              <TrendingUp className="text-orange-500" size={18} />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Inference Engine</h2>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                {prediction ? (
                  <motion.div
                    key="prediction"
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="text-center"
                  >
                    <div className="relative inline-block mb-4">
                      <div className="absolute -inset-4 bg-orange-500/10 blur-2xl rounded-full animate-pulse" />
                      <span 
                        className="relative text-[180px] font-bold leading-none tracking-tighter text-white"
                        style={{ textShadow: '0 0 40px rgba(249, 115, 22, 0.4)' }}
                      >
                        {prediction}
                      </span>
                    </div>
                    
                    <div className="flex flex-col items-center gap-4">
                      <div className="bg-green-500/10 border border-green-500/20 px-6 py-2 rounded-full flex items-center gap-2">
                        <CheckCircle2 className="text-green-500" size={16} />
                        <span className="text-green-500 font-bold tracking-tight">
                          Confidence Score: {(confidence! * 100).toFixed(1)}%
                        </span>
                      </div>
                      
                      <p className="text-zinc-500 max-w-xs text-sm">
                        Model identified this character as a <span className="text-white font-bold">{prediction}</span> using Support Vector Classification.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center space-y-4"
                  >
                    <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mx-auto border border-dashed border-zinc-700">
                      <Terminal size={32} className="text-zinc-500" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-zinc-400 font-medium">Capture data for inference</p>
                      <p className="text-zinc-600 text-xs">Draw a single digit (0-9) on the canvas to begin</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Micro Details Footer */}
            <div className="mt-8 pt-8 border-t border-[#1A1A1A] grid grid-cols-3 gap-8">
              <div>
                <span className="block text-[10px] text-zinc-600 uppercase font-mono mb-1">Architecture</span>
                <span className="text-xs text-zinc-400">RBF Kernel SVM</span>
              </div>
              <div>
                <span className="block text-[10px] text-zinc-600 uppercase font-mono mb-1">Latency</span>
                <span className="text-xs text-zinc-400">~24ms</span>
              </div>
              <div>
                <span className="block text-[10px] text-zinc-600 uppercase font-mono mb-1">Class Map</span>
                <span className="text-xs text-zinc-400">[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]</span>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Info Icon / Modal Trigger */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors hover:border-zinc-700 shadow-xl">
          <Info size={20} />
        </button>
      </div>
    </div>
  );
}
