# winjs-plugin-request

WinJS 框架的 HTTP 请求插件，基于 axios 和 vue-hooks-plus，提供了强大的请求处理能力和 Vue 3 Composition API 支持。

<p>
  <a href="https://npmjs.com/package/@winner-fed/plugin-request">
   <img src="https://img.shields.io/npm/v/@winner-fed/plugin-request?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" />
  </a>
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="license" />
  <a href="https://npmcharts.com/compare/@winner-fed/plugin-request?minimal=true"><img src="https://img.shields.io/npm/dm/@winner-fed/plugin-request.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="downloads" /></a>
</p>

## 特性

- 🚀 基于 axios 的强大 HTTP 请求功能
- 📦 开箱即用的 Vue 3 `useRequest` hooks
- 🔧 灵活的请求/响应拦截器配置
- 🛡️ 完善的错误处理机制
- 📝 完整的 TypeScript 类型定义
- ⚙️ 可配置的数据字段提取
- 🎯 支持 Vue 2 和 Vue 3 双版本

## 安装

```bash
npm install @winner-fed/plugin-request
# 或者
yarn add @winner-fed/plugin-request
# 或者
pnpm add @winner-fed/plugin-request
```

## 使用

### 1. 在 `.winrc.ts` 中配置插件

```typescript
import { defineConfig } from 'win';

export default defineConfig({
  plugins: ['@winner-fed/plugin-request'],
  request: {
    dataField: 'data' // 可选，默认为 'data'，设置为 '' 则不提取数据字段
  }
});
```

### 2. 在 `app.ts` 中配置请求拦截器

```typescript
import { RequestConfig } from 'winjs';

export const request: RequestConfig = {
  timeout: 10000,
  baseURL: 'https://api.example.com',
  
  // 请求拦截器
  requestInterceptors: [
    [
      (config) => {
        // 添加认证 token
        config.headers.Authorization = `Bearer ${getToken()}`;
        return config;
      },
      (error) => {
        console.error('请求拦截器错误:', error);
        return Promise.reject(error);
      }
    ]
  ],
  
  // 响应拦截器
  responseInterceptors: [
    [
      (response) => {
        // 处理响应数据
        if (response.data.code === 200) {
          return response;
        }
        throw new Error(response.data.message);
      },
      (error) => {
        console.error('响应拦截器错误:', error);
        return Promise.reject(error);
      }
    ]
  ],
  
  // 错误处理配置
  errorConfig: {
    errorHandler: (error, opts) => {
      console.error('全局错误处理:', error);
      // 自定义错误处理逻辑
    },
    errorThrower: (res) => {
      if (res.success === false) {
        throw new Error(res.message || '请求失败');
      }
    }
  }
};
```

### 3. 使用 request 方法

```typescript
import { request } from 'winjs';

// 基本用法
const data = await request('/api/users');

// 带参数的 POST 请求
const result = await request('/api/users', {
  method: 'POST',
  data: { name: 'John', age: 30 }
});

// 获取完整响应
const response = await request('/api/users', {
  getResponse: true
});

// 单次请求拦截器
const data = await request('/api/users', {
  requestInterceptors: [
    (config) => {
      config.headers['X-Custom-Header'] = 'value';
      return config;
    }
  ]
});
```

### 4. 使用 useRequest Hook (Vue 3)

```vue
<template>
  <div>
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">错误: {{ error.message }}</div>
    <div v-else>
      <h1>用户列表</h1>
      <ul>
        <li v-for="user in data" :key="user.id">
          {{ user.name }}
        </li>
      </ul>
    </div>
    <button @click="refresh">刷新</button>
  </div>
</template>

<script setup>
import { useRequest } from 'winjs';

// 基本用法
const { data, loading, error, refresh } = useRequest(() => {
  return request('/api/users');
});

// 带参数的请求
const { data: userData, loading: userLoading } = useRequest(
  (userId) => request(`/api/users/${userId}`),
  {
    manual: true, // 手动触发
    onSuccess: (data) => {
      console.log('请求成功:', data);
    },
    onError: (error) => {
      console.error('请求失败:', error);
    }
  }
);

// 触发带参数的请求
const fetchUser = (id) => {
  userData.run(id);
};
</script>
```

## 配置选项

### request 配置

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `dataField` | `string` | `'data'` | 响应数据字段名，设置为 `''` 则不提取数据字段 |

### RequestConfig 接口

```typescript
interface RequestConfig extends AxiosRequestConfig {
  errorConfig?: {
    errorHandler?: (error: RequestError, opts: RequestOptions) => void;
    errorThrower?: (res: any) => void;
  };
  requestInterceptors?: RequestInterceptorTuple[];
  responseInterceptors?: ResponseInterceptorTuple[];
}
```

## API 文档

### request(url, options?)

发送 HTTP 请求的核心方法。

#### 参数

- `url`: `string` - 请求 URL
- `options`: `RequestOptions` - 请求配置选项

#### 返回值

- `Promise<T>` - 响应数据 (默认)
- `Promise<AxiosResponse<T>>` - 完整响应 (当 `getResponse: true` 时)

#### 示例

```typescript
// 基本 GET 请求
const users = await request('/api/users');

// POST 请求
const user = await request('/api/users', {
  method: 'POST',
  data: { name: 'John', email: 'john@example.com' }
});

// 获取完整响应
const response = await request('/api/users', {
  getResponse: true
});
```

### useRequest(service, options?)

Vue 3 Composition API Hook，用于管理异步请求状态。

#### 参数

- `service`: `(...args: any[]) => Promise<any>` - 请求服务函数
- `options`: `UseRequestOptions` - Hook 配置选项

#### 返回值

```typescript
interface UseRequestResult {
  data: Ref<T>;
  loading: Ref<boolean>;
  error: Ref<Error | null>;
  run: (...args: any[]) => Promise<T>;
  runAsync: (...args: any[]) => Promise<T>;
  refresh: () => Promise<T>;
  mutate: (data: T) => void;
  cancel: () => void;
}
```

#### 示例

```typescript
const { data, loading, error, run, refresh } = useRequest(
  (keyword) => request(`/api/search?q=${keyword}`),
  {
    manual: true,
    debounceWait: 300,
    onSuccess: (data) => {
      console.log('搜索成功:', data);
    }
  }
);
```

### getRequestInstance()

获取 axios 实例，用于更高级的定制。

#### 返回值

- `AxiosInstance` - 配置好的 axios 实例

#### 示例

```typescript
import { getRequestInstance } from 'winjs';

const axiosInstance = getRequestInstance();

// 使用 axios 实例
const response = await axiosInstance.get('/api/users');
```

## 拦截器

### 请求拦截器

```typescript
const requestInterceptor: RequestInterceptorTuple = [
  (config) => {
    // 修改请求配置
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    // 处理请求错误
    return Promise.reject(error);
  }
];
```

### 响应拦截器

```typescript
const responseInterceptor: ResponseInterceptorTuple = [
  (response) => {
    // 处理响应数据
    if (response.data.code === 200) {
      return response;
    }
    throw new Error(response.data.message);
  },
  (error) => {
    // 处理响应错误
    return Promise.reject(error);
  }
];
```

## 错误处理

### 全局错误处理

```typescript
export const request: RequestConfig = {
  errorConfig: {
    errorHandler: (error, opts) => {
      if (error.response?.status === 401) {
        // 处理未授权错误
        redirectToLogin();
      } else if (error.response?.status === 500) {
        // 处理服务器错误
        showErrorMessage('服务器错误，请稍后重试');
      }
    }
  }
};
```

### 单个请求错误处理

```typescript
try {
  const data = await request('/api/users');
} catch (error) {
  if (error.response?.status === 404) {
    console.log('用户不存在');
  } else {
    console.error('请求失败:', error);
  }
}
```

## 类型定义

插件提供了完整的 TypeScript 类型定义：

```typescript
import type {
  RequestConfig,
  RequestOptions,
  RequestError,
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor
} from 'winjs';
```

## 许可证

[MIT](./LICENSE).
