import React from 'react';
import { Form, Select, Input, Button, Radio, Checkbox } from 'antd';
import autobind from 'autobind-decorator';
import { connect } from 'dva';
import { Link } from 'dva/router';
import Layout from '../../layout/default.jsx';

import './index.less';

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
      type: 'apiEditModel/fetchProjectList',
    });

    const { params: { collectionId, apiId } } = this.props;
    if (apiId) {
      this.props.dispatch({
        type: 'apiEditModel/detail',
        apiId,
        collectionId,
      });
    } else {
      this.props.dispatch({
        type: 'apiEditModel/reset',
      });
    }
  }

  handleSaveAPI() {
    this.props.form.validateFields((err, values) => {
      if (values.url) {
        if (values.apiType === 'HTTP') {
          values.methods = values.apiSubType;
        } else {
          values.methods = [ values.apiType ];
        }

        // 新建API
        this.props.dispatch({
          type: 'apiEditModel/saveAPI',
          api: values,
        });
      }
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

  // Todo: 添加完一个接口，立即又添加一个相同的接口，校验不到。
  // RPC 和 SPI 接口存放的项目地址需要探讨一下，在A应用里有a接口，然后在B应用里新建a接口，会提示接口已存在，这是因为RPC和SPI接口匹配规则忽略所在应用。
  validateUrl = (rule, value, callback) => {
    const { editingAPI } = this.props.apiEditModel;
    const { getFieldValue } = this.props.form;

    // 如果是修改接口，判断 method 和 url 是否变更，如果没有变更，则不进入重复校验
    if (editingAPI._id && getFieldValue('apiType') === this.getTypeByMethods(editingAPI.methods) && editingAPI.url === value) {
      callback();
      return;
    }

    callback();
  }

  render() {
    const { apiEditModel, params: { collectionId, projectId, apiId } } = this.props;
    const { editingAPI, projectList } = apiEditModel;

    const formItemLayout = {
      labelCol: { span: 24 },
      wrapperCol: { span: 24 },
    };

    const { getFieldValue, getFieldDecorator, getFieldError } = this.props.form;
    const apiType = editingAPI.apiType || this.getTypeByMethods(editingAPI.methods);
    const methodOptions = [
      { label: 'GET', value: 'GET' },
      { label: 'POST', value: 'POST' },
      { label: 'PUT', value: 'PUT' },
      { label: 'DELETE', value: 'DELETE' },
    ];
    const ruleTypeMap = {
      HTTP: {
        label: '路径规则',
        placeholder: '请输入接口规则，例如：/shop/detail.json',
      },
    };

    const titleText = apiId ? '编辑接口' : '新建接口';

    return (
      <Layout title={titleText}>
        <main className="single-page">
          <div className="collection-new">
            <div className="form-header">
              <h2 className="title">{titleText}</h2>
              {
                !apiId && (
                  <p className="des">创建一个新接口会在所选「应用」创建一个接口，并关联到当前「需求」</p>
                )
              }
            </div>
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
                  label={<span>所属应用 <Link className="help-tips" to="/projects/new">没有找到应用，去新建一个</Link></span>}
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
                      <RadioButton value="HTTP">HTTP</RadioButton>
                      <RadioButton value="RPC">RPC</RadioButton>
                      <RadioButton value="SPI">SPI</RadioButton>
                    </RadioGroup>
                  )}
                </FormItem>
                {
                  getFieldValue('apiType') === 'HTTP' && (
                    <FormItem
                      label="Allow Methods"
                      {...formItemLayout}
                      help={getFieldError('apiSubType')}
                    >
                      {getFieldDecorator('apiSubType', {
                        initialValue: editingAPI.methods,
                        rules: [{ required: true, message: '请选择Allow Methods' }],
                      })(
                        <CheckboxGroup options={methodOptions} />
                      )}
                    </FormItem>
                  )
                }
                <FormItem
                  label={getFieldValue('apiType') && ruleTypeMap[getFieldValue('apiType')] ? ruleTypeMap[getFieldValue('apiType')].label : ''}
                  {...formItemLayout}
                  help={getFieldError('url')}
                >
                  {getFieldDecorator('url', {
                    initialValue: editingAPI.url,
                    rules: [
                      { required: true, message: '接口地址不能为空' },
                      { validator: this.validateUrl },
                    ],
                  })(
                    <Input placeholder={getFieldValue('apiType') && ruleTypeMap[getFieldValue('apiType')] ? ruleTypeMap[getFieldValue('apiType')].placeholder : ''} />
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
        </main>
      </Layout>
    );
  }
}

export default connect(({ apiEditModel }) => {
  return {
    apiEditModel,
  };
})(createForm()(Index));
