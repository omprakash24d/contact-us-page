# SecureContact — A Smart, Secure, and AI-Enhanced Contact Form for Modern Web Applications

![Next.js](https://img.shields.io/badge/built%20with-Next.js-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/language-TypeScript-blue?logo=typescript)
![Tailwind](https://img.shields.io/badge/styled%20with-Tailwind%20CSS-06B6D4?logo=tailwindcss)
![MIT License](https://img.shields.io/github/license/omprakash24d/contact-us-page)

SecureContact is a production-ready, self-contained contact form built with **Next.js**, **TypeScript**, and **Tailwind CSS**. It delivers secure email handling, AI-powered spam detection, and a polished UI—all packed in a modular `/src/app/contact` directory.

---

## ✨ Who It's For

- 💻 **Developers** — who want a feature-rich, plug-and-play contact form.
- 🏢 **Businesses** — that need reliable user communication with minimal spam.
- 🎓 **Learners** — curious about how to blend AI and security in modern web apps.

---

## 🚀 Features

| 🔧 Feature | 💬 Description |
|-----------|----------------|
| 🎨 **Modern UI** | Responsive, accessible, drag-and-drop upload form. |
| 🧼 **Input Validation** | Server-side checks via Zod for security and integrity. |
| 🧠 **AI Spam Filter** | Genkit-powered detection using input, IP & honeypot. |
| 💌 **AI Responses** | Personalized confirmation message for each user. |
| 📎 **Attachments** | Upload files up to 25MB with upload progress UI. |
| 🛡️ **Security** | Middleware-based HTTP headers & rate limiting (IP-based). |
| 🔒 **Email Service** | Secure email dispatch via Nodemailer (Gmail). |
| 🧲 **Anti-Bot Trap** | Honeypot field to catch crawlers. |
| 🧾 **Central Logging** | Easily swappable logging layer with support for DB services. |

---

## 📸 Screenshots

<div align="center">
  <table>
    <tr>
      <td align="center">
        <strong>📨 Contact Form Interface</strong><br/>
        <img src="/public/image/contact.png" width="300"/>
      </td>
      <td align="center">
        <strong>✅ Submission Success</strong><br/>
        <img src="/public/image/success_message.png" width="300"/>
      </td>
    </tr>
  </table>
</div>

---

## 🧬 Architecture

```
User → Frontend (page.tsx) → API (route.ts)
    → Zod Validation
    → AI Spam Filter
    → Personalized Response
    → Nodemailer Emails
    → Logging
```

**File Structure Highlights:**

- `src/app/contact/page.tsx`: React-based form UI
- `api/route.ts`: Backend API handling spam check, email, logging
- `_ai/`: Genkit flows for spam detection and response personalization
- `_lib/`: Helpers for schema, rate limiting, logging
- `middleware.ts`: Sets security headers and CSP

---

## 🛠 Getting Started

### 🔧 Prerequisites

- Node.js 18+
- Gmail App Password
- Google AI API Key

### ⚙️ Installation

1. Clone the repo
   ```bash
   git clone https://github.com/omprakash24d/contact-us-page
   cd contact-us-page
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up `.env.local`
   ```env
   SMTP_USER=your-gmail@gmail.com
   SMTP_PASS=your-app-password
   FROM_EMAIL=noreply@yourdomain.com
   TO_EMAIL=inbox@example.com
   FROM_NAME="Your Site"
   GOOGLE_API_KEY=your-google-api-key
   ```

4. Run the dev server
   ```bash
   npm run dev
   ```

➡ Visit: `http://localhost:9003/contact`

---

## 🔌 Advanced Enhancements

- 🧵 **Queued Emailing**: Add BullMQ to avoid timeouts on large emails.
- 💾 **Persistent Logging**: Integrate with Firestore/MongoDB.
- 📊 **Spam Scores**: Hook in Akismet or SpamAssassin for granular spam risk.
- 🧱 **CAPTCHA**: Add Google reCAPTCHA or hCaptcha.
- 🛡 **CSRF Protection**: Implement a double-submit cookie token pattern.
- 🧪 **Error Tracking**: Use Sentry to monitor exceptions and submissions.

---

## 📚 Documentation & Support

- 📄 [Project Wiki](https://github.com/omprakash24d/contact-us-page/wiki) *(coming soon)*
- 🐞 [Submit an Issue](https://github.com/omprakash24d/contact-us-page/issues)

---

## 🤝 Contributing

Pull requests, bug reports, and suggestions are always welcome. Let’s make form interactions smarter and more secure, together.

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
