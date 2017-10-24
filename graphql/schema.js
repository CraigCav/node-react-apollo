const graphql = require('graphql');
const fetch = require('node-fetch');
const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLSchema, GraphQLList, GraphQLNonNull } = graphql;

const CompanyType = new GraphQLObjectType({
  name: 'Company',
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    users: {
      type: new GraphQLList(UserType),
      resolve(parentValue, args) {
        return fetch(`http://localhost:4001/companies/${parentValue.id}/users`)
          .then(res => res.json())
          .then(res => res.data);
      }
    }
  })
});

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: CompanyType,
      resolve(parentValue, args) {
        return fetch(`http://localhost:4001/companies/${parentValue.companyId}`).then(res => res.json());
      }
    }
  })
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return fetch(`http://localhost:4001/users/${args.id}`).then(res => res.json());
      }
    },
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return fetch(`http://localhost:4001/companies/${args.id}`).then(res => res.json());
      }
    }
  }
});

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addUser: {
      type: UserType,
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: GraphQLInt },
        companyId: { type: GraphQLString }
      },
      resolve(parentValue, { firstName, age, companyId }) {
        return fetch('http://localhost:4001/users', {
          method: 'post',
          body: JSON.stringify({ firstName, age, companyId })
        })
          .then(res => res.json())
          .then(res => res.data);
      }
    },
    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve(parentValue, { id }) {
        return fetch(`http://localhost:4001/users/${id}`, {
          method: 'delete'
        })
          .then(res => res.json())
          .then(res => res.data);
      }
    }
  }
});

module.exports = new GraphQLSchema({
  mutation,
  query: RootQuery
});
