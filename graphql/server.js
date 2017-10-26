const express = require('express');
const expressGraphQL = require('express-graphql');
const schema = require('./schema');

// need to ignore styles for server render 😞
require('ignore-styles');

// make sure client es6 dependencies are transpiled to es5 before require-ing
require('babel-register')({
  ignore: /\/(build|node_modules)\//,
  presets: ['env', 'react-app']
});

const app = express();

app.use(
  '/graphql',
  expressGraphQL({
    schema,
    graphiql: true
  })
);

app.listen(4000, () => {
  console.log('GraphQL server listening on port 4000');
});
