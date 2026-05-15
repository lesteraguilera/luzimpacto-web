// Cloudflare Pages Function: maneja el form de contacto
// Usa Resend (https://resend.com) — API key configurada como env var RESEND_API_KEY (encrypted).
// Envía 2 emails:
//   1. Notificación al equipo: samuel@luzimpacto.org + cc lesteraguilera2004@gmail.com
//   2. Confirmación automática al remitente
//
// Importante: para que el envío a CUALQUIER dirección funcione (incluyendo CC y confirmación al remitente),
// el dominio luzimpacto.org debe estar VERIFICADO en Resend. Si no está verificado, los envíos a direcciones
// distintas de la cuenta Resend serán rechazados — la función igual responde 200 si al menos el email
// principal a samuel@luzimpacto.org funcionó, así no rompe la UX del usuario.

interface ContactPayload {
  nombre?: string;
  email?: string;
  telefono?: string;
  tipo?: string;
  iglesiaColegio?: string;
  mensaje?: string;
  honeypot?: string;
  lang?: string;
}

interface Env {
  RESEND_API_KEY: string;
}

const TIPO_LABELS: Record<string, { es: string; en: string }> = {
  pastor: { es: "Pastor o líder de iglesia", en: "Pastor or church leader" },
  colegio: { es: "Director o profesor de colegio", en: "School director or teacher" },
  donante: { es: "Quiero donar / apoyar económicamente", en: "Want to donate / support" },
  voluntario: { es: "Quiero servir como voluntario", en: "Want to volunteer" },
  joven: { es: "Joven que quiere saber más", en: "Young person who wants to know more" },
  prensa: { es: "Prensa o medios", en: "Press or media" },
  otro: { es: "Otro", en: "Other" },
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

interface ResendEmailPayload {
  from: string;
  to: string[];
  cc?: string[];
  reply_to?: string;
  subject: string;
  html: string;
}

async function sendViaResend(apiKey: string, payload: ResendEmailPayload): Promise<{ ok: boolean; status: number; body: string }> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = await res.text();
  return { ok: res.ok, status: res.status, body };
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ ok: false, error: "config_missing" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  let data: ContactPayload;
  try {
    data = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "invalid_json" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  // Honeypot: si está lleno, descartamos silenciosamente
  if (data.honeypot && data.honeypot.trim().length > 0) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }

  // Validación mínima
  const nombre = (data.nombre ?? "").trim().slice(0, 200);
  const email = (data.email ?? "").trim().toLowerCase().slice(0, 200);
  const telefono = (data.telefono ?? "").trim().slice(0, 50);
  const tipo = (data.tipo ?? "otro").trim().slice(0, 50);
  const iglesiaColegio = (data.iglesiaColegio ?? "").trim().slice(0, 200);
  const mensaje = (data.mensaje ?? "").trim().slice(0, 5000);
  const lang = data.lang === "en" ? "en" : "es";
  const isEn = lang === "en";

  if (!nombre || !email || !mensaje) {
    return new Response(JSON.stringify({ ok: false, error: "missing_fields" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailValid) {
    return new Response(JSON.stringify({ ok: false, error: "invalid_email" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const tipoLabel = TIPO_LABELS[tipo]?.[lang] ?? tipo;
  const yellow = "#FCD34D";
  const charcoal = "#1F2125";

  // ── Email 1: notificación al equipo ──
  const teamSubject = isEn
    ? `[LUZ contact] ${nombre} — ${tipoLabel}`
    : `[Contacto LUZ] ${nombre} — ${tipoLabel}`;

  const teamHtml = `
<!doctype html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#FAF7F2;margin:0;padding:24px;color:${charcoal};">
  <div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;border-left:4px solid ${yellow};padding:32px 28px;">
    <div style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${charcoal};margin-bottom:8px;">${isEn ? "New contact from luzimpacto.org" : "Nuevo contacto desde luzimpacto.org"}</div>
    <h1 style="font-size:22px;margin:0 0 24px;color:${charcoal};">${escapeHtml(nombre)}</h1>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:8px 0;color:#5A5A5A;width:140px;">${isEn ? "Type" : "Tipo"}</td><td style="padding:8px 0;font-weight:600;">${escapeHtml(tipoLabel)}</td></tr>
      <tr><td style="padding:8px 0;color:#5A5A5A;">Email</td><td style="padding:8px 0;"><a href="mailto:${escapeHtml(email)}" style="color:${charcoal};">${escapeHtml(email)}</a></td></tr>
      ${telefono ? `<tr><td style="padding:8px 0;color:#5A5A5A;">${isEn ? "Phone" : "Teléfono"}</td><td style="padding:8px 0;">${escapeHtml(telefono)}</td></tr>` : ""}
      ${iglesiaColegio ? `<tr><td style="padding:8px 0;color:#5A5A5A;">${isEn ? "Church/School" : "Iglesia/Colegio"}</td><td style="padding:8px 0;">${escapeHtml(iglesiaColegio)}</td></tr>` : ""}
    </table>
    <div style="margin-top:24px;padding-top:20px;border-top:1px solid #eee;">
      <div style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#5A5A5A;margin-bottom:10px;">${isEn ? "Message" : "Mensaje"}</div>
      <div style="font-size:15px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(mensaje)}</div>
    </div>
    <div style="margin-top:28px;padding-top:20px;border-top:1px solid #eee;font-size:12px;color:#999;">
      ${isEn ? "Reply directly to this email to respond." : "Respondé directo a este correo para contestarle."}
    </div>
  </div>
</body></html>
  `.trim();

  // ── Email 2: confirmación al remitente ──
  const confirmSubject = isEn
    ? "We received your message — LUZ Impacto"
    : "Recibimos tu mensaje — LUZ Impacto";

  const confirmHtml = `
<!doctype html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#FAF7F2;margin:0;padding:24px;color:${charcoal};">
  <div style="max-width:560px;margin:0 auto;background:white;border-radius:12px;padding:36px 32px;border-top:4px solid ${yellow};">
    <h1 style="font-family:Georgia,serif;font-size:26px;margin:0 0 16px;color:${charcoal};">${isEn ? `Thanks, ${escapeHtml(nombre.split(" ")[0])}.` : `¡Gracias, ${escapeHtml(nombre.split(" ")[0])}!`}</h1>
    <p style="font-size:16px;line-height:1.6;color:${charcoal};margin:0 0 16px;">${isEn ? "We received your message and we'll get back to you within 24 hours." : "Recibimos tu mensaje y te respondemos dentro de las próximas 24 horas."}</p>
    <p style="font-size:15px;line-height:1.6;color:#5A5A5A;margin:0 0 24px;">${isEn ? "If your message is urgent, message us directly on WhatsApp:" : "Si tu mensaje es urgente, escribinos directo por WhatsApp:"}</p>
    <a href="https://wa.me/50685493929" style="display:inline-block;background:${yellow};color:${charcoal};font-weight:700;text-decoration:none;padding:12px 24px;border-radius:8px;">WhatsApp +506 8549 3929</a>
    <div style="margin-top:32px;padding-top:24px;border-top:1px solid #eee;font-size:13px;color:#999;line-height:1.5;">
      ${isEn ? "In the meantime, follow our work on Instagram:" : "Mientras tanto, seguinos en Instagram:"}<br/>
      <a href="https://instagram.com/luzimpacto_cr" style="color:${charcoal};font-weight:600;">@luzimpacto_cr</a>
    </div>
    <div style="margin-top:24px;font-size:12px;color:#bbb;line-height:1.5;">
      ${isEn
        ? "LUZ Impacto, a ministry of Samuel Pizzo Ministries Foundation,<br/>a registered 501(c)(3) nonprofit in the United States.<br/>San José, Costa Rica"
        : "Fundación LUZ Impacto · San José, Costa Rica"}
    </div>
  </div>
</body></html>
  `.trim();

  // FROM: usamos noreply@luzimpacto.org si el dominio está verificado en Resend.
  // Si no está verificado, Resend rechaza el envío con error 403 — el log lo va a mostrar
  // y se puede cambiar temporalmente a "onboarding@resend.dev" para diagnóstico.
  const FROM_TEAM = "LUZ Impacto <noreply@luzimpacto.org>";
  const FROM_CONFIRM = "LUZ Impacto <noreply@luzimpacto.org>";

  // Email al equipo: indispensable. Si falla, devolvemos error y la UX muestra el mensaje de fallback.
  const teamResult = await sendViaResend(apiKey, {
    from: FROM_TEAM,
    to: ["samuel@luzimpacto.org"],
    cc: ["lesteraguilera2004@gmail.com"],
    reply_to: email,
    subject: teamSubject,
    html: teamHtml,
  });

  if (!teamResult.ok) {
    console.error("Resend team email failed:", teamResult.status, teamResult.body);
    return new Response(
      JSON.stringify({ ok: false, error: "team_email_failed", status: teamResult.status }),
      { status: 502, headers: { "content-type": "application/json" } }
    );
  }

  // Email de confirmación: best-effort. Si falla (ej. dominio no verificado todavía), no rompemos la UX:
  // el usuario ya tiene su banner de éxito.
  const confirmResult = await sendViaResend(apiKey, {
    from: FROM_CONFIRM,
    to: [email],
    reply_to: "samuel@luzimpacto.org",
    subject: confirmSubject,
    html: confirmHtml,
  });

  if (!confirmResult.ok) {
    console.warn("Resend confirmation email failed (non-blocking):", confirmResult.status, confirmResult.body);
  }

  return new Response(
    JSON.stringify({ ok: true, confirmation_sent: confirmResult.ok }),
    { status: 200, headers: { "content-type": "application/json" } }
  );
};
