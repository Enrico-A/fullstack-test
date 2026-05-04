import dayjs from 'dayjs';

export const getDefaultEntryFormValues = () => ({
  type: 'expense',
  amount: 0.01,
  date: dayjs(),
  category: 'Food',
  description: '',
  notes: ''
});

export const buildEntriesRequestParams = ({ savedFilters, sorter }) => {
  // Keep the API request aligned with the persisted UI filters.
  const params = {
    count: true,
    sorter: sorter || '-date'
  };

  if (savedFilters?.type) params.type = savedFilters.type;
  if (savedFilters?.category) params.category = savedFilters.category;
  if (savedFilters?.searchText) params.description = savedFilters.searchText.trim();
  if (savedFilters?.dateFrom) params.dateFrom = savedFilters.dateFrom;
  if (savedFilters?.dateTo) params.dateTo = savedFilters.dateTo;

  return params;
};

export const calculateEntriesSummary = entries =>
  entries.reduce(
    (accumulator, entry) => {
      // Aggregate visible entries only, so the summary mirrors active filters.
      if (entry.type === 'income') {
        accumulator.income += entry.amount;
      } else {
        accumulator.expense += entry.amount;
      }

      accumulator.balance = accumulator.income - accumulator.expense;

      return accumulator;
    },
    { income: 0, expense: 0, balance: 0 }
  );

export const buildFilterFormValues = savedFilters => ({
  ...savedFilters,
  searchText: savedFilters?.searchText,
  // Rehydrate persisted date strings for the Ant Design date pickers.
  dateFrom: savedFilters?.dateFrom ? dayjs(savedFilters.dateFrom) : undefined,
  dateTo: savedFilters?.dateTo ? dayjs(savedFilters.dateTo) : undefined
});

export const buildEntryFormValues = entry => ({
  ...getDefaultEntryFormValues(),
  ...entry,
  date: entry?.date ? dayjs(entry.date) : dayjs()
});

export const normalizeEntryPayload = values => ({
  ...values,
  // Send the backend schema the plain date format it validates against.
  date: values.date.format('YYYY-MM-DD')
});
