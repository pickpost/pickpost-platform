export default {
  namespace: 'projectApisModel',
  state: {
    keywords: '',
    projectId: '',
    projectApis: [],
    currentAPI: {},
    filterApis: [],
    showFolderModal: false,
  },
  effects: {

  },
  reducers: {
    setData(state, { payload }) {
      return { ...state, ...payload };
    },
    reset(state) {
      return { ...state, currentAPI: {} };
    },
  },
  // subscriptions: {
  //   setup({ dispatch, history }) {
  //     history.listen(({ pathname }) => {
  //       console.log('api-page', pathname);
  //       if (pathname === '/users') {
  //         dispatch({
  //           type: 'users/fetch',
  //         });
  //       }
  //     });
  //   },
  // },
};
