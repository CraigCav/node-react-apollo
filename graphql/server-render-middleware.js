import React from 'react';
import path from 'path';
import fs from 'fs';
import { ApolloClient, createNetworkInterface, ApolloProvider, renderToStringWithData } from 'react-apollo';
import ReactDOM from 'react-dom/server';
import App from '../src/app';
import 'isomorphic-fetch';

const networkInterface = createNetworkInterface({
  uri: 'http://localhost:4000/graphql',
  opts: {
    credentials: 'same-origin'
  }
});

const client = new ApolloClient({
  networkInterface,
  dataIdFromObject: o => o.id
});

const app = (
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);

export default (req, res) => {
  const filePath = path.resolve(__dirname, '..', 'public', 'index.html');

  fs.readFile(filePath, 'utf8', (err, htmlData) => {
    if (err) {
      console.error('read err', err);
      return res.status(404).end();
    }

    renderToStringWithData(app).then(content => {
      res.status(200);
      res.send(htmlData.replace('{{SSR}}', content));
      res.end();
    });
  });
};
