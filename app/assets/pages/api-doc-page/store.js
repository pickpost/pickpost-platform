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
        // 更新表单值
        // form.setFieldsValue({
        //   _id: data._id,
        //   requestSchema: data.requestSchema,
        //   responseSchema: data.responseSchema,
        // });
      }
    },
  },
  reducers: {
    setData(state, { data }) {
      return { ...state, ...data };
    },
  },
};
