import { message } from 'antd';
import { isBelong } from '../../utils/utils';
import ajax from '../../utils/ajax';

export default {
  namespace: 'collectionsModel',
  state: {
    collections: [],
    apis: [],
    filter: '',
    currentPage: 1,
    category: 'ME', // 1:ALL  2:ME
    showFolderModal: false,
  },
  effects: {
    *collections({ id, apiId }, { call, put }) {
      try {
        const { status, data } = yield call(ajax, {
          url: '/api/collections',
          method: 'get',
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
        message.error(e.message || '查询接口集失败');
      }
    },
    *createFolder({ form, name, _id }, { call, put }) {
      try {
        yield call(ajax, {
          url: '/api/collections',
          method: 'POST',
          data: {
            name,
            type: 'folder',
          },
        });

        message.success(_id ? '更新成功' : '创建成功');
        yield put({
          type: 'setFolderModal',
          visible: false,
        });
        form.resetFields();
      } catch (e) {
        message.error(_id ? '更新失败' : '创建失败');
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
    setFolderModal(state, { visible }) {
      return { ...state, showFolderModal: visible };
    },
  },
};
