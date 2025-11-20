import { Meteor } from 'meteor/meteor';
import winston from 'winston';

const { printf, timestamp, colorize, combine } = winston.format;

// Colores personalizados para cada nivel
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  debug: 'green',
};

// Añadimos nuestros colores al esquema de winston
winston.addColors(colors);

// Formato para logs
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level.toUpperCase()}: ${message}`;
});

// Configuración del logger
const logger = winston.createLogger({
  level: Meteor.isDevelopment ? 'debug' : 'info',
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    logFormat,
    colorize({ all: true })
  ),
  transports: [
    // Log a la consola en desarrollo
    new winston.transports.Console({
      handleExceptions: true,
    }),
  ],
});

// Wrapper para los logs
export const log = {
  error: (message) => logger.error(message),
  warn: (message) => logger.warn(message),
  info: (message) => logger.info(message),
  debug: (message) => logger.debug(message),
};
