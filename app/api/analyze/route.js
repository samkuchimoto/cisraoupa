import Groq from 'groq-sdk'
import { supabase } from '@/lib/supabase'

export async function POST(req) {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const { situation, round1, round2, round3, category } = await req.json()

    if (!situation || situation.length < 5) {
      return Response.json({ error: 'Give us something to work with 💀' }, { status: 400 })
    }

    // VIRALITY: Groq prompt engineered for maximum shareability
    // The roast line MUST be tweet-length and devastatingly accurate
    const prompt = `You are Cisraoupa — a savage, unfiltered AI mascot. You are chaotic, funny, brutally honest, and GenZ as hell. You call out excuses, biases, and cope.

The user dropped this situation: "${situation.slice(0, 300)}"

They answered 3 game rounds:
- Round 1 (self-awareness quiz): ${round1 || 'skipped'}
- Round 2 (boss fight choice): ${round2 || 'skipped'}  
- Round 3 (risk decision): ${round3 || 'skipped'}

Generate a JSON response (ONLY JSON, no markdown, no extra text):
{
  "score": <integer 0-100, be real, most people get 30-70>,
  "roast_line": "<ONE savage sentence under 120 chars. This will be tweeted. Make it HURT but be true. No slurs. GenZ energy.>",
  "verdict": "<2-3 sentence breakdown. Funny + honest. Call out the specific cope or bias in their situation.>",
  "solution": "<3 concrete steps. Not generic advice. Specific to their EXACT situation. Number them 1. 2. 3.>",
  "mascot_reaction": "<one of: dead, roasting, shocked, nodding, crying_laughing, boss_mode>",
  "category": "<one of: career, company_bias, life_decision, relationship, money, other>",
  "share_caption": "<pre-filled tweet under 200 chars. Include score, a brutal quote from the roast, and 'cisraoupa.com'. Funny and shareable.>"
}`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.85, // High temp = more savage/unpredictable
      max_tokens: 600,
    })

    const rawText = completion.choices[0]?.message?.content || ''
    
    // Parse JSON safely
    let result
    try {
      const cleaned = rawText.replace(/```json|```/g, '').trim()
      result = JSON.parse(cleaned)
    } catch {
      // Fallback if JSON parse fails
      result = {
        score: 42,
        roast_line: "You already know what the problem is. You just want permission to ignore it.",
        verdict: "The situation is exactly what it looks like. The system is real, but so is the cope.",
        solution: "1. Write down the actual blocker (be specific). 2. Find one person who did it anyway. 3. Copy their first step, not their whole path.",
        mascot_reaction: "roasting",
        category: category || "other",
        share_caption: `I got roasted with a ${42}/100 💀 "You already know what the problem is" — cisraoupa.com will destroy you too`
      }
    }

    // Save to Supabase (no situation text stored — privacy by design)
    const { data: saved } = await supabase
      .from('cisraoupa_roasts')
      .insert({
        score: result.score,
        situation_category: result.category,
        roast_line: result.roast_line,
        solution_preview: result.solution?.slice(0, 100),
        round1_answer: round1,
        round2_answer: round2,
        round3_answer: round3,
      })
      .select('id')
      .single()

    return Response.json({ ...result, roast_id: saved?.id })

  } catch (err) {
    console.error('Analyze error:', err)
    return Response.json({ error: 'The roast machine exploded. Try again.' }, { status: 500 })
  }
}
