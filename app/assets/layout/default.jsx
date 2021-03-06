// 框架布局
import React from 'react';
import { connect } from 'dva';
import Header from '../components/header';

import './default.less';

class LayoutDefault extends React.PureComponent {
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

export default connect(({ globalModel }) => {
  return {
    globalModel,
  };
})(LayoutDefault);

