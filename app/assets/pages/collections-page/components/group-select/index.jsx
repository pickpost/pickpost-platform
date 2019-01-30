import React from 'react';
import { Modal } from 'antd';

import './style.less';

class GroupSelect extends React.PureComponent {
  handleSelect = (e) => {
    const { id } = e.currentTarget.dataset;
    this.props.onSelect(id);
  }

  render() {
    const { visible, onCancel, groups = [] } = this.props;
    return (
      <Modal
        visible={visible}
        title="选择要移动到的产品组"
        onCancel={onCancel}
        footer={null}
      >
        <ul className="ant-select-dropdown-menu-item-group-list">
          {
            groups.map(item => (
              <li
                key={item._id}
                className="ant-select-dropdown-menu-item"
                data-id={item._id}
                onClick={this.handleSelect}
              >
                {item.name}
              </li>
            ))
          }
        </ul>
      </Modal>
    );
  }
}

export default GroupSelect;
