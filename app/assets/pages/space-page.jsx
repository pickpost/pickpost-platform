import React from 'react';
import { connect } from 'dva';

class SpacePage extends React.PureComponent {
  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}

export default connect(({ apiDocModel }) => {
  return {
    apiDocModel,
  };
})(SpacePage);
