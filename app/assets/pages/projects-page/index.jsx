import React from 'react';
import moment from 'moment';
import { Icon, Button, Table } from 'antd';
import { connect } from 'dva';
import { browserHistory, Link } from 'dva/router';
import Layout from '../../layout/default.jsx';

import './style.less';

class ProjectsPage extends React.PureComponent {
  projectColumns = [{
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    width: '260px',
    render: (v, _api) => {
      return <div className="project-title">
        <h3>{v}</h3>
        <span>{_api.desc}</span>
      </div>;
    },
  }, {
    title: '接口数',
    dataIndex: 'apis',
    key: 'apis',
  }, {
    title: '最近更新',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    render: updatedAt => {
      return moment(updatedAt).format('YYYY-MM-DD HH:mm:ss');
    },
  }, {
    title: '管理员',
    dataIndex: 'owners',
    key: 'owners',
  }];

  componentDidMount() {
    const { location: { query } } = this.props;
    this.props.dispatch({
      type: 'projectsModel/projects',
      spaceAlias: query.space,
    });
  }

  handleCategoryChange(category) {
    this.props.dispatch({
      type: 'projectsModel/setData',
      data: {
        category,
      },
    });
  }

  render() {
    const { projectsModel, location: { query } } = this.props;
    const { projects } = projectsModel;
    const projectData = projects.map(_v => {
      return {
        key: _v._id,
        name: _v.name,
        desc: _v.desc,
        updateAt: _v.updateAt,
        owners: _v.owners.map(d => d.label).join(','),
        apis: _v.apis.length,
      };
    });

    return (
      <Layout>
        <aside>
          <Link to={`/collections?space=${query.space}`} activeClassName="active">
            <Icon type="folder" />
            <div>需求</div>
          </Link>
          <Link to={`/projects?space=${query.space}`} activeClassName="active">
            <Icon type="appstore" />
            <div>应用</div>
          </Link>
        </aside>
        <main className="projects-main">
          <div className="index-tit">
            <div className="pname">
              <h3>
                应用列表
              </h3>
              <p>
                应用是指后端系统，名称与后端系统名保持一致。
              </p>
            </div>
            <Link to={`/projects/new?space=${query.space}`} className="entrance">
              <Button className="new-btn" type="primary" icon="plus">
                新建应用
              </Button>
            </Link>
          </div>
          <Table
            className="projects-table"
            columns={this.projectColumns}
            dataSource={projectData}
            onRow={record => {
              return {
                onClick: () => {
                  browserHistory.push({
                    pathname: `/project/${record.key}/apis/list`,
                  });
                },
              };
            }}
          />
        </main>
      </Layout>
    );
  }
}

export default connect(({ projectsModel }) => {
  return {
    projectsModel,
  };
})(ProjectsPage);
