import React from 'react';
import autobind from 'autobind-decorator';
import { connect } from 'dva';
import { Form, Input, Radio, Icon, Dropdown, Menu, Modal } from 'antd';
import BulkEditor from '../../../components/BulkEditor';

import './AuthForm.less';

const FormItem = Form.Item;
const InputGroup = Input.Group;

@autobind
class AuthForm extends React.Component {
  state = {
    modalAccounts: [],
  }

  handleAccountChange({ key }) {
    const { form } = this.props;
    const { accounts } = this.props.apiTestModel;
    const item = accounts[key];
    form.setFieldsValue({
      account: item.username,
      password: item.password,
    });
  }

  toggleAccountModal() {
    const { apiTestModel, dispatch } = this.props;
    this.setState({
      modalAccounts: apiTestModel.accounts,
    });
    dispatch({
      type: 'apiTestModel/setData',
      data: {
        accountModal: !apiTestModel.accountModal,
      },
    });
  }

  handleUpdateUsers() {
    const { apiTestModel, dispatch } = this.props;
    // 更新接口所在的项目
    dispatch({
      type: 'apiTestModel/updateAccounts',
      url: `/api/projects/${apiTestModel.projectId}`,
      accounts: this.state.modalAccounts,
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { modalAccounts } = this.state;
    const { authStrategy, account, password, accounts, method, accountModal } = this.props.apiTestModel;

    const formItemLayout = {
      labelCol: {
        sm: { span: 4 },
      },
      wrapperCol: {
        sm: { span: 10 },
      },
    };

    const formItemLayoutLarge = {
      labelCol: {
        sm: { span: 4 },
      },
      wrapperCol: {
        sm: { span: 16 },
      },
    };

    const BulkEditorAccounts = [{
      field: 'username',
      placeholder: '用户名',
      width: '',
    }, {
      field: 'password',
      placeholder: '密码',
      width: '',
    }, {
      field: 'remark',
      placeholder: '备注',
      width: '',
    }];

    const menu = (
      <Menu onClick={this.handleAccountChange}>
        {
          (accounts || []).map((item, index) => (
            <Menu.Item key={index}>
              {item.username} {item.remark ? `(${item.remark})` : ''}
            </Menu.Item>
          ))
        }
      </Menu>
    );

    const envDropdown = (
      <Dropdown overlay={menu} placement="bottomRight" size="default">
        <Icon type="down" />
      </Dropdown>
    );

    return (
      <div className="auth-wrapper">
        <Form>
          {
            method !== 'RPC' && (
              <FormItem {...formItemLayoutLarge} label="授权策略">
                {getFieldDecorator('authStrategy', {
                  initialValue: authStrategy,
                })(
                  <Radio.Group>
                    <Radio value="auth">A</Radio>
                    <Radio value="buc">B</Radio>
                  </Radio.Group>
                )}
              </FormItem>
            )
          }
          <FormItem {...formItemLayout} label="账号">
            <InputGroup compact size="default">
              {getFieldDecorator('account', { initialValue: account })(
                <Input addonAfter={envDropdown} size="default" />
              )}
            </InputGroup>
            <span className="account-setting" onClick={this.toggleAccountModal}> 设置 </span>
          </FormItem>
          <FormItem {...formItemLayout} label="密码">
            {getFieldDecorator('password', { initialValue: password })(
              <Input size="default" />
            )}
          </FormItem>
        </Form>

        <Modal title="账号配置" visible={accountModal}
          onOk={this.handleUpdateUsers}
          onCancel={this.toggleAccountModal}
        >
          <BulkEditor configs={BulkEditorAccounts} value={modalAccounts || []} onChange={ list => { this.setState({ modalAccounts: list }); } } />
        </Modal>
      </div>
    );
  }
}

const formOptions = {
  onValuesChange: (props, values) => {
    props.dispatch({
      type: 'apiTestModel/setData',
      data: {
        ...values,
      },
    });
  },
};

export default connect(({ apiTestModel }) => {
  return {
    apiTestModel,
  };
})(Form.create(formOptions)(AuthForm));
