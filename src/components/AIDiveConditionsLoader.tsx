import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Mountain,
  CloudSun,
  Waves,
  Moon,
  Satellite,
  Eye,
  Wind,
  Shield,
  Sparkles,
  Check,
  Loader2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  X,
} from 'lucide-react';

interface Props {
  active: boolean;
  onCancel?: () => void;
}

interface Step {
  key: string;
  icon: React.ElementType;
  endAt: number;
}

const STEPS: Step[] = [
  { key: 'locate',     icon: MapPin,    endAt:   3 },
  { key: 'bathymetry', icon: Mountain,  endAt:  10 },
  { key: 'weather',    icon: CloudSun,  endAt:  18 },
  { key: 'marine',     icon: Waves,     endAt:  28 },
  { key: 'tides',      icon: Moon,      endAt:  40 },
  { key: 'satellite',  icon: Satellite, endAt: 180 },
  { key: 'visibility', icon: Eye,       endAt: 200 },
  { key: 'dynamics',   icon: Wind,      endAt: 220 },
  { key: 'safety',     icon: Shield,    endAt: 240 },
  { key: 'ai',         icon: Sparkles,  endAt: 260 },
];

const LIVE_TICK_MS = 200;
const FLUSH_STEP_MS = 130;
const FINAL_HOLD_MS = 450;

type Phase = 'idle' | 'live' | 'flushing';

export default function AIDiveConditionsLoader({ active, onCancel }: Props) {
  const { t } = useTranslation();

  const [phase, setPhase] = useState<Phase>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const startedAtRef = useRef<number>(0);

  useEffect(() => {
    if (active) {
      setPhase('live');
      setActiveStepIndex(0);
      setElapsedSeconds(0);
      startedAtRef.current = Date.now();
    } else if (phase === 'live') {
      setPhase('flushing');
    }
  }, [active, phase]);

  useEffect(() => {
    if (phase !== 'live') return;

    const tick = setInterval(() => {
      const elapsed = (Date.now() - startedAtRef.current) / 1000;
      setElapsedSeconds(Math.floor(elapsed));

      let idx = STEPS.length - 1;
      for (let i = 0; i < STEPS.length; i++) {
        if (elapsed < STEPS[i].endAt) {
          idx = i;
          break;
        }
      }
      setActiveStepIndex((prev) => Math.max(prev, idx));
    }, LIVE_TICK_MS);

    return () => clearInterval(tick);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'flushing') return;

    const flushInterval = setInterval(() => {
      setActiveStepIndex((prev) => {
        const next = prev + 1;
        if (next >= STEPS.length) {
          clearInterval(flushInterval);
          window.setTimeout(() => setPhase('idle'), FINAL_HOLD_MS);
          return STEPS.length;
        }
        return next;
      });
    }, FLUSH_STEP_MS);

    return () => clearInterval(flushInterval);
  }, [phase]);

  if (phase === 'idle') return null;

  const allDone = activeStepIndex >= STEPS.length;
  const elapsedMmSs = `${Math.floor(elapsedSeconds / 60)}:${String(elapsedSeconds % 60).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 bg-abyss-950/70 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
      <div
        className={`bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-opacity duration-300 ${
          allDone ? 'opacity-95' : 'opacity-100'
        }`}
      >

        <div className="ocean-gradient relative overflow-hidden px-6 py-5 text-white">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20cx%3D%2220%22%20cy%3D%2220%22%20r%3D%2215%22%20fill%3D%22white%22%20fill-opacity%3D%220.04%22%2F%3E%3C%2Fsvg%3E')] opacity-50" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 bg-white/15 backdrop-blur rounded-xl flex items-center justify-center flex-shrink-0">
                {allDone ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : (
                  <Sparkles className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold">
                  {allDone ? t('aiLoader.completeTitle') : t('aiLoader.title')}
                </h2>
                <p className="text-ocean-100 text-sm mt-0.5">
                  {allDone ? t('aiLoader.completeSubtitle') : t('aiLoader.subtitle')}
                </p>
              </div>
            </div>
            {onCancel && phase === 'live' && (
              <button
                onClick={onCancel}
                className="text-white/70 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                aria-label={t('common.cancel')}
                title={t('common.cancel')}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {phase === 'live' && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3.5 flex items-start gap-3">
            <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 leading-relaxed">
              <span className="font-semibold">{t('aiLoader.disclaimerHeadline')}</span>{' '}
              {t('aiLoader.disclaimerBody')}
            </p>
          </div>
        )}
        {phase === 'flushing' && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3.5 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-800 leading-relaxed">
              <span className="font-semibold">{t('aiLoader.flushHeadline')}</span>{' '}
              {t('aiLoader.flushBody')}
            </p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto dive-scrollbar px-6 py-5">
          <ol className="space-y-2">
            {STEPS.map((step, i) => {
              const isComplete = i < activeStepIndex;
              const isActive = i === activeStepIndex && !allDone;
              const isPending = i > activeStepIndex;
              const Icon = step.icon;

              return (
                <li
                  key={step.key}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200 ${
                    isComplete
                      ? 'bg-emerald-50/60 border-emerald-100'
                      : isActive
                        ? 'bg-ocean-50 border-ocean-200 shadow-sm'
                        : 'bg-abyss-50/50 border-transparent'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
                      isComplete
                        ? 'bg-emerald-500 text-white'
                        : isActive
                          ? 'bg-ocean-500 text-white'
                          : 'bg-abyss-100 text-abyss-400'
                    }`}
                  >
                    {isComplete ? (
                      <Check className="w-4 h-4" />
                    ) : isActive ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium ${
                        isPending ? 'text-abyss-400' : 'text-abyss-800'
                      }`}
                    >
                      {t(`aiLoader.steps.${step.key}.label`)}
                    </p>
                    {isActive && (
                      <p className="text-xs text-ocean-600 mt-0.5">
                        {t(`aiLoader.steps.${step.key}.detail`)}
                      </p>
                    )}
                  </div>

                  {!isActive && !isComplete && (
                    <Icon className="w-4 h-4 text-abyss-300" />
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        <div className="border-t border-ocean-100 px-6 py-3.5 bg-abyss-50/50 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-abyss-500">
            {phase === 'live' ? (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>{t('aiLoader.keepTabOpen')}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{allDone ? t('aiLoader.handingOff') : t('aiLoader.finalising')}</span>
              </>
            )}
          </div>
          <div className="font-mono text-abyss-700 tabular-nums">{elapsedMmSs}</div>
        </div>
      </div>
    </div>
  );
}
