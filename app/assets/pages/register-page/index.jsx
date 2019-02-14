import React from 'react';
import { connect } from 'dva';
import { createForm } from 'rc-form';
import { Link } from 'dva/router';
import {
  Form, Icon, Input, Button,
} from 'antd';

import './index.less';

class RegisterPage extends React.PureComponent {
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="register-page">
        <h2>注册账号</h2>
        <Form onSubmit={this.handleSubmit} className="login-form">
          <Form.Item>
            {getFieldDecorator('userName', {
              rules: [{ required: true, message: 'Please input your username!' }],
            })(
              <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="邮箱" />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('password', {
              rules: [{ required: true, message: 'Please input your Password!' }],
            })(
              <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="密码" />
            )}
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="login-form-button"> 注册 </Button>
            <Link className="login-form-forgot" to="/login">已有账号</Link>
          </Form.Item>
        </Form>
      </div>
    );
  }
}

export default connect(({ registerModel }) => {
  return {
    registerModel,
  };
})(createForm()(RegisterPage));
