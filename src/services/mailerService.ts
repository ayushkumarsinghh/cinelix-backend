import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendTicketEmail = async (email: string, bookingDetails: any) => {
  const { movie, show, theatre, seats, qrCodeUrl } = bookingDetails;

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: `Your Cinelix Ticket: ${movie.title}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 40px; border-radius: 30px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #e50914; font-size: 32px; font-weight: 900; margin: 0; letter-spacing: -1px;">CINELIX</h1>
          <p style="color: #666; font-size: 14px; margin-top: 5px; text-transform: uppercase; letter-spacing: 2px;">Verified Booking</p>
        </div>

        <div style="background: rgba(255,255,255,0.05); border-radius: 20px; padding: 30px; margin-bottom: 30px; border: 1px solid rgba(255,255,255,0.1);">
          <h2 style="margin: 0 0 10px 0; font-size: 24px;">${movie.title}</h2>
          <p style="color: #e50914; font-weight: bold; margin: 0 0 20px 0;">Confirmed Ticket</p>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #666; font-size: 12px; text-transform: uppercase;">Date & Time</td>
              <td style="padding: 10px 0; color: #666; font-size: 12px; text-transform: uppercase;">Theatre</td>
            </tr>
            <tr>
              <td style="font-weight: bold; font-size: 16px; padding-bottom: 20px;">${new Date(show.startTime).toLocaleString()}</td>
              <td style="font-weight: bold; font-size: 16px; padding-bottom: 20px;">${theatre.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666; font-size: 12px; text-transform: uppercase;">Seats</td>
              <td style="padding: 10px 0; color: #666; font-size: 12px; text-transform: uppercase;">Location</td>
            </tr>
            <tr>
              <td style="font-weight: bold; font-size: 16px;">${seats.join(', ')}</td>
              <td style="font-weight: bold; font-size: 16px;">${theatre.location}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; background: #fff; padding: 30px; border-radius: 20px;">
          <p style="color: #000; font-weight: bold; margin-bottom: 15px;">Scan at Cinema</p>
          <img src="${qrCodeUrl}" alt="Ticket QR Code" style="width: 200px; height: 200px;" />
          <p style="color: #666; font-size: 12px; margin-top: 15px;">This QR code is valid for one-time entry only.</p>
        </div>

        <div style="text-align: center; margin-top: 40px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 30px;">
          <p style="color: #666; font-size: 12px;">Enjoy your movie experience at Cinelix.</p>
          <p style="color: #333; font-size: 10px; margin-top: 20px;">© 2026 Cinelix Entertainment. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Ticket email sent to: ${email}`);
  } catch (error) {
    console.error('Error sending ticket email:', error);
  }
};
