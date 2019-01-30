import React from 'react';
import { Icon, Input, AutoComplete, Button, message } from 'antd';
import ajax from 'xhr-plus';
import key from 'keymaster';
import debounce from 'lodash/debounce';
import pubsub from 'pubsub.js';

import './style.less';

const Option = AutoComplete.Option;
const OptGroup = AutoComplete.OptGroup;

export default class GlobalSearch extends React.PureComponent {
  state = {
    placeholder: '请输入需求、应用或接口信息进行查询。（ESC 退出查询）',
    dataSource: [],
    trigger: false,
    filter: [],
    type: '',
    pubInfo: {},
  }

  componentDidMount() {
    // 重写 filter
    key.filter = function filter() {
      return true;
    };

    key('⌘+p, ctrl+p', e => {
      e.preventDefault();
      this.handleFocus();
    });

    key('esc', e => {
      e.preventDefault();
      this.handleUnfocus();
    });

    this.pubsub = pubsub.subscribe('globalSearch', (data) => {
      // 复制接口
      if (data && data.source === 'copyApi') {
        this.setState({
          trigger: true,
          filter: [ 'api-detail' ],
          type: 'copyApi',
          placeholder: '请输入接口信息搜索, 点击按钮添加',
          pubInfo: data,
        }, this.focus);
      } else {
        this.setState({
          trigger: true,
        }, this.focus);
      }
    });
  }

  componentWillUnmount() {
    key.unbind('⌘+p, ctrl+p');
    key('esc');
    pubsub.unsubscribe(this.pubsub);
  }

  handleFocus = () => {
    pubsub.publish('globalSearch');
  }

  focus = () => {
    document.getElementById('global-search-input').focus();
  }

  handleUnfocus = () => {
    this.setState({
      trigger: false,
    });
  }

  handleSearch = debounce(e => {
    ajax({
      url: '/api/globalsearch',
      method: 'get',
      type: 'json',
      data: {
        keyword: e,
      },
    }).then(res => {
      this.setState({
        dataSource: res.data,
      });
    });
  }, 300);

  handleSelect = value => {
    location.href = value;
  }

  generateValue = (group, item) => {
    if (group.type === 'api-detail') {
      // Todo: 项目 ID
      return `/project/${item.projectId}/apis/doc/${item.id}`;
    }
    return `/${group.type}/${item.id}/apis/list`;
  }

  addApiToCollection = (opt) => {
    const { data: { collectionId, groupId } } = this.state.pubInfo;
    const param = {
      _id: opt.id,
      projectId: opt.projectId,
      collectionId,
      url: opt.path,
      groupId,
    };

    ajax({
      url: '/api/apis',
      method: 'POST',
      type: 'json',
      data: {
        api: JSON.stringify(param),
      },
    }).then(res => {
      if (res.status === 'success') {
        message.success('添加成功');
        pubsub.publish('copyApiStatus', [ 'success' ]);
      } else {
        message.error(res.errMsg);
        pubsub.publish('copyApiStatus', [ 'fail' ]);
      }
    });
  }

  render() {
    const { dataSource, trigger, filter, type, placeholder } = this.state;
    const options = [];

    for (let i = 0; i < dataSource.length; i++) {
      const group = dataSource[i];
      if (group.list.length === 0) continue;
      if (filter.length) {
        if (!filter.includes(group.type)) continue;
      }

      options.push(<OptGroup
        key={group.type + '_' + i}
        label={group.title}
      >
        {group.list.map((opt, idx) => (
          <Option key={opt.id + '_' + idx} value={this.generateValue(group, opt)}>
            {opt.label ? opt.label : '(暂无名称)'}
            <p className="certain-search-item-count"><span>{opt.path}</span>
            {type === 'copyApi' && <Button className="btn" shape="circle" icon="plus" size="small" onClick={ (e) => {
              e.stopPropagation();
              this.addApiToCollection(opt);
            }} />}
            </p>
          </Option>
        ))}
      </OptGroup>);
    }

    const isMac = /macintosh|mac os x/i.test(navigator.userAgent);
    const keyNames = `全局快捷搜索（${isMac ? '⌘ + P' : 'Ctrl + P'}）`;

    return (
      <div>
        <div>
          <Input onFocus={this.handleFocus} id="global-search-top" placeholder={keyNames} style={{ width: 280 }} suffix={<Icon type="search" className="certain-category-icon" />} />
        </div>
        {
          trigger && (
            <div>
              <div className="certain-category-search-wrapper" style={{ width: 500 }}>
                <AutoComplete
                  className="certain-category-search"
                  dropdownClassName="certain-category-search-dropdown"
                  dropdownMatchSelectWidth={false}
                  dropdownStyle={{ width: '500px' }}
                  size="large"
                  style={{ width: '100%' }}
                  dataSource={options}
                  placeholder={placeholder}
                  optionLabelProp="backfill"
                  onSearch={this.handleSearch}
                  onSelect={this.handleSelect}
                >
                  <Input id="global-search-input" suffix={<Icon type="search" className="certain-category-icon" />} />
                </AutoComplete>
              </div>
              <div className="global-search-backdrop" onClick={this.handleUnfocus}></div>
            </div>
          )
        }
      </div>
    );
  }
}
