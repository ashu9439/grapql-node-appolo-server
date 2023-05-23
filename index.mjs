import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import express from 'express';
import http from 'http';
import cors from 'cors';


const authors = [
  { id: 1, name: 'J. K. Rowling' },
  { id: 2, name: 'J. R. R. Tolkien' },
  { id: 3, name: 'Brent Weeks' }
];

const books = [
  { id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
  { id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
  { id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
  { id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
  { id: 5, name: 'The Two Towers', authorId: 2 },
  { id: 6, name: 'The Return of the King', authorId: 2 },
  { id: 7, name: 'The Way of Shadows', authorId: 3 },
  { id: 8, name: 'Beyond the Shadows', authorId: 3 }
];



// The GraphQL schema
const typeDefs = `#graphql
  type Book {
    id: Int!
    name: String!
    authorId: Int!
    author: Author
  }

  type Author {
    id: Int!
    name: String!
    books: [Book]
  }

  type Query {
    book(id: Int!): Book
    books: [Book]
    authors: [Author]
    author(id: Int!): Author
  }

  type Mutation {
    addBook(name: String!, authorId: Int!): Book
    addAuthor(name: String!): Author
  }
`;

// A map of functions which return data for the schema.

const resolvers = {
  Query: {
    book: (parent, args) => books.find(book => book.id === args.id),
    books: () => books,
    authors: () => authors,
    author: (parent, args) => authors.find(author => author.id === args.id),
  },
  Mutation: {
    addBook: (parent, args) => {
      const book = { id: books.length + 1, name: args.name, authorId: args.authorId };
      books.push(book);
      return book;
    },
    addAuthor: (parent, args) => {
      const author = { id: authors.length + 1, name: args.name };
      authors.push(author);
      return author;
    },
  },
  Book: {
    author: (parent) => authors.find(author => author.id === parent.authorId),
  },
  Author: {
    books: (parent) => books.filter(book => book.authorId === parent.id),
  },
};


const app = express();
const httpServer = http.createServer(app);

// Set up Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
await server.start();

app.use(
  cors(),
  express.json(),
  expressMiddleware(server),
);

await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
console.log(`🚀 Server ready at http://localhost:4000`);
