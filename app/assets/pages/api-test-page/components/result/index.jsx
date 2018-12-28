import React from 'react';
import { Spin } from 'antd';
// import CopyToClipboard from 'react-copy-to-clipboard';
import Mock from 'mockjs';

import './style.less';

window.Mock = Mock;

class Result extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {};
  }

  render() {
    const { result, progress, isAuthing } = this.props;
    // const { url, target } = result;

    // const copyBtn = (
    //   <CopyToClipboard text={url || ''} onCopy={() => message.success('复制成功')}>
    //     <Icon type="copy" />
    //   </CopyToClipboard>
    // );

    return (
      <div className="result">
        <div className="result-inner">
          {
            result ? (
              <div>
                <div className="my-tabs">
                  <div className="active">Response Data</div>
                </div>
                <div className="result-content">
                  <pre className="code">
                    {JSON.stringify(result.response, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="inittext">
                <Spin spinning={progress > 0 && progress < 100} />
                <span style={{ paddingLeft: 10 }}>
                  {isAuthing && '接口请求中...'}
                </span>
              </div>
            )
          }
        </div>
      </div>
    );
  }
}

export default Result;
