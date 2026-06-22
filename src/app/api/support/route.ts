import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { SupportNotification } from "@/emails/SupportNotification";
import { SupportAutoReply } from "@/emails/SupportAutoReply";
import { render } from "@react-email/components";

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = `qu00b <${process.env.EMAIL_FROM}>`;

    await Promise.all([
      resend.emails.send({
        from,
        to: process.env.SUPPORT_NOTIFICATION_EMAIL!,
        subject: `[qu00b] Support: ${name}`,
        html: await render(SupportNotification({ name, email, message })),
      }),
      resend.emails.send({
        from,
        to: email,
        subject: "We got your message — qu00b support",
        html: await render(SupportAutoReply({ name })),
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[support]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
