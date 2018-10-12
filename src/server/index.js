const express = require('express');
const cors = require('cors');
const graphqlHTTP = require('express-graphql');
const gql = require('graphql-tag');
const {buildASTSchema} = require('graphql');

/* Using some mock data */
const POSTS = [
    {
        author: "Glenn Lanzer",
        body: "Hello world"
    }, {
        author: "Katie Copp",
        body: "Hi, planet!"
    }
];

/*
 *  gql tag allows syntax highlighting for GraphQL in editor. It also parses the string and converts it to GraphQL AST. *    We then build a schema using buildASTSchema. The schema is what defines the different types and allows us to say  *    what the client can query.
 *  We define a `Post` type, which contains an `id`, and `author`, and a `body`.
 *  The `Query` type is a special type that lets us query the data.
 *
 *  Here, we're saying that `posts` will give you an array of `Post`s, but if we want a single `Post`, you can query it
 *    by calling `post` and passing in the ID.
 */
const schema = buildASTSchema(gql `
    type Query {
        posts: [Post]
        post(id: ID!): Post
    }

    type Post {
        id: ID
        author: String
        body: String
    }
`);

/*
 *  When someone queries `posts`, it will run this function, providing an array of all the `POSTS`, using their index
 *    as an ID.
 *  When you query `post`, it expects an `id` and will return the post at the given index.
 */
const mapPost = (post, id) => post && ({
    id,
    ...post
});

const root = {
    posts: () => POSTS.map(mapPost),
    posts: ({id}) => mapPost(POSTS[id], id)
};

/*
 *  Creating the server:
 *    The `graphqlHTTP` function creates an Express server running GraphQL, which expects the resolves as `rootValue`,
 *    The `graphiql` flag is optional and will run a server for us to more easily visualize the data and see the
 *      auto-generated documentation.
 */
const app = express();
app.use(cors());
app.use('/graphql', graphqlHTTP({schema, rootValue: root, graphiql: true}));

/* Running `app.listen` starts the GraphQL server. */
const port = process.env.PORT || 4000
app.listen(port);
console.log(`Running a GraphQL API server at localhost:${port}/graphql`);
