import { JSON_PARSE_ERROR_MESSAGE } from '../constants';
import { IncomingMessage } from 'http';

export const parseBody = async (req: IncomingMessage) => {
  return new Promise((resolve, reject) => {
    try {
      let body = '';
      req.on('data', (chunk: string) => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (err) {
          reject(new Error(JSON_PARSE_ERROR_MESSAGE));
        }
      });
    } catch (err) {
      reject(err);
    }
  });
};
