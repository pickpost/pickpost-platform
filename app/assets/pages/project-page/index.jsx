import React from 'react';
import { Icon } from 'antd';
import { connect } from 'dva';
import { Link } from 'dva/router';
import Layout from '../../layout/default.jsx';

import './style.less';

class Project extends React.Component {
  render() {
    const { params: { projectId } } = this.props;

    return (
      <Layout uplevel={'/projects'}>
        <aside>
          <Link to={`/project/${projectId}/apis/list`} activeClassName="active">
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
