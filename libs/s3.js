const aws = require("aws-sdk");
const Resource = require("../models/Resource");

aws.config.update({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET,
  region: "us-east-1",
});

aws.config.credentials = new aws.SharedIniFileCredentials({
  profile: "default",
});

const s3 = new aws.S3();

const uploadThumbnail = async (file, eventId, resourceId) => {
  const key = `${eventId}/${resourceId}.jpg`;
  const params = {
    Bucket: "event-thumbnails-1",
    Key: key,
    Body: file.buffer,
  };

  const promise = new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) reject(err);
      const { Location } = data;

      resolve(Location);
    });
  });
  return promise;
};

const getObject = async (key) => {
  return new Promise((resolve, reject) => {
    s3.getObject(
      {
        Key: key,
        Bucket: "event-thumbnails-1",
      },
      (err, data) => {
        if (err) return reject(err);
        resolve(data);
      }
    );
  });
};

const postObject = async (params) => {
  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) return reject(err);
      const { Location } = data;

      resolve(Location);
    });
  });
};

exports.uploadThumbnail = uploadThumbnail;
exports.getObject = getObject;
exports.postObject = postObject;
