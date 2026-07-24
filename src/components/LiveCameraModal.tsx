import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, SwitchCamera, Check, RefreshCw, X, MapPin, 
  Sparkles, Upload, AlertCircle, ShieldCheck, CheckCircle2,
  SlidersHorizontal, Edit3
} from 'lucide-react';

import { fetchReverseGeocode } from '../utils/geolocation';

export interface CameraCapturedData {
  imagePreview: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  locationAddress: string;
  aiAnalysis?: {
    detectedCategory: string;
    detectedObjects: string[];
    confidenceScore: number;
    complaintSummary: string;
    severity: string;
    priority: string;
    recommendedDepartment: string;
    officerRecommendation: string;
  };
}

interface LiveCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaptureConfirm: (data: CameraCapturedData) => void;
}

export const LiveCameraModal: React.FC<LiveCameraModalProps> = ({
  isOpen,
  onClose,
  onCaptureConfirm,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  
  // Captured state
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedTimestamp, setCapturedTimestamp] = useState<string>('');
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number; address: string }>({
    lat: 12.9716,
    lng: 77.5946,
    address: 'Bengaluru Urban Ward 174',
  });
  const [isGpsLoading, setIsGpsLoading] = useState<boolean>(false);

  // Gemini AI Vision state
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);
  const [aiData, setAiData] = useState<CameraCapturedData['aiAnalysis'] | null>(null);
  const [isEditingSummary, setIsEditingSummary] = useState<boolean>(false);
  const [editedSummary, setEditedSummary] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      startCamera();
      acquireGPSLocation();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const acquireGPSLocation = () => {
    setIsGpsLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const geo = await fetchReverseGeocode(lat, lng);
          setGpsLocation({
            lat: lat,
            lng: lng,
            address: geo.address,
          });
          setIsGpsLoading(false);
        },
        (err) => {
          console.warn('GPS location fallback:', err.message);
          setGpsLocation({
            lat: 12.9716,
            lng: 77.5946,
            address: 'Ward 174, Bengaluru Urban (Default Geotag)',
          });
          setIsGpsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setIsGpsLoading(false);
    }
  };

  const startCamera = async () => {
    stopCamera();
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setIsCameraActive(true);
      setPermissionState('granted');

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera permission or availability issue:', err);
      setPermissionState('denied');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const toggleCameraFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // If user facing, mirror image horizontally
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

      const now = new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'medium',
      });

      setCapturedImage(dataUrl);
      setCapturedTimestamp(now);
      stopCamera();

      // Automatically trigger real Gemini Vision API analysis
      analyzeImageWithGemini(dataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const resultStr = event.target.result as string;
          const now = new Date().toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'medium',
          });
          setCapturedImage(resultStr);
          setCapturedTimestamp(now);
          stopCamera();
          analyzeImageWithGemini(resultStr);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImageWithGemini = async (imageBase64: string) => {
    setIsAiAnalyzing(true);
    setAiData(null);
    try {
      const res = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          location: gpsLocation.address,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setAiData(data.data);
        setEditedSummary(data.data.complaintSummary);
      }
    } catch (err) {
      console.error('Error analyzing image with Gemini:', err);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setAiData(null);
    startCamera();
  };

  const handleConfirmAndSave = () => {
    if (!capturedImage) return;

    onCaptureConfirm({
      imagePreview: capturedImage,
      latitude: gpsLocation.lat,
      longitude: gpsLocation.lng,
      timestamp: capturedTimestamp,
      locationAddress: gpsLocation.address,
      aiAnalysis: aiData ? {
        ...aiData,
        complaintSummary: editedSummary || aiData.complaintSummary,
      } : undefined,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-[#FFFFFF] border border-[#DADCE0] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#DADCE0] flex items-center justify-between bg-[#F8F9FA]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#202124]">Live Camera & AI Vision System</h3>
              <p className="text-xs text-[#5F6368]">Real-time geotagging & Gemini Computer Vision defect scan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 text-[#5F6368] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Stage Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {!capturedImage ? (
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video flex flex-col items-center justify-center border border-slate-800 shadow-inner">
              {permissionState === 'denied' ? (
                <div className="p-6 text-center space-y-3 max-w-md">
                  <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
                  <h4 className="text-base font-bold text-white">Camera Access Restricted</h4>
                  <p className="text-xs text-slate-300">
                    Please allow camera permissions in your browser or select an image file from your device gallery below.
                  </p>
                  <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs cursor-pointer shadow-sm">
                    <Upload className="w-4 h-4" />
                    <span>Upload Image from Gallery</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                  />

                  {/* Geotag Overlay Banner */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1.5 border border-white/20">
                      <MapPin className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                      <span>{isGpsLoading ? 'Detecting GPS coordinates...' : gpsLocation.address}</span>
                    </div>
                    <div className="px-2.5 py-1 rounded-full bg-blue-600/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                      {facingMode === 'user' ? 'Front Cam' : 'Rear Cam'}
                    </div>
                  </div>

                  {/* Camera Reticle / Target frame */}
                  <div className="absolute inset-0 border-2 border-white/30 rounded-2xl pointer-events-none flex items-center justify-center">
                    <div className="w-32 h-32 border-2 border-blue-400/70 rounded-2xl border-dashed animate-pulse" />
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Captured Preview Stage */
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-[#DADCE0] bg-black aspect-video">
                <img src={capturedImage} alt="Captured Defect" className="w-full h-full object-cover" />
                
                {/* Geotag Badge */}
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 border border-white/20">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Geotagged: {gpsLocation.lat.toFixed(4)}, {gpsLocation.lng.toFixed(4)} • {capturedTimestamp}</span>
                </div>
              </div>

              {/* Gemini Vision Analysis Loading */}
              {isAiAnalyzing && (
                <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full border-3 border-blue-600 border-t-transparent animate-spin mx-auto" />
                  <div>
                    <h4 className="text-sm font-bold text-blue-900 flex items-center justify-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-600 animate-bounce" />
                      Gemini Vision Neural Scan in Progress...
                    </h4>
                    <p className="text-xs text-blue-700 mt-1">
                      Identifying defect structure, severity, priority, and department routing.
                    </p>
                  </div>
                </div>
              )}

              {/* Gemini Vision Results Card */}
              {aiData && !isAiAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 border border-blue-200 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-blue-200/80 pb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                        Gemini AI Computer Vision Scan
                      </span>
                    </div>
                    <span className="text-xs bg-emerald-600 text-white font-bold px-2.5 py-0.5 rounded-full">
                      {aiData.confidenceScore}% Match Confidence
                    </span>
                  </div>

                  {/* Detected Tags */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-600 block mb-1">Detected Defect Objects:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {aiData.detectedObjects.map((obj, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-900 text-xs font-semibold shadow-2xs">
                          {obj}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Summary & Citizen Editable Box */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-slate-600">AI Complaint Summary (Editable):</label>
                      <button
                        onClick={() => setIsEditingSummary(!isEditingSummary)}
                        className="text-[11px] text-blue-600 font-semibold flex items-center gap-1 hover:underline"
                      >
                        <Edit3 className="w-3 h-3" />
                        {isEditingSummary ? 'Done Editing' : 'Edit Text'}
                      </button>
                    </div>

                    {isEditingSummary ? (
                      <textarea
                        value={editedSummary}
                        onChange={(e) => setEditedSummary(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-blue-300 bg-white text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                    ) : (
                      <p className="text-xs text-slate-800 font-medium bg-white/80 p-2.5 rounded-xl border border-slate-200">
                        {editedSummary || aiData.complaintSummary}
                      </p>
                    )}
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
                    <div className="p-2 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Recommended Dept</span>
                      <span className="font-bold text-slate-900">{aiData.recommendedDepartment}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Priority Level</span>
                      <span className="font-bold text-amber-600">{aiData.priority}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-slate-200 col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-slate-500 block">Officer Action Rec</span>
                      <span className="font-medium text-slate-800 text-[11px]">{aiData.officerRecommendation}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#DADCE0] bg-[#F8F9FA] flex items-center justify-between flex-wrap gap-2">
          {!capturedImage ? (
            <>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#DADCE0] bg-white hover:bg-[#F8F9FA] text-xs font-semibold text-[#202124] cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>Gallery</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>

                {isCameraActive && (
                  <button
                    onClick={toggleCameraFacingMode}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#DADCE0] bg-white hover:bg-[#F8F9FA] text-xs font-semibold text-[#202124]"
                  >
                    <SwitchCamera className="w-3.5 h-3.5 text-slate-600" />
                    <span>Switch Cam</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-[#DADCE0] text-xs font-semibold text-[#5F6368] hover:bg-[#F8F9FA]"
                >
                  Cancel
                </button>

                <button
                  onClick={handleCapturePhoto}
                  disabled={!isCameraActive}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-transform active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture Photo</span>
                </button>
              </div>
            </>
          ) : (
            <div className="w-full flex items-center justify-between">
              <button
                onClick={handleRetake}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#DADCE0] bg-white hover:bg-[#F8F9FA] text-xs font-semibold text-[#202124]"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                <span>Retake Photo</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-[#DADCE0] text-xs font-semibold text-[#5F6368] hover:bg-[#F8F9FA]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAndSave}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-transform active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Image & AI Scan</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
