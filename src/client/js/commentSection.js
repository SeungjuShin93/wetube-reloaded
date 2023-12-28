const videoContainer = document.getElementById('videoContainer');
const form = document.getElementById('commentForm');
const videoComments = document.querySelector('.video__comments ul');

const deleteComment = async (commentId) => {
  const deleteList = document.querySelector(
    `.video__comment[data-id="${commentId}"]`
  );

  const response = await fetch(`/api/comments/${commentId}`, {
    method: 'DELETE',
  });
  if (response.status === 200) {
    return deleteList.remove();
  }
  if (response.status === 403) {
    return alert('This is not your comment');
  }
};

videoComments.addEventListener('click', (event) => {
  const commentId = event.target.dataset.targetId;
  if (commentId) deleteComment(commentId);
});

const addComment = (text, id) => {
  const newComment = document.createElement('li');
  newComment.className = 'video__comment';
  newComment.dataset.id = id;
  const commentBox = document.createElement('div');
  commentBox.className = 'comment__box';
  const icon = document.createElement('i');
  icon.className = 'fa-solid fa-comment';
  const span = document.createElement('span');
  span.className = 'comment__text';
  span.innerText = ` ${text}`;
  const span2 = document.createElement('span');
  span2.innerText = ' ❌';
  span2.className = 'comment__delete';
  span2.dataset.targetId = id;
  newComment.appendChild(commentBox);
  commentBox.appendChild(icon);
  commentBox.appendChild(span);
  commentBox.appendChild(span2);
  videoComments.prepend(newComment);
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const textarea = form.querySelector('textarea');
  const text = textarea.value;
  const videoId = videoContainer.dataset.id;
  if (text === '') {
    return;
  }
  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });
  if (response.status === 201) {
    textarea.value = '';
    const { newCommentId } = await response.json();
    addComment(text, newCommentId);
  }
};
if (form) {
  form.addEventListener('submit', handleSubmit);
}
