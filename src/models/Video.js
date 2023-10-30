import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    maxLength: 80,
  },
  description: { type: String, required: true, trim: true, minLength: 20 },
  createdAt: { type: Date, required: true, default: Date.now },
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, default: 0, required: true },
    rating: { type: Number, default: 0, required: true },
  },
});

// pre는 미들웨어라서 Video 모델이 생성되기 전에 있어야 함
videoSchema.pre('save', async function () {
  this.hashtags = this.hashtags[0].split(',').map((word) => {
    const returnWord = word.trim();
    return returnWord.startsWith('#') ? returnWord : `#${returnWord}`;
  });
});

const Video = mongoose.model('Video', videoSchema);

export default Video;
