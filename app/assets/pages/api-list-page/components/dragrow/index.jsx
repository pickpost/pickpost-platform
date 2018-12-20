import React from 'react';
import { DragSource } from 'react-dnd';

class BodyRow extends React.Component {
  render() {
    const {
      connectDragSource,
      dragRow,
      clientOffset,
      sourceClientOffset,
      initialClientOffset,
      ...restProps
    } = this.props;
    const style = { ...restProps.style, cursor: 'move' };


    return connectDragSource(
      <tr
        {...restProps}
        style={style}
      />
    );
  }
}

const rowSource = {
  beginDrag(props) {
    console.log('begin', props);
    return {
      id: props['data-row-key'],
    };
  },
};

const DragableBodyRow = DragSource('row', rowSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  dragRow: monitor.getItem(),
  clientOffset: monitor.getClientOffset(),
  initialClientOffset: monitor.getInitialClientOffset(),
}))(BodyRow);

export default DragableBodyRow;
