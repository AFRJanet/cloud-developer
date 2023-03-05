import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const s3Bucket = new XAWS.S3({ signatureVersion: 'v4' })

const bucketName = process.env.ATTACHMENT_S3_BUCKET

export async function createUploadPresignedUrl(todoId: string): Promise<string>
{
   const url = await s3Bucket.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: todoId,
      Expires: urlExpiration
   });

   return url as string
}