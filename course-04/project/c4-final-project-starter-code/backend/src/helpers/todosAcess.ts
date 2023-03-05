import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import { CreateTodoRequest } from '../requests/CreateTodoRequest'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export class TodosAccess {

  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly s3BucketName = process.env.ATTACHMENT_S3_BUCKET,
    private readonly s3Bucket = new XAWS.S3({ signatureVersion: 'v4' })
  ) { }

   public async createTodo(todoItem: TodoItem): Promise<TodoItem> {

    const result = await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todoItem
      }).promise()

    logger.info(`New Todo item is created: ${result}`);
    return todoItem as TodoItem;
  }

  async deleteTodo(todoId: string, userId: string): Promise<string> {

    const result = await this.docClient.delete({
      TableName: this.todosTable,
      Key: {
        "userId": userId,
        "todoId": todoId
      }
    }).promise()

    logger.info(`TodoIt: ${todoId} is deleted. Result: ${result}.`);

    return "" as string
  }

  async createAttachmentPresignedUrl(todoId: string): Promise<string> {
    return await this.s3Bucket.getSignedUrl('putObject', {
      Bucket: this.s3BucketName,
      Key: todoId,
      Expires: urlExpiration
    }).promise()
  }

  async getTodosForUser(userId: string): Promise<TodoItem[]> {
    const params = {
      TableName: this.todosTable,
      KeyConditionExpression: "#userId = :userId",
      ExpressionAttributeNames: {
        "#userId": "userId"
      },
      ExpressionAttributeValues: {
        ":userId": userId
      }
    }

    const result = await this.docClient.query(params).promise()
    logger.info(`All Todos are requested from UserId: ${userId} with the result ${result}`)

    return result.Items as TodoItem[]
  }

  async updateTodo(todoUpdate: TodoUpdate, userId: string, todoId: string) : Promise<TodoUpdate> {
    const params = {
      TableName: this.todosTable,
      Key: {
          "userId": userId,
          "todoId": todoId
      },
      UpdateExpression: "set #a = :a, #b = :b, #c = :c",
      ExpressionAttributeNames: {
          "#a": "name",
          "#b": "dueDate",
          "#c": "done"
      },
      ExpressionAttributeValues: {
          ":a": todoUpdate['name'],
          ":b": todoUpdate['dueDate'],
          ":c": todoUpdate['done']
      },
      ReturnValues: "updated"
  };

  const result = await this.docClient.update(params).promise();
  logger.info(`The TodoId: ${todoId} is updated ${result}`)

  return result.Attributes as TodoUpdate;
  }
}