import { TIMEOUT } from '@/constant';
import { RequestConfig } from 'winjs';
import { httpRequest, httpResponse } from './services/request';

export const request: RequestConfig = {
  timeout: TIMEOUT,
  requestInterceptors: [
    // 一个二元组，第一个元素是 request 拦截器，第二个元素是错误处理
    [
      (config) => {
        console.log('requestInterceptors 1', config);
        return httpRequest.success(config);
      },
      (error) => {
        console.log('error', error);
        return httpRequest.error(error);
      },
    ],
  ],
  responseInterceptors: [
    [
      (response) => {
        console.log('responseInterceptors 1', response);
        return httpResponse.success(response);
      },
      (error) => {
        console.log('responseInterceptors 2', error);
        return httpResponse.error(error);
      },
    ],
  ],
};
