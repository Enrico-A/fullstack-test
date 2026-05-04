const entryProperties = {
  type: {
    type: 'string',
    enum: ['income', 'expense']
  },
  amount: {
    type: 'number',
    exclusiveMinimum: 0,
    multipleOf: 0.01
  },
  date: {
    type: 'string',
    format: 'date'
  },
  category: {
    type: 'string',
    minLength: 1,
    maxLength: 50,
    isNotEmpty: true
  },
  description: {
    type: 'string',
    minLength: 1,
    maxLength: 150,
    isNotEmpty: true
  },
  notes: {
    type: 'string',
    maxLength: 1000
  }
};

module.exports = {
  createDiaryEntry: {
    $id: 'createDiaryEntry',
    type: 'object',
    properties: entryProperties,
    required: ['type', 'amount', 'date', 'category', 'description'],
    additionalProperties: false
  },
  updateDiaryEntry: {
    $id: 'updateDiaryEntry',
    type: 'object',
    properties: entryProperties,
    additionalProperties: false
  },
  listDiaryEntriesQuery: {
    $id: 'listDiaryEntriesQuery',
    type: 'object',
    properties: {
      type: entryProperties.type,
      category: {
        type: 'string',
        minLength: 1,
        maxLength: 50,
        isNotEmpty: true
      },
      description: {
        type: 'string',
        minLength: 1,
        maxLength: 150,
        isNotEmpty: true
      },
      dateFrom: {
        type: 'string',
        format: 'date'
      },
      dateTo: {
        type: 'string',
        format: 'date'
      },
      sorter: {
        type: 'string',
        enum: ['date', '-date', 'amount', '-amount', 'category', '-category', 'createdAt', '-createdAt']
      },
      nextKey: {
        type: 'string'
      },
      limit: {
        type: 'integer',
        minimum: 0
      },
      count: {
        type: 'boolean'
      }
    },
    additionalProperties: false
  }
};
