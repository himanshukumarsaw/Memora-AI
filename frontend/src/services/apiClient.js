// apiClient.js — Mock Network Layer for 100% Static AutoFill AI Application
// Intercepts and simulates API endpoints client-side using localStorage.

// Helper to simulate network latency
const sleep = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

// Database seeding keys
const KEYS = {
  USER: 'mock_user',
  TOKEN: 'memora_token', // keep compatible with AuthContext
  DOCUMENTS: 'mock_documents',
  PROFILE: 'mock_profile',
  REMINDERS: 'mock_reminders',
  CHAT_SESSIONS: 'mock_chat_sessions',
  TIMELINE: 'mock_timeline',
  EMERGENCY: 'mock_emergency',
  INITIALIZED: 'mock_initialized'
};

// Initialize localStorage databases with mock data if not set
const initializeDatabase = () => {
  if (localStorage.getItem(KEYS.INITIALIZED)) return;

  const defaultUser = {
    id: 'user_1',
    name: 'Himanshu Kumar Saw',
    email: 'himanshu@autofillai.com',
    role: 'user',
    createdAt: new Date().toISOString()
  };

  const defaultProfile = {
    firstName: 'Himanshu',
    lastName: 'Kumar Saw',
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

  const defaultDocuments = [
    {
      id: 'doc_1',
      title: 'Indian_Passport.pdf',
      category: 'Identity',
      fileUrl: '#',
      sizeBytes: 1250000,
      isFavorite: true,
      isArchived: false,
      extractedText: 'REPUBLIC OF INDIA PASSPORT. Passport No: Z1234567. Name: Himanshu Kumar Saw. Date of Birth: 15/08/2002. Expiry Date: 20/09/2032.',
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'doc_2',
      title: 'Aadhaar_Card.pdf',
      category: 'Identity',
      fileUrl: '#',
      sizeBytes: 780000,
      isFavorite: false,
      isArchived: false,
      extractedText: 'GOVERNMENT OF INDIA. Aadhaar No: 1234-5678-9012. Name: Himanshu Kumar Saw. Address: 123 Tech Lane, HSR Layout, Bengaluru, Karnataka, 560102.',
      createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'doc_3',
      title: 'Graduation_Transcript.pdf',
      category: 'Education',
      fileUrl: '#',
      sizeBytes: 2400000,
      isFavorite: true,
      isArchived: false,
      extractedText: 'UNIVERSITY OF TECHNOLOGY. Transcript for Himanshu Kumar Saw. Major: Computer Science. CGPA: 9.2/10. Year: 2024.',
      createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
    }
  ];

  const defaultReminders = [
    {
      id: 'rem_1',
      title: 'Renew Passport',
      dueDate: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString(), // 60 days from now
      category: 'Identity',
      priority: 'high',
      isCompleted: false
    },
    {
      id: 'rem_2',
      title: 'Update Resume in Opportunity Hub',
      dueDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
      category: 'Career',
      priority: 'medium',
      isCompleted: false
    }
  ];

  const defaultTimeline = [
    { id: 'time_1', title: 'Graduated University', date: '2024-05-15', category: 'Education', desc: 'Completed B.Tech with 9.2 CGPA' },
    { id: 'time_2', title: 'Renewed Indian Passport', date: '2022-09-20', category: 'Identity', desc: 'Valid until 2032' }
  ];

  const defaultEmergency = {
    bloodGroup: 'O+',
    allergies: 'Peanuts, Penicillin',
    medications: 'None',
    emergencyContactName: 'Manoj Kumar Saw',
    emergencyContactPhone: '+91 98765 00000',
    insuranceProvider: 'Star Health Insurance',
    policyNumber: 'SH-9823-1123',
    qrToken: 'emergency_token_xyz_123'
  };

  localStorage.setItem(KEYS.USER, JSON.stringify(defaultUser));
  localStorage.setItem(KEYS.PROFILE, JSON.stringify(defaultProfile));
  localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(defaultDocuments));
  localStorage.setItem(KEYS.REMINDERS, JSON.stringify(defaultReminders));
  localStorage.setItem(KEYS.TIMELINE, JSON.stringify(defaultTimeline));
  localStorage.setItem(KEYS.EMERGENCY, JSON.stringify(defaultEmergency));
  localStorage.setItem(KEYS.INITIALIZED, 'true');
};

initializeDatabase();

// Database Accessor Helpers
const getDB = (key) => JSON.parse(localStorage.getItem(key) || '[]');
const setDB = (key, val) => localStorage.setItem(key, JSON.stringify(val));

// Mock Router Engine to simulate server API calls
const mockRouter = async (method, url, data = {}, params = {}) => {
  await sleep(350); // simulate network lag

  // ─── AUTH ENDPOINTS ──────────────────────────────────────────────────────────
  if (url === '/auth/login') {
    const { email } = data;
    const user = { id: 'user_1', name: 'Himanshu Kumar Saw', email: email || 'himanshu@autofillai.com', role: 'user' };
    localStorage.setItem('memora_user', JSON.stringify(user));
    localStorage.setItem(KEYS.TOKEN, 'mock_jwt_token_123456');
    return { data: { success: true, token: 'mock_jwt_token_123456', user } };
  }

  if (url === '/auth/register') {
    const { name, email } = data;
    const user = { id: 'user_1', name: name || 'New User', email: email || 'user@example.com', role: 'user' };
    localStorage.setItem('memora_user', JSON.stringify(user));
    localStorage.setItem(KEYS.TOKEN, 'mock_jwt_token_123456');
    return { data: { success: true, token: 'mock_jwt_token_123456', user } };
  }

  if (url === '/auth/me') {
    const user = JSON.parse(localStorage.getItem('memora_user') || localStorage.getItem(KEYS.USER));
    return { data: { success: true, user } };
  }

  if (url === '/auth/logout') {
    localStorage.removeItem('memora_user');
    localStorage.removeItem(KEYS.TOKEN);
    return { data: { success: true } };
  }

  if (url === '/auth/vault-setup') {
    return { data: { success: true } };
  }

  // ─── DOCUMENT ENDPOINTS ──────────────────────────────────────────────────────
  if (url === '/documents') {
    let docs = getDB(KEYS.DOCUMENTS);
    if (params && params.search) {
      const q = params.search.toLowerCase();
      docs = docs.filter(d => d.title.toLowerCase().includes(q) || d.extractedText.toLowerCase().includes(q));
    }
    if (params && params.category) {
      docs = docs.filter(d => d.category === params.category);
    }
    return { data: { success: true, data: docs } };
  }

  if (url.startsWith('/documents/') && method === 'GET') {
    const id = url.split('/')[2];
    const doc = getDB(KEYS.DOCUMENTS).find(d => d.id === id);
    if (!doc) throw { response: { status: 404, data: { message: 'Document not found' } } };
    return { data: { success: true, data: doc } };
  }

  if (url === '/documents/upload' && method === 'POST') {
    // data is a FormData object. Mock the file fields
    const fileObj = data.get ? data.get('file') : null;
    const fileName = fileObj ? fileObj.name : 'Uploaded_Document.pdf';
    const category = fileName.toLowerCase().includes('passport') ? 'Identity' :
                     fileName.toLowerCase().includes('aadhaar') || fileName.toLowerCase().includes('pan') ? 'Identity' :
                     fileName.toLowerCase().includes('marksheet') || fileName.toLowerCase().includes('transcript') ? 'Education' :
                     fileName.toLowerCase().includes('resume') ? 'Career' : 'Other';

    // Mock OCR text extraction based on filename
    let extractedText = `Mock OCR extracted content from ${fileName}. `;
    if (category === 'Identity') {
      extractedText += `Name: Himanshu Kumar Saw. Document Type: Passport/Card. Numbers: ${Math.floor(100000 + Math.random() * 900000)}.`;
    } else if (category === 'Education') {
      extractedText += `University Transcript. Student: Himanshu Kumar Saw. Course: CSE. Graduating GPA: 9.2.`;
    } else {
      extractedText += `Generic verified personal record for Himanshu Kumar Saw. Address matched.`;
    }

    const newDoc = {
      id: `doc_${Date.now()}`,
      title: fileName,
      category,
      fileUrl: '#',
      sizeBytes: fileObj ? fileObj.size : 1024000,
      isFavorite: false,
      isArchived: false,
      extractedText,
      createdAt: new Date().toISOString()
    };

    const docs = getDB(KEYS.DOCUMENTS);
    docs.unshift(newDoc);
    setDB(KEYS.DOCUMENTS, docs);

    // Also simulate updating the Profile if high confidence OCR
    if (category === 'Identity') {
      const prof = JSON.parse(localStorage.getItem(KEYS.PROFILE) || '{}');
      if (fileName.toLowerCase().includes('passport')) prof.passport = 'Z' + Math.floor(1000000 + Math.random() * 9000000);
      localStorage.setItem(KEYS.PROFILE, JSON.stringify(prof));
    }

    return { data: { success: true, data: newDoc } };
  }

  if (url.startsWith('/documents/') && method === 'DELETE') {
    const id = url.split('/')[2];
    const docs = getDB(KEYS.DOCUMENTS).filter(d => d.id !== id);
    setDB(KEYS.DOCUMENTS, docs);
    return { data: { success: true, message: 'Document deleted' } };
  }

  if (url.startsWith('/documents/') && url.endsWith('/name') && method === 'PATCH') {
    const id = url.split('/')[2];
    const docs = getDB(KEYS.DOCUMENTS).map(d => d.id === id ? { ...d, title: data.title } : d);
    setDB(KEYS.DOCUMENTS, docs);
    return { data: { success: true } };
  }

  if (url.startsWith('/documents/') && url.endsWith('/category') && method === 'PATCH') {
    const id = url.split('/')[2];
    const docs = getDB(KEYS.DOCUMENTS).map(d => d.id === id ? { ...d, category: data.category } : d);
    setDB(KEYS.DOCUMENTS, docs);
    return { data: { success: true } };
  }

  if (url.startsWith('/documents/') && url.endsWith('/favorite') && method === 'PATCH') {
    const id = url.split('/')[2];
    const docs = getDB(KEYS.DOCUMENTS).map(d => d.id === id ? { ...d, isFavorite: !d.isFavorite } : d);
    setDB(KEYS.DOCUMENTS, docs);
    return { data: { success: true } };
  }

  if (url.startsWith('/documents/') && url.endsWith('/archive') && method === 'PATCH') {
    const id = url.split('/')[2];
    const docs = getDB(KEYS.DOCUMENTS).map(d => d.id === id ? { ...d, isArchived: !d.isArchived } : d);
    setDB(KEYS.DOCUMENTS, docs);
    return { data: { success: true } };
  }

  if (url === '/documents/dashboard/stats') {
    const docs = getDB(KEYS.DOCUMENTS);
    const totalDocs = docs.length;
    const favorites = docs.filter(d => d.isFavorite).length;
    const storageUsed = docs.reduce((acc, curr) => acc + curr.sizeBytes, 0);

    const categories = docs.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + 1;
      return acc;
    }, {});

    return {
      data: {
        success: true,
        data: {
          totalDocuments: totalDocs,
          favoritesCount: favorites,
          storageBytesUsed: storageUsed,
          storageLimitBytes: 104857600, // 100MB free
          categoryDistribution: categories,
          activityLog: [
            { date: '2026-07-22', count: 2 },
            { date: '2026-07-21', count: 1 }
          ]
        }
      }
    };
  }

  // ─── PROFILE ENDPOINTS ───────────────────────────────────────────────────────
  if (url === '/profile') {
    const profile = JSON.parse(localStorage.getItem(KEYS.PROFILE));
    return { data: { success: true, data: profile } };
  }

  if (url === '/profile' && method === 'PUT') {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(data));
    return { data: { success: true, data } };
  }

  // ─── CHAT ENDPOINTS ──────────────────────────────────────────────────────────
  if (url === '/chat/message') {
    const { question } = data;
    const docs = getDB(KEYS.DOCUMENTS);
    const profile = JSON.parse(localStorage.getItem(KEYS.PROFILE) || '{}');

    let reply = `I've analyzed your secure documents vault. `;
    const qLower = question.toLowerCase();

    if (qLower.includes('passport')) {
      reply += `Your passport number is **${profile.passport || 'Z1234567'}** (extracted from Indian_Passport.pdf). It is set to expire on **September 20, 2032**, which is in about 6 years. I have already set a reminder for you 60 days in advance of the expiry date.`;
    } else if (qLower.includes('aadhaar') || qLower.includes('address')) {
      reply += `According to Aadhaar_Card.pdf, your registered address is **${profile.address}, ${profile.city}, ${profile.state} - ${profile.zipcode}**. Your Aadhaar Card number is **${profile.aadhaar || '1234-5678-9012'}**.`;
    } else if (qLower.includes('gpa') || qLower.includes('marks') || qLower.includes('education')) {
      reply += `From your Graduation_Transcript.pdf, you graduated in 2024 with a CGPA of **9.2/10** majoring in **Computer Science**.`;
    } else if (qLower.includes('autofill') || qLower.includes('extension')) {
      reply += `AutoFill AI browser extension connects directly with this dashboard profile. When you open any online form, the extension automatically extracts fields like Name, Email, Phone, Address, Zipcode, and document numbers, and fills them with one click.`;
    } else {
      reply += `Based on your profile, your name is **${profile.firstName} ${profile.lastName}** and your email is **${profile.email}**. If you need details on specific documents like your Passport or Aadhaar, just ask!`;
    }

    return {
      data: {
        success: true,
        data: {
          answer: reply,
          sources: docs.slice(0, 2).map(d => d.title)
        }
      }
    };
  }

  if (url === '/chat/sessions') {
    return { data: { success: true, data: [{ id: 'sess_1', title: 'General Document Query', createdAt: new Date().toISOString() }] } };
  }

  // ─── REMINDERS ENDPOINTS ─────────────────────────────────────────────────────
  if (url === '/reminders') {
    let rems = getDB(KEYS.REMINDERS);
    if (params && params.status === 'pending') rems = rems.filter(r => !r.isCompleted);
    return { data: { success: true, data: rems } };
  }

  if (url === '/reminders' && method === 'POST') {
    const rems = getDB(KEYS.REMINDERS);
    const newRem = {
      id: `rem_${Date.now()}`,
      ...data,
      isCompleted: false
    };
    rems.unshift(newRem);
    setDB(KEYS.REMINDERS, rems);
    return { data: { success: true, data: newRem } };
  }

  if (url.startsWith('/reminders/') && method === 'PUT') {
    const id = url.split('/')[2];
    const rems = getDB(KEYS.REMINDERS).map(r => r.id === id ? { ...r, ...data } : r);
    setDB(KEYS.REMINDERS, rems);
    return { data: { success: true } };
  }

  if (url.startsWith('/reminders/') && method === 'DELETE') {
    const id = url.split('/')[2];
    const rems = getDB(KEYS.REMINDERS).filter(r => r.id !== id);
    setDB(KEYS.REMINDERS, rems);
    return { data: { success: true } };
  }

  if (url.startsWith('/reminders/') && url.endsWith('/snooze') && method === 'PATCH') {
    const id = url.split('/')[2];
    const hours = data.hours || 24;
    const rems = getDB(KEYS.REMINDERS).map(r => {
      if (r.id === id) {
        const d = new Date(r.dueDate);
        d.setHours(d.getHours() + hours);
        return { ...r, dueDate: d.toISOString() };
      }
      return r;
    });
    setDB(KEYS.REMINDERS, rems);
    return { data: { success: true } };
  }

  // ─── EMERGENCY ENDPOINTS ─────────────────────────────────────────────────────
  if (url === '/emergency/profile') {
    const profile = JSON.parse(localStorage.getItem(KEYS.EMERGENCY));
    return { data: { success: true, data: profile } };
  }

  if (url === '/emergency/profile' && method === 'PUT') {
    localStorage.setItem(KEYS.EMERGENCY, JSON.stringify(data));
    return { data: { success: true, data } };
  }

  if (url.startsWith('/emergency/public/')) {
    const profile = JSON.parse(localStorage.getItem(KEYS.EMERGENCY));
    return { data: { success: true, data: profile } };
  }

  // ─── TIMELINE ENDPOINTS ──────────────────────────────────────────────────────
  if (url === '/timeline') {
    const timeline = getDB(KEYS.TIMELINE);
    return { data: { success: true, data: timeline } };
  }

  if (url === '/timeline' && method === 'POST') {
    const timeline = getDB(KEYS.TIMELINE);
    const newItem = { id: `time_${Date.now()}`, ...data };
    timeline.unshift(newItem);
    timeline.sort((a, b) => new Date(b.date) - new Date(a.date));
    setDB(KEYS.TIMELINE, timeline);
    return { data: { success: true, data: newItem } };
  }

  if (url.startsWith('/timeline/') && method === 'DELETE') {
    const id = url.split('/')[2];
    const timeline = getDB(KEYS.TIMELINE).filter(t => t.id !== id);
    setDB(KEYS.TIMELINE, timeline);
    return { data: { success: true } };
  }

  // ─── SHARING ENDPOINTS ───────────────────────────────────────────────────────
  if (url === '/share' && method === 'POST') {
    const token = 'share_' + Math.random().toString(36).substring(2, 10);
    return {
      data: {
        success: true,
        data: {
          shareLink: `${window.location.origin}/share/${token}`,
          token,
          expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString()
        }
      }
    };
  }

  if (url.startsWith('/share/access/')) {
    const docs = getDB(KEYS.DOCUMENTS);
    return { data: { success: true, data: docs[0] || { title: 'Shared_Doc.pdf', category: 'Identity' } } };
  }

  // ─── RESUME ENDPOINTS ────────────────────────────────────────────────────────
  if (url === '/resume' && method === 'POST') {
    const profile = JSON.parse(localStorage.getItem(KEYS.PROFILE) || '{}');
    const textContent = `
=========================================
${profile.firstName || 'HIMANSHU'} ${profile.lastName || 'KUMAR SAW'}
=========================================
Email: ${profile.email || 'himanshu@autofillai.com'}
Phone: ${profile.phone || '+91 98765 43210'}
Address: ${profile.address || 'HSR Layout'}, ${profile.city || 'Bengaluru'}, ${profile.state || 'Karnataka'}

SUMMARY
-----------------------------------------
Ambitious Software Engineer specialized in web development and intelligent form automations. Experience in React.js, Express, and Chrome Extension development.

EDUCATION
-----------------------------------------
- ${profile.education || 'B.Tech in Computer Science'} (Graduated: 2024)

TECHNICAL SKILLS
-----------------------------------------
- Languages/Frameworks: ${profile.skills || 'React.js, Node.js, JavaScript, TailwindCSS'}
- Database & Tools: MongoDB, Git, Chrome Extension Manifest V3

IDENTIFICATION & VERIFICATIONS (MOCKED PREVIEW)
-----------------------------------------
- Aadhaar: ${profile.aadhaar || 'Verified'}
- Passport Status: ${profile.passport ? 'Linked and Active' : 'Not Loaded'}
- PAN Status: ${profile.pan || 'Linked'}
`;
    return {
      data: {
        success: true,
        data: {
          id: 'res_draft_1',
          previewText: textContent
        }
      }
    };
  }

  if (url.startsWith('/resume/') && method === 'GET') {
    // simulate download file blob
    return {
      data: new Blob(['Resume content mock file'], { type: 'text/plain' })
    };
  }

  // ─── AUTOFILL ENDPOINTS ──────────────────────────────────────────────────────
  if (url === '/autofill/analyze' && method === 'POST') {
    const profile = JSON.parse(localStorage.getItem(KEYS.PROFILE) || '{}');
    return {
      data: {
        success: true,
        data: {
          formId: 'form_' + Date.now(),
          totalFieldsDetected: 6,
          suggestedFields: [
            { fieldName: 'First Name', value: profile.firstName || 'Himanshu', confidence: 100 },
            { fieldName: 'Last Name', value: profile.lastName || 'Kumar Saw', confidence: 100 },
            { fieldName: 'Email Address', value: profile.email || 'himanshu@autofillai.com', confidence: 100 },
            { fieldName: 'Mobile Number', value: profile.phone || '+91 98765 43210', confidence: 95 },
            { fieldName: 'ZIP Code', value: profile.zipcode || '560102', confidence: 90 },
            { fieldName: 'Passport Number', value: profile.passport || 'Z1234567', confidence: 90 }
          ]
        }
      }
    };
  }

  if (url === '/autofill/export') {
    return {
      data: new Blob(['Autofilled form content mock file export'], { type: 'text/plain' })
    };
  }

  // ─── GRAPH / OPPORTUNITIES / ADMIN ───────────────────────────────────────────
  if (url === '/graph/nodes') {
    return {
      data: {
        success: true,
        data: {
          nodes: [
            { id: '1', label: 'Himanshu Kumar Saw', group: 'profile' },
            { id: '2', label: 'Indian Passport (Z1234567)', group: 'document' },
            { id: '3', label: 'Aadhaar Card', group: 'document' },
            { id: '4', label: 'B.Tech CS Degree', group: 'education' },
            { id: '5', label: 'Bengaluru Residence', group: 'location' }
          ],
          edges: [
            { from: '1', to: '2', label: 'owns' },
            { from: '1', to: '3', label: 'owns' },
            { from: '1', to: '4', label: 'obtained' },
            { from: '1', to: '5', label: 'lives' }
          ]
        }
      }
    };
  }

  if (url === '/opportunities') {
    return {
      data: {
        success: true,
        data: [
          { id: 'op_1', title: 'Senior React Developer (Remote)', company: 'Autofill AI Inc.', reqs: 'React, Tailwind, Node.js', match: 92, link: '#' },
          { id: 'op_2', title: 'AI Automation Internship', company: 'Deep Intelligence Corp.', reqs: 'Javascript, Chrome Extensions', match: 88, link: '#' }
        ]
      }
    };
  }

  if (url === '/opportunities/check') {
    return { data: { success: true, eligible: true, score: 92, matchingReason: 'Skills match: React.js, Node.js, Chrome Extensions.' } };
  }

  if (url === '/admin/dashboard' || url === '/admin/analytics') {
    return {
      data: {
        success: true,
        data: {
          totalUsersCount: 1,
          totalDocumentsUploaded: getDB(KEYS.DOCUMENTS).length,
          systemUptime: '99.99%',
          apiCallsCount: 142
        }
      }
    };
  }

  // Default fallback response
  return { data: { success: true, message: 'Mock response success', data: {} } };
};

// Drop-in replacement for Axios Client object
const api = {
  get: (url, config = {}) => mockRouter('GET', url, null, config.params),
  post: (url, data = {}, config = {}) => mockRouter('POST', url, data, config.params),
  put: (url, data = {}, config = {}) => mockRouter('PUT', url, data, config.params),
  delete: (url, config = {}) => mockRouter('DELETE', url, null, config.params),
  patch: (url, data = {}, config = {}) => mockRouter('PATCH', url, data, config.params),

  // Dummy interceptors to avoid breaking AuthContext or other parts of the app
  interceptors: {
    request: {
      use: (successCb, errorCb) => {
        // dummy request interceptor registration
      }
    },
    response: {
      use: (successCb, errorCb) => {
        // dummy response interceptor registration
      }
    }
  }
};

export default api;
