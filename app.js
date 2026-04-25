const STORAGE_KEY = "pilotpay-online-session-v1";
const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CHF"];
const PANEL_TITLES = {
  overview: "Overview",
  operations: "Operations",
  pilots: "Pilots",
  portal: "Pilot Portal",
};
const API_BASE_URL =
  new URLSearchParams(window.location.search).get("api") ||
  (window.location.protocol.startsWith("http") ? window.location.origin : "http://localhost:8787");

const state = {
  connection: {
    apiBaseUrl: API_BASE_URL,
    backendReady: false,
    bootstrapRequired: false,
  },
  session: {
    token: "",
    role: "",
    userId: "",
    userName: "",
    panel: "overview",
    selectedPilotId: "",
  },
  users: [],
  pilots: [],
  perDiems: [],
  payments: [],
  auditLogs: [],
};

const elements = {
  authGate: document.querySelector("#authGate"),
  authTitle: document.querySelector("#authTitle"),
  authDescription: document.querySelector("#authDescription"),
  authNotice: document.querySelector("#authNotice"),
  loginForm: document.querySelector("#loginForm"),
  loginEmail: document.querySelector("#loginEmail"),
  loginPassword: document.querySelector("#loginPassword"),
  authMessage: document.querySelector("#authMessage"),
  showResetButton: document.querySelector("#showResetButton"),
  bootstrapForm: document.querySelector("#bootstrapForm"),
  bootstrapName: document.querySelector("#bootstrapName"),
  bootstrapEmail: document.querySelector("#bootstrapEmail"),
  bootstrapPassword: document.querySelector("#bootstrapPassword"),
  bootstrapPasswordConfirm: document.querySelector("#bootstrapPasswordConfirm"),
  bootstrapMessage: document.querySelector("#bootstrapMessage"),
  resetForm: document.querySelector("#resetForm"),
  resetEmail: document.querySelector("#resetEmail"),
  resetMessage: document.querySelector("#resetMessage"),
  backToLoginButton: document.querySelector("#backToLoginButton"),
  sessionRoleLabel: document.querySelector("#sessionRoleLabel"),
  switchRoleButton: document.querySelector("#switchRoleButton"),
  panelTitle: document.querySelector("#panelTitle"),
  monthLabel: document.querySelector("#monthLabel"),
  heroOutstanding: document.querySelector("#heroOutstanding"),
  heroPaid: document.querySelector("#heroPaid"),
  heroPilots: document.querySelector("#heroPilots"),
  appNotice: document.querySelector("#appNotice"),
  pilotSelector: document.querySelector("#pilotSelector"),
  pilotSelectorWrap: document.querySelector("#pilotSelectorWrap"),
  managerStats: document.querySelector("#managerStats"),
  pilotBalanceList: document.querySelector("#pilotBalanceList"),
  rosterBoard: document.querySelector("#rosterBoard"),
  calendarLegend: document.querySelector("#calendarLegend"),
  entryCalendar: document.querySelector("#entryCalendar"),
  paymentHistory: document.querySelector("#paymentHistory"),
  entryHistory: document.querySelector("#entryHistory"),
  auditTrail: document.querySelector("#auditTrail"),
  pilotTable: document.querySelector("#pilotTable"),
  pilotMetrics: document.querySelector("#pilotMetrics"),
  pilotStats: document.querySelector("#pilotStats"),
  earningsTrend: document.querySelector("#earningsTrend"),
  pilotCalendar: document.querySelector("#pilotCalendar"),
  pilotTransactions: document.querySelector("#pilotTransactions"),
  userTable: document.querySelector("#userTable"),
  pilotForm: document.querySelector("#pilotForm"),
  pilotFormClear: document.querySelector("#pilotFormClear"),
  pilotId: document.querySelector("#pilotId"),
  pilotName: document.querySelector("#pilotName"),
  pilotEmail: document.querySelector("#pilotEmail"),
  pilotBase: document.querySelector("#pilotBase"),
  pilotCurrency: document.querySelector("#pilotCurrency"),
  userForm: document.querySelector("#userForm"),
  userFormClear: document.querySelector("#userFormClear"),
  userName: document.querySelector("#userName"),
  userEmail: document.querySelector("#userEmail"),
  userRole: document.querySelector("#userRole"),
  userPilotWrap: document.querySelector("#userPilotWrap"),
  userPilotId: document.querySelector("#userPilotId"),
  userPassword: document.querySelector("#userPassword"),
  entryForm: document.querySelector("#entryForm"),
  entryFormClear: document.querySelector("#entryFormClear"),
  entryId: document.querySelector("#entryId"),
  entryPilotId: document.querySelector("#entryPilotId"),
  entryDate: document.querySelector("#entryDate"),
  entryAmount: document.querySelector("#entryAmount"),
  entryCurrency: document.querySelector("#entryCurrency"),
  entryNotes: document.querySelector("#entryNotes"),
  paymentForm: document.querySelector("#paymentForm"),
  paymentFormClear: document.querySelector("#paymentFormClear"),
  paymentId: document.querySelector("#paymentId"),
  paymentPilotId: document.querySelector("#paymentPilotId"),
  paymentDate: document.querySelector("#paymentDate"),
  paymentAmount: document.querySelector("#paymentAmount"),
  paymentCurrency: document.querySelector("#paymentCurrency"),
  paymentNotes: document.querySelector("#paymentNotes"),
  exportCsvButton: document.querySelector("#exportCsvButton"),
  resetDataButton: document.querySelector("#resetDataButton"),
};

boot();

async function boot() {
  hydrateCurrencySelects();
  bindEvents();
  restoreSession();
  await initializeApp();
}

function hydrateCurrencySelects() {
  [elements.pilotCurrency, elements.entryCurrency, elements.paymentCurrency].forEach((select) => {
    select.innerHTML = CURRENCIES.map((currency) => `<option value="${currency}">${currency}</option>`).join("");
  });
}

function bindEvents() {
  elements.loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await attemptLogin();
  });
  elements.showResetButton.addEventListener("click", showResetForm);
  elements.bootstrapForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await createMasterAccount();
  });
  elements.resetForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await sendResetLink();
  });
  elements.backToLoginButton.addEventListener("click", showLoginForm);

  document.querySelectorAll(".nav-link").forEach((button) => {
    button.addEventListener("click", () => {
      state.session.panel = button.dataset.panel;
      renderLayout();
      render();
    });
  });

  elements.switchRoleButton.addEventListener("click", logout);
  elements.pilotSelector.addEventListener("change", () => {
    state.session.selectedPilotId = elements.pilotSelector.value;
    renderPilotPortal();
  });

  elements.pilotForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await savePilot();
  });
  elements.pilotFormClear.addEventListener("click", clearPilotForm);

  elements.userForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await saveUser();
  });
  elements.userFormClear.addEventListener("click", clearUserForm);
  elements.userRole.addEventListener("change", toggleUserPilotField);

  elements.entryForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await saveEntry();
  });
  elements.entryFormClear.addEventListener("click", clearEntryForm);
  elements.entryPilotId.addEventListener("change", () => {
    autopopulateEntryDefaults();
    renderEntryCalendar();
  });

  elements.paymentForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await savePayment();
  });
  elements.paymentFormClear.addEventListener("click", clearPaymentForm);
  elements.paymentPilotId.addEventListener("change", autopopulatePaymentDefaults);

  elements.exportCsvButton.addEventListener("click", exportCsv);
  elements.resetDataButton.addEventListener("click", async () => {
    await loadAppData();
  });
}

async function initializeApp() {
  try {
    const health = await apiFetch("/api/health", { auth: false });
    state.connection.backendReady = true;
    state.connection.bootstrapRequired = Boolean(health.bootstrapRequired);
  } catch (error) {
    state.connection.backendReady = false;
    showAppNotice(`The online backend is not reachable at ${state.connection.apiBaseUrl}. Start the server to use the final account flow.`);
    showLoginForm();
    elements.authMessage.textContent = "The secure backend is not available yet.";
    renderLayout();
    render();
    return;
  }

  if (state.connection.bootstrapRequired) {
    showBootstrapForm();
    renderLayout();
    render();
    return;
  }

  if (state.session.token) {
    try {
      await loadAppData();
      return;
    } catch (error) {
      clearStoredSession();
    }
  }

  showLoginForm();
  renderLayout();
  render();
}

async function attemptLogin() {
  try {
    const payload = await apiFetch("/api/auth/login", {
      method: "POST",
      auth: false,
      body: {
        email: elements.loginEmail.value.trim(),
        password: elements.loginPassword.value,
      },
    });
    elements.authMessage.textContent = "";
    applySession(payload.token, payload.user);
    await loadAppData();
  } catch (error) {
    elements.authMessage.textContent = error.message;
  }
}

async function createMasterAccount() {
  const password = elements.bootstrapPassword.value;
  if (password !== elements.bootstrapPasswordConfirm.value) {
    elements.bootstrapMessage.textContent = "The passwords do not match.";
    return;
  }

  try {
    await apiFetch("/api/bootstrap/master", {
      method: "POST",
      auth: false,
      body: {
        name: elements.bootstrapName.value.trim(),
        email: elements.bootstrapEmail.value.trim(),
        password,
      },
    });
    state.connection.bootstrapRequired = false;
    elements.bootstrapMessage.textContent = "";
    elements.loginEmail.value = elements.bootstrapEmail.value.trim();
    elements.loginPassword.value = password;
    showLoginForm();
    elements.authMessage.textContent = "Master account created. Sign in to continue.";
  } catch (error) {
    elements.bootstrapMessage.textContent = error.message;
  }
}

async function sendResetLink() {
  try {
    const payload = await apiFetch("/api/auth/forgot-password", {
      method: "POST",
      auth: false,
      body: { email: elements.resetEmail.value.trim() },
    });
    elements.resetMessage.textContent = payload.message;
  } catch (error) {
    elements.resetMessage.textContent = error.message;
  }
}

async function loadAppData() {
  const [sessionPayload, pilots, perDiems, payments, auditLogs, users] = await Promise.all([
    apiFetch("/api/session"),
    apiFetch("/api/pilots"),
    apiFetch("/api/per-diems"),
    apiFetch("/api/payments"),
    loadAuditLogs(),
    loadUsers(),
  ]);

  state.session.userId = sessionPayload.user.id;
  state.session.role = sessionPayload.user.role;
  state.session.userName = sessionPayload.user.name;
  if (state.session.role === "pilot" && sessionPayload.user.pilotId) {
    state.session.selectedPilotId = sessionPayload.user.pilotId;
    state.session.panel = "portal";
  } else if (!PANEL_TITLES[state.session.panel]) {
    state.session.panel = "overview";
  }

  state.pilots = pilots;
  state.perDiems = perDiems;
  state.payments = payments;
  state.auditLogs = auditLogs;
  state.users = users;

  syncSessionDefaults();
  renderLayout();
  render();
  hideAppNotice();
}

async function loadAuditLogs() {
  if (!canManageOperations()) return [];
  try {
    return await apiFetch("/api/audit-logs");
  } catch {
    return [];
  }
}

async function loadUsers() {
  if (!isMaster()) return [];
  try {
    return await apiFetch("/api/users");
  } catch {
    return [];
  }
}

async function savePilot() {
  try {
    const pilot = await apiFetch("/api/pilots", {
      method: "POST",
      body: {
        name: elements.pilotName.value.trim(),
        email: elements.pilotEmail.value.trim(),
        base: elements.pilotBase.value.trim(),
        preferredCurrency: elements.pilotCurrency.value,
      },
    });
    state.session.selectedPilotId = pilot.id;
    clearPilotForm();
    await loadAppData();
  } catch (error) {
    showAppNotice(error.message);
  }
}

async function saveUser() {
  try {
    await apiFetch("/api/users", {
      method: "POST",
      body: {
        name: elements.userName.value.trim(),
        email: elements.userEmail.value.trim(),
        role: elements.userRole.value,
        pilotId: elements.userRole.value === "pilot" ? elements.userPilotId.value : null,
        password: elements.userPassword.value,
      },
    });
    clearUserForm();
    await loadAppData();
    showAppNotice("Account created successfully.");
  } catch (error) {
    showAppNotice(error.message);
  }
}

async function saveEntry() {
  const draft = readEntryForm();
  if (!draft) return;

  try {
    await apiFetch("/api/per-diems", {
      method: "POST",
      body: draft,
    });
    state.session.selectedPilotId = draft.pilotId;
    clearEntryForm();
    await loadAppData();
  } catch (error) {
    showAppNotice(error.message);
  }
}

async function savePayment() {
  const draft = readPaymentForm();
  if (!draft) return;

  try {
    await apiFetch("/api/payments", {
      method: "POST",
      body: draft,
    });
    state.session.selectedPilotId = draft.pilotId;
    clearPaymentForm();
    await loadAppData();
  } catch (error) {
    showAppNotice(error.message);
  }
}

function render() {
  syncSessionDefaults();
  populatePilotSelectors();
  renderOverview();
  renderEntryCalendar();
  renderPaymentHistory();
  renderEntryHistory();
  renderAuditTrail();
  renderPilotDirectory();
  renderPilotMetrics();
  renderUserAccounts();
  renderPilotPortal();
}

function renderLayout() {
  const isLoggedIn = Boolean(state.session.token && state.session.role);
  elements.authGate.classList.toggle("is-hidden", isLoggedIn);
  elements.sessionRoleLabel.textContent = isLoggedIn
    ? `${capitalize(state.session.role)}${state.session.userName ? ` • ${state.session.userName}` : ""}`
    : "Guest";
  elements.monthLabel.textContent = currentMonthLabel();
  elements.panelTitle.textContent = PANEL_TITLES[state.session.panel] || "Overview";

  document.querySelectorAll(".panel").forEach((panel) => {
    panel.classList.toggle("is-visible", panel.id === `${state.session.panel}Panel`);
  });

  document.querySelectorAll(".nav-link").forEach((button) => {
    const target = button.dataset.panel;
    const hiddenForPilot = state.session.role === "pilot" && target !== "portal";
    button.style.display = hiddenForPilot ? "none" : "block";
    button.classList.toggle("is-active", state.session.panel === target);
  });

  elements.pilotSelectorWrap.style.display = state.session.panel === "portal" || state.session.role === "pilot" ? "block" : "none";
  elements.resetDataButton.style.display = isLoggedIn ? "inline-flex" : "none";
  elements.userForm.closest(".card").style.display = isMaster() ? "block" : "none";
  elements.userTable.closest(".card").style.display = isMaster() ? "block" : "none";
  elements.switchRoleButton.textContent = isLoggedIn ? "Log Out" : "Log Out";
  toggleUserPilotField();
}

function renderOverview() {
  elements.heroOutstanding.textContent = formatCurrencySummary(groupOutstandingByCurrency());
  elements.heroPaid.textContent = formatCurrencySummary(groupAmountsByCurrency(state.payments));
  elements.heroPilots.textContent = String(state.pilots.length);

  const stats = [
    ["Total Owed", formatCurrencySummary(groupAmountsByCurrency(state.perDiems))],
    ["Total Paid", formatCurrencySummary(groupAmountsByCurrency(state.payments))],
    ["Outstanding", formatCurrencySummary(groupOutstandingByCurrency())],
    ["Payment Completion", `${paymentCompletionRate()}%`],
  ];
  elements.managerStats.innerHTML = stats.map(statCardMarkup).join("");

  if (!state.pilots.length) {
    elements.pilotBalanceList.innerHTML = emptyState("No pilots yet", "Create the first pilot to start tracking allowances.");
    elements.rosterBoard.innerHTML = emptyState("No pilots yet", "Your monthly board will appear here.");
    return;
  }

  elements.pilotBalanceList.innerHTML = state.pilots.map(balanceRowMarkup).join("");
  elements.calendarLegend.innerHTML = `
    <div class="legend-item"><span class="legend-swatch"></span> Worked day with per diem</div>
    <div class="legend-item"><span class="legend-swatch" style="background: rgba(217, 149, 89, 0.18); border-color: rgba(217, 149, 89, 0.28)"></span> Day without entry</div>
  `;
  elements.rosterBoard.innerHTML = buildRosterBoardMarkup();
}

function renderEntryCalendar() {
  const pilotId = elements.entryPilotId.value || state.session.selectedPilotId || state.pilots[0]?.id;
  elements.entryCalendar.innerHTML = pilotId
    ? buildCalendarMarkup(pilotId)
    : emptyState("No pilot selected", "Choose a pilot to view the month.");
}

function renderPaymentHistory() {
  const rows = [...state.payments]
    .sort((a, b) => sortDatesDesc(a.date, b.date))
    .map((payment) => {
      const pilot = findPilot(payment.pilotId);
      return tableRowMarkup({
        title: pilot?.name ?? "Unknown Pilot",
        subtitle: payment.notes || "Payment recorded",
        date: payment.date,
        amount: formatMoney(payment.amount, payment.currency),
        meta: payment.currency,
      });
    });

  elements.paymentHistory.innerHTML = rows.length
    ? rows.join("")
    : emptyState("No payments yet", "Recorded payments will appear here.");
}

function renderEntryHistory() {
  const rows = [...state.perDiems]
    .sort((a, b) => sortDatesDesc(a.date, b.date))
    .map((entry) => {
      const pilot = findPilot(entry.pilotId);
      return tableRowMarkup({
        title: pilot?.name ?? "Unknown Pilot",
        subtitle: entry.notes || "Per diem entry",
        date: entry.date,
        amount: formatMoney(entry.amount, entry.currency),
        meta: entry.currency,
      });
    });

  elements.entryHistory.innerHTML = rows.length
    ? rows.join("")
    : emptyState("No entries yet", "Worked day entries will appear here.");
}

function renderAuditTrail() {
  const rows = [...state.auditLogs]
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
    .slice(0, 8)
    .map(
      (log) => `
        <div class="timeline-item">
          <strong>${humanizeAction(log.action)}</strong>
          <div>${formatAuditDetail(log.detail)}</div>
          <div class="table-meta">${formatDateTime(log.createdAt)}</div>
        </div>
      `
    );
  elements.auditTrail.innerHTML = rows.length
    ? rows.join("")
    : emptyState("No activity yet", "Recent operational activity will appear here.");
}

function renderPilotDirectory() {
  const rows = state.pilots.map((pilot) =>
    tableRowMarkup({
      title: pilot.name,
      subtitle: pilot.email,
      date: pilot.base,
      amount: pilot.preferredCurrency,
      meta: formatMoney(pilotFinancialSummary(pilot.id).outstanding, pilot.preferredCurrency),
    })
  );

  elements.pilotTable.innerHTML = rows.length
    ? rows.join("")
    : emptyState("No pilots yet", "Create your first pilot profile.");
}

function renderPilotMetrics() {
  if (!state.pilots.length) {
    elements.pilotMetrics.innerHTML = emptyState("No pilot metrics yet", "Pilot metrics will appear after entries are recorded.");
    return;
  }

  elements.pilotMetrics.innerHTML = state.pilots
    .map((pilot) => {
      const summary = pilotFinancialSummary(pilot.id);
      return `
        <div class="metric-row">
          <div>
            <strong>${pilot.name}</strong>
            <div class="table-meta">${pilot.base} base</div>
          </div>
          <div>${summary.entries} days</div>
          <div>${formatMoney(summary.averagePerDiem, pilot.preferredCurrency)}</div>
          <span class="pill ${summary.outstanding > 0 ? "partial" : "paid"}">
            ${summary.outstanding > 0 ? "Open Balance" : "Settled"}
          </span>
        </div>
      `;
    })
    .join("");
}

function renderUserAccounts() {
  if (!isMaster()) {
    elements.userTable.innerHTML = "";
    return;
  }

  const rows = state.users.map((user) => {
    const pilot = user.pilotId ? findPilot(user.pilotId) : null;
    return tableRowMarkup({
      title: user.name,
      subtitle: user.email,
      date: capitalize(user.role),
      amount: pilot ? pilot.name : "Internal account",
      meta: user.isActive ? "Active" : "Inactive",
    });
  });

  elements.userTable.innerHTML = rows.length
    ? rows.join("")
    : emptyState("No accounts yet", "Create finance and pilot logins here.");
}

function renderPilotPortal() {
  const pilotId = state.session.selectedPilotId;
  const pilot = findPilot(pilotId);
  if (!pilot) {
    elements.pilotStats.innerHTML = emptyState("No pilot selected", "Choose a pilot to review the account.");
    elements.earningsTrend.innerHTML = "";
    elements.pilotCalendar.innerHTML = "";
    elements.pilotTransactions.innerHTML = emptyState("No transactions", "Pilot transactions will appear here.");
    return;
  }

  const summary = pilotFinancialSummary(pilot.id);
  const stats = [
    ["Current Balance", formatMoney(summary.outstanding, pilot.preferredCurrency)],
    ["Total Paid", formatMoney(summary.paid, pilot.preferredCurrency)],
    ["Worked Days", String(summary.entries)],
    ["Average Per Diem", formatMoney(summary.averagePerDiem, pilot.preferredCurrency)],
  ];
  elements.pilotStats.innerHTML = stats.map(statCardMarkup).join("");
  elements.earningsTrend.innerHTML = buildTrendMarkup(pilot.id, pilot.preferredCurrency);
  elements.pilotCalendar.innerHTML = buildCalendarMarkup(pilot.id);
  elements.pilotTransactions.innerHTML = buildPilotTransactionsMarkup(pilot.id);
}

function populatePilotSelectors() {
  const options = state.pilots.map((pilot) => `<option value="${pilot.id}">${pilot.name}</option>`).join("");
  [elements.pilotSelector, elements.entryPilotId, elements.paymentPilotId, elements.userPilotId].forEach((select) => {
    const previous = select.value;
    select.innerHTML = options;
    const fallback = state.session.selectedPilotId || state.pilots[0]?.id || "";
    select.value = previous && state.pilots.some((pilot) => pilot.id === previous) ? previous : fallback;
  });
  if (state.pilots[0] && !elements.pilotSelector.value) {
    elements.pilotSelector.value = state.pilots[0].id;
  }
  state.session.selectedPilotId = elements.pilotSelector.value || state.session.selectedPilotId || state.pilots[0]?.id || "";
  autopopulateEntryDefaults();
  autopopulatePaymentDefaults();
  toggleUserPilotField();
}

function syncSessionDefaults() {
  if (!state.pilots.length) return;
  if (!state.session.selectedPilotId || !state.pilots.some((pilot) => pilot.id === state.session.selectedPilotId)) {
    state.session.selectedPilotId = state.pilots[0].id;
  }
}

function showLoginForm() {
  elements.authTitle.textContent = "Sign in to PilotPay";
  elements.authDescription.textContent = "Use your company account to access PilotPay.";
  elements.authNotice.innerHTML = `
    <strong>Private company access</strong>
    <p>This workspace only accepts internal accounts created by the master.</p>
  `;
  elements.loginForm.classList.remove("is-hidden");
  elements.bootstrapForm.classList.add("is-hidden");
  elements.resetForm.classList.add("is-hidden");
}

function showBootstrapForm() {
  elements.authTitle.textContent = "Create the master account";
  elements.authDescription.textContent = "This first setup creates the permanent master login for your company.";
  elements.authNotice.innerHTML = `
    <strong>First access only</strong>
    <p>After the master account is created, all future accounts must be created from inside PilotPay.</p>
  `;
  elements.loginForm.classList.add("is-hidden");
  elements.bootstrapForm.classList.remove("is-hidden");
  elements.resetForm.classList.add("is-hidden");
}

function showResetForm() {
  elements.authMessage.textContent = "";
  elements.resetMessage.textContent = "";
  elements.loginForm.classList.add("is-hidden");
  elements.bootstrapForm.classList.add("is-hidden");
  elements.resetForm.classList.remove("is-hidden");
}

function toggleUserPilotField() {
  if (!elements.userPilotWrap) return;
  const isPilotRole = elements.userRole.value === "pilot";
  elements.userPilotWrap.classList.toggle("is-hidden", !isPilotRole);
}

function clearPilotForm() {
  elements.pilotId.value = "";
  elements.pilotForm.reset();
  elements.pilotCurrency.value = "EUR";
}

function clearUserForm() {
  elements.userForm.reset();
  elements.userRole.value = "finance";
  toggleUserPilotField();
}

function clearEntryForm() {
  const selectedPilotId = state.session.selectedPilotId;
  elements.entryId.value = "";
  elements.entryForm.reset();
  if (selectedPilotId && state.pilots.some((pilot) => pilot.id === selectedPilotId)) {
    elements.entryPilotId.value = selectedPilotId;
  }
  autopopulateEntryDefaults();
}

function clearPaymentForm() {
  const selectedPilotId = state.session.selectedPilotId;
  elements.paymentId.value = "";
  elements.paymentForm.reset();
  if (selectedPilotId && state.pilots.some((pilot) => pilot.id === selectedPilotId)) {
    elements.paymentPilotId.value = selectedPilotId;
  }
  autopopulatePaymentDefaults();
}

function autopopulateEntryDefaults() {
  const pilot = findPilot(elements.entryPilotId.value);
  if (!pilot) return;
  elements.entryAmount.value = pilot.lastPerDiemAmount || "";
  elements.entryCurrency.value = pilot.lastPerDiemCurrency || pilot.preferredCurrency;
  elements.entryDate.value = todayString();
  elements.entryNotes.value = "";
}

function autopopulatePaymentDefaults() {
  const pilot = findPilot(elements.paymentPilotId.value);
  if (!pilot) return;
  elements.paymentCurrency.value = pilot.preferredCurrency;
  elements.paymentDate.value = todayString();
  elements.paymentAmount.value = "";
  elements.paymentNotes.value = "";
}

function readEntryForm() {
  const amount = Number(elements.entryAmount.value);
  if (!elements.entryPilotId.value || !elements.entryDate.value || !amount || amount <= 0) return null;
  return {
    pilotId: elements.entryPilotId.value,
    date: elements.entryDate.value,
    amount,
    currency: elements.entryCurrency.value,
    notes: elements.entryNotes.value.trim(),
  };
}

function readPaymentForm() {
  const amount = Number(elements.paymentAmount.value);
  if (!elements.paymentPilotId.value || !elements.paymentDate.value || !amount || amount <= 0) return null;
  return {
    pilotId: elements.paymentPilotId.value,
    date: elements.paymentDate.value,
    amount,
    currency: elements.paymentCurrency.value,
    notes: elements.paymentNotes.value.trim(),
  };
}

function groupAmountsByCurrency(records) {
  return records.reduce((accumulator, record) => {
    if (!record?.currency || !record?.amount) return accumulator;
    accumulator[record.currency] = (accumulator[record.currency] || 0) + Number(record.amount);
    return accumulator;
  }, {});
}

function groupOutstandingByCurrency() {
  return state.pilots.reduce((accumulator, pilot) => {
    const summary = pilotFinancialSummary(pilot.id);
    accumulator[pilot.preferredCurrency] = (accumulator[pilot.preferredCurrency] || 0) + summary.outstanding;
    return accumulator;
  }, {});
}

function paymentCompletionRate() {
  const owedByCurrency = groupAmountsByCurrency(state.perDiems);
  const paidByCurrency = groupAmountsByCurrency(state.payments);
  let owedTotal = 0;
  let paidWithinLimits = 0;

  Object.entries(owedByCurrency).forEach(([currency, owed]) => {
    owedTotal += owed;
    paidWithinLimits += Math.min(owed, paidByCurrency[currency] || 0);
  });

  if (!owedTotal) return 0;
  return Math.min(100, Math.round((paidWithinLimits / owedTotal) * 100));
}

function pilotFinancialSummary(pilotId) {
  const pilot = findPilot(pilotId);
  const entries = state.perDiems.filter((item) => item.pilotId === pilotId);
  const payments = state.payments.filter((item) => item.pilotId === pilotId);
  const owed = entries.reduce((sum, item) => sum + Number(item.amount), 0);
  const paid = payments.reduce((sum, item) => sum + Number(item.amount), 0);
  return {
    owed,
    paid,
    outstanding: Math.max(0, owed - paid),
    entries: entries.length,
    averagePerDiem: entries.length ? owed / entries.length : 0,
    currency: pilot?.preferredCurrency || "USD",
  };
}

function findPilot(pilotId) {
  return state.pilots.find((pilot) => pilot.id === pilotId);
}

function buildRosterBoardMarkup() {
  const days = weekBuckets();
  return state.pilots
    .map((pilot) => {
      const pilotEntries = state.perDiems.filter((entry) => entry.pilotId === pilot.id && isCurrentMonth(entry.date));
      return `
        <div class="roster-row">
          <div class="roster-name">
            <strong>${pilot.name}</strong>
            <small>${pilot.base} • ${pilot.preferredCurrency}</small>
          </div>
          ${days
            .map((bucket) => {
              const matches = pilotEntries.filter((entry) => {
                const day = Number(entry.date.slice(-2));
                return day >= bucket.start && day <= bucket.end;
              });
              return `
                <div class="roster-cell ${matches.length ? "is-worked" : ""}">
                  <strong>${bucket.label}</strong>
                  <small>${matches.length ? `${matches.length} worked day${matches.length > 1 ? "s" : ""}` : "No entries"}</small>
                </div>
              `;
            })
            .join("")}
        </div>
      `;
    })
    .join("");
}

function buildCalendarMarkup(pilotId) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = todayString();
  const entriesByDate = new Map(
    state.perDiems
      .filter((entry) => entry.pilotId === pilotId && isCurrentMonth(entry.date))
      .map((entry) => [entry.date, entry])
  );

  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const entry = entriesByDate.get(date);
    const classes = ["calendar-day"];
    if (entry) classes.push("is-worked");
    if (date === today) classes.push("is-today");

    return `
      <article class="${classes.join(" ")}">
        <strong>${day}</strong>
        ${entry ? `<small>${formatMoney(entry.amount, entry.currency)}</small><small>${entry.notes || "Worked day"}</small>` : "<small>No entry</small>"}
      </article>
    `;
  }).join("");
}

function buildTrendMarkup(pilotId, currency) {
  const months = lastSixMonths();
  const values = months.map((month) => {
    return state.perDiems
      .filter((entry) => entry.pilotId === pilotId && entry.date.startsWith(month.key))
      .reduce((sum, entry) => sum + Number(entry.amount), 0);
  });
  const max = Math.max(...values, 1);

  return months
    .map((month, index) => {
      const value = values[index];
      const height = Math.max(16, Math.round((value / max) * 180));
      return `
        <div class="chart-bar-wrap">
          <div class="chart-bar" style="height: ${height}px"></div>
          <strong>${formatMoney(value, currency)}</strong>
          <div class="chart-label">${month.label}</div>
        </div>
      `;
    })
    .join("");
}

function buildPilotTransactionsMarkup(pilotId) {
  const entries = state.perDiems.filter((item) => item.pilotId === pilotId).map((item) => ({ ...item, type: "Per diem" }));
  const payments = state.payments.filter((item) => item.pilotId === pilotId).map((item) => ({ ...item, type: "Payment" }));
  const merged = [...entries, ...payments].sort((a, b) => sortDatesDesc(a.date, b.date));
  if (!merged.length) return emptyState("No transactions yet", "This account has no movements yet.");

  return merged
    .map((item) =>
      tableRowMarkup({
        title: item.type,
        subtitle: item.notes || "-",
        date: item.date,
        amount: formatMoney(item.amount, item.currency),
        meta: item.currency,
      })
    )
    .join("");
}

function balanceRowMarkup(pilot) {
  const summary = pilotFinancialSummary(pilot.id);
  const status = summary.outstanding <= 0 ? "paid" : summary.paid > 0 ? "partial" : "pending";
  const label = status === "paid" ? "Paid" : status === "partial" ? "Partially Paid" : "Pending";
  return `
    <div class="balance-row">
      <div>
        <strong>${pilot.name}</strong>
        <div class="table-meta">${pilot.base} base</div>
      </div>
      <div>
        <div class="table-meta">Outstanding</div>
        <strong>${formatMoney(summary.outstanding, pilot.preferredCurrency)}</strong>
      </div>
      <span class="pill ${status}">${label}</span>
    </div>
  `;
}

function statCardMarkup([label, value]) {
  return `
    <article class="stat-card">
      <span class="muted">${label}</span>
      <strong>${value}</strong>
    </article>
  `;
}

function tableRowMarkup({ title, subtitle, date, amount, meta }) {
  return `
    <div class="table-row">
      <div>
        <strong>${title}</strong>
        <div class="table-meta">${subtitle}</div>
      </div>
      <div>${date}</div>
      <div>${amount}</div>
      <div class="actions-inline"><span class="table-meta">${meta}</span></div>
    </div>
  `;
}

function emptyState(title, description) {
  return `
    <div class="empty-state">
      <strong>${title}</strong>
      <p>${description}</p>
    </div>
  `;
}

function exportCsv() {
  const rows = [
    ["Type", "Pilot", "Date", "Amount", "Currency", "Notes"],
    ...state.perDiems.map((entry) => ["Per diem", findPilot(entry.pilotId)?.name || "", entry.date, entry.amount, entry.currency, entry.notes || ""]),
    ...state.payments.map((payment) => ["Payment", findPilot(payment.pilotId)?.name || "", payment.date, payment.amount, payment.currency, payment.notes || ""]),
  ];

  const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `pilotpay-export-${todayString()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function showAppNotice(message) {
  elements.appNotice.classList.remove("is-hidden");
  elements.appNotice.textContent = message;
}

function hideAppNotice() {
  elements.appNotice.classList.add("is-hidden");
  elements.appNotice.textContent = "";
}

function restoreSession() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    state.session.token = parsed.token || "";
    state.session.panel = parsed.panel || "overview";
  } catch {
    clearStoredSession();
  }
}

function persistSession() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      token: state.session.token,
      panel: state.session.panel,
    })
  );
}

function clearStoredSession() {
  state.session.token = "";
  state.session.role = "";
  state.session.userId = "";
  state.session.userName = "";
  state.session.panel = "overview";
  state.session.selectedPilotId = "";
  localStorage.removeItem(STORAGE_KEY);
}

function applySession(token, user) {
  state.session.token = token;
  state.session.role = user.role;
  state.session.userId = user.id;
  state.session.userName = user.name;
  state.session.panel = user.role === "pilot" ? "portal" : "overview";
  persistSession();
}

function logout() {
  clearStoredSession();
  showLoginForm();
  renderLayout();
  render();
}

async function apiFetch(pathname, options = {}) {
  const method = options.method || "GET";
  const auth = options.auth !== false;
  const headers = { "Content-Type": "application/json" };
  if (auth && state.session.token) {
    headers.Authorization = `Bearer ${state.session.token}`;
  }

  const response = await fetch(`${state.connection.apiBaseUrl}${pathname}`, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Request failed");
  }
  return payload;
}

function isMaster() {
  return state.session.role === "master";
}

function canManageOperations() {
  return state.session.role === "master" || state.session.role === "finance";
}

function formatCurrencySummary(currencyMap) {
  const entries = Object.entries(currencyMap).filter(([, amount]) => amount > 0);
  if (!entries.length) return "No balances";
  return entries
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([currency, amount]) => formatMoney(amount, currency))
    .join(" • ");
}

function formatMoney(amount, currency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function sortDatesDesc(a, b) {
  return String(b).localeCompare(String(a));
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function currentMonthLabel() {
  return new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
}

function lastSixMonths() {
  const now = new Date();
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleString("en-US", { month: "short" }),
    };
  });
}

function isCurrentMonth(dateString) {
  const now = new Date();
  return String(dateString).startsWith(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
}

function weekBuckets() {
  return [
    { label: "Days 1-4", start: 1, end: 4 },
    { label: "Days 5-8", start: 5, end: 8 },
    { label: "Days 9-12", start: 9, end: 12 },
    { label: "Days 13-16", start: 13, end: 16 },
    { label: "Days 17-20", start: 17, end: 20 },
    { label: "Days 21-24", start: 21, end: 24 },
    { label: "Days 25-31", start: 25, end: 31 },
  ];
}

function capitalize(value) {
  return value ? value[0].toUpperCase() + value.slice(1) : "";
}

function humanizeAction(action) {
  return String(action || "")
    .split("_")
    .map(capitalize)
    .join(" ");
}

function formatAuditDetail(detail) {
  if (!detail || typeof detail !== "object") return "Activity recorded";
  return Object.entries(detail)
    .map(([key, value]) => `${capitalize(key)}: ${value}`)
    .join(" • ");
}