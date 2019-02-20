import React from 'react';
import { connect } from 'dva';
import { createForm } from 'rc-form';
import { Link } from 'dva/router';
import {
  Form, Icon, Input, Button, Checkbox,
} from 'antd';

import './index.less';

class LoginPage extends React.PureComponent {
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
      <div className="login-page">
        <h2>登录</h2>
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
            {getFieldDecorator('remember', {
              valuePropName: 'checked',
              initialValue: true,
            })(
              <Checkbox>记住我</Checkbox>
            )}
            <Link className="login-form-forgot" to="/resetPassword">忘记密码</Link>
            <Button type="primary" htmlType="submit" className="login-form-button"> 登录 </Button>
            Or <Link to="/register">注册</Link>
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
})(createForm()(LoginPage));
