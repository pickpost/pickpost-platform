import ajax from 'xhr-plus';
import { message } from 'antd';
import { routerRedux } from 'dva/router';

export default {
  namespace: 'apiPageModel',
  state: {
    keywords: '',
    collectionId: '',
    collectionApis: [],
    currentAPI: {},
    filterApis: [],
    showFolderModal: false,
  },
  effects: {
    *detail({ apiId, collectionId }, { call, put }) {
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
          type: 'changeCurrentAPI',
          api: data,
        });
      }
    },
    *getApisTree({ collectionId }, { call, put }) {
      yield put({
        type: 'reset',
      });
      const { status, data } = yield call(ajax, {
        url: '/api/collection-apis',
        method: 'get',
        type: 'json',
        data: {
          collectionId,
        },
      });
      console.log(data);
      if (status === 'success') {
        yield put({
          type: 'setData',
          payload: {
            collectionApis: data,
          },
        });
      }
    },
    /**
     * 保存接口
     *
     * 接口创建 - 接口集创建
     *         - 系统池创建
     * 接口更新 - 接口集更新
     *         - 系统池更新
     */
    *saveAPI({ api }, { call }) {
      const url = api._id ? `/api/apis/${api._id}` : '/api/apis';
      try {
        const { status, errMsg } = yield call(ajax, {
          url,
          data: {
            api: JSON.stringify(api),
          },
          method: api._id ? 'put' : 'post',
          type: 'json',
        });
        if (status === 'success') {
          message.success(api._id ? '保存成功' : '创建成功');
        } else {
          message.error(errMsg || '操作失败');
        }
      } catch (e) {
        message.error(api._id ? '更新失败' : '创建失败');
      }
    },
    // 物理删除API，要删除关联该API的CollectionAPI
    *deleteAPI({ apiId, projectId, collectionId, nextId }, { call, put }) { // 如果删除的是当前展示的
      try {
        const { status } = yield call(ajax, {
          url: `/api/apis/${apiId}`,
          method: 'DELETE',
          type: 'json',
        });
        if (status === 'success') {
          message.success('删除成功');
          if (collectionId) {
            yield put({ type: 'project/collections', id: collectionId, apiId: nextId });
            yield put(routerRedux.push({
              pathname: `/collection/${collectionId}/${nextId || ''}`,
              query: {},
            }));
          } else {
            yield put({ type: 'project/projects', id: collectionId, apiId: nextId });
            yield put(routerRedux.push({
              pathname: `/project/${projectId}/${nextId || ''}`,
              query: {},
            }));
          }
        }
      } catch (e) {
        message.error('删除失败');
      }
    },
    *unlinkAPI({ apiId, projectId, collectionId, nextId }, { call, put }) {
      try {
        const { status } = yield call(ajax, {
          url: '/api/apisUnlink',
          method: 'POST',
          type: 'json',
          data: {
            apiId,
            collectionId,
          },
        });

        if (status === 'success') {
          message.success('移除成功');
          if (collectionId) {
            yield put({ type: 'project/collections', id: collectionId, apiId: nextId });
            yield put(routerRedux.push({
              pathname: `/collection/${collectionId}/${nextId || ''}`,
              query: {},
            }));
          } else {
            yield put({ type: 'project/projects', id: collectionId, apiId: nextId });
            yield put(routerRedux.push({
              pathname: `/project/${projectId}/${nextId || ''}`,
              query: {},
            }));
          }
        }
      } catch (e) {
        message.error('移除失败');
      }
    },
    *fetchProjectList({ }, { call, put }) {
      try {
        const { status, data } = yield call(ajax, {
          url: '/api/projects',
          method: 'get',
          type: 'json',
        });

        if (status === 'success') {
          yield put({
            type: 'changeProjectList',
            projectList: data,
          });
        }
      } catch (e) {
        console.log(e);
      }
    },
    *changeKeywords({ keywords }, { select, put }) {
      // 搜索关键词变化，设置关键词，且设置过滤结果。
      const { collectionModel } = yield select();
      const filterApis = collectionModel.apis.filter(item => item.url && item.url.toLowerCase().indexOf(keywords.toLowerCase()) >= 0);
      yield put({
        type: 'updateSearch',
        filterApis,
        keywords,
      });
    },
    *createFolder({ form, name, parentId, collectionId }, { call, put }) {
      try {
        const { status } = yield call(ajax, {
          url: '/api/collection-apis',
          method: 'POST',
          type: 'json',
          data: {
            parentId,
            collectionId,
            name,
          },
        });

        if (status === 'success') {
          message.success('创建成功');
          yield put({
            type: 'setFolderModal',
            visible: false,
          });
          form.resetFields();
        }
      } catch (e) {
        message.error('创建失败');
      }
    },
  },
  reducers: {
    setData(state, { payload }) {
      return { ...state, ...payload };
    },
    changeCurrentAPI(state, { api }) {
      return { ...state, currentAPI: api };
    },
    reset(state) {
      return { ...state, currentAPI: {} };
    },
    updateSearch(state, { filterApis, keywords }) {
      return { ...state, filterApis, keywords };
    },
    setFolderModal(state, { visible }) {
      return {
        ...state,
        showFolderModal: visible,
      };
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(({ pathname }) => {
        console.log('api-page', pathname);
        if (pathname === '/users') {
          dispatch({
            type: 'users/fetch',
          });
        }
      });
    },
  },
};
