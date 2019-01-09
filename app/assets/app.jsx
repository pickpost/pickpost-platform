// import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import dva from 'dva';
import { Router, Route, browserHistory } from 'dva/router';
import './app.less';

// Pages && Models
import APIEditPage from './pages/api-edit-page';
import APIEditModel from './pages/api-edit-page/store';

import APIDocPage from './pages/api-doc-page';
import APIDocModel from './pages/api-doc-page/store';

import APITestPage from './pages/api-test-page';
import APITestModel from './pages/api-test-page/store';

import APIMockPage from './pages/api-mock-page';
import APIMockModel from './pages/api-mock-page/store';

import APISettingPage from './pages/api-setting-page';
import APISettingModel from './pages/api-setting-page/store';

import APIListPage from './pages/api-list-page';
import APIListModel from './pages/api-list-page/store';

import CollectionEditPage from './pages/collection-edit-page';
import CollectionEditModel from './pages/collection-edit-page/store';

import CollectionsPage from './pages/collections-page';
import CollectionModel from './pages/collection-page/store';

import CollectionPage from './pages/collection-page';
import CollectionsModel from './pages/collections-page/store';

import CollectionApisPage from './pages/collection-apis-page';
import CollectionApisModel from './pages/collection-apis-page/store';

import CollectionMemebersPage from './pages/collection-members-page';
import CollectionMemebersModel from './pages/collection-members-page/store';

import CollectionSettingPage from './pages/collection-setting-page';
import CollectionSettingModel from './pages/collection-setting-page/store';

import ProjectApisPage from './pages/project-apis-page';
import ProjectApisModel from './pages/project-apis-page/store';

import ProjectEditPage from './pages/project-edit-page';
import ProjectEditModel from './pages/project-edit-page/store';

import ProjectPage from './pages/project-page';
import ProjectModel from './pages/project-page/store';

import ProjectSettingPage from './pages/project-setting-page';
import ProjectSettingModel from './pages/project-setting-page/store';

import ProjectsPage from './pages/projects-page';
import ProjectsModel from './pages/projects-page/store';

// 1. Initialize
const app = dva({
  history: browserHistory,
});

// 2. Plugins
// app.use(createLoading());

// 3. Model
app.model(APIEditModel);
app.model(APIDocModel);
app.model(APITestModel);
app.model(APIMockModel);
app.model(APISettingModel);
app.model(APIListModel);

app.model(CollectionEditModel);
app.model(CollectionModel);
app.model(CollectionsModel);

app.model(CollectionMemebersModel);
app.model(CollectionApisModel);
app.model(CollectionSettingModel);

app.model(ProjectEditModel);
app.model(ProjectModel);
app.model(ProjectsModel);
app.model(ProjectSettingModel);
app.model(ProjectApisModel);

export default class Container extends React.Component {
  componentDidMount() {
    // 4. Router
    app.router(({ history }) => {
      return (
        <Router history={history}>
          <Route path="/workspace" component={CollectionsPage} context={context} />
          {/* 列表页 */}
          <Route path="/collections" component={CollectionsPage} context={context} />
          <Route path="/projects" component={ProjectsPage} context={context} />
          {/* 接口创建 */}
          <Route path="/api_fe/create" component={APIEditPage} context={context} />
          {/* 需求、项目创建 */}
          <Route path="/collections/new" component={CollectionEditPage} context={context} />
          <Route path="/projects/new" component={ProjectEditPage} context={context} />
          {/* 需求维度下的接口操作页面 */}
          <Route path="/collection/:collectionId" component={CollectionPage} context={context}>
            <Route path="apis" component={CollectionApisPage} context={context}>
              <Route path="list" component={APIListPage} context={context} />
              <Route path="doc/:apiId" component={APIDocPage} context={context} />
              <Route path="test/:apiId" component={APITestPage} context={context} />
              <Route path="mock/:apiId" component={APIMockPage} context={context} />
              <Route path="setting/:apiId" component={APISettingPage} context={context} />
            </Route>
            <Route path="setting" component={CollectionSettingPage} context={context} />
            <Route path="members" component={CollectionMemebersPage} context={context} />
          </Route>
          {/* 后端系统维度下的接口操作页面 */}
          <Route path="/project/:projectId" component={ProjectPage} context={context}>
            <Route path="apis" component={ProjectApisPage} context={context}>
              <Route path="list" component={APIListPage} context={context} />
              <Route path="doc/:apiId" component={APIDocPage} context={context} />
              <Route path="test/:apiId" component={APITestPage} context={context} />
              <Route path="mock/:apiId" component={APIMockPage} context={context} />
              <Route path="setting/:apiId" component={APISettingPage} context={context} />
            </Route>
            <Route path="setting" component={ProjectSettingPage} context={context} />
          </Route>
        </Router>
      );
    });

    // 5. Start
    app.start(this.container);
  }

  render() {
    return (<div style={{ minWidth: '1260px', height: '100%' }} ref={ dom => { this.container = dom; }} />);
  }
}

ReactDOM.render(<Container />, document.getElementById('root'));
