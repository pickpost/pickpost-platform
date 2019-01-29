import moment from 'moment';
import { message } from 'antd';
import ajax from '../../utils/ajax';

export default {
  namespace: 'apiDocModel',
  state: {},
  effects: {
    *detail({ apiId, collectionId, form }, { call, put }) {
      yield put({
        type: 'reset',
      });

      try {
        const { data } = yield call(ajax, {
          url: `/api/apis/${apiId}`,
          method: 'get',
        });
        const { swaggerSyncAt, updatedAt } = data;
        let nValue = '';

        if (swaggerSyncAt) {
          // 手动文档更新时间早于智能文档
          if (moment(updatedAt).isBefore(swaggerSyncAt)) {
            nValue = 'auto';
          } else {
            nValue = 'manual';
          }
        }

        yield put({
          type: 'setData',
          data: {
            ...data,
            autoSwitch: nValue,
          },
        });
      } catch (err) {
        message.error(err.message || '系统异常');
      }
    },
  },
  reducers: {
    setData(state, { data }) {
      return { ...state, ...data };
    },

    reset() {
      return {};
    },

    updateFields(state, { data }) {
      return {
        ...state,
        ...data,
      };
    },
  },
};
