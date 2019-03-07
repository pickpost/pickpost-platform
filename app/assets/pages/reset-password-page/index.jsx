import React from 'react';
import { connect } from 'dva';
import { Form, Icon, Input, Button, message } from 'antd';
import validator from 'validator';

import './index.less';

class ResetPasswordPage extends React.PureComponent {

  state = {
    timer: null,
    countNum: 0,
    confirmDirty: false,
    autoCompleteResult: [],
  };

  componentWillUnmount() {
    if (this.state.timer != null) {
      clearInterval(this.state.timer);
    }
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

  // 找回密码form: 确认邮箱是否注册过
  handleSearchPass = () => {
    const { dispatch } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        dispatch({
          type: 'resetPasswordModel/searchPass',
          email: values.email,
        });
      }
    });
  }

  // 发送验证码
  handleSmsCode = () => {
    const { dispatch, form } = this.props;
    const email = form.getFieldValue('email');
    if (!email || !validator.isEmail(email)) {
      message.warn('请先输入正确的邮箱地址');
      return;
    }
    dispatch({
      type: 'resetPasswordModel/sendEmail',
      email,
    });
    this.setState({
      countNum: 30,
    }, () => {
      this.countDown();
    });
  }

  // email校验
  mailValidator = (rule, value, callback) => {
    if (value && !validator.isEmail(value)) {
      callback('请输入正确的邮箱地址');
    } else {
      callback();
    }
  }

  handleConfirmBlur = (e) => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  }

  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback('两次输入的密码不一致');
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

  handleSubmit = () => {
    const { dispatch } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        dispatch({
          type: 'resetPasswordModel/resetPassword',
          email: values.email,
          password: values.password,
          code: values.code,
        });
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { searchPass, email } = this.props.resetPasswordModel;
    const { countNum } = this.state;
    const addonAfter = countNum !== 0 ? <span className="addon-after">{countNum}秒</span> : <span className="addon-after" onClick={this.handleSmsCode}>发送验证码</span>;
    return (
      <div className="page">
        <h2>{searchPass ? '找回密码' : '重置密码'}</h2>
        {searchPass ?
          <Form className="form" id="search_pass">
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
            请输入您注册帐户时使用的电子邮箱
            <Form.Item>
              <Button type="primary" onClick={this.handleSearchPass} className="form-button"> 下一步 </Button>
            </Form.Item>
          </Form>
          :
          <Form className="form" id="reset_password">
            <Form.Item>
              {getFieldDecorator('email', {
                rules: [{ required: true, message: '请输入邮箱' }],
              })(
                <Input disabled prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} value={email} />} />
              )}
            </Form.Item>
            <Form.Item>
              {getFieldDecorator('password', {
                rules: [
                  { required: true, message: '输入新密码' },
                  { validator: this.validateToNextPassword }],
              })(
                <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="新密码" />
              )}
            </Form.Item>
            <Form.Item>
              {getFieldDecorator('confirm', {
                rules: [
                  { required: true, message: '确认密码' },
                  { validator: this.compareToFirstPassword }],
              })(
                <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="确认密码" onBlur={this.handleConfirmBlur} />
              )}
            </Form.Item>
            <Form.Item>
              {getFieldDecorator('code', {
                rules: [{ required: true, message: '输入验证码' }],
              })(
                <Input prefix={<Icon type="message" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="6位验证码" addonAfter={addonAfter} />
              )}
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={this.handleSubmit} className="form-button"> 确定修改 </Button>
            </Form.Item>
          </Form>
        }
      </div>
    );
  }
}

export default connect(({ resetPasswordModel }) => {
  return {
    resetPasswordModel,
  };
})(Form.create()(ResetPasswordPage));
