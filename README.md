# SecureContact - Next.js Secure Contact Form

This is a production-grade, secure, and self-contained contact form application built with Next.js App Router, TypeScript, and Tailwind CSS. All application code is organized within the `/src/app/contact` directory for maximum portability and ease of use. It features server-side validation, an AI-powered spam filter, rate limiting, and email notifications via Nodemailer.

## Core Features

-   **Modern Contact Form UI**: A clean, responsive, and user-friendly contact form with a drag-and-drop file attachment area.
-   **Optional File Attachments**: Allows users to upload files (up to 25MB) with a visual progress indicator during submission.
-   **Data Validation and Sanitization**: Robust server-side validation using Zod to prevent invalid data and security vulnerabilities.
-   **AI-Powered Spam Filter**: Integrates a Genkit AI flow to analyze submissions for spam based on content, IP address, and a honeypot field.
-   **AI-Personalized Responses**: After submission, users receive a unique, AI-generated thank you message that acknowledges the context of their query.
-   **Secure Email Sending**: Uses Nodemailer with Gmail for reliable email delivery, with credentials managed via environment variables.
-   **Customizable Auto-Reply Email**: Automatically sends a beautifully formatted confirmation email to the user, including a copy of their message and attachment details.
-   **IP-based Rate Limiting**: Protects the API from abuse and spam with an in-memory rate limiter (50 requests per 15 minutes per IP).
-   **Honeypot Field**: Includes a hidden form field to trap and block spam bots.
-   **Centralized Logging**: Routes all submission events through a dedicated logging module for easy integration with a database or third-party service.
-   **Security Headers**: Implements key security headers via middleware (`src/middleware.ts`) to protect against common web vulnerabilities.

## Screenshots

**Contact Form Interface:**
![Contact Form UI](/public/image/contact.png)

**Submission Success Message:**
![Success Message](/public/image/success_message.png)

## How It Works: Project Architecture

All the code for this application is intentionally organized within the `src/app/contact/` directory to make it easy to understand, modify, and reuse. Here's a breakdown of the key components:

-   **`src/app/contact/page.tsx`**: The main UI component for the contact form.
    -   Built with React, Next.js App Router, and ShadCN UI components.
    -   Uses the custom `useContactForm` hook to separate logic from presentation.
    -   Handles UI states like loading spinners, file upload progress, and the final success message.

-   **`src/app/contact/api/route.ts`**: The secure backend API endpoint that handles all form submissions.
    -   **Rate Limiting**: Checks the sender's IP against an in-memory `lru-cache` to prevent spam and abuse.
    -   **Server-Side Validation**: Re-validates all inputs using `zod` to ensure data integrity.
    -   **AI Spam Filter**: Calls a Genkit AI flow to analyze the submission for spam signals.
    -   **AI Response Personalization**: Calls a second Genkit AI flow to generate a custom success message for the user.
    -   **Email Dispatch**: Uses `nodemailer` to send two separate, professionally formatted HTML emails: a notification to the site administrator (with attachment) and a confirmation auto-reply to the user.
    -   **Logging**: Records every submission attempt and its outcome using the centralized logging service.

-   **`src/app/contact/_ai/`**: This directory contains the AI logic.
    -   **`spam-filter.ts`**: Defines a Genkit flow that analyzes the submission content, IP address, and honeypot status to return an `isSpam` boolean.
    -   **`personalize-response.ts`**: Defines a Genkit flow that reads the user's message and generates a short, personalized acknowledgment.

-   **`src/app/contact/_hooks/`**: This directory holds the React hooks.
    -   **`use-contact-form.ts`**: A custom React hook that encapsulates all form state management and submission logic, keeping the main page component clean.
    -   **`use-toast.ts`**: A custom hook for displaying system-wide toast notifications, used for displaying submission errors.

-   **`src/app/contact/_lib/`**: A directory for core utility modules.
    -   **`schema.ts`**: Defines the Zod schema for both client-side and server-side form validation.
    -   **`logging.ts`**: A centralized function (`logSubmission`) for logging events. It currently logs to the console but is designed to be easily swapped with a database or a third-party logging service.
    -   **`rate-limiter.ts`**: Implements the IP-based rate limiting logic.

-   **`src/middleware.ts`**: An application-wide middleware file that sets important security headers like X-Frame-Options to protect against common web vulnerabilities.

## Getting Started

### Prerequisites

-   Node.js (v18 or newer)
-   npm, pnpm, or yarn
-   A Gmail account with an "App Password" for sending emails.
-   A Google AI API Key for the spam filter.

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository_url>
    cd <repository_name>
    ```

2.  Install the dependencies:
    ```bash
    npm install
    ```

3.  Set up your environment variables. Create a file named `.env.local` in the root of your project and add the following variables:

    ```env
    # Nodemailer SMTP Configuration for Gmail
    # You must generate an "App Password" from your Google Account settings.
    # See: https://support.google.com/accounts/answer/185833
    SMTP_USER=your-gmail-address@gmail.com
    SMTP_PASS=your-16-character-app-password

    # Email addresses for the contact form
    # FROM_EMAIL should be an address you control and are authorized to use.
    # Do NOT use the user's submitted email here to avoid spoofing.
    FROM_EMAIL=noreply@your-domain.com
    # TO_EMAIL is the address that will receive the contact form submissions.
    TO_EMAIL=your-inbox@example.com

    # Your company/site name for the auto-reply email's "From" field. (Optional)
    FROM_NAME="Your Site Name"

    # Genkit/Google AI API Key for Spam Filter
    # Get one from Google AI Studio: https://aistudio.google.com/app/apikey
    GOOGLE_API_KEY=your-google-api-key
    ```

4.  Run the development server:
    ```bash
    npm run dev
    ```

    The application will be available at `http://localhost:9003/contact`.

## Advanced Integration Patterns

For even more robust, enterprise-grade applications, consider these improvements:

-   **Database Logging**: This project uses a centralized `logSubmission` function. To enable logging to a persistent database (e.g., Firestore, MongoDB), you would edit `src/app/contact/_lib/logging.ts` to connect to your database and write the log entries there.
-   **CAPTCHA**: For even stronger spam protection, integrate a service like Google reCAPTCHA or hCaptcha. This involves adding a client-side component and verifying the token in your API route before processing the form.
-   **Content-Security-Policy (CSP)**: The `src/middleware.ts` file is the ideal place to set a CSP. For production, you may need to tighten or expand this policy based on the specific scripts, styles, and domains your application uses.
-   **CSRF Protection**: While Next.js has some built-in protections, for maximum security implement the double-submit cookie pattern in the top-level `src/middleware.ts` file.
-   **Persistent Rate Limiting**: The `lru-cache` is excellent for single-instance apps. For scalable, multi-instance deployments, replace it with an Upstash Redis or Vercel KV store. The logic remains similar: `await redis.incr(ip)` and `await redis.expire(ip, 900)`.
-   **Email Queuing (BullMQ)**: To prevent API timeouts and handle email failures gracefully, use a background job queue. In the API handler, instead of calling `transporter.sendMail`, you would add a job to a queue (`await emailQueue.add(...)`). A separate worker process would listen to this queue, process the jobs, and handle retries. This makes your API response instant.
-   **Error Tracking (Sentry/LogRocket)**: Wrap your API handler's `try...catch` block with Sentry's instrumentation, or call `Sentry.captureException(error)` in the `catch` block. This gives you real-time alerts and detailed stack traces for any failures.
-   **Advanced Spam Scoring**: For enterprise-grade filtering, you can pass the message content and IP address to an API like Akismet or a self-hosted SpamAssassin instance. Based on the returned score, you could either silently discard the message or flag it for manual review.
