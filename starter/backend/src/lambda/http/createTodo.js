import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import { v4 as uuid } from 'uuid';
import { getUserId } from '../../lambda/utils.mjs';
import { Create } from '../../businessLogic/todos.mjs';
import { createLogger } from '../../utils/logger.mjs';

const logger = createLogger('Log create');
export const handler = middy().use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
  .handler(async (event) => {
    logger.info(`Creating... `)
    const todoId = uuid();
    const { name, dueDate } = JSON.parse(event.body);
    const userId = getUserId(event.headers.Authorization);
    const newTodo = { todoId, userId, name, dueDate, createdAt: new Date().toISOString(), done: false };
    await Create(newTodo);
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        item: newTodo
      })
    }
  })
