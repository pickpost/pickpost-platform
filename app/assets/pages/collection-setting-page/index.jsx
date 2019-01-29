import React from 'react';
import { Button, Input, Form, Modal, Menu, message } from 'antd';
import { connect } from 'dva';
import cloneDeep from 'lodash/cloneDeep';
import ajax from '../../utils/ajax';

import './style.less';

const FormItem = Form.Item;
const { TextArea } = Input;

const mySelf = window.context.user;

class Collection extends React.PureComponent {
  constructor(props, context) {
    super(props, context);
    this.state = {
      activeKey: 'collection',
      showMoreSettings: false,
      showModal: false,
      memberList: [],
    };
  }

  componentDidMount() {
    const { collectionId } = this.props.params;

    // 获取需求信息
    this.props.dispatch({
      type: 'collectionModel/collection',
      id: collectionId,
    });
    // 获取需求内接口列表
    this.props.dispatch({
      type: 'collectionModel/collectionApis',
      id: collectionId,
    });
  }

  generateMenu = api => {
    const _api = api;
    return (
      <Menu onClick={e => { this.changeRole(e, _api); }}>
        <Menu.Item key="1">OWNER</Menu.Item>
        <Menu.Item key="2">MEMBER</Menu.Item>
      </Menu>);
  }

  // 改变成员角色
  changeRole = (e, _api) => {
    const { collectionModel, dispatch } = this.props;
    const { members, owners } = collectionModel.collection;
    const newOwners = cloneDeep(owners);
    const newMembers = cloneDeep(members);

    if (e.key === '2') { // 从Owner -> Member
      owners.map((v, i) => {
        if (_api.key === v.key) {
          newOwners.splice(i, 1);
        }
        return null;
      });
      newMembers.push(_api);
    } else if (e.key === '1') {
      members.map((v, i) => {
        if (_api.key === v.key) {
          newMembers.splice(i, 1);
        }
        return null;
      });
      newOwners.push(_api);
    }

    dispatch({
      type: 'collectionModel/setData',
      data: {
        collection: {
          ...collectionModel.collection,
          owners: newOwners,
          members: newMembers,
        },
      },
    });

    this.handleSaveCollection({
      owners: newOwners,
      members: newMembers,
    });
  }

  // 删除成员/退出
  handleDelete = (v, _api) => {
    const { collectionModel, dispatch } = this.props;
    const { members, owners } = collectionModel.collection;
    const newOwners = cloneDeep(owners);
    const newMembers = cloneDeep(members);

    owners.map((v, i) => {
      if (_api.key === v.key) {
        newOwners.splice(i, 1);
      }
      return null;
    });
    members.map((v, i) => {
      if (_api.key === v.key) {
        newMembers.splice(i, 1);
      }
      return null;
    });

    dispatch({
      type: 'collectionModel/setData',
      data: {
        collection: {
          ...collectionModel.collection,
          owners: newOwners,
          members: newMembers,
        },
      },
    });

    this.handleSaveCollection({
      owners: newOwners,
      members: newMembers,
    });
  }

  // 校验表单
  validateForm = e => {
    if (e) e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.handleSaveCollection(values);
      }
    });
  }


  // 更新需求设置
  handleSaveCollection = values => {
    const { collectionId } = this.props.params;
    const collection = {};

    Object.keys(values).map(v => {
      collection[v] = values[v];
      return null;
    });
    this.props.dispatch({
      type: 'collectionModel/saveCollection',
      id: collectionId,
      collection,
    });
  }

  // 废弃需求
  handleAbandon = () => {
    const { collectionId } = this.props.params;
    if (collectionId) {
      this.setState({
        showModal: true,
      });
    }
  }

  // 搜索用户
  handleSearchMembers(keyword) {
    if (keyword === '') {
      return;
    }

    if (this._timeout) {
      clearTimeout(this._timeout);
      this._timeout = null;
    }
    this._timeout = setTimeout(() => {
      ajax({
        url: '/api/search',
        method: 'get',
        params: { keyword },
      }).then(({ status, data }) => {
        if (status === 'success') {
          const memberList = data.users.map(v => ({
            text: <div>
              {v.avatar_url && <img className="option-user" src={v.avatar_url} width={30} height={30} alt="" />}
              <span style={{ marginLeft: '10px' }}>{v.name} - {v.username || v.empId}</span>
            </div>,
            value: JSON.stringify(v),
            backfill: '',
          }));
          this.setState({
            memberList,
          });
        }
      });

    }, 300);
  }

  // 添加用户
  handleSearchSelect(_value) {
    const { collectionModel, dispatch } = this.props;
    const value = JSON.parse(_value);
    const hasSameOne = collectionModel.collection.owners.concat(collectionModel.collection.members).some(v => {
      if (v.key === value.empId) return true;
      return false;
    });

    if (hasSameOne) {
      message.info('请勿重复添加');
      return;
    }
    const newCollection = collectionModel.collection;
    newCollection.members.push({
      email: value.email,
      key: value.empId,
      label: value.name,
      role: 'MEMBER',
    });
    dispatch({
      type: 'collectionModel/setData',
      data: {
        collection: newCollection,
      },
    });
    this.handleSaveCollection({
      owners: newCollection.owners,
      members: newCollection.members,
    });
  }

  handleOk = () => {
    const { collectionId } = this.props.params;
    this.setState({
      showModal: false,
    }, () => {
      this.props.dispatch({
        type: 'collectionModel/deleteCollection',
        id: collectionId,
      });
    });
  }

  handleDeleteAPI = data => {
    const { collectionId } = this.props.params;
    this.props.dispatch({
      type: 'collectionModel/deleteAPI',
      apiId: data._id,
      projectId: data.projectId,
      collectionId,
    });
  }

  handleRemoveAPI = data => {
    const { collectionId } = this.props.params;
    this.props.dispatch({
      type: 'collectionModel/unlinkAPI',
      apiId: data._id,
      projectId: data.projectId,
      collectionId,
    });
  }

  render() {
    const { collectionModel: { collection } } = this.props;
    const { getFieldDecorator } = this.props.form;

    const owners = collection.owners ? collection.owners.map(v => {
      v.role = 'OWNER';
      return v;
    }) : [];
    const members = collection.members ? collection.members.map(v => {
      v.role = 'MEMBER';
      return v;
    }) : [];

    const users = (owners).concat(members);

    return (
      <div className="setting-wrapper">
        <Form className="form-wrapper" layout="vertical" hideRequiredMark={true}>
          <FormItem label="名称">
            {
              getFieldDecorator('name', {
                initialValue: collection.name,
                rules: [{ required: true, message: '需求名称不能为空' }],
              })(<Input className="setting-input" placeholder="请写入需求名称" />)
            }
          </FormItem>
          <FormItem label="描述">
            {
              getFieldDecorator('desc', {
                initialValue: collection.desc,
              })(<TextArea className="setting-input" placeholder="请写入需求描述" autosize={{ minRows: 3, maxRows: 6 }} />)
            }
          </FormItem>
          <FormItem style={{ paddingTop: '20px' }}>
            <Button disabled={!users.map(v => v.key).includes(mySelf.workid)} className="submit" type="primary" size="default" htmlType="submit" onClick={this.validateForm}>更新</Button>
          </FormItem>
          <FormItem style={{ borderTop: '1px solid #f2f4f5', paddingTop: '20px' }} label="废弃需求">
            <p>注意，仅需求 Owner 可以进行废弃，废弃后，将不可恢复，请务必慎重</p>
            <Button disabled={!owners.map(v => v.key).includes(mySelf.workid)} style={{ paddingÎTop: '20px' }} type="danger" size="default" onClick={this.handleAbandon}>废弃</Button>
          </FormItem>
        </Form>
        <Modal
          visible={this.state.showModal}
          title="废弃"
          okText="确认废弃"
          cancelText="取消"
          onOk={this.handleOk}
          onCancel={() => { this.setState({ showModal: false }); }}
          okButtonProps={{ type: 'danger' }}
        >
          <p>废弃后，将不可恢复，请务必慎重 !</p>
        </Modal>
      </div>
    );
  }
}

export default connect(({ collectionModel }) => {
  return {
    collectionModel,
  };
})(Form.create()(Collection));
