import React from 'react';
import { Row, Col, Pagination, Icon, Button, Tabs } from 'antd';
import { connect } from 'dva';
import { isBelong } from '../../utils/utils';
import { Link } from 'dva/router';
import Layout from '../../layout/default.jsx';
import Card from '../../components/card/index';

import './index.less';

const TabPane = Tabs.TabPane;

class Index extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      pageSize: 20,
    };
  }
  componentDidMount() {
    const { collectionsModel: { collections } } = this.props;
    if (!collections.length) {
      this.props.dispatch({
        type: 'collectionsModel/collections',
      });
    }
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

  render() {
    const { collectionsModel } = this.props;
    const { pageSize } = this.state;
    const { collections, category, currentPage } = collectionsModel;
    let filteredCollections = [];

    collections.forEach(collection => {
      // 根据 category 过滤掉对应接口集
      if (category === 'ME' && !isBelong(collection)) {
        return;
      }
      filteredCollections.push(collection);
    });
    const total = filteredCollections.length;
    const offset = (currentPage - 1) * pageSize;
    filteredCollections = filteredCollections.slice(offset, offset + pageSize);
    return (
      <Layout>
        <aside>
          <Link to="/collections" activeClassName="active">
            <Icon type="folder" />
            <div>需求</div>
          </Link>
          <Link to="/projects" activeClassName="active">
            <Icon type="appstore" />
            <div>应用</div>
          </Link>
        </aside>
        <main className="collections-page">
          <div className="index-tit">
            <div className="index-main">
              <Tabs
                activeKey={category}
                tabBarExtraContent={
                  <Link to="/collections/new">
                    <Button size="default" className="new-btn" type="primary" icon="plus">
                      新建需求
                    </Button>
                  </Link>
                }
                onChange={this.handleCategoryChange}
              >
                <TabPane tab="我已加入的" key="ME"></TabPane>
                <TabPane tab="所有的" key="ALL"></TabPane>
              </Tabs>
            </div>

          </div>
          <Row gutter={pageSize}>
            {
              filteredCollections.map(p => (
                <Col span={6} key={p._id}><Card collection={p} /></Col>
              ))
            }
          </Row>
          <Pagination defaultCurrent={1} defaultPageSize={pageSize} total={total} current={currentPage} pageSize={pageSize} onChange={this.onPageChange} />
        </main>
      </Layout>
    );
  }
}

export default connect(({ collectionsModel }) => {
  return {
    collectionsModel,
  };
})(Index);
