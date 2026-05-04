import { useContext, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Button, DatePicker, Form, Input, Select, Space, Tag, Typography } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

import Api from '../helpers/core/Api';
import ContentPanel from '../components/core/layout/ContentPanel';
import Table from '../components/core/table/Table';
import Filters, { useFilters } from '../components/core/table/Filters';
import MessageContext from '../helpers/core/MessageContext';
import { handleTableChange } from '../helpers/core/utils';
import useCustomNavigate from '../hooks/core/useCustomNavigate';
import EntrySummaryCards from '../components/diary/EntrySummaryCards';
import { ENTRY_CATEGORY_OPTIONS, ENTRY_TYPE_OPTIONS } from '../constants/entryOptions';
import { buildEntriesRequestParams, buildFilterFormValues, calculateEntriesSummary } from '../helpers/diary/entries';

const EntriesList = () => {
  const { t } = useTranslation();
  const { loadingMsg, savedMsg, errorMsg } = useContext(MessageContext);
  const navigate = useCustomNavigate();

  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sorter, setSorter] = useState('-date');

  const [filtersForm] = Form.useForm();
  const filtersManager = useFilters('entries');

  const loadEntries = async () => {
    setLoading(true);

    try {
      // Reload the list whenever sorting or filters change.
      const params = buildEntriesRequestParams({ savedFilters: filtersManager.savedFilters, sorter });
      const response = await Api.get('/entries', { params });

      setEntries(response.data);
      setSummary(calculateEntriesSummary(response.data));
      setTotalCount(Number(response.headers['x-total-count'] ?? response.data.length));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filtersForm.setFieldsValue(buildFilterFormValues(filtersManager.savedFilters));
  }, [filtersForm, filtersManager.savedFilters]);

  useEffect(() => {
    loadEntries();
  }, [sorter, filtersManager.savedFilters]);

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
        <Button type="text" size="small" onClick={event => navigate(`/entries/${record._id}/edit`, event)}>
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

      <Form.Item label={t('common.searchText')} name="searchText">
        <Input
          allowClear
          placeholder={t('common.searchTextPlaceholder')}
          onChange={event => filtersManager.saveFilters('searchText', event.target.value)}
        />
      </Form.Item>

      <Form.Item label={t('common.fromDate')} name="dateFrom">
        <DatePicker
          className="w-full"
          format="YYYY-MM-DD"
          // Persist plain strings to keep the local storage payload serializable.
          onChange={value => filtersManager.saveFilters('dateFrom', value ? value.format('YYYY-MM-DD') : undefined)}
        />
      </Form.Item>

      <Form.Item label={t('common.toDate')} name="dateTo">
        <DatePicker
          className="w-full"
          format="YYYY-MM-DD"
          // Persist plain strings to keep the local storage payload serializable.
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
          <Button type="primary" onClick={event => navigate('/entries/new', event)}>
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
    </ContentPanel>
  );
};

export default EntriesList;
