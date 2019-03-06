import React from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Form, Icon, Input, Button, message } from 'antd';
import validator from 'validator';

import './index.less';

class RegisterPage extends React.PureComponent {
  handleSubmit = () => {
    const { dispatch } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        dispatch({
          type: 'registerModel/register',
          email: values.email,
          password: values.password,
          code: values.code,
        });
      }
    });
  }

  handleSmsCode = () => {
    const { dispatch, form } = this.props;
    const email = form.getFieldValue('email');
    if (!email || !validator.isEmail(email)) {
      message.warn('请先输入正确的邮箱地址');
      return;
    }
    dispatch({
      type: 'registerModel/sendEmail',
      email,
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
    const addonAfter = <span className="addon-after" onClick={this.handleSmsCode}>发送验证码</span>;
    return (
      <div className="register-page">
        <h2>注册账号</h2>
        <Form className="login-form">
          <Form.Item>
            {getFieldDecorator('email', {
              rules: [
                { required: true, message: '请输入邮箱' },
                { validator: this.mailValidator },
              ],
            })(
              <Input prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="邮箱" />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('code', {
              rules: [{ required: true, message: '请输入验证码' }],
            })(
              <Input prefix={<Icon type="message" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="验证码" addonAfter={addonAfter} />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('password', {
              rules: [{ required: true, message: '请输入密码' }],
            })(
              <Input.Password prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="密码" />
            )}
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={this.handleSubmit} className="login-form-button"> 注册 </Button>
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
})(Form.create()(RegisterPage));
