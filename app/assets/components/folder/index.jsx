import React from 'react';
import PropTypes from 'prop-types';
import autobind from 'autobind-decorator';
import { Icon, message, Popconfirm } from 'antd';

import './style.less';

@autobind
class Folder extends React.PureComponent {
  _handleToggleFolder() {
    const { folder, isCollapsed } = this.props;
    this.props.handleToggleFolder(folder._id, !isCollapsed);
  }

  _handleDeleteFolder() {
    const { folder } = this.props;
    if (folder.children && folder.children.length > 0) {
      message.warn('删除失败，目前只能删除空分组。');
      return;
    }
    this.props.handleDeleteFolder(folder._id);
  }

  _handleEditFolder() {
    const { folder } = this.props;
    this.props.handleEditFolder(folder);
  }

  _handleAddFile() {
    const { folder } = this.props;
    this.props.handleAddFile({
      id: folder._id,
    });
  }

  _handleEditFile(file) {
    const { folder, type } = this.props;
    this.props.handleEditFile({
      collectionId: type === 'collection' ? folder._id : '',
      projectId: file.projectId,
      apiId: file._id,
    });
  }

  _handleRemoveFile(file) {
    this.props.handleRemoveFile({
      id: file._id,
      projectId: file.projectId,
      collectionId: file.collectionId,
    });
  }

  _handleDeleteFile(file) {
    const { folder, type } = this.props;
    this.props.handleDeleteFile({
      id: file._id,
      projectId: file.projectId,
      collectionId: type === 'collection' ? folder._id : '',
      nextId: folder.apis[file._index + 1] ? folder.apis[file._index + 1]._id : '',
    });
  }

  _handleSetFolder() {
    const { folder } = this.props;
    this.props.handleSetFolder({
      id: folder._id,
      name: folder.name,
    });
  }

  _stopPrevent(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  render() {
    const { folder, isCollapsed } = this.props;

    return (
      <dl key={folder._id} className="file-tree">
        <dt data-value={folder._id} onClick={this._handleToggleFolder}>
          {
            isCollapsed ? <Icon type="folder" /> : <Icon type="folder-open" />
          }
          <div className="detail">
            <h5>{folder.name}</h5>
            <p>
              {(folder.children || []).length}个接口 {folder.desc ? `(${folder.desc})` : ''}
            </p>
          </div>
          <div className="more-action" onClick={this._stopPrevent}>
            {
              <Icon type="setting" onClick={this._handleEditFolder} />
            }
            {
              <Popconfirm title="确定移除该分组?" onConfirm={this._handleDeleteFolder}>
                <Icon type="delete" />
              </Popconfirm>
            }
            <Icon type="file-add" onClick={this._handleAddFile} />
          </div>
        </dt>
        {
          !isCollapsed && (
            this.props.children
          )
        }
      </dl>
    );
  }
}

Folder.propTypes = {
  folder: PropTypes.object,
  isActive: PropTypes.bool,
  isCollapsed: PropTypes.bool,

  handleToggleFolder: PropTypes.func,
  handleEditFolder: PropTypes.func,
  handleDeleteFolder: PropTypes.func,
  handleAddFile: PropTypes.func,
  handleRemoveFile: PropTypes.func,
  handleDeleteFile: PropTypes.func,
  handleSetFolder: PropTypes.func,
};

export default Folder;
