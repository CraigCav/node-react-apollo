import React, { Component } from 'react';
import { gql, graphql } from 'react-apollo';
import PropTypes from 'prop-types';
import './App.css';

class App extends Component {
  static propTypes = {
    data: PropTypes.shape({
      user: PropTypes.object
    }).isRequired
  };
  render() {
    const { user } = this.props.data;
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Welcome to React: {user && user.firstName}</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

const query = gql`
  query CurrentUser($id: String!) {
    user(id: $id) {
      id
      firstName
    }
  }
`;

export default graphql(query, { options: { variables: { id: '40' } } })(App);
