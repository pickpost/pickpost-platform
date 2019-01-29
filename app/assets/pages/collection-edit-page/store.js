import { message } from 'antd';
import { routerRedux } from 'dva/router';
import ajax from '../../utils/ajax';

export default {
  namespace: 'collectionEditModel',
  state: {
    editingCollection: {},
    deleteCollectionModal: false,
  },
  effects: {
    *editCollection({ id }, { call, put }) {
      if (id) {
        const { status, data } = yield call(ajax, {
          url: `/api/collections/${id}`,
          method: 'get',
        });

        if (status === 'success') {
          yield put({
            type: 'changeEditingCollection',
            collection: data,
            showEditingModal: true,
          });
        }
      } else {
        yield put({
          type: 'changeEditingCollection',
          collection: {},
          showEditingModal: true,
        });
      }
    },
    *saveCollection({ id, collection }, { call, put }) {
      const url = id ? `/api/collections/${id}` : '/api/collections';
      try {
        const { status } = yield call(ajax, {
          url,
          data: {
            ...collection,
          },
          method: id ? 'put' : 'post',
          type: 'json',
        });
        if (status === 'success') {
          yield put({
            type: 'collectionsModel/collections',
          });
          // 页面跳转到接口集列表
          yield put(routerRedux.push({
            pathname: '/collections',
            query: {},
          }));
        }
      } catch (e) {
        message.error(id ? '更新失败' : '创建失败');
      }
    },
    *deleteCollection({ id }, { call, put }) {
      try {
        const { status } = yield call(ajax, {
          url: `/api/collections/${id}`,
          data: {},
          method: 'DELETE',
          type: 'json',
        });
        if (status === 'success') {
          // 更新侧边栏接口集
          yield put({
            type: 'project/collections',
          });
        }
      } catch (e) {
        message.error('操作失败');
      }
    },
  },
  reducers: {
    changeEditingCollection(state, { collection, showEditingModal }) {
      return { ...state, editingCollection: collection, showEditingModal };
    },
    changeCollectionModal(state, { show }) {
      return { ...state, showEditingModal: show };
    },
    changeEditingProject(state, { project, showEditProjectModal }) {
      return { ...state, editingProject: project, showEditProjectModal };
    },
    changeProjectModal(state, { show }) {
      return { ...state, showEditProjectModal: show };
    },
  },
};
