import Video from '../models/Video';

/*
Video.find({}, (error, videos) => {
  if(error){
    return res.render("server-error");
  }
    return res.render("home", {pageTitle: "Home", videos:[]});
});
*/
export const home = async (req, res) => {
  const videos = await Video.find({});
  return res.render("home", {pageTitle: "Home", videos});
  };
export const watch = (req, res) => {
  const { id } = req.params;
  return res.render('watch', { pageTitle: `watching`,  });
};
export const getEdit = (req, res) => {
  const { id } = req.params;
  return res.render('edit', { pageTitle: `Editing`,  });
};
export const postEdit = (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  return res.redirect(`/videos/${id}`);
};
export const getUpload = (req, res) => {
  return res.render('upload', { pageTitle: 'Upload Video' });
};
export const postUpload = (req, res) => {
  const { title, description, hashtags } = req.body;
  // console.log(title, description, hashtags);
  const video = new Video({
    title:title, // title, 과 같음
    description,
    createdAt: Date.now(),
    hashtags: hashtags.split(',').map(word => {
      if(word[0].trim() !=="#"){
        return word = `#${word}`
      }
      return word;
    }),
    meta: {
      views: 0,
      rating: 0,
    }
  })
  console.log(video);
  return res.redirect('/');
};
