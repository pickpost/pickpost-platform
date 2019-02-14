import React from 'react';
import { Row, Col, Icon, Button, Tabs} from 'antd';
import { connect } from 'dva';
import { Link, browserHistory } from 'dva/router';
import { isBelong } from '../../utils/utils';
import Layout from '../../layout/default.jsx';
import Card from '../../components/card';
import GroupCreate from './components/group-create';
import GroupSelect from './components/group-select';

import './style.less';

const TabPane = Tabs.TabPane;

class Index extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      pageSize: 20,
    };
  }

  componentDidMount() {
    const { collectionsModel: { collections }, location: { query } } = this.props;
    if (!collections.length) {
      this.props.dispatch({
        type: 'collectionsModel/collections',
        spaceAlias: query.space,
      });
    }
  }

  saveFormRef = formRef => {
    this.formRef = formRef;
  }

  handleCategoryChange = category => {
    this.props.dispatch({
      type: 'collectionsModel/setCurrentPage',
      currentPage: 1,
    });
    this.props.dispatch({
      type: 'collectionsModel/setData',
      data: {
        category,
      },
    });
  }

  onPageChange = (page, pageSize) => {
    this.setState({ pageSize });
    this.props.dispatch({
      type: 'collectionsModel/setCurrentPage',
      currentPage: page,
    });
  }

  handleShowGroupCreate = () => {
    this.props.dispatch({
      type: 'collectionsModel/setFolderModal',
      visible: true,
    });
  }

  handleCancel = () => {
    this.props.dispatch({
      type: 'collectionsModel/setFolderModal',
      visible: false,
    });
  }

  handleCreateFolder = () => {
    const form = this.formRef.props.form;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }

      this.props.dispatch({
        type: 'collectionsModel/createFolder',
        name: values.name,
        _id: values.folderId,
        spaceAlias: this.props.location.query.space,
        form,
      });
    });
  }

  handleGotoCreateCollection = () => {
    browserHistory.push({
      pathname: '/collections/new',
      query: {
        space: this.props.location.query.space,
      },
    });
  }

  handleShowGroupSelect = (collectionId) => {
    this.props.dispatch({
      type: 'collectionsModel/setData',
      data: {
        groupSelectVisible: true,
        currentCollectionId: collectionId,
      },
    });
  }

  handleEditGroup = (e) => {
    const { id, name } = e.currentTarget.dataset;
    const form = this.formRef.props.form;
    form.setFieldsValue({
      folderId: id,
      name,
    });
    this.handleShowGroupCreate();
  }

  handleHideChangeGroup = () => {
    this.props.dispatch({
      type: 'collectionsModel/setData',
      data: {
        groupSelectVisible: false,
        currentCollectionId: '',
      },
    });
  }

  handleChangeGroup = (groupId) => {
    const { currentCollectionId } = this.props.collectionsModel;
    this.props.dispatch({
      type: 'collectionsModel/changeGroup',
      collectionId: currentCollectionId,
      groupId,
    });
  }

  render() {
    const { collectionsModel, location: { query } } = this.props;
    const { pageSize } = this.state;
    const { collections, groups, category, showFolderModal, groupSelectVisible } = collectionsModel;
    const filteredCollections = [];

    collections.forEach(collection => {
      // 根据 category 过滤掉对应接口集
      if (category === 'ME' && !isBelong(collection)) {
        return;
      }

      filteredCollections.push(collection);
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
        <main className="collections-page">
          <div className="header-tabs">
            <Tabs
              activeKey={category}
              tabBarExtraContent={
                <div className="add-actions">
                  <Button onClick={this.handleShowGroupCreate} size="default" className="new-btn" type="primary" icon="plus">
                    新建产品组
                  </Button>
                  <Button onClick={this.handleGotoCreateCollection} size="default" className="new-btn" type="primary" icon="plus">
                    新建产品
                  </Button>
                </div>
              }
              onChange={this.handleCategoryChange}
            >
              <TabPane tab="我已加入的" key="ME"></TabPane>
              <TabPane tab="所有的" key="ALL"></TabPane>
            </Tabs>
          </div>
          {
            filteredCollections.map(groupItem => (
              <div key={groupItem._id}>
                <h3 className="group-name" data-id={groupItem._id} data-name={groupItem.name} onClick={this.handleEditGroup}>
                  {groupItem.name}
                  <Icon type="edit" />
                </h3>
                <Row gutter={pageSize}>
                  {
                    (groupItem.children || []).map(p => (
                      <Col span={6} key={p._id}>
                        <Card collection={p} onChangeGroup={this.handleShowGroupSelect} />
                      </Col>
                    ))
                  }
                </Row>
              </div>
            ))
          }
        </main>
        <GroupCreate
          wrappedComponentRef={this.saveFormRef}
          visible={showFolderModal}
          onCancel={this.handleCancel}
          onCreate={this.handleCreateFolder}
        />
        <GroupSelect
          visible={groupSelectVisible}
          groups={groups}
          onSelect={this.handleChangeGroup}
          onCancel={this.handleHideChangeGroup}
        />
      </Layout>
    );
  }
}

export default connect(({ collectionsModel }) => {
  return {
    collectionsModel,
  };
})(Index);
