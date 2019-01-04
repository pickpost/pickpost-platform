import React from 'react';
import { connect } from 'dva';
import { Form, Button, Input } from 'antd';
import key from 'keymaster';

import Info from '../../components/info';
import SchemaEditor from '../../components/schema-editor';

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

  render() {
    const { apiDocModel, params: { apiId } } = this.props;
    const { _id, name, desc, url, apiType, requestSchema, responseSchema } = apiDocModel;
    const { getFieldDecorator, getFieldError } = this.props.form;
    const formItemLayoutFull = null;

    if (!_id) {
      return <div></div>;
    }

    return (
      <div>
        <div className="c-header">
          <Info title={name} desc={desc} url={url} apiType={apiType}>
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
                initialValue: requestSchema || {},
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
                initialValue: responseSchema || {},
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
