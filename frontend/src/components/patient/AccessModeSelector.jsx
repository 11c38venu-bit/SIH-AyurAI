import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Smartphone,
  Monitor,
  QrCode,
  Sparkles,
  CheckCircle2,
  Users,
  ShieldCheck,
  Heart,
  Volume2,
  HelpCircle,
  ArrowRight,
  Tablet,
  X,
  Copy,
  Check
} from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { Modal } from '../common/Modal';

/**
 * AccessModeSelector
 * Polished UI component presenting the two AYURAI patient access modes:
 * 1. 📱 Patient Phone
 * 2. 🖥️ Hospital Kiosk
 *
 * Highlights accessibility for elderly patients, users without smartphones, and low-literacy users.
 */
export const AccessModeSelector = ({
  onSelectMode,
  selectedMode = 'kiosk', // 'phone' | 'kiosk'
  redirectRoute = '/patient/register',
  className = '',
  compact = false
}) => {
  const navigate = useNavigate();
  const [currentMode, setCurrentMode] = useState(selectedMode);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleChooseMode = (mode) => {
    setCurrentMode(mode);
    if (onSelectMode) {
      onSelectMode(mode);
    }
  };

  const handlePhoneAction = () => {
    handleChooseMode('phone');
    setShowQrModal(true);
  };

  const handleKioskAction = () => {
    handleChooseMode('kiosk');
    navigate(redirectRoute);
  };

  const handleCopyLink = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Section Heading */}
      <div className="text-center max-w-xl mx-auto space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight">
          How would you like to continue?
        </h2>
        <p className="text-xs sm:text-sm text-slate-600">
          AYURAI supports patients using their personal smartphone as well as the hospital&apos;s touch-enabled kiosk.
        </p>
      </div>

      {/* Two Access Mode Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* OPTION 1: PATIENT PHONE */}
        <div
          onClick={() => handleChooseMode('phone')}
          className={`
            p-6 rounded-3xl border-2 transition-all duration-200 cursor-pointer text-left flex flex-col justify-between relative bg-white
            ${currentMode === 'phone'
              ? 'border-ayur-600 ring-4 ring-ayur-100 shadow-md bg-gradient-to-b from-teal-50/40 via-white to-white'
              : 'border-slate-200 hover:border-slate-300 hover:shadow-xs hover:bg-slate-50/50'}
          `}
        >
          <div className="space-y-4">
            {/* Header & Icon */}
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shadow-xs">
                <Smartphone className="w-6 h-6" />
              </div>
              <Badge variant={currentMode === 'phone' ? 'primary' : 'secondary'} size="sm">
                Personal Mobile
              </Badge>
            </div>

            {/* Title & Description */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">📱</span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Continue on My Phone
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Scan your QR/token and complete your case-taking on your phone.
              </p>
            </div>

            {/* Key Benefits */}
            <ul className="space-y-2 text-xs text-slate-600 pt-1">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>Fill case details at your own pace from the waiting lounge</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>Keep your live token status, summary & prescriptions with you</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>Works in 6 Indian languages with voice-input assistant</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <div className="pt-5 mt-4 border-t border-slate-100">
            <Button
              variant={currentMode === 'phone' ? 'primary' : 'outline'}
              size="md"
              onClick={handlePhoneAction}
              className="w-full justify-center shadow-xs"
              icon={QrCode}
            >
              Continue on Phone
            </Button>
          </div>
        </div>

        {/* OPTION 2: HOSPITAL KIOSK */}
        <div
          onClick={() => handleChooseMode('kiosk')}
          className={`
            p-6 rounded-3xl border-2 transition-all duration-200 cursor-pointer text-left flex flex-col justify-between relative bg-white
            ${currentMode === 'kiosk'
              ? 'border-ayur-600 ring-4 ring-ayur-100 shadow-md bg-gradient-to-b from-ayur-50/40 via-white to-white'
              : 'border-slate-200 hover:border-slate-300 hover:shadow-xs hover:bg-slate-50/50'}
          `}
        >
          <div className="space-y-4">
            {/* Header & Icon */}
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
                <Monitor className="w-6 h-6" />
              </div>
              <Badge variant={currentMode === 'kiosk' ? 'warning' : 'secondary'} size="sm">
                Touch Terminal
              </Badge>
            </div>

            {/* Title & Description */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">🖥️</span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Use Hospital Kiosk
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Complete your case-taking using the hospital&apos;s touch-enabled AYURAI kiosk.
              </p>
            </div>

            {/* Accessibility Perks Callout */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-slate-700 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-950 text-[11px] uppercase tracking-wider">
                <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>Accessibility & Inclusivity Features</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-slate-600">
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-slate-800 shrink-0">👵 Elderly Patients:</span>
                  <span>Extra-large touch controls, high contrast & clear instructions</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-slate-800 shrink-0">📵 No Smartphone Needed:</span>
                  <span>Complete self-service intake directly at the OPD counter</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-slate-800 shrink-0">🤝 Limited Digital Literacy:</span>
                  <span>Audio guidance & assisted desk staff support available</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-5 mt-4 border-t border-slate-100">
            <Button
              variant={currentMode === 'kiosk' ? 'primary' : 'outline'}
              size="md"
              onClick={handleKioskAction}
              className="w-full justify-center shadow-xs"
              icon={ArrowRight}
              iconPosition="right"
            >
              Use Kiosk
            </Button>
          </div>
        </div>
      </div>

      {/* Unified Workflow Guarantee Footer */}
      <div className="p-3.5 rounded-xl bg-slate-100/90 border border-slate-200 text-slate-600 text-xs flex items-center justify-between gap-3 text-center sm:text-left flex-col sm:flex-row">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-ayur-700 shrink-0" />
          <span className="text-[11px]">
            <strong>Unified AYURAI Workflow:</strong> Both phone and kiosk modes feed into the same OPD queue, token tracking, and Vaidya consultation dossier.
          </span>
        </div>
        <span className="text-[11px] font-semibold text-ayur-800 shrink-0">
          ✓ Seamless Data Sync
        </span>
      </div>

      {/* Mock QR Code Modal for Phone Continuation */}
      {showQrModal && (
        <Modal
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
          title="Scan QR to Continue on Your Phone"
          subtitle="Open camera on your smartphone to instantly access your case intake"
          size="sm"
        >
          <div className="space-y-5 text-center py-3">
            {/* Mock QR Code graphic */}
            <div className="p-5 rounded-3xl bg-white border-2 border-slate-200 inline-block shadow-md ring-4 ring-ayur-50 mx-auto">
              <div className="w-48 h-48 bg-slate-900 rounded-2xl flex flex-col items-center justify-center p-3 relative overflow-hidden">
                {/* SVG Mock QR Pattern */}
                <div className="grid grid-cols-6 gap-2 w-full h-full p-2">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-xs ${
                        i % 2 === 0 || i % 7 === 0 || i === 0 || i === 5 || i === 30 || i === 35
                          ? 'bg-white'
                          : 'bg-ayur-400'
                      }`}
                    />
                  ))}
                </div>
                {/* Central AYURAI Badge inside QR */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="px-2.5 py-1 bg-white rounded-lg shadow-sm border border-slate-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-ayur-700" />
                    <span className="text-[10px] font-bold font-display text-slate-900">AYURAI</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-slate-600 font-semibold">
                Point your phone camera at the QR code above
              </p>
              <p className="text-[11px] text-slate-400">
                Or enter link on mobile: <strong className="font-mono text-ayur-800">https://ayurai.health/intake?token=A-024</strong>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                icon={copiedLink ? Check : Copy}
              >
                {copiedLink ? 'Link Copied!' : 'Copy Mobile Link'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setShowQrModal(false);
                  navigate(redirectRoute);
                }}
                icon={ArrowRight}
                iconPosition="right"
              >
                Open Phone View in Browser
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AccessModeSelector;
