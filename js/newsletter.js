document.getElementById('newsletterForm').addEventListener('submit', async (e) => {
  e.preventDefault(); // Prevent page refresh

  const email = document.getElementById('emailInput').value;

  try {
    const response = await fetch('http://localhost:3000/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (response.ok) {
      showPopup(result.message); // Show success popup
      setTimeout(() => {
        window.location.reload(); // Refresh the page after 2 seconds
      }, 2000);
    } else {
      showPopup(result.message, true); // Show error popup
    }
  } catch (error) {
    console.error('Error:', error);
    showPopup('An error occurred. Please try again.', true); // Show error popup
  }
});

// Function to show the popup
function showPopup(message, isError = false) {
  const popup = document.createElement('div');
  popup.className = 'popup-message';
  popup.textContent = message;

  if (isError) {
    popup.style.backgroundColor = '#f44336'; // Red for errors
  } else {
    popup.style.backgroundColor = '#4CAF50'; // Green for success
  }

  document.body.appendChild(popup);

  // Remove the popup after 2 seconds
  setTimeout(() => {
    popup.remove();
  }, 2000);
}