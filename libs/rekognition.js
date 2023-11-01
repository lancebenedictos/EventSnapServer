const aws = require("aws-sdk");
const { getObject } = require("./s3");
const Resource = require("../models/Resource");

aws.config.update({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET,
  region: "us-east-1",
});

aws.config.credentials = new aws.SharedIniFileCredentials({
  profile: "default",
});
const rekognition = new aws.Rekognition();

const matchFaceInCollection = async (imageBuffer, collectionId) => {
  const promise = new Promise((resolve, reject) => {
    rekognition.searchFacesByImage(
      {
        Image: { Bytes: imageBuffer },
        CollectionId: collectionId,
      },
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data.FaceMatches);
        }
      }
    );
  });

  return promise;
};

const indexImage = async (image, collectionId, externalId, maxFaces) => {
  console.log(image);
  const promise = new Promise((resolve, reject) => {
    rekognition.indexFaces(
      {
        Image: { Bytes: image.buffer },
        CollectionId: collectionId,
        ExternalImageId: externalId,
        MaxFaces: maxFaces,
      },
      (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log(data);
          resolve(data);
        }
      }
    );
  });

  return promise;
};

const createFaceCollection = (eventId) => {
  const promises = [];

  // unique faces (registering new face)
  promises.push(
    new Promise((resolve, reject) => {
      rekognition.createCollection({ CollectionId: eventId }, (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    })
  );

  // all images
  promises.push(
    new Promise((resolve, reject) => {
      rekognition.createCollection(
        { CollectionId: `${eventId}-photos` },
        (err, data) => {
          if (err) return reject(err);
          resolve(data);
        }
      );
    })
  );

  return Promise.all(promises);
};

const findFaces = async (eventId, id) => {
  const key = `${eventId}/${id}.jpg`;
  const thumbnail = await getObject(key);

  const matches = await matchFaceInCollection(
    thumbnail.Body,
    `${eventId}-photos`
  );

  const resourceIds = matches.map((res) => res.Face.ExternalImageId);
  return await Resource.find({ _id: { $in: resourceIds } });
};

const startFaceDetection = async (key) => {
  // Specify the S3 bucket name and video file key
  const params = {
    Video: {
      S3Object: {
        Bucket: "event-thumbnails-1",
        Name: key,
      },
    },
  };

  // Start face detection using Rekognition
  return new Promise((resolve, reject) => {
    rekognition.startFaceDetection(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.JobId);
      }
    });
  });
};

const getFaceDetection = async (jobId) => {
  return new Promise(async (resolve, reject) => {
    await pollJobStatus(jobId, (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
};

const pollJobStatus = async (jobId, cb) => {
  const params = { JobId: jobId };

  rekognition.getFaceDetection(params, (err, data) => {
    if (err) {
      reject(err);
    } else {
      const jobStatus = data.JobStatus;

      if (jobStatus === "SUCCEEDED") {
        // Job is complete, process the results or extract frames with detected faces
        cb(null, data);
      } else if (
        jobStatus === "IN_PROGRESS" ||
        jobStatus === "PARTIAL_COMPLETE"
      ) {
        setTimeout(() => pollJobStatus(jobId, cb), 5000); // Poll every 5 seconds
      } else {
        cb(new Error({ message: "Failed" }), null);
      }
    }
  });
};

exports.createFaceCollection = createFaceCollection;
exports.matchFaceInCollection = matchFaceInCollection;
exports.findFaces = findFaces;
exports.indexImage = indexImage;
exports.startFaceDetection = startFaceDetection;
exports.getFaceDetection = getFaceDetection;
