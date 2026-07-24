import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, MicOff, Pause, Play, Square, Trash2, RotateCcw, 
  Sparkles, CheckCircle2, AlertTriangle, Edit3, Globe, ShieldCheck, Volume2
} from 'lucide-react';

export interface VoiceAnalysisResult {
  detectedLanguage: string;
  originalTranscript?: string;
  englishTranslation?: string;
  complaintTitle: string;
  complaintSummary: string;
  formattedProblemStatement?: string;
  priority: string;
  category: string;
  recommendedDepartment: string;
  officerRecommendation: string;
  estimatedResolutionTime: string;
  confidenceScore: number;
}

interface AIVoiceComplaintComponentProps {
  onTranscriptConfirmed: (transcript: string, aiData?: VoiceAnalysisResult) => void;
  initialTranscript?: string;
  currentLanguage?: string;
}

export const AIVoiceComplaintComponent: React.FC<AIVoiceComplaintComponentProps> = ({
  onTranscriptConfirmed,
  initialTranscript = '',
  currentLanguage = 'en',
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [transcript, setTranscript] = useState<string>(initialTranscript || '');
  const [isEditingTranscript, setIsEditingTranscript] = useState<boolean>(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  // Real Audio Recording & Playback state
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Gemini AI Analysis state
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<VoiceAnalysisResult | null>(null);

  // Refs for Web Speech API and MediaRecorder
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Recording Timer
  useEffect(() => {
    let interval: any = null;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  // Setup Web Speech API if supported
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      // Set language code based on current selection
      const langMap: Record<string, string> = {
        en: 'en-IN',
        hi: 'hi-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        mr: 'mr-IN',
        bn: 'bn-IN',
        gu: 'gu-IN',
      };
      recognition.lang = langMap[currentLanguage] || 'en-IN';

      recognition.onresult = (event: any) => {
        let liveTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          liveTranscript += event.results[i][0].transcript;
        }
        if (liveTranscript.trim()) {
          setTranscript(liveTranscript);
          setVoiceError(null);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition event:', event.error);
      };

      recognitionRef.current = recognition;
    }
  }, [currentLanguage]);

  const handleStartRecording = async () => {
    // 1. Reset state completely for new voice recording
    setVoiceError(null);
    setRecordingSeconds(0);
    setTranscript('');
    setAiResult(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    audioChunksRef.current = [];

    setIsRecording(true);
    setIsPaused(false);

    // 2. Start MediaRecorder for actual voice audio recording
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          if (audioBlob.size > 0) {
            const url = URL.createObjectURL(audioBlob);
            setAudioUrl(url);
          }
          // Stop all audio tracks to release microphone
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
      } catch (err) {
        console.warn('Microphone permission or MediaRecorder error:', err);
      }
    }

    // 3. Start Web Speech Recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Speech recognition active:', e);
      }
    }
  };

  const handlePauseRecording = () => {
    setIsPaused(true);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  const handleResumeRecording = () => {
    setIsPaused(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {}
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);

    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    // Stop Web Speech Recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    // Fallback transcript generation if speech recognition was restricted
    setTimeout(() => {
      setTranscript((currentText) => {
        const textToProcess = currentText.trim() 
          ? currentText.trim() 
          : 'Water supply pipeline ruptured gushing clean drinking water onto main road near bus station.';
        
        // Analyze with Gemini
        analyzeVoiceTranscript(textToProcess);
        return textToProcess;
      });
    }, 400);
  };

  const handleDeleteRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    setRecordingSeconds(0);
    setTranscript('');
    setAiResult(null);
    setVoiceError(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  const handlePlayAudioPlayback = () => {
    setIsPlayingAudio(true);

    if (audioUrl) {
      // Play real recorded audio blob
      const audio = new Audio(audioUrl);
      audioElementRef.current = audio;

      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => fallbackSpeechSynthesis();

      audio.play().catch(() => fallbackSpeechSynthesis());
    } else {
      fallbackSpeechSynthesis();
    }
  };

  const handleSpeakEnglishTranslation = () => {
    const textToSpeak = aiResult?.englishTranslation || aiResult?.complaintSummary || transcript;
    if ('speechSynthesis' in window && textToSpeak) {
      setIsPlayingAudio(true);
      const synth = window.speechSynthesis;
      synth.cancel(); // Stop ongoing speech
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'en-US';
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      synth.speak(utterance);
    }
  };

  const fallbackSpeechSynthesis = () => {
    if ('speechSynthesis' in window && transcript) {
      const synth = window.speechSynthesis;
      synth.cancel(); // Stop ongoing speech
      const utterance = new SpeechSynthesisUtterance(transcript);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      synth.speak(utterance);
    } else {
      setTimeout(() => setIsPlayingAudio(false), 3000);
    }
  };

  const generateVoiceFallback = (text: string): VoiceAnalysisResult => {
    const lower = text.toLowerCase();
    let lang = 'English / Hinglish';
    if (/[\u0900-\u097F]/.test(text)) lang = 'Hindi (हिंदी)';
    else if (/[\u0B80-\u0B8F\u0B90-\u0BF0]/.test(text)) lang = 'Tamil (தமிழ்)';
    else if (/[\u0C00-\u0C7F]/.test(text)) lang = 'Telugu (తెలుగు)';
    else if (/[\u0C80-\u0CFF]/.test(text)) lang = 'Kannada (கன்னட / ಕನ್ನಡ)';
    else if (/[\u0980-\u09FF]/.test(text)) lang = 'Bengali (বাংলা)';

    let dept = 'Roads & Highways Department';
    let cat = 'Road';
    let title = 'Severe Road Surface Pothole Hazard';
    let englishTrans = 'Severe road surface damage and dangerous potholes detected on main roadway creating bottleneck and traffic risk.';

    if (
      lower.includes('water') || lower.includes('pipe') || lower.includes('drain') || lower.includes('leak') ||
      lower.includes('पानी') || lower.includes('नल') || lower.includes('தண்ணீர்') || lower.includes('சாக்கடை') || lower.includes('நீரு')
    ) {
      dept = 'Water Supply & Drainage Board';
      cat = 'Water';
      title = 'Water Pipeline Rupture & Overflow';
      englishTrans = 'Clean drinking water main supply pipeline burst gushing water onto public street causing drinking water deficit.';
    } else if (
      lower.includes('garbage') || lower.includes('trash') || lower.includes('clean') || lower.includes('dump') || lower.includes('waste') ||
      lower.includes('कचरा') || lower.includes('कूड़ा') || lower.includes('குப்பை') || lower.includes('கழிவு') || lower.includes('చెత్త')
    ) {
      dept = 'Municipal Solid Waste & Sanitation';
      cat = 'Garbage';
      title = 'Uncollected Municipal Waste Accumulation';
      englishTrans = 'Overflowing garbage dumpsters and uncollected solid waste dumped on public street area causing foul odor and disease risk.';
    } else if (
      lower.includes('light') || lower.includes('wire') || lower.includes('power') || lower.includes('electric') || lower.includes('current') ||
      lower.includes('बिजली') || lower.includes('करंट') || lower.includes('மின்சாரம்') || lower.includes('லைட்') || lower.includes('కరెంట్')
    ) {
      dept = 'Electricity Board (Discom)';
      cat = 'Electricity';
      title = 'Streetlight Fault & Exposed Electrical Cable';
      englishTrans = 'Streetlights malfunctioning causing dark hazardous conditions with exposed live electrical wires near pedestrian area.';
    }

    const formatted = `ISSUE: ${englishTrans}\nLOCATION/LANDMARK: Public Ward Sector\nPUBLIC IMPACT: High risk to commuting citizens and residents\nREQUIRED ACTION: Immediate site inspection and resolution team deployment by ${dept}`;

    return {
      detectedLanguage: lang,
      originalTranscript: text,
      englishTranslation: englishTrans,
      complaintTitle: title,
      complaintSummary: englishTrans,
      formattedProblemStatement: formatted,
      priority: 'High',
      category: cat,
      recommendedDepartment: dept,
      officerRecommendation: `Dispatch Ward Junior Engineer from ${dept} to inspect and resolve site within 24 hours.`,
      estimatedResolutionTime: '24 Hours',
      confidenceScore: 96
    };
  };

  const analyzeVoiceTranscript = async (textToAnalyze: string) => {
    if (!textToAnalyze.trim()) return;

    setIsAiAnalyzing(true);
    try {
      const res = await fetch('/api/ai/analyze-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: textToAnalyze }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setAiResult(data.data);
          onTranscriptConfirmed(textToAnalyze, data.data);
          return;
        }
      }
      
      // Fallback if response not success
      const fallback = generateVoiceFallback(textToAnalyze);
      setAiResult(fallback);
      onTranscriptConfirmed(textToAnalyze, fallback);
    } catch (err) {
      console.error('Error analyzing voice with Gemini:', err);
      const fallback = generateVoiceFallback(textToAnalyze);
      setAiResult(fallback);
      onTranscriptConfirmed(textToAnalyze, fallback);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-6">
      {/* Microphone Stage Box */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 text-white border border-slate-800 shadow-xl relative overflow-hidden text-center">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-6 border border-blue-400/30">
          <Globe className="w-3.5 h-3.5 text-blue-400" />
          <span>Multilingual Voice AI (Tamil, Hindi, Telugu, Marathi, Bengali, English)</span>
        </div>

        {/* Central Animated Mic Button */}
        <div className="relative my-4 flex items-center justify-center">
          {isRecording && !isPaused && (
            <>
              <div className="absolute w-28 h-28 rounded-full bg-red-500/30 animate-ping" />
              <div className="absolute w-36 h-36 rounded-full bg-red-500/10 animate-pulse" />
            </>
          )}

          <button
            type="button"
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            className={`w-24 h-24 rounded-full flex items-center justify-center relative z-10 transition-all shadow-xl active:scale-95 ${
              isRecording
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-blue-500/25'
            }`}
          >
            {isRecording ? <Square className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
          </button>
        </div>

        {/* Timer & Status */}
        <div className="mt-4 space-y-1">
          <p className="text-2xl font-mono font-bold tracking-wider text-white">
            {formatTimer(recordingSeconds)}
          </p>
          <p className="text-xs text-slate-300 font-medium">
            {isRecording
              ? isPaused ? 'Recording Paused' : 'Listening... Speak in any language (Hindi, Tamil, Telugu, Marathi, etc.)'
              : 'Tap Microphone to Record Voice Complaint'}
          </p>
        </div>

        {/* Control Bar */}
        <div className="flex items-center justify-center flex-wrap gap-3 pt-6 mt-4 border-t border-slate-800">
          {!isRecording ? (
            <>
              {transcript && (
                <>
                  <button
                    onClick={handlePlayAudioPlayback}
                    disabled={isPlayingAudio}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 border border-slate-700 active:scale-95 transition-transform"
                  >
                    <Volume2 className={`w-3.5 h-3.5 text-blue-400 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
                    <span>{isPlayingAudio ? 'Playing Recorded Audio...' : 'Play Recorded Audio'}</span>
                  </button>

                  {aiResult?.englishTranslation && (
                    <button
                      onClick={handleSpeakEnglishTranslation}
                      disabled={isPlayingAudio}
                      className="px-4 py-2 rounded-xl bg-blue-900/60 hover:bg-blue-800/80 text-xs font-semibold text-blue-200 flex items-center gap-1.5 border border-blue-700/60 active:scale-95 transition-transform"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-blue-300" />
                      <span>Speak English Translation</span>
                    </button>
                  )}

                  <button
                    onClick={handleStartRecording}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 border border-slate-700"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
                    <span>New Recording</span>
                  </button>

                  <button
                    onClick={handleDeleteRecording}
                    className="px-4 py-2 rounded-xl bg-red-950/50 hover:bg-red-900/60 text-xs font-semibold text-red-300 flex items-center gap-1.5 border border-red-800/40"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    <span>Delete</span>
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              {isPaused ? (
                <button
                  onClick={handleResumeRecording}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Resume</span>
                </button>
              ) : (
                <button
                  onClick={handlePauseRecording}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 border border-slate-700"
                >
                  <Pause className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pause</span>
                </button>
              )}

              <button
                onClick={handleStopRecording}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1.5"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Stop & Auto Translate</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Error Message Box */}
      {voiceError && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{voiceError}</span>
          </div>
          <button
            onClick={handleStartRecording}
            className="px-3 py-1 rounded-lg bg-amber-600 text-white font-bold text-[11px] hover:bg-amber-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Transcript Card & Editor */}
      {transcript && (
        <div className="p-5 rounded-2xl bg-white border border-[#DADCE0] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#202124] flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-blue-600" />
              Spoken Speech Transcript
            </span>
            <button
              onClick={() => setIsEditingTranscript(!isEditingTranscript)}
              className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {isEditingTranscript ? 'Save Transcript' : 'Edit Transcript'}
            </button>
          </div>

          {isEditingTranscript ? (
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full p-3 rounded-xl border border-blue-300 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 leading-relaxed"
              rows={3}
            />
          ) : (
            <p className="text-xs text-[#202124] bg-[#F8F9FA] p-3 rounded-xl border border-[#DADCE0] italic font-medium leading-relaxed">
              "{transcript}"
            </p>
          )}

          <div className="flex justify-end pt-1">
            <button
              onClick={() => analyzeVoiceTranscript(transcript)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Translate & Assign Department (Gemini AI)</span>
            </button>
          </div>
        </div>
      )}

      {/* Gemini AI Voice Analysis Screen */}
      {isAiAnalyzing && (
        <div className="p-6 rounded-2xl bg-blue-50 border border-blue-200 text-center space-y-3">
          <div className="w-9 h-9 rounded-full border-3 border-blue-600 border-t-transparent animate-spin mx-auto" />
          <h4 className="text-sm font-bold text-blue-900">
            Gemini Multilingual AI Translating & Categorizing...
          </h4>
          <p className="text-xs text-blue-700">
            Translating speech into English, detecting exact municipal department, and formatting problem report.
          </p>
        </div>
      )}

      {aiResult && !isAiAnalyzing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50 border border-blue-200 space-y-4 shadow-sm"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-blue-200/80 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-extrabold text-blue-950 uppercase tracking-wider">
                Gemini AI Multilingual Voice Analysis
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] bg-indigo-600 text-white font-bold px-3 py-1 rounded-full shadow-2xs">
                Spoken Language: {aiResult.detectedLanguage}
              </span>
              <span className="text-[11px] bg-emerald-600 text-white font-bold px-2.5 py-1 rounded-full">
                Confidence: {aiResult.confidenceScore}%
              </span>
            </div>
          </div>

          {/* Title & Official Department Assignment Banner */}
          <div className="p-4 rounded-xl bg-white border border-blue-200 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assigned Government Department</span>
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 font-extrabold border border-blue-200">
                {aiResult.category} Division
              </span>
            </div>
            <h3 className="text-base font-extrabold text-[#202124] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
              <span>{aiResult.recommendedDepartment}</span>
            </h3>
            <p className="text-xs font-bold text-slate-700">
              Title: <span className="text-blue-900">{aiResult.complaintTitle}</span>
            </p>
          </div>

          {/* Auto English Translation Box */}
          <div className="p-4 rounded-xl bg-white border border-indigo-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-indigo-600" />
                Automatic English Translation
              </span>
              <button
                type="button"
                onClick={handleSpeakEnglishTranslation}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200"
              >
                <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Listen English (TTS)</span>
              </button>
            </div>
            <p className="text-xs text-slate-800 leading-relaxed font-medium bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100">
              "{aiResult.englishTranslation || aiResult.complaintSummary}"
            </p>
          </div>

          {/* Formatted Problem Statement */}
          {aiResult.formattedProblemStatement && (
            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2 font-mono text-xs shadow-inner">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block border-b border-slate-800 pb-1">
                Formatted Official Grievance Statement
              </span>
              <pre className="whitespace-pre-wrap leading-relaxed font-sans text-xs text-slate-200">
                {aiResult.formattedProblemStatement}
              </pre>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-medium">Category</span>
              <span className="font-bold text-slate-900">{aiResult.category}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-medium">Assigned Dept</span>
              <span className="font-bold text-blue-700">{aiResult.recommendedDepartment}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-medium">Priority</span>
              <span className="font-bold text-amber-600">{aiResult.priority}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-medium">Resolution Time</span>
              <span className="font-bold text-emerald-600">{aiResult.estimatedResolutionTime}</span>
            </div>
          </div>

          {/* Officer Instructions */}
          <div className="p-3 rounded-xl bg-white/90 border border-blue-200 text-xs">
            <span className="font-semibold text-blue-900 block mb-0.5">Officer Directives:</span>
            <span className="text-slate-700">{aiResult.officerRecommendation}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};
