import { RTIServiceNode } from '../src/RTIServiceNode';
import { EventType, Mode } from 'cheq-rti-client-core-js';

describe('RTIServiceNode', () => {
  it('throws errors when key invalid', async () => {
    const service = new RTIServiceNode();
    try {
      await service.callRTI(
        {
          eventType: EventType.PAGE_LOAD,
          method: 'GET',
          ip: '127.0.0.1',
          url: 'https://foo.com',
          headers: {},
        },
        {
          mode: Mode.BLOCKING,
          apiKey: 'foo',
          tagHash: 'bar',
          blockRedirectCodes: [],
          timeout: 5000,
        },
      );
    } catch (e) {
      const err: Error = e as Error;
      expect(err.message).toMatch('Invalid RTI request, response code: 400, body: ApiKey is missing or invalid.');
    }
  });
});
