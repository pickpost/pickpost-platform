import axios from 'axios';

axios.interceptors.response.use(res => {
  return res ? res.data : {};
});

export default function ajax(options) {
  return axios(options).then((res) => {
    if (res && res.status === 'success') {
      return res;
    }

    throw new Error(res.message || '系统错误');
  });
}
