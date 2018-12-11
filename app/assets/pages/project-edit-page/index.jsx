import React from 'react';
import { Icon, Form, Select, Input, Button } from 'antd';
import ajax from 'xhr-plus';
import autobind from 'autobind-decorator';
import { connect } from 'dva';
import { isOwner } from '../../utils/utils';
import Layout from '../../layout/default.jsx';
import BulkEditor from '../../components/bulk-editor';
import './style.less';

const createForm = Form.create;
const FormItem = Form.Item;
const Option = Select.Option;

@autobind
class CollectionsPage extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showMoreSettings: false,
      ownersOption: [],
      membersOption: [],
    };
  }

  handleSaveProject() {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.dispatch({
          type: 'projectEditModel/saveProject',
          id: values._id || '',
          project: {
            desc: values.desc,
            name: values.name,
            owners: values.owners,
            members: values.members,
            public: values.public,
            envs: values.envs,
            accounts: values.accounts,
          },
        });
      }
    });
  }

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

  toggleMoreSettings() {
    this.setState({
      showMoreSettings: !this.state.showMoreSettings,
    });
  }

  render() {
    const { ownersOption } = this.state;
    const { editingProject } = this.props.projectEditModel;
    const formItemLayout = {
      labelCol: { span: 24 },
      wrapperCol: { span: 24 },
    };
    const { getFieldDecorator, getFieldError } = this.props.form;
    let isTheOwner = true;
    // 编辑的时候看当前选中的项目owner是不是已登录用户
    if (editingProject) {
      isTheOwner = isOwner(editingProject);
    }

    // 新建应用为owner
    if (!editingProject._id) {
      const { user } = window.context;
      editingProject.owners = [{
        key: user.workid || '000000',
        label: user.cname || 'default',
      }];
      isTheOwner = true;
    }

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

    return (
      <Layout title="新建应用">
        <main className="single-page">
          <div className="collection-new">
            <div className="form-header">
              <h2 className="title">新建应用</h2>
              <p className="des">应用是指后端系统，名称与后端系统名保持一致。</p>
            </div>
            <div className="form-content">
              <Form layout="vertical" hideRequiredMark={true}>
                {getFieldDecorator('_id', {
                  initialValue: editingProject._id,
                })(
                  <Input type="hidden" />
                )}
                <FormItem
                  label="名称"
                  {...formItemLayout}
                  help={getFieldError('name')}
                >
                  {getFieldDecorator('name', {
                    initialValue: editingProject.name,
                    rules: [{ required: true, message: '应用名称不能为空' }],
                  })(
                    <Input placeholder="请输入应用名称" disabled={!isTheOwner} />
                  )}
                </FormItem>
                <FormItem
                  label="描述"
                  {...formItemLayout}
                  help={getFieldError('desc')}
                >
                  {getFieldDecorator('desc', {
                    initialValue: editingProject.desc,
                  })(
                    <Input placeholder="请输入应用描述" disabled={!isTheOwner} />
                  )}
                </FormItem>
                <FormItem
                  label="管理员"
                  {...formItemLayout}
                >
                  {getFieldDecorator('owners', {
                    initialValue: editingProject.owners,
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
                      disabled={!isTheOwner}
                    >
                      {
                        ownersOption.map(item => (
                          <Option key={item.empId} value={item.empId} name={item.name}>
                            {item.avatar_url && <img className="option-user" src={item.avatar_url} width={30} height={30} alt="" />}
                            <span className="option-name">{item.name} - {item.username}</span>
                          </Option>
                        ))
                      }
                    </Select>
                  )}
                </FormItem>
                {/* <FormItem
                  label="成员"
                  {...formItemLayout}
                >
                  {getFieldDecorator('members', {
                    initialValue: editingProject.members || [],
                  })(
                    <Select
                      mode="multiple"
                      notFoundContent=""
                      style={{ width: '100%' }}
                      placeholder="请选择成员"
                      onSearch={keyword => { this.handleSearchMembers('members', keyword); }}
                      filterOption={false}
                      labelInValue
                      optionLabelProp="name"
                      disabled={!isTheOwner && !isTheMember}
                    >
                      {
                        membersOption.map(item => (
                          <Option key={item.empId} value={item.empId} name={item.name}>
                            {item.avatar_url && <img className="option-user" src={item.avatar_url} width={30} height={30} alt="" />}
                            <span className="option-name">{item.name} - {item.username}</span>
                          </Option>
                        ))
                      }
                    </Select>
                  )}
                </FormItem> */}
                <div className="more-settings" onClick={this.toggleMoreSettings}>
                  <span>
                    更多设置
                    {
                      !this.state.showMoreSettings ? <Icon type="caret-down" /> : <Icon type="caret-up" />
                    }
                  </span>
                </div>
                {
                  this.state.showMoreSettings && (
                    <div>
                      <FormItem
                        label="服务器地址"
                        {...formItemLayout}
                      >
                        {getFieldDecorator('envs', {
                          initialValue: editingProject.envs || [{}],
                        })(
                          <BulkEditor configs={BulkEditorEnvs} />
                        )}
                      </FormItem>
                      <FormItem
                        label="测试账户"
                        {...formItemLayout}
                      >
                        {getFieldDecorator('accounts', {
                          initialValue: editingProject.accounts || [{}],
                        })(
                          <BulkEditor configs={BulkEditorAccounts} />
                        )}
                      </FormItem>
                    </div>
                  )
                }

                <div>
                  <Button className="submit" type="primary" size="default" htmlType="submit" onClick={this.handleSaveProject}>
                    新建
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </main>
      </Layout>
    );
  }
}

export default connect(({ projectEditModel }) => {
  return {
    projectEditModel,
  };
})(createForm()(CollectionsPage));
