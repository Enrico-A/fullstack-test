import { Card, Col, Row, Statistic } from 'antd';
import { useTranslation } from 'react-i18next';

const formatAmount = value => value.toFixed(2);

const EntrySummaryCards = ({ summary }) => {
  const { t } = useTranslation();

  // Show the three core diary KPIs requested by the MVP.
  const items = [
    {
      key: 'income',
      title: t('common.totalIncome'),
      value: summary.income,
      valueStyle: { color: '#15803d' }
    },
    {
      key: 'expense',
      title: t('common.totalExpense'),
      value: summary.expense,
      valueStyle: { color: '#c2410c' }
    },
    {
      key: 'balance',
      title: t('common.balance'),
      value: summary.balance,
      valueStyle: { color: summary.balance >= 0 ? '#1d4ed8' : '#b91c1c' }
    }
  ];

  return (
    <Row gutter={[16, 16]}>
      {items.map(item => (
        <Col key={item.key} xs={24} md={8}>
          <Card>
            <Statistic title={item.title} value={formatAmount(item.value)} valueStyle={item.valueStyle} />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default EntrySummaryCards;
