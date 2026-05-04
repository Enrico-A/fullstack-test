import { Button, DatePicker, Form, Input, InputNumber, Select, Space } from 'antd';
import { useTranslation } from 'react-i18next';

import { ENTRY_CATEGORY_OPTIONS, ENTRY_TYPE_OPTIONS } from '../../constants/entryOptions';

const EntryForm = ({ form, initialValues, onFinish, onCancel, saving }) => {
  const { t } = useTranslation();

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={onFinish}
      requiredMark={false}
      className="mx-auto max-w-2xl"
    >
      <Form.Item label={t('common.type')} name="type" rules={[{ required: true, message: t('core:errors.201') }]}>
        <Select options={ENTRY_TYPE_OPTIONS} />
      </Form.Item>

      <Form.Item
        label={t('common.amount')}
        name="amount"
        rules={[
          { required: true, message: t('core:errors.201') },
          {
            validator: (_, value) =>
              value > 0 ? Promise.resolve() : Promise.reject(new Error(t('common.amountMustBePositive')))
          }
        ]}
      >
        <InputNumber min={0.01} precision={2} step={0.01} className="w-full" />
      </Form.Item>

      <Form.Item label={t('common.date')} name="date" rules={[{ required: true, message: t('core:errors.201') }]}>
        <DatePicker className="w-full" format="YYYY-MM-DD" />
      </Form.Item>

      <Form.Item
        label={t('common.category')}
        name="category"
        rules={[{ required: true, message: t('core:errors.201') }]}
      >
        <Select options={ENTRY_CATEGORY_OPTIONS} />
      </Form.Item>

      <Form.Item
        label={t('common.description')}
        name="description"
        rules={[{ required: true, message: t('core:errors.201') }]}
      >
        <Input maxLength={150} />
      </Form.Item>

      <Form.Item label={t('common.notes')} name="notes">
        <Input.TextArea rows={4} maxLength={1000} />
      </Form.Item>

      <Form.Item className="mb-0">
        <Space>
          <Button onClick={onCancel}>{t('common.cancel')}</Button>
          <Button type="primary" htmlType="submit" loading={saving}>
            {t('common.save')}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default EntryForm;
