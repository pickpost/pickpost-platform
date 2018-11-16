import ajax from 'xhr-plus';
import { message } from 'antd';

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
    *changeEditor({ changeType, list, index = 0 }, { put }) {
      yield put({
        type: 'setData',
        data: {
          responses: [ ...list ],
          responseIndex: index,
        },
      });
    },

    *saveMock({ api }, { call }) {
      const { status } = yield call(ajax, {
        url: `/api/apis/${api._id}`,
        method: 'put',
        type: 'json',
        data: {
          api: JSON.stringify({
            ...api,
          }),
        },
      });
      if (status === 'success') {
        message.success('保存成功!');
      }
    },
  },

  reducers: {
    setData(state, { data }) {
      return { ...state, ...data };
    },
    changeTestingAPI(state, { api }) {
      const testingPanel = {
        ...api,
      };

      return { ...state, ...testingPanel };
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
