import React from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import {
  Form, Icon, Input, Button, Checkbox,
} from 'antd';
import validator from 'validator';

import './index.less';

class LoginPage extends React.PureComponent {
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.dispatch({
          type: 'loginModel/login',
          username: values.username,
          password: values.password,
        });
      }
    });
  }

  mailValidator = (rule, value, callback) => {
    if (value && !validator.isEmail(value)) {
      callback('请输入正确的邮箱地址');
    } else {
      callback();
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="login-page">
        <h2>登录</h2>
        <Form onSubmit={this.handleSubmit} method="post" action="/api/login" className="login-form">
          <Form.Item>
            {getFieldDecorator('username', {
              rules: [
                { required: true, message: '请输入邮箱地址' },
                { validator: this.mailValidator },
              ],
            })(
              <Input name="email" prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="邮箱" />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('password', {
              rules: [{ required: true, message: '请输入密码' }],
            })(
              <Input name="password" prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="密码" />
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
})(Form.create()(LoginPage));
