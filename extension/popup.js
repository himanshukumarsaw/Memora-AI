document.addEventListener('DOMContentLoaded', () => {
  const autofillBtn = document.getElementById('autofill-btn');

  // Hardcoded profile data matching the seed databases
  const mockProfile = {
    firstName: 'Himanshu',
    lastName: 'Kumar Saw',
    name: 'Himanshu Kumar Saw',
    email: 'himanshu@autofillai.com',
    phone: '+91 98765 43210',
    address: '123 Tech Lane, HSR Layout',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    zipcode: '560102',
    passport: 'Z1234567',
    aadhaar: '1234-5678-9012',
    pan: 'ABCDE1234F',
    education: 'B.Tech in Computer Science & Engineering',
    skills: 'React.js, Node.js, MongoDB, Chrome Extensions, Python'
  };

  autofillBtn.addEventListener('click', async () => {
    // Query active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (!activeTab) return;

      // Send the profile data to the content script running on the page
      chrome.tabs.sendMessage(activeTab.id, {
        action: 'AUTOFILL_FORM',
        profile: mockProfile
      }, (response) => {
        if (chrome.runtime.lastError) {
          alert('Cannot run autofill on this page. Refresh the page or make sure you are on a standard web page.');
        } else if (response && response.success) {
          alert('Form fields successfully completed by AutoFill AI!');
        } else {
          alert('No compatible form fields detected on this page.');
        }
      });
    });
  });
});
