import { defineConfig } from 'win';

export default defineConfig({
  plugins: ['../src'],
  request: {
    dataField: ''
  },
  appConfig: {
    // 本地调试环境
    development: {
      API_HOME: 'https://petstore.swagger.io/v2/pet/',
      // vconsole 开关
      IS_OPEN_VCONSOLE: true
    },
    // 测试环境
    test: {
      API_HOME: 'https://test.xxx.com/serve-badminton/',
      // vconsole 开关
      IS_OPEN_VCONSOLE: true
    },
    // 生产环境
    production: {
      API_HOME: 'https://production.xxx.com/serve-badminton/',
      // vconsole 开关
      IS_OPEN_VCONSOLE: false
    }
  },
});
