import React from 'react';
import { connect } from 'dva';
import { Icon } from 'antd';
import { Link } from 'dva/router';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import './style.less';

class Api extends React.PureComponent {
  componentDidMount() {
    const { params: { projectId } } = this.props;

    this.props.dispatch({
      type: 'projectApisModel/setData',
      payload: {
        projectId,
      },
    });
  }

  render() {
    const { params: { projectId, apiId } } = this.props;

    return (
      <div className="collection-apis-page">
        <div className="api-main">
          {
            apiId && (
              <div className="tabs-header">
                <Link to={`/project/${projectId}/apis/list?groupId=${this.groupId || ''}`} activeClassName="active">
                  <Icon type="left" /> 返回列表
                </Link>
                <div className="split-line"></div>
                <Link to={`/project/${projectId}/apis/doc/${apiId}`} activeClassName="active">
                  <Icon type="profile" /> 文档
                </Link>
                <Link to={`/project/${projectId}/apis/test/${apiId}`} activeClassName="active">
                  <Icon type="rocket" /> 测试
                </Link>
                <Link to={`/project/${projectId}/apis/mock/${apiId}`} activeClassName="active">
                  <Icon type="api" /> Mock
                </Link>
                <Link to={`/project/${projectId}/apis/setting/${apiId}`} activeClassName="active">
                  <Icon type="setting" /> 设置
                </Link>
              </div>
            )
          }

          {this.props.children}
        </div>
      </div>
    );
  }
}

export default connect(({ projectApisModel }) => {
  return {
    projectApisModel,
  };
})(DragDropContext(HTML5Backend)(Api));
