import ajax from 'xhr-plus';
import { message } from 'antd';
import { isBelong } from '../../utils/utils';

export default {
  namespace: 'collectionsModel',
  state: {
    collections: [],
    apis: [],
    filter: '',
    currentPage: 1,
    category: 'ME', // 1:ALL  2:ME
  },
  effects: {
    *collections({ id, apiId }, { call, put }) {
      try {
        const { status, data } = yield call(ajax, {
          url: '/api/collections',
          method: 'get',
          type: 'json',
          withCredentials: true,
          data: {},
        });

        if (status === 'success') {
          // 判断如果属于个人的接口为空，默认定位到全部
          yield put({
            type: 'setData',
            data: {
              category: data.find(isBelong) ? 'ME' : 'ALL',
              collections: data,
            },
          });
        }
      } catch (e) {
        message.error('查询接口集失败');
      }
    },
  },

  reducers: {
    setData(state, { data }) {
      return { ...state, ...data };
    },
    filterFile(state, { filter }) {
      return { ...state, filter };
    },
    setCurrentPage(state, { currentPage }) {
      return { ...state, currentPage };
    },
  },
};
