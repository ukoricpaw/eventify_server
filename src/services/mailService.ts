import { createTransport } from 'nodemailer';
import User from '../models/User.js';

class MailService {
  public transporter;
  constructor() {
    this.transporter = createTransport({
      host: process.env.EMAIL_HOST as string,
      port: Number(process.env.EMAIL_PORT),
      service: 'gmail',
      secure: true,
      auth: {
        user: process.env.EMAIL_USER as string,
        pass: process.env.EMAIL_PASSWORD as string,
      },
    });
  }

  async sendMail(to: string, activationLink: string) {
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: `Подтверждение Email на ${process.env.SERVER_HOSTNAME}`,
      text: '',
      html: `
      <h1>Подтвердите email по ссылке</h1>
      <a href="http://${process.env.SERVER_HOSTNAME}/api/user/activate/${activationLink}">${activationLink}</a>
      `,
    });
  }

  async activateEmail(activationLink: string) {
    const user = await User.findOne({ where: { activationLink } });
    if (!user) {
      return null;
    }
    user.isActivated = true;
    user.activationLink = null;
    await user.save();
    return user;
  }
}

export default new MailService();
