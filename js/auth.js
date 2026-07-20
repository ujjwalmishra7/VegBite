function setFieldError(field, message) {
  const formFieldWrap = field.closest(".form-field");
  if (formFieldWrap) {
    const errorEl = formFieldWrap.querySelector(".form-field__error");
    formFieldWrap.classList.toggle("has-error", Boolean(message));
    if (errorEl) errorEl.textContent = message || "";
    return;
  }

  const phoneWrap = field.closest(".phone-field");
  if (phoneWrap) {
    const errorEl = phoneWrap.nextElementSibling;
    phoneWrap.classList.toggle("has-error", Boolean(message));
    if (errorEl && errorEl.classList.contains("form-field__error")) {
      errorEl.textContent = message || "";
    }
  }
}

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validatePhone(value) {
  return /^[6-9]\d{9}$/.test(value);
}

function nextPage() {
  return new URLSearchParams(location.search).get("next") || "profile.html";
}

function oauthRedirectUrl() {
  return location.origin + location.pathname.replace(/[^/]*$/, "") + nextPage();
}

async function saveProfile(profile) {
  const client = getSupabaseClient();
  if (!client) {
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify({
      id: crypto.randomUUID(),
      email: profile.email,
      user_metadata: { full_name: profile.name, phone: profile.phone },
    }));
    return;
  }

  const { data } = await client.auth.getUser();
  if (!data.user) return;
  await client.from("profiles").upsert({
    id: data.user.id,
    full_name: profile.name,
    phone: profile.phone,
    email: profile.email || data.user.email,
  });
}

/* OTP countdown timer (shared by every OTP box on both pages) */
function startOtpTimer(timerEl, resendBtn, seconds = 60) {
  if (!timerEl || !resendBtn) return;
  if (timerEl._interval) clearInterval(timerEl._interval);

  let remaining = seconds;
  resendBtn.disabled = true;
  resendBtn.classList.add("is-disabled");
  timerEl.textContent = `Expires in ${remaining}s`;

  timerEl._interval = setInterval(() => {
    remaining -= 1;
    if (remaining <= 0) {
      clearInterval(timerEl._interval);
      timerEl.textContent = "OTP expired";
      resendBtn.disabled = false;
      resendBtn.classList.remove("is-disabled");
    } else {
      timerEl.textContent = `Expires in ${remaining}s`;
    }
  }, 1000);
}

/* Google OAuth (shared by both pages) */
function wireGoogleButton(button) {
  if (!button) return;
  button.addEventListener("click", async () => {
    const client = getSupabaseClient();
    if (!client) {
      showToast("Supabase not configured", "!");
      return;
    }
    try {
      const { error } = await client.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: oauthRedirectUrl() },
      });
      if (error) throw error;
    } catch (error) {
      showToast(error.message || "Google sign-in isn't set up yet", "!");
    }
  });
}

/* LOGIN PAGE — phone OTP first, email OTP fallback */
function initLoginPage() {
  const phonePanel = document.querySelector("#phone-panel");
  if (!phonePanel) return;

  const emailPanel = document.querySelector("#email-panel");
  const showEmailBtn = document.querySelector("#show-email-login");
  const backToPhoneBtn = document.querySelector("#back-to-phone");

  showEmailBtn?.addEventListener("click", () => {
    phonePanel.classList.add("is-hidden");
    emailPanel.classList.remove("is-hidden");
  });
  backToPhoneBtn?.addEventListener("click", () => {
    emailPanel.classList.add("is-hidden");
    phonePanel.classList.remove("is-hidden");
  });

  /* ---------------- Phone OTP ---------------- */
  const phoneForm = document.querySelector("#phone-otp-form");
  const phoneInput = document.querySelector("#login-phone");
  const phoneOtpBox = document.querySelector("#phone-otp-box");
  const phoneOtpInput = document.querySelector("#phone-otp-input");
  const phoneOtpTarget = document.querySelector("#phone-otp-target");
  const phoneOtpTimer = document.querySelector("#phone-otp-timer");
  const phoneOtpResend = document.querySelector("#phone-otp-resend");
  const sendPhoneOtpBtn = document.querySelector("#send-phone-otp");
  const verifyPhoneOtpBtn = document.querySelector("#verify-phone-otp");

  async function sendPhoneOtp() {
    if (!validatePhone(phoneInput.value.trim())) {
      setFieldError(phoneInput, "Enter a valid 10-digit mobile number");
      return;
    }
    setFieldError(phoneInput, "");

    const client = getSupabaseClient();
    if (!client) {
      showToast("Supabase not configured", "!");
      return;
    }

    try {
      sendPhoneOtpBtn.disabled = true;
      sendPhoneOtpBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending OTP...';
      const { error } = await client.auth.signInWithOtp({
        phone: `+91${phoneInput.value.trim()}`,
        options: { shouldCreateUser: true },
      });
      if (error) throw error;

      phoneOtpTarget.textContent = phoneInput.value.trim();
      phoneOtpBox.classList.remove("is-hidden");
      startOtpTimer(phoneOtpTimer, phoneOtpResend, 60);
      phoneOtpInput.focus();
      showToast("6-digit code sent by SMS", "OTP");
    } catch (error) {
      showToast(
        error.message ||
        "Couldn't send SMS OTP. Try Continue with Email instead.",
        "!"
      );
    } finally {
      sendPhoneOtpBtn.disabled = false;
      sendPhoneOtpBtn.textContent = "Send One Time Password";
    }
  }

  phoneForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    sendPhoneOtp();
  });
  phoneOtpResend?.addEventListener("click", sendPhoneOtp);

  verifyPhoneOtpBtn?.addEventListener("click", async () => {
    const code = phoneOtpInput.value.trim();
    if (code.length !== 6) {
      setFieldError(phoneOtpInput, "Enter a valid 6-digit OTP");
      return;
    }
    setFieldError(phoneOtpInput, "");

    const client = getSupabaseClient();
    if (!client) return;

    try {
      verifyPhoneOtpBtn.disabled = true;
      verifyPhoneOtpBtn.textContent = "Verifying...";
      const { error } = await client.auth.verifyOtp({
        phone: `+91${phoneInput.value.trim()}`,
        token: code,
        type: "sms",
      });
      if (error) throw error;
      window.location.href = nextPage();
    } catch (error) {
      setFieldError(phoneOtpInput, error.message || "Incorrect or expired code");
    } finally {
      verifyPhoneOtpBtn.disabled = false;
      verifyPhoneOtpBtn.textContent = "Verify & Continue";
    }
  });

  /* ---------------- Email OTP ---------------- */
  const emailForm = document.querySelector("#email-otp-form");
  const emailInput = document.querySelector("#login-email");
  const emailOtpBox = document.querySelector("#email-otp-box");
  const emailOtpInput = document.querySelector("#login-otp");
  const emailOtpTarget = document.querySelector("#email-otp-target");
  const emailOtpTimer = document.querySelector("#email-otp-timer");
  const emailOtpResend = document.querySelector("#email-otp-resend");
  const sendEmailOtpBtn = document.querySelector("#send-email-otp");
  const otpVerifyButton = document.querySelector("#otp-verify");

  async function sendEmailOtp() {
    if (!validateEmail(emailInput.value)) {
      setFieldError(emailInput, "Enter a valid email address");
      return;
    }
    setFieldError(emailInput, "");

    const client = getSupabaseClient();
    if (!client) {
      showToast("Supabase not configured", "!");
      return;
    }

    try {
      sendEmailOtpBtn.disabled = true;
      sendEmailOtpBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending OTP...';
      const { error } = await client.auth.signInWithOtp({
        email: emailInput.value.trim(),
        options: { shouldCreateUser: true },
      });
      if (error) throw error;

      emailOtpTarget.textContent = emailInput.value.trim();
      emailOtpBox.classList.remove("is-hidden");
      startOtpTimer(emailOtpTimer, emailOtpResend, 60);
      emailOtpInput.focus();
      showToast("6-digit code sent to your email", "OTP");
    } catch (error) {
      showToast(error.message || "Could not send OTP", "!");
    } finally {
      sendEmailOtpBtn.disabled = false;
      sendEmailOtpBtn.textContent = "Send 6-Digit Email OTP";
    }
  }

  emailForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    sendEmailOtp();
  });
  emailOtpResend?.addEventListener("click", sendEmailOtp);

  otpVerifyButton?.addEventListener("click", async () => {
    const code = emailOtpInput.value.trim();
    if (code.length !== 6) {
      setFieldError(emailOtpInput, "Enter a valid 6-digit OTP");
      return;
    }
    setFieldError(emailOtpInput, "");

    const client = getSupabaseClient();
    if (!client) return;

    try {
      otpVerifyButton.disabled = true;
      otpVerifyButton.textContent = "Verifying...";
      const { error } = await client.auth.verifyOtp({
        email: emailInput.value.trim(),
        token: code,
        type: "email",
      });
      if (error) throw error;
      window.location.href = nextPage();
    } catch (error) {
      setFieldError(emailOtpInput, error.message || "Incorrect or expired code");
    } finally {
      otpVerifyButton.disabled = false;
      otpVerifyButton.textContent = "Verify & Continue";
    }
  });

  wireGoogleButton(document.querySelector("#google-login"));
}

/* SIGNUP PAGE — details, then email OTP verification */
function initSignupPage() {
  const detailsPanel = document.querySelector("#details-panel");
  const form = document.querySelector("#signup-form");
  if (!detailsPanel || !form) return;

  const otpPanel = document.querySelector("#otp-panel");
  const name = form.querySelector("#signup-name");
  const email = form.querySelector("#signup-email");
  const phone = form.querySelector("#signup-phone");
  const terms = form.querySelector("#signup-terms");
  const createBtn = document.querySelector("#create-account-btn");

  const otpInput = document.querySelector("#signup-otp-input");
  const otpTarget = document.querySelector("#signup-otp-target");
  const otpTimer = document.querySelector("#signup-otp-timer");
  const otpResend = document.querySelector("#signup-otp-resend");
  const otpVerifyBtn = document.querySelector("#signup-otp-verify");
  const backBtn = document.querySelector("#back-to-details");

  function refreshCreateBtn() {
    const ready =
      name.value.trim().length >= 2 &&
      validateEmail(email.value.trim()) &&
      validatePhone(phone.value.trim()) &&
      terms.checked;
    createBtn.disabled = !ready;
  }
  [name, email, phone, terms].forEach((el) =>
    el.addEventListener("input", refreshCreateBtn)
  );
  terms.addEventListener("change", refreshCreateBtn);

  async function sendSignupOtp() {
    const client = getSupabaseClient();
    if (!client) {
      showToast("Supabase not configured", "!");
      return;
    }
    try {
      createBtn.disabled = true;
      createBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending OTP...';
      const { error } = await client.auth.signInWithOtp({
        email: email.value.trim(),
        options: {
          shouldCreateUser: true,
          data: { full_name: name.value.trim(), phone: phone.value.trim() },
        },
      });
      if (error) throw error;

      otpTarget.textContent = email.value.trim();
      detailsPanel.classList.add("is-hidden");
      otpPanel.classList.remove("is-hidden");
      startOtpTimer(otpTimer, otpResend, 60);
      otpInput.focus();
      showToast("6-digit code sent to your email", "OTP");
    } catch (error) {
      showToast(error.message || "Signup failed", "!");
    } finally {
      createBtn.innerHTML = "Create account";
      refreshCreateBtn();
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let valid = true;

    if (name.value.trim().length < 2) {
      setFieldError(name, "Enter your full name");
      valid = false;
    } else setFieldError(name, "");

    if (!validateEmail(email.value)) {
      setFieldError(email, "Enter a valid email address");
      valid = false;
    } else setFieldError(email, "");

    if (!validatePhone(phone.value.trim())) {
      setFieldError(phone, "Enter a valid 10-digit mobile number");
      valid = false;
    } else setFieldError(phone, "");

    if (!terms.checked) {
      showToast("Please accept the Terms to continue", "!");
      valid = false;
    }
    if (!valid) return;

    await sendSignupOtp();
  });

  backBtn?.addEventListener("click", () => {
    otpPanel.classList.add("is-hidden");
    detailsPanel.classList.remove("is-hidden");
  });
  otpResend?.addEventListener("click", sendSignupOtp);

  otpVerifyBtn?.addEventListener("click", async () => {
    const code = otpInput.value.trim();
    if (code.length !== 6) {
      setFieldError(otpInput, "Enter a valid 6-digit OTP");
      return;
    }
    setFieldError(otpInput, "");

    const client = getSupabaseClient();
    if (!client) return;

    try {
      otpVerifyBtn.disabled = true;
      otpVerifyBtn.textContent = "Verifying...";
      const { error } = await client.auth.verifyOtp({
        email: email.value.trim(),
        token: code,
        type: "email",
      });
      if (error) throw error;

      await saveProfile({
        name: name.value.trim(),
        email: email.value.trim(),
        phone: phone.value.trim(),
      });
      showToast("Account created successfully!", "✓");
      setTimeout(() => {
        window.location.href = nextPage();
      }, 900);
    } catch (error) {
      setFieldError(otpInput, error.message || "Incorrect or expired code");
    } finally {
      otpVerifyBtn.disabled = false;
      otpVerifyBtn.textContent = "Verify & Create Account";
    }
  });

  wireGoogleButton(document.querySelector("#google-signup"));
  refreshCreateBtn();
}

function initLiveClear() {
  document.querySelectorAll(".form-field input, .phone-field input").forEach((input) => {
    input.addEventListener("input", () => setFieldError(input, ""));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initLoginPage();
  initSignupPage();
  initLiveClear();
});
