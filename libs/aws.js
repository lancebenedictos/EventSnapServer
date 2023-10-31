const aws = require("aws-sdk");
const multer = require("multer");
const Resource = require("../models/Resource");

aws.config.update({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET,
  region: "us-east-1",
});

aws.config.credentials = new aws.SharedIniFileCredentials({
  profile: "default",
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024, // limit file size to 5MB
  },
});

const s3 = new aws.S3();

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

const uploadMiddleware = (req, res, next) => {
  // Use multer upload instance
  upload.array("files", 5)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    // Retrieve uploaded files
    const files = req.files;
    const errors = [];

    // Validate file types and sizes
    files.forEach((file) => {
      const allowedTypes = ["image/jpeg", "image/jpg", "video/mp4"];
      const maxSize = 15 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.mimetype)) {
        errors.push(`Invalid file type: ${file.originalname}`);
      }

      if (file.size > maxSize) {
        errors.push(`File too large: ${file.originalname}`);
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    req.files = files;
    next();
  });
};

const uploadFiles = async (files, bucket, eventId) => {
  const promises = [];
  files.forEach((file) => {
    const resource = new Resource();

    const params = {
      Bucket: bucket,
      Key: `${eventId}/${resource._id.toString()}.jpg`,
      Body: file.buffer,
    };
    promises.push(
      new Promise((resolve, reject) => {
        s3.upload(params, (err, data) => {
          if (err) return reject(err);
          const { Location } = data;
          resource.downloadUrl = Location;
          indexImage(file.buffer, `${eventId}-photos`, resource._id.toString());
          resource.save();
          resolve();
        });
      })
    );
  });

  await Promise.all(promises);

  return promises;
};

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

const getImage = async (key) => {
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

const findFaces = async (eventId, id) => {
  const key = `${eventId}/${id}.jpg`;
  const thumbnail = await getImage(key);

  const matches = await matchFaceInCollection(
    thumbnail.Body,
    `${eventId}-photos`
  );

  const resourceIds = matches.map((res) => res.Face.ExternalImageId);
  return await Resource.find({ _id: { $in: resourceIds } });
};
exports.uploadFiles = uploadFiles;
exports.uploadMiddleware = uploadMiddleware;
exports.createFaceCollection = createFaceCollection;
exports.matchFaceInCollection = matchFaceInCollection;
exports.indexImage = indexImage;
exports.uploadThumbnail = uploadThumbnail;
exports.findFaces = findFaces;
