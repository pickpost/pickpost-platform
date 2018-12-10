import { Modal, Form, Input } from 'antd';

const FormItem = Form.Item;

const FolderCreateForm = Form.create()(
  // eslint-disable-next-line
  class extends React.Component {
    render() {
      const { visible, onCancel, onCreate, form } = this.props;
      const { getFieldDecorator, getFieldValue } = form;
      const isEdit = getFieldValue('folderId');
      return (
        <Modal
          visible={visible}
          title={isEdit ? '修改分组' : '新建分组'}
          okText={isEdit ? '更新' : '创建'}
          cancelText="取消"
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
