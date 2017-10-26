const express = require('express');
const schema = require('./graphql/schema');
const React = require('react');
const path = require('path');
const fs = require('fs');
const { ApolloClient } = require('apollo-client');
const { createHttpLink } = require('apollo-link-http');
const { InMemoryCache } = require('apollo-cache-inmemory');
const { ApolloProvider, renderToStringWithData } = require('react-apollo');
const ReactDOM = require('react-dom/server');
const proxy = require('http-proxy-middleware');

require('isomorphic-fetch');

// need to ignore styles for server render 😞
require('ignore-styles');

// make sure client es6 dependencies are transpiled to es5 before require-ing
require('babel-register')({
  ignore: /\/(build|node_modules)\//,
  presets: ['env', 'react-app']
});

const app = express();

const client = new ApolloClient({
  ssrMode: true,
  dataIdFromObject: o => o.id,
  cache: new InMemoryCache(),
  link: createHttpLink({ uri: 'http://localhost:4000/graphql' })
});

app.use('/css/app.css', express.static(__dirname + '/src/app.css'));
app.use('/css/index.css', express.static(__dirname + '/src/index.css'));
app.use('/static', proxy({ target: 'http://localhost:4002' }));

app.use((req, res) => {
  const filePath = path.resolve(__dirname, 'public', 'index.html');
  const { cache } = client;

  const App = require('./src/app').default;
  const app = React.createElement(ApolloProvider, { client }, React.createElement(App));

  fs.readFile(filePath, 'utf8', (err, htmlData) => {
    if (err) {
      console.error('read err', err);
      return res.status(404).end();
    }

    renderToStringWithData(app).then(content => {
      res.status(200);
      res.send(
        htmlData
          .replace(/%PUBLIC_URL%/g, ``)
          .replace(`<div id="root"></div>`, `<div id="root">${content}</div>`)
          .replace(
            `</body>`,
            `<script charSet="UTF-8">window.__APOLLO_STATE__=${JSON.stringify(cache.extract())};</script></body>`
          )
          .replace(`</body>`, `<script src="/static/js/bundle.js" charSet="UTF-8" /></body>`)
          .replace(`</head>`, `<link rel="stylesheet" media="screen" href="css/app.css"></head>`)
          .replace(`</head>`, `<link rel="stylesheet" media="screen" href="css/index.css"></head>`)
      );
      res.end();
    });
  });
});

app.listen(3000, () => {
  console.log('Web server listening on port 3000');
});
