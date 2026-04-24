const STORAGE_KEY = "pilotpay-demo-state-v2";
const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CHF"];
const PANEL_TITLES = {
  overview: "Overview",
  operations: "Operations",
  pilots: "Pilots",
  portal: "Pilot Portal",
};
const DEMO_PASSWORD = "pilotpay123";
const AUTH_USERS = [
  { id: "u1", name: "PilotPay Manager", email: "manager@pilotpay.aero", role: "manager" },
  { id: "u2", name: "Marta Silva", email: "marta@pilotpay.aero", role: "pilot", pilotId: "p1" },
  { id: "u3", name: "James Harper", email: "james@pilotpay.aero", role: "pilot", pilotId: "p2" },
  { id: "u4", name: "Luisa Bennett", email: "luisa@pilotpay.aero", role: "pilot", pilotId: "p3" },
];

const sampleState = {
  session: {
    role: "",
    panel: "overview",
    selectedPilotId: "p1",
    userId: "",
  },
  pilots: [
    {
      id: "p1",
      name: "Marta Silva",
      email: "marta@pilotpay.aero",
      base: "Porto",
      preferredCurrency: "EUR",
      lastPerDiemAmount: 140,
      lastPerDiemCurrency: "EUR",
    },
    {
      id: "p2",
      name: "James Harper",
      email: "james@pilotpay.aero",
      base: "London",
      preferredCurrency: "GBP",
      lastPerDiemAmount: 135,
      lastPerDiemCurrency: "GBP",
    },
    {
      id: "p3",
      name: "Luisa Bennett",
      email: "luisa@pilotpay.aero",
      base: "Zurich",
      preferredCurrency: "CHF",
      lastPerDiemAmount: 160,
      lastPerDiemCurrency: "CHF",
    },
  ],
  perDiems: [
    { id: "e1", pilotId: "p1", date: "2026-04-03", amount: 140, currency: "EUR", notes: "Madrid rotation" },
    { id: "e2", pilotId: "p1", date: "2026-04-11", amount: 140, currency: "EUR", notes: "Faro duty" },
    { id: "e3", pilotId: "p2", date: "2026-04-04", amount: 135, currency: "GBP", notes: "Paris overnight" },
    { id: "e4", pilotId: "p2", date: "2026-04-19", amount: 135, currency: "GBP", notes: "Dublin return" },
    { id: "e5", pilotId: "p3", date: "2026-04-08", amount: 160, currency: "CHF", notes: "Milan shuttle" },
    { id: "e6", pilotId: "p3", date: "2026-04-20", amount: 160, currency: "CHF", notes: "Vienna standby" },
  ],
  payments: [
    { id: "pay1", pilotId: "p1", date: "2026-04-15", amount: 140, currency: "EUR", notes: "Bank transfer" },
    { id: "pay2", pilotId: "p2", date: "2026-04-22", amount: 70, currency: "GBP", notes: "Partial payment" },
    { id: "pay3", pilotId: "p3", date: "2026-04-18", amount: 160, currency: "CHF", notes: "Settled monthly batch" },
  ],
  auditLogs: [
    { id: "a1", timestamp: "2026-04-22T10:20:00", action: "Payment recorded", detail: "James Harper received GBP 70.00" },
    { id: "a2", timestamp: "2026-04-20T17:10:00", action: "Per diem added", detail: "Luisa Bennett added for 2026-04-20" },
    { id: "a3", timestamp: "2026-04-15T11:42:00", action: "Payment recorded", detail: "Marta Silva received EUR 140.00" },
  ],
};

let state = loadState();

const elements = {
  authGate: document.querySelector("#authGate"),
  loginForm: document.querySelector("#loginForm"),
  loginEmail: document.querySelector("#loginEmail"),
  loginPassword: document.querySelector("#loginPassword"),
  authMessage: document.querySelector("#authMessage"),
  showResetButton: document.querySelector("#showResetButton"),
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
  pilotForm: document.querySelector("#pilotForm"),
  pilotFormClear: document.querySelector("#pilotFormClear"),
  pilotId: document.querySelector("#pilotId"),
  pilotName: document.querySelector("#pilotName"),
  pilotEmail: document.querySelector("#pilotEmail"),
  pilotBase: document.querySelector("#pilotBase"),
  pilotCurrency: document.querySelector("#pilotCurrency"),
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

function boot() {
  hydrateCurrencySelects();
  bindEvents();
  syncSessionDefaults();
  render();
}

function hydrateCurrencySelects() {
  [elements.pilotCurrency, elements.entryCurrency, elements.paymentCurrency].forEach((select) => {
    select.innerHTML = CURRENCIES.map((currency) => `<option value="${currency}">${currency}</option>`).join("");
  });
}

function bindEvents() {
  elements.loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    attemptLogin();
  });
  elements.showResetButton.addEventListener("click", showResetForm);
  elements.resetForm.addEventListener("submit", (event) => {
    event.preventDefault();
    sendResetLink();
  });
  elements.backToLoginButton.addEventListener("click", showLoginForm);

  document.querySelectorAll(".nav-link").forEach((button) => {
    button.addEventListener("click", () => {
      state.session.panel = button.dataset.panel;
      persist();
      renderLayout();
      render();
    });
  });

  elements.switchRoleButton.addEventListener("click", () => {
    state.session.role = "";
    state.session.userId = "";
    persist();
    renderLayout();
  });

  elements.pilotSelector.addEventListener("change", () => {
    state.session.selectedPilotId = elements.pilotSelector.value;
    persist();
    renderPilotPortal();
  });

  elements.pilotForm.addEventListener("submit", (event) => {
    event.preventDefault();
    savePilot();
  });
  elements.pilotFormClear.addEventListener("click", clearPilotForm);

  elements.entryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveEntry();
  });
  elements.entryFormClear.addEventListener("click", clearEntryForm);
  elements.entryPilotId.addEventListener("change", () => {
    autopopulateEntryDefaults();
    renderEntryCalendar();
  });

  elements.paymentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    savePayment();
  });
  elements.paymentFormClear.addEventListener("click", clearPaymentForm);
  elements.paymentPilotId.addEventListener("change", autopopulatePaymentDefaults);

  elements.exportCsvButton.addEventListener("click", exportCsv);
  elements.resetDataButton.addEventListener("click", resetState);
}

function attemptLogin() {
  const email = elements.loginEmail.value.trim().toLowerCase();
  const password = elements.loginPassword.value;
  const user = AUTH_USERS.find((item) => item.email === email);

  if (!user || password !== DEMO_PASSWORD) {
    elements.authMessage.textContent = "We could not sign you in with those details.";
    return;
  }

  elements.authMessage.textContent = "";
  state.session.userId = user.id;
  state.session.role = user.role;
  state.session.panel = user.role === "pilot" ? "portal" : "overview";
  if (user.pilotId) {
    state.session.selectedPilotId = user.pilotId;
  }
  persist();
  renderLayout();
  render();
}

function showResetForm() {
  elements.authMessage.textContent = "";
  elements.resetMessage.textContent = "";
  elements.loginForm.classList.add("is-hidden");
  elements.resetForm.classList.remove("is-hidden");
  elements.resetEmail.value = elements.loginEmail.value;
}

function showLoginForm() {
  elements.resetMessage.textContent = "";
  elements.resetForm.classList.add("is-hidden");
  elements.loginForm.classList.remove("is-hidden");
}

function sendResetLink() {
  const email = elements.resetEmail.value.trim().toLowerCase();
  const user = AUTH_USERS.find((item) => item.email === email);
  elements.resetMessage.textContent = user
    ? `Reset link prepared for ${email}.`
    : "If this email exists, a reset link will be sent.";
}

function syncSessionDefaults() {
  if (!state.pilots.length) return;
  if (!state.session.selectedPilotId || !state.pilots.some((pilot) => pilot.id === state.session.selectedPilotId)) {
    state.session.selectedPilotId = state.pilots[0].id;
  }
}

function render() {
  syncSessionDefaults();
  populatePilotSelectors();
  renderLayout();
  renderOverview();
  renderEntryCalendar();
  renderPaymentHistory();
  renderEntryHistory();
  renderAuditTrail();
  renderPilotDirectory();
  renderPilotMetrics();
  renderPilotPortal();
}

function renderLayout() {
  const isLoggedOut = !state.session.role;
  elements.authGate.classList.toggle("is-hidden", !isLoggedOut);
  if (isLoggedOut) {
    showLoginForm();
    elements.loginPassword.value = "";
    elements.authMessage.textContent = "";
  }
  elements.sessionRoleLabel.textContent = state.session.role ? capitalize(state.session.role) : "Guest";
  elements.switchRoleButton.textContent = state.session.role ? "Log Out" : "Switch Role";
  elements.monthLabel.textContent = currentMonthLabel();
  elements.panelTitle.textContent = PANEL_TITLES[state.session.panel] || "Overview";

  document.querySelectorAll(".panel").forEach((panel) => {
    panel.classList.toggle("is-visible", panel.id === `${state.session.panel}Panel`);
  });

  const role = state.session.role || "manager";
  document.querySelectorAll(".nav-link").forEach((button) => {
    const target = button.dataset.panel;
    const hiddenForPilot = role === "pilot" && target !== "portal";
    button.style.display = hiddenForPilot ? "none" : "block";
    button.classList.toggle("is-active", state.session.panel === target);
  });

  const portalOnly = role === "pilot";
  elements.pilotSelectorWrap.style.display = portalOnly || state.session.panel === "portal" ? "block" : "none";
}

function populatePilotSelectors() {
  const options = state.pilots.map((pilot) => `<option value="${pilot.id}">${pilot.name}</option>`).join("");
  [elements.pilotSelector, elements.entryPilotId, elements.paymentPilotId].forEach((select) => {
    const previous = select.value;
    select.innerHTML = options;
    const fallback = state.session.selectedPilotId || state.pilots[0]?.id || "";
    select.value = previous && state.pilots.some((pilot) => pilot.id === previous) ? previous : fallback;
  });
  if (state.pilots[0] && !elements.pilotSelector.value) {
    elements.pilotSelector.value = state.pilots[0].id;
  }
  state.session.selectedPilotId = elements.pilotSelector.value || state.pilots[0]?.id || "";
  autopopulateEntryDefaults();
  autopopulatePaymentDefaults();
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
    elements.pilotBalanceList.innerHTML = emptyState();
    elements.rosterBoard.innerHTML = emptyState();
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
  const pilotId = elements.entryPilotId.value || state.pilots[0]?.id;
  elements.entryCalendar.innerHTML = buildCalendarMarkup(pilotId);
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
        actions: `
          <button class="tiny-button" data-action="edit-payment" data-id="${payment.id}">Edit</button>
          <button class="tiny-button danger" data-action="delete-payment" data-id="${payment.id}">Delete</button>
        `,
      });
    });

  elements.paymentHistory.innerHTML = rows.length ? rows.join("") : emptyState();
  bindCollectionActions(elements.paymentHistory, "payment");
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
        actions: `
          <button class="tiny-button" data-action="edit-entry" data-id="${entry.id}">Edit</button>
          <button class="tiny-button danger" data-action="delete-entry" data-id="${entry.id}">Delete</button>
        `,
      });
    });

  elements.entryHistory.innerHTML = rows.length ? rows.join("") : emptyState();
  bindCollectionActions(elements.entryHistory, "entry");
}

function renderAuditTrail() {
  const rows = [...state.auditLogs]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 8)
    .map(
      (log) => `
        <div class="timeline-item">
          <strong>${log.action}</strong>
          <div>${log.detail}</div>
          <div class="table-meta">${formatDateTime(log.timestamp)}</div>
        </div>
      `
    );
  elements.auditTrail.innerHTML = rows.length ? rows.join("") : emptyState();
}

function renderPilotDirectory() {
  const rows = state.pilots.map((pilot) =>
    tableRowMarkup({
      title: pilot.name,
      subtitle: pilot.email,
      date: pilot.base,
      amount: pilot.preferredCurrency,
      meta: formatMoney(pilotFinancialSummary(pilot.id).outstanding, pilot.preferredCurrency),
      actions: `
        <button class="tiny-button" data-action="edit-pilot" data-id="${pilot.id}">Edit</button>
        <button class="tiny-button danger" data-action="delete-pilot" data-id="${pilot.id}">Delete</button>
      `,
    })
  );

  elements.pilotTable.innerHTML = rows.length ? rows.join("") : emptyState();
  elements.pilotTable.querySelectorAll("[data-action='edit-pilot']").forEach((button) => {
    button.addEventListener("click", () => fillPilotForm(button.dataset.id));
  });
  elements.pilotTable.querySelectorAll("[data-action='delete-pilot']").forEach((button) => {
    button.addEventListener("click", () => deletePilot(button.dataset.id));
  });
}

function renderPilotMetrics() {
  if (!state.pilots.length) {
    elements.pilotMetrics.innerHTML = emptyState();
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

function renderPilotPortal() {
  const pilotId = state.session.selectedPilotId;
  const pilot = findPilot(pilotId);
  if (!pilot) {
    elements.pilotStats.innerHTML = emptyState();
    elements.earningsTrend.innerHTML = "";
    elements.pilotCalendar.innerHTML = "";
    elements.pilotTransactions.innerHTML = emptyState();
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

function savePilot() {
  const draft = {
    id: elements.pilotId.value || createId("p"),
    name: elements.pilotName.value.trim(),
    email: elements.pilotEmail.value.trim(),
    base: elements.pilotBase.value.trim(),
    preferredCurrency: elements.pilotCurrency.value,
  };
  if (!draft.name || !draft.email || !draft.base) return;

  const existing = state.pilots.find((pilot) => pilot.id === draft.id);
  if (existing) {
    existing.name = draft.name;
    existing.email = draft.email;
    existing.base = draft.base;
    existing.preferredCurrency = draft.preferredCurrency;
    addAudit("Pilot updated", `${draft.name} profile was updated`);
  } else {
    state.pilots.push({
      ...draft,
      lastPerDiemAmount: 120,
      lastPerDiemCurrency: draft.preferredCurrency,
    });
    addAudit("Pilot added", `${draft.name} was added to the roster`);
  }

  state.session.selectedPilotId = draft.id;
  persist();
  clearPilotForm();
  render();
}

function saveEntry() {
  const draft = readEntryForm();
  if (!draft) return;

  const duplicate = state.perDiems.find((entry) => {
    return entry.pilotId === draft.pilotId && entry.date === draft.date && entry.id !== draft.id;
  });
  if (duplicate) {
    alert("This pilot already has a per diem entry on that date.");
    return;
  }

  const existing = state.perDiems.find((entry) => entry.id === draft.id);
  if (existing) {
    Object.assign(existing, draft);
    addAudit("Per diem updated", `${findPilot(draft.pilotId)?.name ?? "Pilot"} entry was updated`);
  } else {
    state.perDiems.push(draft);
    addAudit("Per diem added", `${findPilot(draft.pilotId)?.name ?? "Pilot"} added for ${draft.date}`);
  }

  const pilot = findPilot(draft.pilotId);
  if (pilot) {
    pilot.lastPerDiemAmount = draft.amount;
    pilot.lastPerDiemCurrency = draft.currency;
  }

  state.session.selectedPilotId = draft.pilotId;
  persist();
  clearEntryForm();
  render();
}

function savePayment() {
  const draft = readPaymentForm();
  if (!draft) return;
  const existing = state.payments.find((payment) => payment.id === draft.id);

  if (existing) {
    Object.assign(existing, draft);
    addAudit("Payment updated", `${findPilot(draft.pilotId)?.name ?? "Pilot"} payment was updated`);
  } else {
    state.payments.push(draft);
    addAudit(
      "Payment recorded",
      `${findPilot(draft.pilotId)?.name ?? "Pilot"} received ${draft.currency} ${draft.amount.toFixed(2)}`
    );
  }

  persist();
  clearPaymentForm();
  render();
}

function fillPilotForm(pilotId) {
  const pilot = findPilot(pilotId);
  if (!pilot) return;
  elements.pilotId.value = pilot.id;
  elements.pilotName.value = pilot.name;
  elements.pilotEmail.value = pilot.email;
  elements.pilotBase.value = pilot.base;
  elements.pilotCurrency.value = pilot.preferredCurrency;
  state.session.panel = "pilots";
  persist();
  renderLayout();
}

function fillEntryForm(entryId) {
  const entry = state.perDiems.find((item) => item.id === entryId);
  if (!entry) return;
  elements.entryId.value = entry.id;
  elements.entryPilotId.value = entry.pilotId;
  elements.entryDate.value = entry.date;
  elements.entryAmount.value = String(entry.amount);
  elements.entryCurrency.value = entry.currency;
  elements.entryNotes.value = entry.notes || "";
  state.session.panel = "operations";
  persist();
  renderLayout();
  renderEntryCalendar();
}

function fillPaymentForm(paymentId) {
  const payment = state.payments.find((item) => item.id === paymentId);
  if (!payment) return;
  elements.paymentId.value = payment.id;
  elements.paymentPilotId.value = payment.pilotId;
  elements.paymentDate.value = payment.date;
  elements.paymentAmount.value = String(payment.amount);
  elements.paymentCurrency.value = payment.currency;
  elements.paymentNotes.value = payment.notes || "";
  state.session.panel = "operations";
  persist();
  renderLayout();
}

function deletePilot(pilotId) {
  const pilot = findPilot(pilotId);
  if (!pilot) return;
  state.pilots = state.pilots.filter((item) => item.id !== pilotId);
  state.perDiems = state.perDiems.filter((item) => item.pilotId !== pilotId);
  state.payments = state.payments.filter((item) => item.pilotId !== pilotId);
  if (state.session.selectedPilotId === pilotId) {
    state.session.selectedPilotId = state.pilots[0]?.id || "";
  }
  addAudit("Pilot deleted", `${pilot.name} was removed from the roster`);
  persist();
  clearPilotForm();
  render();
}

function deleteEntry(entryId) {
  const entry = state.perDiems.find((item) => item.id === entryId);
  if (!entry) return;
  state.perDiems = state.perDiems.filter((item) => item.id !== entryId);
  addAudit("Per diem deleted", `${findPilot(entry.pilotId)?.name ?? "Pilot"} entry on ${entry.date} was removed`);
  persist();
  clearEntryForm();
  render();
}

function deletePayment(paymentId) {
  const payment = state.payments.find((item) => item.id === paymentId);
  if (!payment) return;
  state.payments = state.payments.filter((item) => item.id !== paymentId);
  addAudit("Payment deleted", `${findPilot(payment.pilotId)?.name ?? "Pilot"} payment on ${payment.date} was removed`);
  persist();
  clearPaymentForm();
  render();
}

function clearPilotForm() {
  elements.pilotId.value = "";
  elements.pilotForm.reset();
  elements.pilotCurrency.value = "EUR";
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
  elements.paymentId.value = "";
  elements.paymentForm.reset();
  autopopulatePaymentDefaults();
}

function autopopulateEntryDefaults() {
  const pilot = findPilot(elements.entryPilotId.value);
  if (!pilot) return;
  if (!elements.entryId.value) {
    elements.entryAmount.value = pilot.lastPerDiemAmount || "";
    elements.entryCurrency.value = pilot.lastPerDiemCurrency || pilot.preferredCurrency;
    elements.entryDate.value = todayString();
    elements.entryNotes.value = "";
  }
}

function autopopulatePaymentDefaults() {
  const pilot = findPilot(elements.paymentPilotId.value);
  if (!pilot) return;
  if (!elements.paymentId.value) {
    elements.paymentCurrency.value = pilot.preferredCurrency;
    elements.paymentDate.value = todayString();
    elements.paymentAmount.value = "";
    elements.paymentNotes.value = "";
  }
}

function readEntryForm() {
  const amount = Number(elements.entryAmount.value);
  if (!elements.entryPilotId.value || !elements.entryDate.value || !amount || amount <= 0) return null;
  return {
    id: elements.entryId.value || createId("e"),
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
    id: elements.paymentId.value || createId("pay"),
    pilotId: elements.paymentPilotId.value,
    date: elements.paymentDate.value,
    amount,
    currency: elements.paymentCurrency.value,
    notes: elements.paymentNotes.value.trim(),
  };
}

function bindCollectionActions(container, kind) {
  container.querySelectorAll(`[data-action='edit-${kind}']`).forEach((button) => {
    button.addEventListener("click", () => {
      if (kind === "entry") fillEntryForm(button.dataset.id);
      if (kind === "payment") fillPaymentForm(button.dataset.id);
    });
  });
  container.querySelectorAll(`[data-action='delete-${kind}']`).forEach((button) => {
    button.addEventListener("click", () => {
      if (kind === "entry") deleteEntry(button.dataset.id);
      if (kind === "payment") deletePayment(button.dataset.id);
    });
  });
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
      .reduce((sum, entry) => sum + entry.amount, 0);
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
  if (!merged.length) return emptyState();

  return merged
    .map((item) =>
      tableRowMarkup({
        title: item.type,
        subtitle: item.notes || "-",
        date: item.date,
        amount: formatMoney(item.amount, item.currency),
        meta: item.currency,
        actions: "",
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

function tableRowMarkup({ title, subtitle, date, amount, meta, actions }) {
  return `
    <div class="table-row">
      <div>
        <strong>${title}</strong>
        <div class="table-meta">${subtitle}</div>
      </div>
      <div>${date}</div>
      <div>${amount}</div>
      <div class="actions-inline">${actions || `<span class="table-meta">${meta}</span>`}</div>
    </div>
  `;
}

function totalPerDiems() {
  return state.perDiems.reduce((sum, item) => sum + item.amount, 0);
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
  const owed = entries.reduce((sum, item) => sum + item.amount, 0);
  const paid = payments.reduce((sum, item) => sum + item.amount, 0);
  return {
    owed,
    paid,
    outstanding: Math.max(0, owed - paid),
    entries: entries.length,
    averagePerDiem: entries.length ? owed / entries.length : 0,
    currency: pilot?.preferredCurrency || "USD",
  };
}

function groupAmountsByCurrency(records) {
  return records.reduce((accumulator, record) => {
    if (!record?.currency || !record?.amount) return accumulator;
    accumulator[record.currency] = (accumulator[record.currency] || 0) + record.amount;
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

function formatCurrencySummary(currencyMap) {
  const entries = Object.entries(currencyMap).filter(([, amount]) => amount > 0);
  if (!entries.length) return "No balances";
  return entries
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([currency, amount]) => formatMoney(amount, currency))
    .join(" • ");
}

function addAudit(action, detail) {
  state.auditLogs.unshift({
    id: createId("a"),
    timestamp: new Date().toISOString(),
    action,
    detail,
  });
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

function resetState() {
  state = structuredClone(sampleState);
  persist();
  render();
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(sampleState);
  try {
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(sampleState),
      ...parsed,
      session: { ...structuredClone(sampleState).session, ...(parsed.session || {}) },
    };
  } catch {
    return structuredClone(sampleState);
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function findPilot(pilotId) {
  return state.pilots.find((pilot) => pilot.id === pilotId);
}

function emptyState() {
  return document.querySelector("#emptyStateTemplate").innerHTML;
}

function formatMoney(amount, currency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function createId(prefix) {
  return `${prefix}${Math.random().toString(36).slice(2, 9)}`;
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function sortDatesDesc(a, b) {
  return b.localeCompare(a);
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
  return dateString.startsWith(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
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
