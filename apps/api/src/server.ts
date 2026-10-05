// Vercel이 src/server.ts를 서버 진입 파일로 인식하므로 Express 앱을 여기서 만들고 바로 listen 한다.
// 로컬 개발(dev/start)도 같은 진입 파일을 쓴다.
import cors from 'cors';
import express from 'express';
import { expressMiddleware } from '@as-integrations/express5';
import { createApolloServer } from './index';

const PORT = Number(process.env.PORT ?? 4000);

// CORS_ORIGINS(쉼표 구분)가 없으면 지금처럼 모든 출처를 허용한다.
const origins = process.env.CORS_ORIGINS?.split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const server = createApolloServer();
server.startInBackgroundHandlingStartupErrorsByLoggingAndFailingAllRequests();

const app = express();
app.use(
  '/',
  cors({ origin: origins && origins.length > 0 ? origins : true }),
  express.json(),
  expressMiddleware(server),
);

app.listen(PORT, () => {
  console.log(`GraphQL 서버 시작: http://localhost:${PORT}/`);
});
