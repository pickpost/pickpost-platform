import ajax from 'xhr-plus';

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
        yield put({
          type: 'setData',
          data,
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
