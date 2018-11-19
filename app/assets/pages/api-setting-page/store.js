import ajax from 'xhr-plus';
import { message } from 'antd';
import { userInfo } from '../../utils/utils';

export default {
  namespace: 'apiSettingModel',
  state: {
    projectList: [],
    collectionId: '',
    projectId: '',
    editingAPI: {},
  },
  effects: {
    *fetchProjectList({}, { call, put }) {
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
    *detail({ apiId, collectionId }, { call, put }) {
      const { status, data } = yield call(ajax, {
        url: `/api/apis/${apiId}`,
        method: 'get',
        type: 'json',
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
