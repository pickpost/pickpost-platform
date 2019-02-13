import React from 'react';
import { Icon } from 'antd';
import { connect } from 'dva';
import { Link } from 'dva/router';
import get from 'lodash/get';
import Layout from '../../layout/default.jsx';

import './style.less';

class Project extends React.Component {
  componentDidMount() {
    const { params: { projectId } } = this.props;
    this.props.dispatch({
      type: 'projectModel/projectDetail',
      projectId,
    });
  }

  isMatchUrl = () => {
    return /\/project\/.+\/apis/.test(location.href);
  }

  render() {
    const { params: { projectId }, projectModel } = this.props;

    return (
      <Layout uplevel={`/projects?space=${get(projectModel, 'project.space.alias')}`}>
        <aside>
          <Link to={`/project/${projectId}/apis/list`} className={this.isMatchUrl() ? 'active' : ''}>
            <Icon type="bars" />
            <div>接口</div>
          </Link>
          <Link to={`/project/${projectId}/setting`} activeClassName="active">
            <Icon type="setting" />
            <div>设置</div>
          </Link>
        </aside>
        <main id="project">
          {this.props.children}
        </main>
      </Layout>
    );
  }
}

export default connect(({ projectModel }) => {
  return {
    projectModel,
  };
})(Project);
