export const localsMiddleware = (req, res, next) => {
  // if (req.sessions.loggedIn) {
  //  res.locals.loggenIn = true;
  // }
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  // 위 코드는 주석처리한 if문과 같은 코드
  res.locals.siteName = 'Wetube';
  res.locals.loggedInUser = req.session.user;
  console.log(res.locals);
  next();
};
