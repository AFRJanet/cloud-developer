import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteTodo } from '../../helpers/todos'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId;
    const userId = getUserId(event);

    if(!userId)
    {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'User does not exist'
        })
      };
    }

    const result = await deleteTodo(todoId, userId);

    if(result)
    {
      return {
        statusCode: 201,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          userId: userId,
          todoId: todoId,
          todoItem: result
        })
      };
    } else {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'TodoId could not be deleted'
        })
      };
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  );
