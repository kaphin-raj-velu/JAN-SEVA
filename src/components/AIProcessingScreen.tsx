import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Image as ImageIcon, Mic, MapPin, CheckCircle2, Cpu } from 'lucide-react';
import { AIAnalysisResult } from '../types';

interface AIProcessingScreenProps {
  progressStage: number; // 0 to 4
  analysisResult: AIAnalysisResult | null;
  onContinue: () => void;
}

export const AIProcessingScreen: React.FC<AIProcessingScreenProps> = ({
  progressStage,
  analysisResult,
  onContinue,
}) => {
  const stages = [
    { label: 'Scanning Image Artifacts & Structural Damage', icon: ImageIcon },
    { label: 'Transcribing & Processing Multilingual Voice Input', icon: Mic },
    { label: 'Geocoding Location Coordinates & Ward Boundaries', icon: MapPin },
    { label: 'Determining Priority Matrix & Assigning Department', icon: Cpu },
  ];

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border border-[#DADCE0] rounded-3xl p-8 shadow-xl relative overflow-hidden"
      >
        {/* Animated AI aura backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl -z-10 animate-pulse" />

        <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-6 shadow-md">
          <Sparkles className="w-8 h-8 animate-spin" style={{ animationDuration: '6s' }} />
        </div>

        <h2 className="text-2xl font-extrabold text-[#202124] font-heading tracking-tight mb-2">
          Janseva Neural AI Processing
        </h2>
        <p className="text-xs text-[#5F6368] mb-8 max-w-md mx-auto">
          Deep multimodal assessment running server-side using Google Gemini 3.6 Flash.
        </p>

        {/* Stages Checklist */}
        <div className="space-y-3 max-w-lg mx-auto text-left mb-8">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isCompleted = progressStage > idx;
            const isCurrent = progressStage === idx;

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-between text-xs font-medium ${
                  isCompleted
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                    : isCurrent
                    ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-xs'
                    : 'bg-[#F8F9FA] border-[#DADCE0] text-[#5F6368] opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-blue-600 text-white animate-bounce'
                        : 'bg-[#DADCE0] text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span>{stage.label}</span>
                </div>

                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : isCurrent ? (
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full animate-pulse">
                    Analyzing...
                  </span>
                ) : (
                  <span className="text-[10px] text-[#5F6368]">Queued</span>
                )}
              </div>
            );
          })}
        </div>

        {/* AI Result Card once done */}
        {analysisResult && progressStage >= 4 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200 text-left space-y-4 mb-6"
          >
            <div className="flex items-center justify-between border-b border-blue-200 pb-3">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#2563EB]" />
                AI Verification Complete
              </span>
              <span className="text-xs font-extrabold text-[#2563EB] bg-white px-2.5 py-0.5 rounded-full border border-blue-200">
                {analysisResult.confidenceScore}% Confidence
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-[#5F6368] tracking-wider block">Generated Summary</span>
              <p className="text-xs text-[#202124] font-medium leading-relaxed mt-0.5">
                {analysisResult.summary}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="p-2 rounded-xl bg-white border border-blue-100">
                <span className="text-[10px] text-[#5F6368] block">Assigned Dept</span>
                <span className="text-xs font-bold text-[#202124] truncate block">{analysisResult.department}</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-blue-100">
                <span className="text-[10px] text-[#5F6368] block">Priority Level</span>
                <span className={`text-xs font-extrabold ${
                  analysisResult.priority === 'Critical' ? 'text-red-600' : 'text-amber-600'
                }`}>
                  {analysisResult.priority}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-blue-100">
                <span className="text-[10px] text-[#5F6368] block">Est. Resolution</span>
                <span className="text-xs font-bold text-[#16A34A] block">{analysisResult.estimatedDays} Days</span>
              </div>
            </div>

            <button
              onClick={onContinue}
              className="w-full py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs transition-transform active:scale-[0.98] shadow-sm"
            >
              Proceed to Review & Submit
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
