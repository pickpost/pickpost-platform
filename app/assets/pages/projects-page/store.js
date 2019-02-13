import ajax from '../../utils/ajax';
import { message } from 'antd';

export default {
  namespace: 'projectsModel',
  state: {
    searchCollection: '', // 指定的搜索接口集
    searchProject: '', // 指定的搜索项目
    projects: [],
    filter: '',
    category: '2', // 1:All  2:Me
  },
  effects: {
    *projects({ spaceAlias }, { call, put }) {
      try {
        const { status, data } = yield call(ajax, {
          method: 'get',
          url: '/api/projects',
          params: {
            spaceAlias,
          },
        });

        if (status === 'success') {
          yield put({
            type: 'setData',
            data: {
              projects: data,
            },
          });
        }
      } catch (e) {
        message.error('查询项目列表失败');
      }
    },
  },

  reducers: {
    setData(state, { data }) {
      return { ...state, ...data };
    },
    changeCollections(state, { collections, collectionId, apiId, accounts, envs, serverUrl }) {
      return { ...state, collections, collectionId, apiId, accounts, envs, serverUrl };
    },
    filterFile(state, { filter }) {
      return { ...state, filter };
    },
  },
};
