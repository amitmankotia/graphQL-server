const { ApolloServer, gql } = require('apollo-server');
const { RESTDataSource } = require('apollo-datasource-rest');

class PoliceDataAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://data.police.uk/api';
  }

  async getForces() {
    return this.get(`forces`);
  }
  async getFoceInfoById(id){
    return this.get(`forces/${id}`);
  }

  // willSendRequest(request) {
  //   request.params.set('apiKey', this.context.apiKey);
  //   request.params.set('country', this.context.country);
  // }
}

const typeDefs = gql`
  # Comments in GraphQL are defined with the hash (#) symbol.

  # This "Force" type can be used in other type declarations.
  type Force {
    id: String
    name: String
  }

  # The "Query" type is the root of all GraphQL queries.
  type Query {
    Forces(id: String): [Force]
  }
`;

// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve forces from the "forces" array above.

const resolvers = {
  Query: {
    Forces : async (_source, { id }, { dataSources }) => {
      if (id) {
        const force = await dataSources.policeDataAPI.getFoceInfoById(id);
        return [force];
      } else {
        return await dataSources.policeDataAPI.getForces();
      }
    }
  },
};

// In the most basic sense, the ApolloServer can be started
// by passing type definitions (typeDefs) and the resolvers
// responsible for fetching the data for those types.

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => {
    return {
      policeDataAPI: new PoliceDataAPI()
    };
  },
  context: () => {
    return {
      // apiKey: 'b1aa965374644e34b41572a58a544715',
      // country: 'us'
    };
  }
});

// This `listen` method launches a web-server.  Existing apps
// can utilize middleware options, which we'll discuss later.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});