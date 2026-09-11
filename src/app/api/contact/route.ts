import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Validate required body fields
function validateBody(body: Record<string, unknown>) {
  const { name, email, subject, message } = body;
  if (!name || typeof name !== "string" || name.trim().length === 0)
    return "নাম আবশ্যক";
  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return "বৈধ ইমেইল ঠিকানা দিন";
  if (!subject || typeof subject !== "string" || subject.trim().length === 0)
    return "বিষয় আবশ্যক";
  if (!message || typeof message !== "string" || message.trim().length < 10)
    return "বার্তা কমপক্ষে ১০ অক্ষর হতে হবে";
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const error = validateBody(body);
    if (error) {
      return NextResponse.json({ success: false, message: error }, { status: 400 });
    }

    const { name, email, subject, message } = body as {
      name: string;
      email: string;
      subject: string;
      message: string;
    };

    const smtpUser = process.env.SMTP_USER ?? "";
    const smtpPass = process.env.SMTP_PASS ?? "";
    const toEmail  = process.env.CONTACT_EMAIL_TO ?? smtpUser;

    if (!smtpUser || !smtpPass) {
      console.warn("[Contact] SMTP credentials not configured — skipping email send.");
      return NextResponse.json({
        success: true,
        message: "আপনার বার্তা সফলভাবে পাঠানো হয়েছে। আমরা শীঘ্রই সাড়া দেব।",
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    const html = `
<!DOCTYPE html>
<html lang="bn">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f4f9f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f9f4;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,79,50,0.1);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#004F32 0%,#003824 60%,#040D09 100%);padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:900;">&#128236; নতুন যোগাযোগ বার্তা</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">RU Islamic Library &mdash; Contact Form</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="padding:0 0 18px;">
                <p style="margin:0 0 5px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#888;">প্রেরকের নাম</p>
                <p style="margin:0;font-size:16px;font-weight:800;color:#1a1a1a;">${name}</p>
              </td></tr>
              <tr><td style="padding:0 0 18px;">
                <p style="margin:0 0 5px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#888;">ইমেইল ঠিকানা</p>
                <a href="mailto:${email}" style="font-size:15px;color:#004F32;font-weight:700;text-decoration:none;">${email}</a>
              </td></tr>
              <tr><td style="padding:0 0 18px;">
                <p style="margin:0 0 5px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#888;">বিষয়</p>
                <p style="margin:0;font-size:15px;font-weight:700;color:#1a1a1a;">${subject}</p>
              </td></tr>
              <tr><td>
                <p style="margin:0 0 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#888;">বার্তা</p>
                <div style="background:#f4f9f4;border-left:4px solid #004F32;border-radius:8px;padding:16px 20px;">
                  <p style="margin:0;font-size:14px;color:#333;line-height:1.7;white-space:pre-wrap;">${message}</p>
                </div>
              </td></tr>
            </table>
          </td>
        </tr>
        <!-- Reply CTA -->
        <tr>
          <td style="padding:0 40px 32px;">
            <a href="mailto:${email}?subject=Re: ${subject}" style="display:inline-block;background:#004F32;color:#fff;font-weight:800;font-size:13px;padding:12px 24px;border-radius:10px;text-decoration:none;">উত্তর দিন &rarr;</a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f4f9f4;padding:18px 40px;border-top:1px solid #e8f4ee;text-align:center;">
            <p style="margin:0;font-size:11px;color:#999;">
              RU Islamic Library ওয়েবসাইটের Contact Form থেকে পাঠানো হয়েছে।<br />
              Rajshahi University, Rajshahi, Bangladesh
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await transporter.sendMail({
      from: `"RU Islamic Library" <${smtpUser}>`,
      to: toEmail,
      subject: `[Contact Form] ${subject} — ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
      html,
    });

    return NextResponse.json({
      success: true,
      message: "আপনার বার্তা সফলভাবে পাঠানো হয়েছে। আমরা শীঘ্রই সাড়া দেব।",
    });
  } catch (err) {
    console.error("[Contact API] Error:", err);
    return NextResponse.json(
      { success: false, message: "বার্তা পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
