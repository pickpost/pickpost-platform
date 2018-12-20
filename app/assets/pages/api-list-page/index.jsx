import React from 'react';
import { Table, Button, Popover, Tag, Input, Icon } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import { browserHistory, Link } from 'dva/router';
import Highlighter from 'react-highlight-words';
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
      searchText: '',
    };

    const { collectionId } = props.params;
    this.apisColumns = [{
      title: '名称',
      dataIndex: 'name',
      width: '200px',
      key: 'name',
      render: (_, item) => (
        <div title={item.name} className="ellipsis">
          <Tag color={TypeColorMap[item.apiType]}>{item.apiType}</Tag>
          {item.name}
        </div>
      ),
    }, {
      title: '唯一标识',
      dataIndex: 'url',
      key: 'url',
      ...this.getColumnSearchProps('url'),
      render: (_, item) => (
        <div title={item.url} className="ellipsis item-url">
          {item.url}
        </div>
      ),
    }, {
      title: '所属应用',
      dataIndex: 'projectName',
      width: '130px',
      key: 'projectName',
    }, {
      title: '最近更新',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: '160px',
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
      type: 'apiListModel/collection',
      id: collectionId,
    });
    // 获取需求内接口列表
    this.props.dispatch({
      type: 'apiListModel/collectionApis',
      id: collectionId,
      groupId: this.props.location.query.groupId || '',
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.location.query.groupId !== nextProps.location.query.groupId) {
      this.props.dispatch({
        type: 'apiListModel/collectionApis',
        id: nextProps.params.collectionId,
        groupId: nextProps.location.query.groupId,
      });
    }
  }

  getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys, selectedKeys, confirm, clearFilters,
    }) => (
      <div className="custom-filter-dropdown">
        <Input
          ref={node => { this.searchInput = node; }}
          placeholder="搜索接口"
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [ e.target.value ] : [])}
          onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
          type="primary"
          onClick={() => this.handleSearch(selectedKeys, confirm)}
          icon="search"
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button
          onClick={() => this.handleReset(clearFilters)}
          size="small"
          style={{ width: 90 }}
        >
          Reset
        </Button>
      </div>
    ),
    filterIcon: filtered => <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) => record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    },
    render: (text) => (
      <Highlighter
        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
        searchWords={[ this.state.searchText ]}
        autoEscape
        textToHighlight={text.toString()}
      />
    ),
  })

  handleSearch = (selectedKeys, confirm) => {
    confirm();
    this.setState({ searchText: selectedKeys[0] });
  }

  handleReset = (clearFilters) => {
    clearFilters();
    this.setState({ searchText: '' });
  }

  handleDeleteAPI = data => {
    const { collectionId } = this.props.params;
    this.props.dispatch({
      type: 'apiListModel/deleteAPI',
      apiId: data._id,
      projectId: data.projectId,
      collectionId,
    });
  }

  handleRemoveAPI = data => {
    const { collectionId } = this.props.params;
    this.props.dispatch({
      type: 'apiListModel/unlinkAPI',
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
    const { params: { collectionId }, apiListModel: { apis, collection } } = this.props;

    return (
      <div className="api-list-page">
        <div className="c-header">
          <Info title={collection.name} desc={collection.desc}>
            <Link to={`/collection/${collectionId}/newapi`}>
              <Button size="default" className="new-btn pull-right" type="primary" icon="plus">
                新增接口
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

export default connect(({ apiListModel }) => {
  return {
    apiListModel,
  };
})(Collection);
