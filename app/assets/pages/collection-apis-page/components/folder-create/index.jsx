import { Modal, Form, Input } from 'antd';

const FormItem = Form.Item;

const FolderCreateForm = Form.create()(
  // eslint-disable-next-line
  class extends React.Component {
    render() {
      const { visible, onCancel, onCreate, form } = this.props;
      const { getFieldDecorator } = form;
      return (
        <Modal
          visible={visible}
          title="新建分组"
          okText="创建"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form layout="vertical">
            {getFieldDecorator('folderId')(
              <Input type="hidden" />
            )}
            <FormItem label="名称">
              {getFieldDecorator('name', {
                rules: [{ required: true, message: '请填写分组名称' }],
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

export default FolderCreateForm;
