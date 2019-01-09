import React from 'react';
import { connect } from 'dva';
import { Form, Button, Input, Radio } from 'antd';
import moment from 'moment';
import key from 'keymaster';

import Info from '../../components/info';
import SchemaEditor from '../../components/schema-editor';
import './index.less';

const createForm = Form.create;
const FormItem = Form.Item;

class Api extends React.PureComponent {
  componentDidMount() {
    const { dispatch, params: { collectionId, apiId } } = this.props;
    dispatch({
      type: 'apiDocModel/detail',
      collectionId,
      apiId,
      form: this.props.form,
    });

    // 重写 filter
    key.filter = function filter() {
      return true;
    };

    key('⌘+s, ctrl+s', e => {
      e.preventDefault();
      this.handleSave();
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.params.apiId !== nextProps.params.apiId && nextProps.params.apiId) {
      this.props.dispatch({
        type: 'apiDocModel/detail',
        apiId: nextProps.params.apiId,
        form: nextProps.form,
      });
    }
  }

  componentWillUnmount() {
    key.unbind('⌘+s, ctrl+s');
  }

  handleSave = () => {
    this.props.form.validateFields((err, values) => {
      this.props.dispatch({
        type: 'collectionApisModel/saveAPI',
        api: values,
      });
    });
  }

  generateInitial = (param) => {
    const { updatedAt, swaggerSyncAt, requestSchema,
      requestAutoSchema, responseSchema, responseAutoSchema } = this.props.apiDocModel;
    if (param === 'requestSchema') {
      if (swaggerSyncAt && moment(updatedAt).isBefore(swaggerSyncAt)) {
        return requestAutoSchema;
      }
      return requestSchema;
    }
    if (param === 'responseSchema') {
      if (swaggerSyncAt && moment(updatedAt).isBefore(swaggerSyncAt)) {
        return responseAutoSchema;
      }
      return responseSchema;
    }
  }

  handleSwitch = (e) => {
    const { form, apiDocModel, dispatch } = this.props;
    const { setFieldsValue } = form;
    const { requestSchema, responseSchema, requestAutoSchema, responseAutoSchema } = apiDocModel;
    const value = e.target.value;

    if (value === 'auto') {
      setFieldsValue({
        requestSchema: requestAutoSchema,
        responseSchema: responseAutoSchema,
      });
    } else {
      setFieldsValue({
        requestSchema,
        responseSchema,
      });
    }

    dispatch({
      type: 'apiDocModel/setData',
      data: {
        autoSwitch: value,
      },
    });
  }

  render() {
    window._t_ = this;
    const { apiDocModel, params: { apiId } } = this.props;
    const { _id, name, desc, url, apiType, autoSwitch } = apiDocModel;
    const { getFieldDecorator, getFieldError } = this.props.form;
    const formItemLayoutFull = null;

    if (!_id) {
      return <div></div>;
    }

    return (
      <div className="api-doc-page">
        <div className="c-header">
          <Info title={name} desc={desc} url={url} apiType={apiType}>
            <div className="btn-wrap">
              <Button size="default" className="new-btn" type="primary" icon="save" onClick={this.handleSave}>保存</Button>
              <a className="smart-doc-attract" target="_blank" href="https://yuque.antfin-inc.com/pickpost/helper/eyk7yb#rztlkg">
                文档更新太麻烦?  推荐接入PickPost智能文档同步!
              </a>
            </div>
          </Info>
        </div>
        <div className="api-content">
          <Form layout="vertical">
            {getFieldDecorator('_id', {
              initialValue: apiId,
            })(
              <Input type="hidden" />
            )}
            {autoSwitch && <div className="auto-switch">
              <Radio.Group
                value={autoSwitch}
                buttonStyle="solid"
                size="small"
                onChange={this.handleSwitch}
              >
                <Radio.Button value="auto">智能文档</Radio.Button>
                <Radio.Button value="manual">手动文档</Radio.Button>
              </Radio.Group>
            </div>}
            <FormItem
              label="请求参数："
              {...formItemLayoutFull}
              help={getFieldError('desc')}
            >
              {getFieldDecorator('requestSchema', {
                initialValue: this.generateInitial('requestSchema'),
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
                initialValue: this.generateInitial('responseSchema'),
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

export default connect(({ apiDocModel }) => {
  return {
    apiDocModel,
  };
})(createForm()(Api));
