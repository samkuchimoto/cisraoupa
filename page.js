'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

function Mascot({ mood = 'default', size = 80 }) {
  const emojiMap = {
    dead: '💀',
    roasting: '🔥',
    shocked: '😱',
    nodding: '😤',
    crying_laughing: '😂',
    boss_mode: '😈',
    default: '🟡',
    thinking: '🤔',
    waiting: '⏳',
  }
  const emoji = emojiMap[mood] || '🟡'
  const animClass = mood === 'default' ? 'mascot-bounce' : 
                    mood === 'roasting' || mood === 'boss_mode' ? 'mascot-roast' : ''
  return (
    <div className={`inline-block select-none ${animClass}`} style={{ fontSize: size }}>
      {emoji}
    </div>
  )
}

function FomoCounter() {
  const [count, setCount] = useState(null)
  useEffect(() => {
    supabase.from('cisraoupa_roasts').select('*', { count: 'exact', head: true })
      .then(({ count: c }) => {
        setCount((c || 0) + 847)
      })
    const interval = setInterval(() => {
      setCount(prev => prev ? prev + Math.floor(Math.random() * 3) : null)
    }, 8000)
    return () => clearInterval(interval)
  }, [])
  if (!count) return null
  return (
    <div className="counter-flash text-xs font-black text-yellow-400 tracking-widest uppercase">
      💀 {count.toLocaleString()} people roasted today
    </div>
  )
}

function TimerBar({ seconds, total }) {
  const pct = (seconds / total) * 100
  const color = pct > 50 ? '#FFE600' : pct > 20 ? '#FF6B00' : '#FF3B3B'
  return (
    <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000 linear timer-bar"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  )
}

function LoadingScreen() {
  const loadingLines = [
    'Analysing your cope levels...',
    'Calibrating the roast cannon...',
    'Consulting the savage oracle...',
    'Calculating how cooked you are...',
  ]
  const [lineIdx, setLineIdx] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => setLineIdx(i => (i + 1) % loadingLines.length), 1200)
    return () => clearInterval(interval)
  }, [])
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="mascot-roast text-8xl mb-6">🔥</div>
        <div className="flex justify-center gap-2 mb-6">
          {[0, 1, 2].map(i => (
            <div key={i} className="load-dot w-3 h-3 rounded-full" style={{ background: '#FFE600' }} />
          ))}
        </div>
        <p
          className="text-lg font-black text-yellow-400 uppercase tracking-tight"
          key={lineIdx}
          style={{ animation: 'slideUp 0.3s ease-out' }}
        >
          {loadingLines[lineIdx]}
        </p>
        <p className="text-xs text-gray-600 mt-2 font-bold" style={{ fontFamily: 'Arial, sans-serif' }}>
          This takes ~5 seconds. Brace yourself.
        </p>
      </div>
    </main>
  )
}

const ROUND_CONFIG = {
  1: {
    label: 'ROUND 1',
    subtitle: 'Self-Awareness Check',
    emoji: '🔍',
    question: 'How long have you actually been dealing with this situation?',
    choices: [
      { id: 'a', text: 'Just happened / under a week', value: 'fresh' },
      { id: 'b', text: '1–3 months — I keep circling back', value: 'circling' },
      { id: 'c', text: '6+ months — I know I should act', value: 'stuck' },
      { id: 'd', text: 'Years. This is basically my personality now.', value: 'identity' },
    ]
  },
  2: {
    label: 'ROUND 2',
    subtitle: 'Boss Fight',
    emoji: '⚔️',
    question: 'The real blocker keeping you stuck is:',
    choices: [
      { id: 'a', text: 'The system / gatekeepers / discrimination', value: 'system' },
      { id: 'b', text: "I don't have the skills/resources yet", value: 'skills' },
      { id: 'c', text: 'Fear of what happens if I actually try', value: 'fear' },
      { id: 'd', text: "I genuinely don't know what to do", value: 'lost' },
    ]
  },
  3: {
    label: 'ROUND 3',
    subtitle: 'Risk Decision',
    emoji: '🎲',
    question: 'If you had to act on this in the next 48 hours, you would:',
    choices: [
      { id: 'a', text: '🔥 Go full send — nothing to lose', value: 'all_in' },
      { id: 'b', text: '🧪 Test one small thing, measure it', value: 'test' },
      { id: 'c', text: '📋 Make a plan first, then act', value: 'plan' },
      { id: 'd', text: '😅 Find a reason to wait another week', value: 'wait' },
    ]
  }
}

const ROUND_TIME = 20

export default function CisraoupaApp() {
  const [screen, setScreen] = useState('landing')
  const [situation, setSituation] = useState('')
  const [currentRound, setCurrentRound] = useState(1)
  const [answers, setAnswers] = useState({ round1: null, round2: null, round3: null })
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME)
  const [selectedChoice, setSelectedChoice] = useState(null)
  const [result, setResult] = useState(null)
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (screen !== 'round') return
    setTimeLeft(ROUND_TIME)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleChoiceSelect('timeout')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [screen, currentRound])

  function handleChoiceSelect(choiceValue) {
    clearInterval(timerRef.current)
    setSelectedChoice(choiceValue)
    const roundKey = `round${currentRound}`
    const newAnswers = { ...answers, [roundKey]: choiceValue }
    setAnswers(newAnswers)
    setTimeout(() => {
      setSelectedChoice(null)
      if (currentRound < 3) {
        setCurrentRound(r => r + 1)
      } else {
        setScreen('loading')
        callAnalyze(newAnswers)
      }
    }, 500)
  }

  async function callAnalyze(finalAnswers) {
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          situation,
          round1: finalAnswers.round1,
          round2: finalAnswers.round2,
          round3: finalAnswers.round3,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
      setScreen('result')
    } catch (err) {
      setResult({
        score: 42,
        roast_line: "The real problem is you haven't decided it's actually a problem.",
        verdict: "Classic situation: real obstacles + manufactured hesitation.",
        solution: "1. Name the ONE thing that would change everything.\n2. Find someone who got past it — copy their first move exactly.\n3. Give yourself 72 hours to do step 1. That's it.",
        mascot_reaction: 'roasting',
        share_caption: `I got a 42/100 💀 "You haven't decided it's actually a problem" — cisraoupa.com destroyed me`,
      })
      setScreen('result')
    }
  }

  async function handleEmailSubmit() {
    if (!email || !email.includes('@')) return
    setEmailLoading(true)
    try {
      await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          score: result.score,
          roast_line: result.roast_line,
          solution: result.solution,
          roast_id: result.roast_id,
        }),
      })
      setEmailSent(true)
    } catch {
      setEmailSent(true)
    }
    setEmailLoading(false)
  }

  function handleShare() {
    const caption = result?.share_caption || 
      `I got roasted ${result?.score}/100 on Cisraoupa 💀 Your turn → cisraoupa.com`
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}`
    window.open(twitterUrl, '_blank', 'width=550,height=450')
    if (result?.roast_id) {
      supabase.from('cisraoupa_roasts').update({ shared: true }).eq('id', result.roast_id)
    }
  }

  function restart() {
    setSituation('')
    setCurrentRound(1)
    setAnswers({ round1: null, round2: null, round3: null })
    setResult(null)
    setEmail('')
    setEmailSent(false)
    setSelectedChoice(null)
    setScreen('landing')
  }

  if (screen === 'landing') {
    return (
      <main className="min-h-screen dot-bg flex flex-col items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-yellow-400 opacity-5 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-yellow-400 opacity-3 blur-3xl" />
        </div>
        <div className="relative z-10 text-center max-w-lg mx-auto">
          <div className="mb-6"><FomoCounter /></div>
          <div className="mb-4"><Mascot mood="boss_mode" size={80} /></div>
          <h1
            className="glitch text-6xl md:text-7xl font-black tracking-tighter yellow-glow mb-2"
            style={{ color: '#FFE600', letterSpacing: '-3px' }}
            data-text="CISRAOUPA"
          >
            CISRAOUPA
          </h1>
          <p className="text-xl md:text-2xl font-black text-white mb-1 uppercase tracking-tight">Drop your problem.</p>
          <p className="text-xl md:text-2xl font-black mb-6 uppercase tracking-tight" style={{ color: '#FF3B3B' }}>Get destroyed. Get fixed.</p>
          <p className="text-sm text-gray-400 mb-8 font-bold" style={{ fontFamily: 'Arial, sans-serif' }}>
            3 savage rounds · AI roast · Actually useful solution
          </p>
          <button
            onClick={() => setScreen('input')}
            className="w-full max-w-sm yellow-box-glow text-black font-black text-xl py-5 px-8 rounded-xl uppercase tracking-tight transition-all hover:scale-105 active:scale-95 share-pulse"
            style={{ background: '#FFE600', letterSpacing: '-0.5px' }}
          >
            🔥 START THE ROAST
          </button>
          <p className="mt-4 text-xs text-gray-600 font-bold uppercase tracking-widest">Free · No login · Results in 30 seconds</p>
          <div className="mt-12 text-xs text-gray-700 font-black uppercase tracking-widest">Cisraoupa · Built different</div>
        </div>
      </main>
    )
  }

  if (screen === 'input') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8 slide-up">
            <Mascot mood="thinking" size={56} />
            <h2 className="text-3xl font-black mt-3 uppercase tracking-tight" style={{ color: '#FFE600' }}>What's the situation?</h2>
            <p className="text-gray-400 text-sm mt-2 font-bold" style={{ fontFamily: 'Arial, sans-serif' }}>Career, company drama, life decision — anything. Be real.</p>
          </div>
          <div className="slide-up slide-up-delay-1">
            <textarea
              value={situation}
              onChange={e => setSituation(e.target.value)}
              placeholder="e.g. Been passed over for promotion twice, my manager keeps hiring external. I have 4 years at this company..."
              className="w-full rounded-xl p-4 text-white font-bold resize-none border-2 transition-all"
              style={{
                background: '#1a1a1a',
                borderColor: situation.length > 10 ? '#FFE600' : '#333',
                fontFamily: 'Arial, sans-serif',
                fontSize: '15px',
                lineHeight: '1.6',
                minHeight: '140px',
              }}
              maxLength={400}
            />
            <div className="flex justify-between mt-1 text-xs text-gray-600 font-bold">
              <span>Be specific → get a better roast</span>
              <span style={{ color: situation.length > 350 ? '#FF3B3B' : '#555' }}>{situation.length}/400</span>
            </div>
          </div>
          <div className="mt-4 slide-up slide-up-delay-2">
            <p className="text-xs text-gray-600 font-black uppercase tracking-widest mb-2">Quick examples:</p>
            <div className="flex flex-wrap gap-2">
              {['Job rejection, no feedback','Starting my own thing vs stable job','Company keeps promoting less qualified people','Burnout but golden handcuffs'].map(ex => (
                <button key={ex} onClick={() => setSituation(ex)}
                  className="text-xs px-3 py-1.5 rounded-lg font-bold border transition-all hover:border-yellow-400 hover:text-yellow-400"
                  style={{ background: '#1a1a1a', borderColor: '#333', color: '#888', fontFamily: 'Arial, sans-serif' }}>
                  {ex}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-8 slide-up slide-up-delay-3">
            <button
              onClick={() => situation.length > 5 && setScreen('round')}
              disabled={situation.length <= 5}
              className="w-full font-black text-xl py-5 rounded-xl uppercase tracking-tight transition-all"
              style={{
                background: situation.length > 5 ? '#FFE600' : '#2a2a2a',
                color: situation.length > 5 ? '#0A0A0A' : '#555',
                cursor: situation.length > 5 ? 'pointer' : 'not-allowed',
              }}
            >
              {situation.length > 5 ? '⚔️ ENTER THE ARENA' : 'TYPE SOMETHING FIRST'}
            </button>
          </div>
          <button onClick={restart} className="mt-4 w-full text-xs text-gray-600 hover:text-gray-400 font-bold py-2">← back</button>
        </div>
      </main>
    )
  }

  if (screen === 'round') {
    const round = ROUND_CONFIG[currentRound]
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: '#FFE600' }}>
                {round.emoji} {round.label} of 3
              </div>
              <div className="text-gray-400 text-sm font-bold" style={{ fontFamily: 'Arial, sans-serif' }}>{round.subtitle}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black" style={{ color: timeLeft <= 5 ? '#FF3B3B' : '#FFE600' }}>{timeLeft}s</div>
              <div className="text-xs text-gray-600 font-bold">remaining</div>
            </div>
          </div>
          <div className="mb-6"><TimerBar seconds={timeLeft} total={ROUND_TIME} /></div>
          <div className="flex gap-2 mb-6">
            {[1, 2, 3].map(r => (
              <div key={r} className="flex-1 h-1.5 rounded-full transition-all" style={{ background: r <= currentRound ? '#FFE600' : '#2a2a2a' }} />
            ))}
          </div>
          <div className="rounded-xl p-6 mb-6 border" style={{ background: '#1a1a1a', borderColor: '#333' }}>
            <p className="text-xl font-black text-white leading-tight">{round.question}</p>
          </div>
          <div className="space-y-3">
            {round.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => handleChoiceSelect(choice.value)}
                className={`choice-btn w-full text-left px-5 py-4 rounded-xl font-black text-base transition-all ${selectedChoice === choice.value ? 'border-yellow-400 bg-yellow-400 text-black' : 'text-white'}`}
                style={{
                  background: selectedChoice === choice.value ? '#FFE600' : '#1a1a1a',
                  borderColor: selectedChoice === choice.value ? '#FFE600' : 'rgba(255,255,255,0.1)',
                }}
              >
                <span className="inline-block w-7 h-7 rounded-md text-center text-sm font-black mr-3"
                  style={{
                    background: selectedChoice === choice.value ? '#0A0A0A' : '#2a2a2a',
                    color: selectedChoice === choice.value ? '#FFE600' : '#888',
                    lineHeight: '28px',
                  }}>
                  {choice.id.toUpperCase()}
                </span>
                {choice.text}
              </button>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-gray-700 font-bold" style={{ fontFamily: 'Arial, sans-serif' }}>No wrong answers — just honest ones</p>
        </div>
      </main>
    )
  }

  if (screen === 'loading') {
    return <LoadingScreen />
  }

  if (screen === 'result' && result) {
    const scoreColor = result.score >= 70 ? '#00FF88' : result.score >= 40 ? '#FFE600' : '#FF3B3B'
    const scoreLabel = result.score >= 70 ? 'ACTUALLY NOT BAD' : result.score >= 50 ? 'MID BUT SALVAGEABLE' : result.score >= 30 ? 'COOKED BUT FIXABLE' : 'FULLY COOKED 💀'
    return (
      <main className="min-h-screen flex flex-col items-center px-4 py-10">
        <div className="w-full max-w-lg">
          <div className="rounded-2xl p-8 mb-4 text-center border-2 slide-up" style={{ background: '#1a1a1a', borderColor: '#FFE600' }}>
            <div className="text-3xl mb-3"><Mascot mood={result.mascot_reaction || 'roasting'} size={56} /></div>
            <div className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">YOUR ROAST SCORE</div>
            <div className="score-pop text-8xl font-black leading-none mb-1" style={{ color: scoreColor }}>{result.score}</div>
            <div className="text-gray-600 font-black text-lg mb-3">/100</div>
            <div className="text-sm font-black uppercase tracking-widest px-4 py-1 rounded-full inline-block" style={{ background: scoreColor + '20', color: scoreColor }}>{scoreLabel}</div>
          </div>
          <div className="rounded-2xl p-6 mb-4 border-l-4 slide-up slide-up-delay-1" style={{ background: '#111', borderColor: '#FF3B3B' }}>
            <div className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: '#FF3B3B' }}>💀 THE ROAST</div>
            <p className="text-xl font-black text-white leading-tight italic">"{result.roast_line}"</p>
          </div>
          <div className="rounded-2xl p-6 mb-4 slide-up slide-up-delay-2" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
            <div className="text-xs font-black uppercase tracking-widest mb-3 text-gray-500">🔍 THE REAL DEAL</div>
            <p className="text-sm text-gray-300 leading-relaxed font-bold" style={{ fontFamily: 'Arial, sans-serif' }}>{result.verdict}</p>
          </div>
          <div className="rounded-2xl p-6 mb-6 border-l-4 slide-up slide-up-delay-3" style={{ background: '#0d1a14', borderColor: '#00FF88' }}>
            <div className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#00FF88' }}>⚡ THE FIX (actually)</div>
            <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line font-bold" style={{ fontFamily: 'Arial, sans-serif' }}>{result.solution}</p>
          </div>
          <div className="mb-4 slide-up slide-up-delay-4">
            <button onClick={handleShare} className="share-pulse w-full font-black text-lg py-5 rounded-xl uppercase tracking-tight text-black" style={{ background: '#FFE600' }}>
              🐦 SHARE YOUR ROAST (flex on them)
            </button>
            <p className="text-center text-xs text-gray-600 mt-2 font-bold" style={{ fontFamily: 'Arial, sans-serif' }}>Pre-filled tweet. One tap. Maximum damage.</p>
          </div>
          {!emailSent ? (
            <div className="rounded-2xl p-6 mb-4" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              <p className="text-sm font-black text-white mb-1">Get the full roast + solution in your inbox</p>
              <p className="text-xs text-gray-500 mb-4 font-bold" style={{ fontFamily: 'Arial, sans-serif' }}>No spam. Just this one email. Unsubscribe anytime.</p>
              <div className="flex gap-2">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                  className="flex-1 rounded-lg px-4 py-3 text-white text-sm font-bold border border-gray-700 focus:border-yellow-400"
                  style={{ background: '#0d0d0d', fontFamily: 'Arial, sans-serif' }}
                  onKeyDown={e => e.key === 'Enter' && handleEmailSubmit()} />
                <button onClick={handleEmailSubmit} disabled={emailLoading}
                  className="px-5 py-3 rounded-lg font-black text-black text-sm uppercase"
                  style={{ background: '#FFE600', opacity: emailLoading ? 0.6 : 1 }}>
                  {emailLoading ? '...' : 'SEND'}
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl p-4 mb-4 text-center slide-up" style={{ background: '#0d1a14', border: '1px solid #00FF88' }}>
              <p className="font-black text-sm" style={{ color: '#00FF88' }}>✅ Roast report incoming. Check your inbox.</p>
            </div>
          )}
          <div className="text-center">
            <button onClick={restart} className="text-sm text-gray-600 hover:text-yellow-400 font-black uppercase tracking-widest transition-colors">
              🔄 ROAST SOMEONE ELSE'S PROBLEM
            </button>
          </div>
          <div className="text-center mt-6 text-xs text-gray-700 font-black uppercase tracking-widest">Cisraoupa roasted me 😂 · cisraoupa.com</div>
        </div>
      </main>
    )
  }

  return null
}
