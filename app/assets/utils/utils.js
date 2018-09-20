const Mock = require('mockjs');
const Random = Mock.Random;
const UrlPattern = require('url-pattern');
// const pattern = new UrlPattern('/api/users/:id');
// console.log(pattern.match('/api/users/10'));
// console.log(pattern.stringify({id: 1000}));
// https://www.npmjs.com/package/route-parser
// https://github.com/snd/url-pattern

window.Random = Random;

function port(protocol) {
  switch (protocol) {
    case 'http:':
      return 80;
    case 'https:':
      return 443;
    default:
      return location.port;
  }
}

// 普通的 url 解析
export function parseUrl(url) {
  const a = document.createElement('a');
  a.href = url;
  return {
    href: a.href,
    host: a.host || location.host,
    port: (a.port === '0' || a.port === '') ? port(a.protocol) : a.port,
    hash: a.hash,
    hostname: a.hostname || location.hostname,
    pathname: a.pathname.charAt(0) !== '/' ? '/' + a.pathname : a.pathname,
    protocol: !a.protocol || a.protocol === ':' ? location.protocol : a.protocol,
    search: a.search,
    query: a.search.slice(1),
  };
}

// 根据路由规则解析 url，得出 query 和 param 参数
// export function parseUrlByRouter(fullUrl, routerRule) {
//   // 1. 解析 query 参数
//   const query = getQueryParams(fullUrl);
//   const pathname = parse(fullUrl).pathname;

//   // 2. 解析 router 中的变量参数
//   const pattern = new UrlPattern(routerRule);
//   const param = pattern.match(pathname);

//   return {
//     query,
//     param,
//   };
// }

export function setUrlByRouter(fullUrl, routerRule, paramObj) {
  const pattern = new UrlPattern(routerRule);
  return pattern.stringify(paramObj);
}

export function getQueryParams(url) {
  if (!url) {
    return null;
  }

  const obj = {};
  const queryPattern = /([^?&#]+)=([^?&#]*)/g;
  let result;

  while ((result = queryPattern.exec(url)) != null) {
    obj[result[1]] = result[2];
  }

  return obj;
}

export function getQueryParamByName(name) {
  if (!name) {
    return '';
  }

  const result = location.search.match(new RegExp('[\?\&]' + name + '=([^\&]+)', 'i'));
  if (result === null || result.length < 1) {
    return '';
  }
  return result[1];
}

// 处理用户填写的mock数据
export function mockParse(mockStr) {
  let result = '';
  try {
    if (typeof mockStr !== 'string') {
      result = '';
    } else if (/^(\{|\[)(.|\n)*(\}|\])$/gmi.test(mockStr.trim())) {
      eval('result=' + mockStr);
      result = Mock.mock(result);
    } else {
      result = eval('(function(){' + mockStr + '})()');
    }
  } catch (err) {
    console.log(err.message);
  }
  return result || {};
}

export function keyValueParse(keyValueLines) {
  if (typeof keyValueLines === 'undefined') return {};
  try {
    // 匹配模式：key: value
    // 行首、行尾、冒号前后都允许有空格
    const matches = keyValueLines.split('\n').filter(x => !!x);
    if (matches.length === 0) return {};
    const kvObj = matches.map(kv => {
      const colonIndex = kv.indexOf(':');
      if (colonIndex === -1) {
        return {};
      }
      const k = kv.slice(0, colonIndex);
      const v = kv.slice(colonIndex + 1);
      if (!k || !v) {
        return {};
      }
      return {
        [k.trim()]: v.trim().replace(/^\'|\'$/g, ''),
      };
    }).reduce((obj, kv) => Object.assign(obj, kv), {});
    return Mock.mock(kvObj);
  } catch (err) {
    return {};
  }
}

export function tpl(str, vars) {
  const pattern = /\{([^\{]+)\}/g;
  const result = str.replace(pattern, function(x, y) {
    return vars[y] || '';
  });
  return result;
}

export function userInfo() {
  const {
    user,
  } = window.context;
  return user;
}

export function isOwner(data) {
  const {
    user,
  } = window.context;
  // const user = { workid: '200000' };
  const {
    owners,
  } = data;
  if (isAdmin()) {
    return true;
  }
  return (owners || []).find(o => o.key === user.workid);
}

export function isMember(data) {
  const {
    user,
  } = window.context;
  // const user = { workid: '200000' };
  if (isAdmin()) {
    return true;
  }
  const {
    members,
  } = data;
  return (members || []).find(o => o.key === user.workid);
}

export function isAdmin() {
  const {
    user,
  } = window.context;
  // const user = { workid: '200000' };
  const admins = [ '121106' ];
  return admins.indexOf(user.workid) >= 0;
}

// 是否归属，为了不让接口为空，默然让
export function isBelong(data) {
  const {
    user,
  } = window.context;
  // const user = { workid: '200000' };
  if (data._id === '5abfab404eef7f7571e4e002') {
    return true;
  }
  // const user = { workid: '200000' };
  return (data.owners || []).concat(data.members || []).find(o => o.key === user.workid);
}

// Todo
export function getEnvByUrl(url) {
  return 'dev';
}

export class StorageUtil {
  static setItem(key, val, isSession = false) {
    const adapter = isSession ? sessionStorage : localStorage;
    adapter.setItem(key, JSON.stringify(val));
  }

  static getItem(key, isSession = false) {
    const adapter = isSession ? sessionStorage : localStorage;
    try {
      return JSON.parse(adapter.getItem(key));
    } catch (err) {
      return adapter.getItem(key);
    }
  }

  static delItem(key, isSession = false) {
    const adapter = isSession ? sessionStorage : localStorage;
    adapter.removeItem(key);
  }
}
