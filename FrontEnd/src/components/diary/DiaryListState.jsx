import { Button, Empty, Result, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

const DiaryListState = ({ type, hasFilters = false, onRetry, onCreateEntry, onClearFilters }) => {
  const { t } = useTranslation();

  if (type === 'error') {
    return (
      <div className="diary-state-panel">
        <Result
          status="error"
          title={t('common.entriesLoadErrorTitle')}
          subTitle={t('common.entriesLoadErrorText')}
          extra={
            <Space wrap>
              <Button type="primary" onClick={onRetry}>
                {t('common.retry')}
              </Button>
              <Button onClick={onCreateEntry}>{t('common.addEntry')}</Button>
            </Space>
          }
        />
      </div>
    );
  }

  return (
    <div className="diary-state-panel">
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <Space direction="vertical" size={4}>
            <Typography.Text strong>
              {t(hasFilters ? 'common.emptyFilteredEntriesTitle' : 'common.emptyEntriesTitle')}
            </Typography.Text>
            <Typography.Text type="secondary">
              {t(hasFilters ? 'common.emptyFilteredEntriesText' : 'common.emptyEntriesText')}
            </Typography.Text>
          </Space>
        }
      >
        <Space wrap>
          <Button type="primary" onClick={onCreateEntry}>
            {t('common.addEntry')}
          </Button>
          {hasFilters && <Button onClick={onClearFilters}>{t('common.clearFilters')}</Button>}
        </Space>
      </Empty>
    </div>
  );
};

export default DiaryListState;
