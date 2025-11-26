import { Meteor } from 'meteor/meteor';
import winston from 'winston';
import { AppLogs } from '../imports/api/logs';

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

// Custom transport to store logs in MongoDB (without formatting/colors)
class MongoTransport extends winston.Transport {
  constructor(opts) {
    super(opts);
  }

  log(info, callback) {
    setImmediate(() => {
      if (Meteor.isServer) {
        // Get the raw message without any formatting
        let cleanMessage =
          typeof info.message === 'string' ? info.message : JSON.stringify(info.message);

        // Strip all ANSI escape codes (colors, formatting, etc.)
        // eslint-disable-next-line no-control-regex
        cleanMessage = cleanMessage.replace(/\x1b\[[0-9;]*m/g, '');

        // Only store logs tagged as gtfs-related
        const isGtfsLog = info.gtfs === true;

        AppLogs.insertAsync({
          level: info.level,
          message: cleanMessage,
          timestamp: new Date(),
          createdAt: new Date(),
          gtfs: isGtfsLog,
        }).catch((error) => {
          console.error('Failed to insert log:', error);
        });
      }
    });
    callback();
  }
}

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
    // Log a MongoDB
    new MongoTransport(),
  ],
});

// Wrapper para los logs
export const log = {
  error: (message) => logger.error(message),
  warn: (message) => logger.warn(message),
  info: (message) => logger.info(message),
  debug: (message) => logger.debug(message),
};

// Special logger for GTFS imports that tags logs for client consumption
export const gtfsLog = {
  error: (message) => logger.error(message, { gtfs: true }),
  warn: (message) => logger.warn(message, { gtfs: true }),
  info: (message) => logger.info(message, { gtfs: true }),
  debug: (message) => logger.debug(message, { gtfs: true }),
};
