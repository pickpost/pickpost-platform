import React from 'react';
import autobind from 'autobind-decorator';
import { Tag, message, Modal, Input, Tooltip } from 'antd';
import CopyToClipboard from 'react-copy-to-clipboard';
const beautify = require('js-beautify').js_beautify;
import BulkEditor from '../bulk-editor';

import { Controlled as CodeMirror } from 'react-codemirror2';
require('codemirror/mode/javascript/javascript');
require('codemirror/lib/codemirror.css');
require('codemirror/theme/material.css');
require('codemirror/addon/edit/matchbrackets');
require('codemirror/addon/selection/active-line');
require('codemirror/addon/lint/lint');
require('codemirror/addon/lint/javascript-lint');
require('../../utils/codemirror-json-lint');
require('codemirror/addon/lint/lint.css');

import './index.less';

const CodeMirrorConfig = {
  mode: { name: 'javascript', json: true },
  theme: 'material',
  height: 'auto',
  viewportMargin: Infinity,
  tabSize: 2,
  lineNumbers: true,
  gutters: [ 'CodeMirror-lint-markers' ],
  lint: true,
  smartIndent: true,
  matchBrackets: true,
  styleActiveLine: true,
};

@autobind
export default class Editor extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      list: (!this.props.data || this.props.data.length <= 0) ? [{ title: '', content: '' }] : this.props.data,
      selected: this.props.selected,
      showModal: false,
      tagTitle: '',
      tagIndex: 0,
    };
  }

  componentWillReceiveProps(nextProps) {
    let list = nextProps.data;
    if (!nextProps.data || nextProps.data.length <= 0) {
      list = [{
        title: '',
        content: '',
      }];
    }
    this.setState({
      list,
      selected: nextProps.selected || 0,
    });
  }

  handleInputChange(index, value) {
    const { list, selected } = this.state;
    list[index].content = value;

    this.props.onChange(this.props.type, list, selected);
  }

  handleListChange(index, listValue) {
    const { list, selected } = this.state;
    list[index].content = listValue.map(kv => `${kv.key || ''}: ${kv.value || ''}`).join('\n');

    this.props.onChange(this.props.type, list, selected);
  }

  handleClose(index) {
    const { list } = this.state;
    list.splice(index, 1);

    this.props.onChange(this.props.type, list, 0);
  }

  handleAddTag() {
    const { list } = this.state;
    list.push({
      title: '',
      content: '',
    });

    this.props.onChange(this.props.type, list, list.length - 1);
  }

  handleTagClick(index) {
    const { list } = this.state;
    this.props.onChange(this.props.type, list, index);
  }

  formatCode() {
    const { list, selected } = this.state;
    list[selected].content = beautify(list[selected].content, { indent_size: 2 });
    this.setState({
      list,
    });
  }

  handleDoubleClick(index) {
    const { list } = this.state;
    this.setState({
      showModal: true,
      tagTitle: list[index].title,
      tagIndex: index,
    });
  }

  handleTitleChange(e) {
    this.setState({
      tagTitle: e.target.value,
    });
  }

  handleOk() {
    const { list, tagIndex, tagTitle } = this.state;
    list[tagIndex].title = tagTitle;
    this.props.onChange(this.props.type, list, tagIndex);
    this.setState({
      showModal: false,
    });
  }

  parseQueryContent(str) {
    return str.split('\n').map(kv => {
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
        key: k.trim(),
        value: v.trim().replace(/^\'|\'$/g, ''),
      };
    });
  }

  render() {
    const { list, selected, showModal, tagTitle } = this.state;
    const { mode } = this.props;

    const BulkEditorEnvs = [{
      field: 'key',
      placeholder: 'key',
      width: '40%',
    }, {
      field: 'value',
      placeholder: 'value',
      width: '60%',
    }];

    const codemirrorValue = list && list[selected] ? list[selected].content : '';
    return (
      <div className="editor">
        <div className="category">
          <div className="taglist">
            {list && list.map((tag, index) =>
              <Tooltip title="双击可修改场景名称" key={index} mouseEnterDelay={0.6}>
                <Tag
                  className={selected === index ? 'active' : ''}
                  closable
                  onClick={() => { this.handleTagClick(index); }}
                  onClose={e => { e.preventDefault(); e.stopPropagation(); this.handleClose(index); }}
                  onDoubleClick={() => { this.handleDoubleClick(index); }}
                >
                  {tag.title || '场景'}
                </Tag>
              </Tooltip>
            )}
            <Tag onClick={this.handleAddTag} className="new-tag">+ 新增</Tag>
          </div>
          {
            mode !== 'bulk' && (
              <div className="top-action">
                <div className="format-code" onClick={this.formatCode.bind(this)}>
                  格式化
                </div>
                <CopyToClipboard text={list && list[selected] ? list[selected].content : ''} onCopy={() => message.success('复制成功')}>
                  <div className="copy-code">
                    复制
                  </div>
                </CopyToClipboard>
              </div>
            )
          }
        </div>
        {
          mode === 'bulk' ? (
            <BulkEditor
              configs={BulkEditorEnvs}
              value={this.parseQueryContent(list && list[selected] ? list[selected].content : '')}
              onChange={ list => { this.handleListChange(selected, list); } }
            />
          ) : (
            <div className="edit-content">
              {
                list[selected] &&
                <CodeMirror
                  value={codemirrorValue}
                  options={CodeMirrorConfig}
                  editorDidMount={ editor => { this.instance = editor; }}
                  onBeforeChange={(editor, data, value) => {
                    this.setState({ jsonStr: value });
                  }}
                  onBeforeChange={(editor, data, value) => {
                    this.handleInputChange(selected, value);
                  }}
                  // onChange={(editor, data, value) => {
                  //   this.handleInputChange(selected, value);
                  // }}
                />
              }
            </div>
          )
        }

        <Modal
          title="修改场景名称"
          visible={showModal}
          onOk={this.handleOk}
          onCancel={() => { this.setState({ showModal: false }); }}
          width={400}
        >
          <Input placeholder="请输入场景名称" value={tagTitle} onChange={this.handleTitleChange} />
        </Modal>
      </div>
    );
  }
}
