// 框架布局
import React from 'react';
import Header from '../components/Header';

import './default.less';

export default class LayoutDefault extends React.Component {
  render() {
    const { children, uplevel, title } = this.props;
    return (
      <div className="layout">
        <Header uplevel={uplevel} title={title} />
        <div className="container">
          {children}
        </div>
      </div>
    );
  }
}
