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
          reject(err);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
};
