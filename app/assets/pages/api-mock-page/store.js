import ajax from 'xhr-plus';

export default {
  namespace: 'apiMockModel',
  state: {
    apiId: '',
    url: '',
    name: '',
    desc: '',
    apiType: '',
    methods: '',
    responses: [{ title: 'headers', content: '' }],
    responseIndex: 0,
    updatedAt: '',
    projectName: '',
  },
  effects: {
    *detail({ apiId }, { call, put }) {
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
    *changeEditor({ changeType, list, index = 0 }, { put }) {
      yield put({
        type: 'setData',
        data: {
          responses: [ ...list ],
          responseIndex: index,
        },
      });
    },
  },

  reducers: {
    setData(state, { data }) {
      return { ...state, ...data };
    },
    changeProjectModel(state, { data }) {
      return { ...state, ...data };
    },
    changeResponse(state, { list, index }) {
      const responseIndex = typeof index === 'number' ? index : state.responseIndex;
      return { ...state, responses: list, responseIndex };
    },
  },
};
