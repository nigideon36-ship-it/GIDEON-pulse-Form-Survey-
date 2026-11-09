import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Code2, QrCode, Mail, Download } from 'lucide-react';
import { Survey } from '../types/survey';

interface ShareModalProps {
  survey: Survey;
  isOpen: boolean;
  onClose: () => void;
  onOpenResponder: (surveyId: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  survey,
  isOpen,
  onClose,
  onOpenResponder,
}) => {
  const [activeTab, setActiveTab] = useState<'link' | 'qr' | 'embed' | 'email'>('link');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://pulseform.app';
  const surveyUrl = `${currentOrigin}/?survey=${survey.id}`;
  const embedCode = `<iframe\n  src="${surveyUrl}&embed=true"\n  width="100%"\n  height="700"\n  frameborder="0"\n  style="border: none; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);"\n  title="${survey.title}"\n></iframe>`;

  const emailSubject = encodeURIComponent(`Invitation to participate: ${survey.title}`);
  const emailBody = `Hi there,\n\nWe would appreciate your candid thoughts on "${survey.title}".\n\nIt takes approximately 2–3 minutes to complete:\n${surveyUrl}\n\nThank you for your valuable feedback!`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(surveyUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailBody);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-[#0c183a] text-white rounded-3xl border border-blue-900/60 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-blue-900/60 bg-[#0a1538]">
          <div>
            <h3 className="text-base font-black text-white">
              Share & Distribute East Africa Survey
            </h3>
            <p className="text-xs text-blue-300 font-bold mt-0.5 truncate max-w-md">
              {survey.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-blue-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Tab Bar */}
        <div className="flex border-b border-blue-900/60 px-6 pt-3 gap-2 bg-[#091330]">
          <button
            onClick={() => setActiveTab('link')}
            className={`pb-2.5 px-3 text-xs font-black border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'link'
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Direct Link</span>
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`pb-2.5 px-3 text-xs font-black border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'qr'
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Field QR Code</span>
          </button>
          <button
            onClick={() => setActiveTab('embed')}
            className={`pb-2.5 px-3 text-xs font-black border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'embed'
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Web Embed</span>
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`pb-2.5 px-3 text-xs font-black border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'email'
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>WhatsApp / Email</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'link' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-blue-300 uppercase tracking-wider mb-2">
                  Public Respondent Link (East Africa Region)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={surveyUrl}
                    className="flex-1 px-3.5 py-2.5 text-xs font-mono font-bold bg-[#091330] border border-blue-900/60 rounded-xl text-white focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors shrink-0 shadow-md border border-blue-400/30"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Quick WhatsApp Share Button */}
              <div className="p-3 bg-[#091330] rounded-2xl border border-blue-900/60 flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-white">Share via WhatsApp / SMS</div>
                  <div className="text-[11px] text-blue-300 font-bold">Preferred respondent channel across Kenya, Uganda, Tanzania, and Rwanda</div>
                </div>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Please take 2 minutes to fill out this survey: ${survey.title}\n${surveyUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow transition-colors flex items-center gap-1.5"
                >
                  <span>WhatsApp</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-blue-300 font-bold">
                <span>Status: <strong className="text-emerald-400 font-black capitalize">{survey.status}</strong></span>
                <button
                  onClick={() => {
                    onClose();
                    onOpenResponder(survey.id);
                  }}
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-black"
                >
                  <span>Open Responder Mode</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="flex flex-col items-center justify-center py-2 space-y-4 text-center">
              <div className="p-4 bg-white rounded-2xl border-4 border-blue-500 shadow-xl flex items-center justify-center">
                {/* Clean inline SVG QR code */}
                <svg
                  className="w-48 h-48"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="100" height="100" fill="white" />
                  {/* Outer corner anchors */}
                  <rect x="10" y="10" width="24" height="24" fill="#070e24" rx="2" />
                  <rect x="14" y="14" width="16" height="16" fill="white" />
                  <rect x="18" y="18" width="8" height="8" fill="#070e24" />

                  <rect x="66" y="10" width="24" height="24" fill="#070e24" rx="2" />
                  <rect x="70" y="14" width="16" height="16" fill="white" />
                  <rect x="74" y="18" width="8" height="8" fill="#070e24" />

                  <rect x="10" y="66" width="24" height="24" fill="#070e24" rx="2" />
                  <rect x="14" y="70" width="16" height="16" fill="white" />
                  <rect x="18" y="74" width="8" height="8" fill="#070e24" />

                  {/* QR Data modules pattern */}
                  <rect x="38" y="12" width="6" height="6" fill="#070e24" />
                  <rect x="48" y="12" width="6" height="6" fill="#070e24" />
                  <rect x="58" y="18" width="5" height="6" fill="#070e24" />
                  <rect x="38" y="24" width="6" height="6" fill="#070e24" />
                  <rect x="50" y="24" width="8" height="6" fill="#070e24" />

                  <rect x="12" y="38" width="6" height="6" fill="#070e24" />
                  <rect x="22" y="44" width="6" height="6" fill="#070e24" />
                  <rect x="38" y="38" width="6" height="6" fill="#070e24" />
                  <rect x="48" y="44" width="6" height="6" fill="#070e24" />
                  <rect x="62" y="38" width="6" height="6" fill="#070e24" />
                  <rect x="74" y="44" width="8" height="6" fill="#070e24" />
                  <rect x="86" y="38" width="6" height="6" fill="#070e24" />

                  <rect x="38" y="56" width="6" height="6" fill="#070e24" />
                  <rect x="52" y="56" width="6" height="6" fill="#070e24" />
                  <rect x="68" y="56" width="6" height="6" fill="#070e24" />
                  <rect x="80" y="56" width="6" height="6" fill="#070e24" />

                  <rect x="38" y="70" width="6" height="6" fill="#070e24" />
                  <rect x="48" y="76" width="6" height="6" fill="#070e24" />
                  <rect x="62" y="70" width="8" height="6" fill="#070e24" />
                  <rect x="76" y="76" width="6" height="6" fill="#070e24" />
                  <rect x="86" y="70" width="6" height="6" fill="#070e24" />

                  <rect x="38" y="84" width="8" height="6" fill="#070e24" />
                  <rect x="54" y="84" width="6" height="6" fill="#070e24" />
                  <rect x="70" y="84" width="10" height="6" fill="#070e24" />
                </svg>
              </div>
              <p className="text-xs text-blue-300 font-bold">
                Print or display on agent till counters across Nairobi, Kampala, Kigali, and Dar es Salaam.
              </p>
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-black text-white bg-[#091330] hover:bg-blue-950 border border-blue-800 rounded-xl transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Copy QR Destination URL</span>
              </button>
            </div>
          )}

          {activeTab === 'embed' && (
            <div className="space-y-3">
              <p className="text-xs text-blue-300 font-bold">
                Embed this survey seamlessly inside East African portals, internal dashboards, or SACCO intranets:
              </p>
              <div className="relative">
                <textarea
                  readOnly
                  rows={4}
                  value={embedCode}
                  className="w-full p-3 font-mono text-xs bg-[#091330] border border-blue-900/60 rounded-xl text-white font-bold focus:outline-none"
                />
                <button
                  onClick={handleCopyEmbed}
                  className="absolute top-2 right-2 flex items-center gap-1.5 px-3 py-1 text-xs font-black text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow transition-colors"
                >
                  {copiedEmbed ? <Check className="w-3 h-3 stroke-[3]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedEmbed ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-3">
              <p className="text-xs text-blue-300 font-bold">
                Ready-to-send invite copy for East African customer or team communications:
              </p>
              <div className="p-3.5 bg-[#091330] border border-blue-900/60 rounded-2xl text-xs text-slate-200 space-y-2 font-mono whitespace-pre-wrap font-semibold">
                {emailBody}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <a
                  href={`mailto:?subject=${emailSubject}&body=${encodeURIComponent(emailBody)}`}
                  className="px-4 py-2 text-xs font-black text-slate-300 hover:text-white bg-[#091330] hover:bg-blue-950 border border-blue-800 rounded-xl transition-colors"
                >
                  Open in Mail Client
                </a>
                <button
                  onClick={handleCopyEmail}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md border border-blue-400/30 transition-colors"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEmail ? 'Copied' : 'Copy Email Text'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
