import React from 'react';
import autobind from 'autobind-decorator';
import set from 'lodash/set';
import debounce from 'lodash/debounce';
import JSON5 from 'json5';
import JSONAST from 'json5-to-ast';
import { Modal, Icon, Tooltip } from 'antd';
import BulkEditor from '../bulk-editor';
import json2schema from '../../utils/json2schema';
import schema2json from '../../utils/schema2json';
import stringToPath from '../../utils/stringToPath';

import './style.less';

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

const CodeMirrorConfig = {
  mode: { name: 'javascript', json: true },
  theme: 'material',
  height: 'auto',
  // viewportMargin: Infinity, // 慎开，性能堪忧。
  tabSize: 2,
  lineNumbers: true,
  lint: true,
  gutters: [ 'CodeMirror-linenumbers', 'CodeMirror-lint-markers' ],
  smartIndent: true,
  matchBrackets: true,
  styleActiveLine: true,
  readOnly: false,
};

const BulkEditorEnums = [{
  field: 'value',
  placeholder: '值',
  width: '',
}, {
  field: 'description',
  placeholder: '备注',
  width: '',
}];

// 更新 schema 指定 node
function setSchemaData(schema, path, key, value2) {
  // stringToPath 对 数组路径 [0] 解析有问题，所以将数据转化为 .0.
  const pathArr = stringToPath(path.replace(/\[/g, '.').replace(/\]/, ''));
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

function astToList(ast, result, parentsPath) {
  const newParentsPath = parentsPath || 'root';
  if (ast.type === 'Object' && ast.children) {
    ast.children.forEach(item => {
      astToList(item, result, newParentsPath);
    });
  } else if (ast.type === 'Array' && ast.children) {
    ast.children.forEach((item, index) => {
      astToList(item, result, newParentsPath + '[' + index + ']');
    });
  } else if (ast.type === 'Property') {
    if (!result[ast.loc.start.line - 1]) {
      result[ast.loc.start.line - 1] = {
        prop: ast.key.value,
        path: newParentsPath + '.' + ast.key.value,
      };
    }

    if (ast.value) {
      astToList(ast.value, result, newParentsPath + '.' + ast.key.value);
    }
  }
}

function jsonToRows(jsonStr, pathMap) {
  let result = Array(jsonStr.split('\n').length).fill('');
  const exampleAst = JSONAST(jsonStr, {
    loc: true,
  });

  console.log('exampleAst', exampleAst);

  astToList(exampleAst, result);
  result.shift();

  result = result.map(item => {
    const matchItem = pathMap[item.path] || {};
    return {
      ...item,
      description: matchItem.description,
      enum: matchItem.enum,
      type: matchItem.type,
    };
  });
  return result;
}

function updateRowsDetail(rows, pathMap) {
  return rows.map(item => {
    const matchItem = pathMap[item.path] || {};
    return {
      ...item,
      description: matchItem.description,
      enum: matchItem.enum,
      type: matchItem.type,
    };
  });
}

@autobind
class SchemaEditor extends React.Component {
  constructor(props) {
    super(props);
    this.instance = null;
    const json = schema2json(props.value);
    // const rows = (JSON.stringify(json, null, '\t') || '').split('\n').length;
    const defaultJsonStr = '{\n\t\n}'; // 默认三行
    const jsonStr = json ? JSON.stringify(json, null, '\t') : defaultJsonStr;
    this.pathMap = this.generatePathMap(props.value, 'root', {});
    this.state = {
      jsonStr,
      schema: props.value,
      path: '',
      list: [{}],
      enumsMap: {},
      enumsModal: false,
      jsonErrorMessage: '',
      hightLightLine: 0,
      rows: jsonToRows(jsonStr, this.pathMap),
    };
  }

  pathMap = {}

  // 左侧JSON改变时，只同步整个 Schema 结构，不同步额外信息。
  handleJSONChange = debounce(value => {
    if (this.props && this.props.onChange) {
      try {
        const json = JSON5.parse(value);
        const newSchema = json2schema(json, this.pathMap, 'root');
        // 更新右侧 rows
        const rows = jsonToRows(value, this.pathMap);
        this.setState({
          schema: newSchema,
          rows,
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
  }, 300)

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
    if (!schema) return {};

    const newParentsPath = parentsPath || 'root';
    let innerPathMap = pathMap || {};

    innerPathMap[newParentsPath] = {
      required: schema.required,
      title: schema.title,
      description: schema.description,
      enum: schema.enum,
      type: schema.type,
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

  handleBulkEditorChange = list => {
    this.setState({
      list,
    });
  }

  handleRemarkChange(item, e) { // 备注的修改
    const { schema, rows} = this.state;
    const value = e.target.value;
    setSchemaData(schema, item.path, 'description', value);
    // 同步 pathMap
    this.pathMap[item.path] = this.pathMap[item.path] ? { ...this.pathMap[item.path], description: value } : { description: value };
    this.setState({
      schema,
      rows: updateRowsDetail(rows, this.pathMap),
    });
    this.props.onChange(schema);
  }

  handleSaveEnums = () => {
    const { path, list, schema, rows } = this.state;
    setSchemaData(schema, path, 'enum', list);
    // 同步 pathMap
    this.pathMap[path] = this.pathMap[path] ? { ...this.pathMap[path], enum: list } : { enum: list };
    this.setState({
      enumsModal: false,
      schema,
      rows: updateRowsDetail(rows, this.pathMap),
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
    const { jsonStr, enumsModal, hightLightLine, rows } = this.state;
    const { disabled } = this.props;
    CodeMirrorConfig.readOnly = !!disabled;

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
                <th width="20%" style={{ textAlign: 'center' }}>说明</th>
                <th width="22%" style={{ textAlign: 'center' }}>枚举</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="jsontd" rowSpan={10000}>
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
                      item.type ? (
                        <td>
                          <input className="re-input" disabled={disabled} type="text"
                            value={item.description} data-line={idx + 1} onFocus={this.handleSyncTableHightlight}
                            onChange={e => { this.handleRemarkChange(item, e); }} />
                        </td>
                      ) : (
                        <td className="disabled-td"></td>
                      )
                    }
                    {
                      item.type === 'string' || item.type === 'number' || item.type === 'boolean' ? (
                        <td className="enum">
                          {
                            item.enum && item.enum.length > 0 && (
                              <Tooltip title={<div>{(item.enum || []).map(attr => <div key={attr.value}>{`${attr.value} ${attr.description ? ': ' + attr.description : ''}`}</div>)}</div>}>
                                <div className="enum-select">
                                  {
                                    (item.enum || []).map((attr, i) => <span className="enum-value" key={i}><b>{attr.value} </b> {attr.description ? `(${attr.description})` : ''}</span>)
                                  }
                                </div>
                              </Tooltip>
                            )
                          }
                          {
                            !disabled && (
                              <span className="edit-icon" onClick={() => { this.enumFx(item.path, item.enum); }}>
                                <Icon type="edit" />
                              </span>
                            )
                          }
                        </td>
                      ) : (
                        <td></td>
                      )
                    }
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
        <Modal
          title="枚举设置"
          visible={enumsModal}
          onOk={this.handleSaveEnums}
          onCancel={() => { this.setState({ enumsModal: false }); }}
        >
          <BulkEditor configs={BulkEditorEnums} value={this.state.list} onChange={this.handleBulkEditorChange} />
        </Modal>
      </div>
    );
  }
}

export default SchemaEditor;
