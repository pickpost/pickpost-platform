import React from 'react';
import { connect } from 'dva';
import { Input, Menu, Dropdown, Button, Icon } from 'antd';
import { browserHistory, Link } from 'dva/router';
import Folder from '../../components/folder';
import File from '../../components/file';
import FolderCreate from './components/folder-create';

import './index.less';

class Api extends React.PureComponent {
  componentDidMount() {
    const { params: { collectionId } } = this.props;

    this.props.dispatch({
      type: 'collectionApisModel/setData',
      payload: {
        collectionId,
      },
    });

    this.props.dispatch({
      type: 'collectionApisModel/getApisTree',
      collectionId,
    });

    this.handleFilterDebounced = e => {
      this.props.dispatch({
        type: 'collectionApisModel/changeKeywords',
        keywords: e.target.value,
      });
    };

    // this.handleFilterDebounced = debounce(e => {
    //   e.persist();
    //   this.props.dispatch({
    //     type: 'collectionApisModel/changeKeywords',
    //     keywords: e.target.value,
    //   });
    // }, 300);
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

  handleMenuClick = e => {
    if (e.key === 'file') {
      const { collectionId } = this.props.collectionApisModel;
      const url = `/collection/${collectionId}/newapi`;

      browserHistory.push({
        pathname: url,
      });
    } else if (e.key === 'folder') {
      this.props.dispatch({
        type: 'collectionApisModel/setFolderModal',
        visible: true,
      });
    }
  }

  saveFormRef = formRef => {
    this.formRef = formRef;
  }

  handleCancel = () => {
    this.props.dispatch({
      type: 'collectionApisModel/setFolderModal',
      visible: false,
    });
  }

  handleCreateFolder = () => {
    const form = this.formRef.props.form;
    const { collectionId } = this.props.collectionApisModel;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }

      this.props.dispatch({
        type: values.folderId ? 'collectionApisModel/updateFolder' : 'collectionApisModel/createFolder',
        form,
        parentId: '',
        collectionId,
        name: values.name,
        folderId: values.folderId,
      });
    });
  }

  handleToggleCollection = (id, collapsed) => {
    const { collectionApis } = this.props.collectionApisModel;
    this.props.dispatch({
      type: 'collectionApisModel/setData',
      payload: {
        collectionApis: collectionApis.map(item => ({
          ...item,
          isCollapsed: item._id === id ? !!collapsed : !!item.isCollapsed,
        })),
      },
    });
  }

  handleEditCollection = folder => {
    this.props.dispatch({
      type: 'collectionApisModel/setFolderModal',
      visible: true,
    });
    this.formRef.props.form.setFieldsValue({
      folderId: folder._id,
      name: folder.name,
    });
  }

  handleDeleteCollection = folderId => {
    this.props.dispatch({
      type: 'collectionApisModel/deleteFolder',
      folderId,
    });
  }

  render() {
    const { collectionApisModel, collectionModel, params: { collectionId, apiId } } = this.props;
    const { filterApis, keywords, showFolderModal, collectionApis, folderId } = collectionApisModel;

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
      <div className="collection-apis-page">
        <div className="folder-tree">
          <div className="search-row">
            <Input placeholder="Search" onChange={this.handleFilterDebounced} />
            <Dropdown overlay={menu} placement="bottomRight">
              <Button className="dropdown-btn" type="dashed">
                <Icon className="add-entrance" type="plus-circle" theme="twoTone" />
                <Icon className="dropdown-icon" type="caret-down" />
              </Button>
            </Dropdown>
          </div>
          <Link className="all-apis" activeClassName="active" to={`/collection/${collectionId}/apis/list`}>
            <Icon type="bars" />
            全部接口
          </Link>
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
                    <File key={api._id} file={api} linkUrl={`/collection/${collectionId}/apis/doc/${api.apiId}`} />
                  ))
                }
              </Folder>
            ))
          }
        </div>
        <div className="api-main">
          {
            apiId && (
              <div className="tabs-header">
                <Link to={`/collection/${collectionId}/apis/list`} activeClassName="active">
                  <Icon type="left" /> 返回列表
                </Link>
                <div className="split-line"></div>
                <Link to={`/collection/${collectionId}/apis/doc/${apiId}`} activeClassName="active">
                  <Icon type="profile" /> 文档
                </Link>
                <Link to={`/collection/${collectionId}/apis/test/${apiId}`} activeClassName="active">
                  <Icon type="rocket" /> 测试
                </Link>
                <Link to={`/collection/${collectionId}/apis/mock/${apiId}`} activeClassName="active">
                  <Icon type="api" /> Mock
                </Link>
                <Link to={`/collection/${collectionId}/apis/setting/${apiId}`} activeClassName="active">
                  <Icon type="setting" /> 设置
                </Link>
              </div>
            )
          }

          {this.props.children}
        </div>
        <FolderCreate
          wrappedComponentRef={this.saveFormRef}
          folderId={folderId}
          visible={showFolderModal}
          onCancel={this.handleCancel}
          onCreate={this.handleCreateFolder}
        />
      </div>
    );
  }
}

export default connect(({ collectionModel, collectionApisModel }) => {
  return {
    collectionApisModel,
    collectionModel,
  };
})(Api);
