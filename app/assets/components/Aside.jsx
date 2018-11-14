import React from 'react';
import autobind from 'autobind-decorator';
import { Icon } from 'antd';
import { Link } from 'dva/router';

@autobind
class Aside extends React.Component {
  render() {
    const { apiId, belong } = this.props;
    return (
      <aside>
        <Link to={`/api-detail/${apiId}/doc${belong ? `?belong=${belong}` : ''}`} activeClassName="active">
          <Icon type="profile" />
          <div>文档</div>
        </Link>
        <Link to={`/api-detail/${apiId}/test${belong ? `?belong=${belong}` : ''}`} activeClassName="active">
          <Icon type="rocket" />
          <div>测试</div>
        </Link>
        <Link to={`/api-detail/${apiId}/mock${belong ? `?belong=${belong}` : ''}`} activeClassName="active">
          <Icon type="api" />
          <div>Mock</div>
        </Link>
        <Link to={`/collection/${belong.split('_')[1]}/editapi/${apiId}`} activeClassName="active">
          <Icon type="setting" />
          <div>设置</div>
        </Link>
      </aside>
    );
  }
}

export default Aside;
