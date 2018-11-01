import React from 'react';
import { Icon, Input, AutoComplete } from 'antd';
import ajax from 'xhr-plus';

import './GlobalSearch.less';

const Option = AutoComplete.Option;
const OptGroup = AutoComplete.OptGroup;

export default class GlobalSearch extends React.PureComponent {
  state = {
    dataSource: [],
  }

  handleSearch = e => {
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
  }

  handleSelect = value => {
    location.href = value;
  }

  generateValue = (group, item) => {
    if (group.type === 'api-detail') {
      return `/${group.type}/${item.id}/doc`;
    }
    return `/${group.type}/${item.id}?tab=api`;
  }

  render() {
    const { dataSource } = this.state;
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

    return (
      <div className="certain-category-search-wrapper" style={{ width: 400 }}>
        <AutoComplete
          className="certain-category-search"
          dropdownClassName="certain-category-search-dropdown"
          dropdownMatchSelectWidth={false}
          dropdownStyle={{ width: '500px' }}
          size="default"
          style={{ width: '100%' }}
          dataSource={options}
          placeholder="搜索"
          optionLabelProp="backfill"
          onSearch={this.handleSearch}
          onSelect={this.handleSelect}
        >
          <Input suffix={<Icon type="search" className="certain-category-icon" />} />
        </AutoComplete>
      </div>
    );
  }
}
