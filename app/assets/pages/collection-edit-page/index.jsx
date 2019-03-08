import React from 'react';
import { Form, Select, Input, Button } from 'antd';
import autobind from 'autobind-decorator';
import { connect } from 'dva';
import ajax from '../../utils/ajax';
import { isOwner, isMember } from '../../utils/utils';
import Layout from '../../layout/default.jsx';
import './style.less';

const createForm = Form.create;
const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;

@autobind
class CollectionEditPage extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showMoreSettings: false,
      ownersOption: [],
      membersOption: [],
    };
  }

  handleSaveCollection() {
    this.props.form.validateFields((err, values) => {
      let owners = [];
      let members = [];
      if (!err) {
        if (values.owners.length) {
          owners = values.owners.map(v => (
            {
              key: JSON.parse(v.key).empId,
              label: v.label,
              email: JSON.parse(v.key).email,
            }
          ));
        }
        if (values.members.length) {
          members = values.members.map(v => (
            {
              key: JSON.parse(v.key).empId,
              label: v.label,
              email: JSON.parse(v.key).email,
            }
          ));
        }
        this.props.dispatch({
          type: 'collectionEditModel/saveCollection',
          id: values._id || '',
          spaceAlias: this.props.location.query.space,
          collection: {
            desc: values.desc,
            name: values.name,
            owners,
            members,
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
        params: { keyword },
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
    const { ownersOption, membersOption } = this.state;
    const { location: { query }, collectionEditModel: { editingCollection } } = this.props;

    const formItemLayout = {
      labelCol: { span: 24 },
      wrapperCol: { span: 24 },
    };
    const { getFieldDecorator } = this.props.form;
    let isTheOwner = true;
    let isTheMember = true;

    // 编辑的时候看当前选中的项目owner是不是已登录用户
    if (editingCollection) {
      isTheOwner = isOwner(editingCollection);
      isTheMember = isMember(editingCollection);
    }

    // 新建接口集为owner
    if (!editingCollection._id) {
      const { user } = window.context;
      if (user && user.email) {
        editingCollection.owners = [{
          key: user.email,
          label: user.username,
        }];
      }

      isTheOwner = true;
      isTheMember = true;
    }

    return (
      <Layout title="新建需求" space={query.space}>
        <main className="single-page">
          <div className="collection-new">
            <div className="form-header">
              <h2 className="title">新建需求</h2>
              <p className="des">需求是针对一次迭代的接口集合</p>
            </div>
            <div className="form-content">
              <Form layout="vertical" hideRequiredMark={true}>
                {getFieldDecorator('_id', {
                  initialValue: editingCollection._id,
                })(
                  <Input type="hidden" />
                )}
                <FormItem
                  label="名称"
                  {...formItemLayout}
                >
                  {getFieldDecorator('name', {
                    initialValue: editingCollection.name,
                    rules: [{ required: true, message: '需求名称不能为空' }],
                  })(
                    <Input placeholder="请输入需求名称" disabled={!isTheOwner} />
                  )}
                </FormItem>
                <FormItem
                  label="描述"
                  {...formItemLayout}
                >
                  {getFieldDecorator('desc', {
                    initialValue: editingCollection.desc,
                  })(
                    <TextArea placeholder="请输入需求描述" disabled={!isTheOwner} autosize={{ minRows: 3, maxRows: 6 }} />
                  )}
                </FormItem>
                <FormItem
                  label="管理员"
                  {...formItemLayout}
                >
                  {getFieldDecorator('owners', {
                    initialValue: editingCollection.owners || [],
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
                          <Option key={item.email} value={item.email} name={item.username}>
                            {item.avatar && <img className="option-user" src={item.avatar} width={30} height={30} alt="" />}
                            <span className="option-name">{item.username}</span>
                          </Option>
                        ))
                      }
                    </Select>
                  )}
                </FormItem>
                <FormItem
                  label="成员"
                  {...formItemLayout}
                >
                  {getFieldDecorator('members', {
                    initialValue: editingCollection.members || [],
                  })(
                    <Select
                      mode="multiple"
                      notFoundContent=""
                      style={{ width: '100%' }}
                      placeholder="请选择成员"
                      onSearch={keyword => { this.handleSearchMembers('members', keyword); }}
                      onChange={this.handleChange}
                      filterOption={false}
                      labelInValue
                      optionLabelProp="name"
                      disabled={!isTheOwner && !isTheMember}
                    >
                      {
                        membersOption.map(item => (
                          <Option key={item.email} value={item.email} name={item.username}>
                            {item.avatar_url && <img className="option-user" src={item.avatar_url} width={30} height={30} alt="" />}
                            <span className="option-name">{item.username}</span>
                          </Option>
                        ))
                      }
                    </Select>
                  )}
                </FormItem>
                <div>
                  <Button className="submit" type="primary" size="default" htmlType="submit" onClick={this.handleSaveCollection}>
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

export default connect(({ collectionEditModel }) => {
  return {
    collectionEditModel,
  };
})(createForm()(CollectionEditPage));
