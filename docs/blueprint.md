# **App Name**: SecureContact

## Core Features:

- Contact Form UI: Displays a contact form with fields for name, email, and message, including a honeypot field to prevent spam submissions.
- Data Validation and Sanitization: Validates and sanitizes the form data on the server side to prevent security vulnerabilities and ensures that only clean, safe data is processed.
- Email Sending: Sends the contact form data via email using Nodemailer with SMTP, utilizing environment variables for secure credential management and including both plain text and HTML versions of the email.
- Rate Limiting: Implements rate limiting based on IP address to prevent abuse and spamming of the contact form, enhancing security and ensuring fair usage.
- Submission Logging: Logs the submission details such as timestamp, IP address, and user-agent for auditing and monitoring purposes.
- AI Spam Filter: The spam filter tool assesses each incoming form submission. Using IP, content and honeypot data to ensure no fields were used maliciously.

## Style Guidelines:

- Primary color: Dark green (#2E8B57) to evoke trust and reliability, aligning with secure communication.
- Background color: Light green (#F0FFF0) to offer a soft, clean backdrop that complements the primary color.
- Accent color: Blue (#4682B4) as a contrasting element for calls to action, ensuring key elements stand out.
- Body and headline font: 'Inter' (sans-serif) for a clean, modern, and easily readable text, providing an objective and neutral user experience.