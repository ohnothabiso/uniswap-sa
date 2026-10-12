/**
 * UniSwap - Sol Plaatje University Campus Marketplace
 * Full-stack Client Controller & API Bridge
 */

const API_BASE = window.location.origin;

// Application State
const state = {
  currentUser: null,
  token: localStorage.getItem('uniswap_token') || null,
  refreshToken: localStorage.getItem('uniswap_refresh') || null,
  users: [],
  categories: [],
  listings: [],
  userListings: [],
  favorites: new Set(),
  notifications: [],
  threads: [],
  activeChatUser: null,
  activeChatListing: null,
  activeChatMessages: [],
  filters: {
    category: 'all',
    type: 'all',
    size: 'all',
    minPrice: null,
    maxPrice: null,
    search: ''
  },
  currentView: 'feed',
  wizardStep: 1,
  selectedItemForModal: null,
};

// SPU Brand Emerald Green Initials Avatar Generator (Inclusive, Culturally Appropriate)
function getInitialsAvatar(name = 'SPU Student', bg = '0f5238', fg = 'ffffff') {
  const cleanName = (name || 'SPU').trim();
  const parts = cleanName.split(/\s+/).filter(Boolean);
  let initials = 'SP';
  if (parts.length >= 2) {
    initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  } else if (parts.length === 1 && parts[0].length > 0) {
    initials = parts[0].slice(0, 2).toUpperCase();
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="50" fill="#${bg}"/><text x="50" y="55" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="38" font-weight="700" fill="#${fg}" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function getUserAvatar(user) {
  if (user && user.avatar_url && typeof user.avatar_url === 'string' && user.avatar_url.trim() && !user.avatar_url.includes('photo-1534528741775-53994a69daeb')) {
    return user.avatar_url;
  }
  const name = (user && (user.full_name || user.username || user.email)) || 'SPU Student';
  return getInitialsAvatar(name, '0f5238', 'ffffff');
}

// --- HTTP / API Helpers ---
async function api(endpoint, options = {}) {
  const headers = options.headers || {};
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && state.refreshToken) {
    // Attempt token refresh
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${state.token}`;
      return fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    }
  }

  return response;
}

async function refreshAccessToken() {
  try {
    const res = await fetch(`${API_BASE}/api/accounts/login/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: state.refreshToken }),
    });
    if (res.ok) {
      const data = await res.json();
      state.token = data.access;
      localStorage.setItem('uniswap_token', data.access);
      return true;
    } else {
      state.token = null;
      state.refreshToken = null;
      state.currentUser = null;
      localStorage.removeItem('uniswap_token');
      localStorage.removeItem('uniswap_refresh');
      updateUserUI();
    }
  } catch (e) {
    console.error('Failed to refresh token', e);
  }
  return false;
}

// --- Auth & User Switching ---
async function initAuth() {
  try {
    // Fetch registered campus users for the student switcher
    const resUsers = await api('/api/accounts/users/');
    if (resUsers.ok) {
      state.users = await resUsers.json();
    } else {
      const resFallback = await api('/api/accounts/demo-users/');
      if (resFallback.ok) state.users = await resFallback.json();
    }

    // Fetch university list for registration
    const resUnis = await api('/api/accounts/universities/');
    if (resUnis.ok) {
      const data = await resUnis.json();
      state.universities = data.results || data;
    }

    // Check if we have an active stored session
    if (state.token) {
      const meRes = await api('/api/accounts/me/');
      if (meRes.ok) {
        state.currentUser = await meRes.json();
        // Ensure current user is always present in the users panel
        const exists = state.users.some((u) => u.user_id === state.currentUser.user_id);
        if (!exists) {
          state.users.push(state.currentUser);
        }
      } else {
        // Token expired or invalid
        state.currentUser = null;
        state.token = null;
        state.refreshToken = null;
        localStorage.removeItem('uniswap_token');
        localStorage.removeItem('uniswap_refresh');
      }
    } else {
      // Default to logged out guest state or Katlego if remembered
      state.currentUser = null;
    }
  } catch (err) {
    console.error('Auth initialization error:', err);
    state.currentUser = null;
  }
  updateUserUI();
  if (state.currentUser) {
    await loadUserData();
  }
}

async function loginUser(email, password) {
  return await executeLogin(email, password, false);
}

async function executeLogin(email, password, isModal = false) {
  const errorAlert = document.getElementById(isModal ? 'modalLoginErrorAlert' : 'loginErrorAlert');
  const errorMsg = document.getElementById(isModal ? 'modalLoginErrorMsg' : 'loginErrorMsg');
  const submitBtn = document.getElementById(isModal ? 'modalLoginSubmitBtn' : 'loginSubmitBtn');

  if (errorAlert) errorAlert.classList.add('hidden');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">refresh</span> Signing in...';
  }

  try {
    const res = await fetch(`${API_BASE}/api/accounts/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password }),
    });

    if (res.ok) {
      const data = await res.json();
      state.token = data.access;
      state.refreshToken = data.refresh;
      state.currentUser = data.user;
      localStorage.setItem('uniswap_token', state.token);
      localStorage.setItem('uniswap_refresh', state.refreshToken);

      updateUserUI();
      await loadUserData();
      closeAuthModal();

      if (state.currentView === 'auth') {
        navigateTo('feed');
      }

      showToast(`Welcome back, ${state.currentUser.full_name}!`, 'success');
      return true;
    } else {
      const err = await res.json();
      const message = err.detail || (err.non_field_errors ? err.non_field_errors.join(' ') : 'Invalid email or password.');
      if (errorAlert && errorMsg) {
        errorMsg.textContent = message;
        errorAlert.classList.remove('hidden');
      } else {
        showToast(message, 'error');
      }
      return false;
    }
  } catch (e) {
    if (errorAlert && errorMsg) {
      errorMsg.textContent = 'Network error during login. Please check connection.';
      errorAlert.classList.remove('hidden');
    } else {
      showToast('Network error during login', 'error');
    }
    return false;
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span class="material-symbols-outlined text-[18px]">login</span> <span>Sign In</span>';
    }
  }
}

async function executeRegister(payload, isModal = false) {
  const errorAlert = document.getElementById(isModal ? 'modalRegisterErrorAlert' : 'registerErrorAlert');
  const errorMsg = document.getElementById(isModal ? 'modalRegisterErrorMsg' : 'registerErrorMsg');
  const submitBtn = document.getElementById(isModal ? 'modalRegisterSubmitBtn' : 'registerSubmitBtn');

  if (errorAlert) errorAlert.classList.add('hidden');

  // Client-side domain check
  const email = payload.email.trim().toLowerCase();
  if (!email.endsWith('@spu.ac.za')) {
    const msg = 'Please use your official university email ending with @spu.ac.za';
    if (errorAlert && errorMsg) {
      errorMsg.textContent = msg;
      errorAlert.classList.remove('hidden');
    } else {
      showToast(msg, 'error');
    }
    return false;
  }

  if (payload.password !== payload.password_confirm) {
    const msg = 'Passwords do not match.';
    if (errorAlert && errorMsg) {
      errorMsg.textContent = msg;
      errorAlert.classList.remove('hidden');
    } else {
      showToast(msg, 'error');
    }
    return false;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">refresh</span> Creating account...';
  }

  try {
    // Determine SPU university id
    const spuId = (state.universities && state.universities.length) ? state.universities[0].university_id : 3;
    const formData = new FormData();
    formData.append('full_name', payload.full_name.trim());
    formData.append('email', email);
    formData.append('university', spuId);
    formData.append('password', payload.password);
    formData.append('password_confirm', payload.password_confirm);
    formData.append('campus_residence', payload.campus_residence || 'Moroka Residence');
    formData.append('faculty', payload.faculty || 'Faculty of Humanities');

    const avatarInput = document.getElementById(isModal ? 'modalRegAvatar' : 'regAvatar');
    if (avatarInput && avatarInput.files && avatarInput.files[0]) {
      formData.append('avatar', avatarInput.files[0]);
    }

    const res = await fetch(`${API_BASE}/api/accounts/register/`, {
      method: 'POST',
      body: formData,
    });

    if (res.ok || res.status === 201) {
      const data = await res.json();
      state.token = data.access;
      state.refreshToken = data.refresh;
      state.currentUser = data.user;
      localStorage.setItem('uniswap_token', state.token);
      localStorage.setItem('uniswap_refresh', state.refreshToken);

      if (!state.users.some((u) => u.user_id === data.user.user_id)) {
        state.users.push(data.user);
      }

      updateUserUI();
      await loadUserData();
      closeAuthModal();

      if (state.currentView === 'auth') {
        navigateTo('feed');
      }

      showToast(`Account created! Welcome to UniSwap, ${state.currentUser.full_name}!`, 'success');
      return true;
    } else {
      const err = await res.json();
      let errorText = 'Registration failed.';
      if (err.email) errorText = Array.isArray(err.email) ? err.email.join(' ') : err.email;
      else if (err.password) errorText = Array.isArray(err.password) ? err.password.join(' ') : err.password;
      else if (err.avatar) errorText = Array.isArray(err.avatar) ? err.avatar.join(' ') : err.avatar;
      else if (err.detail) errorText = err.detail;

      if (errorAlert && errorMsg) {
        errorMsg.textContent = errorText;
        errorAlert.classList.remove('hidden');
      } else {
        showToast(errorText, 'error');
      }
      return false;
    }
  } catch (e) {
    if (errorAlert && errorMsg) {
      errorMsg.textContent = 'Server connection error. Please try again.';
      errorAlert.classList.remove('hidden');
    }
    return false;
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span class="material-symbols-outlined text-[18px]">how_to_reg</span> <span>Create Student Account</span>';
    }
  }
}

function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmailInput').value;
  const pass = document.getElementById('loginPasswordInput').value;
  executeLogin(email, pass, false);
}

function handleModalLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('modalLoginEmailInput').value;
  const pass = document.getElementById('modalLoginPasswordInput').value;
  executeLogin(email, pass, true);
}

function handleRegisterSubmit(e) {
  e.preventDefault();
  const payload = {
    full_name: document.getElementById('regFullName').value,
    email: document.getElementById('regEmail').value,
    faculty: document.getElementById('regFaculty').value,
    campus_residence: document.getElementById('regResidence').value,
    password: document.getElementById('regPassword').value,
    password_confirm: document.getElementById('regPasswordConfirm').value,
  };
  executeRegister(payload, false);
}

function handleModalRegisterSubmit(e) {
  e.preventDefault();
  const payload = {
    full_name: document.getElementById('modalRegFullName').value,
    email: document.getElementById('modalRegEmail').value,
    faculty: document.getElementById('modalRegFaculty').value,
    campus_residence: document.getElementById('modalRegResidence').value,
    password: document.getElementById('modalRegPassword').value,
    password_confirm: document.getElementById('modalRegPasswordConfirm').value,
  };
  executeRegister(payload, true);
}

function openAuthModal(tab = 'signin', promptMsg = '') {
  const modal = document.getElementById('authModal');
  const promptBanner = document.getElementById('authPromptBanner');
  const promptText = document.getElementById('authPromptText');

  if (promptBanner && promptText) {
    if (promptMsg) {
      promptText.textContent = promptMsg;
      promptBanner.classList.remove('hidden');
    } else {
      promptBanner.classList.add('hidden');
    }
  }

  switchAuthModalTab(tab);

  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function switchAuthTab(tab) {
  const btnSignIn = document.getElementById('authTabBtnSignIn');
  const btnRegister = document.getElementById('authTabBtnRegister');
  const paneSignIn = document.getElementById('authPaneSignIn');
  const paneRegister = document.getElementById('authPaneRegister');

  if (tab === 'signin') {
    if (btnSignIn) {
      btnSignIn.className = 'flex-1 pb-3 text-sm font-bold text-primary border-b-2 border-primary transition flex items-center justify-center gap-2';
    }
    if (btnRegister) {
      btnRegister.className = 'flex-1 pb-3 text-sm font-semibold text-on-surface-variant hover:text-on-surface border-b-2 border-transparent transition flex items-center justify-center gap-2';
    }
    if (paneSignIn) paneSignIn.classList.remove('hidden');
    if (paneRegister) paneRegister.classList.add('hidden');
  } else {
    if (btnRegister) {
      btnRegister.className = 'flex-1 pb-3 text-sm font-bold text-primary border-b-2 border-primary transition flex items-center justify-center gap-2';
    }
    if (btnSignIn) {
      btnSignIn.className = 'flex-1 pb-3 text-sm font-semibold text-on-surface-variant hover:text-on-surface border-b-2 border-transparent transition flex items-center justify-center gap-2';
    }
    if (paneRegister) paneRegister.classList.remove('hidden');
    if (paneSignIn) paneSignIn.classList.add('hidden');
  }
}

function switchAuthModalTab(tab) {
  const btnSignIn = document.getElementById('modalAuthTabBtnSignIn');
  const btnRegister = document.getElementById('modalAuthTabBtnRegister');
  const paneSignIn = document.getElementById('modalAuthPaneSignIn');
  const paneRegister = document.getElementById('modalAuthPaneRegister');

  if (tab === 'signin') {
    if (btnSignIn) {
      btnSignIn.className = 'flex-1 pb-2 text-xs font-bold text-primary border-b-2 border-primary transition flex items-center justify-center gap-1.5';
    }
    if (btnRegister) {
      btnRegister.className = 'flex-1 pb-2 text-xs font-semibold text-on-surface-variant hover:text-on-surface border-b-2 border-transparent transition flex items-center justify-center gap-1.5';
    }
    if (paneSignIn) paneSignIn.classList.remove('hidden');
    if (paneRegister) paneRegister.classList.add('hidden');
  } else {
    if (btnRegister) {
      btnRegister.className = 'flex-1 pb-2 text-xs font-bold text-primary border-b-2 border-primary transition flex items-center justify-center gap-1.5';
    }
    if (btnSignIn) {
      btnSignIn.className = 'flex-1 pb-2 text-xs font-semibold text-on-surface-variant hover:text-on-surface border-b-2 border-transparent transition flex items-center justify-center gap-1.5';
    }
    if (paneRegister) paneRegister.classList.remove('hidden');
    if (paneSignIn) paneSignIn.classList.add('hidden');
  }
}

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  const icon = btn.querySelector('.material-symbols-outlined');
  if (icon) {
    icon.textContent = isPassword ? 'visibility_off' : 'visibility';
  }
}

function logoutUser() {
  state.currentUser = null;
  state.token = null;
  state.refreshToken = null;
  state.favorites = new Set();
  localStorage.removeItem('uniswap_token');
  localStorage.removeItem('uniswap_refresh');

  updateUserUI();
  updateWishlistIcons();

  if (['dashboard', 'chat', 'wizard', 'admin'].includes(state.currentView)) {
    navigateTo('feed');
  }

  showToast('You have been signed out.', 'info');
}

function handleListItemClick() {
  if (!state.currentUser) {
    openAuthModal('signin', 'Please sign in with your SPU student account to list an item');
    return;
  }
  navigateTo('wizard');
}

let selectedAvatarFile = null;

function toggleUserMenu(e) {
  if (e && e.stopPropagation) e.stopPropagation();
  const menu = document.getElementById('userMenuDropdown');
  if (!menu) return;
  const isHidden = menu.classList.contains('hidden');
  if (isHidden) {
    menu.classList.remove('hidden');
    renderUserSwitcher();
    // Auto-scroll to active user so they can always find themselves
    setTimeout(() => {
      const activeEl = document.getElementById('currentUserSwitcherItem');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }, 60);
  } else {
    menu.classList.add('hidden');
  }
}

// Close user menu on outer clicks
document.addEventListener('click', (e) => {
  const menu = document.getElementById('userMenuDropdown');
  const btn = document.getElementById('userMenuBtn');
  if (menu && !menu.classList.contains('hidden')) {
    if (!menu.contains(e.target) && !btn?.contains(e.target)) {
      menu.classList.add('hidden');
    }
  }
});

function updateUserUI() {
  const user = state.currentUser;
  const avatarUrl = user ? getUserAvatar(user) : getInitialsAvatar('Guest Student');

  const sidebarAvatar = document.getElementById('sidebarUserAvatar');
  const sidebarName = document.getElementById('sidebarUserName');
  const sidebarFaculty = document.getElementById('sidebarUserFaculty');
  const navAvatar = document.getElementById('navProfileAvatar');
  const dropdownAvatar = document.getElementById('dropdownUserAvatar');
  const dropdownName = document.getElementById('dropdownUserName');
  const dropdownEmail = document.getElementById('dropdownUserEmail');
  const authBtn = document.getElementById('authActionBtn');

  if (!user) {
    if (sidebarName) sidebarName.textContent = 'Guest Student';
    if (sidebarFaculty) sidebarFaculty.textContent = 'Sign In to Swap';
    if (dropdownName) dropdownName.textContent = 'Guest Student';
    if (dropdownEmail) dropdownEmail.textContent = 'Not signed in';
    if (sidebarAvatar) sidebarAvatar.src = avatarUrl;
    if (navAvatar) navAvatar.src = avatarUrl;
    if (authBtn) authBtn.innerHTML = '<span class="material-symbols-outlined text-[18px]">login</span> Sign In';
    return;
  }

  if (sidebarName) sidebarName.textContent = user.full_name;
  if (sidebarFaculty) sidebarFaculty.textContent = user.faculty || 'Faculty of Humanities';
  if (dropdownName) dropdownName.textContent = user.full_name;
  if (dropdownEmail) dropdownEmail.textContent = user.email;
  if (sidebarAvatar) sidebarAvatar.src = avatarUrl;
  if (navAvatar) navAvatar.src = avatarUrl;
  if (dropdownAvatar) dropdownAvatar.src = avatarUrl;
  if (authBtn) authBtn.innerHTML = '<span class="material-symbols-outlined text-[18px]">logout</span> Sign Out';

  const dashAvatar = document.getElementById('dashAvatar');
  if (dashAvatar) {
    dashAvatar.src = avatarUrl;
    dashAvatar.onerror = () => { dashAvatar.src = getInitialsAvatar(user.full_name); };
  }
  const dashName = document.getElementById('dashName');
  if (dashName) dashName.textContent = user.full_name;
  const dashEmail = document.getElementById('dashEmail');
  if (dashEmail) dashEmail.textContent = user.email;
  const dashFaculty = document.getElementById('dashFaculty');
  if (dashFaculty && user.faculty) dashFaculty.textContent = user.faculty;
  const dashResidence = document.getElementById('dashResidence');
  if (dashResidence && user.campus_residence) dashResidence.textContent = user.campus_residence;
  const dashStudentId = document.getElementById('dashStudentId');
  if (dashStudentId && user.student_id_number) dashStudentId.textContent = user.student_id_number;

  const adminNavLink = document.getElementById('navAdminLink');
  if (adminNavLink) {
    if (user.is_staff || user.role === 'ADMIN') {
      adminNavLink.classList.remove('hidden');
    } else {
      adminNavLink.classList.add('hidden');
    }
  }
}
function openEditProfileModal() {
  const modal = document.getElementById('editProfileModal');
  if (!modal) return;

  const user = state.currentUser;
  if (!user) {
    openAuthModal('signin', 'Please sign in to edit your profile');
    return;
  }

  selectedAvatarFile = null;
  const previewImg = document.getElementById('editProfileAvatarPreview');
  const nameInput = document.getElementById('editProfileFullName');
  const facultySelect = document.getElementById('editProfileFaculty');
  const resSelect = document.getElementById('editProfileResidence');
  const studentIdInput = document.getElementById('editProfileStudentId');
  const fileInput = document.getElementById('editProfileAvatarFile');
  const urlInput = document.getElementById('editProfileAvatarUrlInput');
  const alertBox = document.getElementById('editProfileErrorAlert');

  if (alertBox) alertBox.classList.add('hidden');
  if (fileInput) fileInput.value = '';
  if (urlInput) urlInput.value = '';

  if (previewImg) {
    previewImg.src = getUserAvatar(user);
    previewImg.onerror = () => { previewImg.src = getInitialsAvatar(user.full_name); };
  }
  if (nameInput) nameInput.value = user.full_name || '';
  if (facultySelect && user.faculty) facultySelect.value = user.faculty;
  if (resSelect && user.campus_residence) resSelect.value = user.campus_residence;
  if (studentIdInput) studentIdInput.value = user.student_id_number || '';

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeEditProfileModal() {
  const modal = document.getElementById('editProfileModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function handleEditProfileFileSelect(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    showToast('File size must be under 5MB', 'error');
    return;
  }

  selectedAvatarFile = file;
  const reader = new FileReader();
  reader.onload = (event) => {
    const previewImg = document.getElementById('editProfileAvatarPreview');
    if (previewImg) previewImg.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

function handleAvatarPickerPreview(input, imgId, iconId) {
  const file = input.files && input.files[0];
  const img = document.getElementById(imgId);
  const icon = document.getElementById(iconId);
  if (!file || !img) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    img.src = e.target.result;
    img.classList.remove('hidden');
    if (icon) icon.classList.add('hidden');
  };
  reader.readAsDataURL(file);
}

async function handleSaveProfile(e) {
  e.preventDefault();
  if (!state.currentUser) return;

  const saveBtn = document.getElementById('editProfileSaveBtn');
  const alertBox = document.getElementById('editProfileErrorAlert');
  const alertMsg = document.getElementById('editProfileErrorMsg');

  if (alertBox) alertBox.classList.add('hidden');

  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">refresh</span> Saving...';
  }

  try {
    const formData = new FormData();
    const fullName = document.getElementById('editProfileFullName')?.value.trim();
    const faculty = document.getElementById('editProfileFaculty')?.value;
    const residence = document.getElementById('editProfileResidence')?.value;
    const studentId = document.getElementById('editProfileStudentId')?.value.trim();
    const avatarUrl = document.getElementById('editProfileAvatarUrlInput')?.value.trim();

    if (fullName) formData.append('full_name', fullName);
    if (faculty) formData.append('faculty', faculty);
    if (residence) formData.append('campus_residence', residence);
    if (studentId) formData.append('student_id_number', studentId);

    if (selectedAvatarFile) {
      formData.append('avatar', selectedAvatarFile);
    } else if (avatarUrl) {
      formData.append('avatar_url', avatarUrl);
    }

    const res = await api('/api/accounts/me/', {
      method: 'PATCH',
      body: formData,
    });

    if (res.ok) {
      const updatedUser = await res.json();
      state.currentUser = updatedUser;

      // Update in state.users list so switcher reflects immediately
      const idx = state.users.findIndex((u) => u.user_id === updatedUser.user_id);
      if (idx !== -1) {
        state.users[idx] = updatedUser;
      } else {
        state.users.push(updatedUser);
      }

      updateUserUI();
      if (state.currentView === 'dashboard') {
        loadDashboard();
      }

      closeEditProfileModal();
      showToast('Profile and photo updated successfully!', 'success');
    } else {
      const err = await res.json();
      const msg = err.avatar?.[0] || err.detail || 'Failed to update profile.';
      if (alertBox && alertMsg) {
        alertMsg.textContent = msg;
        alertBox.classList.remove('hidden');
      } else {
        showToast(msg, 'error');
      }
    }
  } catch (err) {
    console.error('Error saving profile:', err);
    if (alertBox && alertMsg) {
      alertMsg.textContent = 'Server error. Please try again.';
      alertBox.classList.remove('hidden');
    }
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">save</span> <span>Save Profile</span>';
    }
  }
}

async function loadUserData() {
  await Promise.all([loadFavorites(), loadNotifications()]);
}

// --- Data Fetching ---
async function loadCategories() {
  try {
    const res = await api('/api/listings/categories/');
    if (res.ok) {
      const data = await res.json();
      state.categories = data.results || data;
      renderCategories();
    }
  } catch (e) {
    console.error('Error loading categories:', e);
  }
}

async function loadListings() {
  try {
    let url = '/api/listings/';
    const params = new URLSearchParams();
    if (state.filters.type !== 'all') {
      const typeMap = { swap: 'SWAP', sale: 'FOR_SALE', free: 'DONATE' };
      if (typeMap[state.filters.type]) {
        params.append('listing_type', typeMap[state.filters.type]);
      }
    }
    if (state.filters.category !== 'all') {
      params.append('category', state.filters.category);
    }
    if (state.filters.search) {
      params.append('search', state.filters.search);
    }
    if (state.filters.minPrice !== null && !isNaN(state.filters.minPrice)) {
      params.append('min_price', state.filters.minPrice);
    }
    if (state.filters.maxPrice !== null && !isNaN(state.filters.maxPrice)) {
      params.append('max_price', state.filters.maxPrice);
    }
    if (params.toString()) {
      url += '?' + params.toString();
    }

    const res = await api(url);
    if (res.ok) {
      const data = await res.json();
      state.listings = data.results || data;
      renderListings();
    }
  } catch (e) {
    console.error('Error loading listings:', e);
  }
}

function applyPriceFilter() {
  const minVal = document.getElementById('priceMinInput')?.value.trim();
  const maxVal = document.getElementById('priceMaxInput')?.value.trim();
  state.filters.minPrice = minVal ? parseFloat(minVal) : null;
  state.filters.maxPrice = maxVal ? parseFloat(maxVal) : null;
  const resetBtn = document.getElementById('resetPriceBtn');
  if (resetBtn) {
    if (state.filters.minPrice !== null || state.filters.maxPrice !== null) {
      resetBtn.classList.remove('hidden');
    } else {
      resetBtn.classList.add('hidden');
    }
  }
  loadListings();
}

function resetPriceFilter() {
  const minInput = document.getElementById('priceMinInput');
  const maxInput = document.getElementById('priceMaxInput');
  if (minInput) minInput.value = '';
  if (maxInput) maxInput.value = '';
  state.filters.minPrice = null;
  state.filters.maxPrice = null;
  const resetBtn = document.getElementById('resetPriceBtn');
  if (resetBtn) resetBtn.classList.add('hidden');
  loadListings();
}

async function loadFavorites() {
  if (!state.currentUser) return;
  try {
    const res = await api('/api/favourites/');
    if (res.ok) {
      const data = await res.json();
      const favList = data.results || data;
      state.favorites = new Set(favList.map((f) => f.listing));
      updateWishlistIcons();
    }
  } catch (e) {
    console.error('Error loading favorites:', e);
  }
}

async function toggleFavorite(listingId) {
  if (!state.currentUser) {
    openAuthModal('signin', 'Sign in with your student account to save items to your wishlist');
    return;
  }
  try {
    const res = await api('/api/favourites/toggle/', {
      method: 'POST',
      body: JSON.stringify({ listing: listingId }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.favorited) {
        state.favorites.add(listingId);
        showToast('Saved to wishlist!', 'success');
      } else {
        state.favorites.delete(listingId);
        showToast('Removed from wishlist', 'info');
      }
      updateWishlistIcons();
      if (state.currentView === 'dashboard') {
        renderDashboardFavorites();
      }
    }
  } catch (e) {
    console.error('Error toggling favorite:', e);
  }
}

function updateWishlistIcons() {
  document.querySelectorAll('[data-fav-id]').forEach((btn) => {
    const id = parseInt(btn.getAttribute('data-fav-id'), 10);
    const icon = btn.querySelector('.material-symbols-outlined');
    if (state.favorites.has(id)) {
      btn.classList.add('text-error');
      if (icon) icon.setAttribute('style', "font-variation-settings: 'FILL' 1;");
    } else {
      btn.classList.remove('text-error');
      if (icon) icon.removeAttribute('style');
    }
  });
}

async function loadNotifications() {
  if (!state.currentUser) return;
  try {
    const res = await api('/api/notifications/');
    if (res.ok) {
      const data = await res.json();
      state.notifications = data.results || data;
      renderNotifications();
    }
  } catch (e) {
    console.error('Error loading notifications:', e);
  }
}

async function markNotificationRead(notifId) {
  try {
    await api(`/api/notifications/${notifId}/mark_read/`, { method: 'POST' });
    await loadNotifications();
  } catch (e) {
    console.error('Error marking notification read:', e);
  }
}

async function markAllNotificationsRead() {
  try {
    await api('/api/notifications/mark_all_read/', { method: 'POST' });
    await loadNotifications();
  } catch (e) {
    console.error('Error marking all notifications read:', e);
  }
}

// --- Navigation & Routing ---
function navigateTo(viewName, filterTypeParam) {
  // If user tries to access protected views while logged out, prompt login
  if (!state.currentUser && ['wizard', 'chat'].includes(viewName)) {
    openAuthModal('signin', `Please sign in with your student account to access ${viewName === 'wizard' ? 'item listing' : viewName}`);
    return;
  }

  // Normalize viewName
  if (viewName === 'detail' || viewName === 'item-detail') viewName = 'item-detail';
  if (viewName === 'dashboard') viewName = 'profile';

  state.currentView = viewName;

  // Update navigation styles in left sidebar
  document.querySelectorAll('aside nav a[data-path]').forEach((link) => {
    const path = link.getAttribute('data-path');
    const isActive =
      (viewName === 'feed' && path === 'marketplace') ||
      (viewName === 'chat' && path === 'chat') ||
      (viewName === 'safezones' && path === 'safezones') ||
      (viewName === 'wizard' && path === 'wizard') ||
      (viewName === 'profile' && path === 'profile');

    if (isActive) {
      link.className = 'flex items-center gap-space-sm px-space-sm py-2.5 transition-colors bg-secondary-container text-on-secondary-container font-semibold rounded-lg cursor-pointer';
    } else if (path === 'wizard') {
      link.className = 'flex items-center gap-space-sm px-space-sm py-2.5 my-1 rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-colors cursor-pointer';
    } else {
      link.className = 'flex items-center gap-space-sm px-space-sm py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors cursor-pointer';
    }
  });

  // Toggle view panels
  const panelMap = {
    'feed': 'view-feed',
    'item-detail': 'view-item-detail',
    'wizard': 'view-wizard',
    'profile': 'view-profile',
    'chat': 'view-chat',
    'safezones': 'view-safezones'
  };

  Object.entries(panelMap).forEach(([name, elementId]) => {
    const el = document.getElementById(elementId);
    if (el) {
      if (name === viewName) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (viewName === 'feed') {
    stopChatPolling();
    if (filterTypeParam) {
      setFilterType(filterTypeParam);
    }
  } else if (viewName === 'chat') {
    startChatPolling();
    loadChat();
  } else if (viewName === 'profile') {
    stopChatPolling();
    loadUserData();
  }
}
// --- Rendering Views ---
function renderCategories() {
  const container = document.getElementById('categoryGroup');
  if (!container) return;

  let html = `
    <button class="category-btn px-4 py-1.5 rounded-full ${
      state.filters.category === 'all'
        ? 'bg-primary text-on-primary font-bold shadow-sm'
        : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
    } font-label-md text-label-md transition flex-shrink-0" onclick="setCategoryFilter('all')">
      All Items
    </button>
  `;

  state.categories.forEach((cat) => {
    const isSelected = state.filters.category === String(cat.category_id);
    html += `
      <button class="category-btn px-4 py-1.5 rounded-full ${
        isSelected
          ? 'bg-primary text-on-primary font-bold shadow-sm'
          : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
      } font-label-md text-label-md transition flex-shrink-0" onclick="setCategoryFilter('${cat.category_id}')">
        ${cat.category_name}
      </button>
    `;
  });
  container.innerHTML = html;

  // Also populate categories in create listing wizard
  const wizardCatSelect = document.getElementById('wizardCategory');
  if (wizardCatSelect) {
    wizardCatSelect.innerHTML = state.categories
      .map((c) => `<option value="${c.category_id}">${c.category_name}</option>`)
      .join('');
  }
}

function renderListings() {
  const grid = document.getElementById('listingGrid');
  const counter = document.getElementById('itemsCounter');
  const emptyState = document.getElementById('emptyState');

  if (!grid) return;

  // Client-side filtering for size and price if selected
  let items = state.listings;
  if (state.filters.size !== 'all') {
    items = items.filter((item) => (item.size || '').toLowerCase() === state.filters.size.toLowerCase());
  }
  if (state.filters.minPrice !== null && !isNaN(state.filters.minPrice)) {
    items = items.filter((item) => item.price === null || item.price >= state.filters.minPrice);
  }
  if (state.filters.maxPrice !== null && !isNaN(state.filters.maxPrice)) {
    items = items.filter((item) => item.price === null || item.price <= state.filters.maxPrice);
  }

  if (counter) counter.textContent = items.length;

  if (items.length === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  grid.innerHTML = items
    .map((item) => {
      const isFav = state.favorites.has(item.listing_id);
      let badgeHtml = '';
      let actionBtnHtml = '';

      if (item.listing_type === 'SWAP') {
        badgeHtml = `
          <span class="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold shadow-sm flex items-center gap-1">
            <span class="material-symbols-outlined text-[13px]">swap_calls</span>
            Direct Swap
          </span>`;
        actionBtnHtml = `
          <button class="flex-1 py-2 px-3 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition flex items-center justify-center gap-1.5 shadow-sm" onclick="startSwapForListing(${item.listing_id})">
            <span class="material-symbols-outlined text-[16px]">handshake</span>
            <span>Propose Swap</span>
          </button>`;
      } else if (item.listing_type === 'FOR_SALE') {
        badgeHtml = `
          <span class="px-2.5 py-1 rounded-full bg-surface-container-highest text-on-surface font-label-sm text-label-sm font-bold shadow-sm">
            Cash Sale • R ${item.price ? Math.round(item.price) : '0'}
          </span>`;
        actionBtnHtml = `
          <button class="flex-1 py-2 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition flex items-center justify-center gap-1.5" onclick="startSwapForListing(${item.listing_id}, 'buy')">
            <span class="material-symbols-outlined text-[16px]">shopping_bag</span>
            <span>Reserve (R${item.price ? Math.round(item.price) : '0'})</span>
          </button>`;
      } else {
        badgeHtml = `
          <span class="px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold shadow-sm flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">volunteer_activism</span>
            100% Free Donation
          </span>`;
        actionBtnHtml = `
          <button class="flex-1 py-2 px-3 rounded-lg bg-tertiary-fixed hover:bg-tertiary text-on-tertiary-fixed hover:text-on-tertiary font-label-md text-label-md transition flex items-center justify-center gap-1.5" onclick="startSwapForListing(${item.listing_id}, 'claim')">
            <span class="material-symbols-outlined text-[16px]">redeem</span>
            <span>Claim Free Item</span>
          </button>`;
      }

      const imgSrc = item.cover_image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80';
      const conditionMap = { NEW: 'New', LIKE_NEW: 'Like New', GOOD: 'Good', FAIR: 'Fair' };
      const condLabel = conditionMap[item.condition] || item.condition || 'Good';
      const sizeLabel = item.size ? `Size ${item.size} • ` : '';
      const locationLabel = item.safe_zone || 'SPU Central Library';

      return `
        <article class="listing-item group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between border border-outline-variant/30">
          <div class="relative w-full aspect-[4/5] bg-surface-container overflow-hidden cursor-pointer" onclick="openItemDetails(${item.listing_id})">
            <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${imgSrc}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80';" alt="${item.title}"/>
            <div class="absolute top-3 left-3 flex flex-col gap-1.5">
              ${badgeHtml}
            </div>
            <div class="absolute top-3 right-3 z-10" onclick="event.stopPropagation()">
              <button aria-label="Save item to wishlist" data-fav-id="${item.listing_id}" class="w-8 h-8 rounded-full bg-surface-container-lowest/80 backdrop-blur ${isFav ? 'text-error' : 'text-on-surface'} hover:text-error flex items-center justify-center transition shadow-sm" onclick="toggleFavorite(${item.listing_id})">
                <span class="material-symbols-outlined text-[18px]" ${isFav ? "style=\"font-variation-settings: 'FILL' 1;\"" : ''}>favorite</span>
              </button>
            </div>
            <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between text-label-sm font-label-sm text-on-surface bg-surface-container-lowest/90 backdrop-blur px-2.5 py-1.5 rounded-lg shadow-sm">
              <span class="flex items-center gap-1 text-secondary font-semibold truncate max-w-[55%]">
                <span class="material-symbols-outlined text-[15px]">location_on</span>
                ${locationLabel}
              </span>
              <span class="text-on-surface-variant font-medium">${sizeLabel}${condLabel}</span>
            </div>
          </div>
          <div class="p-space-sm flex flex-col flex-1 justify-between gap-space-sm">
            <div>
              <div class="flex items-center gap-1.5 mb-1">
                <span class="material-symbols-outlined text-[14px] text-secondary">verified</span>
                <span class="font-label-sm text-label-sm text-on-surface-variant truncate">${item.seller_name || 'SPU Student'} • 98% Trust • ${item.seller_residence || 'Campus'}</span>
              </div>
              <h3 class="font-headline-sm text-headline-sm text-on-surface leading-snug line-clamp-1 cursor-pointer hover:text-primary transition" onclick="openItemDetails(${item.listing_id})">${item.title}</h3>
              <p class="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-2">${item.description || item.swap_preference || ''}</p>
            </div>
            <div class="pt-space-xs flex items-center gap-2">
              ${actionBtnHtml}
              <button onclick="startDirectChatWithSeller(${item.listing_id})" class="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary hover:text-primary-container transition flex items-center justify-center flex-shrink-0" title="Message Seller">
                <span class="material-symbols-outlined text-[18px]">chat</span>
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join('');
}

function setCategoryFilter(catId) {
  state.filters.category = catId;
  renderCategories();
  loadListings();
}

function setFilterType(type) {
  state.filters.type = type;
  document.querySelectorAll('#typeGroup .type-btn').forEach((btn) => {
    if (btn.getAttribute('data-type') === type) {
      btn.className = 'type-btn px-3 py-1 rounded-full bg-primary text-on-primary font-label-sm text-label-sm transition';
    } else {
      btn.className = 'type-btn px-3 py-1 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm hover:bg-surface-container-high transition';
    }
  });
  loadListings();
}

function setFilterSize(size) {
  state.filters.size = size;
  document.querySelectorAll('#sizeGroup .size-btn').forEach((btn) => {
    if (btn.getAttribute('data-size') === size) {
      btn.className = 'size-btn px-2.5 py-1 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm transition';
    } else {
      btn.className = 'size-btn px-2.5 py-1 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm hover:bg-surface-container-high transition';
    }
  });
  renderListings();
}

// --- Item Detail & Swap Modals ---
async function openItemDetails(listingId) {
  try {
    const res = await api(`/api/listings/${listingId}/`);
    if (res.ok) {
      const item = await res.json();
      state.selectedItemForModal = item;
      const isFav = state.favorites.has(item.listing_id);

      const modal = document.getElementById('itemDetailModal');
      const detailImg = document.getElementById('detailItemImg');
      detailImg.onerror = function() {
        this.onerror = null;
        this.src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80';
      };
      detailImg.src = item.image_url || (item.images && item.images[0] && item.images[0].image) || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80';
      document.getElementById('detailItemTitle').textContent = item.title;
      document.getElementById('detailItemCategory').textContent = item.category_name || 'Wardrobe';
      document.getElementById('detailItemDesc').textContent = item.description || 'No description provided.';
      document.getElementById('detailItemSize').textContent = item.size || 'One Size';
      document.getElementById('detailItemCondition').textContent = item.condition || 'Good';
      document.getElementById('detailItemZone').textContent = item.safe_zone || 'Central Library';
      document.getElementById('detailSellerName').textContent = item.seller_name || 'SPU Student';
      document.getElementById('detailSellerRes').textContent = item.seller_residence || 'Campus';
      document.getElementById('detailSellerTrust').textContent = `${item.seller_trust || 98}% Trust Score`;
      
      const priceBadge = document.getElementById('detailItemPriceBadge');
      if (item.listing_type === 'FOR_SALE') {
        priceBadge.innerHTML = `<span class="text-xl font-bold text-primary">R ${item.price}</span> <span class="text-xs text-on-surface-variant">(Cash Sale)</span>`;
      } else if (item.listing_type === 'SWAP') {
        priceBadge.innerHTML = `<span class="text-xl font-bold text-secondary">Direct Swap</span> <span class="text-xs text-on-surface-variant block mt-1">Looking for: ${item.swap_preference || 'Similar clothing'}</span>`;
      } else {
        priceBadge.innerHTML = `<span class="text-xl font-bold text-tertiary">Free Donation</span> <span class="text-xs text-on-surface-variant">(Solidarity gift)</span>`;
      }

      const favBtn = document.getElementById('detailFavBtn');
      if (favBtn) {
        favBtn.onclick = () => toggleFavorite(item.listing_id);
      }

      const reportBtn = document.getElementById('detailReportBtn');
      if (reportBtn) {
        reportBtn.onclick = () => openReportModal(item.listing_id, item.title);
      }

      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  } catch (err) {
    console.error('Error fetching item details:', err);
  }
}

function closeItemDetails() {
  const modal = document.getElementById('itemDetailModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function contactSellerFromModal() {
  if (!state.currentUser) {
    openAuthModal('signin', 'Please sign in to message the student seller');
    return;
  }
  if (!state.selectedItemForModal) return;
  const item = state.selectedItemForModal;
  closeItemDetails();
  startSwapForListing(item.listing_id, item.listing_type.toLowerCase());
}

function startSwapForListing(listingId, mode = 'swap') {
  if (!state.currentUser) {
    openAuthModal('signin', 'Please sign in with your student account to swap or claim this item');
    return;
  }
  const item = state.listings.find((l) => l.listing_id === listingId) || state.selectedItemForModal;
  if (!item) return;

  if (item.user === state.currentUser.user_id) {
    showToast("This is your own listing!", "info");
    return;
  }

  // Open modal for proposal or directly switch to chat
  openSwapModal(item, mode);
}

function openSwapModal(item, mode) {
  const modal = document.getElementById('swapModal');
  const titleElem = document.getElementById('modalItemTitle');
  const sellerElem = document.getElementById('modalSellerName');
  const zoneElem = document.getElementById('modalZoneName');
  const modeTag = document.getElementById('modalModeTag');
  const swapField = document.getElementById('swapOfferingField');
  const form = document.getElementById('swapProposalForm');
  const success = document.getElementById('modalSuccess');

  if (titleElem) titleElem.textContent = item.title;
  if (sellerElem) sellerElem.textContent = item.seller_name;
  if (zoneElem) zoneElem.textContent = item.safe_zone || 'Central Library Ground Floor';

  if (form) form.classList.remove('hidden');
  if (success) success.classList.add('hidden');

  state.activeChatListing = item;

  if (mode === 'claim' || item.listing_type === 'DONATE') {
    if (modeTag) modeTag.textContent = 'Claim Campus Donation';
    if (swapField) swapField.classList.add('hidden');
  } else if (mode === 'buy' || item.listing_type === 'FOR_SALE') {
    if (modeTag) modeTag.textContent = `Reserve Cash Purchase (R ${item.price})`;
    if (swapField) swapField.classList.add('hidden');
  } else {
    if (modeTag) modeTag.textContent = 'Propose Item Trade';
    if (swapField) swapField.classList.remove('hidden');
  }

  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeSwapModal() {
  const modal = document.getElementById('swapModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

async function submitProposal(e) {
  e.preventDefault();
  if (!state.activeChatListing) return;

  const item = state.activeChatListing;
  const messageInput = document.getElementById('proposalMessageInput');
  const text = messageInput ? messageInput.value.trim() : '';

  let proposalText = text;
  if (item.listing_type === 'SWAP') {
    const offering = document.getElementById('proposalOfferItem')?.value || 'my item';
    proposalText = `[SWAP PROPOSAL] Hi ${item.seller_name}, I would love to trade my "${offering}" for your "${item.title}". Meetup: ${item.safe_zone || 'Central Library'}. Note: ${text}`;
  } else if (item.listing_type === 'FOR_SALE') {
    proposalText = `[PURCHASE INQUIRY] Hi ${item.seller_name}, I want to reserve your "${item.title}" for R${item.price}. Meetup: ${item.safe_zone || 'Central Library'}. Note: ${text}`;
  } else {
    proposalText = `[DONATION CLAIM] Hi ${item.seller_name}, I would love to claim your free donation "${item.title}". Meetup: ${item.safe_zone || 'Central Library'}. Note: ${text}`;
  }

  try {
    const res = await api('/api/messaging/', {
      method: 'POST',
      body: JSON.stringify({
        receiver: item.user,
        listing: item.listing_id,
        message_text: proposalText,
      }),
    });

    if (res.ok) {
      const form = document.getElementById('swapProposalForm');
      const success = document.getElementById('modalSuccess');
      if (form) form.classList.add('hidden');
      if (success) success.classList.remove('hidden');
      if (messageInput) messageInput.value = '';
      showToast('Proposal sent to seller!', 'success');
      setTimeout(() => {
        closeSwapModal();
        openConversationWith(item.user, item);
      }, 1000);
    } else {
      showToast('Could not send message. Ensure you are logged in.', 'error');
    }
  } catch (err) {
    console.error('Failed to submit proposal:', err);
  }
}

function openSafetyModal(e) {
  if (e) e.preventDefault();
  const modal = document.getElementById('safetyModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeSafetyModal() {
  const modal = document.getElementById('safetyModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// --- Create Listing Wizard ---
function switchStep(step) {
  state.wizardStep = step;
  for (let i = 1; i <= 4; i++) {
    const btn = document.getElementById(`step-btn-${i}`);
    const stepContent = document.getElementById(`wizard-step-content-${i}`);
    if (i === step) {
      if (btn) {
        btn.className = 'group flex items-center gap-space-xs text-left p-2 rounded-lg transition-all bg-primary text-on-primary shadow-sm';
      }
      if (stepContent) stepContent.classList.remove('hidden');
    } else {
      if (btn) {
        btn.className = 'group flex items-center gap-space-xs text-left p-2 rounded-lg transition-all hover:bg-surface-container text-on-surface-variant';
      }
      if (stepContent) stepContent.classList.add('hidden');
    }
  }
}

function selectCondition(val) {
  document.querySelectorAll('.condition-pill').forEach((btn) => {
    if (btn.getAttribute('data-val') === val) {
      btn.className = 'condition-pill p-3 rounded-xl border-2 border-primary bg-primary/5 text-left cursor-pointer transition';
    } else {
      btn.className = 'condition-pill p-3 rounded-xl border border-outline-variant hover:border-primary/50 text-left cursor-pointer transition';
    }
  });
  document.getElementById('wizardCondition').value = val;
}

function selectDealType(type) {
  document.querySelectorAll('.deal-type-btn').forEach((btn) => {
    if (btn.getAttribute('data-type') === type) {
      btn.className = 'deal-type-btn p-3 rounded-xl border-2 border-primary bg-primary/5 text-left cursor-pointer transition flex items-center gap-3';
    } else {
      btn.className = 'deal-type-btn p-3 rounded-xl border border-outline-variant hover:border-primary/50 text-left cursor-pointer transition flex items-center gap-3';
    }
  });
  document.getElementById('wizardListingType').value = type;

  const priceRow = document.getElementById('wizardPriceRow');
  const swapPrefRow = document.getElementById('wizardSwapPrefRow');
  if (type === 'FOR_SALE') {
    priceRow.classList.remove('hidden');
    swapPrefRow.classList.add('hidden');
  } else if (type === 'SWAP') {
    priceRow.classList.add('hidden');
    swapPrefRow.classList.remove('hidden');
  } else {
    priceRow.classList.add('hidden');
    swapPrefRow.classList.add('hidden');
  }
}

async function handleCreateListingSubmit(e) {
  e.preventDefault();
  const form = document.getElementById('createListingForm');
  const title = document.getElementById('wizardTitle').value;
  const category = document.getElementById('wizardCategory').value;
  const description = document.getElementById('wizardDesc').value;
  const condition = document.getElementById('wizardCondition').value || 'GOOD';
  const size = document.getElementById('wizardSize').value || 'M';
  const listing_type = document.getElementById('wizardListingType').value || 'FOR_SALE';
  const price = listing_type === 'FOR_SALE' ? document.getElementById('wizardPrice').value : null;
  const swap_preference = document.getElementById('wizardSwapPref').value;
  const safe_zone = document.getElementById('wizardSafeZone').value || 'Central Library Ground Floor';
  const imageUrl = document.getElementById('wizardImageUrl').value;
  const imageFileInput = document.getElementById('wizardImageFile');

  const payload = {
    title,
    category: parseInt(category, 10),
    description,
    condition,
    size,
    listing_type,
    price: price ? parseFloat(price) : null,
    swap_preference,
    safe_zone,
    image_url: imageUrl || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80',
    status: 'LIVE',
  };

  try {
    const res = await api('/api/listings/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const createdItem = await res.json();
      // If user uploaded a physical image file
      if (imageFileInput && imageFileInput.files.length > 0) {
        const formData = new FormData();
        formData.append('image', imageFileInput.files[0]);
        formData.append('is_cover', 'true');
        await api(`/api/listings/${createdItem.listing_id}/images/`, {
          method: 'POST',
          body: formData,
        });
      }

      showToast('🎉 Listing created and posted live to SPU campus!', 'success');
      form.reset();
      switchStep(1);
      navigateTo('feed');
    } else {
      const errorData = await res.json();
      showToast('Error: ' + JSON.stringify(errorData), 'error');
    }
  } catch (err) {
    console.error('Failed to create listing:', err);
    showToast('Failed to connect to server', 'error');
  }
}

// --- Messages & Safe Chat ---
async function loadChat() {
  const threadList = document.getElementById('chatThreadList');
  const messageStream = document.getElementById('chatMessagesStream');

  if (!state.currentUser) {
    if (threadList) {
      threadList.innerHTML = `
        <div class="p-6 text-center text-on-surface-variant font-body-sm">
          <span class="material-symbols-outlined text-3xl text-outline mb-2">lock</span>
          <p class="font-semibold text-on-surface">Student Sign In Required</p>
          <p class="text-xs text-on-surface-variant mt-1">Sign in with your SPU account to view your conversations.</p>
          <button onclick="openAuthModal('signin')" class="mt-3 px-3 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-bold shadow-sm">
            Sign In Now
          </button>
        </div>`;
    }
    if (messageStream) {
      messageStream.innerHTML = `
        <div class="text-center py-20 text-on-surface-variant">
          <span class="material-symbols-outlined text-5xl text-outline mb-3">chat_bubble</span>
          <h3 class="text-base font-bold text-on-surface">Secure SPU Student Messaging</h3>
          <p class="text-xs text-on-surface-variant max-w-sm mx-auto mt-1 mb-4">
            Connect directly with verified Sol Plaatje University peers, negotiate swaps, or agree on monitored campus meetup zones.
          </p>
          <button onclick="openAuthModal('signin')" class="px-5 py-2.5 bg-primary hover:bg-primary-container text-on-primary rounded-xl font-bold text-xs shadow-md transition">
            Sign In to Start Chatting
          </button>
        </div>`;
    }
    return;
  }

  try {
    const res = await api('/api/messaging/threads/');
    if (res.ok) {
      state.threads = await res.json();
      renderChatThreads();
      if (state.threads.length > 0 && !state.activeChatUser) {
        // Pick first thread partner
        const firstMsg = state.threads[0];
        const otherId = firstMsg.sender === state.currentUser.user_id ? firstMsg.receiver : firstMsg.sender;
        const otherName = firstMsg.sender === state.currentUser.user_id ? firstMsg.receiver_name : firstMsg.sender_name;
        const otherAvatar = firstMsg.sender === state.currentUser.user_id ? firstMsg.receiver_avatar : firstMsg.sender_avatar;
        const otherEmail = firstMsg.sender === state.currentUser.user_id ? firstMsg.receiver_email : firstMsg.sender_email;
        state.activeChatUser = {
          user_id: otherId,
          full_name: otherName,
          avatar_url: otherAvatar || getInitialsAvatar(otherName),
          email: otherEmail,
        };
      }
      if (state.activeChatUser) {
        loadThreadMessages(state.activeChatUser.user_id);
      } else {
        renderActiveChat();
      }
    }
  } catch (err) {
    console.error('Error loading chat threads:', err);
  }
}

async function startDirectChatWithSeller(listingId) {
  if (!state.currentUser) {
    openAuthModal('signin', 'Please sign in with your student account to message the seller');
    return;
  }
  const item = (state.listings && state.listings.find((l) => l.listing_id === listingId)) || state.selectedItemForModal;
  if (!item) {
    showToast('Listing details not found', 'error');
    return;
  }
  if (item.user === state.currentUser.user_id) {
    showToast('This is your own listing!', 'info');
    return;
  }

  closeItemDetails();

  const sellerName = item.seller_name || 'SPU Student';
  const sellerAvatar = item.seller_avatar || getInitialsAvatar(sellerName);
  const sellerEmail = item.seller_email || `${sellerName.toLowerCase().replace(/\s+/g, '')}@spu.ac.za`;

  state.activeChatUser = {
    user_id: item.user,
    full_name: sellerName,
    avatar_url: sellerAvatar,
    email: sellerEmail,
  };
  state.activeChatListing = item;
  state.activeChatListingStatus = item.status || 'LIVE';

  navigateTo('chat');
  await loadThreadMessages(item.user);
  renderActiveChat();

  const chatInput = document.getElementById('chatInput');
  if (chatInput) {
    chatInput.placeholder = `Message ${sellerName} about "${item.title}"...`;
    chatInput.focus();
  }
}

function openConversationWith(userId, itemContext) {
  const sellerName = itemContext ? itemContext.seller_name : 'Student';
  const user = state.users.find((u) => u.user_id === userId) || {
    user_id: userId,
    full_name: sellerName,
    avatar_url: (itemContext && itemContext.seller_avatar) || getInitialsAvatar(sellerName),
    email: (itemContext && itemContext.seller_email) || 'student@spu.ac.za',
  };
  state.activeChatUser = user;
  if (itemContext) {
    state.activeChatListing = itemContext;
    state.activeChatListingStatus = itemContext.status || 'LIVE';
  }
  navigateTo('chat');
  loadThreadMessages(userId);
}

async function loadThreadMessages(otherUserId, silent = false) {
  try {
    const res = await api(`/api/messaging/?with=${otherUserId}`);
    if (res.ok) {
      const data = await res.json();
      const newMessages = data.results || data;
      const countChanged = newMessages.length !== state.activeChatMessages.length;
      state.activeChatMessages = newMessages;

      // Check listing status for deal actions
      const itemMsg = state.activeChatMessages.find((m) => m.listing || m.listing_title);
      const listingId = (state.activeChatListing && state.activeChatListing.listing_id) || (itemMsg && itemMsg.listing);
      if (listingId && (!state.activeChatListingStatus || countChanged)) {
        try {
          const lRes = await api(`/api/listings/${listingId}/`);
          if (lRes.ok) {
            const lData = await lRes.json();
            state.activeChatListingStatus = lData.status;
          }
        } catch (_) {}
      }

      renderActiveChat();
      if (!silent) {
        const stream = document.getElementById('chatMessagesStream');
        if (stream) stream.scrollTop = stream.scrollHeight;
      }
    }
  } catch (err) {
    console.error('Error loading thread messages:', err);
  }
}

function selectChatPartner(userId, name, avatar) {
  state.activeChatListingStatus = null;
  state.activeChatUser = {
    user_id: userId,
    full_name: decodeURIComponent(name),
    avatar_url: decodeURIComponent(avatar),
  };
  renderChatThreads();
  loadThreadMessages(userId);
}

function renderChatThreads() {
  const threadList = document.getElementById('chatThreadList');
  if (!threadList) return;

  if (state.threads.length === 0) {
    threadList.innerHTML = `<div class="p-6 text-center text-on-surface-variant font-body-sm">
      <span class="material-symbols-outlined text-3xl text-outline mb-2">forum</span>
      <p class="font-semibold text-on-surface">No conversations yet</p>
      <p class="text-xs text-on-surface-variant mt-1">Click "Message Seller" on any item in the marketplace to start chatting.</p>
    </div>`;
    return;
  }

  threadList.innerHTML = state.threads
    .map((msg) => {
      const isSender = state.currentUser && msg.sender === state.currentUser.user_id;
      const partnerId = isSender ? msg.receiver : msg.sender;
      const partnerName = isSender ? msg.receiver_name : msg.sender_name;
      const rawAvatar = isSender ? msg.receiver_avatar : msg.sender_avatar;
      const partnerAvatar = getUserAvatar({ full_name: partnerName, avatar_url: rawAvatar });
      const isActive = state.activeChatUser && state.activeChatUser.user_id === partnerId;

      return `
        <article onclick="selectChatPartner(${partnerId}, '${encodeURIComponent(partnerName)}', '${encodeURIComponent(partnerAvatar)}')" class="p-space-sm rounded-lg ${
        isActive ? 'bg-surface-container-low border-l-4 border-primary' : 'hover:bg-surface-container-low/50'
      } cursor-pointer shadow-sm relative transition-all">
          <div class="flex items-start gap-space-sm pl-1">
            <div class="relative flex-shrink-0">
              <img class="w-12 h-12 rounded-xl object-cover" src="${partnerAvatar}" alt="${partnerName}" onerror="this.onerror=null; this.src='${getInitialsAvatar(partnerName)}';"/>
              <span class="absolute -bottom-1 -right-1 bg-secondary text-on-secondary rounded-full p-0.5" title="Student ID Checked">
                <span class="material-symbols-outlined text-[11px] block">verified</span>
              </span>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between">
                <h4 class="font-label-md text-label-md text-on-surface truncate font-semibold">${partnerName}</h4>
                <time class="font-label-sm text-[11px] text-outline">${new Date(msg.date_sent).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
              </div>
              <p class="font-body-sm text-body-sm text-on-surface-variant truncate mt-0.5">${msg.message_text}</p>
              ${
                msg.listing_title
                  ? `<div class="mt-1 inline-flex items-center gap-1 text-[11px] text-primary bg-primary-fixed/30 px-2 py-0.5 rounded">
                      <span class="material-symbols-outlined text-[12px]">apparel</span> ${msg.listing_title}
                     </div>`
                  : ''
              }
            </div>
          </div>
        </article>
      `;
    })
    .join('');
}

function renderActiveChat() {
  const chatHeader = document.getElementById('chatHeaderContainer');
  const messageStream = document.getElementById('chatMessagesStream');
  const proposalBanner = document.getElementById('chatProposalBanner');

  if (!state.activeChatUser) {
    if (chatHeader) {
      chatHeader.innerHTML = '<span class="text-sm text-on-surface-variant font-medium">Select a conversation or reach out to a seller</span>';
    }
    if (messageStream) {
      messageStream.innerHTML = `
        <div class="text-center py-20 text-on-surface-variant">
          <span class="material-symbols-outlined text-4xl text-outline mb-2">forum</span>
          <p class="font-medium text-sm">Select an exchange conversation to view and send messages.</p>
        </div>
      `;
    }
    return;
  }

  const partnerAvatar = getUserAvatar(state.activeChatUser);

  if (chatHeader) {
    chatHeader.innerHTML = `
      <div class="flex items-center gap-space-sm min-w-0">
        <div class="relative">
          <img class="w-11 h-11 rounded-full object-cover" src="${partnerAvatar}" alt="${state.activeChatUser.full_name}" onerror="this.onerror=null; this.src='${getInitialsAvatar(state.activeChatUser.full_name)}';"/>
          <span class="absolute bottom-0 right-0 w-3 h-3 bg-secondary rounded-full ring-2 ring-surface-container-lowest"></span>
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-1.5">
            <h3 class="font-headline-sm text-headline-sm text-on-surface truncate">${state.activeChatUser.full_name}</h3>
            <span class="px-2 py-0.2 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm flex items-center gap-0.5">
              <span class="material-symbols-outlined text-[13px]">shield</span> SPU Verified Student
            </span>
          </div>
          <div class="flex items-center gap-space-sm text-on-surface-variant font-label-sm text-label-sm mt-0.5">
            <span class="flex items-center gap-0.5 text-secondary font-semibold">
              <span class="material-symbols-outlined text-[14px]">verified_user</span> 98% Trust Score
            </span>
            <span>•</span>
            <span class="truncate">${state.activeChatUser.email || 'spu.ac.za'}</span>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-space-xs">
        <button onclick="openSafetyModal()" class="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1 transition-colors">
          <span class="material-symbols-outlined text-[16px] text-secondary">lock</span>
          <span class="hidden sm:inline">Safe Relay Active</span>
        </button>
      </div>
    `;
  }

  // Pinned proposal card & deal bar
  const itemMsg = state.activeChatMessages.find((m) => m.listing || m.listing_title);
  if (itemMsg && !state.activeChatListing) {
    state.activeChatListing = {
      listing_id: itemMsg.listing,
      title: itemMsg.listing_title,
      listing_type: itemMsg.listing_type,
      price: itemMsg.listing_price,
    };
  }

  if (proposalBanner && itemMsg) {
    proposalBanner.classList.remove('hidden');
    document.getElementById('proposalItemTitle').textContent = itemMsg.listing_title || 'Campus Item Exchange';
    document.getElementById('proposalItemPrice').textContent =
      itemMsg.listing_type === 'FOR_SALE'
        ? `R ${itemMsg.listing_price || 0}`
        : itemMsg.listing_type === 'SWAP'
        ? 'Direct Swap'
        : 'Free Donation';
  } else if (proposalBanner) {
    proposalBanner.classList.add('hidden');
  }

  // Deal Action Bar
  const dealBar = document.getElementById('chatDealActionBar');
  const dealStatusBadge = document.getElementById('chatDealStatusBadge');
  const dealNotice = document.getElementById('chatDealNotice');
  const btnReserve = document.getElementById('btnChatReserve');
  const btnComplete = document.getElementById('btnChatComplete');

  const listingId = (state.activeChatListing && state.activeChatListing.listing_id) || (itemMsg && itemMsg.listing);
  if (dealBar && listingId) {
    dealBar.classList.remove('hidden');
    const curStatus = state.activeChatListingStatus || 'LIVE';
    if (curStatus === 'RESERVED') {
      if (dealStatusBadge) {
        dealStatusBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300';
        dealStatusBadge.textContent = '🔒 Reserved for Meetup';
      }
      if (dealNotice) dealNotice.textContent = 'Deal locked in! Meet at SPU Safe Zone to exchange.';
      if (btnReserve) btnReserve.classList.add('hidden');
      if (btnComplete) {
        btnComplete.classList.remove('hidden');
        btnComplete.innerHTML = '<span class="material-symbols-outlined text-[14px]">check_circle</span> <span>Confirm Trade Complete 🎉</span>';
      }
    } else if (curStatus === 'COMPLETED') {
      if (dealStatusBadge) {
        dealStatusBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800 border border-green-300';
        dealStatusBadge.textContent = '✓ Trade Completed';
      }
      if (dealNotice) dealNotice.textContent = '🎉 Impact recorded: +1 Textile Diverted, +10 SPU Trust Points';
      if (btnReserve) btnReserve.classList.add('hidden');
      if (btnComplete) btnComplete.classList.add('hidden');
    } else {
      if (dealStatusBadge) {
        dealStatusBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-fixed text-on-primary-fixed';
        dealStatusBadge.textContent = '🤝 Active Trade Discussion';
      }
      if (dealNotice) dealNotice.textContent = 'Finalize deal terms and lock in safe exchange.';
      if (btnReserve) {
        btnReserve.classList.remove('hidden');
        btnReserve.innerHTML = '<span class="material-symbols-outlined text-[14px]">lock</span> <span>Mark Reserved</span>';
      }
      if (btnComplete) {
        btnComplete.classList.remove('hidden');
        btnComplete.innerHTML = '<span class="material-symbols-outlined text-[14px]">check_circle</span> <span>Confirm Trade Complete 🎉</span>';
      }
    }
  } else if (dealBar) {
    dealBar.classList.add('hidden');
  }

  // Messages list
  if (messageStream) {
    if (state.activeChatMessages.length === 0) {
      const listingTitle = state.activeChatListing ? state.activeChatListing.title : 'campus item';
      messageStream.innerHTML = `
        <div class="text-center py-12 px-4 max-w-md mx-auto text-on-surface-variant animate-in fade-in">
          <div class="w-14 h-14 rounded-full bg-primary-fixed/40 flex items-center justify-center mx-auto mb-3 text-primary">
            <span class="material-symbols-outlined text-3xl">chat</span>
          </div>
          <h4 class="font-bold text-on-surface text-base">Direct Message with ${state.activeChatUser.full_name}</h4>
          <p class="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
            Send a message to discuss <strong>${listingTitle}</strong>, verify sizing/condition, or agree on an SPU Safe Zone meetup.
          </p>
          <div class="mt-4 p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-left flex items-center gap-2.5 text-xs text-on-surface-variant">
            <span class="material-symbols-outlined text-secondary text-[20px]">verified_user</span>
            <span>Kimberley campus monitored relay active. Meet only in designated safe zones.</span>
          </div>
        </div>
      `;
    } else {
      messageStream.innerHTML = state.activeChatMessages
        .map((m) => {
          const isMe = state.currentUser && m.sender === state.currentUser.user_id;
          return `
            <div class="flex ${isMe ? 'justify-end' : 'justify-start'} mb-3">
              <div class="max-w-[75%] ${
                isMe
                  ? 'bg-primary text-on-primary rounded-2xl rounded-tr-sm'
                  : 'bg-surface-container text-on-surface rounded-2xl rounded-tl-sm'
              } p-3.5 shadow-sm">
                <p class="font-body-md text-body-md leading-relaxed whitespace-pre-wrap">${m.message_text}</p>
                <div class="flex items-center justify-end gap-1 mt-1 text-[10px] ${isMe ? 'text-on-primary/70' : 'text-on-surface-variant'}">
                  <span>${new Date(m.date_sent).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  ${isMe ? '<span class="material-symbols-outlined text-[12px]">done_all</span>' : ''}
                </div>
              </div>
            </div>
          `;
        })
        .join('');
      messageStream.scrollTop = messageStream.scrollHeight;
    }
  }
}

async function handleSendMessage(e) {
  e.preventDefault();
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text || !state.activeChatUser) return;

  const payload = {
    receiver: state.activeChatUser.user_id,
    message_text: text,
    listing: state.activeChatListing ? state.activeChatListing.listing_id : null,
  };

  input.value = '';

  // Optimistic message append for instantaneous UI feedback
  const optimisticMsg = {
    message_id: 'temp-' + Date.now(),
    sender: state.currentUser ? state.currentUser.user_id : null,
    receiver: state.activeChatUser.user_id,
    message_text: text,
    date_sent: new Date().toISOString(),
    listing: state.activeChatListing ? state.activeChatListing.listing_id : null,
    listing_title: state.activeChatListing ? state.activeChatListing.title : null,
  };
  state.activeChatMessages.push(optimisticMsg);
  renderActiveChat();

  try {
    const res = await api('/api/messaging/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      await loadThreadMessages(state.activeChatUser.user_id, true);
      const tRes = await api('/api/messaging/threads/');
      if (tRes.ok) {
        state.threads = await tRes.json();
        renderChatThreads();
      }
    } else {
      showToast('Could not send message. Please ensure you are logged in.', 'error');
    }
  } catch (err) {
    console.error('Error sending message:', err);
    showToast('Failed to send message', 'error');
  }
}

function sendQuickReply(replyText) {
  const input = document.getElementById('chatInput');
  if (input) {
    input.value = replyText;
    input.focus();
  }
}

// --- Dashboard ---
async function loadDashboard() {
  if (!state.currentUser) return;

  // Profile info
  document.getElementById('dashName').textContent = state.currentUser.full_name;
  document.getElementById('dashEmail').textContent = state.currentUser.email;
  document.getElementById('dashFaculty').textContent = state.currentUser.faculty || 'Faculty of Humanities';
  document.getElementById('dashResidence').textContent = state.currentUser.campus_residence || 'Moroka Residence';
  document.getElementById('dashTrustScore').textContent = `${state.currentUser.trust_score || 98}% Trust Score`;
  document.getElementById('dashStudentId').textContent = state.currentUser.student_id_number || 'SPU-2023-8942';
  const avatarUrl = getUserAvatar(state.currentUser);
  const dashAvatarEl = document.getElementById('dashAvatar');
  if (dashAvatarEl) {
    dashAvatarEl.src = avatarUrl;
    dashAvatarEl.onerror = () => { dashAvatarEl.src = getInitialsAvatar(state.currentUser.full_name); };
  }
  const qrPassId = document.getElementById('qrStudentId');
  if (qrPassId) {
    qrPassId.textContent = state.currentUser.student_id_number || 'SPU-2023-8942';
  }

  // Fetch my listings
  try {
    const res = await api('/api/listings/?mine=true');
    if (res.ok) {
      const data = await res.json();
      state.userListings = data.results || data;
      renderDashboardListings();
      renderDashboardStats();
    }
  } catch (err) {
    console.error('Error loading user listings:', err);
  }

  // Fetch favorites
  renderDashboardFavorites();
}

function renderDashboardStats() {
  const totalDiverted = (state.currentUser.items_diverted || 0) + state.userListings.length;
  document.getElementById('statDiverted').textContent = `${totalDiverted} Garments`;
  document.getElementById('statCO2').textContent = `${(totalDiverted * 3.6).toFixed(1)} kg`;
  document.getElementById('statWater').textContent = `${totalDiverted * 1200} L`;
  document.getElementById('statSavings').textContent = `R ${totalDiverted * 150}`;
}

function renderDashboardListings() {
  const container = document.getElementById('dashListingsGrid');
  if (!container) return;

  if (state.userListings.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-10 bg-surface-container-low rounded-xl">
        <p class="text-on-surface-variant font-body-md mb-3">You have no active listings.</p>
        <button onclick="navigateTo('wizard')" class="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md">
          List an Item Now
        </button>
      </div>`;
    return;
  }

  container.innerHTML = state.userListings
    .map(
      (item) => `
    <div class="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm border border-outline-variant/30 flex items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <img class="w-16 h-20 rounded-lg object-cover" src="${item.cover_image || 'assets/logo.png'}" alt="${item.title}"/>
        <div>
          <span class="inline-block px-2 py-0.5 text-[10px] font-bold rounded-full ${
            item.status === 'LIVE' ? 'bg-secondary-container text-on-secondary-container' : 'bg-tertiary-fixed text-on-tertiary-fixed'
          }">${item.status}</span>
          <h4 class="font-headline-sm text-base text-on-surface font-semibold mt-1">${item.title}</h4>
          <p class="text-on-surface-variant font-label-sm text-xs">${item.listing_type} • ${item.price ? 'R ' + item.price : 'Exchange'} • ${item.safe_zone}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="deleteListing(${item.listing_id})" class="p-2 text-error hover:bg-error-container/30 rounded-lg transition" title="Delete listing">
          <span class="material-symbols-outlined text-[20px]">delete</span>
        </button>
      </div>
    </div>
  `
    )
    .join('');
}

async function renderDashboardFavorites() {
  const container = document.getElementById('dashFavoritesGrid');
  if (!container) return;

  try {
    const res = await api('/api/favourites/');
    if (res.ok) {
      const data = await res.json();
      const favs = data.results || data;
      if (favs.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-10 bg-surface-container-low rounded-xl text-on-surface-variant font-body-md">No saved favorites yet.</div>`;
        return;
      }
      container.innerHTML = favs
        .map((f) => {
          const item = f.listing_detail;
          if (!item) return '';
          return `
            <div class="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm border border-outline-variant/30 flex items-center justify-between gap-4">
              <div class="flex items-center gap-4 cursor-pointer" onclick="openItemDetails(${item.listing_id})">
                <img class="w-16 h-20 rounded-lg object-cover" src="${item.cover_image || 'assets/logo.png'}" alt="${item.title}"/>
                <div>
                  <h4 class="font-headline-sm text-base text-on-surface font-semibold">${item.title}</h4>
                  <p class="text-on-surface-variant font-label-sm text-xs">${item.seller_name} • ${item.price ? 'R ' + item.price : item.listing_type}</p>
                  <p class="text-secondary font-label-sm text-[11px] flex items-center gap-1 mt-1">
                    <span class="material-symbols-outlined text-[13px]">location_on</span> ${item.safe_zone || 'Central Library'}
                  </p>
                </div>
              </div>
              <div>
                <button onclick="startSwapForListing(${item.listing_id})" class="px-3 py-1.5 bg-primary text-on-primary rounded-lg text-label-sm font-semibold hover:bg-primary-container transition">
                  Contact
                </button>
              </div>
            </div>
          `;
        })
        .join('');
    }
  } catch (err) {
    console.error('Error loading dashboard favorites:', err);
  }
}

async function deleteListing(id) {
  if (!confirm('Are you sure you want to delete this listing?')) return;
  try {
    const res = await api(`/api/listings/${id}/`, { method: 'DELETE' });
    if (res.ok || res.status === 204) {
      showToast('Listing removed successfully', 'info');
      loadDashboard();
      loadListings();
    }
  } catch (e) {
    console.error('Error deleting listing:', e);
  }
}

// --- Admin & Moderation ---
async function loadAdmin() {
  if (!state.currentUser?.is_staff && state.currentUser?.role !== 'ADMIN') {
    showToast('Admin privilege required', 'error');
    navigateTo('feed');
    return;
  }
  try {
    const [statsRes, reportsRes] = await Promise.all([
      api('/api/moderation/listings/stats/'),
      api('/api/moderation/reports/'),
    ]);

    if (statsRes.ok) {
      const stats = await statsRes.json();
      document.getElementById('adminStatActive').textContent = stats.active_listings;
      document.getElementById('adminStatPending').textContent = stats.pending_review;
      document.getElementById('adminStatFlagged').textContent = stats.flagged;
      document.getElementById('adminStatReports').textContent = stats.open_reports;
    }

    if (reportsRes.ok) {
      const reports = await reportsRes.json();
      renderAdminReports(reports.results || reports);
    }
  } catch (err) {
    console.error('Error loading admin portal:', err);
  }
}

function renderAdminReports(reports) {
  const container = document.getElementById('adminReportsList');
  if (!container) return;
  if (reports.length === 0) {
    container.innerHTML = `<div class="text-center py-8 text-on-surface-variant font-body-md">No pending reports or moderation flags. Great job!</div>`;
    return;
  }
  container.innerHTML = reports
    .map(
      (r) => `
      <div class="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30 flex items-center justify-between gap-4">
        <div>
          <span class="inline-block px-2 py-0.5 rounded text-xs font-bold bg-error-container text-on-error-container">Report #${r.report_id}</span>
          <h4 class="font-semibold text-on-surface mt-1">Listing ID: ${r.listing}</h4>
          <p class="text-sm text-on-surface-variant">Reason: ${r.reason}</p>
          <p class="text-xs text-outline mt-1">Reported on ${new Date(r.date_reported).toLocaleDateString()}</p>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="adminActionListing(${r.listing}, 'approve')" class="px-3 py-1.5 bg-secondary text-on-secondary text-xs rounded-lg font-bold">Approve</button>
          <button onclick="adminActionListing(${r.listing}, 'flag')" class="px-3 py-1.5 bg-tertiary text-on-tertiary text-xs rounded-lg font-bold">Flag</button>
          <button onclick="adminActionListing(${r.listing}, 'remove')" class="px-3 py-1.5 bg-error text-on-error text-xs rounded-lg font-bold">Remove</button>
        </div>
      </div>
    `
    )
    .join('');
}

async function adminActionListing(listingId, action) {
  try {
    const res = await api(`/api/moderation/listings/${listingId}/${action}/`, {
      method: 'POST',
      body: JSON.stringify({ reason: `Action taken by admin: ${action}` }),
    });
    if (res.ok) {
      showToast(`Listing ${action}d successfully`, 'success');
      loadAdmin();
    }
  } catch (e) {
    console.error(`Error in admin action ${action}:`, e);
  }
}

// --- Notifications Dropdown ---
function toggleNotifications(e) {
  if (e) e.stopPropagation();
  const dropdown = document.getElementById('notifDropdown');
  if (dropdown) {
    dropdown.classList.toggle('hidden');
  }
}

function renderNotifications() {
  const badge = document.getElementById('notifBadge');
  const list = document.getElementById('notifList');
  const unreadCount = state.notifications.filter((n) => !n.is_read).length;

  if (badge) {
    if (unreadCount > 0) {
      badge.textContent = unreadCount;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  if (list) {
    if (state.notifications.length === 0) {
      list.innerHTML = `<div class="p-4 text-center text-sm text-on-surface-variant">No notifications</div>`;
      return;
    }
    list.innerHTML = state.notifications
      .map(
        (n) => `
      <div onclick="handleNotificationClick(${n.notification_id}, '${n.link || ''}')" class="p-3 border-b border-surface-container hover:bg-surface-container cursor-pointer transition ${
          !n.is_read ? 'bg-secondary-fixed/20' : ''
        }">
        <p class="text-xs font-semibold text-on-surface">${n.title ? `<strong class="text-primary block">${n.title}</strong>` : ''}${n.message || n.body || ''}</p>
        <span class="text-[10px] text-outline">${new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    `
      )
      .join('');
  }
}

async function handleNotificationClick(notifId, link) {
  await markNotificationRead(notifId);
  const dropdown = document.getElementById('notifDropdown');
  if (dropdown) dropdown.classList.add('hidden');

  if (!link) {
    navigateTo('feed');
    return;
  }

  if (link.includes('dashboard') || link.includes('my-dashboard')) {
    navigateTo('dashboard');
  } else if (link.includes('message') || link.includes('chat')) {
    navigateTo('chat');
  } else if (link.includes('listing')) {
    const match = link.match(/\/listings\/(\d+)/) || link.match(/listing_id=(\d+)/);
    if (match && match[1]) {
      openItemDetails(parseInt(match[1]));
    } else {
      navigateTo('feed');
    }
  } else {
    navigateTo('feed');
  }
}

// --- Chat Deal Actions ---
async function handleReserveFromChat() {
  const itemMsg = state.activeChatMessages && state.activeChatMessages.find((m) => m.listing);
  const listingId = (state.activeChatListing && state.activeChatListing.listing_id) || (itemMsg && itemMsg.listing);
  if (!listingId) {
    showToast('No active listing attached to this chat', 'info');
    return;
  }

  try {
    const res = await api(`/api/listings/${listingId}/reserve/`, { method: 'POST' });
    if (res.ok) {
      state.activeChatListingStatus = 'RESERVED';
      showToast('Item marked as RESERVED for safe campus exchange!', 'success');
      if (state.activeChatUser) {
        await api('/api/messaging/', {
          method: 'POST',
          body: JSON.stringify({
            receiver: state.activeChatUser.user_id,
            listing: listingId,
            message_text: '🔒 [Trade Update]: I have marked this listing as RESERVED for our safe zone meetup!',
          }),
        });
        await loadThreadMessages(state.activeChatUser.user_id);
      }
      renderActiveChat();
    } else {
      const err = await res.json();
      showToast(err.detail || 'Could not reserve listing', 'error');
    }
  } catch (err) {
    console.error('Error reserving listing:', err);
    showToast('Failed to mark listing reserved', 'error');
  }
}

async function handleCompleteTradeFromChat() {
  const itemMsg = state.activeChatMessages && state.activeChatMessages.find((m) => m.listing);
  const listingId = (state.activeChatListing && state.activeChatListing.listing_id) || (itemMsg && itemMsg.listing);
  if (!listingId) {
    showToast('No active listing attached to this chat', 'info');
    return;
  }

  if (!confirm('Confirm this exchange is complete? Both students will receive sustainability impact points! 🎉')) {
    return;
  }

  try {
    const res = await api(`/api/listings/${listingId}/complete_trade/`, { method: 'POST' });
    if (res.ok) {
      state.activeChatListingStatus = 'COMPLETED';
      showToast('🎉 Trade confirmed complete! SPU Campus Impact points awarded.', 'success');
      if (state.activeChatUser) {
        await api('/api/messaging/', {
          method: 'POST',
          body: JSON.stringify({
            receiver: state.activeChatUser.user_id,
            listing: listingId,
            message_text: '🎉 [Trade Completed]: Exchange confirmed in safe zone! +1 Textile Diverted, +10 SPU Trust Points logged.',
          }),
        });
        await loadThreadMessages(state.activeChatUser.user_id);
      }
      renderActiveChat();
      await loadNotifications();
    } else {
      const err = await res.json();
      showToast(err.detail || 'Could not complete trade', 'error');
    }
  } catch (err) {
    console.error('Error completing trade:', err);
    showToast('Failed to confirm trade completion', 'error');
  }
}

// --- Background Polling (Chat & Notifications) ---
let chatPollingInterval = null;
let notificationPollingInterval = null;

function startChatPolling() {
  stopChatPolling();
  chatPollingInterval = setInterval(() => {
    if (state.currentView === 'chat' && state.activeChatUser) {
      loadThreadMessages(state.activeChatUser.user_id, true);
    }
  }, 3500);
}

function stopChatPolling() {
  if (chatPollingInterval) {
    clearInterval(chatPollingInterval);
    chatPollingInterval = null;
  }
}

function startNotificationPolling() {
  if (notificationPollingInterval) clearInterval(notificationPollingInterval);
  notificationPollingInterval = setInterval(() => {
    if (state.currentUser) {
      loadNotifications();
    }
  }, 15000);
}

// --- Report Modal Handlers ---
function openReportModalFromDetail() {
  if (!state.currentUser) {
    openAuthModal('signin', 'Please sign in to report a listing');
    return;
  }
  if (!state.selectedItemForModal) return;
  openReportModal(state.selectedItemForModal.listing_id, state.selectedItemForModal.title);
}

function openReportModal(listingId, title) {
  if (!state.currentUser) {
    openAuthModal('signin', 'Please sign in to report a listing');
    return;
  }
  const modal = document.getElementById('reportModal');
  const titleElem = document.getElementById('reportItemTitle');
  const idInput = document.getElementById('reportListingId');
  if (titleElem) titleElem.textContent = title || `Listing #${listingId}`;
  if (idInput) idInput.value = listingId;
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeReportModal() {
  const modal = document.getElementById('reportModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

async function submitListingReport(e) {
  e.preventDefault();
  const listingId = document.getElementById('reportListingId').value;
  const reason = document.getElementById('reportReasonSelect').value;
  const details = (document.getElementById('reportDetailsText').value || '').trim();
  const fullReason = details ? `${reason}: ${details}` : reason;

  try {
    const res = await api('/api/moderation/reports/', {
      method: 'POST',
      body: JSON.stringify({
        listing: parseInt(listingId),
        reason: fullReason,
      }),
    });
    if (res.ok) {
      closeReportModal();
      showToast('Report submitted. SPU Campus Moderators will review.', 'success');
      document.getElementById('reportDetailsText').value = '';
    } else {
      const err = await res.json();
      showToast(err.detail || 'Could not submit report', 'error');
    }
  } catch (err) {
    console.error('Error submitting report:', err);
    showToast('Failed to submit report', 'error');
  }
}

// --- Campus Honor Code & Support Modals ---
function openHonorCodeModal(e) {
  if (e) e.preventDefault();
  const modal = document.getElementById('honorCodeModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeHonorCodeModal() {
  const modal = document.getElementById('honorCodeModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function openSupportModal(e) {
  if (e) e.preventDefault();
  const modal = document.getElementById('supportModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeSupportModal() {
  const modal = document.getElementById('supportModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function openForgotPasswordModal() {
  closeAuthModal();
  const modal = document.getElementById('forgotPasswordModal');
  const alert = document.getElementById('forgotPasswordSuccessAlert');
  if (alert) alert.classList.add('hidden');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeForgotPasswordModal() {
  const modal = document.getElementById('forgotPasswordModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function handleForgotPasswordSubmit(e) {
  e.preventDefault();
  const emailInput = document.getElementById('forgotPasswordEmailInput');
  const alert = document.getElementById('forgotPasswordSuccessAlert');
  if (!emailInput.value.includes('@spu.ac.za') && !emailInput.value.includes('@')) {
    showToast('Please enter a valid university email (@spu.ac.za)', 'error');
    return;
  }
  if (alert) alert.classList.remove('hidden');
  showToast('Password reset instructions sent to student inbox!', 'success');
  setTimeout(() => {
    closeForgotPasswordModal();
  }, 2200);
}

// --- Feed Filter Helpers ---
function resetAllFilters() {
  state.filters = {
    category: 'all',
    type: 'all',
    size: 'all',
    search: '',
  };
  const catSelect = document.getElementById('categoryFilter');
  if (catSelect) catSelect.value = 'all';
  const sizeSelect = document.getElementById('sizeFilter');
  if (sizeSelect) sizeSelect.value = 'all';

  document.querySelectorAll('#sizeGroup button').forEach((btn) => {
    btn.classList.remove('bg-primary', 'text-on-primary');
    btn.classList.add('bg-surface-container', 'text-on-surface');
  });
  const allSizeBtn = document.querySelector('#sizeGroup button[data-size="all"]');
  if (allSizeBtn) {
    allSizeBtn.classList.add('bg-primary', 'text-on-primary');
    allSizeBtn.classList.remove('bg-surface-container', 'text-on-surface');
  }

  loadListings();
  showToast('All filters have been reset', 'info');
}

function filterByCategoryName(categoryName) {
  navigateTo('feed');
  const cat = state.categories.find((c) => c.category_name.toLowerCase().includes(categoryName.toLowerCase()));
  if (cat) {
    setCategoryFilter(cat.category_id);
  }
}

// --- Toasts ---
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const bgColors = {
    success: 'bg-primary text-on-primary',
    error: 'bg-error text-on-error',
    info: 'bg-inverse-surface text-inverse-on-surface',
  };

  const toast = document.createElement('div');
  toast.className = `px-4 py-3 rounded-lg shadow-lg text-sm font-label-md flex items-center gap-2 animate-bounce transition-all ${
    bgColors[type] || bgColors.info
  }`;
  toast.innerHTML = `
    <span class="material-symbols-outlined text-[18px]">
      ${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}
    </span>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3500);
}

// --- Toggle dropdowns when clicking outside ---
document.addEventListener('click', (e) => {
  const notifDropdown = document.getElementById('notifDropdown');
  const notifBtn = document.getElementById('notifBtn');
  if (notifDropdown && !notifDropdown.contains(e.target) && notifBtn && !notifBtn.contains(e.target)) {
    notifDropdown.classList.add('hidden');
  }

  const userMenu = document.getElementById('userMenuDropdown');
  const userBtn = document.getElementById('userMenuBtn');
  if (userMenu && !userMenu.contains(e.target) && userBtn && !userBtn.contains(e.target)) {
    userMenu.classList.add('hidden');
  }
});

// Initial Boot
window.addEventListener('DOMContentLoaded', async () => {
  await initAuth();
  await loadCategories();
  await loadListings();
  startNotificationPolling();
});


// ==========================================
// Editorial Redesign Controller Helpers
// ==========================================

function focusSearch() {
  navigateTo('feed');
  const input = document.getElementById('searchInput');
  if (input) {
    input.focus();
    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function openDemoDetail(cardIndex) {
  navigateTo('item-detail');
}

function toggleUserDropdown() {
  const dropdown = document.getElementById('userMenuDropdown');
  if (dropdown) dropdown.classList.toggle('hidden');
}

function openSpuPassModal() {
  const modal = document.getElementById('spuPassModal');
  if (modal) modal.classList.remove('hidden');
}

function closeSpuPassModal() {
  const modal = document.getElementById('spuPassModal');
  if (modal) modal.classList.add('hidden');
}

function openProposalModal() {
  if (!state.currentUser) {
    openAuthModal('signin', 'Please sign in with your SPU student account to propose a swap');
    return;
  }
  const modal = document.getElementById('swapProposalModal');
  if (modal) modal.classList.remove('hidden');
}

function closeProposalModal() {
  const modal = document.getElementById('swapProposalModal');
  if (modal) modal.classList.add('hidden');
}

function submitProposal() {
  closeProposalModal();
  showToast('Swap proposal delivered to Kabelo M.! You can track response in Swaps & Messages.', 'success');
  navigateTo('chat');
}

function openNotificationsModal() {
  const modal = document.getElementById('notificationsModal');
  if (modal) modal.classList.remove('hidden');
}

function closeNotificationsModal() {
  const modal = document.getElementById('notificationsModal');
  if (modal) modal.classList.add('hidden');
}

function insertQuickChat(text) {
  const input = document.getElementById('chatInput');
  if (input) {
    input.value = text;
    input.focus();
  }
}

function handleAuthMenuClick() {
  if (state.currentUser) {
    logoutUser();
  } else {
    openAuthModal('signin');
  }
}

function handleSearchKeyup(e) {
  const query = e.target.value.toLowerCase().trim();
  const articles = document.querySelectorAll('#listingGrid article');
  articles.forEach((art) => {
    const text = art.textContent.toLowerCase();
    if (!query || text.includes(query)) {
      art.classList.remove('hidden');
    } else {
      art.classList.add('hidden');
    }
  });
}

function toggleSave(btn) {
  const icon = btn.querySelector('.material-symbols-outlined');
  if (!icon) return;
  const isFilled = icon.getAttribute('data-active') === 'true';
  if (isFilled) {
    icon.setAttribute('data-active', 'false');
    icon.textContent = 'favorite';
    icon.classList.remove('text-error');
    icon.classList.add('text-on-surface-variant');
    icon.style.fontVariationSettings = "'FILL' 0";
    showToast('Removed from campus saved items', 'info');
  } else {
    icon.setAttribute('data-active', 'true');
    icon.textContent = 'favorite';
    icon.classList.add('text-error');
    icon.classList.remove('text-on-surface-variant');
    icon.style.fontVariationSettings = "'FILL' 1";
    showToast('Saved to your SPU Wishlist!', 'success');
  }
}

function setActiveDealType(btn) {
  document.querySelectorAll('.deal-filter-btn').forEach((b) => {
    b.classList.remove('bg-primary-container', 'text-on-primary');
    b.classList.add('bg-surface-container-low', 'text-on-surface-variant');
  });
  btn.classList.add('bg-primary-container', 'text-on-primary');
  btn.classList.remove('bg-surface-container-low', 'text-on-surface-variant');

  const text = btn.textContent.toLowerCase();
  const articles = document.querySelectorAll('#listingGrid article');
  articles.forEach((art) => {
    if (text.includes('all')) {
      art.classList.remove('hidden');
    } else if (text.includes('direct') || text.includes('swap')) {
      art.classList.toggle('hidden', !art.textContent.toLowerCase().includes('swap'));
    } else if (text.includes('cash')) {
      art.classList.toggle('hidden', !art.textContent.toLowerCase().includes('cash'));
    } else if (text.includes('free')) {
      art.classList.toggle('hidden', !art.textContent.toLowerCase().includes('free'));
    }
  });
}

function setActiveSize(btn) {
  document.querySelectorAll('.size-filter-btn').forEach((b) => {
    b.classList.remove('bg-primary', 'text-on-primary');
    b.classList.add('bg-surface-container-lowest', 'text-on-surface-variant');
  });
  btn.classList.add('bg-primary', 'text-on-primary');
  btn.classList.remove('bg-surface-container-lowest', 'text-on-surface-variant');

  const size = btn.textContent.trim().toUpperCase();
  const articles = document.querySelectorAll('#listingGrid article');
  articles.forEach((art) => {
    if (size === 'ALL') {
      art.classList.remove('hidden');
    } else {
      art.classList.toggle('hidden', !art.textContent.toUpperCase().includes(size));
    }
  });
}

function changeThumbnail(index, element) {
  document.querySelectorAll('.thumbnail-btn').forEach((btn) => {
    btn.classList.remove('ring-2', 'ring-primary');
  });
  if (element) element.classList.add('ring-2', 'ring-primary');
}

function swapPreview(index) {
  // Preview swapper in lookbook studio
}

function selectSize(btn) {
  const container = document.getElementById('sizePills');
  if (!container) return;
  const buttons = container.querySelectorAll('button');
  buttons.forEach((b) => {
    b.className = 'px-3.5 py-1.5 rounded-md font-label-md text-label-md bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors';
  });
  btn.className = 'px-3.5 py-1.5 rounded-md font-label-md text-label-md bg-secondary text-on-secondary font-bold shadow-sm';
}

function toggleListingType(type) {
  const swapContainer = document.getElementById('swapPreferencesContainer');
  const cashContainer = document.getElementById('cashInputContainer');
  if (!swapContainer || !cashContainer) return;
  if (type === 'swap') {
    swapContainer.classList.remove('hidden');
    cashContainer.classList.add('hidden');
  } else if (type === 'cash') {
    swapContainer.classList.add('hidden');
    cashContainer.classList.remove('hidden');
  } else {
    swapContainer.classList.add('hidden');
    cashContainer.classList.add('hidden');
  }
}

function postCampusComment() {
  const input = document.getElementById('publicInquiryInput');
  if (!input || input.value.trim() === '') {
    showToast('Please type an inquiry before submitting', 'error');
    return;
  }
  showToast('Your inquiry was posted to this item discussion board!', 'success');
  input.value = '';
}

// Profile Tab Switcher
document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.profile-tab');
  const contents = document.querySelectorAll('.tab-content');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-target');
      tabs.forEach((t) => {
        t.classList.remove('bg-secondary-container', 'text-on-secondary-container', 'font-semibold');
        t.classList.add('text-on-surface-variant');
      });
      tab.classList.add('bg-secondary-container', 'text-on-secondary-container', 'font-semibold');
      tab.classList.remove('text-on-surface-variant');

      contents.forEach((c) => {
        if (c.id === targetId) {
          c.classList.remove('hidden');
        } else {
          c.classList.add('hidden');
        }
      });
    });
  });
});
