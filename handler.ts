import * as aws from "@pulumi/aws";

export const onObjectCreatedHandler = async (event: aws.s3.BucketEvent) => {
    if (!event.Records || !event.Records[0]) {
        throw new Error("No records found in event");
    }

    const objectName = event.Records[0].s3.object.key;
}