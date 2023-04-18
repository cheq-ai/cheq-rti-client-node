import { IRTIService, RTIRequest, RTIResponse, getBody, Config } from 'cheq-rti-client-core-js';
import { Agent, request } from 'https';
import * as http from 'http';
import * as querystring from 'querystring';

const agent = new Agent({
  keepAlive: true,
});
const rtiTimeout = 150;

export class RTIServiceNode implements IRTIService {
  public async callRTI(payload: RTIRequest, config: Config): Promise<RTIResponse> {
    const body = getBody(payload, config);
    const abortController = new AbortController();
    let abortTimeout = setTimeout(() => {
      abortController.abort();
    }, config.timeout ?? rtiTimeout);
    return new Promise((resolve, reject) => {
      let rawData = '';
      const req = request(
        {
          agent,
          method: 'POST',
          hostname: 'rti-global.cheqzone.com',
          path: '/v1/realtime-interception',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          signal: abortController.signal,
        },
        (res: http.IncomingMessage) => {
          res.on('data', data => {
            clearTimeout(abortTimeout);
            rawData += data.toString();
          });
          res.on('end', () => {
            clearTimeout(abortTimeout);
            if (res.statusCode && res.statusCode >= 400) {
              return reject(new Error(`Invalid RTI request, response code: ${res.statusCode}, body: ${rawData}`));
            }
            const response = JSON.parse(rawData);
            return resolve(response);
          });
        },
      ).on('error', (e: Error) => {
        return reject(new Error(`request error: ${e.message}`));
      });
      req.write(querystring.stringify(body));
      req.end();
    });
  }
}
