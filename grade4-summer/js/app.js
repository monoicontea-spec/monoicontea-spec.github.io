(function () {
  "use strict";

  const KST_OFFSET = 9 * 60;

  let scheduleData = null;
  let weekOffset = 0;
  let activeMobileDay = null;

  const els = {
    title: document.getElementById("page-title"),
    weekRange: document.getElementById("week-range"),
    grid: document.getElementById("schedule-grid"),
    btnPrev: document.getElementById("btn-prev"),
    btnNext: document.getElementById("btn-next"),
    btnToday: document.getElementById("btn-today"),
  };

  /** Return a Date representing today in KST (midnight KST as UTC timestamp) */
  function getTodayKST() {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    return new Date(utc + KST_OFFSET * 60000);
  }

  /** Get Monday of the week for a given KST date, adjusted by weekOffset */
  function getWeekMonday(baseDate, offset) {
    const d = new Date(baseDate);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff + offset * 7);
    return d;
  }

  /** Build array of Mon–Fri Date objects for current view */
  function getWeekDays(monday) {
    const days = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  }

  function formatDateShort(date) {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }

  function formatWeekRange(weekDays) {
    const start = weekDays[0];
    const end = weekDays[4];
    return `${start.getFullYear()}년 ${formatDateShort(start)} ~ ${formatDateShort(end)}`;
  }

  function isSameDay(a, b) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  function getDayKey(index) {
    return scheduleData.days[index];
  }

  function renderStudentCard(student) {
    const modeClass = student.mode === "online" ? "badge-online" : "badge-offline";
    const modeLabel = MODE_LABELS[student.mode] || student.mode;
    return `
      <div class="student-card">
        <span class="student-name">${escapeHtml(student.name)}</span>
        <span class="badge ${modeClass}">${modeLabel}</span>
      </div>`;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function renderGrid(weekDays, today) {
    const { timeSlots, days, schedule } = scheduleData;
    const isMobile = window.innerWidth <= 640;

    if (isMobile && activeMobileDay === null) {
      const todayIdx = weekDays.findIndex((d) => isSameDay(d, today));
      activeMobileDay = todayIdx >= 0 ? todayIdx : 0;
    }

    if (!isMobile) {
      activeMobileDay = null;
    }

    let html = "";

    // Header row
    html += `<div class="grid-cell header-cell time-header"></div>`;
    days.forEach((dayKey, i) => {
      const isToday = isSameDay(weekDays[i], today);
      const hideOnMobile = isMobile && i !== activeMobileDay;
      const dataDay = isMobile ? (i === activeMobileDay ? ' data-day="active"' : ` data-day="${dayKey}"`) : "";
      const style = hideOnMobile ? ' style="display:none"' : "";
      html += `
        <div class="grid-cell header-cell${isToday ? " today" : ""}"${dataDay}${style}>
          <span class="day-name">${DAY_LABELS[dayKey]}</span>
          <span class="day-date">${formatDateShort(weekDays[i])}</span>
        </div>`;
    });

    // Time slot rows
    timeSlots.forEach((slot) => {
      html += `<div class="grid-cell time-cell">${escapeHtml(slot)}</div>`;

      days.forEach((dayKey, i) => {
        const entries = (schedule[slot] && schedule[slot][dayKey]) || [];
        const isToday = isSameDay(weekDays[i], today);
        const hideOnMobile = isMobile && i !== activeMobileDay;
        const dataDay = isMobile ? (i === activeMobileDay ? ' data-day="active"' : ` data-day="${dayKey}"`) : "";
        const style = hideOnMobile ? ' style="display:none"' : "";

        if (entries.length === 0) {
          html += `
            <div class="grid-cell slot-cell empty${isToday ? " today" : ""}"${dataDay}${style}>
              <span class="empty-mark">—</span>
            </div>`;
        } else {
          const cards = entries.map(renderStudentCard).join("");
          html += `
            <div class="grid-cell slot-cell${isToday ? " today" : ""}"${dataDay}${style}>
              ${cards}
            </div>`;
        }
      });
    });

    els.grid.className = "schedule-grid" + (isMobile ? " mobile-single" : "");
    els.grid.innerHTML = html;

    renderMobileTabs(weekDays, today, isMobile);
  }

  function renderMobileTabs(weekDays, today, isMobile) {
    let tabsEl = document.querySelector(".day-tabs");
    if (!isMobile) {
      if (tabsEl) tabsEl.remove();
      return;
    }

    if (!tabsEl) {
      tabsEl = document.createElement("div");
      tabsEl.className = "day-tabs";
      tabsEl.setAttribute("role", "tablist");
      els.grid.parentElement.insertBefore(tabsEl, els.grid);
    }

    tabsEl.innerHTML = scheduleData.days
      .map((dayKey, i) => {
        const isToday = isSameDay(weekDays[i], today);
        const isActive = i === activeMobileDay;
        return `
          <button type="button" class="day-tab${isActive ? " active" : ""}${isToday ? " today" : ""}"
            role="tab" aria-selected="${isActive}" data-day-index="${i}">
            ${DAY_LABELS[dayKey]} ${formatDateShort(weekDays[i])}
          </button>`;
      })
      .join("");

    tabsEl.querySelectorAll(".day-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeMobileDay = parseInt(btn.dataset.dayIndex, 10);
        render();
      });
    });
  }

  function render() {
    const today = getTodayKST();
    const monday = getWeekMonday(today, weekOffset);
    const weekDays = getWeekDays(monday);

    els.weekRange.textContent = formatWeekRange(weekDays);
    renderGrid(weekDays, today);
  }

  function initEvents() {
    els.btnPrev.addEventListener("click", () => {
      weekOffset -= 1;
      activeMobileDay = null;
      render();
    });

    els.btnNext.addEventListener("click", () => {
      weekOffset += 1;
      activeMobileDay = null;
      render();
    });

    els.btnToday.addEventListener("click", () => {
      weekOffset = 0;
      activeMobileDay = null;
      render();
    });

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(render, 150);
    });
  }

  async function init() {
    els.grid.innerHTML = '<div class="loading">일정을 불러오는 중…</div>';

    try {
      scheduleData = await loadSchedule();
      if (els.title) els.title.textContent = scheduleData.title;
      document.title = `${scheduleData.title} — 주간 일정`;
      initEvents();
      render();
    } catch (err) {
      els.grid.innerHTML = `<div class="error">${escapeHtml(err.message)}</div>`;
    }
  }

  init();
})();
