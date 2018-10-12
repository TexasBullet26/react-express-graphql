# Changelog

## 2018-10-12

**Create the React App**

Install `Node`, `Yarn`, and `create-react-app` by running:

```sh
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
npm install --global yarn create-react-app
```

Create the app:

```sh
create-react-app react-express-graphql
```

## Create the GraphQL Server

Before writing the frontend, we need a server to connect to. Run the following commands to install the dependencies we need to get up and running:

```sh
yarn add express@4.16.3 cors@2.8.4 graphql@14.0.2 express-graphql@0.6.12 graphql-tag@2.9.2
```

Create a new directory in your project's `src` folder, named `server`:

```sh
mkdir src/server
```

Create a new file named `index.js` inside the server directory with the following code:

```javascript
const express = require('express');
const cors = require('cors');
const graphqlHTTP = require('express-graphql');
const gql = require('graphql-tag');
const { buildASTSchema } = require('graphql');

const POSTS = [
  { author: "John Doe", body: "Hello world" },
  { author: "Jane Doe", body: "Hi, planet!" },
];

const schema = buildASTSchema(gql`
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

const mapPost = (post, id) => post && ({ id, ...post });

const root = {
  posts: () => POSTS.map(mapPost),
  post: ({ id }) => mapPost(POSTS[id], id),
};

const app = express();
app.use(cors());
app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: root,
  graphiql: true,
}));

const port = process.env.PORT || 4000
app.listen(port);
console.log(`Running a GraphQL API server at localhost:${port}/graphql`);
```

**Explaination**:

We use the `require` tag to import our dependencies because native Node doesn't support the `import` tag yet.
Create React App uses `babel` to transpile the code before running it, which allows us to use the `import` syntax in the React code.

For now, this is using some mock data, which the `const POSTS` contains. Each item contains an `author` and a `body`.

The `gql` tag allows syntax highlighting for GraphQL in editor. It also parses the string and converts it to GraphQL AST.
We then build a schema using buildASTSchema. The schema is what defines the different types and allows us to say what the client can query.

We define a `Post` type, which contains an `id`, and `author`, and a `body`.

The `Query` type is a special type that lets us query the data.
Here, we're saying that `posts` will give you an array of `Post`s, but if we want a single `Post`, you can query it by calling `post` and passing in the ID.

```javascript
type Query {
  posts: [Post]
  post(id: ID!): Post
}

type Post {
  id: ID
  author: String
  body: String
}
```

When someone queries `posts`, it will run this function, providing an array of all the `POSTS`, using their index as an ID.

When you query `post`, it expects an `id` and will return the post at the given index.

```javascript
const mapPost = (post, id) => post && ({ id, ...post });

const root = {
  posts: () => POSTS.map(mapPost),
  post: ({ id }) => mapPost(POSTS[id], id),
};
```

Creating the server:

The `graphqlHTTP` function creates an Express server running GraphQL, which expects the resolves as `rootValue`,

The `graphiql` flag is optional and will run a server for us to more easily visualize the data and see the auto-generated documentation.

Running `app.listen` starts the GraphQL server.

```javascript
const app = express();
app.use(cors());
app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: root,
  graphiql: true,
}));

const port = process.env.PORT || 4000
app.listen(port);
console.log(`Running a GraphQL API server at localhost:${port}/graphql`);
```

To make sure we can run both the server and client at the same time, add the following dev dependencies:

```sh
yarn add -D nodemon@1.18.4 npm-run-all@4.1.3
```

Edit `package.json` file so that `scripts` section looks like:

```json
{
  "start": "npm-run-all --parallel watch:server start:web",
  "start:web": "react-scripts start",
  "start:server": "node src/server",
  "watch:server": "nodemon --watch src/server src/server",
  "build": "react-scripts build",
  "test": "react-scripts test --env=jsdom",
  "eject": "react-scripts eject"
},
```

Typing `yarn start` will now run the server and client at the same time. Whenever there are changes to the server, just the server will restart. Whenever there are changes to the frontend code, the page should automatically refresh with the changes.

Pointing your browser to `http://localhost:4000/graphql` will get the GraphiQL server. Use this after changing some code in the server to see the latest Schema and test queries.

![image](https://developer.okta.com/assets/blog/graphql-express-react/graphiql-743319c6b059cfd1ed5bc28394749854af242b7f56d5c8521d43e106d548e9f0.png)
