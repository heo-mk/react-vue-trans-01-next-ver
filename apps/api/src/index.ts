import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';

export function createApolloServer() {
  return new ApolloServer({
    typeDefs,
    resolvers,
  });
}

async function startServer() {
  const server = createApolloServer();
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

  await startStandaloneServer(server, {
    listen: { port },
  });

  console.log(`GraphQL 서버 시작: http://localhost:${port}/`);
}

// 직접 실행될 때만 서버를 구동
if (process.argv[1]?.replace(/\\/g, '/').endsWith('src/index.ts')) {
  startServer().catch((err) => {
    console.error('서버 시작 중 오류 발생:', err);
    process.exit(1);
  });
}
