import json2schema from './json2schema';

// 给定一个 JSON 生成 Schema
const json = {
  provice: 'SH',
  cities: [{
    name: 'minghang',
    area: 1000,
  }],
  amount: 10000,
};

const scheme = json2schema(json);

console.log(scheme);
