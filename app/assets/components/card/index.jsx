import React from 'react';
import { Link } from 'dva/router';
import moment from 'moment';
import './style.less';

export default class Card extends React.PureComponent {
  render() {
    const { name, desc, updatedAt, owners, _id, apisCount } = this.props.collection;
    return (
      <Link to={`/collection/${_id}/apis/list`}>
        <div className="index-card">
          <div className="tit ellipsis">{name}</div>
          <div className="desc ellipsis">{desc ? desc + ' | ' : ''} {apisCount}个接口</div>
          <div className="time ellipsis">最近更新：{moment(updatedAt).format('YYYY-MM-DD HH:mm:ss')}</div>
          <div className="name ellipsis">管理员：{owners.map(o => o.label).join('、')}</div>
        </div>
      </Link>
    );
  }
}
