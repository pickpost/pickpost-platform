import React from 'react';
import { connect } from 'dva';
import { Form, Button, Input, Radio } from 'antd';
import key from 'keymaster';
import { createForm, createFormField } from 'rc-form';

import Info from '../../components/info';
import SchemaEditor from '../../components/schema-editor';
import './index.less';

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
        api: {
          ...values,
        },
      });
    });
  }

  handleSwitch = (e) => {
    const { dispatch } = this.props;
    const value = e.target.value;

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
    const {
      _id, name, desc, url, apiType, autoSwitch,
      requestSchema = {}, responseSchema = {},
      requestAutoSchema = {}, responseAutoSchema = {},
    } = apiDocModel;
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
                文档更新太麻烦?  推荐接入 PickPost 智能文档同步!
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
            { autoSwitch && (
              <div className="auto-switch">
                <Radio.Group
                  value={autoSwitch}
                  buttonStyle="solid"
                  size="small"
                  onChange={this.handleSwitch}
                >
                  <Radio.Button value="auto">智能文档</Radio.Button>
                  <Radio.Button value="manual">手动文档</Radio.Button>
                </Radio.Group>
              </div>
            )}
            {
              autoSwitch === 'auto' ? (
                <div>
                  <FormItem
                    label="请求参数：(智能文档不允许手动修改，请到代码中修改并自动同步)"
                    {...formItemLayoutFull}
                  >
                    <SchemaEditor key={'A'} disabled={true} value={requestAutoSchema} />
                  </FormItem>
                  <FormItem
                    label="返回数据：(智能文档不允许手动修改，请到代码中修改并自动同步)"
                    {...formItemLayoutFull}
                  >
                    <SchemaEditor key={'B'} disabled={true} value={responseAutoSchema} />
                  </FormItem>
                </div>
              ) : (
                <div>
                  <FormItem
                    label="请求参数："
                    {...formItemLayoutFull}
                    help={getFieldError('desc')}
                  >
                    {getFieldDecorator('requestSchema', {
                      initialValue: requestSchema,
                    })(
                      <SchemaEditor key={'C'} />
                    )}
                  </FormItem>
                  <FormItem
                    label="返回数据："
                    {...formItemLayoutFull}
                    help={getFieldError('desc')}
                  >
                    {getFieldDecorator('responseSchema', {
                      initialValue: responseSchema,
                    })(
                      <SchemaEditor key={'D'} />
                    )}
                  </FormItem>
                </div>
              )
            }
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
})(createForm({
  mapPropsToFields({ apiDocModel }) {
    return {
      requestSchema: createFormField(apiDocModel.requestSchema),
      requestAutoSchema: createFormField(apiDocModel.requestAutoSchema),
      responseSchema: createFormField(apiDocModel.responseSchema),
      responseAutoSchema: createFormField(apiDocModel.responseAutoSchema),
    };
  },
  onFieldsChange(props, fields) {
    props.dispatch({
      type: 'apiDocModel/updateFields',
      data: fields,
    });
  },
})(Api));
