'use client'

import { useState, useEffect, useCallback } from 'react'

interface OnboardingModalProps {
  onComplete: () => void
  onSkip: () => void
}

const STEPS = [
  {
    index: 0,
    label: 'Welcome',
    heading: 'A notebook for ideas that aren\'t ready yet.',
    body: 'Quaternuli is a place for half-formed thoughts — seeds that need time, tending, and the occasional hard question before they\'re ready to use. No pressure to be coherent. Just plant something.',
    aside: null,
  },
  {
    index: 1,
    label: 'Three phases',
    heading: 'Every seed moves through three phases.',
    body: null,
    aside: [
      {
        phase: 'Capture',
        color: 'text-swiss-gray400',
        border: 'border-swiss-gray200',
        desc: 'Dump it raw. A fragment, a question, a half-sentence. Speed over polish.',
      },
      {
        phase: 'Tend',
        color: 'text-swiss-gray600',
        border: 'border-swiss-black',
        desc: 'Return to it. Expand, question, connect. Let it develop slowly.',
      },
      {
        phase: 'Harvest',
        color: 'text-swiss-red',
        border: 'border-swiss-red',
        desc: 'It\'s ready. Export it as Markdown, plain text, HTML, or JSON.',
      },
    ],
  },
  {
    index: 2,
    label: 'The Gardener',
    heading: 'You have a thinking partner.',
    body: 'The Gardener is an AI assistant that reads your seed and responds with observations, Socratic questions, and suggestions. It kicks in automatically when you open a seed — or you can ask it anything directly. Press Mod+G to focus it from anywhere.',
    aside: null,
  },
  {
    index: 3,
    label: 'Get started',
    heading: 'Ready to plant your first seed?',
    body: 'Hit the button below and you\'ll land in a new seed, ready to type. The Gardener will read it and respond once you\'ve written something.',
    aside: null,
  },
]

export default function OnboardingModal({ onComplete, onSkip }: OnboardingModalProps) {
  const [step, setStep] = useState(0)
  const isLast = step === STEPS.length - 1
  const current = STEPS[step]

  const handleNext = useCallback(() => {
    if (isLast) onComplete()
    else setStep(s => s + 1)
  }, [isLast, onComplete])

  const handleBack = () => setStep(s => s - 1)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === 'Enter') handleNext()
      if (e.key === 'ArrowLeft' && step > 0) handleBack()
      if (e.key === 'Escape') onSkip()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [step, handleNext, onSkip])

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      {/* Modal */}
      <div className="relative bg-white border-2 border-swiss-black w-full max-w-md mx-4 flex flex-col">

        {/* Step indicator + skip */}
        <div className="flex items-center justify-between px-6 pt-5 pb-0">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 transition-all ${i === step ? 'w-6 bg-swiss-black' : i < step ? 'w-3 bg-swiss-gray400' : 'w-3 bg-swiss-gray200'}`}
              />
            ))}
          </div>
          <button
            onClick={onSkip}
            className="font-bold text-2xs tracking-wider uppercase text-swiss-gray400 hover:text-swiss-black transition-colors"
          >
            Skip
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pt-6 pb-4 flex flex-col gap-4 min-h-[220px]">
          <div className="font-bold text-2xs tracking-widest uppercase text-swiss-red">
            {current.label}
          </div>
          <h2 className="font-sans font-bold text-xl leading-snug text-swiss-black">
            {current.heading}
          </h2>

          {current.body && (
            <p className="font-sans text-sm text-swiss-gray600 leading-relaxed">
              {current.body}
            </p>
          )}

          {current.aside && (
            <div className="flex flex-col gap-2 mt-1">
              {current.aside.map(({ phase, color, border, desc }) => (
                <div key={phase} className={`border-l-2 ${border} pl-3 py-1`}>
                  <div className={`font-bold text-2xs tracking-widest uppercase mb-0.5 ${color}`}>
                    {phase}
                  </div>
                  <p className="font-sans text-sm text-swiss-gray600 leading-relaxed">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-6 py-4 border-t border-swiss-gray200">
          {step > 0 && (
            <button
              onClick={handleBack}
              className="px-4 py-2 font-bold text-2xs tracking-wider uppercase border border-swiss-gray200 text-swiss-gray400 hover:border-swiss-black hover:text-swiss-black transition-colors"
            >
              ← Back
            </button>
          )}
          <button
            onClick={handleNext}
            className="ml-auto px-5 py-2 font-bold text-2xs tracking-wider uppercase bg-swiss-black text-white hover:bg-swiss-red transition-colors"
          >
            {isLast ? 'Plant your first seed →' : 'Next →'}
          </button>
        </div>

      </div>
    </div>
  )
}
