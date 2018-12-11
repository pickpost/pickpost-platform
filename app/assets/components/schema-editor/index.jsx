import React from 'react';
import autobind from 'autobind-decorator';
import set from 'lodash/set';
import { Modal, Icon, Tooltip } from 'antd';
import { Controlled as CodeMirror } from 'react-codemirror2';
import json2schema from '../../utils/json2schema';
import schema2json from '../../utils/schema2json';
import JSON5 from 'json5';
import stringToPath from '../../utils/stringToPath';
import BulkEditor from '../bulk-editor';

import './style.less';

// CodeMirror packages
require('codemirror/mode/javascript/javascript');
require('codemirror/lib/codemirror.css');
require('codemirror/theme/material.css');
require('codemirror/addon/edit/matchbrackets');
require('codemirror/addon/selection/active-line');
require('codemirror/addon/lint/lint');
require('codemirror/addon/lint/javascript-lint');
require('../../utils/codemirror-json-lint');
require('codemirror/addon/lint/lint.css');

const CodeMirrorConfig = {
  // mode: 'application/json',
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

const BulkEditorAccounts = [{
  field: 'value',
  placeholder: '值',
  width: '',
}, {
  field: 'remark',
  placeholder: '备注',
  width: '',
}];

const MinRows = 3;

function setSchemaData(schema, path, key, value2) {
  const pathArr = stringToPath(path);
  const newPath = [];
  pathArr.forEach((i, idx) => {
    if (idx === 0) return;

    if (/^\d+$/.test(i)) { // 如果是纯数字路径，说明是数组
      newPath.push('items');
    } else {
      newPath.push('properties');
      newPath.push(i);
    }
  });
  newPath.push(key);

  set(schema, newPath, value2);
}

function execute(fn) {
  const Fn = Function;
  return new Fn('return ' + fn)();
}

@autobind
class SchemaEditor extends React.Component {
  constructor(props) {
    super(props);
    this.instance = null;
    const json = schema2json(props.value);
    const rows = (JSON.stringify(json, null, '\t') || '').split('\n').length;
    const defaultJsonStr = '{\n\t\n}'; // 默认三行
    this.state = {
      jsonStr: JSON.stringify(json, null, '\t') || defaultJsonStr,
      schema: props.value,
      path: '',
      list: [{}],
      enumsMap: {},
      enumsModal: false,
      jsonErrorMessage: '',
      leftRowCount: rows,
      hightLightLine: 0,
    };
    this.pathMap = this.generatePathMap(props.value, 'root', {});
  }

  pathMap = {}

  // 左侧JSON改变时，只同步整个 Schema 结构，不同步额外信息。
  handleJSONChange = value => {
    const rows = value.split('\n').length;
    this.setState({
      jsonStr: value,
      leftRowCount: rows,
    });
    if (this.props && this.props.onChange) {
      try {
        const json = JSON5.parse(value);
        const newSchema = json2schema(json, this.pathMap, 'root');
        this.setState({
          schema: newSchema,
          jsonErrorMessage: '',
        });
        this.props.onChange(newSchema);
      } catch (e) {
        // JSON 解析失败时不更新schema
        this.setState({
          jsonErrorMessage: e.message,
        });
      }
    }
  }

  formatJSON() {
    const { jsonStr } = this.state;

    try {
      // 将 JS Object 字符串转换为JSON
      this.setState({
        jsonStr: JSON.stringify(execute(jsonStr), null, '\t'),
      });
    } catch (err) {
      console.log('JSON 格式解析失败:', err);
    }
  }

  hasChildren(prop) {
    return prop.properties || prop.items;
  }

  // 递归遍历整个schema，去匹配pathMap，更新属性。
  sycnField = (schema, pathMap) => {
    if (pathMap[schema.path]) {
      schema = { ...schema, ...pathMap[schema.path] };
    }

    if (schema.type === 'object') {
      Object.keys(schema.properties).forEach(key => {
        schema.properties[key] = this.sycnField(schema.properties[key], pathMap);
      });
    } else if (schema.type === 'array') {
      schema.items.forEach((item, idx) => {
        schema.items[idx] = this.sycnField(item, pathMap);
      });
    }

    return schema;
  }

  generatePathMap(schema, parentsPath, pathMap) {
    const newParentsPath = parentsPath || 'root';
    let innerPathMap = pathMap || {};

    innerPathMap[newParentsPath] = {
      required: schema.required,
      title: schema.title,
      remark: schema.remark,
      enum: schema.enum,
    };

    if (schema.items) {
      innerPathMap = { ...innerPathMap, ...this.generatePathMap(schema.items, newParentsPath + '[0]') };
    } else if (schema.properties) {
      for (const prop in schema.properties) {
        innerPathMap = { ...innerPathMap, ...this.generatePathMap(schema.properties[prop], newParentsPath + '.' + prop) };
      }
    }

    return innerPathMap;
  }

  showEnumsModal = () => {
    this.setState({
      enumsModal: true,
    });
  }

  handleBulkEditorChange = list => {
    this.setState({
      list,
    });
  }

  renderTable(rows, properties, str) {
    for (const prop in properties) {
      const path = str + '.' + prop + '';

      // 如果没有remark，则不会更新当前行的备注信息
      if (!properties[prop].remark) {
        properties[prop].remark = '';
      }

      rows.push({
        prop,
        path,
        ...properties[prop],
      });
      if (properties[prop].properties) {
        this.renderTable(rows, properties[prop].properties, path + '[0]');
      }

      if (properties[prop].items) {
        if (properties[prop].items.type === 'object') {
          rows.push({ });
        }
        this.renderTable(rows, properties[prop].items.properties, path + '[0]');
        if (properties[prop].items.type === 'object') {
          rows.push({ });
        }
      }

      // 如果是对象，尾要加占位
      if (properties[prop].type === 'object') {
        rows.push({ });
      }

      if (properties[prop].type === 'array') {
        rows.push({ });
      }
    }
  }

  handleRemarkChange(item, e) { // 备注的修改
    const { schema } = this.state;
    const value = e.target.value;
    setSchemaData(schema, item.path, 'remark', value);
    // 同步 pathMap
    this.pathMap[item.path] = this.pathMap[item.path] ? { ...this.pathMap[item.path], remark: value } : { remark: value };
    this.setState({
      schema,
    });
    this.props.onChange(schema);
  }

  handleSaveEnums = () => {
    const { path, list, schema } = this.state;
    setSchemaData(schema, path, 'enum', list);
    // 同步 pathMap
    this.pathMap[path] = this.pathMap[path] ? { ...this.pathMap[path], enum: list } : { enum: list };
    this.setState({
      enumsModal: false,
      schema,
    });
    this.props.onChange(schema);
  }

  enumFx(path, enums) { // 枚举的添加
    this.setState({
      list: enums,
      path,
      enumsModal: true,
    });
  }

  fullFillRow(rows, maxCount) {
    while (rows.length < maxCount) {
      rows.push({});
    }
  }

  syncHighlightLine = (editor, data) => {
    const { line } = data;
    this.setState({
      hightLightLine: line,
    });
  }

  handleSyncTableHightlight = e => {
    const { line } = e.target.dataset;
    this.instance.setCursor({
      line: +line,
    });
  }

  render() {
    const { jsonStr, schema, enumsModal, leftRowCount, hightLightLine } = this.state;
    const rows = [];
    this.renderTable(rows, schema.properties, 'data');
    const leftShowRows = Math.max(leftRowCount, MinRows);
    this.fullFillRow(rows, leftShowRows - 2);

    return (
      <div className="schema-editor">
        <div className="table-view">
          <table>
            <thead>
              <tr>
                <th width="50%">
                  JSON
                  <span className="fast-help">如何快速录入？</span>
                  <span className="format-action" onClick={this.formatJSON}> 格式化 </span>
                </th>
                <th width="8%" style={{ textAlign: 'center' }}>Key</th>
                <th width="25%" style={{ textAlign: 'center' }}>值规则</th>
                <th width="20%" style={{ textAlign: 'center' }}>备注</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="jsontd" rowSpan={100}>
                  <div className="json-view" ref="inputWrapper">
                    <CodeMirror
                      value={jsonStr}
                      options={CodeMirrorConfig}
                      editorDidMount={ editor => { this.instance = editor; }}
                      onBeforeChange={(editor, data, value) => {
                        this.setState({ jsonStr: value });
                      }}
                      onChange={(editor, data, value) => {
                        this.handleJSONChange(value);
                      }}
                      onCursor={this.syncHighlightLine}
                    />
                  </div>
                </td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              {
                rows.map((item, idx) => (
                  <tr key={idx} className={hightLightLine === idx + 1 ? 'highlight-line' : ''}>
                    {
                      item.prop ? <td className="key-style">{item.prop}</td> : <td></td>
                    }
                    {
                      item.type === 'string' || item.type === 'number' || item.type === 'boolean' ?
                      <td className="enum">
                        {
                          <div className="enum-select">
                            <Tooltip title={<div>{(item.enum || []).map(attr => <div key={attr.value}>{`${attr.value} ${attr.remark ? ': ' + attr.remark : ''}`}</div>)}</div>}>
                              {
                                (item.enum || []).map((attr, i) => <span className="enum-value" key={i}><b>{attr.value} </b> {attr.remark ? `(${attr.remark})` : ''}</span>)
                              }
                            </Tooltip>
                            <span className="edit-icon" onClick={() => { this.enumFx(item.path, item.enum); }}>
                              <Icon type="edit" />
                            </span>
                          </div>
                        }
                      </td> :
                      <td></td>
                    }
                    {
                      item.type ? <td>
                        <input className="re-input" type="text" value={item.remark} data-line={idx + 1} onFocus={this.handleSyncTableHightlight} onChange={e => { this.handleRemarkChange(item, e); }} />
                      </td> : <td></td>
                    }
                  </tr>
                ))
              }
              <tr>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
        <Modal
          title="枚举设置"
          visible={enumsModal}
          onOk={this.handleSaveEnums}
          onCancel={() => { this.setState({ enumsModal: false }); }}
        >
          <BulkEditor configs={BulkEditorAccounts} value={this.state.list} onChange={this.handleBulkEditorChange} />
        </Modal>
      </div>
    );
  }
}

export default SchemaEditor;
