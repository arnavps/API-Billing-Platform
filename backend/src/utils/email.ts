import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console()
  ]
});

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
  html?: string;
}

export const sendEmail = async (options: EmailOptions) => {
  // In a real application, you would use SendGrid, AWS SES, Nodemailer, etc.
  logger.info(`==========================================`);
  logger.info(`MOCK EMAIL SENT TO: ${options.email}`);
  logger.info(`SUBJECT: ${options.subject}`);
  logger.info(`MESSAGE: ${options.message}`);
  if (options.html) {
    logger.info(`HTML: ${options.html}`);
  }
  logger.info(`==========================================`);
};
