import React from 'react';
import autobind from 'autobind-decorator';
import { Icon, Button, message, Input, Alert, Drawer } from 'antd';
import { connect } from 'dva';
import Mock from 'mockjs';
import CopyToClipboard from 'react-copy-to-clipboard';
import hljs from 'highlight.js/lib/highlight';

import Info from '../../components/Info';
import Editor from '../../components/Editor';

import './index.less';
import 'highlight.js/styles/googlecode.css';

// highlight.js 高亮插件注册语言包
hljs.registerLanguage('javascript', require('highlight.js/lib/languages/typescript'));
// 重写内部方法
hljs.highlightCode = () => {
  const node = document.querySelectorAll('pre code');
  if (node) Array.from(node).forEach(hljs.highlightBlock);
};

window.Mock = Mock;
const mockCode = `
{ // 响应式 Mock
  status: 'succeed',
  data: {
    request: function() {
      return _req; // 方法内默认注入 _req 对象
    },
    date() { // 当然, 也可以这么写
      return Mock.mock('@datetime'); // 方法内默认注入 Mock 对象
    },
    complex() { // 响应式Mock数据
      if (_req.query.hasAuth) {
        return 'something important'
      } else {
        return 'error 500'
      }
    }
  }
}


{ // MockJS 生成数据
  'status': 'succeed',
  'total': 100,
  'data': {
    'items|5': [ // 生成5个数组
      {
        'id|+1': 20170227000001, // 数字递增
        'number|1-100': 100, // 范围值
        'token|1-10': /[a-z][A-Z][0-9]/, // 支持正则表达式
        'hasAuth|1': true,
        'datetime': Random.datetime('yyyy-MM-dd HH:mm:ss'), // 随机生成时间
        'image': Random.image('200x100'),
        'cname': Random.cname(),
        'url': Random.url(),
      },
    ],
  },
}
`;

@autobind
class Api extends React.PureComponent {
  state = {
    modalEnvs: [],
    showMockTips: false,
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { responses, responseIndex } = this.props.apiPageModel.currentAPI;
    dispatch({
      type: 'apiMockModel/setData',
      data: {
        responses,
        responseIndex,
      },
    });
  }

  getPreviewUrl(api) {
    const prefix = `${location.protocol}//${location.host}`;
    const { apiType, projectName, url } = api;
    switch (apiType) {
      case 'HTTP':
        return `${prefix}/mock/${projectName}${url}`;
      case 'RPC':
        return `${prefix}/mockrpc/${projectName}/${url}`;
      case 'SPI':
        return `${prefix}/mockspi/${projectName}/${url}`;
      default:
        return '';
    }
  }

  handleSave() {
    const { responses, responseIndex } = this.props.apiMockModel;
    const { params: { apiId } } = this.props;

    this.props.dispatch({
      type: 'apiMockModel/saveMock',
      api: {
        _id: apiId,
        responses,
        responseIndex,
      },
    });
  }

  handleEditorChange(type, list, selected) {
    this.props.dispatch({
      type: 'apiMockModel/changeEditor',
      changeType: type,
      list,
      index: typeof selected === 'number' ? selected : 0,
    });
  }

  toggleMockTips = () => {
    const { showMockTips } = this.state;
    this.setState({
      showMockTips: !showMockTips,
    }, () => {
      hljs.highlightCode();
    });
  }

  getBelongQuery() {
    const { belong } = this.props.location.query;
    return belong || '';
  }

  getBelong() {
    let { belong } = this.props.location.query;
    const { projectId } = this.props.apiMockModel;
    belong = belong || `project_${projectId}`;
    return belong;
  }

  getUplevel() {
    return '/' + this.getBelong().replace('_', '/') + '?tab=api';
  }

  render() {
    const { showMockTips } = this.state;
    const { apiPageModel, apiMockModel } = this.props;
    const { currentAPI: { name, url, apiType } } = apiPageModel;
    const { responses, responseIndex } = apiMockModel;
    const mockTips = (
      <div className="mock-tips">
        支持高级功能: 响应式Mock, MockJS生成数据 <span className="pull-right">查看示例</span>
      </div>
    );

    const previewUrl = this.getPreviewUrl(apiPageModel.currentAPI);

    const copyBtn = (
      <CopyToClipboard text={previewUrl} onCopy={() => message.success('复制成功')}>
        <Icon type="copy" />
      </CopyToClipboard>
    );

    return (
      <div>
        <div className="c-header">
          <Info title={name} url={url} apiType={apiType}>
            <Button size="default" className="new-btn" type="primary" icon="save" onClick={this.handleSave}>保存</Button>
          </Info>
        </div>
        <div className="api-content">
          <div className="mock-panel-content">
            <div className="bar">
              <Input readOnly addonBefore="Mock访问地址：" addonAfter={copyBtn} value={previewUrl} onChange={() => { }} />
            </div>
            <div className="mock-tips-wrapper" onClick={this.toggleMockTips}>
              <Alert
                message={mockTips}
                type="info"
                showIcon
              />
            </div>
            <Editor
              key="editorresponse"
              data={responses}
              selected={responseIndex}
              type="responses"
              onChange={this.handleEditorChange}
            />
          </div>
        </div>
        <Drawer
          className="mock-code-drawer"
          title="示例"
          width={600}
          placement="right"
          closable={false}
          onClose={this.toggleMockTips}
          visible={showMockTips}
        >
          <pre>
            <code>
              {mockCode}
            </code>
          </pre>
          <a href="http://mockjs.com/examples.html" className="pull-right" target="_blank">查看更多mockjs示例</a>
        </Drawer>
      </div>
    );
  }
}

export default connect(({ apiMockModel, apiPageModel }) => {
  return {
    apiPageModel,
    apiMockModel,
  };
})(Api);
