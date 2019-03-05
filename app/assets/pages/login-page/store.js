import { message } from 'antd';
import ajax from '../../utils/ajax';

export default {
  namespace: 'loginModel',
  state: {},
  effects: {
    *login({ email, password }, { call }) {
      try {
        yield call(ajax, {
          url: '/api/login',
          method: 'post',
          data: {
            email,
            password,
          },
        });

        location.href = '/';
      } catch (err) {
        message.error(err.message || '系统异常');
      }
    },
  },
  reducers: {
    setData(state, { data }) {
      return { ...state, ...data };
    },
  },
};
