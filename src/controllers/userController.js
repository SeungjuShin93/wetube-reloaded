import { response } from 'express';
import User from '../models/User';
import bcrypt from 'bcrypt';
// import fetch from 'node-fetch';

export const getJoin = (req, res) => res.render('join', { pageTitle: 'Join' });
export const postJoin = async (req, res) => {
  const { name, username, email, password, password2, location } = req.body;
  const pageTitle = 'Join';
  if (password !== password2) {
    return res.status(400).render('join', {
      pageTitle: 'Join',
      errorMessage: 'Password confirmation does not match.',
    });
  }
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (exists) {
    return res.status(400).render('join', {
      pageTitle,
      errorMessage: 'This username/email is already taken.',
    });
  }
  try {
    await User.create({
      name,
      username,
      email,
      password,
      location,
    });
    return res.redirect('/login');
  } catch (error) {
    return res.status(400).render('join', {
      pageTitle,
      errorMessage: error._message,
    });
  }
};
export const getLogin = (req, res) =>
  res.render('login', { pageTitle: 'Login' });

export const postLogin = async (req, res) => {
  // check if account exists
  const { username, password } = req.body;
  const pageTitle = 'Login';
  const user = await User.findOne({ username, socialOnly: false });
  if (!user) {
    return res.status(400).render('login', {
      pageTitle,
      errorMessage: 'An account with this username does not exists.',
    });
  }
  // check if password correct
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render('login', {
      pageTitle,
      errorMessage: 'Wrong password',
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect('/');
};

export const startGithubLogin = (req, res) => {
  const baseUrl = 'https:github.com/login/oauth/authorize';
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: 'read:user user:email',
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = 'https://github.com/login/oauth/access_token';
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;

  // await를 두번쓰는게 아니라, then을 활용한다면
  /*
  fetch(finalUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
  })
    .then((response) => response.json())
    .then((json) => {
      if ('access_token' in json) {
        const { access_token } = tokenRequest;
        const apiUrl = 'https://api.github.com';
        fetch(`${apiUrl}/user`, {
          headers: {
            Authorization: `token ${access_token}`,
          },
        })
          .then((response) => response.json())
          .then((json) => {
            fetch(`${apiUrl}/user/emails`, {
              headers: {
                Authorization: `token ${access_token}`,
              },
            });
          });
      }
    });
  */
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    })
  ).json();
  if ('access_token' in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = 'https://api.github.com';
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    console.log(userData);
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      return res.redirect('login');
    }
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      const user = await User.create({
        avatarUrl: userData.avatar_url,
        name: userData.name,
        username: userData.login,
        email: emailObj.email,
        password: '',
        socialOnly: true,
        location: userData.location,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect('/');
  } else {
    return res.redirect('login');
  }
};

export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect('/');
};

export const getEdit = (req, res) => {
  return res.render('edit-profile', { pageTitle: 'Edit Profile' });
};

export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id, email: sessionEmail, username: sessionUsername },
    },
    body: { name, email, username, location },
  } = req;

  // 중복된 이메일이나 유저네임이 있는지 확인해서
  // 만약 중복이 되어 있다면 업데이트를 할 수 없도록
  // 아래 변수 선언은 위에서 구조 분해 할당으로 해결 가능
  // const sessionUsername = req.session.user.username;
  // const sessionEmail = req.session.user.email;
  if (sessionUsername !== username) {
    // 이때 기존의 username이랑 겹치는게 있는지 확인해줘야 한다
    const exists = await User.exists({ username });
    if (exists) {
      return res.status(400).render('edit-profile', {
        pageTitle: 'Edit Profile',
        errorMessage: 'This username is already taken.',
      });
    }
  }
  if (sessionEmail !== email) {
    const exists = await User.exists({ email });
    if (exists) {
      return res.status(400).render('edit-profile', {
        pageTitle: 'Edit Profile',
        errorMessage: 'This email is already taken.',
      });
    }
  }

  const updateUser = await User.findByIdAndUpdate(
    _id,
    {
      name,
      email,
      username,
      location,
    },
    { new: true }
  );
  req.session.user = updateUser;
  return res.redirect('/users/edit');
};

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly === true) {
    return res.redirect('/');
  }
  return res.render('users/change-password', { pageTitle: 'Change Password' });
};
export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { oldPassword, newPassword, newPasswordConfirmation },
  } = req;
  const pageTitle = 'Change Password';
  const user = await User.findById(_id);
  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) {
    return res.status(400).render('users/change-password', {
      pageTitle,
      errorMessage: 'The current password is incorrect',
    });
  }

  if (oldPassword === newPassword) {
    return res.status(400).render('users/change-password', {
      pageTitle,
      errorMessage: 'The old password equals new password',
    });
  }

  if (newPassword !== newPasswordConfirmation) {
    return res.status(400).render('users/change-password', {
      pageTitle,
      errorMessage: 'the password does not match the confirmation',
    });
  }
  console.log('Old Password ', user.password);
  user.password = newPassword;
  console.log('New unhashed pw ', user.password); // 해쉬 작동 전 확인용
  await user.save();
  console.log('new pw ', user.password); // 해쉬 작동 잘하나 확인용
  // send notification
  return res.redirect('/users/logout');
};
export const see = (req, res) => res.send('See User');
