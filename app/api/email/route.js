import { Resend } from 'resend'
import { supabase } from '@/lib/supabase'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req) {
  try {
    const { email, score, roast_line, solution, roast_id } = await req.json()

    if (!email || !email.includes('@')) {
      return Response.json({ error: 'That email is sus' }, { status: 400 })
    }

    // Save signup to Supabase
    await supabase.from('cisraoupa_signups').upsert({
      email,
      score,
      roast_line,
    }, { onConflict: 'email' })

    // Update roast with email
    if (roast_id) {
      await supabase.from('cisraoupa_roasts')
        .update({ email })
        .eq('id', roast_id)
    }

    // Notify owner
    await resend.emails.send({
      from: process.env.RESEND_FROM || 'Cisraoupa <hello@cisraoupa.com>',
      to: process.env.OWNER_EMAIL || 'owner@cisraoupa.com',
      subject: `💀 New roast signup — score ${score}/100`,
      html: `<p><b>${email}</b> got roasted with <b>${score}/100</b></p><p><i>"${roast_line}"</i></p>`,
    })

    // Send result email to user
    const emailHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Your Cisraoupa Roast</title>
</head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:Arial Black,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;">
<tr><td align="center" style="padding:40px 20px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- Header -->
  <tr><td style="background:#FFE600;padding:24px 32px;border-radius:12px 12px 0 0;">
    <div style="font-size:28px;font-weight:900;color:#0A0A0A;letter-spacing:-1px;">
      CISRAOUPA 💀
    </div>
    <div style="font-size:13px;color:#0A0A0A;opacity:0.7;margin-top:4px;font-weight:700;font-family:Arial,sans-serif;">
      The roast machine. For real ones.
    </div>
  </td></tr>

  <!-- Score -->
  <tr><td style="background:#1a1a1a;padding:32px;text-align:center;border-left:3px solid #FFE600;border-right:3px solid #FFE600;">
    <div style="font-size:14px;color:#888;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px;">YOUR ROAST SCORE</div>
    <div style="font-size:96px;font-weight:900;color:#FFE600;line-height:1;letter-spacing:-4px;">${score}</div>
    <div style="font-size:20px;color:#555;font-weight:900;">/100</div>
  </td></tr>

  <!-- Roast line -->
  <tr><td style="background:#111;padding:24px 32px;border-left:3px solid #FFE600;border-right:3px solid #FFE600;">
    <div style="font-size:11px;color:#FFE600;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px;">💀 THE ROAST</div>
    <div style="font-size:20px;color:white;font-weight:900;line-height:1.4;font-style:italic;">"${roast_line}"</div>
  </td></tr>

  <!-- Solution -->
  <tr><td style="background:#0d0d0d;padding:24px 32px;border-left:3px solid #FFE600;border-right:3px solid #FFE600;">
    <div style="font-size:11px;color:#00FF88;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:2px;margin-bottom:16px;">⚡ THE FIX</div>
    <div style="font-size:15px;color:#ccc;line-height:1.7;font-family:Arial,sans-serif;white-space:pre-line;">${solution}</div>
  </td></tr>

  <!-- CTA -->
  <tr><td style="background:#1a1a1a;padding:32px;text-align:center;border-left:3px solid #FFE600;border-right:3px solid #FFE600;">
    <div style="font-size:14px;color:#888;font-family:Arial,sans-serif;margin-bottom:20px;">
      Share your roast. Let your friends get destroyed too.
    </div>
    <a href="https://cisraoupa.com" style="display:inline-block;background:#FFE600;color:#0A0A0A;font-weight:900;font-size:16px;padding:14px 32px;border-radius:8px;text-decoration:none;letter-spacing:-0.5px;">
      ROAST SOMEONE ELSE →
    </a>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#0A0A0A;padding:20px 32px;border-radius:0 0 12px 12px;border-left:3px solid #333;border-right:3px solid #333;border-bottom:3px solid #333;">
    <div style="font-size:11px;color:#444;font-family:Arial,sans-serif;text-align:center;">
      Cisraoupa — Savage. Honest. Viral. · <a href="https://cisraoupa.com" style="color:#FFE600;text-decoration:none;">cisraoupa.com</a>
    </div>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`

    await resend.emails.send({
      from: process.env.RESEND_FROM || 'Cisraoupa <hello@cisraoupa.com>',
      to: email,
      subject: `You got a ${score}/100 💀 — here's your full roast`,
      html: emailHtml,
    })

    return Response.json({ success: true })

  } catch (err) {
    console.error('Email error:', err)
    return Response.json({ error: 'Email blew up' }, { status: 500 })
  }
}
