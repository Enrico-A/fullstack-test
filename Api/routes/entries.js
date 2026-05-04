const express = require('express');

const controller = require('../controllers/entries');
const { isAuth } = require('../middlewares/isAuth');
const { validator } = require('../middlewares/validator');

const router = express.Router();

router.use(isAuth);

router
  .route('/')
  .get(validator({ query: 'listDiaryEntriesQuery' }), controller.get)
  .post(validator('createDiaryEntry'), controller.create);

router
  .route('/:id')
  .get(validator({ params: 'id' }), controller.getById)
  .patch(validator({ params: 'id', body: 'updateDiaryEntry' }), controller.update)
  .delete(validator({ params: 'id' }), controller.delete);

module.exports = router;
