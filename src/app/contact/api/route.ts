
import { NextResponse, type NextRequest } from 'next/server';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import { rateLimiter, RATE_LIMIT_COUNT } from '../_lib/rate-limiter';
import { analyzeSubmission } from '../_ai/spam-filter';
import { personalizeResponse } from '../_ai/personalize-response';
import { logSubmission } from '../_lib/logging';

// Zod schema for input validation
const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').trim(),
  email: z.string().email('Please enter a valid email address.').trim(),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters.')
    .max(15000, 'Message must not exceed 15000 characters.')
    .trim(),
  honeypot: z.string().optional(),
});

// Helper function to sanitize string inputs by stripping HTML tags
const sanitize = (str: string) => str.replace(/<[^>]*>?/gm, '');

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';

  try {
    const currentUsage = rateLimiter.get(ip) || 0;
    if (currentUsage >= RATE_LIMIT_COUNT) {
      await logSubmission({
        level: 'warn',
        message: 'Rate limit exceeded',
        data: { ip, userAgent: req.headers.get('user-agent') },
      });
      return NextResponse.json(
        { message: 'Too many requests, please try again later.' },
        { status: 429 }
      );
    }
    rateLimiter.set(ip, currentUsage + 1);

    const requiredEnvVars = [
      'SMTP_USER',
      'SMTP_PASS',
      'FROM_EMAIL',
      'TO_EMAIL',
      'GOOGLE_API_KEY',
    ];
    const missingEnvVars = requiredEnvVars.filter((v) => !process.env[v]);

    if (missingEnvVars.length > 0) {
      const errorMessage = `Server configuration error: The following environment variables are missing: ${missingEnvVars.join(
        ', '
      )}. Please ensure they are set in your .env.local file and restart the server.`;
      await logSubmission({ level: 'error', message: errorMessage, data: {} });
      return NextResponse.json({ message: errorMessage }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get('attachment') as File | null;

    const body = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
      honeypot: formData.get('honeypot'),
    };

    const parsed = contactFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid input.', errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    if (file && file.size > 25 * 1024 * 1024) { // 25MB limit
      return NextResponse.json(
        { message: 'File size exceeds the 25MB limit.' },
        { status: 400 }
      );
    }

    const { name, email, message, honeypot } = parsed.data;

    const spamAnalysis = await analyzeSubmission({
      ipAddress: ip,
      content: message,
      honeypotFilled: !!honeypot,
    });

    if (spamAnalysis.isSpam) {
      await logSubmission({
        level: 'info',
        message: 'Spam submission detected and blocked.',
        data: { reason: spamAnalysis.reason, ip },
      });
      // To prevent bots from knowing they were blocked, we return a success message.
      // The AI will generate a generic thank you message for this case.
      const personalizedResponseData = await personalizeResponse({ message: 'spam' });
      return NextResponse.json(
        {
          message: 'Your message has been sent successfully.',
          personalizedMessage: personalizedResponseData.personalizedMessage,
        },
        { status: 200 }
      );
    }

    const sanitizedName = sanitize(name);
    const sanitizedEmail = sanitize(email);
    const sanitizedMessage = sanitize(message);

    const fromName = process.env.FROM_NAME || 'Om Prakash';

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const attachments = [];
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      attachments.push({
        filename: file.name,
        content: buffer,
        contentType: file.type,
      });
    }

    // 1. Email to the site administrator
    const mailToAdminOptions = {
      from: `"${fromName}" <${process.env.FROM_EMAIL}>`,
      to: process.env.TO_EMAIL,
      replyTo: sanitizedEmail,
      subject: `New Website Message from ${sanitizedName}`,
      text: `You have a new contact form submission.\n\nFrom: ${sanitizedName}\nEmail: ${sanitizedEmail}\n\nMessage:\n${sanitizedMessage}\n\nYou can reply to this email directly to respond to ${sanitizedName}.`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
            .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1); border: 1px solid #e0e0e0; }
            .header { background-color: #2E8B57; color: #ffffff; padding: 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 30px; line-height: 1.6; color: #333333; }
            .content h2 { color: #2E8B57; font-size: 20px; }
            .message-box { background-color: #f9f9f9; border-left: 4px solid #4682B4; padding: 15px; margin: 20px 0; }
            .details p { margin: 5px 0; font-size: 16px; }
            .cta-button { display: inline-block; background-color: #2E8B57; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; text-align: center; }
            .footer { background-color: #eeeeee; color: #777777; padding: 15px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Message!</h1>
            </div>
            <div class="content">
              <h2>You've received a new message.</h2>
              <div class="details">
                <p><strong>From:</strong> ${sanitizedName}</p>
                <p><strong>Email:</strong> <a href="mailto:${sanitizedEmail}" style="color: #4682B4;">${sanitizedEmail}</a></p>
              </div>
              <h3>Message:</h3>
              <div class="message-box">
                <p>${sanitizedMessage.replace(/\n/g, '<br>')}</p>
              </div>
              <a href="mailto:${sanitizedEmail}" class="cta-button">Respond to ${sanitizedName}</a>
            </div>
            <div class="footer">
              <p>This email was sent from your website's contact form.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments,
    };

    // 2. Auto-reply email to the user
    const userMessageCopy = sanitizedMessage.replace(/\n/g, '<br>');
    const attachmentInfoHtml = file ? `<p style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eeeeee;"><strong>Attachment:</strong> ${sanitize(file.name)}</p>` : '';
    const attachmentInfoText = file ? `\nAttachment: ${sanitize(file.name)}` : '';

    const mailToUserOptions = {
      from: `"${fromName}" <${process.env.FROM_EMAIL}>`,
      to: sanitizedEmail,
      subject: 'We have received your message!',
      text: `Hi ${sanitizedName},\n\nThank you for reaching out! We have successfully received your message and will get back to you as soon as possible.\n\nFor your reference, here is a copy of your submission:\n---\n${sanitizedMessage}${attachmentInfoText}\n---\n\nBest regards,\nThe ${fromName} Team\n\n(This is an automated message, please do not reply.)`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #F0FFF0; margin: 0; padding: 0; -webkit-font-smoothing: antialiased;}
            .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1); border: 1px solid #e0e0e0; }
            .header { background-color: #2E8B57; color: #ffffff; padding: 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 30px; line-height: 1.6; color: #333333; }
            .content h2 { color: #2E8B57; font-size: 20px; }
            .message-box { background-color: #F0FFF0; border-left: 4px solid #2E8B57; padding: 15px; margin: 20px 0; word-wrap: break-word; }
            .message-box p { margin: 0; white-space: pre-wrap; }
            .footer { background-color: #eeeeee; color: #777777; padding: 15px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Thank You!</h1>
            </div>
            <div class="content">
              <h2>Hi ${sanitizedName},</h2>
              <p>Thank you for reaching out. We have received your message and will get back to you as soon as possible.</p>
              <p>For your reference, here is a copy of your submission:</p>
              <div class="message-box">
                <p>${userMessageCopy}</p>
                ${attachmentInfoHtml}
              </div>
              <p>Best regards,<br/>The ${fromName} Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ${fromName}. All rights reserved.</p>
              <p>This is an automated message. Please do not reply directly to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Send emails
    try {
      await transporter.sendMail(mailToAdminOptions);
      await logSubmission({
        level: 'info',
        message: 'Successfully sent submission email to administrator.',
        data: { ip, to: process.env.TO_EMAIL },
      });
    } catch (error: any) {
      // Still log the admin email failure, but don't stop the process
      await logSubmission({
        level: 'error',
        message: 'Failed to send submission email to administrator.',
        data: { ip, error: error.message },
      });
       // We can choose to throw the error here if the admin email is critical
       throw error;
    }
    
    try {
      await transporter.sendMail(mailToUserOptions);
       await logSubmission({
        level: 'info',
        message: 'Successfully sent auto-reply email to user.',
        data: { email: sanitizedEmail },
      });
    } catch(error: any) {
       await logSubmission({
        level: 'warn',
        message: 'Failed to send auto-reply email to user.',
        data: { email: sanitizedEmail, error: error.message },
      });
      // Do not re-throw, as the main submission was successful
    }

    const personalizedResponseData = await personalizeResponse({ message: sanitizedMessage });

    return NextResponse.json(
      {
        message: 'Your message has been sent successfully.',
        personalizedMessage: personalizedResponseData.personalizedMessage,
      },
      { status: 200 }
    );
  } catch (error: any) {
    await logSubmission({
      level: 'error',
      message: 'Detailed error in /contact/api',
      data: { 
        errorMessage: error.message,
        errorCode: error.code,
        fullError: error.toString()
      },
    });

    let clientMessage = 'An internal server error occurred.';
    if (error.code === 'EAUTH') {
        clientMessage = 'Authentication error with email provider. Please double-check your SMTP credentials. If you are using Gmail, ensure you have set up and are using an "App Password".'
    } else if (error.message) {
        clientMessage = `Failed to send email. The mail server responded with: ${error.message}`;
    }
    
    return NextResponse.json(
      { message: clientMessage },
      { status: 500 }
    );
  }
}

    