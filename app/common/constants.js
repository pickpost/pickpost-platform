'use strict';

const ApiTypes = [
  {
    type: 'HTTP',
    name: 'HTTP',
    path: 'http',
    methods: [ 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD' ],
    color: 'blue',
    uniqueName: '路径规则',
    placeholder: '请输入接口规则，例如：/shop/detail.json',
    globalUnique: false,
  },
  {
    type: 'RPC',
    name: 'RPC',
    path: 'rpc',
    methods: [],
    color: 'purple',
    uniqueName: 'operationType',
    placeholder: '请输入 RPC 接口的 operationType 值，例如：alipay.client.getRSAKey',
    globalUnique: true,
    gateways: [
      {
        value: 'http://mobilegw.aaa.alipay.net/mgw.htm',
        remark: 'DEV 环境',
      }, {
        value: 'http://mobilegw.dev01.alipay.net/mgw.htm',
        remark: 'DEV 环境',
      }, {
        value: 'http://mobilegw.dev02.alipay.net/mgw.htm',
        remark: 'DEV 环境',
      }, {
        value: 'http://mobilegw-1-64.test.alipay.net/mgw.htm',
        remark: 'SIT环境',
      }, {
        value: 'https://mobilegwpre.alipay.com/mgw.htm',
        remark: 'PRE环境',
      }, {
        value: 'https://mobilegw.alipay.com/mgw.htm',
        remark: 'PROD 环境',
      },
    ],
  },
  {
    type: 'SPI',
    name: 'SPI',
    path: 'spi',
    methods: [],
    color: 'green',
    uniqueName: 'bizType',
    placeholder: '请输入 SPI 接口的 bizType 值，例如：mobilecsa.getList',
    globalUnique: true,
    gateways: [
      {
        value: 'http://kbservcenter-zth-32.gz00b.dev.alipay.net/spigw.json',
        remark: 'DEV 环境',
      },
      {
        value: 'https://kbservcenter.test.alipay.net/spigw.json',
        remark: 'SIT 环境',
      },
      {
        value: 'https://kbservcenter.alipay.com/spigw.json',
        remark: 'PROD 环境',
      },
    ],
  },
];

const TypeColorMap = {};
ApiTypes.forEach(item => {
  TypeColorMap[item.type] = item.color;
});

const AuthTypes = [
  {
    type: 'auth',
    name: 'AuthCenter（商家中心等）',
  },
  {
    type: 'buc',
    name: 'BUC（运营工作台等）',
  },
];

exports.ApiTypes = ApiTypes;
exports.TypeColorMap = TypeColorMap;
exports.AuthTypes = AuthTypes;
