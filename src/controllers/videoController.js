import Video from '../models/Video';
import Comment from '../models/Comment';
import User from '../models/User';

export const home = async (req, res) => {
  const videos = await Video.find({})
    .sort({ createdAt: '-1' })
    .populate('owner');
  return res.render('home', { pageTitle: 'Home', videos });
};
export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id).populate('owner').populate('comments');
  if (video === null) {
    return res.render('404', { pageTitle: 'Video not found' });
  }
  return res.render('watch', { pageTitle: `${video.title}`, video });
};
export const getEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render('404', { pageTitle: 'Video not found' });
  }
  if (String(video.owner) !== String(_id)) {
    req.flash('error', 'Not authorized');
    return res.status(403).redirect('/');
  }
  return res.render('edit', { pageTitle: `Edit: ${video.title}`, video });
};
export const postEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const { title, description, hashtags } = req.body;
  const video = await Video.exists({ _id: id });
  // 위에 findById 대신에 exists 쓰는건, 굳이 video obj가 필요 없고
  // 단지 true인지 false인지만 알면 되기 때문
  // 위에 getEdit에서는 video라는 obj를 pageTitle에 전달해야 하기 때문에
  // findById를 써야 함
  if (!video) {
    return res.render('404', { pageTitle: 'Video not found' });
  }
  const videoModified = await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });
  if (String(videoModified.owner) !== String(_id)) {
    req.flash('error', 'You are not the owner of the video');
    return res.status(403).redirect('/');
  }
  req.flash('success', 'Changes saved');
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render('upload', { pageTitle: 'Upload Video' });
};
export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { video, thumb } = req.files;
  const { title, description, hashtags } = req.body;
  const isRender = process.env.NODE_ENV === 'production';
  try {
    const newVideo = await Video.create({
      title,
      description,
      fileUrl: isRender ? video[0].location : video[0].path,
      thumbUrl: isRender ? thumb[0].location : thumb[0].path,
      owner: _id,
      hashtags: Video.formatHashtags(hashtags),
    });
    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();
    return res.redirect('/');
  } catch (error) {
    console.error(error);
    return res.status(400).render('upload', {
      pageTitle: 'Upload Video',
      errorMessage: error._message,
    });
  }
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  const user = await User.findById(_id);
  if (!video) {
    return res.render('404', { pageTitle: 'Video not found' });
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect('/');
  }
  await Video.findByIdAndDelete(id);
  user.videos.splice(user.videos.indexOf(id), 1);
  user.save();
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
    }).populate('owner');
  }
  return res.render('search', { pageTitle: 'Search', videos });
};

export const registerView = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  video.meta.views = video.meta.views + 1;
  await video.save();
  return res.sendStatus(200);
};

export const createComment = async (req, res) => {
  const {
    session: { user },
    body: { text },
    params: { id },
  } = req;

  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  });
  video.comments.push(comment._id);
  video.save();
  return res.status(201).json({ newCommentId: comment._id });
};

export const deleteComment = async (req, res) => {
  const {
    session: { user },
    params: { id },
  } = req;

  const comment = await Comment.findById(id);
  if (!comment) {
    return res.sendStatus(404);
  }
  if (String(comment.owner) === user._id) {
    await Comment.findByIdAndDelete(id);
    const video = await Video.findById(comment.video);
    const arr = video.comments;
    const indexComment = arr.findIndex((comment) => String(comment) === id);
    if (indexComment !== -1) {
      arr.splice(indexComment, 1);
    }
    video.save();
    return res.sendStatus(200);
  } else {
    return res.sendStatus(403);
  }
};
