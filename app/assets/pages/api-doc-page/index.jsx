import React from 'react';
import { connect } from 'dva';
import { Form, Button, Input } from 'antd';

import Info from '../../components/Info';
import SchemaEditor from '../../components/SchemaEditor';

const createForm = Form.create;
const FormItem = Form.Item;

import './index.less';

class Api extends React.PureComponent {
  handleSave = () => {
    this.props.form.validateFields((err, values) => {
      // 新建API
      this.props.dispatch({
        type: 'apiDocModel/saveAPI',
        api: values,
      });
    });
  }

  getTypeByMethods(methods) {
    if (!Array.isArray(methods)) {
      return 'HTTP';
    }

    if (methods.indexOf('RPC') >= 0) {
      return 'RPC';
    } else if (methods.indexOf('SPI') >= 0) {
      return 'SPI';
    }
    return 'HTTP';
  }

  getBelongQuery() {
    const { belong } = this.props.location.query;
    return belong || '';
  }

  getBelong() {
    let { belong } = this.props.location.query;
    const { currentAPI: { projectId } } = this.props.apiPageModel;
    belong = belong || `project_${projectId}`;
    return belong;
  }

  getUplevel() {
    return '/' + this.getBelong().replace('_', '/') + '?tab=api';
  }

  render() {
    const { apiPageModel } = this.props;
    const { params: { apiId } } = this.props;
    const { currentAPI } = apiPageModel;
    if (!currentAPI._id) {
      return null;
    }

    const { getFieldDecorator, getFieldError } = this.props.form;
    const formItemLayoutFull = null;

    return (
      <div>
        <div className="c-header">
          <Info
            title={currentAPI.name}
            desc={currentAPI.desc}
            url={currentAPI.url}
            apiType={currentAPI.apiType}
          >
            <Button size="default" className="new-btn" type="primary" icon="save" onClick={this.handleSave}>保存</Button>
          </Info>
        </div>
        <div className="api-content">
          <Form layout="vertical">
            {getFieldDecorator('_id', {
              initialValue: apiId,
            })(
              <Input type="hidden" />
            )}
            <FormItem
              label="请求参数："
              {...formItemLayoutFull}
              help={getFieldError('desc')}
            >
              {getFieldDecorator('requestSchema', {
                initialValue: currentAPI.requestSchema || {},
              })(
                <SchemaEditor />
              )}
            </FormItem>
            <FormItem
              label="返回数据："
              {...formItemLayoutFull}
              help={getFieldError('desc')}
            >
              {getFieldDecorator('responseSchema', {
                initialValue: currentAPI.responseSchema || {},
              })(
                <SchemaEditor />
              )}
            </FormItem>
          </Form>
        </div>
      </div>
    );
  }
}

export default connect(({ apiDocModel, collectionModel, apiPageModel }) => {
  return {
    apiPageModel,
    apiDocModel,
    collectionModel,
  };
})(createForm()(Api));
