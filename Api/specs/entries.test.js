const supertest = require('supertest');

const app = require('../app');
const db = require('../db/connect-test');
const DiaryEntry = require('../models/diaryEntry');
const User = require('../models/user');
const { genereteAuthToken } = require('../helpers/auth');

const agent = supertest.agent(app);

jest.mock('../helpers/secrets.js');

let user;
let otherUser;
let userToken;
let firstUserEntry;
let secondUserEntry;
let otherUserEntry;

beforeAll(async () => db.connect());

beforeEach(async () => {
  await db.clear();

  user = await new User({
    name: 'Diary',
    lastname: 'Owner',
    email: 'diary.owner@meblabs.com',
    password: 'testtest',
    active: true
  }).save();

  otherUser = await new User({
    name: 'Another',
    lastname: 'User',
    email: 'another.user@meblabs.com',
    password: 'testtest',
    active: true
  }).save();

  userToken = genereteAuthToken(user).token;

  firstUserEntry = await new DiaryEntry({
    user: user.id,
    type: 'expense',
    amount: 12.5,
    date: '2024-04-01',
    category: 'Food',
    description: 'Lunch with team',
    notes: 'Paid by card'
  }).save();

  secondUserEntry = await new DiaryEntry({
    user: user.id,
    type: 'income',
    amount: 2500,
    date: '2024-04-03',
    category: 'Salary',
    description: 'Monthly salary',
    notes: 'April payment'
  }).save();

  otherUserEntry = await new DiaryEntry({
    user: otherUser.id,
    type: 'expense',
    amount: 80,
    date: '2024-04-02',
    category: 'Transport',
    description: 'Train ticket',
    notes: 'Business trip'
  }).save();
});

afterEach(async () => jest.clearAllMocks());
afterAll(async () => db.close());

describe('GET /entries', () => {
  test('requires authentication', () => agent.get('/entries').expect(401));

  test('returns only authenticated user entries ordered by date desc', () =>
    agent
      .get('/entries')
      .set('Cookie', `accessToken=${userToken}`)
      .expect(200)
      .then(res => {
        expect(res.body).toHaveLength(2);
        expect(res.body.map(entry => entry._id)).toStrictEqual([secondUserEntry.id, firstUserEntry.id]);
        expect(res.body.every(entry => entry._id !== otherUserEntry.id)).toBe(true);
      }));

  test('filters entries by query parameters', () =>
    agent
      .get('/entries?type=expense&category=Food&description=lunch&dateFrom=2024-04-01&dateTo=2024-04-01')
      .set('Cookie', `accessToken=${userToken}`)
      .expect(200)
      .then(res =>
        expect(res.body).toStrictEqual([
          {
            _id: firstUserEntry.id,
            type: 'expense',
            amount: 12.5,
            date: new Date('2024-04-01').toISOString(),
            category: 'Food',
            description: 'Lunch with team',
            notes: 'Paid by card',
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          }
        ])
      ));

  test('validates the list query', () =>
    agent
      .get('/entries?type=invalid')
      .set('Cookie', `accessToken=${userToken}`)
      .expect(400)
      .then(res =>
        expect(res.body).toStrictEqual({
          error: 200,
          message: 'Validation error',
          data: '/type'
        })
      ));
});

describe('POST /entries', () => {
  test('creates a new entry for the authenticated user', () =>
    agent
      .post('/entries')
      .set('Cookie', `accessToken=${userToken}`)
      .send({
        type: 'expense',
        amount: 20,
        date: '2024-04-05',
        category: 'Health',
        description: 'Pharmacy order',
        notes: 'Rounded by model hook'
      })
      .expect(201)
      .then(res => {
        expect(res.body).toStrictEqual({
          _id: expect.any(String),
          type: 'expense',
          amount: 20,
          date: new Date('2024-04-05').toISOString(),
          category: 'Health',
          description: 'Pharmacy order',
          notes: 'Rounded by model hook',
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        });

        return DiaryEntry.findById(res.body._id);
      })
      .then(entry => {
        expect(String(entry.user)).toBe(String(user.id));
        expect(entry.amount).toBe(20);
      }));
});

describe('GET /entries/:id', () => {
  test('returns an owned entry', () =>
    agent
      .get(`/entries/${firstUserEntry.id}`)
      .set('Cookie', `accessToken=${userToken}`)
      .expect(200)
      .then(res =>
        expect(res.body).toStrictEqual({
          _id: firstUserEntry.id,
          type: 'expense',
          amount: 12.5,
          date: new Date('2024-04-01').toISOString(),
          category: 'Food',
          description: 'Lunch with team',
          notes: 'Paid by card',
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        })
      ));

  test('cannot return another user entry', () =>
    agent.get(`/entries/${otherUserEntry.id}`).set('Cookie', `accessToken=${userToken}`).expect(401));
});

describe('PATCH /entries/:id', () => {
  test('updates an owned entry', () =>
    agent
      .patch(`/entries/${firstUserEntry.id}`)
      .set('Cookie', `accessToken=${userToken}`)
      .send({
        amount: 15.46,
        notes: 'Updated note'
      })
      .expect(200)
      .then(res =>
        expect(res.body).toStrictEqual({
          _id: firstUserEntry.id,
          type: 'expense',
          amount: 15.46,
          date: new Date('2024-04-01').toISOString(),
          category: 'Food',
          description: 'Lunch with team',
          notes: 'Updated note',
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        })
      ));

  test('cannot update another user entry', () =>
    agent
      .patch(`/entries/${otherUserEntry.id}`)
      .set('Cookie', `accessToken=${userToken}`)
      .send({ notes: 'Forbidden update' })
      .expect(401));
});

describe('DELETE /entries/:id', () => {
  test('soft deletes an owned entry', () =>
    agent
      .delete(`/entries/${firstUserEntry.id}`)
      .set('Cookie', `accessToken=${userToken}`)
      .expect(200)
      .then(res => expect(res.body).toStrictEqual({ message: 'Entry deleted successfully' }))
      .then(() => DiaryEntry.findById(firstUserEntry.id))
      .then(entry => expect(entry).toBe(null))
      .then(() => DiaryEntry.findOne({ _id: firstUserEntry.id, deleted: true }))
      .then(entry => {
        expect(entry).not.toBe(null);
        expect(entry.deleted).toBe(true);
      }));

  test('cannot delete another user entry', () =>
    agent.delete(`/entries/${otherUserEntry.id}`).set('Cookie', `accessToken=${userToken}`).expect(401));
});
