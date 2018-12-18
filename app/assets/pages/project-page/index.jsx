import React from 'react';
import moment from 'moment';
import ajax from 'xhr-plus';
import {
  Form, Select, Input, Button,
  Icon, Table, Tag, Popover,
} from 'antd';
import { connect } from 'dva';
import { Link } from 'dva/router';
import Layout from '../../layout/default.jsx';
import Info from '../../components/info';
import BulkEditor from '../../components/bulk-editor';
import { getQueryParamByName } from '../../utils/utils';
import { TypeColorMap } from '../../../common/constants';

import './style.less';

const createForm = Form.create;
const FormItem = Form.Item;
const Option = Select.Option;

const BulkEditorAccounts = [{
  field: 'username',
  placeholder: '用户名',
  width: '',
}, {
  field: 'password',
  placeholder: '密码',
  width: '',
}, {
  field: 'remark',
  placeholder: '备注',
  width: '',
}];

const BulkEditorEnvs = [{
  field: 'value',
  placeholder: '例如 http://',
  width: '70%',
}, {
  field: 'remark',
  placeholder: '备注',
  width: '30%',
}];

class Project extends React.Component {
  state = {
    ownersOption: [],
  }
  componentDidMount() {
    const { params: { projectId } } = this.props;
    // 获取应用下所有接口
    this.props.dispatch({
      type: 'projectModel/getApis',
      projectId,
    });
    // 获取应用详情
    this.props.dispatch({
      type: 'projectModel/project',
      projectId,
    });
  }

  apisColumns = [{
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    width: '260px',
  }, {
    title: '类型',
    dataIndex: 'methods',
    key: 'methods',
    render: methods => {
      return methods.map(m => (<Tag key={m} color={TypeColorMap[m]}>{m}</Tag>));
    },
  }, {
    title: '地址',
    dataIndex: 'url',
    key: 'url',
    width: '400px',
  }, {
    title: '最近更新',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    render: updatedAt => {
      return moment(updatedAt).format('YYYY-MM-DD HH:mm:ss');
    },
  }, {
    title: '操作',
    dataIndex: 'operation',
    key: 'operation',
    render: (_, api) => {
      const DeleteFileButtons = (
        <div className="action-btns">
          <Button type="danger" onClick={this.handleDeleteAPI.bind(this, api)}>从应用删除接口</Button>
        </div>
      );
      return (
        <div className="actions" onClick={e => e.stopPropagation()}>
          <Link to={`/api-detail/${api._id}/doc`}>文档</Link>
          <Link to={`/api-detail/${api._id}/test`}>测试</Link>
          <Link to={`/api-detail/${api._id}/mock`}>Mock</Link>
          <Popover overlayClassName="action-btns-wrapper" trigger="click" content={DeleteFileButtons}>
            <Link to={`/api-detail/${api._id}/mock?belong=collection_${this.props.params.collectionId}`}>删除</Link>
          </Popover>
        </div>
      );
    },
  }];

  handleSearchMembers(type, keyword) {
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
          const newState = { ...this.state };
          newState[type + 'Option'] = data.users;
          this.setState(newState);
        }
      });

    }, 300);
  }

  handleSaveProject = () => {
    const { projectId } = this.props.params;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.dispatch({
          type: 'projectModel/projectUpdate',
          id: projectId,
          project: {
            desc: values.desc,
            name: values.name,
            owners: values.owners,
            envs: values.envs,
            accounts: values.accounts,
          },
        });
      }
    });
  }

  handleDeleteAPI = data => {
    this.props.dispatch({
      type: 'projectModel/deleteAPI',
      apiId: data._id,
      projectId: data.projectId,
    });
  }

  render() {
    window._t_ = this;
    const { projectModel, params } = this.props;
    const { project: { name, desc, updatedAt, owners, envs, accounts }, apis } = projectModel;
    const { projectId } = params;
    const currentTab = getQueryParamByName('tab') || 'api';
    const { getFieldDecorator, getFieldError } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 24 },
      wrapperCol: { span: 24 },
    };

    return (
      <Layout uplevel={'/projects'}>
        <aside>
          <Link to={`/project/${projectId}?tab=api`} activeClassName="active">
            <Icon type="bars" />
            <div>接口</div>
          </Link>
          {/* <Link to={`/project/${_id}?tab=member`} activeClassName="active">
            <Icon type="team" />
            <div>成员</div>
            </Link> */}
          <Link to={`/project/${projectId}?tab=setting`} activeClassName="active">
            <Icon type="setting" />
            <div>设置</div>
          </Link>
        </aside>
        <main id="project">
          {
            currentTab === 'api' && (
              <div className="project-main">
                <div className="c-header">
                  <Info title={name} desc={desc} updatedAt={updatedAt}></Info>
                </div>
                <Table
                  dataSource={apis}
                  columns={this.apisColumns}
                  rowKey="_id"
                  locale={{ emptyText: '暂无数据' }}
                  onRow={api => {
                    return {
                      onClick: () => {
                        window.open(`/api-detail/${api._id}/doc`);
                      },
                    };
                  }}
                />
              </div>
            )
          }
          {
            currentTab === 'setting' && (
              <div className="form-content">
                <Form layout="vertical" hideRequiredMark={true}>
                  {getFieldDecorator('_id', {
                    initialValue: projectId,
                  })(
                    <Input type="hidden" />
                  )}
                  <FormItem
                    label="名称"
                    {...formItemLayout}
                    help={getFieldError('name')}
                  >
                    {getFieldDecorator('name', {
                      initialValue: name,
                      rules: [{ required: true, message: '应用名称不能为空' }],
                    })(
                      <Input placeholder="请输入应用名称" />
                    )}
                  </FormItem>
                  <FormItem
                    label="描述"
                    {...formItemLayout}
                    help={getFieldError('desc')}
                  >
                    {getFieldDecorator('desc', {
                      initialValue: desc,
                    })(
                      <Input placeholder="请输入应用描述" />
                    )}
                  </FormItem>
                  <FormItem
                    label="管理员"
                    {...formItemLayout}
                  >
                    {getFieldDecorator('owners', {
                      initialValue: owners,
                      rules: [{ required: true, message: '管理员不能为空' }],
                    })(
                      <Select
                        mode="multiple"
                        notFoundContent=""
                        style={{ width: '100%' }}
                        placeholder="请选择管理员"
                        onSearch={keyword => { this.handleSearchMembers('owners', keyword); }}
                        filterOption={false}
                        labelInValue
                        optionLabelProp="name"
                      >
                        {
                          this.state.ownersOption.map(item => (
                            <Option key={item.empId} value={item.empId} name={item.name}>
                              {item.avatar_url && <img className="option-user" src={item.avatar_url} width={30} height={30} alt="" />}
                              <span className="option-name">{item.name} - {item.username || item.empId}</span>
                            </Option>
                          ))
                        }
                      </Select>
                    )}
                  </FormItem>
                  {
                    <div>
                      <FormItem
                        label="服务器地址"
                        {...formItemLayout}
                      >
                        {getFieldDecorator('envs', {
                          initialValue: envs && envs[0] ? envs : [{}],
                        })(
                          <BulkEditor configs={BulkEditorEnvs} />
                        )}
                      </FormItem>
                      <FormItem
                        label="测试账户"
                        {...formItemLayout}
                      >
                        {getFieldDecorator('accounts', {
                          initialValue: accounts && accounts[0] ? accounts : [{}],
                        })(
                          <BulkEditor configs={BulkEditorAccounts} />
                        )}
                      </FormItem>
                    </div>
                  }

                  <div>
                    <Button className="submit" type="primary" size="default" htmlType="submit" onClick={this.handleSaveProject}>
                      更新
                  </Button>
                  </div>
                </Form>
              </div>
            )
          }
        </main>
      </Layout>
    );
  }
}

export default connect(({ projectModel }) => {
  return {
    projectModel,
  };
})(createForm()(Project));
