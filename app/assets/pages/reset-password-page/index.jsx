import React from 'react';
import { connect } from 'dva';
import { createForm } from 'rc-form';
import {
  Form, Icon, Input, Button,
} from 'antd';

import './index.less';

class ResetPasswordPage extends React.PureComponent {

  state = {
    confirmDirty: false,
    autoCompleteResult: [],
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
      }
    });
  }

  handleConfirmBlur = (e) => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  }

  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback('Two passwords that you enter is inconsistent!');
    } else {
      callback();
    }
  }

  validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.confirmDirty) {
      form.validateFields([ 'confirm' ], { force: true });
    }
    callback();
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const addonAfter = <span className="addonAfter" onClick={this.handleSmsCode}>发送验证码</span>;
    return (
      <div className="login-page">
        <h2>重置密码</h2>
        <Form onSubmit={this.handleSubmit} className="login-form">
          <Form.Item>
            {getFieldDecorator('userName', {
              rules: [{ required: true, message: 'Please input your username!' }],
            })(
              <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="邮箱" />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('code', {
              rules: [{ required: true, message: '输入验证码!' }],
            })(
              <Input prefix={<Icon type="message" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="验证码" addonAfter={addonAfter} />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('password', {
              rules: [{
                required: true, message: '输入新密码',
              }, {
                validator: this.validateToNextPassword,
              }],
            })(
              <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="输入新密码" />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('confirm', {
              rules: [{
                required: true, message: '确认密码',
              }, {
                validator: this.compareToFirstPassword,
              }],
            })(
              <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="确认密码" onBlur={this.handleConfirmBlur} />
            )}
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="login-form-button"> 确定修改 </Button>
          </Form.Item>
        </Form>
      </div>
    );
  }
}

export default connect(({ loginModel }) => {
  return {
    loginModel,
  };
})(createForm()(ResetPasswordPage));
