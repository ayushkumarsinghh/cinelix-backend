import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a transporter for Resend (Primary)
const resendTransporter = nodemailer.createTransport({
  host: 'smtp.resend.com',
  port: 465,
  secure: true,
  auth: {
    user: 'resend',
    pass: process.env.RESEND_API_KEY
  }
});

/**
 * Sends a premium ticket email. 
 * Falls back to a test account (Ethereal) if the primary delivery fails.
 */
export const sendTicketEmail = async (userEmail: string, bookingData: any) => {
  const { movie, show, theatre, seats, qrCodeUrl } = bookingData;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #070b0a; color: #ffffff; margin: 0; padding: 0; }
        .wrapper { padding: 40px 20px; background-color: #070b0a; }
        .container { max-width: 500px; margin: 0 auto; background-color: #111815; border-radius: 40px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 30px 60px rgba(0,0,0,0.5); }
        .header { padding: 40px 0; text-align: center; background: linear-gradient(180deg, rgba(212,175,55,0.05) 0%, transparent 100%); }
        .logo { font-size: 20px; font-weight: 900; color: #D4AF37; letter-spacing: 8px; text-transform: uppercase; }
        .movie-poster { width: 100%; height: 250px; object-fit: cover; }
        .content { padding: 40px; }
        .ticket-header { margin-bottom: 30px; border-bottom: 1px dashed rgba(255,255,255,0.1); padding-bottom: 30px; }
        .movie-title { font-size: 32px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0; line-height: 1.1; }
        .theatre-name { color: #D4AF37; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 25px; }
        .info-item { flex: 1; }
        .label { font-size: 9px; color: #555555; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px; }
        .value { font-size: 14px; color: #ffffff; font-weight: 600; }
        .qr-section { text-align: center; padding: 30px; background-color: rgba(255,255,255,0.02); border-radius: 30px; margin-top: 10px; }
        .qr-code { width: 150px; height: 150px; border-radius: 20px; padding: 10px; background: white; }
        .footer { padding: 30px; text-align: center; font-size: 10px; color: #444444; letter-spacing: 1px; }
      </style>
    </head>
    <body>
      <div className="wrapper">
        <div className="container">
          <div className="header">
            <div className="logo">CINELIX</div>
          </div>
          
          <img src="${movie.imageUrl}" className="movie-poster" alt="Poster" />
          
          <div className="content">
            <div className="ticket-header">
              <h1 className="movie-title">${movie.title}</h1>
              <div className="theatre-name">${theatre.name}</div>
            </div>
            
            <div className="info-row" style="display: flex; justify-content: space-between;">
              <div className="info-item">
                <div className="label">Date & Time</div>
                <div className="value">${new Date(show.startTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
              </div>
              <div className="info-item" style="text-align: right;">
                <div className="label">Seats</div>
                <div className="value">${seats.join(', ')}</div>
              </div>
            </div>

            <div className="qr-section">
              <div className="label" style="margin-bottom: 15px;">Scan at Cinema Entry</div>
              <img src="${qrCodeUrl}" className="qr-code" alt="QR Code" />
            </div>
          </div>

          <div className="footer">
            VALID FOR ONE-TIME ENTRY ONLY • NON-REFUNDABLE • CINELIX PREMIUM
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: 'Cinelix Premium <onboarding@resend.dev>',
    to: userEmail,
    subject: `Your Ticket: ${movie.title}`,
    html: htmlContent,
  };

  try {
    // Attempt Resend Delivery
    if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes('your_api_key')) {
      const info = await resendTransporter.sendMail(mailOptions);
      console.log('✅ Ticket delivered via Resend:', info.messageId);
    } else {
      throw new Error('No valid Resend API Key found. Falling back to Demo Mode.');
    }
  } catch (error: any) {
    console.log('🔄 Fallback: Sending ticket via Demo/Ethereal Mail...');
    
    // Create Ethereal Test Account on the fly
    try {
      const testAccount = await nodemailer.createTestAccount();
      const demoTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const info = await demoTransporter.sendMail(mailOptions);
      
      console.log('--------------------------------------------------');
      console.log('🎬 CINELIX DEMO TICKET GENERATED');
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      console.log('--------------------------------------------------');
    } catch (fallbackError) {
      console.error('❌ Critical Mail Failure:', fallbackError);
    }
  }
};
