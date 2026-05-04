const DiaryEntry = require('../models/diaryEntry');
const getter = require('../helpers/getter');
const { SendData, ServerError, NotFound, Unauthorized } = require('../helpers/response');

const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const getStartOfDay = value => new Date(`${value}T00:00:00.000Z`);
const getEndOfDay = value => new Date(`${value}T23:59:59.999Z`);

const findOwnedEntry = async ({ entryId, userId }) => {
  const entry = await DiaryEntry.findById(entryId);

  if (!entry) return NotFound();
  if (String(entry.user) !== String(userId)) return Unauthorized();

  return entry;
};

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
      // Include the full starting day in the filter range.
      filters.date.$gte = getStartOfDay(query.dateFrom);
    }

    if (query.dateTo) {
      // Include the full ending day in the filter range.
      filters.date.$lte = getEndOfDay(query.dateTo);
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
    const data = await findOwnedEntry({ entryId: id, userId: user.id });

    if (data.error) return next(data);

    return next(SendData(data.response('cp')));
  } catch (error) {
    return next(ServerError(error));
  }
};

exports.update = async ({ params: { id }, body }, { locals: { user } }, next) => {
  try {
    const data = await findOwnedEntry({ entryId: id, userId: user.id });

    if (data.error) return next(data);

    Object.assign(data, body);
    await data.save();

    return next(SendData(data.response('cp')));
  } catch (error) {
    return next(ServerError(error));
  }
};

exports.delete = async ({ params: { id } }, { locals: { user } }, next) => {
  try {
    const data = await findOwnedEntry({ entryId: id, userId: user.id });

    if (data.error) return next(data);

    await data.softDelete();

    return next(SendData({ message: 'Entry deleted successfully' }));
  } catch (error) {
    return next(ServerError(error));
  }
};
