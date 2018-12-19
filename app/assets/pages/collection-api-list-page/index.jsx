import React from 'react';
import { Table, Button, Popover, Tag, Form } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import { browserHistory, Link } from 'dva/router';
import Info from '../../components/info';
import { TypeColorMap } from '../../../common/constants';
import Dragrow from './components/dragrow';

import './style.less';

class Collection extends React.PureComponent {
  constructor(props, context) {
    super(props, context);
    this.state = {
      activeKey: 'collection',
      showMoreSettings: false,
      showModal: false,
      memberList: [],
    };

    const { collectionId } = props.params;
    this.apisColumns = [{
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    }, {
      title: '唯一标识',
      dataIndex: 'url',
      width: '240px',
      key: 'url',
      render: (_, item) => {
        return (<div className="ellipsis" title={item.url}><Tag color={TypeColorMap[item.apiType]}>{item.apiType}</Tag>{item.url}</div>);
      },
    }, {
      title: '所属应用',
      dataIndex: 'projectName',
      key: 'projectName',
    }, {
      title: '最近更新',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: updatedAt => {
        return moment(updatedAt).format('YYYY-MM-DD HH:mm');
      },
    }, {
      title: '创建人',
      dataIndex: 'creater',
      width: '80px',
      key: 'creater',
    }, {
      title: '操作',
      dataIndex: 'operation',
      width: '120px',
      key: 'operation',
      render: (_, api) => {
        const DeleteFileButtons = (
          <div className="action-btns">
            <Button type="default" onClick={this.handleRemoveAPI.bind(this, api)}>从需求移除接口</Button>
            <Button type="danger" onClick={this.handleDeleteAPI.bind(this, api)}>从应用删除接口</Button>
          </div>
        );
        return (
          <div className="actions" onClick={e => e.stopPropagation()}>
            <Link to={`/collection/${collectionId}/apis/doc/${api._id}`}>详情</Link>
            <Popover overlayClassName="action-btns-wrapper" trigger="click" content={DeleteFileButtons}>
              <Link to="">删除</Link>
            </Popover>
          </div>
        );
      },
    }];
  }

  componentDidMount() {
    const { collectionId } = this.props.params;

    // 获取需求信息
    this.props.dispatch({
      type: 'collectionApiListModel/collection',
      id: collectionId,
    });
    // 获取需求内接口列表
    this.props.dispatch({
      type: 'collectionApiListModel/collectionApis',
      id: collectionId,
      groupId: this.props.location.query.groupId || '',
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.location.query.groupId !== nextProps.location.query.groupId) {
      this.props.dispatch({
        type: 'collectionApiListModel/collectionApis',
        id: nextProps.params.collectionId,
        groupId: nextProps.location.query.groupId,
      });
    }
  }

  handleDeleteAPI = data => {
    const { collectionId } = this.props.params;
    this.props.dispatch({
      type: 'collectionApiListModel/deleteAPI',
      apiId: data._id,
      projectId: data.projectId,
      collectionId,
    });
  }

  handleRemoveAPI = data => {
    const { collectionId } = this.props.params;
    this.props.dispatch({
      type: 'collectionApiListModel/unlinkAPI',
      apiId: data._id,
      projectId: data.projectId,
      collectionId,
    });
  }

  components = {
    body: {
      row: Dragrow,
    },
  }

  render() {
    const { params: { collectionId }, collectionApiListModel: { apis, collection } } = this.props;

    return (
      <div className="api-list-page">
        <div className="c-header">
          <Info title={collection.name} desc={collection.desc}>
            <Link to={`/collection/${collectionId}/newapi`}>
              <Button size="default" className="new-btn pull-right" type="primary" icon="plus">
                新建接口
              </Button>
            </Link>
          </Info>
        </div>
        <div className="apis-table-wrapper">
          <Table
            dataSource={apis}
            columns={this.apisColumns}
            rowKey="collectionApiId"
            components={this.components}
            locale={{ emptyText: '暂无数据' }}
            onRow={api => {
              return {
                onClick: () => {
                  browserHistory.push({
                    pathname: `/collection/${collectionId}/apis/doc/${api._id}`,
                  });
                },
              };
            }}
          />
        </div>
      </div>
    );
  }
}

export default connect(({ collectionApiListModel }) => {
  return {
    collectionApiListModel,
  };
})(Collection);
