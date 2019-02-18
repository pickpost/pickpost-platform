export default {
  namespace: 'globalModel',
  state: {
    spaceModalVisible: false,
  },
  effects: {
  },
  reducers: {
    setData(state, { data }) {
      return { ...state, ...data };
    },
    toggleSpaceModal(state, { show }) {
      return { ...state, spaceModalVisible: !!show };
    },
  },
  subscriptions: {
    setup({ history, dispatch }) {
      // 监听 history 变化，判断是否有选中的空间，如果没有则需要让用户选择。
      return history.listen(({ pathname, query }) => {
        if ((pathname === '/collections' || pathname === '/projects') && !query.space) {
          dispatch({ type: 'toggleSpaceModal', show: true });
        }
      });
    },
  },
};
