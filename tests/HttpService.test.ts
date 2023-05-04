import { HttpService } from '../src/http/HttpService';
import * as crossFetch from 'cross-fetch';

jest.mock('cross-fetch');

const expectedReqInit = {
  method: 'post',
  body: '{\"data\":\"123\"}',
  mode: 'cors',
  headers: {
    'Content-Type': 'application/json',
    'api-key': 'some-api-key'
  }
};

const jsonBody = {
  data: '123'
};

it('can make post requests in browser environment', async () => {
  // fetch has not been polyfill’d in Jest’s JSDOM environment: https://github.com/jsdom/jsdom/issues/1724
  window.fetch = jest.fn().mockImplementationOnce(() =>
    Promise.resolve({
      json: () => Promise.resolve({ test: 'window.fetch' }),
    }),
  );
  const crossFetchSpy = jest.spyOn(crossFetch, 'fetch');
  const queryParams = {
    foo: undefined,
    bar: null,
    aQuery: 'param'
  };
  const httpService = new HttpService();
  await httpService.post('http://yext.com', queryParams, jsonBody, 'some-api-key');
  expect(window.fetch).toHaveBeenLastCalledWith('http://yext.com/?aQuery=param', expectedReqInit);
  expect(crossFetchSpy).not.toHaveBeenCalled();
});

it('can make post request in node environment', async () => {
  // Simulate a node environment where the window is undefined
  const windowSpy = jest.spyOn(window, 'window', 'get');
  windowSpy.mockImplementationOnce(() => undefined as any);
  const crossFetchSpy = jest.spyOn(crossFetch, 'fetch').mockImplementationOnce(() =>
    Promise.resolve({
      json: () => Promise.resolve({ test: 'cross-fetch' }),
    } as Response),
  );

  const queryParams = {
    nodeQuery: 'param'
  };
  const httpService = new HttpService();
  await httpService.post('http://yext.com', queryParams, jsonBody, 'some-api-key');
  windowSpy.mockRestore();

  expect(crossFetchSpy).toHaveBeenLastCalledWith('http://yext.com/?nodeQuery=param', expectedReqInit);
  expect(window.fetch).not.toHaveBeenCalled();
});
