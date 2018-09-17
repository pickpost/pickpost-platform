import React from 'react';
import { Icon, Input, message, Spin } from 'antd';
import CopyToClipboard from 'react-copy-to-clipboard';
import Mock from 'mockjs';
// import { mockParse } from '../../../utils/utils';

import './Result.less';

window.Mock = Mock;

class Result extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {};
  }

  getPreviewUrl() {
    const { apiType, serverUrl, url, gateway } = this.props.apiTestModel;
    if (apiType === 'HTTP') {
      return `${serverUrl}${url}`;
    } else if (apiType === 'SPI') {
      return gateway.indexOf('/spigw.json') >= 0 ? gateway : `${gateway}/spigw.json`;
    } else if (apiType === 'RPC') {
      return `${serverUrl}`;
    }
  }

  render() {
    const { result, progress, isAuthing } = this.props;
    const copyBtn = (
      <CopyToClipboard text={result ? result.url : ''} onCopy={() => message.success('复制成功')}>
        <Icon type="copy" />
      </CopyToClipboard>
    );
    const url = this.getPreviewUrl();

    return (
      <div className="result">
        <div className="result-inner">
          {
            url && (
              <div className="bar">
                <Input addonBefore="Preview:" addonAfter={copyBtn} value={url} onChange={() => {}} />
              </div>
            )
          }
          {
            result ?
              <div>
                <h3>Request Body</h3>
                <div className="request-body">
                  <pre className="code">
                    {JSON.stringify(result.request, null, 2)}
                  </pre>
                </div>
                <h3>Response Body</h3>
                <div className="result-content">
                  <pre className="code">
                    {JSON.stringify(result.response, null, 2)}
                  </pre>
                </div>
              </div>
                :
              <div className="inittext">
                <Spin spinning={progress > 0 && progress < 100} />
                <span style={{ paddingLeft: 10 }}>
                  {isAuthing || '点击【发送】查看请求结果'}
                </span>
              </div>
          }
        </div>
      </div>
    );
  }
}

export default Result;
