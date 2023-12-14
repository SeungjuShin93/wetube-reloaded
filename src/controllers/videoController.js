import Video from '../models/Video';

export const home = async (req, res) => {
  const videos = await Video.find({}).sort({ createdAt: '-1' });
  return res.render('home', { pageTitle: 'Home', videos });
};
export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id).populate('owner');
  console.log(video);
  if (video === null) {
    return res.render('404', { pageTitle: 'Video not found' });
  }
  return res.render('watch', { pageTitle: `${video.title}`, video });
};
export const getEdit = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render('404', { pageTitle: 'Video not found' });
  }
  return res.render('edit', { pageTitle: `Edit: ${video.title}`, video });
};
export const postEdit = async (req, res) => {
  const { id } = req.params;
  const { title, description, hashtags } = req.body;
  const video = await Video.exists({ _id: id });
  // 위에 findById 대신에 exists 쓰는건, 굳이 video obj가 필요 없고
  // 단지 true인지 false인지만 알면 되기 때문
  // 위에 getEdit에서는 video라는 obj를 pageTitle에 전달해야 하기 때문에
  // findById를 써야 함
  if (!video) {
    return res.render('404', { pageTitle: 'Video not found' });
  }
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    // hashtags: formatHashtags(hashtags),
    hashtags: Video.formatHashtags(hashtags),
  });
  return res.redirect(`/videos/${id}`);
};
export const getUpload = (req, res) => {
  console.log(req.session);
  return res.render('upload', { pageTitle: 'Upload Video' });
};
export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { path: fileUrl } = req.file;
  const { title, description, hashtags } = req.body;
  try {
    await Video.create({
      title,
      description,
      fileUrl,
      owner: _id,
      hashtags: Video.formatHashtags(hashtags),
    });
    return res.redirect('/');
  } catch (error) {
    return res.status(400).render('upload', {
      pageTitle: 'Upload Video',
      errorMessage: error._message,
    });
  }
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  await Video.findByIdAndDelete(id);
  // delete video
  return res.redirect('/');
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: {
        // $regex: new RegExp(`^${keyword}`, 'i'), // keyword로 시작하는 단어만 검색
        $regex: new RegExp(keyword, 'i'),
      },
    });
  }
  return res.render('search', { pageTitle: 'Search', videos });
};
