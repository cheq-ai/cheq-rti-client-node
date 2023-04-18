import { Agent, request } from 'https';
import * as http from 'node:http';
import { IRTILogger } from 'cheq-rti-client-core-js';

export class RTILoggerNode implements IRTILogger {
  apiKey: string;
  tagHash: string;
  agent: Agent;
  application: string;

  constructor(apiKey: string, tagHash: string) {
    this.apiKey = apiKey;
    this.tagHash = tagHash;
    this.agent = new Agent({
      keepAlive: true,
    });
    this.application = `RTILoggerNode`;
  }

  async log(level: 'audit' | 'error' | 'info' | 'warn', message: string, action?: string): Promise<void> {
    return new Promise(resolve => {
      let rawData = '';
      const req = request(
        {
          agent: this.agent,
          method: 'POST',
          hostname: 'rtilogger.production.cheq-platform.com',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        (res: http.IncomingMessage) => {
          res.on('data', data => {
            rawData += data.toString();
          });
          res.on('end', () => {
            if (res.statusCode && res.statusCode >= 400) {
              console.error(`${this.application} invalid request, response code: ${res.statusCode}, body: ${rawData}`);
            }
          });
        },
      ).on('error', (e: Error) => {
        console.error(`${this.application} request error: ${e.message}`);
      });
      const body = JSON.stringify({
        application: this.application,
        apiKey: this.apiKey,
        tagHash: this.tagHash,
        level,
        message,
        action,
      });
      req.write(body);
      req.end();
      // do not wait for response, errors are only logged client side
      return resolve();
    });
  }

  async error(message: string, action?: string): Promise<void> {
    return this.log('error', message, action);
  }

  async info(message: string, action?: string): Promise<void> {
    return this.log('info', message, action);
  }
}
