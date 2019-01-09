import ajax from 'xhr-plus';
import moment from 'moment';

export default {
  namespace: 'apiDocModel',
  state: {},
  effects: {
    *detail({ apiId, collectionId, form }, { call, put }) {
      yield put({
        type: 'reset',
      });
      const { status, data } = yield call(ajax, {
        url: `/api/apis/${apiId}`,
        method: 'get',
        type: 'json',
      });

      if (status === 'success') {
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
  },
};
