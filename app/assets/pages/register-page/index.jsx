import React from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Form, Icon, Input, Button, message } from 'antd';
import validator from 'validator';

import './index.less';

class RegisterPage extends React.PureComponent {

  state = {
    timer: null,
    countNum: 0,
  };

  componentWillUnmount() {
    if (this.state.timer != null) {
      clearInterval(this.state.timer);
    }
  }

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
    this.setState({
      countNum: 30,
    }, () => {
      this.countDown();
    });
  }

  // 倒计时 n秒内不能再次发送验证码
  countDown = () => {
    if (this.state.timer) {
      clearInterval(this.state.timer);
    }
    this.state.timer = setInterval(() => {
      let { countNum } = this.state;
      countNum--;
      this.setState({
        countNum,
      }, () => {
        if (countNum <= 0) {
          clearInterval(this.state.timer);
        }
      });
    }, 1000);
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
    const { countNum } = this.state;
    const addonAfter = countNum !== 0 ? <span className="addon-after">{countNum}秒</span> : <span className="addon-after" onClick={this.handleSmsCode}>发送验证码</span>;
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
              <Input prefix={<Icon type="message" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="6位验证码" addonAfter={addonAfter} />
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
