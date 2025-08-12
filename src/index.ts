import { Mustache, winPath } from '@winner-fed/utils';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { IApi } from '@winner-fed/winjs';

// 获取当前模块的目录路径，兼容 ES 模块和 CommonJS
const getCurrentDir = () => {
  if (typeof __dirname !== 'undefined') {
    // CommonJS 环境
    return __dirname;
  }
  // ES 模块环境
  return dirname(fileURLToPath(import.meta.url));
};
const REQUEST_TEMPLATES_DIR = join(getCurrentDir(), '../templates');
const RUNTIME_TYPE_FILE_NAME = 'runtimeConfig.d.ts';

export default (api: IApi) => {
  api.describe({
    key: 'request',
    config: {
      schema: ({ zod }) => {
        // 生成类型 dataField: '' | string
        return zod
          .object({
            dataField: zod.string(),
          })
          .partial();
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.addRuntimePluginKey(() => ['request']);

  api.onGenerateFiles(() => {
    const isVue3 = api.appData.framework === 'vue';
    const requestTpl = readFileSync(
      winPath(join(REQUEST_TEMPLATES_DIR, 'request.tpl')),
      'utf-8',
    );
    const winRequestPath = winPath(
      dirname(require.resolve('vue-hooks-plus/package.json')),
    );
    const axiosPath = winPath(dirname(require.resolve('axios/package.json')));
    let dataField = api.config.request?.dataField;
    if (dataField === undefined) dataField = 'data';
    const isEmpty = dataField === '';
    const formatResult = isEmpty
      ? `result => result`
      : `result => result?.${dataField}`;
    const resultDataType = isEmpty ? dataField : `${dataField}?: T;`;
    const resultDataField = isEmpty ? dataField : `['${dataField}']`;
    api.writeTmpFile({
      path: 'request.ts',
      content: Mustache.render(requestTpl, {
        isVue3,
        winRequestPath,
        axiosPath,
        formatResult,
        resultDataType,
        resultDataField,
      }),
    });
    api.writeTmpFile({
      path: 'types.d.ts',
      content: `
export type {
  RequestConfig,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  RequestError,
  RequestInterceptorAxios,
  RequestInterceptorWinRequest,
  RequestInterceptor,
  ErrorInterceptor,
  ResponseInterceptor,
  RequestOptions,
  Request } from './request';
`,
    });

    api.writeTmpFile({
      path: 'index.ts',
      content: `
      ${
        isVue3
          ? `export {
  useRequest,
  useRequestProvider,
  request,
  getRequestInstance,
} from './request';
`
          : `export {
  request,
  getRequestInstance,
} from './request';
  `
      }`,
    });

    api.writeTmpFile({
      path: RUNTIME_TYPE_FILE_NAME,
      content: `
import type { RequestConfig } from './types.d'
export type IRuntimeConfig = {
  request?: RequestConfig
};
      `,
    });
  });
};
