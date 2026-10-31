import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Mic,
  MicOff,
  Sparkles,
  AlertCircle,
  Plus,
  Flame,
  CheckCircle2,
  Image as ImageIcon,
  Layers,
} from 'lucide-react';
import { IngredientItem, LanguageCode } from '../types';
import { SAMPLE_SCENARIOS, STAPLE_QUICK_CHIPS, SampleScenario } from '../data/samplePantry';

interface ScannerSectionProps {
  onItemsDetected: (items: IngredientItem[], summary?: string) => void;
  onAddManualItem: (name: string, category: string, quantity: string) => void;
  isScanning: boolean;
  setIsScanning: (val: boolean) => void;
  language: LanguageCode;
}

export const ScannerSection: React.FC<ScannerSectionProps> = ({
  onItemsDetected,
  onAddManualItem,
  isScanning,
  setIsScanning,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'voice' | 'quick'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [voiceText, setVoiceText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemQty, setCustomItemQty] = useState('1 portion');
  const [customItemCategory, setCustomItemCategory] = useState('Vegetable');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Handle Image File Upload & Scan
  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target?.result as string;
      setPreviewImage(base64Data);
      await scanImageWithAI(base64Data, file.type);
    };
    reader.readAsDataURL(file);
  };

  const scanImageWithAI = async (base64String: string, mimeType: string) => {
    setIsScanning(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/scan-fridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64String,
          mimeType: mimeType,
          textPrompt: voiceText || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to analyze fridge image.');
      }

      const data = await response.json();
      if (data.detectedItems && data.detectedItems.length > 0) {
        onItemsDetected(data.detectedItems, data.summary);
      } else {
        setErrorMessage('Could not clearly detect ingredients. Please try another angle or select quick items below.');
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      setErrorMessage(err.message || 'Error scanning photo. Please try again or use manual quick tags.');
    } finally {
      setIsScanning(false);
    }
  };

  // Quick preset scenario selection
  const handleSelectScenario = (scenario: SampleScenario) => {
    setPreviewImage(scenario.image);
    setErrorMessage(null);
    onItemsDetected(scenario.items, `Loaded preset scenario: ${scenario.title}`);
  };

  // Voice recognition with Web Speech API
  const toggleVoiceRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage('Speech recognition is not supported in this browser. Please type or upload a photo.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'English' ? 'en-US' : 'ur-PK';

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setVoiceText(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Speech recognition setup failed:', err);
      setIsListening(false);
    }
  };

  const handleVoiceSubmit = async () => {
    if (!voiceText.trim()) return;
    setIsScanning(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/scan-fridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          textPrompt: `User verbally listed ingredients: "${voiceText}". Extract every item with estimated quantities and food waste urgency status.`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to parse spoken ingredients.');
      }

      const data = await response.json();
      if (data.detectedItems && data.detectedItems.length > 0) {
        onItemsDetected(data.detectedItems, data.summary);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing spoken ingredients.');
    } finally {
      setIsScanning(false);
    }
  };

  // Add custom manual item
  const handleManualAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemName.trim()) return;
    onAddManualItem(customItemName.trim(), customItemCategory, customItemQty);
    setCustomItemName('');
    setCustomItemQty('1 portion');
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden mb-8 transition-all">
      {/* Top Banner & Header */}
      <div className="px-6 py-5 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Camera className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold">
              {language === 'Urdu'
                ? 'فریج یا کچن کی تصویر لیں / سامان شامل کریں'
                : language === 'Roman Urdu'
                ? 'Fridge ya Leftovers ki Tasveer Lein / Bol Kar Batayein'
                : '1. Scan Your Fridge & Leftovers'}
            </h2>
          </div>
          <p className="text-xs text-stone-300 mt-1 max-w-xl">
            {language === 'Urdu'
              ? 'اپنے فریج کی تصویر اپلوڈ کریں، بول کر بتائیں، یا نیچے دیئے گئے نمونوں میں سے چنیں'
              : language === 'Roman Urdu'
              ? 'Google Gemini Vision foran aapke bache hue saamaan ko pehchan kar zero-waste recipes banayega.'
              : 'Our Gemini Vision AI immediately identifies leftover food items, assesses freshness, and flags expiring items.'}
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center bg-stone-800/80 p-1 rounded-2xl border border-stone-700/60 self-start md:self-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'upload'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Photo Scan</span>
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'voice'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice Dictate</span>
          </button>
          <button
            onClick={() => setActiveTab('quick')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'quick'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Quick Staples</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6">
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* TAB 1: Photo Upload & Presets */}
        {activeTab === 'upload' && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Drag & Drop Upload Box */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFile(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`lg:col-span-6 rounded-2xl border-2 border-dashed p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all relative overflow-hidden group min-h-[220px] ${
                  dragActive
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : 'border-stone-300 hover:border-emerald-500/80 bg-stone-50/60 hover:bg-emerald-50/20'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFile(e.target.files[0]);
                    }
                  }}
                />

                {previewImage ? (
                  <div className="w-full h-full relative flex flex-col items-center">
                    <img
                      src={previewImage}
                      alt="Fridge scan preview"
                      className="max-h-44 rounded-xl object-cover shadow-sm mb-2"
                    />
                    <div className="flex items-center space-x-1.5 text-xs text-stone-600 bg-white px-3 py-1 rounded-full shadow-sm border border-stone-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Photo loaded. Click to replace.</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="font-semibold text-stone-800 text-sm">
                      Snap or Upload Fridge / Leftovers Photo
                    </p>
                    <p className="text-xs text-stone-500 mt-1">
                      Drag & drop your photo here or browse (JPEG, PNG)
                    </p>
                    <div className="mt-3 inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-semibold shadow-sm">
                      <Camera className="w-3.5 h-3.5" />
                      <span>Scan Fridge with Gemini AI</span>
                    </div>
                  </>
                )}

                {/* Scanning overlay */}
                {isScanning && (
                  <div className="absolute inset-0 bg-stone-900/75 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4">
                    <div className="w-10 h-10 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-sm font-bold animate-pulse text-emerald-300">
                      Scanning ingredients with Gemini Vision...
                    </p>
                    <p className="text-xs text-stone-300 mt-1">
                      Detecting freshness, quantities, and rescue priority...
                    </p>
                  </div>
                )}
              </div>

              {/* Sample Fridge Presets */}
              <div className="lg:col-span-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                      Or Try 1-Click Realistic Scenarios:
                    </span>
                    <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                      Instant Test
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {SAMPLE_SCENARIOS.map((scenario) => (
                      <button
                        key={scenario.id}
                        onClick={() => handleSelectScenario(scenario)}
                        className="text-left p-2.5 rounded-xl border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group cursor-pointer bg-white"
                      >
                        <div className="flex items-center space-x-2">
                          <img
                            src={scenario.image}
                            alt={scenario.title}
                            className="w-10 h-10 rounded-lg object-cover group-hover:scale-105 transition-transform shrink-0"
                          />
                          <div className="overflow-hidden">
                            <span className="text-xs font-bold text-stone-800 block truncate group-hover:text-emerald-700">
                              {scenario.title}
                            </span>
                            <span className="text-[10px] text-stone-500 block truncate">
                              {scenario.subtitle}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex items-start space-x-2">
                  <Flame className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p>
                    <strong className="font-semibold">Hostel & Home Tip:</strong> Cold boiled rice, dry roti, and leftover daal are kitchen gold! Don't let them turn into mold.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Voice Dictate */}
        {activeTab === 'voice' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-stone-700 flex items-center space-x-1.5">
                  <Mic className="w-4 h-4 text-emerald-600" />
                  <span>Speak what you have in your fridge or kitchen:</span>
                </span>
                <span className="text-xs text-stone-500">
                  Try Urdu or English: "2 anday, bache hue chawal, aur dahi hai"
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={toggleVoiceRecording}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-all shadow-md cursor-pointer ${
                    isListening
                      ? 'bg-rose-500 animate-pulse scale-105 shadow-rose-500/30'
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                  }`}
                  title={isListening ? 'Stop listening' : 'Start microphone'}
                >
                  {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>

                <input
                  type="text"
                  value={voiceText}
                  onChange={(e) => setVoiceText(e.target.value)}
                  placeholder={
                    isListening
                      ? 'Listening... speak now!'
                      : 'e.g. Leftover boiled rice, 2 eggs, half onion, soy sauce...'
                  }
                  className="flex-1 bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />

                <button
                  onClick={handleVoiceSubmit}
                  disabled={!voiceText.trim() || isScanning}
                  className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold disabled:opacity-50 cursor-pointer transition-colors"
                >
                  {isScanning ? 'Parsing...' : 'Analyze Items'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Quick Staples & Manual Add */}
        {activeTab === 'quick' && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2.5">
                Tap to Add Common Fridge Leftovers:
              </p>
              <div className="flex flex-wrap gap-2">
                {STAPLE_QUICK_CHIPS.map((chip, index) => (
                  <button
                    key={index}
                    onClick={() => onAddManualItem(chip.name, chip.category, '1 portion')}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-emerald-50 hover:text-emerald-700 border border-stone-200 text-stone-700 text-xs font-medium transition-all active:scale-95 cursor-pointer"
                  >
                    <span>{chip.emoji}</span>
                    <span className="font-semibold">{chip.name}</span>
                    <span className="text-[10px] text-stone-400">({chip.local})</span>
                    <Plus className="w-3 h-3 text-stone-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Custom Input Form */}
            <form onSubmit={handleManualAddSubmit} className="pt-3 border-t border-stone-200 flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Custom ingredient (e.g., Leftover Pasta, 1 Bell Pepper)"
                value={customItemName}
                onChange={(e) => setCustomItemName(e.target.value)}
                className="flex-1 min-w-[200px] text-xs bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="text"
                placeholder="Qty (e.g. 1 bowl)"
                value={customItemQty}
                onChange={(e) => setCustomItemQty(e.target.value)}
                className="w-28 text-xs bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <select
                value={customItemCategory}
                onChange={(e) => setCustomItemCategory(e.target.value)}
                className="text-xs bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Vegetable">Vegetable</option>
                <option value="Protein">Protein</option>
                <option value="Dairy">Dairy</option>
                <option value="Grain/Carb">Grain/Carb</option>
                <option value="Condiment/Sauce">Condiment/Sauce</option>
                <option value="Spice/Pantry">Spice/Pantry</option>
              </select>
              <button
                type="submit"
                disabled={!customItemName.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer transition-colors"
              >
                + Add Item
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
