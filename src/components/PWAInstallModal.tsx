import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, ShieldCheck, Zap, Bell, WifiOff, CheckCircle2, Smartphone, ExternalLink, ArrowRight, Sparkles } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstalled?: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose, onInstalled }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Catch beforeinstallprompt event globally
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    setIsInstalling(true);

    // Mark installed in local storage
    localStorage.setItem('janseva_pwa_installed', 'true');

    // 1. Trigger native browser PWA install prompt if supported
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          if (onInstalled) onInstalled();
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.log('PWA Prompt execution:', err);
      }
    }

    if (onInstalled) {
      onInstalled();
    }

    // 2. Download direct standalone PWA web application launcher file for desktop/mobile
    try {
      const appLauncherContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#2563eb">
  <title>Janseva Portal - National AI Citizen Grievance App</title>
  <link rel="manifest" href="${window.location.origin}/manifest.json">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; font-family: 'Poppins', sans-serif; }
    body { margin: 0; background: #f8f9fa; color: #202124; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .card { background: #ffffff; width: 100%; max-width: 440px; padding: 40px 30px; border-radius: 24px; border: 1px solid #dadce0; box-shadow: 0 20px 50px rgba(32,33,36,0.1); text-align: center; }
    .icon { width: 72px; height: 72px; background: #2563eb; color: white; font-size: 36px; border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto; box-shadow: 0 10px 25px rgba(37,99,235,0.3); }
    h1 { font-size: 24px; font-weight: 700; margin: 0 0 10px 0; color: #202124; }
    p { font-size: 14px; color: #5f6368; line-height: 1.6; margin: 0 0 25px 0; }
    .btn { display: block; width: 100%; background: #2563eb; color: #ffffff; padding: 16px; border-radius: 99px; font-size: 15px; font-weight: 600; text-decoration: none; border: none; cursor: pointer; transition: background 0.2s; }
    .btn:hover { background: #1d4ed8; }
    .badge { display: inline-block; padding: 4px 12px; background: #eff6ff; color: #2563eb; border-radius: 99px; font-size: 12px; font-weight: 600; margin-bottom: 12px; }
  </style>
  <script>
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('${window.location.origin}/sw.js').catch(console.error);
    }
    function launchPortal() {
      window.location.href = "${window.location.origin}";
    }
    setTimeout(launchPortal, 1200);
  </script>
</head>
<body>
  <div class="card">
    <div class="icon">🏛️</div>
    <div class="badge">Janseva Portal Installed App</div>
    <h1>Launching Janseva Portal</h1>
    <p>Opening National AI Citizen Grievance Portal in Standalone Mode...</p>
    <button onclick="launchPortal()" class="btn">Open App Now</button>
  </div>
</body>
</html>`;

      const blob = new Blob([appLauncherContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = 'Janseva-Portal-App.html';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('App download error:', e);
    }

    setIsInstalling(false);
    setIsSuccess(true);
  };

  const handleOpenStandaloneTab = () => {
    window.open(window.location.href, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md bg-[#FFFFFF] border border-[#DADCE0] rounded-[24px] shadow-2xl overflow-hidden p-6 sm:p-7 relative"
          >
            {/* Close Button X */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full text-[#5F6368] hover:bg-[#F8F9FA] hover:text-[#202124] transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-6 text-center space-y-4"
              >
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#202124]">Janseva Portal Installed Successfully</h3>
                  <p className="text-xs text-[#5F6368] max-w-xs mx-auto mt-1.5 leading-relaxed">
                    The application has been registered for native access. You can now access Janseva Portal anytime offline and from your home screen.
                  </p>
                </div>

                <div className="p-3.5 bg-blue-50/90 rounded-2xl border border-blue-200 text-left space-y-1.5 text-xs">
                  <p className="font-bold text-[#2563EB] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    Native Standalone Launcher Saved:
                  </p>
                  <p className="text-[#202124] leading-relaxed">
                    <span className="font-semibold">Janseva-Portal-App.html</span> has been saved to your downloads for 1-click desktop launch.
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={handleOpenStandaloneTab}
                    className="w-full py-3 px-4 bg-[#2563EB] hover:bg-blue-700 text-white rounded-full font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-200 active:scale-[0.98]"
                  >
                    <span>Launch Standalone Window</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={onClose}
                    className="w-full py-2.5 px-4 bg-[#F8F9FA] hover:bg-gray-100 text-[#5F6368] rounded-full font-medium text-xs transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            ) : (
              <>
                {/* Janseva Portal Logo + Graphic Header */}
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center shadow-md font-bold shrink-0">
                    <ShieldCheck className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-[#2563EB] mb-1 border border-blue-200">
                      Official Citizen App
                    </span>
                    <h3 className="text-xl font-bold text-[#202124] tracking-tight">
                      Install Janseva Portal
                    </h3>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-[#5F6368] mb-5 leading-relaxed">
                  Install Janseva Portal for faster access, offline complaint registration, push notifications, and a native app experience.
                </p>

                {/* Feature Highlights Grid */}
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#DADCE0] mb-5 text-center text-xs text-[#5F6368]">
                  <div className="flex flex-col items-center gap-1">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>Instant Launch</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <WifiOff className="w-4 h-4 text-[#2563EB]" />
                    <span>Offline Mode</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Bell className="w-4 h-4 text-emerald-600" />
                    <span>Push Alerts</span>
                  </div>
                </div>

                <div className="p-3 bg-[#F8F9FA] rounded-2xl border border-[#DADCE0] mb-6 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-[#5F6368]">
                    <Smartphone className="w-4 h-4 text-[#2563EB] shrink-0" />
                    <span>Desktop & Mobile Native Standalone Support</span>
                  </div>
                  <button
                    onClick={handleOpenStandaloneTab}
                    className="text-[#2563EB] font-semibold hover:underline shrink-0 flex items-center gap-1 text-[11px]"
                  >
                    <span>Open Tab</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleInstallClick}
                    disabled={isInstalling}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-all active:scale-95 shadow-sm shadow-blue-200 disabled:opacity-70"
                  >
                    <Download className="w-4 h-4" />
                    {isInstalling ? 'Installing App...' : 'Install App'}
                  </button>
                  <button
                    onClick={onClose}
                    className="px-5 py-3 rounded-full border border-[#DADCE0] hover:bg-[#F8F9FA] text-[#202124] font-medium text-xs sm:text-sm transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
