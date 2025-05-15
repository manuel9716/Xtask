import sgMail from '@sendgrid/mail';

// Configurar la API key de SendGrid
if (!process.env.SENDGRID_API_KEY) {
  console.error('Error: SENDGRID_API_KEY no está configurada en las variables de entorno');
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

// Dirección de correo del remitente
const FROM_EMAIL = 'no-reply@xtask.com'; // Cambiar según necesidades

/**
 * Servicio para enviar correos electrónicos
 */
export class EmailService {
  /**
   * Envía un correo electrónico para restablecer la contraseña
   * @param to Dirección de correo del destinatario
   * @param resetToken Token de restablecimiento
   * @param username Nombre de usuario
   * @returns Promise que se resuelve cuando el correo se ha enviado
   */
  async sendPasswordResetEmail(to: string, resetToken: string, username: string): Promise<boolean> {
    const resetLink = `${process.env.APP_URL || 'http://localhost:5000'}/auth/reset-password?token=${resetToken}`;
    
    try {
      const msg = {
        to,
        from: FROM_EMAIL,
        subject: 'XTask - Restablecimiento de contraseña',
        text: `Hola ${username},\n\nHas solicitado restablecer tu contraseña. Haz clic en el siguiente enlace o cópialo en tu navegador para completar el proceso:\n\n${resetLink}\n\nEste enlace será válido durante 1 hora.\n\nSi no solicitaste restablecer tu contraseña, puedes ignorar este correo y tu contraseña seguirá siendo la misma.\n\nSaludos,\nEl equipo de XTask`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #251948; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">XTask</h1>
            </div>
            <div style="padding: 20px; border: 1px solid #e5e5e5; border-top: none;">
              <p>Hola <strong>${username}</strong>,</p>
              <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente botón para completar el proceso:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background-color: #623BA6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Restablecer Contraseña</a>
              </div>
              <p>O copia y pega la siguiente URL en tu navegador:</p>
              <p style="background-color: #f5f5f5; padding: 10px; word-break: break-all;">${resetLink}</p>
              <p>Este enlace será válido durante 1 hora.</p>
              <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este correo y tu contraseña seguirá siendo la misma.</p>
              <p>Saludos,<br>El equipo de XTask</p>
            </div>
            <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
              <p>Este es un correo electrónico automatizado, por favor no respondas a este mensaje.</p>
            </div>
          </div>
        `,
      };
      
      await sgMail.send(msg);
      console.log(`Correo de restablecimiento enviado a: ${to}`);
      return true;
    } catch (error) {
      console.error('Error al enviar correo de restablecimiento:', error);
      return false;
    }
  }
}

// Exportar una instancia del servicio para su uso en la aplicación
export const emailService = new EmailService();