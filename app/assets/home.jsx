import React from 'react';
import ReactDOM from 'react-dom';
import { Avatar, Button } from 'antd';
import { setCookie } from './utils/utils';

import './home.less';

// const socketServer = location.protocol + '//' + location.host + '/socket2';
// const socket = require('socket.io-client')(socketServer);

// socket.on('connect', () => {
//   console.log('connected socket server: ' + socketServer);
//   socket.emit('ping2', 'hello world!');
// });

// socket.on('res', msg => {
//   console.log('res from server: %s!', msg);
// });

const user = window.context && window.context.user || {};
export default class Container extends React.Component {

  componentDidMount() {
    // 设置已访问 Cookie
    setCookie('pickpost_home', 'visited', Infinity);
  }

  render() {
    return (
      <div style={{ height: '100%' }} ref={dom => { this.container = dom; }}>
        <div className="top-row">
          <a className="logo" href="/">
            <img src="https://gw.alipayobjects.com/zos/rmsportal/KPwBwWKdklgRyKUpyjga.png"/>
            PickPost
          </a>
          <div className="pull-right action-row">
            <span>
              <Button onClick={() => { location.href = '/collections'; }}>
                <a>工作台</a>
              </Button>
            </span>
            <span>
              <Avatar src={user.avatar}/>
            </span>
          </div>
        </div>
        <div className="big-preview">
          <h4>
            以 <b> 接口 </b> 为中心，<br />
            打造最好用的 <b> 前后端开发协作平台 </b>
          </h4>
          <img src="https://gw.alipayobjects.com/zos/rmsportal/ELwmZJtotFGBJhGAyPAb.png" alt=""/>
        </div>
        <div className="detail-item">
          <h5> 即是 Request Client，又是 Mock 数据工厂 </h5>
          <ul>
            <li>
              <img src="https://gw.alipayobjects.com/zos/rmsportal/UvEHatGhTjYQpiTHECFv.png" alt=""/>
              <h3>接口文档</h3>
              <p>
                与后端系统一一对应的接口文档<br />
                同时支持根据需求灵活聚合
              </p>
            </li>
            <li>
              <img src="https://gw.alipayobjects.com/zos/rmsportal/uUFdyGZInGlrHiuQXiwj.png" alt=""/>
              <h3>接口测试</h3>
              <p>
                打通授权体系<br />
                支持多种接口类型：HTTP、RPC、SPI
              </p>
            </li>
            <li>
              <img src="https://gw.alipayobjects.com/zos/rmsportal/SQdRClbAiqQewSIoEqfh.png" alt=""/>
              <h3>数据Mock</h3>
              <p>
                模拟接口返回数据<br />
                支持响应式 Mock 数据
              </p>
            </li>
          </ul>
          <div>
            <Button onClick={() => { location.href = '/collections'; }} type="primary" size="default">开始使用</Button>
          </div>
        </div>
        <div className="footer">
          <div className="clearfix">
            <dl>
              <dt>使用帮助(待补充)</dt>
            </dl>
            <dl>
              <dt>其他工具</dt>
            </dl>
            <div className="qr-zone">
              <img className="qr-code" src="https://gw.alipayobjects.com/zos/rmsportal/bUuJAOjlPyFObSndCNvH.jpg" alt=""/>
            </div>
          </div>
          <p className="foot-print">
            PickPost @2018
          </p>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Container />, document.getElementById('root'));
