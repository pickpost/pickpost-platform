// import moment from 'moment';
// import { message } from 'antd';
// import ajax from '../../utils/ajax';

export default {
  namespace: 'registerModel',
  state: {},
  effects: {
  },
  reducers: {
    setData(state, { data }) {
      return { ...state, ...data };
    },
  },
};
