const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
const { getObject } = require("./s3");
const { Readable } = require("stream");
const buffer = require("buffer");

exports.extractFrameFromVideo = async (timestampInSeconds, key) => {
  // Get video data from S3

  try {
    // Convert video data to Buffer
    const data = await getObject(key);
    const videoBuffer = data.Body;
    const readableStream = new Readable();
    readableStream._read = () => {};
    readableStream.push(videoBuffer);
    readableStream.push(null);

    const frames = [];

    // Use fluent-ffmpeg to extract frame at the specified timestamp
    return new Promise((resolve, reject) => {
      ffmpeg(readableStream)
        .output("screenshot.png")
        .seek(timestampInSeconds)
        .run();
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};
