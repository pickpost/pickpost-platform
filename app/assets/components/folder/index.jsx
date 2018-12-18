import React from 'react';
import PropTypes from 'prop-types';
import autobind from 'autobind-decorator';
import { Icon, message, Menu, Dropdown } from 'antd';

import './style.less';

@autobind
class Folder extends React.PureComponent {
  _handleToggleFolder() {
    const { folder, isCollapsed } = this.props;
    this.props.handleToggleFolder(folder._id, !isCollapsed);
  }

  _handleMenuClick(e) {
    const { folder } = this.props;
    if (e.key === 'edit') {
      this.props.handleEditFolder(folder);
    } else if (e.key === 'delete') {
      if (folder.children && folder.children.length > 0) {
        message.warn('删除失败，目前只能删除空分组。');
        return;
      }
      this.props.handleDeleteFolder(folder._id);
    } else if (e.key === 'file-add') {
      this.props.handleAddFile(folder);
    }
  }

  render() {
    const { folder, isCollapsed } = this.props;

    const menu = (
      <Menu onClick={this._handleMenuClick}>
        <Menu.Item key="edit"><Icon type="edit" theme="twoTone" />修改分组</Menu.Item>
        <Menu.Item key="delete"><Icon type="delete" theme="twoTone" />移除分组</Menu.Item>
        <Menu.Item key="file-add"><Icon type="file-add" theme="twoTone" />添加接口</Menu.Item>
      </Menu>
    );

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
          <Dropdown overlay={menu} placement="bottomRight">
            <div className="more-action">
              <Icon type="ellipsis" />
            </div>
          </Dropdown>

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
};

export default Folder;
