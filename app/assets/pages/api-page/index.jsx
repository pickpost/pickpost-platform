import React from 'react';
import { connect } from 'dva';
import { Input, Menu, Dropdown, Button, Icon } from 'antd';
import { Link, browserHistory } from 'dva/router';
import Layout from '../../layout/default.jsx';
import Folder from '../../components/folder';
import File from '../../components/file';
import FolderCreate from './components/folder-create';

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
      type: 'apiPageModel/setData',
      payload: {
        collectionId: belong.split('_')[1],
      },
    });

    this.props.dispatch({
      type: 'apiPageModel/getApisTree',
      collectionId: belong.split('_')[1],
    });

    this.handleFilterDebounced = e => {
      this.props.dispatch({
        type: 'apiPageModel/changeKeywords',
        keywords: e.target.value,
      });
    };

    // this.handleFilterDebounced = debounce(e => {
    //   e.persist();
    //   this.props.dispatch({
    //     type: 'apiPageModel/changeKeywords',
    //     keywords: e.target.value,
    //   });
    // }, 300);
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

  handleMenuClick = e => {
    if (e.key === 'file') {
      const { collectionId } = this.props.apiPageModel;
      const url = `/collection/${collectionId}/newapi`;

      browserHistory.push({
        pathname: url,
      });
    } else if (e.key === 'folder') {
      this.props.dispatch({
        type: 'apiPageModel/setFolderModal',
        visible: true,
      });
    }
  }

  saveFormRef = formRef => {
    this.formRef = formRef;
  }

  handleCancel = () => {
    this.props.dispatch({
      type: 'apiPageModel/setFolderModal',
      visible: false,
    });
  }

  handleCreateFolder = () => {
    const form = this.formRef.props.form;
    const { collectionId } = this.props.apiPageModel;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }

      this.props.dispatch({
        type: 'apiPageModel/createFolder',
        form,
        parentId: '',
        collectionId,
        name: values.title,
      });
    });
  }

  handleToggleCollection = (id, collapsed) => {
    const { collectionApis } = this.props.apiPageModel;
    this.props.dispatch({
      type: 'apiPageModel/setData',
      payload: {
        collectionApis: collectionApis.map(item => ({
          ...item,
          isCollapsed: item._id === id ? !!collapsed : !!item.isCollapsed,
        })),
      },
    });
  }

  render() {
    const { apiPageModel, collectionModel } = this.props;
    const { currentAPI, filterApis, keywords, showFolderModal, collectionId, collectionApis } = apiPageModel;
    if (!currentAPI._id) {
      return null;
    }

    const belong = this.getBelongQuery();
    const showApis = keywords ? filterApis : collectionModel.apis;
    const folder = {
      name: '默认接口',
      apis: showApis,
    };

    const menu = (
      <Menu onClick={this.handleMenuClick}>
        <Menu.Item key="file"><Icon type="plus-circle" theme="twoTone" />新增接口</Menu.Item>
        <Menu.Item key="folder"><Icon type="folder" theme="twoTone" />新增分组</Menu.Item>
      </Menu>
    );

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
          <div className="search-row">
            <Input style={{ marginBottom: 8 }} placeholder="Search" onChange={this.handleFilterDebounced} />
            <Dropdown overlay={menu} placement="bottomRight">
              <Button className="dropdown-btn" type="dashed">
                <Icon className="add-entrance" type="plus-circle" theme="twoTone" />
                <Icon className="dropdown-icon" type="caret-down" />
              </Button>
            </Dropdown>
          </div>
          {
            collectionApis.map(folder => (
              <Folder
                key={folder._id}
                folder={folder}
                isCollapsed={folder.isCollapsed}
                handleToggleFolder={this.handleToggleCollection}
                handleEditFolder={this.handleEditCollection}
                handleDeleteFolder={this.handleDeleteCollection}
                handleAddFile={this.handleAddFile}
                handleSetFolder={this.handleSetFolder}
              >
                {
                  (folder.children || []).map(api => (
                    <File key={api._id} file={api} linkUrl={`/api-detail/${api.apiId}/doc?belong=${belong}`} />
                  ))
                }
              </Folder>
            ))
          }
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
        <FolderCreate
          wrappedComponentRef={this.saveFormRef}
          visible={showFolderModal}
          onCancel={this.handleCancel}
          onCreate={this.handleCreateFolder}
        />
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
