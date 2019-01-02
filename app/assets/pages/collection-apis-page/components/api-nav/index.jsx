import React from 'react';
import { string } from 'prop-types';
import { Icon } from 'antd';
import { Link } from 'dva/router';
import { apiTypes as API_TYPES } from '../../../../../common/constants';

export default class ApiNav extends React.Component {
  static propTypes = {
    groupId: string,
    apiId: string,
    collectionId: string,
  }

  static defaultProps = {
    groupId: '',
  }

  componentDidMount() {
    const { params, collectionId, dispatch } = this.props;
    if (params && params.apiId) {
      dispatch({
        type: 'collectionApisModel/detail',
        apiId: params.apiId,
        collectionId,
      });
    }
  }

  renderModules() {
    const { collectionApisModel: { currentAPI: { apiType } }, collectionId, apiId } = this.props;
    const apiTypeConfig = API_TYPES.find(v => v.type === apiType) || {};
    const supportModules = apiTypeConfig.supportModules || [];
    return (
      <div>
        { supportModules.includes('doc') && <Link to={`/collection/${collectionId}/apis/doc/${apiId}`} activeClassName="active">
          <Icon type="profile" /> 文档
        </Link> }
        { supportModules.includes('test') && <Link to={`/collection/${collectionId}/apis/test/${apiId}`} activeClassName="active">
          <Icon type="rocket" /> 测试
        </Link> }
        { supportModules.includes('mock') && <Link to={`/collection/${collectionId}/apis/mock/${apiId}`} activeClassName="active">
          <Icon type="api" /> Mock
        </Link>}
        { supportModules.includes('setting') && <Link to={`/collection/${collectionId}/apis/setting/${apiId}`} activeClassName="active">
          <Icon type="setting" /> 设置
        </Link>}
      </div>
    );
  }

  render() {
    const { collectionId, groupId } = this.props;
    return (
      <div>
        <div className="tabs-header">
          <Link to={`/collection/${collectionId}/apis/list?groupId=${groupId}`} activeClassName="active">
            <Icon type="left" /> 返回列表
          </Link>
          <div className="split-line"></div>
          {
            this.renderModules()
          }
        </div>
      </div>
    );
  }
}
