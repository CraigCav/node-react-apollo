import React from 'react';
import path from 'path';
import fs from 'fs';
import { ApolloClient, createNetworkInterface, ApolloProvider, renderToStringWithData } from 'react-apollo';
import ReactDOM from 'react-dom/server';
import App from '../src/app';
import { InMemoryCache } from 'apollo-cache-inmemory';
import 'isomorphic-fetch';

const networkInterface = createNetworkInterface({
  uri: 'http://localhost:4000/graphql',
  opts: {
    credentials: 'same-origin'
  }
});

const client = new ApolloClient({
  networkInterface,
  ssrMode: true,
  dataIdFromObject: o => o.id,
  cache: new InMemoryCache()
});

const app = (
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);

export default (req, res) => {
  const filePath = path.resolve(__dirname, '..', 'public', 'index.html');
  const { cache } = client;

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
          .replace(`</body>`, `<script src="/static/bundle.js" charSet="UTF-8" /></body>`)
      );
      res.end();
    });
  });
};
