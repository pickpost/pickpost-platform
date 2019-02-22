import { message } from 'antd';
import ajax from '../../utils/ajax';
import { userInfo } from '../../utils/utils';

export default {
  namespace: 'apiEditModel',
  state: {
    projectList: [],
    editingAPI: {
      apiType: 'HTTP',
    },
  },
  effects: {
    *fetchProjectList({ collectionId }, { call, put }) {
      try {
        const { status, data } = yield call(ajax, {
          url: '/api/projects',
          method: 'get',
          params: {
            collectionId,
          },
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
    *detail({ apiId }, { call, put }) {
      const { status, data } = yield call(ajax, {
        url: `/api/apis/${apiId}`,
        method: 'get',
      });

      if (status === 'success') {
        yield put({
          type: 'changeEditingAPI',
          api: data,
        });
      }
    },
    /**
     * 保存接口
     * 接口创建 - 接口集创建 -> 系统池创建
     * 接口更新 - 接口集更新 -> 系统池更新
     */
    *saveAPI({ api }, { call }) {
      const url = api._id ? `/api/apis/${api._id}` : '/api/apis';
      api.creater = userInfo();
      try {
        const { status, errMsg } = yield call(ajax, {
          method: api._id ? 'put' : 'post',
          url,
          data: {
            api,
          },
        });
        if (status === 'success') {
          message.success(api._id ? '保存成功' : '创建成功');
          // 跳转列表页
          history.back();
        } else {
          message.error(errMsg || '操作失败');
        }
      } catch (e) {
        message.error(api._id ? '更新失败' : '创建失败');
      }
    },
  },
  reducers: {
    changeCurrentAPI(state, { api }) {
      return { ...state, currentAPI: api };
    },
    changeEditingAPI(state, { api }) {
      return { ...state, editingAPI: api };
    },
    changeAPIModal(state, { show }) {
      return { ...state, showEditingModal: show };
    },
    changeProjectList(state, { projectList }) {
      return { ...state, projectList };
    },
    reset(state) {
      return { ...state, editingAPI: {} };
    },
  },
};
