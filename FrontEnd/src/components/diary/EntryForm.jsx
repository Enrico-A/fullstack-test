import { Button, Card, Col, DatePicker, Form, Input, InputNumber, Row, Select, Space, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import { ENTRY_CATEGORY_OPTIONS, ENTRY_TYPE_OPTIONS } from '../../constants/entryOptions';

const EntryForm = ({ form, initialValues, onFinish, onCancel, saving }) => {
  const { t } = useTranslation();
  const selectedType = Form.useWatch('type', form) || initialValues?.type || 'expense';

  const typeToneClass = selectedType === 'income' ? 'diary-entry-form-card-income' : 'diary-entry-form-card-expense';

  return (
    <div className="mx-auto max-w-5xl">
      <Card className={`diary-entry-form-card ${typeToneClass}`} bordered={false}>
        <div className="diary-entry-form-card__hero">
          <div>
            <Tag color={selectedType === 'income' ? 'green' : 'volcano'} className="mb-3">
              {selectedType === 'income' ? t('common.incomeEntryLabel') : t('common.expenseEntryLabel')}
            </Tag>
            <Typography.Title level={3} className="mb-2">
              {t('common.entryFormTitle')}
            </Typography.Title>
            <Typography.Paragraph type="secondary" className="mb-0 max-w-2xl">
              {t('common.entryFormDescription')}
            </Typography.Paragraph>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues}
          onFinish={onFinish}
          requiredMark={false}
          className="diary-entry-form"
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={15}>
              <div className="diary-entry-form-section">
                <div className="diary-entry-form-section__header">
                  <Typography.Title level={5} className="mb-1">
                    {t('common.entryMainDetails')}
                  </Typography.Title>
                  <Typography.Text type="secondary">{t('common.entryMainDetailsHint')}</Typography.Text>
                </div>

                <Row gutter={[16, 0]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={t('common.type')}
                      name="type"
                      rules={[{ required: true, message: t('core:errors.201') }]}
                    >
                      <Select options={ENTRY_TYPE_OPTIONS} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      label={t('common.category')}
                      name="category"
                      rules={[{ required: true, message: t('core:errors.201') }]}
                    >
                      <Select options={ENTRY_CATEGORY_OPTIONS} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 0]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={t('common.amount')}
                      name="amount"
                      extra={t('common.amountHelper')}
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
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      label={t('common.date')}
                      name="date"
                      extra={t('common.dateHelper')}
                      rules={[{ required: true, message: t('core:errors.201') }]}
                    >
                      <DatePicker className="w-full" format="YYYY-MM-DD" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label={t('common.description')}
                  name="description"
                  extra={t('common.descriptionHelper')}
                  rules={[{ required: true, message: t('core:errors.201') }]}
                >
                  <Input maxLength={150} showCount />
                </Form.Item>
              </div>
            </Col>

            <Col xs={24} lg={9}>
              <div className="diary-entry-form-section diary-entry-form-section--aside">
                <div className="diary-entry-form-section__header">
                  <Typography.Title level={5} className="mb-1">
                    {t('common.entryNotesSection')}
                  </Typography.Title>
                  <Typography.Text type="secondary">{t('common.entryNotesSectionHint')}</Typography.Text>
                </div>

                <Form.Item label={t('common.notes')} name="notes" extra={t('common.notesHelper')}>
                  <Input.TextArea rows={9} maxLength={1000} showCount />
                </Form.Item>

                <div className="diary-entry-form-tip">
                  <Typography.Text strong>{t('common.entryFormTipTitle')}</Typography.Text>
                  <Typography.Paragraph type="secondary" className="mb-0 mt-2">
                    {t('common.entryFormTipText')}
                  </Typography.Paragraph>
                </div>
              </div>
            </Col>
          </Row>

          <div className="diary-entry-form-actions">
            <Space wrap>
              <Button onClick={onCancel}>{t('common.cancel')}</Button>
              <Button type="primary" htmlType="submit" loading={saving}>
                {t('common.save')}
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default EntryForm;
