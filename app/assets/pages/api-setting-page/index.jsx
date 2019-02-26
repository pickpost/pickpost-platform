import React from 'react';
import { Form, Select, Input, Button, Radio, Checkbox } from 'antd';
import autobind from 'autobind-decorator';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { ApiTypes } from '../../../common/constants';

import './style.less';

const createForm = Form.create;
const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;
const CheckboxGroup = Checkbox.Group;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

@autobind
class Index extends React.PureComponent {
  componentDidMount() {
    this.props.dispatch({
      type: 'apiSettingModel/fetchProjectList',
    });

    const { params: { collectionId, projectId, apiId } } = this.props;
    if (apiId) {
      this.props.dispatch({
        type: 'apiSettingModel/detail',
        apiId,
        collectionId,
        projectId,
      });
    } else {
      this.props.dispatch({
        type: 'apiSettingModel/reset',
      });
    }
  }

  handleSaveAPI() {
    this.props.form.validateFields((err, values) => {
      if (values.url) {
        // 新建API
        this.props.dispatch({
          type: 'apiSettingModel/saveAPI',
          api: values,
        });
      }
    });
  }

  validateUrl = (rule, value, callback) => {
    const { editingAPI } = this.props.apiSettingModel;
    const { getFieldValue } = this.props.form;

    // 如果是修改接口，判断 method 和 url 是否变更，如果没有变更，则不进入重复校验
    if (editingAPI._id && getFieldValue('apiType') === editingAPI.apiType && editingAPI.url === value) {
      callback();
      return;
    }

    callback();
  }

  render() {
    const { apiSettingModel, params: { collectionId, projectId }, location: { query } } = this.props;
    const { editingAPI, projectList } = apiSettingModel;

    const formItemLayout = {
      labelCol: { span: 24 },
      wrapperCol: { span: 24 },
    };

    const { getFieldValue, getFieldDecorator, getFieldError } = this.props.form;
    const apiType = getFieldValue('apiType') || editingAPI.apiType;
    const matchApiType = ApiTypes.find(item => item.type === apiType) || {};
    const methodOptions = (matchApiType.methods || []).map(item => ({
      label: item,
      value: item,
    }));

    return (
      <div className="api-setting-new">
        <div className="form-content">
          <Form layout="vertical" hideRequiredMark={true}>
            {getFieldDecorator('collectionId', {
              initialValue: collectionId,
            })(
              <Input type="hidden" />
            )}

            {getFieldDecorator('_id', {
              initialValue: editingAPI._id,
            })(
              <Input type="hidden" />
            )}
            <FormItem
              label={<span>
                所属应用 <Link className="help-tips" to="/projects/new" query={{ space: query.space }}>没有找到应用，去新建一个</Link>
              </span>}
              {...formItemLayout}
              help={getFieldError('projectId')}
            >
              {getFieldDecorator('projectId', {
                initialValue: editingAPI.projectId || projectId,
                rules: [{ required: true, message: '请选择所属系统' }],
              })(
                <Select
                  showSearch
                  optionFilterProp="children"
                >
                  {
                    projectList.map(p => (<Option value={p._id} key={p._id}>{p.name}{p.desc ? `（${p.desc}）` : ''}</Option>))
                  }
                </Select>
              )}
            </FormItem>
            <FormItem
              label="接口类型"
              {...formItemLayout}
              help={getFieldError('apiType')}
            >
              {getFieldDecorator('apiType', {
                initialValue: apiType,
                rules: [{ required: true, message: '请选择接口类型' }],
              })(
                <RadioGroup>
                  {
                    ApiTypes.map(item => <RadioButton key={item.type} value={item.type}>{item.name}</RadioButton>)
                  }
                </RadioGroup>
              )}
            </FormItem>
            {
              getFieldValue('apiType') === 'HTTP' && (
                <FormItem
                  label="Allow Methods"
                  {...formItemLayout}
                  help={getFieldError('methods')}
                >
                  {getFieldDecorator('methods', {
                    initialValue: editingAPI.methods,
                    rules: [{ required: true, message: '请选择Allow Methods' }],
                  })(
                    <CheckboxGroup options={methodOptions} />
                  )}
                </FormItem>
              )
            }
            <FormItem
              label={matchApiType.uniqueName}
              {...formItemLayout}
              help={getFieldError('url')}
            >
              {getFieldDecorator('url', {
                initialValue: editingAPI.url,
                rules: [
                  { required: true, message: `${matchApiType.uniqueName}不能为空` },
                  { validator: this.validateUrl },
                ],
              })(
                <Input placeholder={matchApiType.placeholder} />
              )}
            </FormItem>
            <FormItem
              label="接口名称"
              {...formItemLayout}
              help={getFieldError('name')}
            >
              {getFieldDecorator('name', {
                initialValue: editingAPI.name,
                rules: [{ required: true, message: '接口名称不能为空' }],
              })(
                <Input placeholder="请输入接口名称" />
              )}
            </FormItem>
            <FormItem
              label="接口描述"
              {...formItemLayout}
              help={getFieldError('desc')}
            >
              {getFieldDecorator('desc', {
                initialValue: editingAPI.desc,
              })(
                <TextArea rows={2} placeholder="请输入接口描述" />
              )}
            </FormItem>

            <div>
              <Button className="submit" type="primary" size="default" htmlType="submit" onClick={this.handleSaveAPI}>
                提交
              </Button>
            </div>
          </Form>
        </div>
      </div>
    );
  }
}

export default connect(({ apiSettingModel }) => {
  return {
    apiSettingModel,
  };
})(createForm()(Index));
