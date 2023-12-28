const videoContainer = document.getElementById('videoContainer');
const form = document.getElementById('commentForm');

const addComment = (text, id) => {
  const videoComments = document.querySelector('.video__comments ul');
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
