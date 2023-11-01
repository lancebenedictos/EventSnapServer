const Resource = require("../models/Resource");
const { extractFrameFromVideo } = require("./extractFrame");
const {
  createFaceCollection,
  matchFaceInCollection,
  indexImage,
  findFaces,
} = require("./rekognition");
const { uploadThumbnail, postObject } = require("./s3");

const uploadFiles = async (files, bucket, eventId) => {
  const promises = [];
  files.forEach(async (file) => {
    const resource = new Resource();

    const params = {
      Bucket: bucket,
      Key: `${eventId}/${resource._id.toString()}.${
        file.mimetype.includes("image") ? "jpg" : "mp4"
      }`,
      Body: file.buffer,
    };

    const location = await postObject(params);
    resource.downloadUrl = location;

    await indexImage(file.buffer, `${eventId}-photos`, resource._id.toString());

    resource.save();
  });

  await Promise.all(promises);

  return promises;
};

const indexVideo = async () => {};

exports.createFaceCollection = createFaceCollection;
exports.matchFaceInCollection = matchFaceInCollection;
exports.indexImage = indexImage;
exports.uploadThumbnail = uploadThumbnail;
exports.findFaces = findFaces;
exports.uploadFiles = uploadFiles;
