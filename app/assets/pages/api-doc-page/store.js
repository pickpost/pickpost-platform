import ajax from 'xhr-plus';
import { message } from 'antd';

export default {
  namespace: 'apiDocModel',
  state: {},
  effects: {
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
  },
};
