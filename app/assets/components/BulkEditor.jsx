import React from 'react';
import { Input, Icon } from 'antd';

export default class BulkEditor extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      list: Object.assign([], this.props.value),
    };
    if (this.state.list.length <= 0) {
      this.handleAddRow();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { value } = nextProps;
    this.setState({
      list: Object.assign([], value),
    }, () => {
      if (this.state.list.length <= 0) {
        this.handleAddRow();
      }
    });
  }

  handleChange(index, key, value) {
    const { list } = this.state;
    list[index][key] = value;
    this.updateData(list);
  }

  handleDeleteRow(index) {
    const { list } = this.state;
    list.splice(index, 1);
    this.updateData(list);
  }

  handleAddRow() {
    const { list } = this.state;
    list.push({});
    this.updateData(list);
  }

  updateData(list) {
    this.setState({ list });
    this.props.onChange && this.props.onChange(list);
  }

  render() {
    const { list } = this.state;

    const { configs } = this.props;
    return (
      <div className="bulkeditor">
        <table width="100%">
          <tbody>
            <tr>
              {
                configs.map(item => <td key={item.placeholder}>{item.placeholder}</td>)
              }
            </tr>
          {(list || []).map((item, index) =>
            <tr key={index}>
              {
                configs.map((c, findex) =>
                  <td key={index + '-' + findex} width={c.width}>
                    <Input placeholder={c.placeholder} value={item[c.field]} onChange={e => { this.handleChange(index, c.field, e.target.value); }} />
                  </td>
                )
              }
              <td key='action' width="5%">
                {
                  list.length > 1 &&
                  <Icon style={{ cursor: 'pointer', marginLeft: 5 }} type="delete" onClick={() => { this.handleDeleteRow(index); }} />
                }
              </td>
            </tr>
          )}
          <tr>
            <td colSpan={configs.length}>
              <a href="#" onClick={e => { e.preventDefault(); this.handleAddRow(); }}>添加一行</a>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    );
  }
}
