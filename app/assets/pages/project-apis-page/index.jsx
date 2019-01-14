import React from 'react';
import { connect } from 'dva';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import ApiNav from '../../components/api-nav';

import './style.less';

class Api extends React.PureComponent {
  componentDidMount() {
    const { params: { projectId } } = this.props;

    this.props.dispatch({
      type: 'projectApisModel/setData',
      payload: {
        projectId,
      },
    });
  }

  render() {
    const { params: { projectId, apiId } } = this.props;

    return (
      <div className="collection-apis-page">
        <div className="api-main">
          {
            apiId && <ApiNav groupId={this.groupId} apiId={apiId} uniqueId={projectId} source="project" {...this.props} />
          }

          {this.props.children}
        </div>
      </div>
    );
  }
}

export default connect(({ projectApisModel }) => {
  return {
    projectApisModel,
  };
})(DragDropContext(HTML5Backend)(Api));
