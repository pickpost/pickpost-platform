import axios from 'axios';

axios.interceptors.response.use(res => {
  return res ? res.data : {};
});

export default function ajax(options) {
  return new Promise((resolve, reject) => {
    axios(options).then((res) => {
      if (res && res.status === 'success') {
        resolve(res);
      } else {
        reject(new Error(res.message || '系统错误'));
      }
    });
  });
}
