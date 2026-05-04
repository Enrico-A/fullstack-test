import { useContext, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Button, DatePicker, Form, Input, InputNumber, Modal, Select, Space, Tag, Typography } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

import Api from '../helpers/core/Api';
import ContentPanel from '../components/core/layout/ContentPanel';
import Table from '../components/core/table/Table';
import Filters, { useFilters } from '../components/core/table/Filters';
import MessageContext from '../helpers/core/MessageContext';
import { handleTableChange } from '../helpers/core/utils';
import EntrySummaryCards from '../components/diary/EntrySummaryCards';
import { ENTRY_CATEGORY_OPTIONS, ENTRY_TYPE_OPTIONS } from '../constants/entryOptions';

const buildRequestParams = ({ savedFilters, sorter }) => {
  // Keep the API request aligned with the persisted UI filters.
  const params = {
    count: true,
    sorter
  };

  if (savedFilters?.type) params.type = savedFilters.type;
  if (savedFilters?.category) params.category = savedFilters.category;
  if (savedFilters?.description) params.description = savedFilters.description.trim();
  if (savedFilters?.dateFrom) params.dateFrom = savedFilters.dateFrom;
  if (savedFilters?.dateTo) params.dateTo = savedFilters.dateTo;

  return params;
};

const calculateSummary = entries =>
  entries.reduce(
    (acc, entry) => {
      // Aggregate visible entries only, so the summary reflects active filters.
      if (entry.type === 'income') {
        acc.income += entry.amount;
      } else {
        acc.expense += entry.amount;
      }

      acc.balance = acc.income - acc.expense;

      return acc;
    },
    { income: 0, expense: 0, balance: 0 }
  );

const buildFilterFormValues = savedFilters => ({
  // Convert persisted date strings back to dayjs objects for the Ant Design form.
  ...savedFilters,
  dateFrom: savedFilters?.dateFrom ? dayjs(savedFilters.dateFrom) : undefined,
  dateTo: savedFilters?.dateTo ? dayjs(savedFilters.dateTo) : undefined
});

const Home = () => {
  const { t } = useTranslation();
  const { loadingMsg, savedMsg, errorMsg } = useContext(MessageContext);

  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sorter, setSorter] = useState('-date');
  const [editingEntry, setEditingEntry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [entryForm] = Form.useForm();
  const [filtersForm] = Form.useForm();
  const filtersManager = useFilters('entries');

  const loadEntries = async () => {
    setLoading(true);

    try {
      // Reload the list every time sorting or filters change.
      const params = buildRequestParams({ savedFilters: filtersManager.savedFilters, sorter });
      const response = await Api.get('/entries', { params });

      setEntries(response.data);
      setSummary(calculateSummary(response.data));
      setTotalCount(Number(response.headers['x-total-count'] ?? response.data.length));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filtersForm.setFieldsValue(buildFilterFormValues(filtersManager.savedFilters));
  }, [filtersManager.savedFilters]);

  useEffect(() => {
    loadEntries();
  }, [sorter, filtersManager.savedFilters]);

  const closeModal = () => {
    // Reset the form state to avoid leaking values between create and edit flows.
    setIsModalOpen(false);
    setEditingEntry(null);
    entryForm.resetFields();
  };

  const openCreateModal = () => {
    // Start the create flow with sensible defaults for the MVP diary.
    setEditingEntry(null);
    entryForm.setFieldsValue({
      type: 'expense',
      amount: 0.01,
      date: dayjs(),
      category: ENTRY_CATEGORY_OPTIONS[0].value,
      description: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = entry => {
    // Rehydrate the stored ISO date into a dayjs instance for the date picker.
    setEditingEntry(entry);
    entryForm.setFieldsValue({
      ...entry,
      date: dayjs(entry.date)
    });
    setIsModalOpen(true);
  };

  const handleSave = async values => {
    const messageKey = loadingMsg();
    setSaving(true);

    const payload = {
      ...values,
      // Send the same date format expected by the backend validation schema.
      date: values.date.format('YYYY-MM-DD')
    };

    try {
      if (editingEntry) {
        await Api.patch(`/entries/${editingEntry._id}`, payload);
      } else {
        await Api.post('/entries', payload);
      }

      savedMsg(messageKey);
      closeModal();
      await loadEntries();
    } catch (error) {
      errorMsg(messageKey, error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async entry => {
    const messageKey = loadingMsg();

    try {
      await Api.delete(`/entries/${entry._id}`);
      savedMsg(messageKey);
      await loadEntries();
    } catch (error) {
      errorMsg(messageKey, error);
      throw error;
    }
  };

  const columns = [
    {
      title: t('common.date'),
      dataIndex: 'date',
      key: 'date',
      render: value => dayjs(value).format('YYYY-MM-DD')
    },
    {
      title: t('common.type'),
      dataIndex: 'type',
      key: 'type',
      render: value => <Tag color={value === 'income' ? 'green' : 'volcano'}>{value}</Tag>
    },
    {
      title: t('common.amount'),
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: value => value.toFixed(2)
    },
    {
      title: t('common.category'),
      dataIndex: 'category',
      key: 'category'
    },
    {
      title: t('common.description'),
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: t('common.notes'),
      dataIndex: 'notes',
      key: 'notes',
      render: value => value || <Typography.Text type="secondary">{t('common.emptyField')}</Typography.Text>
    },
    {
      title: t('common.actions'),
      dataIndex: 'actions',
      key: 'actions',
      width: 60,
      render: (_, record) => (
        <Button type="text" size="small" onClick={() => openEditModal(record)}>
          <FontAwesomeIcon icon={faEdit} />
        </Button>
      )
    }
  ];

  const filtersLayout = (
    <Form form={filtersForm} layout="vertical">
      <Form.Item label={t('common.type')} name="type">
        <Select
          allowClear
          options={ENTRY_TYPE_OPTIONS}
          placeholder={t('common.allTypes')}
          onChange={value => filtersManager.saveFilters('type', value)}
        />
      </Form.Item>
      <Form.Item label={t('common.category')} name="category">
        <Select
          allowClear
          options={ENTRY_CATEGORY_OPTIONS}
          placeholder={t('common.allCategories')}
          onChange={value => filtersManager.saveFilters('category', value)}
        />
      </Form.Item>
      <Form.Item label={t('common.description')} name="description">
        <Input
          allowClear
          placeholder={t('common.searchDescription')}
          onChange={event => filtersManager.saveFilters('description', event.target.value)}
        />
      </Form.Item>
      <Form.Item label={t('common.fromDate')} name="dateFrom">
        <DatePicker
          className="w-full"
          format="YYYY-MM-DD"
          // Persist the filter value as a plain string to keep local storage serializable.
          onChange={value => filtersManager.saveFilters('dateFrom', value ? value.format('YYYY-MM-DD') : undefined)}
        />
      </Form.Item>
      <Form.Item label={t('common.toDate')} name="dateTo">
        <DatePicker
          className="w-full"
          format="YYYY-MM-DD"
          // Persist the filter value as a plain string to keep local storage serializable.
          onChange={value => filtersManager.saveFilters('dateTo', value ? value.format('YYYY-MM-DD') : undefined)}
        />
      </Form.Item>
    </Form>
  );

  return (
    <ContentPanel
      title={t('common.diary')}
      subtitle={t('common.diarySubtitle')}
      titleAction={
        <Space>
          <Button onClick={filtersManager.toggleFilter}>{t('common.filter')}</Button>
          <Button type="primary" onClick={openCreateModal}>
            {t('common.addEntry')}
          </Button>
        </Space>
      }
    >
      <div className="mb-4">
        <EntrySummaryCards summary={summary} />
      </div>

      <div className={filtersManager.filterContainerClasses}>
        <Filters
          title={t('common.filter')}
          onClose={filtersManager.onCloseDrawer}
          onClear={() => filtersManager.onClearFilters(filtersForm)}
          showFilter={filtersManager.showFilter}
          showReset={filtersManager.hasFilters}
          filters={filtersLayout}
        />
        <Table
          rowKey="_id"
          loading={loading}
          dataSource={entries}
          columns={columns}
          totalCount={totalCount}
          countLabel="common.visibleEntriesCount"
          deleteSaveButtonOnRow
          onDelete={handleDelete}
          sortableKeys={['date', 'type', 'amount', 'category', 'description']}
          onChange={handleTableChange(setSorter)}
        />
      </div>

      <Modal
        title={editingEntry ? t('common.editEntry') : t('common.addEntry')}
        open={isModalOpen}
        onCancel={closeModal}
        onOk={() => entryForm.submit()}
        confirmLoading={saving}
        destroyOnClose
      >
        <Form form={entryForm} layout="vertical" onFinish={handleSave} requiredMark={false}>
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
        </Form>
      </Modal>
    </ContentPanel>
  );
};

export default Home;
