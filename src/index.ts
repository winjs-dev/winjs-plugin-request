import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Mustache, winPath } from '@winner-fed/utils';
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
        return zod
          .object({
            dataField: zod
              .union([zod.string(), zod.literal('')])
              .describe(
                '响应数据提取字段名。用于指定从 API 响应中提取数据的字段路径。设置为非空字符串时（如 "data"、"result"），将从响应对象中提取对应字段的值作为最终数据；设置为空字符串 "" 时，直接返回完整的响应对象不做字段提取。默认值为 "data"，即从 response.data 中提取数据。此配置会影响 useRequest 和 request 方法的数据格式化行为。',
              )
              .optional(),
          })
          .describe(
            'HTTP 请求插件配置。基于 axios 和 vue-hooks-plus 提供统一的 HTTP 请求解决方案，支持 Vue3 的 useRequest hook、请求/响应拦截器、错误处理和数据格式化等功能。集成运行时插件系统，支持动态配置请求实例和拦截器。',
          )
          .optional()
          .default({});
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
