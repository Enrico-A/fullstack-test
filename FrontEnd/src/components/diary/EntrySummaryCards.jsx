import { Card, Col, Row, Skeleton, Statistic, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

const formatAmount = value => value.toFixed(2);

const EntrySummaryCards = ({ summary, loading = false }) => {
  const { t } = useTranslation();

  // Show the three core diary KPIs requested by the MVP.
  const items = [
    {
      key: 'income',
      title: t('common.totalIncome'),
      value: summary.income,
      subtitle: t('common.totalIncomeHint'),
      cardClassName: 'diary-summary-card diary-summary-card-income',
      valueStyle: { color: '#166534' }
    },
    {
      key: 'expense',
      title: t('common.totalExpense'),
      value: summary.expense,
      subtitle: t('common.totalExpenseHint'),
      cardClassName: 'diary-summary-card diary-summary-card-expense',
      valueStyle: { color: '#b45309' }
    },
    {
      key: 'balance',
      title: t('common.balance'),
      value: summary.balance,
      subtitle: t('common.balanceHint'),
      cardClassName: 'diary-summary-card diary-summary-card-balance',
      valueStyle: { color: summary.balance >= 0 ? '#1d4ed8' : '#b91c1c' }
    }
  ];

  return (
    <Row gutter={[16, 16]}>
      {items.map(item => (
        <Col key={item.key} xs={24} md={8}>
          <Card className={item.cardClassName} bordered={false}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} title={{ width: '40%' }} />
            ) : (
              <div>
                <Typography.Text className="diary-summary-label">{item.title}</Typography.Text>
                <Statistic value={formatAmount(item.value)} valueStyle={item.valueStyle} />
                <Typography.Text type="secondary" className="diary-summary-hint">
                  {item.subtitle}
                </Typography.Text>
              </div>
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default EntrySummaryCards;
