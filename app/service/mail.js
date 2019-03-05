'use strict';

const Service = require('egg').Service;
const mailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

class MailService extends Service {
  async sendMail(data) {
    const { config, logger } = this;

    if (config.debug) {
      return;
    }

    const transporter = mailer.createTransport(smtpTransport(config.mail_opts));

    for (let i = 1; i < 6; i++) {
      try {
        await transporter.sendMail(data);
        logger.info('send mail success', data);
        break;
      } catch (err) {
        if (i === 5) {
          logger.error('send mail finally error', err, data);
          throw new Error(err);
        }
        logger.error('send mail error', err, data);
      }
    }
  }

  async sendVerifyCode(who, code) {
    const { config } = this;
    const from = `PickPost <${config.mail_opts.auth.user}>`;
    const to = who;
    const subject = config.name + '帐号激活';
    const html = '<p>您好：</p>' +
    '<p>本次注册的验证码为：' + code + '</p>' +
    '<p>若您没有在' + config.name + '进行账号注册，说明有人滥用了您的电子邮箱，请删除此邮件，我们对给您造成的打扰感到抱歉。</p>' +
    '<p> PickPost 谨上。</p>';

    await this.sendMail({
      from,
      to,
      subject,
      html,
    });
  }
}

module.exports = MailService;
