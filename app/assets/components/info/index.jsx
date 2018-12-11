import React from 'react';
import moment from 'moment';
import { Tag } from 'antd';
import { TypeColorMap } from '../../utils/constants';

import './style.less';

class Info extends React.Component {
  render() {
    const { apiType, title, desc, updatedAt, url, children } = this.props;
    return (
      <div className="info-tit">
        <div className="info-main">
          <h3>
            {title} {apiType && <Tag color={TypeColorMap[apiType]}>{apiType}</Tag>}
          </h3>
          <p className="tit">
            {url}
          </p>
          {
            desc && (
              <p className="desc">{desc}</p>
            )
          }
          {
            updatedAt && (
              <p className="timeago">
                最近更新时间：{moment(updatedAt).format('YYYY-MM-DD HH:mm:ss')}
              </p>
            )
          }
        </div>
        {children}
      </div>
    );
  }
}

export default Info;
