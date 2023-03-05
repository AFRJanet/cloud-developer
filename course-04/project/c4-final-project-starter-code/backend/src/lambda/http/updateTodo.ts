import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodo } from '../../helpers/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId;
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);

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

    const result = updateTodo(updatedTodo, userId, todoId);

    if(result)
    {
      return {
        statusCode: 201,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          todoId: todoId,
          todo: updatedTodo
        })
      };
    } else {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'TodoId could not be updated'
        })
      };
    }
})

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  );
