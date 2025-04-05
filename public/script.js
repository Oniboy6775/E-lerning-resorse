document.addEventListener('DOMContentLoaded', () => {
    const commentForm = document.getElementById('comment-form');
    const commentsContainer = document.getElementById('comments');

    // Fetch and display comments when the page loads
    fetchComments();

    // Handle comment submission
    commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const comment = document.getElementById('comment').value;

        const response = await fetch('/comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, comment })
        });

        if (response.ok) {
            fetchComments(); // Refresh comments after posting
            commentForm.reset(); // Clear the form
        }
    });

    // Function to fetch and display comments
    async function fetchComments() {
        try {
            const response = await fetch('/comments');
            const comments = await response.json();
            commentsContainer.innerHTML = ''; // Clear existing comments

            comments.forEach(comment => {
                const commentDiv = document.createElement('div');
                commentDiv.className = 'comment';

                // Comment text and timestamp
                const commentText = document.createElement('div');
                commentText.className = 'comment-text';
                commentText.innerHTML = `
                    <strong>${comment.username}</strong>: ${comment.comment}
                    <div class="timestamp">${formatTimestamp(comment.timestamp)}</div>
                `;
                commentDiv.appendChild(commentText);

                // Display replies if they exist
                if (comment.replies && comment.replies.length > 0) {
                    comment.replies.forEach(reply => {
                        const replyDiv = document.createElement('div');
                        replyDiv.className = 'reply';
                        replyDiv.innerHTML = `
                            <strong>${reply.username}</strong>: ${reply.reply}
                            <div class="timestamp">${formatTimestamp(reply.timestamp)}</div>
                        `;
                        commentDiv.appendChild(replyDiv);
                    });
                }

                // Create a "Reply" button at the end of the comment div
                const replyButton = document.createElement('button');
                replyButton.textContent = 'Reply';
                replyButton.className = 'reply-button';
                commentDiv.appendChild(replyButton);

                // Create a container for the reply form (initially hidden)
                const replyFormContainer = document.createElement('div');
                replyFormContainer.className = 'reply-form';
                replyFormContainer.style.display = 'none'; // Hidden by default
                replyFormContainer.innerHTML = `
                    <input type="text" class="reply-username" placeholder="Your name" required>
                    <textarea class="reply-textarea" placeholder="Your reply" required></textarea>
                    <button class="send-reply-button">Send Reply</button>
                `;
                commentDiv.appendChild(replyFormContainer);

                // Show/hide reply form when "Reply" button is clicked
                replyButton.addEventListener('click', () => {
                    if (replyFormContainer.style.display === 'none') {
                        replyFormContainer.style.display = 'block'; // Show the form
                    } else {
                        replyFormContainer.style.display = 'none'; // Hide the form
                    }
                });

                // Handle reply submission
                const sendReplyButton = replyFormContainer.querySelector('.send-reply-button');
                const replyUsernameInput = replyFormContainer.querySelector('.reply-username');
                const replyTextarea = replyFormContainer.querySelector('.reply-textarea');

                sendReplyButton.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const replyUsername = replyUsernameInput.value;
                    const replyText = replyTextarea.value;

                    if (!replyUsername || !replyText) {
                        alert('Please enter your name and reply.');
                        return;
                    }

                    const replyResponse = await fetch(`/comments/${comment._id}/reply`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ username: replyUsername, reply: replyText })
                    });

                    if (replyResponse.ok) {
                        fetchComments(); // Refresh comments after replying
                    }
                });

                commentsContainer.appendChild(commentDiv);
            });
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    }

    // Function to format timestamp
    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString(); // Format as "MM/DD/YYYY, HH:MM:SS AM/PM"
    }
});