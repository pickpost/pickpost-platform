import { message } from 'antd';
import ajax from '../../utils/ajax';

export default {
  namespace: 'projectModel',
  state: {
    project: {},
  },
  effects: {
    *projectDetail({ projectId }, { call, put }) {
      try {
        const { status, data } = yield call(ajax, {
          url: `/api/projects/${projectId}`,
          method: 'get',
        });

        if (status === 'success') {
          yield put({
            type: 'setData',
            data: {
              project: data,
            },
          });
        }
      } catch (e) {
        message.error('系统异常');
      }
    },
  },

  reducers: {
    setData(state, { data }) {
      return { ...state, ...data };
    },
  },
};
