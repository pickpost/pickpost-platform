import ajax from 'xhr-plus';
import { message } from 'antd';

export default {
  namespace: 'apiListModel',
  project: {},
  collection: {},
  state: {
    apis: [],
  },
  effects: {
    // 获取需求信息
    *collectionDetail({ collectionId }, { call, put }) {
      try {
        const { status, data } = yield call(ajax, {
          url: `/api/collections/${collectionId}`,
          method: 'get',
          type: 'json',
          data: {},
        });

        if (status === 'success') {
          yield put({
            type: 'setData',
            data: {
              collection: data,
            },
          });
        }
      } catch (e) {
        message.error('系统异常');
      }
    },

    *projectDetail({ projectId }, { call, put }) {
      try {
        const { status, data } = yield call(ajax, {
          url: `/api/projects/${projectId}`,
          method: 'get',
          type: 'json',
          data: {},
        });

        if (status === 'success') {
          yield put({
            type: 'setData',
            data: {
              project: data,
            },
          });
        }
      } catch (e) {
        message.error('系统异常');
      }
    },

    // 获取需求内接口列表
    *collectionApis({ projectId, collectionId, groupId }, { call, put }) {
      try {
        const params = {};
        if (!projectId && !collectionId) return;
        if (collectionId) {
          params.collectionId = collectionId;
          params.groupId = groupId;
        } else if (projectId) {
          params.projectId = projectId;
        }
        const { status, data } = yield call(ajax, {
          url: '/api/apis',
          method: 'get',
          type: 'json',
          data: { ...params },
        });
        if (status === 'success') {
          yield put({
            type: 'setData',
            data: {
              apis: data.apis,
            },
          });
        }
      } catch (e) {
        message.error('系统异常');
      }
    },

    *projectApis({ projectId }, { call, put }) {
      try {
        if (!projectId) return;
        const { status, data } = yield call(ajax, {
          url: '/api/apis',
          method: 'get',
          type: 'json',
          data: {
            projectId,
          },
        });
        if (status === 'success') {
          yield put({
            type: 'setData',
            data: {
              apis: data.apis,
            },
          });
        }
      } catch (e) {
        message.error('系统异常');
      }
    },

    // 物理删除API，要删除关联该API的CollectionAPI
    *deleteAPI({ apiId, projectId, collectionId }, { call, put }) { // 如果删除的是当前展示的
      try {
        const { status } = yield call(ajax, {
          url: `/api/apis/${apiId}`,
          method: 'DELETE',
          type: 'json',
        });
        if (status === 'success') {
          message.success('删除成功');
          if (collectionId) {
            yield put({ type: 'collectionApis', collectionId });
          } else {
            yield put({ type: 'collectionApis', projectId });
          }
        }
      } catch (e) {
        message.error('删除失败');
      }
    },

    *unlinkAPI({ apiId, projectId, collectionId }, { call, put }) {
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
          yield put({ type: 'collectionApis', collectionId });
        }
      } catch (e) {
        message.error('移除失败');
      }
    },
  },

  reducers: {
    setData(state, { data }) {
      return { ...state, ...data };
    },
  },
};
