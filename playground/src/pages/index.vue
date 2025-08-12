<script setup>
import { useRequest } from 'winjs';
// import { useRequest } from 'vue-hooks-plus'
/**
 * 以下仅为事例代码，可以随意扩展修改
 */
import services from '@/services';

function findByStatus () {
  const { data, error, loading } = useRequest(() => {
    return services
      .findByStatus({
        method: 'get',
        data: {
          status: 'available'
        }
      });
  });
  if (loading.value) {
    console.log('接口请求中....');
  }
  if (error.value) {
    console.log('接口请求异常：' + error.value);
  }
}

function getUsername (params) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([`vue-hooks-plus ${ params.desc }`]);
    }, 1000);
  });
}

let username = '';
// getUsername({ desc: 'good' }).then((res) => console.log(res))
const { data, loading, error } = useRequest(() => getUsername({ desc: 'good' }));

username = data;
if (loading.value) {
  console.log('接口请求中....');
}
if (data.value) {
  console.log('接口请求成功：' + JSON.stringify(data.value, null, 2));
}
if (error.value) {
  console.log('接口请求异常：' + error.value);
}

findByStatus();
</script>

<template>
  <div>
    <h2>Hi! Welcome to Winjs ❤️ Vue!</h2>
    <p>
      <img src="@/assets/img/logo.png" width="200" height="200" alt="logo" />
    </p>
    <p>To get started, edit <code>pages/index.vue</code> and save to reload.</p>
    <div>name：{{ loading ? 'loading' : username }}</div>
  </div>
</template>
