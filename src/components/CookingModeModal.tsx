import React, { useState, useEffect } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ChefHat,
  Sparkles,
  Share2,
  Clock,
  Flame,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Recipe, LanguageCode } from '../types';

interface CookingModeModalProps {
  recipe: Recipe;
  onClose: () => void;
  onCompleteRecipe: (recipe: Recipe) => void;
  language: LanguageCode;
}

export const CookingModeModal: React.FC<CookingModeModalProps> = ({
  recipe,
  onClose,
  onCompleteRecipe,
  language,
}) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(recipe.totalMinutes * 60);
  const [initialSeconds, setInitialSeconds] = useState(recipe.totalMinutes * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && timerActive) {
      setTimerActive(false);
      // Play ding sound
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.8);
      } catch (e) {
        console.error(e);
      }
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  // Speech synthesis for hands-free cooking
  const speakCurrentStep = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = `Step ${currentStepIndex + 1}: ${recipe.steps[currentStepIndex]}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const toggleStep = (index: number) => {
    if (completedSteps.includes(index)) {
      setCompletedSteps(completedSteps.filter((s) => s !== index));
    } else {
      const nextSteps = [...completedSteps, index];
      setCompletedSteps(nextSteps);
      if (index + 1 < recipe.steps.length) {
        setCurrentStepIndex(index + 1);
      }
      if (nextSteps.length === recipe.steps.length) {
        handleAllStepsComplete();
      }
    }
  };

  const handleAllStepsComplete = () => {
    setIsFinished(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const timerProgress = initialSeconds > 0 ? ((initialSeconds - timerSeconds) / initialSeconds) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Interactive Cooking Mode
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800">
                  {recipe.wasteRescueScore}% Waste Rescued
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold truncate max-w-md sm:max-w-lg">
                {recipe.title}
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              if (isSpeaking) window.speechSynthesis?.cancel();
              onClose();
            }}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Hands-Free & Timer Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Audio Step Reader */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-900 flex items-center space-x-1.5">
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  <span>Hands-Free Voice Assistant</span>
                </span>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Listen while your hands are busy cooking
                </p>
              </div>
              <button
                onClick={speakCurrentStep}
                className={`p-2.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer ${
                  isSpeaking
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isSpeaking ? 'Stop Audio' : 'Read Step'}</span>
              </button>
            </div>

            {/* Kitchen Timer */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-stone-800 flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Kitchen Timer</span>
                </span>
                <div className="text-xl font-mono font-bold text-stone-900 mt-0.5">
                  {formatTimer(timerSeconds)}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setTimerActive(!timerActive)}
                  className={`p-2 rounded-xl text-white font-bold text-xs cursor-pointer ${
                    timerActive
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-stone-900 hover:bg-stone-800'
                  }`}
                >
                  {timerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    setTimerActive(false);
                    setTimerSeconds(initialSeconds);
                  }}
                  className="p-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 cursor-pointer"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Smart Substitutions Callout if available */}
          {recipe.smartSubstitutions && recipe.smartSubstitutions.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
              <span className="text-xs font-bold text-amber-900 flex items-center space-x-1.5 mb-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Zero-Waste Pantry Substitutions:</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {recipe.smartSubstitutions.map((sub, idx) => (
                  <div key={idx} className="bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
                    <p className="font-semibold text-stone-800">
                      Missing <span className="line-through text-rose-600">{sub.missingIngredient}</span>?
                    </p>
                    <p className="text-emerald-700 font-bold mt-0.5">
                      👉 Swap with: {sub.substitute}
                    </p>
                    <p className="text-[11px] text-stone-500 mt-1">{sub.whyItWorks}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Steps Checklist */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Cooking Steps ({completedSteps.length} of {recipe.steps.length} done):
              </span>
              <span className="text-xs text-stone-500">
                Click a step to check off as you cook
              </span>
            </div>

            <div className="space-y-3">
              {recipe.steps.map((step, idx) => {
                const isDone = completedSteps.includes(idx);
                const isCurrent = currentStepIndex === idx;

                return (
                  <div
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3.5 ${
                      isDone
                        ? 'bg-emerald-50/50 border-emerald-300 text-stone-500 line-through'
                        : isCurrent
                        ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20 text-stone-900 font-medium'
                        : 'bg-stone-50/70 border-stone-200 text-stone-700 hover:bg-white'
                    }`}
                  >
                    <button
                      type="button"
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold transition-all ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </button>

                    <div className="flex-1">
                      <p className="text-sm leading-relaxed">{step}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chef's Zero-Waste Tip */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-xs">
            <span className="font-bold text-emerald-900 flex items-center space-x-1.5 mb-1">
              <ChefHat className="w-4 h-4 text-emerald-700" />
              <span>Chef's Waste-Free Secret:</span>
            </span>
            <p className="text-stone-700 leading-relaxed">{recipe.chefZeroWasteTip}</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-stone-500">
            Estimated Savings: <strong className="text-emerald-700 font-bold">{recipe.estimatedSavings}</strong> • Waste Score: <strong className="text-emerald-700 font-bold">{recipe.wasteRescueScore}%</strong>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={() => {
                onCompleteRecipe(recipe);
                confetti({ particleCount: 80, spread: 60 });
                onClose();
              }}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md cursor-pointer transition-all active:scale-95"
            >
              <Award className="w-4 h-4" />
              <span>Done Cooking! Record Food Saved</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
