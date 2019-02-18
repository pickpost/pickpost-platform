import React from 'react';
import { Avatar, Icon, Form, Input, Button, Modal, message } from 'antd';
import { Link } from 'dva/router';
import classNames from 'classnames';
import GlobalSearch from '../global-search';
import { setCookie, getQueryParamByName } from '../../utils/utils';
import ajax from '../../utils/ajax';

import './style.less';

const user = window.context.user;
class Header extends React.Component {
  state = {
    visible: false,
    createFormVisible: false,
    spaces: [],
    currentSpace: {},
  }

  componentDidMount() {
    this.fetchSpaces();
  }

  fetchSpaces = () => {
    ajax({
      method: 'get',
      url: '/api/spaces',
    }).then(res => {
      const spaces = res.data || [];
      const spaceAlias = getQueryParamByName('space');
      const currentSpace = spaces.find(item => item.alias === spaceAlias) || spaces[0];

      this.setState({
        createFormVisible: false,
        spaces,
        currentSpace,
      });
    });
  }

  gotoHomePage() {
    setCookie('pickpost_home', '');
    location.href = '/';
  }

  showSpaceList = () => {
    this.setState({
      visible: true,
    });
  }

  hideSpaceList = () => {
    this.setState({
      visible: false,
    });
  }

  showCreateForm = () => {
    this.setState({
      createFormVisible: true,
    });
  }

  handleEditSpace(item, e) {
    e.stopPropagation();
    this.setState({
      createFormVisible: true,
    }, () => {
      this.props.form.setFieldsValue({
        _id: item._id,
        name: item.name,
        alias: item.alias,
      });
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        ajax({
          method: values._id ? 'put' : 'post',
          url: values._id ? `/api/spaces/${values._id}` : '/api/spaces',
          data: {
            name: values.name,
            alias: values.alias,
          },
        }).then(() => {
          message.success('操作成功');
          this.fetchSpaces();
        }, (errMsg) => {
          message.error(errMsg.message);
        });
      }
    });
  }

  handleSelect = (e) => {
    const { alias } = e.currentTarget.dataset;
    location.href = `/collections?space=${alias}`;
  }

  render() {
    const { uplevel, title } = this.props;
    const { visible, createFormVisible, spaces, currentSpace } = this.state;
    const { getFieldDecorator, getFieldValue } = this.props.form;

    if (title) {
      return (
        <div className="header">
          <div className="header-row">
            <div className="backbtn" onClick={() => { history.back(); }}>
              <Icon type="left" />
            </div>
            <div className="page-title">
              <span>{title}</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="header">
        <div className="header-logo">
          {
            uplevel && (
              <Link to={this.props.uplevel} className="backbtn">
                <Icon type="left" />
              </Link>
            )
          }
          <Link to="/collections" className="logo-tit">
            <svg width="37px" height="20px" viewBox="0 0 37 26" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
              <defs>
                <linearGradient x1="75.7401524%" y1="56.669876%" x2="0%" y2="0%" id="linearGradient-1">
                  <stop stopColor="#FC4D20" offset="0%"></stop>
                  <stop stopColor="#FE916D" offset="100%"></stop>
                </linearGradient>
                <linearGradient x1="25.9436619%" y1="66.0903456%" x2="100%" y2="3.27749649%" id="linearGradient-2">
                  <stop stopColor="#14C9A4" offset="0%"></stop>
                  <stop stopColor="#46E8C7" offset="100%"></stop>
                </linearGradient>
              </defs>
              <g id="Symbols" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g id="Logo" transform="translate(0.000000, 2.000000)">
                  <g id="Group-Copy-2">
                    <polygon id="Triangle-3" fill="#3C8DE7" transform="translate(34.339110, 6.699816) rotate(-218.000000) translate(-34.339110, -6.699816) " points="33.6037119 3.22046908 35.5941229 7.9348178 33.0840972 10.1791621"></polygon>
                    <polygon id="Triangle-Copy" fill="url(#linearGradient-1)" points="0.0729402709 7.0160731 8.39850688 12.571242 2.28378461 23.3524457"></polygon>
                    <polygon id="Triangle-2" fill="url(#linearGradient-2)" points="33.2489207 3.08836741 30.0178957 23.3856206 22.5958936 10.2762833"></polygon>
                    <polygon id="Triangle" stroke="#2C3E50" strokeWidth="1.5" points="16.1709741 0.0577115119 28.7955192 22.6383937 3.546429 22.6383937"></polygon>
                  </g>
                </g>
              </g>
            </svg>
            <span>PickPost</span>
          </Link>
        </div>
        <div>
          <div className="space-switch" onClick={this.showSpaceList}>
            {currentSpace && currentSpace.name} <Icon type="swap" />
          </div>
          <div className="enter pull-right">
            <a className="help-link" onClick={this.gotoHomePage}>首页</a>
            <Avatar src={user.avatar} />
          </div>
          <div className="global-search pull-right">
            <GlobalSearch />
          </div>
        </div>
        <Modal
          visible={visible}
          title="切换工作空间"
          onCancel={this.hideSpaceList}
          footer={null}
        >
          <ul className="space-list ant-select-dropdown-menu-item-group-list">
            {
              spaces.map(item => (
                <li
                  key={item._id}
                  className={classNames('ant-select-dropdown-menu-item', { active: item._id === currentSpace._id })}
                  data-alias={item.alias}
                  onClick={this.handleSelect}
                >
                  <Icon className="checked-icon" type="check" /> {item.name}
                  <span className="actions-zone">
                    <span className="space-alias"> {item.alias} </span>
                    <Icon className="edit-icon" type="edit" onClick={this.handleEditSpace.bind(this, item)} />
                  </span>
                </li>
              ))
            }
          </ul>
          {
            !createFormVisible && (
              <div className="add-space" onClick={this.showCreateForm}>
                <Icon type="plus" />
                {getFieldValue('_id') ? '编辑空间' : '新建空间'}
              </div>
            )
          }
          {
            createFormVisible && (
              <div className="create-space-form">
                <h3>{getFieldValue('_id') ? '编辑空间' : '新建空间'}</h3>
                <Form onSubmit={this.handleSubmit}>
                  {getFieldDecorator('_id')(
                    <Input type="hidden" />
                  )}
                  <Form.Item style={{ flex: 'auto', marginRight: 10 }}>
                    {getFieldDecorator('name', {
                      rules: [{ required: true, message: '请输入空间名称' }],
                    })(<Input type="text" placeholder="空间名称，如：口碑" />)}
                  </Form.Item>
                  <Form.Item style={{ flex: 'auto', marginRight: 10 }}>
                    {getFieldDecorator('alias', {
                      rules: [{ required: true, message: '请输入空间唯一标识' }],
                    })(<Input type="text" placeholder="空间别名，如：koubei" />)}
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" >
                      {getFieldValue('_id') ? '更新' : '创建'}
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            )
          }
        </Modal>
      </div>
    );
  }
}

export default Form.create()(Header);
