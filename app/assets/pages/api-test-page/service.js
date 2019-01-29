import { message } from 'antd';
import ajax from '../../utils/ajax';

function getChromeToken() {
  return new Promise(resolve => {
    const editorExtensionId = 'mdghlbnmleehdbjpalffobdlmohpngoo';
    if (chrome && chrome.runtime) {
      chrome.runtime.sendMessage(editorExtensionId, {}, response => {
        const cookies = (response && response.cookies) || [];
        const pluginCookieStr = cookies.map(item => { return `${item.name}=${item.value}`; }).join(';');
        resolve(pluginCookieStr);
      });
    } else {
      resolve('');
    }
  });
}

/**
 * Cet Cookies
 * @param {*} authStrategy auth | buc
 * @param {*} env dev | sit | prod
 * @param {*} account string
 * @param {*} password string
 * @return {Promose} string
 */
export function getCookie(authStrategy, env, account, password) {
  return new Promise(resolve => {
    if (authStrategy) {
      ajax({
        url: '/auth',
        method: 'get',
        params: { type: authStrategy, userid: account, pwd: password, env },
      }).then(result => {
        if (result && result.status === 'success') {
          resolve(result.data.cookieStr);
        } else {
          resolve('');
          message.error('来自 PickPost 的提示：' + (result.resultMsg || '登录异常'));
        }
      });
    } else {
      // 如果没有成功获得Cookie，查看chrome插件是否有cookie
      getChromeToken().then(cookie => {
        resolve(cookie);
      });
    }
  });
}
