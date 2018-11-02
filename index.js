const express = require('express');
const mongoose = require('mongoose');
const app = express();

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

// DB config
const db = require('./config/keys').mongoURI;
// connect to mongoDB
mongoose
    .connect(db, {useNewUrlParser: true})
    .then(() => console.log('MONGODB connected'))
    .catch((err) => console.log(err))

app.use(express.json());

app.get('/', (req, res) => res.send('hello'));
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})