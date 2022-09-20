import * as aws from "@pulumi/aws";


export const onObjectCreatedHandler = async (event: aws.s3.BucketEvent) => {
    // https://github.com/sindresorhus/file-type/issues/535
    const { fileTypeFromStream } = await (eval('import("file-type")') as Promise<typeof import('file-type')>);

    const REGION = "us-east-2";
    const client = new aws.sdk.S3({ region: REGION });

    if (!event.Records || !event.Records[0]) {
        throw new Error("No records found in event");
    }

    const objectName = event.Records[0].s3.object.key;
    console.log(`Object created: ${objectName}`);

    const params = {
        Bucket: event.Records[0].s3.bucket.name,
        Key: objectName,
    };
    const object = client.getObject(params).createReadStream();
    console.log(await fileTypeFromStream(object))

}