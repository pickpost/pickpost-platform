'use strict';

const apiTypes = [
  {
    type: 'HTTP',
    name: 'HTTP',
    path: 'http',
    supportModules: [ 'doc', 'test', 'mock', 'setting' ],
    methods: [ 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD' ],
    color: 'blue',
    uniqueName: '路径规则',
    placeholder: '请输入接口规则，例如：/shop/detail.json',
  },
  {
    type: 'RPC',
    name: 'RPC',
    path: 'rpc',
    supportModules: [ 'doc', 'test', 'mock', 'setting' ],
    methods: [],
    color: 'purple',
    uniqueName: 'operationType',
    placeholder: '请输入 RPC 接口的 operationType 值，例如：alipay.client.getRSAKey',
  },
  {
    type: 'SPI',
    name: 'SPI',
    path: 'spi',
    supportModules: [ 'doc', 'test', 'mock', 'setting' ],
    methods: [],
    color: 'green',
    uniqueName: 'bizType',
    placeholder: '请输入 SPI 接口的 bizType 值，例如：kbsales.cspiShop.unbind',
  },
  {
    type: 'JSAPI',
    name: 'JSAPI',
    path: 'jsapi',
    supportModules: [ 'doc', 'mock', 'setting' ],
    methods: [],
    color: 'red',
    uniqueName: 'JSAPI方法名',
    placeholder: '请输入JSAPI的调用方法名, 例如: getUserInfo',
  },
];

const TypeColorMap = {};
apiTypes.forEach(item => {
  TypeColorMap[item.type] = item.color;
});

const AuthTypes = [
  {
    type: 'auth',
    name: '商家中心',
  },
  {
    type: 'buc',
    name: 'buc',
  },
];

exports.apiTypes = apiTypes;
exports.TypeColorMap = TypeColorMap;
exports.AuthTypes = AuthTypes;
