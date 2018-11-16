import React from 'react';
import { connect } from 'dva';
import { Input, Tree, Icon } from 'antd';
import { Link, browserHistory } from 'dva/router';

import Layout from '../../layout/default.jsx';

const DirectoryTree = Tree.DirectoryTree;
const TreeNode = Tree.TreeNode;
const Search = Input.Search;

import './index.less';

class Api extends React.PureComponent {
  componentDidMount() {
    const { params: { apiId } } = this.props;
    // 根据 collection_id 请求列表数据
    const belong = this.getBelongQuery();
    this.props.dispatch({
      type: 'apiPageModel/detail',
      apiId,
    });
    this.props.dispatch({
      type: 'collectionModel/collectionApis',
      id: belong.split('_')[1],
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.params.apiId !== nextProps.params.apiId) {
      this.props.dispatch({
        type: 'apiPageModel/detail',
        apiId: nextProps.params.apiId,
      });
    }
  }

  handleSave = () => {
    this.props.form.validateFields((err, values) => {
      this.props.dispatch({
        type: 'apiPageModel/saveAPI',
        api: values,
      });
    });
  }

  getTypeByMethods(methods) {
    if (!Array.isArray(methods)) {
      return 'HTTP';
    }

    if (methods.indexOf('RPC') >= 0) {
      return 'RPC';
    } else if (methods.indexOf('SPI') >= 0) {
      return 'SPI';
    }
    return 'HTTP';
  }

  getBelongQuery() {
    const { belong } = this.props.location.query;
    return belong || '';
  }

  getBelong() {
    let { belong } = this.props.location.query;
    const { currentAPI: { projectId } } = this.props.apiPageModel;
    belong = belong || `project_${projectId}`;
    return belong;
  }

  getUplevel() {
    return '/' + this.getBelong().replace('_', '/') + '?tab=api';
  }

  handleChangeAPIPage = item => {
    const belong = this.getBelongQuery();

    browserHistory.push({
      pathname: `/api-detail/${item[0]}/doc`,
      query: {
        belong,
      },
    });
  }

  render() {
    const { apiPageModel, collectionModel } = this.props;
    const { currentAPI } = apiPageModel;
    if (!currentAPI._id) {
      return null;
    }

    const belong = this.getBelongQuery();
    const collectionId = belong.split('_')[1];

    return (
      <Layout uplevel={this.getUplevel()}>
        <aside>
          <Link to={`/collection/${collectionId}?tab=api`} className="active" activeClassName="active">
            <Icon type="bars" />
            <div>接口</div>
          </Link>
          <Link to={`/collection/${collectionId}?tab=member`} activeClassName="active">
            <Icon type="team" />
            <div>成员</div>
          </Link>
          <Link to={`/collection/${collectionId}?tab=setting`} activeClassName="active">
            <Icon type="setting" />
            <div>设置</div>
          </Link>
        </aside>
        <div className="folder-tree">
          <Search style={{ marginBottom: 8 }} placeholder="Search" />
          <DirectoryTree
            multiple
            defaultExpandAll
            selectedKeys={[ currentAPI._id ]}
            onSelect={this.handleChangeAPIPage}
            onExpand={this.onExpand}
          >
            {
              collectionModel.apis.map(api => (
                <TreeNode title={api.url} key={api._id} isLeaf />
              ))
            }
          </DirectoryTree>
        </div>
        <main className="api-main">
          <div className="tabs-header">
            <Link to={`/api-detail/${currentAPI._id}/doc?belong=${belong}`} activeClassName="active">
              <Icon type="profile" /> 文档
            </Link>
            <Link to={`/api-detail/${currentAPI._id}/test?belong=${belong}`} activeClassName="active">
              <Icon type="rocket" /> 测试
            </Link>
            <Link to={`/api-detail/${currentAPI._id}/mock?belong=${belong}`} activeClassName="active">
              <Icon type="api" /> Mock
            </Link>
            <Link to={`/api-detail/${currentAPI._id}/setting?belong=${belong}`} activeClassName="active">
              <Icon type="setting" /> 设置
            </Link>
          </div>
          <div>
            {this.props.children}
          </div>
        </main>
      </Layout>
    );
  }
}

export default connect(({ apiPageModel, collectionModel }) => {
  return {
    apiPageModel,
    collectionModel,
  };
})(Api);
