'use strict';

const apiTypes = [
  {
    type: 'HTTP',
    name: 'HTTP',
    path: 'http',
    methods: [ 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD' ],
    color: 'blue',
    uniqueName: '路径规则',
    placeholder: '请输入接口规则，例如：/shop/detail.json',
  },
  {
    type: 'RPC',
    name: 'RPC',
    path: 'rpc',
    methods: [],
    color: 'purple',
    uniqueName: 'operationType',
    placeholder: '请输入 RPC 接口的 operationType 值，例如：alipay.client.getRSAKey',
  },
  {
    type: 'SPI',
    name: 'SPI',
    path: 'spi',
    methods: [],
    color: 'green',
    uniqueName: 'bizType',
    placeholder: '请输入 SPI 接口的 bizType 值，例如：mobilecsa.getList',
  },
];

const TypeColorMap = {};
apiTypes.forEach(item => {
  TypeColorMap[item.type] = item.color;
});

exports.apiTypes = apiTypes;
exports.TypeColorMap = TypeColorMap;
