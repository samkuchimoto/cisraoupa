# CISRAOUPA 💀
### Drop your problem. Get destroyed. Get fixed.

> The AI roast machine that turns any life/career situation into a 3-round savage game and delivers a brutally honest solution.

**Stack:** Next.js 14 · Groq (llama-3.1-8b-instant) · Supabase · Resend · Vercel

---

## 🚀 Deploy in 5 steps (< 15 minutes)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "🔥 cisraoupa init"
git remote add origin https://github.com/YOUR_USERNAME/cisraoupa.git
git push -u origin main
```

### 2. Groq — console.groq.com (free)
Sign up → API Keys → Create key → copy `GROQ_API_KEY`

### 3. Supabase — supabase.com (free)
New project → SQL Editor → paste `supabase/schema.sql` → Run
Settings → API → copy `Project URL` and `anon public` key

### 4. Resend — resend.com (free: 3k emails/month)
Sign up → API Keys → Create key → copy `RESEND_API_KEY`
Add & verify your domain (or use `onboarding@resend.dev` for testing)

### 5. Vercel — vercel.com (free)
Import GitHub repo → Add env variables → Deploy

**Environment variables to add in Vercel:**
```
GROQ_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
RESEND_API_KEY=
RESEND_FROM=Cisraoupa <hello@yourdomain.com>
OWNER_EMAIL=you@youremail.com
```

---

## Local dev
```bash
cp .env.example .env.local
# fill in all values
npm install
npm run dev
# → http://localhost:3000
```

---

## 🔥 Virality Launch Playbook (100k users goal)

### Week 1 — Ignition
1. **Post your own roast score on Twitter/X** with the pre-filled caption. Pin it.
2. **Tag 5 friends** who have the specific situation you tested (career people, startup people)
3. **r/careerguidance, r/antiwork, r/cscareerquestions** — post "I built a thing that roasts your career situation" with your actual score
4. **TikTok/Reels**: Record your screen doing the 3 rounds + the roast reveal. No editing needed — the reveal IS the content.
5. **Product Hunt**: Launch on a Tuesday morning 12:01am PT. Focus on "AI roast game" not "AI tool"

### Week 2 — Amplification
6. **Reply to every share** — especially screenshots. The founder replying = more shares
7. **Add a leaderboard page** showing the most brutal roast scores (anonymized) — instant FOMO
8. **Niche communities**: Tech Twitter, GenZ career forums, Black Twitter career spaces — EQUAI's audience

### The share mechanic that makes this spread:
- Everyone gets a different score → natural comparison behavior
- The roast line is always tweet-perfect → people share it to prove the AI "got them"
- "Beat my roast score" = challenge format = infinite loop

---

## Privacy by design
- User situation text is **never stored**
- Only score, category, and roast line hit Supabase
- Email only collected after result is delivered (trust-first)

---

## Architecture
```
app/
  page.js          ← Full game UI (landing → input → 3 rounds → result)
  layout.js        ← Root layout + metadata
  globals.css      ← Chaotic GenZ styles
  api/
    analyze/route.js  ← Groq roast engine
    email/route.js    ← Resend email
lib/
  supabase.js      ← Supabase client
supabase/
  schema.sql       ← DB tables
```

Built different. 💀
