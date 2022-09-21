import * as aws from "@pulumi/aws";
import * as fs from 'fs';
import Jimp from "jimp";
import { streamToBuffer } from "@jorgeferrero/stream-to-buffer";


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
    const object = client.getObject(params);
    const objectStream = object.createReadStream();
    const objectType = await fileTypeFromStream(objectStream)

    if (!objectType) {
        throw new Error("Could not determine file type");
    }

    if (!objectType.mime.startsWith("image/")) {
        console.log(`Object is not an image: ${objectName}`);
        return;
    }

    const buffer = await streamToBuffer(objectStream);

    fs.writeFile(objectName, buffer, (err) => {
        if (err) {
            throw err;
        }
    });

    const image = await Jimp.read(objectName);
    // await image.writeAsync(objectName + ".png");

    // Save object to disk


    // console.log(`Object is an image: ${objectName}`);
    // const objectEncoded = object.read().toString("base64");
    // // Convert to a buffer
    // console.log(`Object encoded: ${objectEncoded}`);
    // const buffer = Buffer.from(objectEncoded, "base64");
    // console.log(`Buffer: ${buffer}`);
    // const image = await Jimp.read(buffer);
    const processed = await image.getBufferAsync(Jimp.MIME_PNG);

    const params_put = {
        Bucket: event.Records[0].s3.bucket.name,
        Key: objectName,
        Body: processed,
        ContentType: "image/png",
    };
    await client.putObject(params_put).promise();

}