// content.js — AutoFill AI Form Detection & Injection Engine
// Scans the active DOM inputs and matches them with profile fields.

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'AUTOFILL_FORM') {
    const profile = request.profile;
    const inputs = document.querySelectorAll('input, textarea, select');
    let filledCount = 0;

    inputs.forEach(input => {
      // Skip hidden/disabled fields
      if (input.type === 'hidden' || input.disabled || input.readOnly) return;

      // Identify potential matches based on label, name, id, placeholder
      const attributes = [
        input.name,
        input.id,
        input.placeholder,
        getLabelText(input),
        input.getAttribute('autocomplete')
      ].map(attr => (attr || '').toLowerCase());

      let valueToFill = null;

      // 1. Email Check
      if (matchesAny(attributes, ['email', 'mail'])) {
        valueToFill = profile.email;
      }
      // 2. Phone Check
      else if (matchesAny(attributes, ['phone', 'tel', 'mobile', 'contact'])) {
        valueToFill = profile.phone;
      }
      // 3. First Name
      else if (matchesAny(attributes, ['firstname', 'first_name', 'fname'])) {
        valueToFill = profile.firstName;
      }
      // 4. Last Name
      else if (matchesAny(attributes, ['lastname', 'last_name', 'lname'])) {
        valueToFill = profile.lastName;
      }
      // 5. Full Name / Name
      else if (matchesAny(attributes, ['fullname', 'full_name', 'name', 'username'])) {
        valueToFill = profile.name;
      }
      // 6. Zipcode / Postal code
      else if (matchesAny(attributes, ['zip', 'zipcode', 'postal', 'pincode', 'pin'])) {
        valueToFill = profile.zipcode;
      }
      // 7. City
      else if (matchesAny(attributes, ['city', 'town'])) {
        valueToFill = profile.city;
      }
      // 8. State
      else if (matchesAny(attributes, ['state', 'province', 'region'])) {
        valueToFill = profile.state;
      }
      // 9. Country
      else if (matchesAny(attributes, ['country'])) {
        valueToFill = profile.country;
      }
      // 10. Address
      else if (matchesAny(attributes, ['address', 'street', 'line1'])) {
        valueToFill = profile.address;
      }
      // 11. Passport
      else if (matchesAny(attributes, ['passport', 'passportno'])) {
        valueToFill = profile.passport;
      }
      // 12. Aadhaar
      else if (matchesAny(attributes, ['aadhaar', 'uidai'])) {
        valueToFill = profile.aadhaar;
      }
      // 13. PAN
      else if (matchesAny(attributes, ['pan', 'pancard'])) {
        valueToFill = profile.pan;
      }

      // Fill value if found
      if (valueToFill) {
        input.value = valueToFill;
        filledCount++;

        // Trigger standard browser events so framework bindings (React, Vue) detect changes
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    sendResponse({ success: filledCount > 0, filledCount });
  }
  return true; // Keep message channel open for async response
});

// Helper: matches input attributes against search tokens
function matchesAny(attributes, tokens) {
  return attributes.some(attr => {
    return tokens.some(token => attr.includes(token));
  });
}

// Helper: Finds text label associated with input
function getLabelText(input) {
  // Option 1: check labeled elements
  if (input.id) {
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (label) return label.innerText;
  }

  // Option 2: check parent node
  let parent = input.parentElement;
  while (parent) {
    if (parent.tagName === 'LABEL') {
      return parent.innerText;
    }
    parent = parent.parentElement;
  }

  // Option 3: check siblings
  let prev = input.previousElementSibling;
  if (prev && (prev.tagName === 'SPAN' || prev.tagName === 'DIV' || prev.tagName === 'LABEL')) {
    return prev.innerText;
  }

  return '';
}
