const mongoose = require('mongoose');

const softDelete = require('../helpers/softDelete');
const dbFields = require('../helpers/dbFields');

const { Schema } = mongoose;

const schema = Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01
    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
      index: true
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000
    }
  },
  {
    timestamps: true
  }
);

schema.plugin(softDelete);
schema.plugin(dbFields, {
  fields: {
    public: ['_id', 'type', 'amount', 'date', 'category', 'description', 'notes', 'createdAt', 'updatedAt'],
    listing: ['_id', 'type', 'amount', 'date', 'category', 'description', 'notes', 'createdAt', 'updatedAt'],
    cp: ['_id', 'type', 'amount', 'date', 'category', 'description', 'notes', 'createdAt', 'updatedAt']
  }
});

schema.pre('save', function (next) {
  try {
    // Normalize the stored amount to two decimal places.
    if (typeof this.amount === 'number') {
      this.amount = Number(this.amount.toFixed(2));
    }

    return next();
  } catch (error) {
    return next(error);
  }
});

module.exports = mongoose.models.DiaryEntry || mongoose.model('DiaryEntry', schema);
