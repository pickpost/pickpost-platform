export default {
  namespace: 'projectModel',
  state: {
    apis: [],
    project: {},
  },
  effects: {
  },

  reducers: {
    setData(state, { data }) {
      return { ...state, ...data };
    },
  },
};
