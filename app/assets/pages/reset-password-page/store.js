import { message } from 'antd';
import ajax from '../../utils/ajax';

export default {
  namespace: 'resetPasswordModel',
  state: {
    searchPass: true,
    email: null,
  },
  effects: {
    *searchPass({ email }, { call, put }) {
      try {
        const res = yield call(ajax, {
          url: '/api/search_pass',
          method: 'post',
          data: {
            email,
          },
        });
        if (res.status === 'success') {
          yield put({
            type: 'setData',
            data: {
              email,
              searchPass: false,
            },
          });
        }
      } catch (err) {
        message.error(err.message || '系统异常');
      }
    },
    *sendEmail({ email }, { call }) {
      try {
        const res = yield call(ajax, {
          url: '/api/send_reset_password_code',
          method: 'post',
          data: {
            email,
          },
        });
        if (res.status === 'success') {
          message.success(`验证码已发送至${email}`);
        }
      } catch (err) {
        message.error(err.message || '系统异常');
      }
    },
    *resetPassword(param, { call }) {
      try {
        const res = yield call(ajax, {
          url: '/api/reset_password',
          method: 'post',
          data: param,
        });
        if (res.status === 'success') {
          location.href = '/';
        }
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
