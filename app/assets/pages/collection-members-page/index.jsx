import React from 'react';
import {
  Table, Icon, Input,
  Form, Dropdown, Menu,
  AutoComplete, message, Popconfirm,
} from 'antd';
import { connect } from 'dva';
import ajax from 'xhr-plus';
import cloneDeep from 'lodash/cloneDeep';

import './style.less';

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

  memberColumns = [
    {
      dataIndex: 'label',
      width: 200,
      align: 'center',
      render: v => {
        return <p style={{ height: '40px', lineHeight: '40px', margin: 0 }}>{v}</p>;
      },
    },
    {
      dataIndex: 'email',
      align: 'center',
    },
    {
      dataIndex: 'role',
      align: 'center',
      render: (v, api) => {
        if (this.props.collectionModel.collection.owners.map(v => v.key).includes(mySelf.workid)) {
          return (<Dropdown overlay={this.generateMenu(api)} trigger={[ 'click' ]}>
            <a href="#">
              {v} <Icon type="down" />
            </a>
          </Dropdown>);
        }
        return (<a href="#">
          {v}
        </a>);
      },
    },
    {
      dataIndex: 'index',
      align: 'center',
      render: (v, api) => {
        if (this.props.collectionModel.collection.owners.map(v => v.key).includes(mySelf.workid)) {
          let content = '';
          if (api.key === mySelf.workid) {
            content = <a href="#" style={{ margin: 0, color: 'red' }}>退出</a>;
          } else {
            content = <a href="#" style={{ margin: 0, color: '#40a9ff' }}>删除</a>;
          }
          return <Popconfirm title="确认删除吗?" onConfirm={() => { this.handleDelete(v, api); }} okText="确认" cancelText="取消">
            {content}
          </Popconfirm>;
        }
        return null;
      },
    },
  ];

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
        type: 'json',
        data: { keyword },
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
    const { memberList } = this.state;

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
      <div className="member-wrapper">
        <div className="member-top">
          <h2 className="title">{`需求成员 ${users.length} 人`}</h2>
          {users.map(v => v.key).includes(mySelf.workid) &&
            <AutoComplete
              className="memeber-search"
              size="default"
              dataSource={memberList}
              optionLabelProp="backfill"
              onSearch={keyword => { this.handleSearchMembers(keyword); }}
              onSelect={value => { this.handleSearchSelect(value); }}
            >
              <Input placeholder="搜索用户并添加" suffix={<Icon type="search" className="certain-category-icon" />} />
            </AutoComplete>
          }
        </div>
        <Table pagination={false} showHeader={false} columns={this.memberColumns} dataSource={users} />
      </div>
    );
  }
}

export default connect(({ collectionModel }) => {
  return {
    collectionModel,
  };
})(Form.create()(Collection));
