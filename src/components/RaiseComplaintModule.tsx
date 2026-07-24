import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Car, Droplets, Trash2, Zap, Activity, ShieldAlert, HelpCircle,
  Camera, Upload, Mic, MicOff, Play, Square, MapPin, Sparkles, CheckCircle2,
  ArrowRight, ArrowLeft, RefreshCw, Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CATEGORY_OPTIONS, SAMPLE_COMPLAINT_PRESETS } from '../data/departments';
import { AIAnalysisResult, Complaint, LanguageCode, UserProfile } from '../types';
import { getTranslation } from '../data/translations';
import { AIProcessingScreen } from './AIProcessingScreen';
import { LiveCameraModal, CameraCapturedData } from './LiveCameraModal';
import { AIVoiceComplaintComponent } from './AIVoiceComplaintComponent';
import { fetchReverseGeocode } from '../utils/geolocation';

interface RaiseComplaintModuleProps {
  onComplaintCreated: (complaint: Complaint) => void;
  onNavigateToTracking: (id: string) => void;
  currentLanguage?: LanguageCode;
  currentUser?: UserProfile;
}

export const RaiseComplaintModule: React.FC<RaiseComplaintModuleProps> = ({
  onComplaintCreated,
  onNavigateToTracking,
  currentLanguage = 'en',
  currentUser,
}) => {
  const [step, setStep] = useState<number>(1);

  // Form State
  const [selectedCategory, setSelectedCategory] = useState<string>('Road');
  const [imagePreview, setImagePreview] = useState<string>(SAMPLE_COMPLAINT_PRESETS[0].image);
  
  // Camera Modal State
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState<boolean>(false);

  // Voice State
  const [voiceText, setVoiceText] = useState<string>('Deep pothole spanning across left lane creating heavy traffic bottleneck near Koramangala junction.');

  // Description & AI
  const [description, setDescription] = useState<string>('Large deep pothole spanning across left lane creating heavy traffic bottleneck and posing severe accident risk for two-wheelers during night hours.');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [aiProgressStage, setAiProgressStage] = useState<number>(0);

  // Location State
  const [locationData, setLocationData] = useState({
    address: 'Outer Ring Rd, Koramangala Junction',
    city: 'Bengaluru',
    state: 'Karnataka',
    lat: 12.9352,
    lng: 77.6245,
  });
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);

  // Final submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdComplaintId, setCreatedComplaintId] = useState<string | null>(null);

  // Auto-detect GPS location on mount for accurate geotagging
  useEffect(() => {
    handleGpsDetect();
  }, []);

  // Handle camera capture confirmation
  const handleLiveCameraConfirm = (data: CameraCapturedData) => {
    setImagePreview(data.imagePreview);
    setLocationData({
      address: data.locationAddress,
      city: 'Bengaluru',
      state: 'Karnataka',
      lat: data.latitude,
      lng: data.longitude,
    });

    if (data.aiAnalysis) {
      if (data.aiAnalysis.detectedCategory) {
        if (data.aiAnalysis.detectedCategory.includes('Road')) setSelectedCategory('Road');
        else if (data.aiAnalysis.detectedCategory.includes('Water')) setSelectedCategory('Water');
        else if (data.aiAnalysis.detectedCategory.includes('Garbage')) setSelectedCategory('Garbage');
        else if (data.aiAnalysis.detectedCategory.includes('Light') || data.aiAnalysis.detectedCategory.includes('Electric')) setSelectedCategory('Electricity');
      }

      setAiResult({
        summary: data.aiAnalysis.complaintSummary,
        priority: data.aiAnalysis.priority || 'High',
        department: data.aiAnalysis.recommendedDepartment || 'Roads & Highways',
        confidenceScore: data.aiAnalysis.confidenceScore || 97,
        estimatedDays: 2,
        detectedObjects: data.aiAnalysis.detectedObjects || ['Civic Infrastructure Anomaly'],
        duplicateDetected: false,
        duplicateMatchId: null,
        suggestedAction: data.aiAnalysis.officerRecommendation || 'Inspect location site and dispatch crew.'
      });

      if (data.aiAnalysis.complaintSummary) {
        setDescription(data.aiAnalysis.complaintSummary);
      }
    }
  };

  // Category Icon Map
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Car': return Car;
      case 'Droplets': return Droplets;
      case 'Trash2': return Trash2;
      case 'Zap': return Zap;
      case 'Activity': return Activity;
      case 'ShieldAlert': return ShieldAlert;
      default: return HelpCircle;
    }
  };

  const handleGpsDetect = () => {
    setIsDetectingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const geo = await fetchReverseGeocode(lat, lng);
          setLocationData({
            address: geo.address,
            city: geo.city,
            state: geo.state,
            lat: lat,
            lng: lng,
          });
          setIsDetectingGps(false);
        },
        () => {
          // Fallback location
          setLocationData({
            address: 'Outer Ring Rd, Koramangala Junction',
            city: 'Bengaluru',
            state: 'Karnataka',
            lat: 12.9352,
            lng: 77.6245,
          });
          setIsDetectingGps(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setIsDetectingGps(false);
    }
  };

  // Trigger Gemini AI Server Analysis
  const runAiAnalysis = async () => {
    setIsAiAnalyzing(true);
    setAiProgressStage(0);

    // Step-by-step progress simulation
    const interval = setInterval(() => {
      setAiProgressStage((prev) => {
        if (prev >= 3) {
          clearInterval(interval);
          return 4;
        }
        return prev + 1;
      });
    }, 700);

    try {
      const res = await fetch('/api/ai/analyze-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description || voiceText,
          category: selectedCategory,
          location: `${locationData.address}, ${locationData.city}`,
          imageBase64: imagePreview,
          voiceText,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAiResult(data.data);
      }
    } catch (err) {
      console.error('AI error:', err);
    } finally {
      setTimeout(() => {
        setIsAiAnalyzing(false);
      }, 3000);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        title: `${selectedCategory} Issue at ${locationData.city}`,
        category: selectedCategory,
        department: aiResult?.department || 'Roads & Highways',
        priority: aiResult?.priority || 'High',
        location: locationData,
        image: imagePreview,
        voiceText,
        description,
        aiSummary: aiResult?.summary || description,
        detectedObjects: aiResult?.detectedObjects || ['Civic Infrastructure Defect'],
        confidenceScore: aiResult?.confidenceScore || 96,
        estimatedDays: aiResult?.estimatedDays || 2,
        userId: currentUser?.id || `USR-${Date.now()}`,
        submittedBy: {
          name: currentUser?.name || 'Citizen User',
          phone: currentUser?.phone || '+91 98765 43210',
          email: currentUser?.email || '',
          userId: currentUser?.id || '',
          anonymous: false,
        },
      };

      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        onComplaintCreated(data.data);
        setCreatedComplaintId(data.data.id);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        setStep(6);
      }
    } catch (err) {
      alert('Error registering complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header Stepper Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">
            Step {step} of 6
          </span>
          <span className="text-xs font-medium text-[#5F6368]">
            {step === 1 && 'Select Category'}
            {step === 2 && 'Upload Image Proof'}
            {step === 3 && 'Voice Input'}
            {step === 4 && 'Description & AI Verification'}
            {step === 5 && 'Location Pinning'}
            {step === 6 && 'Complaint Registered'}
          </span>
        </div>
        <div className="w-full h-1.5 bg-[#DADCE0] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2563EB] transition-all duration-300 rounded-full"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: SELECT CATEGORY */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-6"
          >
            <div className="border-b border-[#DADCE0] pb-4">
              <h2 className="text-2xl font-extrabold text-[#202124] font-heading">
                Step 1: Select Complaint Category
              </h2>
              <p className="text-xs text-[#5F6368] mt-1">
                Choose the primary category for automatic department routing.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {CATEGORY_OPTIONS.map((cat) => {
                const Icon = getCategoryIcon(cat.icon);
                const isSelected = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-5 rounded-2xl border text-left transition-all relative ${
                      isSelected
                        ? 'border-[#2563EB] bg-blue-50/60 shadow-xs'
                        : 'border-[#DADCE0] bg-white hover:border-blue-200'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                        isSelected ? 'bg-[#2563EB] text-white' : 'bg-blue-50 text-[#2563EB]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-[#202124]">{cat.name}</h3>
                    <p className="text-[11px] text-[#5F6368] mt-0.5">Auto-route: {cat.defaultDept}</p>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-[#2563EB] absolute top-4 right-4" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs transition-transform active:scale-95 shadow-xs"
              >
                <span>Continue to Photo Upload</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: UPLOAD IMAGE / LIVE CAMERA */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-6"
          >
            <div className="border-b border-[#DADCE0] pb-4 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-2xl font-extrabold text-[#202124] font-heading">
                  Step 2: Live Camera & Photo Proof
                </h2>
                <p className="text-xs text-[#5F6368] mt-1">
                  Capture live photo with auto GPS geotag or upload from gallery for Gemini Vision AI analysis.
                </p>
              </div>

              {/* Prominent Live Camera Button */}
              <button
                type="button"
                onClick={() => setIsLiveCameraOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-transform active:scale-95"
              >
                <Camera className="w-4 h-4 text-white animate-pulse" />
                <span>Launch Live Camera System</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              {/* Upload & Live Cam Options */}
              <div className="space-y-4">
                <div 
                  onClick={() => setIsLiveCameraOpen(true)}
                  className="border-2 border-dashed border-[#2563EB] hover:border-blue-700 rounded-2xl p-6 text-center bg-blue-50/40 hover:bg-blue-50/80 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-[#202124]">Capture with Live Device Camera</p>
                  <p className="text-xs text-[#5F6368] mt-1">
                    Auto Front/Rear cam, GPS geotag & Gemini AI Vision object detection
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs">
                    Open Camera Mode
                  </span>
                </div>

                <div className="p-4 rounded-2xl border border-[#DADCE0] bg-[#F8F9FA] text-center">
                  <span className="text-xs font-semibold text-[#5F6368] block mb-2">Or Upload from Device Gallery:</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            setImagePreview(event.target.result as string);
                          }
                        };
                        reader.readAsDataURL(file);
                        handleGpsDetect();
                      }
                    }}
                    className="hidden"
                    id="image-file-input"
                  />
                  <label
                    htmlFor="image-file-input"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#DADCE0] text-xs font-semibold text-[#202124] hover:bg-slate-100 cursor-pointer shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Choose Local Image File</span>
                  </label>
                </div>

                {/* Preset sample photos */}
                <div>
                  <span className="text-xs font-bold text-[#5F6368] block mb-2">Or select sample preset:</span>
                  <div className="grid grid-cols-3 gap-2">
                    {SAMPLE_COMPLAINT_PRESETS.map((preset, idx) => (
                      <img
                        key={idx}
                        src={preset.image}
                        alt="Preset"
                        onClick={() => {
                          setImagePreview(preset.image);
                          setDescription(preset.description);
                          setSelectedCategory(preset.category);
                        }}
                        className={`h-20 w-full object-cover rounded-xl border-2 cursor-pointer transition-transform hover:scale-105 ${
                          imagePreview === preset.image ? 'border-[#2563EB] shadow-xs' : 'border-transparent opacity-70'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Image Preview Box */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-[#202124] block">Image Preview & AI Scanner</span>
                <div className="relative rounded-2xl overflow-hidden border border-[#DADCE0] bg-black aspect-video flex items-center justify-center">
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Complaint Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white text-xs flex items-center justify-between">
                        <span className="flex items-center gap-1 font-semibold">
                          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                          Geotag & Vision Scanner Active
                        </span>
                        <span className="text-[10px] bg-blue-600 px-2 py-0.5 rounded-full font-mono">OK</span>
                      </div>
                    </>
                  ) : (
                    <span className="text-xs text-white/60">No image selected</span>
                  )}
                </div>
              </div>

            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#DADCE0]">
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1 px-4 py-2.5 rounded-xl border border-[#DADCE0] text-xs font-medium text-[#202124] hover:bg-[#F8F9FA]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs transition-transform active:scale-95 shadow-xs"
              >
                <span>Continue to Voice Input</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: VOICE INPUT */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-6"
          >
            <div className="border-b border-[#DADCE0] pb-4">
              <h2 className="text-2xl font-extrabold text-[#202124] font-heading">
                Step 3: Multilingual Voice Complaint Registration
              </h2>
              <p className="text-xs text-[#5F6368] mt-1">
                Speak in Hindi, English, Tamil, Telugu, Kannada, Marathi, etc. Web Speech API auto-transcribes into text.
              </p>
            </div>

            <AIVoiceComplaintComponent
              initialTranscript={voiceText}
              currentLanguage={currentLanguage}
              onTranscriptConfirmed={(transcriptText, voiceAiData) => {
                setVoiceText(transcriptText);
                
                // Populate English description with formatted problem statement or translation
                if (voiceAiData?.formattedProblemStatement) {
                  setDescription(voiceAiData.formattedProblemStatement);
                } else if (voiceAiData?.englishTranslation) {
                  setDescription(voiceAiData.englishTranslation);
                } else if (voiceAiData?.complaintSummary) {
                  setDescription(voiceAiData.complaintSummary);
                } else if (transcriptText) {
                  setDescription(transcriptText);
                }

                if (voiceAiData?.category) {
                  setSelectedCategory(voiceAiData.category);
                }

                if (voiceAiData) {
                  setAiResult({
                    summary: voiceAiData.englishTranslation || voiceAiData.complaintSummary || transcriptText,
                    priority: (voiceAiData.priority as any) || 'High',
                    department: voiceAiData.recommendedDepartment || 'Roads & Highways Department',
                    confidenceScore: voiceAiData.confidenceScore || 96,
                    estimatedDays: 2,
                    detectedObjects: [
                      voiceAiData.category ? `${voiceAiData.category} Issue` : 'Voice Grievance',
                      `Spoken Language: ${voiceAiData.detectedLanguage || 'Regional Speech'}`,
                      'Auto Translated to English',
                      'Geotagged'
                    ],
                    duplicateDetected: false,
                    duplicateMatchId: null,
                    suggestedAction: voiceAiData.officerRecommendation || 'Inspect location site and dispatch crew.'
                  });
                }
              }}
            />

            <div className="flex items-center justify-between pt-4 border-t border-[#DADCE0]">
              <button
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1 px-4 py-2.5 rounded-xl border border-[#DADCE0] text-xs font-medium text-[#202124] hover:bg-[#F8F9FA]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={() => {
                  setStep(4);
                  runAiAnalysis();
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs transition-transform active:scale-95 shadow-xs"
              >
                <span>AI Verification & Summary</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: DESCRIPTION & AI SUMMARY */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-6"
          >
            <div className="border-b border-[#DADCE0] pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-[#202124] font-heading">
                  Step 4: AI Analysis & Description
                </h2>
                <p className="text-xs text-[#5F6368] mt-1">
                  Gemini 3.6 Neural AI summarizes the defect and auto-assigns priority.
                </p>
              </div>
              <button
                onClick={runAiAnalysis}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DADCE0] text-xs font-semibold text-[#2563EB] hover:bg-blue-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-run AI Scan</span>
              </button>
            </div>

            {isAiAnalyzing ? (
              <AIProcessingScreen
                progressStage={aiProgressStage}
                analysisResult={aiResult}
                onContinue={() => setIsAiAnalyzing(false)}
              />
            ) : (
              <div className="space-y-4">
                
                {/* AI Summary Box */}
                {aiResult && (
                  <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#2563EB]" />
                        Janseva AI Assessment
                      </span>
                      <span className="text-[11px] font-bold text-[#2563EB] bg-white px-2.5 py-0.5 rounded-full border border-blue-200">
                        {aiResult.confidenceScore}% Confidence
                      </span>
                    </div>

                    <p className="text-xs text-[#202124] font-medium leading-relaxed">
                      {aiResult.summary}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {aiResult.detectedObjects?.map((obj, i) => (
                        <span key={i} className="text-[10px] bg-white text-blue-900 font-semibold px-2 py-1 rounded-md border border-blue-200">
                          ✓ {obj}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Editable Description */}
                <div>
                  <label className="block text-xs font-bold text-[#202124] mb-1">
                    Detailed Complaint Notes (Editable by Citizen)
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3.5 rounded-xl border border-[#DADCE0] focus:border-[#2563EB] focus:outline-hidden text-xs text-[#202124] leading-relaxed"
                    placeholder="Describe the complaint details..."
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#DADCE0]">
                  <button
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-1 px-4 py-2.5 rounded-xl border border-[#DADCE0] text-xs font-medium text-[#202124] hover:bg-[#F8F9FA]"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    onClick={() => setStep(5)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs transition-transform active:scale-95 shadow-xs"
                  >
                    <span>Continue to Location Selection</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* STEP 5: LOCATION */}
        {step === 5 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-6"
          >
            <div className="border-b border-[#DADCE0] pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-[#202124] font-heading">
                  Step 5: Geotag & Location Selection
                </h2>
                <p className="text-xs text-[#5F6368] mt-1">
                  GPS coordinates automatically pinpoint municipal jurisdiction and ward officer.
                </p>
              </div>
              <button
                onClick={handleGpsDetect}
                disabled={isDetectingGps}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-[#2563EB] hover:bg-blue-100"
              >
                <MapPin className="w-4 h-4" />
                <span>{isDetectingGps ? 'Locating...' : 'Detect GPS Location'}</span>
              </button>
            </div>

            {/* Interactive Location Form & Map Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#202124] mb-1">Street Address / Landmark</label>
                  <input
                    type="text"
                    value={locationData.address}
                    onChange={(e) => setLocationData({ ...locationData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DADCE0] text-xs font-medium focus:border-[#2563EB] focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#202124] mb-1">City / District</label>
                    <input
                      type="text"
                      value={locationData.city}
                      onChange={(e) => setLocationData({ ...locationData, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#DADCE0] text-xs font-medium focus:border-[#2563EB] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#202124] mb-1">State</label>
                    <input
                      type="text"
                      value={locationData.state}
                      onChange={(e) => setLocationData({ ...locationData, state: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#DADCE0] text-xs font-medium focus:border-[#2563EB] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#DADCE0] text-xs space-y-1">
                  <span className="text-[10px] font-bold text-[#5F6368] uppercase">Geospatial Coordinates</span>
                  <div className="flex items-center justify-between font-mono text-[#202124] text-[11px]">
                    <span>LAT: {locationData.lat.toFixed(4)}</span>
                    <span>LNG: {locationData.lng.toFixed(4)}</span>
                  </div>
                </div>
              </div>

              {/* Map Preview Canvas */}
              <div className="rounded-2xl border border-[#DADCE0] overflow-hidden bg-slate-100 relative min-h-[200px] flex items-center justify-center p-4">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-[#2563EB] text-white flex items-center justify-center mx-auto shadow-lg animate-bounce">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-[#202124] block">{locationData.address}</span>
                  <span className="text-[10px] text-[#5F6368] block">{locationData.city}, {locationData.state}</span>
                </div>
              </div>

            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#DADCE0]">
              <button
                onClick={() => setStep(4)}
                className="inline-flex items-center gap-1 px-4 py-2.5 rounded-xl border border-[#DADCE0] text-xs font-medium text-[#202124] hover:bg-[#F8F9FA]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white font-bold text-xs transition-transform active:scale-95 shadow-md disabled:opacity-70"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Registering...' : 'Register Complaint Now'}</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 6: SUCCESS */}
        {step === 6 && (
          <motion.div
            key="step6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-10 px-4 max-w-xl mx-auto space-y-6"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-[#16A34A] flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-extrabold uppercase tracking-wider mb-2">
                Official Complaint Registered
              </span>
              <h2 className="text-3xl font-extrabold text-[#202124] font-heading">
                ID: {createdComplaintId}
              </h2>
              <p className="text-xs text-[#5F6368] mt-2 leading-relaxed">
                Your grievance has been verified by Janseva Neural AI and dispatched directly to the municipal officer in charge.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#DADCE0] text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#5F6368]">Assigned Department:</span>
                <strong className="text-[#202124]">{aiResult?.department || 'Roads & Highways'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5F6368]">Estimated Resolution:</span>
                <strong className="text-[#16A34A]">Within 24-48 Hours</strong>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  if (createdComplaintId) onNavigateToTracking(createdComplaintId);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
              >
                <span>Track Complaint Live</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setStep(1);
                  setCreatedComplaintId(null);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#DADCE0] hover:bg-[#F8F9FA] text-[#202124] font-bold text-xs"
              >
                Raise Another Complaint
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Camera Modal */}
      <LiveCameraModal
        isOpen={isLiveCameraOpen}
        onClose={() => setIsLiveCameraOpen(false)}
        onCaptureConfirm={handleLiveCameraConfirm}
      />
    </div>
  );
};
