document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector('.comment-form');
    const textarea = form.querySelector('textarea');
  
    form.addEventListener('submit', (e) => {
      if (textarea.value.trim() === "") {
        e.preventDefault();
        alert("Please write a comment before submitting.");
      }
    });
  });
  