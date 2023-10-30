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

// export const formatHashtags = (hashtags) => {
//   return hashtags.split(',').map((word) => {
//     const returnWord = word.trim();
//     return returnWord.startsWith('#') ? returnWord : `#${returnWord}`;
//   });
// };
// 위와 같이 만들어서 videoController에 import해서 사용할 수도 있지만
// 아래처럼 static 함수로 커스터마이징해서
// Video.formatHashtags(hashtags), 이런식으로도 사용 가능

videoSchema.static('formatHashtags', function (hashtags) {
  return hashtags.split(',').map((word) => {
    const returnWord = word.trim();
    return returnWord.startsWith('#') ? returnWord : `#${returnWord}`;
  });
});

const Video = mongoose.model('Video', videoSchema);

export default Video;
