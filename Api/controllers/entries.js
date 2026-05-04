const DiaryEntry = require('../models/diaryEntry');
const getter = require('../helpers/getter');
const { SendData, ServerError, NotFound, Unauthorized } = require('../helpers/response');

const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildQuery = ({ query, userId }) => {
  const filters = { user: userId };

  if (query.type) {
    filters.type = query.type;
  }

  if (query.category) {
    filters.category = query.category;
  }

  if (query.description) {
    filters.description = new RegExp(escapeRegExp(query.description.trim()), 'i');
  }

  if (query.dateFrom || query.dateTo) {
    filters.date = {};

    if (query.dateFrom) {
      filters.date.$gte = new Date(query.dateFrom);
    }

    if (query.dateTo) {
      filters.date.$lte = new Date(query.dateTo);
    }
  }

  return filters;
};

exports.get = async (req, res, next) => {
  try {
    // Force the default diary ordering to the most recent entry date.
    const diaryRequest = {
      ...req,
      query: {
        ...req.query,
        sorter: req.query.sorter || '-date'
      }
    };

    const query = buildQuery({ query: req.query, userId: res.locals.user.id });
    const data = await getter(DiaryEntry, query, diaryRequest, res);

    return next(SendData(data));
  } catch (error) {
    return next(ServerError(error));
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = await new DiaryEntry({
      ...req.body,
      user: res.locals.user.id
    }).save();

    return next(SendData(data.response('cp'), 201));
  } catch (error) {
    return next(ServerError(error));
  }
};

exports.getById = async ({ params: { id } }, { locals: { user } }, next) => {
  try {
    const data = await DiaryEntry.findById(id);

    if (!data) return next(NotFound());
    if (String(data.user) !== String(user.id)) return next(Unauthorized());

    return next(SendData(data.response('cp')));
  } catch (error) {
    return next(ServerError(error));
  }
};

exports.update = async ({ params: { id }, body }, { locals: { user } }, next) => {
  try {
    const data = await DiaryEntry.findById(id);

    if (!data) return next(NotFound());
    if (String(data.user) !== String(user.id)) return next(Unauthorized());

    Object.assign(data, body);
    await data.save();

    return next(SendData(data.response('cp')));
  } catch (error) {
    return next(ServerError(error));
  }
};

exports.delete = async ({ params: { id } }, { locals: { user } }, next) => {
  try {
    const data = await DiaryEntry.findById(id);

    if (!data) return next(NotFound());
    if (String(data.user) !== String(user.id)) return next(Unauthorized());

    await data.softDelete();

    return next(SendData({ message: 'Entry deleted successfully' }));
  } catch (error) {
    return next(ServerError(error));
  }
};
