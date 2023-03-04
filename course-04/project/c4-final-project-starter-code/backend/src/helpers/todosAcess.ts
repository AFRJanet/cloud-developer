import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import { CreateTodoRequest } from '../requests/CreateTodoRequest'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const todosTable = process.env.TODOS_TABLE

const docClient = new XAWS.DynamoDB.DocumentClient()

const s3 = new XAWS.S3({
   signatureVersion: 'v4'
})


async function createTodo(newTodo: CreateTodoRequest, todoId:string, userId:string, event: any) {
   const timestamp = new Date().toISOString()
   const newTodo = JSON.parse(event.body)
 
   const newItem = {
     todoId,
     userId,
     timestamp,
     ...newTodo
   //   imageUrl: `https://${bucketName}.s3.amazonaws.com/${imageId}`
   }
 
   await docClient
     .put({
       TableName: todosTable,
       Item: newItem
     })
     .promise()
 
   return newTodo
 }



function getUploadUrl(imageId: string) {
   return s3.getSignedUrl('putObject', {
     Bucket: bucketName,
     Key: imageId,
     Expires: urlExpiration
   })
 }
 