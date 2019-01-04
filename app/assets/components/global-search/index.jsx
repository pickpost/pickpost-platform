import React from 'react';
import { Icon, Input, AutoComplete } from 'antd';
import ajax from 'xhr-plus';
import key from 'keymaster';
import debounce from 'lodash/debounce';

import './style.less';

const Option = AutoComplete.Option;
const OptGroup = AutoComplete.OptGroup;

export default class GlobalSearch extends React.PureComponent {
  state = {
    dataSource: [],
    focus: false,
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
  }

  componentWillUnmount() {
    key.unbind('⌘+p, ctrl+p');
    key('esc');
  }

  handleFocus = () => {
    this.setState({
      focus: true,
    }, () => {
      document.getElementById('global-search-input').focus();
    });
  }

  handleUnfocus = () => {
    this.setState({
      focus: false,
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

  render() {
    const { dataSource, focus } = this.state;
    const options = dataSource.map((group, gIdx) => (
      <OptGroup
        key={group.type + '_' + gIdx}
        label={group.title}
      >
        {group.list.map((opt, idx) => (
          <Option key={opt.id + '_' + idx} value={this.generateValue(group, opt)}>
            {opt.label ? opt.label : '(暂无名称)'}
            <span className="certain-search-item-count">{opt.path}</span>
          </Option>
        ))}
      </OptGroup>
    ));

    const isMac = /macintosh|mac os x/i.test(navigator.userAgent);
    const keyNames = `全局快捷搜索（${isMac ? '⌘ + P' : 'Ctrl + P'}）`;

    return (
      <div>
        <div>
          <Input onFocus={this.handleFocus} placeholder={keyNames} style={{ width: 280 }} suffix={<Icon type="search" className="certain-category-icon" />} />
        </div>
        {
          focus && (
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
                  placeholder="请输入需求、应用或接口信息进行查询。（ESC 退出查询）"
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
