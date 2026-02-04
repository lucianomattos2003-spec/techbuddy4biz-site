/**
 * Onboarding Wizard Logic
 * Handles multi-step form, auto-save, and API integration
 */

// Industry-specific data
const INDUSTRY_DATA = {
  pool_cleaning: {
    painPoints: [
      'Green, cloudy pool water',
      'No time to maintain the pool',
      'Confusing chemical balancing',
      'Expensive equipment repairs'
    ],
    solutions: [
      'Weekly maintenance visits',
      'Crystal clear water guaranteed',
      'Expert chemical management',
      'Preventive equipment care'
    ]
  },
  sports_medicine: {
    painPoints: [
      'Recurring sports injuries',
      'Long recovery times',
      'Unclear diagnosis',
      'Generic treatment plans'
    ],
    solutions: [
      'Specialized sports injury treatment',
      'Faster recovery protocols',
      'Advanced diagnostic tools',
      'Personalized treatment plans'
    ]
  },
  physical_therapy: {
    painPoints: [
      'Chronic pain limiting daily activities',
      'Fear of re-injury',
      'Boring exercise routines',
      'Slow progress'
    ],
    solutions: [
      'Pain-free movement restoration',
      'Safe return-to-activity programs',
      'Engaging therapy exercises',
      'Measurable progress tracking'
    ]
  },
  real_estate: {
    painPoints: [
      'Finding the right home in this market',
      'Overwhelming buying process',
      'Uncertainty about pricing',
      'Missing out on good properties'
    ],
    solutions: [
      'Curated property matching',
      'Step-by-step guidance',
      'Accurate market analysis',
      'Early access to listings'
    ]
  },
  other: {
    painPoints: [
      'Not enough time to handle everything',
      'Difficulty standing out from competitors',
      'Inconsistent results',
      'Hard to reach new customers'
    ],
    solutions: [
      'Save time with automation',
      'Unique brand positioning',
      'Proven processes',
      'Expanded online presence'
    ]
  }
};

class OnboardingWizard {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 6;
    this.sessionId = null;
    this.formData = {};
    this.autoSaveTimer = null;
    this.isNewSession = true;

    this.init();
  }

  async init() {
    console.log('[WIZARD] ========== ONBOARDING WIZARD INITIALIZED ==========');
    console.log('[WIZARD] Current URL:', window.location.href);

    // Check for session resume in URL
    const urlParams = new URLSearchParams(window.location.search);
    const resumeSessionId = urlParams.get('session');

    if (resumeSessionId) {
      console.log('[WIZARD] Found session ID in URL:', resumeSessionId);
      // Resume existing session
      await this.loadSession(resumeSessionId);
    } else {
      console.log('[WIZARD] No session ID in URL - starting fresh');
    }

    this.setupEventListeners();
    this.showStep(1);
    console.log('[WIZARD] Wizard initialized - ready for user input');
  }

  setupEventListeners() {
    // Step 1 form
    const form1 = document.getElementById('form-step-1');
    if (form1) {
      form1.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleStep1Submit();
      });
    }

    // Step 2 form
    const form2 = document.getElementById('form-step-2');
    if (form2) {
      form2.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleStep2Submit();
      });

      // Industry change handler
      const industrySelect = document.getElementById('industry');
      industrySelect?.addEventListener('change', (e) => {
        this.handleIndustryChange(e.target.value);
      });

      // Personality selection
      document.querySelectorAll('.personality-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.selectPersonality(btn.dataset.value);
        });
      });
    }

    // Step 3 form
    const form3 = document.getElementById('form-step-3');
    if (form3) {
      form3.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleStep3Submit();
      });

      // Platform selection
      document.querySelectorAll('.platform-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.selectPlatform(btn.dataset.value);
        });
      });

      // Day selection
      document.querySelectorAll('.day-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
          const label = checkbox.closest('label');
          if (checkbox.checked) {
            label.classList.add('border-brandBlue', 'bg-brandBlue/20');
          } else {
            label.classList.remove('border-brandBlue', 'bg-brandBlue/20');
          }
        });
      });

      // Posts per day slider
      const slider = document.getElementById('posts-per-day');
      slider?.addEventListener('input', (e) => {
        const value = e.target.value;
        const label = document.getElementById('posts-per-day-value');
        if (label) {
          label.textContent = `${value} post${value > 1 ? 's' : ''}/day ${value == 1 ? '(Recommended)' : ''}`;
        }
      });
    }

    // Step 4 form
    const form4 = document.getElementById('form-step-4');
    if (form4) {
      form4.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleStep4Submit();
      });

      // Connect Facebook button (placeholder)
      document.getElementById('connect-facebook-btn')?.addEventListener('click', () => {
        alert('OAuth integration will be implemented in a future update. For now, you can skip this step.');
      });
    }

    // Step 5 form
    const form5 = document.getElementById('form-step-5');
    if (form5) {
      form5.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleStep5Submit();
      });
    }

    // Back buttons
    document.getElementById('back-to-step-1')?.addEventListener('click', () => {
      this.showStep(1);
    });
    document.getElementById('back-to-step-2')?.addEventListener('click', () => {
      this.showStep(2);
    });
    document.getElementById('back-to-step-3')?.addEventListener('click', () => {
      this.showStep(3);
    });
    document.getElementById('back-to-step-4')?.addEventListener('click', () => {
      this.showStep(4);
    });

    // Save & Exit
    document.getElementById('save-exit-btn')?.addEventListener('click', () => {
      this.saveAndExit();
    });

    // Auto-save on form field changes
    document.querySelectorAll('input, textarea, select').forEach(field => {
      field.addEventListener('change', () => {
        this.scheduleAutoSave();
      });
    });
  }

  async handleStep1Submit() {
    console.log('[WIZARD] Step 1 submit started');
    const form = document.getElementById('form-step-1');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    console.log('[WIZARD] Step 1 form data:', data);

    // Store in memory
    this.formData.step1 = data;

    // If this is a brand new session (no sessionId yet), create it
    if (!this.sessionId) {
      console.log('[WIZARD] No session ID, creating new session');
      try {
        await this.createSession(data);
        console.log('[WIZARD] Session created successfully');
      } catch (err) {
        console.error('[WIZARD] Failed to create session:', err);
        return;
      }
    } else {
      console.log('[WIZARD] Session exists, saving progress for step 1');
      await this.saveProgress(1, data);
    }

    // Move to step 2
    console.log('[WIZARD] Moving to step 2');
    this.showStep(2);
  }

  async handleStep2Submit() {
    const form = document.getElementById('form-step-2');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Get selected pain points and solutions
    const painPoints = Array.from(document.querySelectorAll('input[name="pain_points"]:checked'))
      .map(cb => cb.value);
    const solutions = Array.from(document.querySelectorAll('input[name="solutions"]:checked'))
      .map(cb => cb.value);

    if (painPoints.length < 2) {
      alert('Please select at least 2 pain points');
      return;
    }

    if (solutions.length < 2) {
      alert('Please select at least 2 solutions');
      return;
    }

    data.pain_points = painPoints;
    data.solutions = solutions;

    // Get custom pain points and solutions (trim whitespace)
    data.custom_pain_points = document.getElementById('custom_pain_points')?.value?.trim() || '';
    data.custom_solutions = document.getElementById('custom_solutions')?.value?.trim() || '';

    // Store in memory
    this.formData.step2 = data;

    // Save progress
    await this.saveProgress(2, data);

    // Move to step 3
    this.showStep(3);
  }

  async handleStep3Submit() {
    const form = document.getElementById('form-step-3');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Get selected platform
    const platformsInput = document.getElementById('platforms');
    if (!platformsInput.value) {
      alert('Please select at least one platform');
      return;
    }

    // Get selected posting times
    const postingTimes = Array.from(document.querySelectorAll('input[name="posting_times"]:checked'))
      .map(cb => cb.value);
    if (postingTimes.length === 0) {
      alert('Please select at least one posting time');
      return;
    }

    // Get selected days
    const postingDays = Array.from(document.querySelectorAll('input[name="posting_days"]:checked'))
      .map(cb => parseInt(cb.value));
    if (postingDays.length === 0) {
      alert('Please select at least one day');
      return;
    }

    // Get selected languages
    const languages = Array.from(document.querySelectorAll('input[name="languages"]:checked'))
      .map(cb => cb.value);

    data.platforms = [platformsInput.value];
    data.posting_times = postingTimes;
    data.posting_days = postingDays;
    data.languages = languages;

    // Store in memory
    this.formData.step3 = data;

    // Save progress
    await this.saveProgress(3, data);

    // Move to step 4
    this.showStep(4);
  }

  async handleStep4Submit() {
    const form = document.getElementById('form-step-4');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Store in memory
    this.formData.step4 = data;

    // Save progress
    await this.saveProgress(4, data);

    // Move to step 5 (review)
    this.generateReviewSummary();
    this.showStep(5);
  }

  async handleStep5Submit() {
    const termsCheckbox = document.getElementById('terms-agreed');
    if (!termsCheckbox.checked) {
      alert('Please agree to the Terms of Service and Privacy Policy to continue');
      return;
    }

    // Store in memory
    this.formData.step5 = { terms_agreed: true };

    // Save progress
    await this.saveProgress(5, { terms_agreed: true });

    // Complete onboarding
    await this.completeOnboarding();
  }

  selectPlatform(platform) {
    // Remove previous selection
    document.querySelectorAll('.platform-btn').forEach(btn => {
      btn.classList.remove('border-brandBlue', 'bg-brandBlue/10');
    });

    // Add selection
    const selectedBtn = document.querySelector(`.platform-btn[data-value="${platform}"]`);
    if (selectedBtn) {
      selectedBtn.classList.add('border-brandBlue', 'bg-brandBlue/10');
    }

    // Set hidden input
    document.getElementById('platforms').value = platform;

    // Show/hide platform-specific settings
    if (platform === 'instagram') {
      document.getElementById('instagram-settings').classList.remove('hidden');
      // Make Instagram handle required
      document.getElementById('instagram-handle').required = true;
    } else {
      document.getElementById('instagram-settings').classList.add('hidden');
      document.getElementById('instagram-handle').required = false;
    }
  }

  generateReviewSummary() {
    const container = document.getElementById('review-summary');
    if (!container) return;

    const step1 = this.formData.step1 || {};
    const step2 = this.formData.step2 || {};
    const step3 = this.formData.step3 || {};
    const step4 = this.formData.step4 || {};

    container.innerHTML = `
      <div class="bg-slate-900 border border-slate-600 rounded-lg p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-white">👤 YOUR BUSINESS</h3>
          <button type="button" class="text-sm text-brandBlue hover:underline" onclick="wizard.showStep(1)">Edit ✏️</button>
        </div>
        <div class="text-sm text-gray-300 space-y-1">
          <p class="font-medium">${step1.business_name || 'N/A'}</p>
          <p>${step1.contact_first_name || ''} ${step1.contact_last_name || ''} • ${step1.contact_email || ''}</p>
          <p>${step1.timezone || ''}</p>
        </div>
      </div>

      <div class="bg-slate-900 border border-slate-600 rounded-lg p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-white">🎨 BRAND VOICE</h3>
          <button type="button" class="text-sm text-brandBlue hover:underline" onclick="wizard.showStep(2)">Edit ✏️</button>
        </div>
        <div class="text-sm text-gray-300 space-y-1">
          <p>Industry: ${step2.industry || 'N/A'}</p>
          <p>Personality: ${step2.personality || 'N/A'}</p>
          <p>Pain Points: ${step2.pain_points?.length || 0} defined${step2.custom_pain_points ? ' + custom details' : ''}</p>
          <p>Solutions: ${step2.solutions?.length || 0} defined${step2.custom_solutions ? ' + custom details' : ''}</p>
        </div>
      </div>

      <div class="bg-slate-900 border border-slate-600 rounded-lg p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-white">📱 SOCIAL MEDIA</h3>
          <button type="button" class="text-sm text-brandBlue hover:underline" onclick="wizard.showStep(3)">Edit ✏️</button>
        </div>
        <div class="text-sm text-gray-300 space-y-1">
          <p>📸 Instagram: @${step3.instagram_handle || 'N/A'}</p>
          <p>Schedule: ${this.formatSchedule(step3)}</p>
          <p>Languages: ${step3.languages?.join(', ') || 'English'}</p>
          <p>Approval: ${step3.approval_mode === 'email' ? 'Email approval before posting' : 'Auto-publish'}</p>
        </div>
      </div>

      <div class="bg-slate-900 border border-slate-600 rounded-lg p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-white">🔗 CONNECTIONS</h3>
          <button type="button" class="text-sm text-brandBlue hover:underline" onclick="wizard.showStep(4)">Edit ✏️</button>
        </div>
        <div class="text-sm text-gray-300 space-y-1">
          <p>Instagram: ${step4.instagram_connected === 'true' ? '✅ Connected' : '⚠️ Not connected (skip for now)'}</p>
          <p>Email: Using TBB shared sender</p>
        </div>
      </div>
    `;
  }

  formatSchedule(step3Data) {
    if (!step3Data) return 'N/A';

    const days = step3Data.posting_days || [];
    const times = step3Data.posting_times || [];
    const postsPerDay = step3Data.posts_per_day || 1;

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const selectedDays = days.map(d => dayNames[d]).join('-');
    const selectedTimes = times.map(t => {
      const hour = parseInt(t.split(':')[0]);
      const suffix = hour >= 12 ? 'pm' : 'am';
      const displayHour = hour > 12 ? hour - 12 : hour;
      return `${displayHour}${suffix}`;
    }).join(', ');

    return `${selectedDays} at ${selectedTimes} (${postsPerDay} post/day)`;
  }

  async completeOnboarding() {
    console.log('[WIZARD] ========== COMPLETING ONBOARDING ==========');
    console.log('[WIZARD] Session ID:', this.sessionId);

    if (!this.sessionId) {
      console.error('❌ [WIZARD] No session found!');
      alert('No session found. Please start over.');
      return;
    }

    try {
      console.log(`[WIZARD] Sending POST /api/onboarding/${this.sessionId}/complete`);
      const response = await fetch(`/api/onboarding/${this.sessionId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('[WIZARD] Complete response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[WIZARD] Complete error response:', errorText);
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { message: errorText };
        }
        throw new Error(error.message || 'Failed to complete onboarding');
      }

      const result = await response.json();
      console.log('✅ [WIZARD] Onboarding completed successfully!', result);

      // Update success page
      const step1 = this.formData.step1 || {};
      const step4 = this.formData.step4 || {};

      document.getElementById('success-name').textContent =
        `Welcome to TechBuddy4Biz, ${step1.contact_first_name || 'there'}!`;
      document.getElementById('success-business').textContent =
        `${step1.business_name || 'Your account'} is all set up and ready to go.`;
      document.getElementById('success-email').textContent =
        `We've sent a welcome email to ${step1.contact_email || 'your email'} with your login link and first post preview!`;

      if (step4.instagram_connected !== 'true') {
        const connEl = document.getElementById('success-connection');
        if (connEl) {
          connEl.innerHTML = '<span class="text-gray-500">⚠️</span><span>Instagram pending (you can connect it later)</span>';
        }
      }

      // Show success page
      this.showStep(6);

    } catch (err) {
      console.error('❌ Failed to complete onboarding:', err);
      alert('Failed to complete onboarding: ' + err.message);
    }
  }

  handleIndustryChange(industry) {
    const specificContainer = document.getElementById('industry-specific-container');
    const specificInput = document.getElementById('industry-specific');

    if (industry === 'other') {
      specificContainer.classList.remove('hidden');
      specificInput.required = true;
    } else {
      specificContainer.classList.add('hidden');
      specificInput.required = false;
    }

    // Populate pain points and solutions
    this.populatePainPointsAndSolutions(industry);
  }

  populatePainPointsAndSolutions(industry) {
    const painPointsContainer = document.getElementById('pain-points-container');
    const solutionsContainer = document.getElementById('solutions-container');

    const data = INDUSTRY_DATA[industry] || INDUSTRY_DATA.other;

    // Pain points
    painPointsContainer.innerHTML = data.painPoints.map((point, idx) => `
      <label class="flex items-start gap-3 p-3 bg-slate-900 border border-slate-600 rounded-lg hover:border-brandBlue cursor-pointer transition">
        <input type="checkbox" name="pain_points" value="${point}" class="mt-1 accent-brandBlue">
        <span class="text-sm text-white">${point}</span>
      </label>
    `).join('');

    // Solutions
    solutionsContainer.innerHTML = data.solutions.map((solution, idx) => `
      <label class="flex items-start gap-3 p-3 bg-slate-900 border border-slate-600 rounded-lg hover:border-brandBlue cursor-pointer transition">
        <input type="checkbox" name="solutions" value="${solution}" class="mt-1 accent-brandBlue">
        <span class="text-sm text-white">${solution}</span>
      </label>
    `).join('');
  }

  selectPersonality(value) {
    // Remove previous selection
    document.querySelectorAll('.personality-btn').forEach(btn => {
      btn.classList.remove('border-brandBlue', 'bg-slate-800');
      btn.classList.add('border-slate-600', 'bg-slate-900');
    });

    // Add selection to clicked button
    const selectedBtn = document.querySelector(`.personality-btn[data-value="${value}"]`);
    if (selectedBtn) {
      selectedBtn.classList.remove('border-slate-600', 'bg-slate-900');
      selectedBtn.classList.add('border-brandBlue', 'bg-slate-800');
    }

    // Set hidden input
    document.getElementById('personality').value = value;
  }

  async createSession(step1Data) {
    console.log('[WIZARD] createSession() called with data:', step1Data);
    try {
      console.log('[WIZARD] Sending POST /api/onboarding/start');
      const response = await fetch('/api/onboarding/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(step1Data)
      });

      console.log('[WIZARD] Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[WIZARD] Error response body:', errorText);
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { message: errorText };
        }
        throw new Error(error.message || 'Failed to create session');
      }

      const responseText = await response.text();
      console.log('[WIZARD] Success response body:', responseText);
      const result = JSON.parse(responseText);

      this.sessionId = result.session_id;
      this.isNewSession = false;

      console.log('✅ [WIZARD] Session created successfully!');
      console.log('✅ [WIZARD] Session ID:', this.sessionId);
      console.log('✅ [WIZARD] Client ID:', result.client_id);
      console.log('✅ [WIZARD] Portal User ID:', result.portal_user_id);
      console.log('✅ [WIZARD] OTP Code (DEV ONLY):', result.otp_code);

      // Update URL with session ID (without reload)
      const url = new URL(window.location);
      url.searchParams.set('session', this.sessionId);
      window.history.replaceState({}, '', url);
      console.log('[WIZARD] URL updated with session ID');

      return result;
    } catch (err) {
      console.error('❌ [WIZARD] FATAL ERROR in createSession()');
      console.error('❌ [WIZARD] Error type:', err.constructor.name);
      console.error('❌ [WIZARD] Error message:', err.message);
      console.error('❌ [WIZARD] Error stack:', err.stack);
      alert('Failed to start onboarding: ' + err.message + '\n\nCheck browser console for details.');
      throw err;
    }
  }

  async loadSession(sessionId) {
    console.log('[WIZARD] loadSession() called for session:', sessionId);
    try {
      console.log(`[WIZARD] Fetching GET /api/onboarding/${sessionId}`);
      const response = await fetch(`/api/onboarding/${sessionId}`);

      console.log('[WIZARD] loadSession response status:', response.status);

      if (!response.ok) {
        throw new Error('Session not found or expired');
      }

      const result = await response.json();
      console.log('[WIZARD] Session data loaded:', result);

      this.sessionId = sessionId;
      this.formData = result.session.data || {};
      console.log('[WIZARD] Form data restored:', this.formData);
      this.currentStep = result.session.current_step || 1;
      this.isNewSession = false;

      console.log('✅ Session loaded:', this.sessionId);

      // Populate forms with saved data
      this.populateForm(1, this.formData.step1);
      this.populateForm(2, this.formData.step2);

      return result.session;
    } catch (err) {
      console.error('❌ Failed to load session:', err);
      // Continue with fresh session
    }
  }

  async saveProgress(step, data) {
    console.log(`[WIZARD] saveProgress() called for step ${step}`);
    console.log(`[WIZARD] Progress data:`, data);

    if (!this.sessionId) {
      console.warn('❌ [WIZARD] No session ID, skipping save');
      return;
    }

    try {
      console.log(`[WIZARD] Sending POST /api/onboarding/${this.sessionId}/progress`);
      const payload = { step, data };
      console.log('[WIZARD] Request payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(`/api/onboarding/${this.sessionId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log(`[WIZARD] saveProgress response status:`, response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[WIZARD] saveProgress error response:`, errorText);
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { message: errorText };
        }
        throw new Error(error.message || 'Failed to save progress');
      }

      const result = await response.json();
      console.log(`✅ [WIZARD] Step ${step} saved successfully`, result);
      return result;
    } catch (err) {
      console.error(`❌ [WIZARD] Failed to save step ${step}`);
      console.error('❌ [WIZARD] Error:', err.message);
      console.error('❌ [WIZARD] Stack:', err.stack);
      // Don't block user, just log error
    }
  }

  scheduleAutoSave() {
    // Debounce auto-save
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }

    this.autoSaveTimer = setTimeout(() => {
      this.autoSave();
    }, 2000);
  }

  async autoSave() {
    if (!this.sessionId || this.currentStep === 0) return;

    const form = document.getElementById(`form-step-${this.currentStep}`);
    if (!form) return;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    console.log('💾 Auto-saving step', this.currentStep);
    await this.saveProgress(this.currentStep, data);
  }

  async saveAndExit() {
    await this.autoSave();
    alert('Progress saved! You can resume later using the link in your email.');
    // Optionally redirect to a confirmation page
  }

  populateForm(step, data) {
    if (!data) return;

    const form = document.getElementById(`form-step-${step}`);
    if (!form) return;

    Object.entries(data).forEach(([key, value]) => {
      const field = form.querySelector(`[name="${key}"]`);
      if (field) {
        if (field.type === 'checkbox') {
          field.checked = value;
        } else {
          field.value = value;
        }
      }
    });
  }

  showStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.step-card').forEach(card => {
      card.classList.add('hidden');
      card.classList.remove('fade-in');
    });

    // Show target step
    const targetStep = document.getElementById(`step-${stepNumber}`);

    if (targetStep) {
      targetStep.classList.remove('hidden');
      targetStep.classList.add('fade-in');
    }

    // Update progress
    this.currentStep = stepNumber;
    this.updateProgress(stepNumber);
  }

  updateProgress(stepNumber) {
    const percentage = Math.round((stepNumber / this.totalSteps) * 100);

    document.getElementById('step-label').textContent = `Step ${stepNumber} of ${this.totalSteps}`;
    document.getElementById('progress-pct').textContent = `${percentage}%`;
    document.getElementById('progress-bar').style.width = `${percentage}%`;
  }
}

// Initialize wizard when DOM is ready and expose globally
let wizard;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    wizard = new OnboardingWizard();
    window.wizard = wizard; // Expose for review page edit buttons
  });
} else {
  wizard = new OnboardingWizard();
  window.wizard = wizard;
}
