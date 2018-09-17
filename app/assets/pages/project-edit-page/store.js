import ajax from 'xhr-plus';
import { message } from 'antd';
import { routerRedux } from 'dva/router';

export default {
  namespace: 'projectEditModel',
  state: {
    editingProject: {
      owners: [],
      members: [],
    },
  },
  effects: {
    *editProject({ id }, { call, put }) {
      if (id) {
        const { status, data } = yield call(ajax, {
          url: `/api/projects/${id}`,
          method: 'get',
          type: 'json',
        });

        if (status === 'success') {
          yield put({
            type: 'changeEditingProject',
            project: data,
            showEditingModal: true,
          });
        }
      } else {
        yield put({
          type: 'changeEditingProject',
          project: {},
          showEditingModal: true,
        });
      }
    },
    *saveProject({ id, project }, { call, put }) {
      const url = id ? `/api/projects/${id}` : '/api/projects';
      try {
        const { status } = yield call(ajax, {
          url,
          data: {
            project: JSON.stringify(project),
          },
          method: id ? 'put' : 'post',
          type: 'json',
        });
        if (status === 'success') {
          // 页面跳转到接口集列表
          yield put(routerRedux.push({
            pathname: '/projects',
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
          url: `/api/projects/${id}`,
          data: {},
          method: 'DELETE',
          type: 'json',
        });
        if (status === 'success') {
          // 更新侧边栏接口集
          yield put({
            type: 'project/projects',
          });
        }
      } catch (e) {
        message.error('操作失败');
      }
    },
  },
  reducers: {
    changeEditingProject(state, { project, showEditingModal }) {
      return { ...state, editingProject: project, showEditingModal };
    },
  },
};
