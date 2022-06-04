require('dotenv/config');
const path = require('path');
const express = require('express');
const errorMiddleware = require('./error-middleware');
const ClientError = require('./client-error');
const db = require('./db');
const argon2 = require('argon2'); // eslint-disable-line

const app = express();
const publicPath = path.join(__dirname, 'public');

if (process.env.NODE_ENV === 'development') {
  app.use(require('./dev-middleware')(publicPath));
}

app.use(express.static(publicPath));
const jsonMiddleware = express.json();

app.use(jsonMiddleware);

app.get('/api/explore-images', (req, res, next) => {
  const sql = `
       select "imageUrl"
       from "photos"
  `;
  db.query(sql)
    .then(result => res.json(result.rows))
    .catch(err => next(err));
});

app.get('/api/explore-people', (req, res, next) => {
  const sql = `
      select "firstName",
            "lastName",
            "email",
            "location",
            "profileImageUrl",
            "userId"
       from "users"
  `;
  db.query(sql)
    .then(result => res.json(result.rows))
    .catch(err => next(err));
});

app.get('/api/photographer-profile/:userId', (req, res, next) => {
  const userId = Number(req.params.userId);
  if (!userId) {
    throw new ClientError(400, 'userId must be a positive integer');
  }
  const sql = `
      select "users"."firstName",
      "users"."lastName",
      "users"."email",
      "users"."location",
      "users"."coverImageUrl",
      "users"."profileImageUrl",
      array_agg("photos"."imageUrl") as "photos"
      from "users"
      left join "photos" using ("userId")
      where "users"."userId" = $1
      group by "users"."userId"
  `;

  const params = [userId];
  db.query(sql, params)
    .then(result => {
      const user = result.rows;
      if (user[0] === undefined) {
        res.status(404).json({ error: `Cannot find userId ${userId}` });
      } else {
        res.status(200).json(user);
      }
    })
    .catch(err => next(err));
});

app.post('/api/auth/sign-up', (req, res, next) => {
  const { username, password, location, firstName, lastName, email } = req.body;
  if (!username || !password) {
    throw new ClientError(400, 'username and password are required fields.');
  } else if (!firstName || !lastName) {
    throw new ClientError(400, 'firstName and lastName are required fields.');
  } else if (!email || !location) {
    throw new ClientError(400, 'location and email are required fields.');
  }
  argon2
    .hash(password)
    .then(hashedPassword => {
      const sql = `
      insert into "users" ("username", "hashedPassword", "location", "firstName", "lastName", "email", "createdAt")
      values ($1, $2, $3, $4, $5, $6, now())
      returning *;
      `;
      const params = [username, hashedPassword, location, firstName, lastName, email];
      db.query(sql, params)
        .then(result => {
          const account = result.rows[0];
          res.status(201).json(account);
        })
        .catch(err => next(err));
    })
    .catch(err => next(err));
});

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  process.stdout.write(`\n\napp listening on port ${process.env.PORT}\n\n`);
});
