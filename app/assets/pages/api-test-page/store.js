import ajax from 'xhr-plus';
// import key from 'keymaster';
import { message } from 'antd';
import { mockParse, keyValueParse, getEnvByUrl } from '../../utils/utils';
import get from 'lodash/get';
import { getCookie } from './service';

function getCtoken(cookieStr) {
  const matchCookie = /ctoken=([^;]*)/.exec(cookieStr);
  if (matchCookie && matchCookie[1]) {
    return matchCookie[1];
  }
  return '';
}

function refreshUrl(url, params = {}) {
  return url + '?' + Object.keys(params).map(p => `${p}=${params[p]}`).join('&');
}

export default {
  namespace: 'apiTestModel',
  state: {
    progress: 0, // 请求进度
    isAuthing: '', // 是否正在授权
    subType: '2', // 默认选中 Body Tab
    projectName: '',
    projectId: '',

    serverUrl: '',
    gateway: '', // 网关地址
    desc: '',
    apiType: '', // HTTP RPC MGW
    url: '',
    method: '',
    methods: [ 'GET' ],
    params: [{ title: 'headers', content: '' }],
    paramsIndex: 0,
    requests: [{ title: 'headers', content: '' }],
    requestIndex: 0,
    headerIndex: 0,
    headers: [{ title: 'headers', content: '' }],

    // 接口集
    accounts: [],
    envs: [],

    // 环境编辑弹层
    envModal: false,
    accountModal: false,

    // 授权策略
    authStrategy: '',
    account: '',
    password: '',
    cookieStr: '',

    // 请求结果
    result: null,
  },
  effects: {
    *detail({ apiId }, { call, put }) {
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
          type: 'syncData',
          data,
        });
      }
    },

    *changeEditor({ changeType, list, index = 0 }, { put, select }) {
      const mapReducers = {
        requests: 'changeRequest',
        params: 'changeParams',
        headers: 'changeHeader',
      };
      const reducer = mapReducers[changeType];
      const url = yield select(state => state.apiTestModel.url);
      yield put({ type: reducer, list, index, url });
    },

    *sendRequest({}, { put, select }) {
      const {
        apiType,
      } = yield select(state => state.apiTestModel);

      if (apiType === 'SPI') {
        yield put({
          type: 'sendSPIRequest',
        });
      } else if (apiType === 'RPC') {
        yield put({
          type: 'sendRPCRequest',
        });
      } else {
        yield put({
          type: 'sendHTTPRequest',
        });
      }
    },

    *sendRPCRequest({}, { put, select, call }) {
      const {
        serverUrl, url, method, requests, requestIndex, account, password,
      } = yield select(state => state.apiTestModel);

      const requestData = JSON.stringify(mockParse(requests[requestIndex] && requests[requestIndex].content));

      const rpcResponse = yield call(ajax, {
        url: '/proxyRPC',
        method: 'post',
        type: 'json',
        data: {
          operationType: url,
          mgw: serverUrl,
          method: 'RPC',
          username: account,
          password,
          data: requestData,
        },
      });

      yield put({
        type: 'setData',
        data: {
          progress: 100,
          result: {
            url: `${serverUrl}/${url}`,
            method,
            headers: '',
            request: requestData,
            response: rpcResponse.data,
          },
        },
      });
    },

    *sendSPIRequest({}, { put, select, call }) {
      const {
        serverUrl, url, method, requests, requestIndex,
        headers, headerIndex, gateway, authStrategy, account, password,
      } = yield select(state => state.apiTestModel);
      yield put({ type: 'setData', data: { progress: 50, result: null, isAuthing: '接口调用中...' } });

      const requestData = JSON.stringify(mockParse(requests[requestIndex] && requests[requestIndex].content));
      const authEnv = getEnvByUrl(gateway);
      const headerKeyValues = keyValueParse(headers[headerIndex] ? headers[headerIndex].content : '');
      const cookieStr = yield call(getCookie, authStrategy, authEnv, account, password);
      const fullGateway = gateway.indexOf('/spigw.json') >= 0 ? gateway : `${gateway}/spigw.json`;
      const spiSendUrl = refreshUrl(fullGateway, {
        ctoken: getCtoken(cookieStr),
        _input_charset: 'utf-8',
      });

      const rpcResponse = yield call(ajax, {
        url: '/proxySPI',
        method: 'post',
        type: 'json',
        data: {
          targetUrl: spiSendUrl,
          dataStr: JSON.stringify({
            bizType: url,
            bizCase: '',
            requestData: JSON.stringify([ JSON.parse(requestData) ]),
            host: serverUrl.replace(/^https?:\/\//, ''),
          }),
          cookieStr,
        },
      });

      yield put({
        type: 'setData',
        data: {
          isAuthing: '',
          progress: 100,
          result: {
            url: fullGateway,
            method,
            headers: JSON.stringify(headerKeyValues),
            request: {
              bizType: url,
              bizCase: '',
              requestData: JSON.stringify([ JSON.parse(requestData) ]),
              host: serverUrl.replace(/^https?:\/\//, ''),
              ctoken: getCtoken(cookieStr),
              _input_charset: 'utf-8',
            },
            response: rpcResponse.data,
          },
        },
      });
    },

    *sendHTTPRequest({}, { put, select, call }) {
      const {
        serverUrl, url, method, requests, requestIndex,
        headers, headerIndex, authStrategy, account, password,
        params, paramIndex,
      } = yield select(state => state.apiTestModel);

      yield put({ type: 'setData', data: { progress: 50, result: null, isAuthing: '接口调用中...' } });

      const requestData = mockParse(requests[requestIndex] && requests[requestIndex].content);
      const headerKeyValues = keyValueParse(headers[headerIndex] ? headers[headerIndex].content : '');
      const queries = keyValueParse(params[paramIndex].content);

      const authEnv = getEnvByUrl(serverUrl);
      const cookieStr = yield call(getCookie, authStrategy, authEnv, account, password);

      const sendUrl = refreshUrl(serverUrl + url, {
        ...queries,
        ctoken: getCtoken(cookieStr),
      });
      const result = yield call(ajax, {
        url: '/proxy',
        method: 'post',
        type: 'json',
        data: {
          url: sendUrl,
          method,
          cookieStr,
          headers: JSON.stringify(headerKeyValues),
          data: JSON.stringify(requestData),
        },
      });

      yield put({
        type: 'setData',
        data: {
          isAuthing: '',
          progress: 100,
          result: {
            url: sendUrl,
            method,
            headers: JSON.stringify(headerKeyValues),
            request: requestData,
            response: result.data,
          },
        },
      });
    },

    *updateEnv({ url, envs }, { put, call }) {
      const result = yield call(ajax, {
        url,
        type: 'json',
        method: 'put',
        data: { project: JSON.stringify({ envs }) },
      });

      if (result && result.status === 'success') {
        yield put({
          type: 'setData',
          data: {
            envs,
            envModal: false,
          },
        });
        message.success('设置成功');
      } else {
        message.error('设置失败');
      }
    },

    *updateGateway({ url, gateways }, { put, call }) {
      const result = yield call(ajax, {
        url,
        type: 'json',
        method: 'put',
        data: { project: JSON.stringify({ gateways }) },
      });
      if (result && result.status === 'success') {
        yield put({
          type: 'setData',
          data: {
            gateways,
            gatewayModal: false,
          },
        });
        message.success('设置成功');
      } else {
        message.error('设置失败');
      }
    },

    *updateAccounts({ url, accounts }, { call, put }) {
      try {
        const accountsData = yield call(ajax, {
          url,
          type: 'json',
          method: 'put',
          data: {
            project: JSON.stringify({ accounts }),
          },
        });
        if (accountsData.status === 'success') {
          yield put({
            type: 'setData',
            data: {
              accounts,
              accountModal: false,
            },
          });
          message.success('设置成功');
        } else {
          message.error('设置失败');
        }
      } catch (e) {
        message.error('设置失败');
      }
    },
  },

  reducers: {
    setData(state, { data }) {
      return { ...state, ...data };
    },

    syncData(state, { data }) {
      const method = data.apiType === 'HTTP' && data.methods && data.methods[0] ? data.methods[0] : 'GET';
      return {
        projectName: data.projectName,
        projectId: data.projectId,
        _id: data._id,
        apiName: data.name,
        url: data.url,
        desc: data.desc,
        apiType: data.apiType,
        method,
        methods: data.methods || [ 'GET', 'POST' ],
        subType: data.apiType === 'HTTP' && method === 'GET' ? '1' : '2',
        requestIndex: data.requestIndex,
        requests: data.requests,
        paramIndex: data.paramIndex,
        params: data.params,
        headerIndex: data.headerIndex,
        headers: data.headers,
        updateAt: data.updateAt,
        // 还需要更新 collection 相关的字段：accounts, envs
        accounts: (data.accounts || []).filter(item => item),
        envs: data.envs || [],
        gateways: data.gateways || [],
        serverUrl: get(data, 'envs[0].value'),
        gateway: get(data, 'gateways[0].value'),
        result: null,
      };
    },
    requestEnded(state, { data }) {
      return {
        ...state,
        ...data,
      };
    },
    changeTestingAPI(state, { api }) {
      const apiTestModel = {
        method: api.methods[0],
        ...api,
      };

      return { ...state, ...apiTestModel };
    },
    changeServerUrl(state, { serverUrl }) {
      const paramIndex = state.paramIndex;
      const list = state.params;
      const url = state.url;
      const prefixUrl = serverUrl || '';
      const query = (list[paramIndex] && list[paramIndex].content) || {};
      let queries = {};
      try {
        queries = keyValueParse(query);
      } catch (err) {
        queries = {};
      }
      const queryStr = Object.keys(queries).map(key => `${key}=${encodeURIComponent(queries[key])}`).join('&');
      const displayUrl = queryStr ? `${prefixUrl}${url}?${queryStr}` : `${prefixUrl}${url}`;
      // Todo: 如果url变了，spi接口需要自动判断环境
      return { ...state, displayUrl, serverUrl };
    },
    changeGateway(state, { gateway }) {
      return { ...state, gateway };
    },
    // changeUrl(state, { displayUrl, param }) {
    //   const params = [ ...state.params ];
    //   const paramsIndex = state.paramsIndex;
    //   const paramInfo = params[paramsIndex] || {};
    //   paramInfo.content = param;
    //   params[paramsIndex] = { ...paramInfo };
    //   const url = displayUrl.split('?')[0];
    //   return { ...state, url, params, displayUrl };
    // },
    changeMethod(state, { method }) {
      return { ...state, method };
    },
    changeHeader(state, { list, index }) {
      const headerIndex = typeof index === 'number' ? index : state.headerIndex;
      return { ...state, headers: list, headerIndex };
    },
    changeParams(state, { url, list, index }) {
      const paramIndex = typeof index === 'number' ? index : state.paramsIndex;
      const { serverUrl } = state;
      const query = list[paramIndex].content || {};
      let queries = {};
      try {
        queries = keyValueParse(query);
      } catch (err) {
        queries = {};
      }
      const queryStr = Object.keys(queries).map(key => `${key}=${encodeURIComponent(queries[key])}`).join('&');
      const displayUrl = queryStr ? `${serverUrl || ''}${url}?${queryStr}` : `${serverUrl || ''}${url}`;
      return { ...state, params: list, paramsIndex: paramIndex, displayUrl, url };
    },
    changeRequest(state, { list, index }) {
      const requestIndex = typeof index === 'number' ? index : state.requestIndex;
      return { ...state, requests: list, requestIndex };
    },
  },

  subscriptions: {
    // keyEvent({ dispatch }) {
    //   key('⌘+s, ctrl+s', e => { e.preventDefault(); dispatch({ type: 'updateAPI' }); });
    //   key('⌘+p, ctrl+p', e => { e.preventDefault(); dispatch({ type: 'sendRequest' }); });
    // },
  },
};
