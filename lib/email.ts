// lib/email.ts
// This is a placeholder for an email sending utility.
// In a real application, you would integrate with an email service like Resend, SendGrid, Nodemailer, etc.

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; message: string }> {
  console.log(`\n--- Simulating Email Send ---`)
  console.log(`To: ${options.to}`)
  console.log(`Subject: ${options.subject}`)
  console.log(`HTML Body: ${options.html.substring(0, 200)}. . .`)
  if (options.text) {
    console.log(`Text Body: ${options.text.substring(0, 200)}. . .`)
  }
  console.log(`--- End Email Simulation ---\n`)

  // In a real application, you would use a service like this:
  /*
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: 'onboarding@yourdomain.com',
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
  */

  // For now, we just log to console and simulate success
  return { success: true, message: "Email simulation successful" }
}

export function getVerificationEmailTemplate(
  username: string,
  verificationLink: string,
): { html: string; text: string } {
  const html = `
    <h1>Confirmation de votre compte Immobilier CI</h1>
    <p>Bonjour ${username},</p>
    <p>Merci de vous être inscrit sur Immobilier CI. Veuillez cliquer sur le lien ci-dessous pour vérifier votre adresse e-mail et activer votre compte :</p>
    <p><a href="${verificationLink}" style="padding: 10px 20px; background-color: #f97316; color: white; text-decoration: none; border-radius: 5px;">Confirmer mon adresse e-mail</a></p>
    <p>Ce lien expirera dans 24 heures.</p>
    <p>Si vous n'avez pas créé ce compte, veuillez ignorer cet e-mail.</p>
    <p>Cordialement,</p>
    <p>L'équipe Immobilier CI</p>
  `
  const text = `
    Confirmation de votre compte Immobilier CI

    Bonjour ${username},

    Merci de vous être inscrit sur Immobilier CI. Veuillez copier et coller le lien ci-dessous dans votre navigateur pour vérifier votre adresse e-mail et activer votre compte :

    ${verificationLink}

    Ce lien expirera dans 24 heures.

    Si vous n'avez pas créé ce compte, veuillez ignorer cet e-mail.

    Cordialement,
    L'équipe Immobilier CI
  `
  return { html, text }
}

export function getPasswordResetEmailTemplate(username: string, resetLink: string): { html: string; text: string } {
  const html = `
    <h1>Réinitialisation de votre mot de passe Immobilier CI</h1>
    <p>Bonjour ${username},</p>
    <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte. Veuillez cliquer sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
    <p><a href="${resetLink}" style="padding: 10px 20px; background-color: #f97316; color: white; text-decoration: none; border-radius: 5px;">Réinitialiser mon mot de passe</a></p>
    <p>Ce lien expirera dans 1 heure.</p>
    <p>Si vous n'avez pas demandé de réinitialisation de mot de passe, veuillez ignorer cet e-mail.</p>
    <p>Cordialement,</p>
    <p>L'équipe Immobilier CI</p>
  `
  const text = `
    Réinitialisation de votre mot de passe Immobilier CI

    Bonjour ${username},

    Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte. Veuillez copier et coller le lien ci-dessous dans votre navigateur pour créer un nouveau mot de passe :

    ${resetLink}

    Ce lien expirera dans 1 heure.

    Si vous n'avez pas demandé de réinitialisation de mot de passe, veuillez ignorer cet e-mail.

    Cordialement,
    L'équipe Immobilier CI
  `
  return { html, text }
}
