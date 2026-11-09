import React, { useState } from 'react';
import {
  X,
  Play,
  Smartphone,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Globe,
  Download,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

interface PublishPlayStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublishPlayStoreModal: React.FC<PublishPlayStoreModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'cli' | 'checklist' | 'assetlinks'>('quick');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCli, setCopiedCli] = useState(false);
  const [copiedAssetlinks, setCopiedAssetlinks] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-axan27s3b534jwqwhv5na5-435091693224.europe-west3.run.app';
  const packageName = 'app.pulseform.eastafrica';
  const appTitle = 'PulseForm East Africa';

  const assetlinksJson = `[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "${packageName}",
      "sha256_cert_fingerprints": [
        "YOUR_RELEASE_KEYSTORE_SHA256_FINGERPRINT_FROM_PLAY_CONSOLE"
      ]
    }
  }
]`;

  const cliCommands = `# 1. Install Google's official Bubblewrap CLI
npm install -g @bubblewrap/cli

# 2. Initialize Android TWA package from your live manifest
bubblewrap init --manifest="${currentUrl}/manifest.webmanifest"

# 3. Build signed Android App Bundle (.aab)
bubblewrap build

# Output: app-release-bundle.aab (Upload this to Google Play Console!)`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyCli = () => {
    navigator.clipboard.writeText(cliCommands);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  const handleCopyAssetlinks = () => {
    navigator.clipboard.writeText(assetlinksJson);
    setCopiedAssetlinks(true);
    setTimeout(() => setCopiedAssetlinks(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-3xl bg-[#0c183a] text-white rounded-3xl border border-blue-900/60 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-blue-900/60 bg-[#0a1538]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">
                  Publish to Google Play Store
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  TWA Ready
                </span>
              </div>
              <p className="text-xs text-blue-300 font-bold mt-0.5">
                Generate an Android App Bundle (.aab) and submit {appTitle} to Google Play
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-blue-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-blue-900/60 px-6 pt-3 gap-2 bg-[#091330] overflow-x-auto">
          <button
            onClick={() => setActiveTab('quick')}
            className={`pb-2.5 px-3 text-xs font-black border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'quick'
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Method 1: PWABuilder (Fastest)</span>
          </button>
          <button
            onClick={() => setActiveTab('cli')}
            className={`pb-2.5 px-3 text-xs font-black border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'cli'
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Method 2: Bubblewrap CLI</span>
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`pb-2.5 px-3 text-xs font-black border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'checklist'
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Play Console Checklist</span>
          </button>
          <button
            onClick={() => setActiveTab('assetlinks')}
            className={`pb-2.5 px-3 text-xs font-black border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'assetlinks'
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Digital Asset Links</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'quick' && (
            <div className="space-y-5">
              <div className="p-4 bg-gradient-to-r from-blue-950 to-[#0d2156] border border-blue-700/60 rounded-2xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-400/40 text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">
                    Google Trusted Web Activity (TWA) Packaging
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed font-medium">
                    Google officially supports publishing Progressive Web Apps directly to the Google Play Store using <strong>Trusted Web Activity</strong>. When users install it from Google Play, it runs full-screen with native Android performance, launcher icon, and no browser UI!
                  </p>
                </div>
              </div>

              {/* Step 1: URL */}
              <div className="p-4 bg-[#091330] rounded-2xl border border-blue-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-blue-300 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">1</span>
                    Your Live PWA App URL
                  </span>
                  <button
                    onClick={handleCopyUrl}
                    className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
                  </button>
                </div>
                <div className="p-2.5 bg-[#070e24] rounded-xl border border-blue-900/40 font-mono text-xs text-slate-200 break-all select-all">
                  {currentUrl}
                </div>
                <p className="text-[11px] text-slate-300 font-medium">
                  This app already has a valid Web App Manifest (<code className="text-blue-300 font-mono">manifest.webmanifest</code>), service worker, deep blue theme, and 192px/512px Android icons.
                </p>
              </div>

              {/* Step 2: PWABuilder Action */}
              <div className="p-4 bg-[#091330] rounded-2xl border border-blue-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-blue-300 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">2</span>
                    Generate .AAB Package on PWABuilder
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  <strong>PWABuilder</strong> (backed by Microsoft & Google Chrome engineers) analyzes your live URL and compiles an Android App Bundle (<code className="text-blue-300 font-mono">.aab</code>) in under 60 seconds with your custom package ID and signing key.
                </p>
                <a
                  href={`https://www.pwabuilder.com/?url=${encodeURIComponent(currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md border border-blue-400/40 transition-colors"
                >
                  <span>Open PWABuilder with Your App URL</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Step 3: Google Play Console */}
              <div className="p-4 bg-[#091330] rounded-2xl border border-blue-900/60 space-y-2">
                <span className="text-xs font-black text-blue-300 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">3</span>
                  Upload to Google Play Console
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Log in to <strong className="text-white">play.google.com/console</strong>, create a new app named <strong>PulseForm East Africa</strong>, and upload the generated <code className="text-blue-300 font-mono">.aab</code> file under <strong>Production</strong> or <strong>Closed Testing</strong>.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'cli' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-950 to-[#0d2156] border border-blue-700/60 rounded-2xl">
                <h4 className="text-sm font-black text-white">
                  Google Bubblewrap CLI (Official Google Tool)
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed font-medium">
                  Bubblewrap is Google’s official open-source CLI that wraps web applications into Android TWA packages with automated Android Studio and JDK configurations.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-blue-300 uppercase tracking-wider">
                    Terminal Commands
                  </span>
                  <button
                    onClick={handleCopyCli}
                    className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300"
                  >
                    {copiedCli ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCli ? 'Copied' : 'Copy Commands'}</span>
                  </button>
                </div>
                <div className="p-4 bg-[#070e24] rounded-2xl border border-blue-900/60 font-mono text-xs text-blue-300 overflow-x-auto leading-relaxed">
                  <pre>{cliCommands}</pre>
                </div>
              </div>

              <div className="p-3.5 bg-[#091330] rounded-xl border border-blue-900/60 text-xs text-slate-300 space-y-1.5 font-medium">
                <strong className="text-white font-black block">What happens when you run Bubblewrap:</strong>
                <div>1. It prompts for your app name and desired Android package ID (e.g. <code className="text-blue-300 font-mono">app.pulseform.eastafrica</code>).</div>
                <div>2. Prompts to generate or select an Android release signing keystore (<code className="text-blue-300 font-mono">.keystore</code>). Keep this safe!</div>
                <div>3. Outputs the compiled <code className="text-blue-300 font-mono">app-release-bundle.aab</code> ready for the Google Play Console.</div>
              </div>
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-950 to-[#0d2156] border border-blue-700/60 rounded-2xl">
                <h4 className="text-sm font-black text-white">
                  Google Play Store Submission Requirements
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed font-medium">
                  Ensure all Google Play Console policy and store listing requirements are met before submitting for review:
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    title: '1. Google Play Developer Account',
                    desc: 'A one-time $25 registration fee at play.google.com/console with identity verification.',
                  },
                  {
                    title: '2. App Store Listing Graphic Assets',
                    desc: 'High-res App Icon (512x512 PNG, 32-bit), Feature Graphic (1024x500 JPEG/PNG), and at least 2 phone screenshots (1080x1920 or 1080x2400).',
                  },
                  {
                    title: '3. Privacy Policy URL',
                    desc: 'A valid public URL explaining data handling (e.g. survey responses, email collection, no telemetry sold).',
                  },
                  {
                    title: '4. App Content Rating Questionnaire',
                    desc: 'Fill out the IARC questionnaire in Play Console (typically rated "Everyone / 3+" for enterprise survey tools).',
                  },
                  {
                    title: '5. Target Audience & Data Safety',
                    desc: 'Declare target age (18+) and declare data collection types (Contact info, User responses).',
                  },
                  {
                    title: '6. Digital Asset Links Verification',
                    desc: 'Host your SHA256 release certificate fingerprint in /.well-known/assetlinks.json to remove browser navigation bars.',
                  },
                  {
                    title: '7. Closed Testing Requirement (New Personal Accounts)',
                    desc: 'Google requires new personal developer accounts to run a 14-day closed test with at least 20 opted-in testers before production rollout.',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-[#091330] rounded-xl border border-blue-900/60 text-xs"
                  >
                    <div className="font-black text-white">{item.title}</div>
                    <div className="text-slate-300 mt-0.5 font-medium leading-relaxed">
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'assetlinks' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-950 to-[#0d2156] border border-blue-700/60 rounded-2xl">
                <h4 className="text-sm font-black text-white">
                  Digital Asset Links Verification (assetlinks.json)
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed font-medium">
                  When your TWA launches on Android, Google Chrome verifies that your domain has an <code className="text-blue-300 font-mono">assetlinks.json</code> file matching your app’s SHA-256 fingerprint. This guarantees that only your app can open in full native standalone mode without browser chrome.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-blue-300 uppercase tracking-wider">
                    Location: <code className="text-white font-mono lowercase">/.well-known/assetlinks.json</code>
                  </span>
                  <button
                    onClick={handleCopyAssetlinks}
                    className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300"
                  >
                    {copiedAssetlinks ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAssetlinks ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
                <div className="p-4 bg-[#070e24] rounded-2xl border border-blue-900/60 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed">
                  <pre>{assetlinksJson}</pre>
                </div>
              </div>

              <div className="p-3.5 bg-[#091330] rounded-xl border border-blue-900/60 text-xs text-slate-300 space-y-1 font-medium">
                <strong className="text-white font-black block">Where to find your SHA-256 fingerprint:</strong>
                <div>1. In Google Play Console: Go to <strong>Release &gt; Setup &gt; App Integrity</strong>.</div>
                <div>2. Under <strong>App signing key certificate</strong>, copy the <strong>SHA-256 certificate fingerprint</strong>.</div>
                <div>3. Paste it into <code className="text-blue-300 font-mono">public/.well-known/assetlinks.json</code> in this project.</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-blue-900/60 bg-[#0a1538] flex items-center justify-between">
          <a
            href="https://play.google.com/console"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-black text-blue-400 hover:text-blue-300 flex items-center gap-1.5"
          >
            <span>Open Google Play Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md border border-blue-400/30 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
