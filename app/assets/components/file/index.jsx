import React from 'react';
import PropTypes from 'prop-types';
import autobind from 'autobind-decorator';
import { Link } from 'dva/router';

import './style.less';

@autobind
class File extends React.PureComponent {
  _handleRemove() {
    this.props.handleRemoveFile(this.props.file);
  }

  _handleDelete() {
    this.props.handleDeleteFile({ ...this.props.file, _index: this.props.index });
  }

  _handleEdit() {
    this.props.handleEditFile(this.props.file);
  }

  _stopPrevent(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  render() {
    const { file, linkUrl } = this.props;
    return (
      <dd>
        <Link activeClassName="active" to={linkUrl}>
          <div className="itemurl">
            {
              file.name && [
                <span className="itemname" key="span">{file.name}</span>,
                <br key="br"/>,
              ]
            }
            <span>{file.url}</span>
          </div>
          {/* <div className="sub-action" onClick={this._stopPrevent}>
            <Icon type="edit" onClick={this._handleEdit} />
          </div> */}
        </Link>
      </dd>
    );
  }
}

File.propTypes = {
  handleRemoveFile: PropTypes.func,
  handleDeleteFile: PropTypes.func,
  handleEditFile: PropTypes.func,
  handleSelected: PropTypes.func,
  linkUrl: PropTypes.string,
  file: PropTypes.object,
  index: PropTypes.number,
  isActive: PropTypes.bool,
};

export default File;
