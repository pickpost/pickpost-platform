import { Modal, Form, Input } from 'antd';

const FormItem = Form.Item;

const GroupCreate = Form.create()(
  // eslint-disable-next-line
  class extends React.Component {
    render() {
      const { visible, onCancel, onCreate, form } = this.props;
      const { getFieldDecorator, getFieldValue } = form;
      const isEdit = getFieldValue('folderId');
      return (
        <Modal
          visible={visible}
          title={isEdit ? '修改产品组' : '新建产品组'}
          okText={isEdit ? '更新' : '创建'}
          cancelText="取消"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form layout="vertical">
            {getFieldDecorator('spaceId')(
              <Input type="hidden" />
            )}
            {getFieldDecorator('folderId')(
              <Input type="hidden" />
            )}
            <FormItem label="名称">
              {getFieldDecorator('name', {
                rules: [{ required: true, message: '请填写产品组名称' }],
              })(
                <Input />
              )}
            </FormItem>
          </Form>
        </Modal>
      );
    }
  }
);

export default GroupCreate;
