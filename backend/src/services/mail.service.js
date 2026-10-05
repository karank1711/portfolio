import { Resend } from 'resend';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

let client;

function resendClient() {
  if (!env.resend.apiKey || !env.resend.from || !env.resend.to) {
    throw new ApiError(422, 'Message could not be sent. Try again later.');
  }
  if (!client) client = new Resend(env.resend.apiKey);
  return client;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function singleLine(value) {
  return String(value).replace(/[\r\n]+/g, ' ').trim();
}

export async function notifyContactMessage({ name, email, message }) {
  const safeName = singleLine(name);
  const safeEmail = singleLine(email);
  const body = escapeHtml(message).replace(/\r\n|\r|\n/g, '<br>');
  const resend = resendClient();

  let result;
  try {
    result = await resend.emails.send({
      from: env.resend.from,
      to: env.resend.to,
      replyTo: safeEmail,
      subject: `Portfolio Contact: ${safeName}`,
      text: `Name: ${safeName}\nEmail: ${safeEmail}\n\n${message}`,
      html: `<div style="font-family:Georgia,serif;color:#1a1814;line-height:1.6">
<p style="margin:0 0 16px">New message from the portfolio contact form.</p>
<p style="margin:0 0 12px"><strong>Name</strong><br>${escapeHtml(safeName)}</p>
<p style="margin:0 0 12px"><strong>Email</strong><br>${escapeHtml(safeEmail)}</p>
<p style="margin:0"><strong>Message</strong><br>${body}</p>
</div>`,
    });
  } catch {
    throw new ApiError(422, 'Message could not be sent. Try again later.');
  }

  if (result?.error) {
    throw new ApiError(422, 'Message could not be sent. Try again later.');
  }
}
