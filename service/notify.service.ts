import * as nodemailer from 'nodemailer';
import * as smtpTransport from 'nodemailer-smtp-transport';
import * as emailSettings from '../email.json';
import { injectable } from 'inversify';
import { Log } from './logger.service';

@injectable()
export class NotifyService {

  constructor(private log: Log) {
  }

  public error(errors: string[]) {
    const errorsStr = this.getErrorsString(errors);
    return new Promise((resolve, reject) => {
      const transporter = nodemailer.createTransport(
        smtpTransport((<any>emailSettings).transport));

      const options = (<any>emailSettings).options;

      const mailOptions = {
        from: options.from,
        to: options.to,
        subject: options.subject,
        text: errorsStr
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          this.log.error('Error sending email: ' + error);
          reject(error);
        } else {
          this.log.info('Email sent successfully: ' + info.response);
          resolve(info.response);
        }
      });
    });
  }

  private getErrorsString(errors: string[]) {
    if (!errors) {
      return '';
    }
    const dateTime = new Date().toISOString();
    let errorsMerged = 'Errors happen at time: ' + dateTime + '\n';
    errorsMerged += '\n-------------------------\n';
    for (const err of errors) {
      errorsMerged += err + '\n-------------------------\n';
    }
    return errorsMerged;
  }
}
