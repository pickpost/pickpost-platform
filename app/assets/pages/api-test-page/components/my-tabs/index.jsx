import React from 'react';
import autobind from 'autobind-decorator';

import './style.less';

@autobind
class MyTabs extends React.Component {
  render() {
    const { onTabClick, activeKey, apiType, method } = this.props;

    if (apiType !== 'HTTP') {
      return (
        <div className="my-tabs">
          <div onClick={() => { onTabClick('2'); }} key="2" className={activeKey === '2' ? 'active' : undefined}>RequestData</div>
          <div onClick={() => { onTabClick('3'); }} key="3" className={activeKey === '3' ? 'active' : undefined}>Auth</div>
        </div>
      );
    }

    return (
      <div className="my-tabs">
        {
          method !== 'GET' && (
            <div onClick={() => { onTabClick('2'); }} key="2" className={activeKey === '2' ? 'active' : undefined}>Body</div>
          )
        }
        <div onClick={() => { onTabClick('3'); }} key="3" className={activeKey === '3' ? 'active' : undefined}>Auth</div>
        <div onClick={() => { onTabClick('4'); }} key="4" className={activeKey === '4' ? 'active' : undefined}>Headers</div>
        <div onClick={() => { onTabClick('1'); }} key="1" className={activeKey === '1' ? 'active' : undefined}>Query</div>
      </div>
    );
  }
}

export default MyTabs;
