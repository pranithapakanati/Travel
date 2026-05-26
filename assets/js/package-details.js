/**
 * TRIPON Package Details Page — booking card, luxury pickers, share & bestseller popups
 */
(function (g) {
  "use strict";

  /* ========== Luxury calendar ========== */
  const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const MONTHS = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
  
    function pad2(n) {
      return String(n).padStart(2, "0");
    }
  
    function toDateString(y, m, d) {
      return `${y}-${pad2(m + 1)}-${pad2(d)}`;
    }
  
    function parseDateString(str) {
      if (!str) return null;
      const [y, m, d] = str.split("-").map(Number);
      if (!y || !m || !d) return null;
      return new Date(y, m - 1, d);
    }
  
    function startOfDay(d) {
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }
  
    function formatDisplayDate(str) {
      const d = parseDateString(str);
      if (!d) return "";
      return d.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  
    function hashDay(y, m, d) {
      return (y * 10000 + (m + 1) * 100 + d) % 17;
    }
  
    class TriponLuxuryCalendar {
      constructor(input, options = {}) {
        this.input = input;
        this.options = options;
        this.row = input.closest(".input-box, .field");
        this.viewYear = new Date().getFullYear();
        this.viewMonth = new Date().getMonth();
        this.selected = input.value || "";
        this.isOpen = false;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.minDate = options.minDate || this.getTodayString();
        this.currencySymbol = options.currencySymbol || "₹";
        this.basePrice = Number(options.basePrice) || 1200;
        this.packageName = options.packageName || "Your selected package";
        this.packageDuration = options.packageDuration || "";
        this.onSelect = typeof options.onSelect === "function" ? options.onSelect : null;
        this.onOpen = typeof options.onOpen === "function" ? options.onOpen : null;
        this._uid = `lux-cal-${Math.random().toString(36).slice(2, 9)}`;
  
        this.buildUI();
        this.bindEvents();
        this.syncFromInput();
      }
  
      getTodayString() {
        const n = new Date();
        return toDateString(n.getFullYear(), n.getMonth(), n.getDate());
      }
  
      formatPrice(amount) {
        const sym = this.currencySymbol;
        return `${sym}${Math.max(0, Math.round(amount)).toLocaleString("en-IN")}`;
      }
  
      getDayMeta(year, month, day) {
        const dateStr = toDateString(year, month, day);
        const cellDate = parseDateString(dateStr);
        const today = startOfDay(new Date());
        const min = parseDateString(this.minDate);
  
        if (!cellDate || cellDate < today || (min && cellDate < min)) {
          return { status: "past", dateStr, price: 0 };
        }
  
        const h = hashDay(year, month, day);
        if (h === 0 || h === 9) {
          return { status: "sold", dateStr, price: 0 };
        }
  
        const multiplier = 0.88 + (h % 7) * 0.04;
        const price = Math.round((this.basePrice * multiplier) / 50) * 50 || this.basePrice;
        return { status: "available", dateStr, price };
      }
  
      buildUI() {
        if (!this.row) return;
  
        this.row.classList.add("input-box--luxury-date");
        this.input.classList.add("luxury-date-native");
        this.input.setAttribute("tabindex", "-1");
        this.input.setAttribute("aria-hidden", "true");
        this.input.min = this.minDate;
  
        const fieldWrap = this.input.parentElement;
        if (!fieldWrap) return;
  
        this.trigger = document.createElement("button");
        this.trigger.type = "button";
        this.trigger.className = "luxury-date-trigger is-placeholder";
        this.trigger.setAttribute("aria-haspopup", "dialog");
        this.trigger.setAttribute("aria-expanded", "false");
        this.trigger.setAttribute("aria-controls", this._uid);
        this.trigger.textContent = "Select travel date";
        fieldWrap.insertBefore(this.trigger, this.input);
  
        this.popup = document.createElement("div");
        this.popup.className = "lux-cal lux-cal--floating";
        this.popup.id = this._uid;
        this.popup.setAttribute("role", "dialog");
        this.popup.setAttribute("aria-modal", "true");
        this.popup.setAttribute("aria-label", "Select travel date");
  
        this.popup.innerHTML = `
          <div class="lux-cal__glow" aria-hidden="true"></div>
          <div class="lux-cal__particles" aria-hidden="true"></div>
          <div class="lux-cal__panel">
            <header class="lux-cal__header">
              <button type="button" class="lux-cal__nav lux-cal__nav--prev" aria-label="Previous month">
                <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
              </button>
              <h3 class="lux-cal__month-label"></h3>
              <button type="button" class="lux-cal__nav lux-cal__nav--next" aria-label="Next month">
                <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
              </button>
            </header>
            <div class="lux-cal__legend">
              <span class="lux-cal__legend-item"><span class="lux-cal__legend-dot lux-cal__legend-dot--available"></span> Available</span>
              <span class="lux-cal__legend-item"><span class="lux-cal__legend-dot lux-cal__legend-dot--sold"></span> Sold out</span>
              <span class="lux-cal__legend-item"><span class="lux-cal__legend-dot lux-cal__legend-dot--selected"></span> Selected</span>
            </div>
            <div class="lux-cal__weekdays"></div>
            <div class="lux-cal__grid-wrap">
              <div class="lux-cal__grid"></div>
            </div>
            <footer class="lux-cal__footer">
              <p class="lux-cal__package-title"></p>
              <p class="lux-cal__package-meta"></p>
              <div class="lux-cal__selection">
                <span class="lux-cal__selection-text">Pick a date to continue</span>
                <span class="lux-cal__selection-price"></span>
              </div>
            </footer>
          </div>
        `;
  
        this.monthLabel = this.popup.querySelector(".lux-cal__month-label");
        this.weekdaysEl = this.popup.querySelector(".lux-cal__weekdays");
        this.gridEl = this.popup.querySelector(".lux-cal__grid");
        this.gridWrap = this.popup.querySelector(".lux-cal__grid-wrap");
        this.packageTitleEl = this.popup.querySelector(".lux-cal__package-title");
        this.packageMetaEl = this.popup.querySelector(".lux-cal__package-meta");
        this.selectionTextEl = this.popup.querySelector(".lux-cal__selection-text");
        this.selectionPriceEl = this.popup.querySelector(".lux-cal__selection-price");
        this.prevBtn = this.popup.querySelector(".lux-cal__nav--prev");
        this.nextBtn = this.popup.querySelector(".lux-cal__nav--next");
  
        this.packageTitleEl.textContent = this.packageName;
        this.packageMetaEl.textContent = this.packageDuration
          ? `${this.packageDuration.replace(/-/g, " ")} · Premium Bali experience`
          : "Premium tropical experience";
  
        WEEKDAYS.forEach((wd) => {
          const span = document.createElement("span");
          span.className = "lux-cal__weekday";
          span.textContent = wd;
          this.weekdaysEl.appendChild(span);
        });
  
        document.body.appendChild(this.popup);
  
        this.renderMonth();
        this.updateSelectionFooter();
      }
  
      positionPopup() {
        if (!this.popup || !this.row) return;
  
        const anchor = this.row.getBoundingClientRect();
        const gap = 10;
        const viewportPad = 12;
        const popupWidth = Math.min(420, window.innerWidth - viewportPad * 2);
  
        this.popup.style.width = `${popupWidth}px`;
  
        const popupRect = this.popup.getBoundingClientRect();
        const popupH = popupRect.height || 420;
  
        let top = anchor.bottom + gap;
        let left = anchor.left + anchor.width / 2 - popupWidth / 2;
  
        if (top + popupH > window.innerHeight - viewportPad) {
          const above = anchor.top - gap - popupH;
          if (above >= viewportPad) {
            top = above;
          }
        }
  
        left = Math.max(viewportPad, Math.min(left, window.innerWidth - popupWidth - viewportPad));
  
        this.popup.style.top = `${Math.round(top)}px`;
        this.popup.style.left = `${Math.round(left)}px`;
      }
  
      bindEvents() {
        const toggleBtn = this.row?.querySelector("[data-tripon-picker-toggle]");
  
        const open = () => this.open();
        const close = () => this.close();
  
        this.trigger?.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.isOpen ? close() : open();
        });
  
        toggleBtn?.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.isOpen ? close() : open();
        });
  
        this.row?.addEventListener("click", (e) => {
          if (
            e.target.closest(
              "[data-tripon-picker-toggle], .lux-cal, .lux-cal__nav, .lux-cal__day, .luxury-date-trigger"
            )
          ) {
            return;
          }
          e.preventDefault();
          this.isOpen ? close() : open();
        });
  
        this.prevBtn?.addEventListener("click", (e) => {
          e.stopPropagation();
          this.changeMonth(-1, "prev");
        });
  
        this.nextBtn?.addEventListener("click", (e) => {
          e.stopPropagation();
          this.changeMonth(1, "next");
        });
  
        this.gridWrap?.addEventListener(
          "touchstart",
          (e) => {
            this.touchStartX = e.changedTouches[0]?.clientX ?? 0;
            this.touchStartY = e.changedTouches[0]?.clientY ?? 0;
          },
          { passive: true }
        );
  
        this.gridWrap?.addEventListener(
          "touchend",
          (e) => {
            const dx = (e.changedTouches[0]?.clientX ?? 0) - this.touchStartX;
            const dy = (e.changedTouches[0]?.clientY ?? 0) - this.touchStartY;
            if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
            if (dx < 0) this.changeMonth(1, "next");
            else this.changeMonth(-1, "prev");
          },
          { passive: true }
        );
  
        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape" && this.isOpen) close();
        });
  
        this.outsideHandler = (e) => {
          if (!this.isOpen) return;
          if (this.row?.contains(e.target) || this.popup?.contains(e.target)) return;
          close();
        };
  
        this.repositionHandler = () => {
          if (this.isOpen) this.positionPopup();
        };
  
        window.addEventListener("resize", this.repositionHandler, { passive: true });
        window.addEventListener("scroll", this.repositionHandler, { passive: true, capture: true });
      }
  
      changeMonth(delta, animClass) {
        this.viewMonth += delta;
        if (this.viewMonth > 11) {
          this.viewMonth = 0;
          this.viewYear += 1;
        } else if (this.viewMonth < 0) {
          this.viewMonth = 11;
          this.viewYear -= 1;
        }
        this.renderMonth(animClass);
      }
  
      renderMonth(animClass) {
        if (!this.gridEl || !this.monthLabel) return;
  
        this.monthLabel.textContent = `${MONTHS[this.viewMonth]} ${this.viewYear}`;
  
        if (animClass) {
          this.gridEl.classList.remove("is-anim-next", "is-anim-prev");
          void this.gridEl.offsetWidth;
          this.gridEl.classList.add(animClass === "next" ? "is-anim-next" : "is-anim-prev");
        }
  
        this.gridEl.innerHTML = "";
        const first = new Date(this.viewYear, this.viewMonth, 1);
        const startPad = first.getDay();
        const daysInMonth = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();
  
        for (let i = 0; i < startPad; i++) {
          const empty = document.createElement("span");
          empty.className = "lux-cal__day lux-cal__day--empty";
          empty.setAttribute("aria-hidden", "true");
          this.gridEl.appendChild(empty);
        }
  
        for (let d = 1; d <= daysInMonth; d++) {
          const meta = this.getDayMeta(this.viewYear, this.viewMonth, d);
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = `lux-cal__day lux-cal__day--${meta.status}`;
          btn.dataset.date = meta.dateStr;
  
          const num = document.createElement("span");
          num.className = "lux-cal__day-num";
          num.textContent = String(d);
          btn.appendChild(num);
  
          if (meta.status === "available") {
            btn.addEventListener("click", (e) => {
              e.stopPropagation();
              this.selectDate(meta.dateStr, meta.price);
            });
          } else if (meta.status === "sold") {
            const sold = document.createElement("span");
            sold.className = "lux-cal__day-price";
            sold.textContent = "Sold";
            btn.appendChild(sold);
            btn.disabled = true;
          } else {
            btn.disabled = true;
          }
  
          if (meta.dateStr === this.selected && meta.status === "available") {
            btn.classList.add("lux-cal__day--selected");
          }
  
          this.gridEl.appendChild(btn);
        }
  
        if (this.isOpen) {
          requestAnimationFrame(() => this.positionPopup());
        }
      }
  
      selectDate(dateStr, price) {
        this.selected = dateStr;
        this.input.value = dateStr;
        this.input.dispatchEvent(new Event("input", { bubbles: true }));
        this.input.dispatchEvent(new Event("change", { bubbles: true }));
  
        this.trigger.textContent = formatDisplayDate(dateStr);
        this.trigger.classList.remove("is-placeholder");
  
        this.renderMonth();
        this.updateSelectionFooter(price);
        if (this.onSelect) this.onSelect(dateStr, price);
  
        window.setTimeout(() => this.close(), 280);
      }
  
      updateSelectionFooter(priceOverride) {
        if (!this.selectionTextEl) return;
  
        if (!this.selected) {
          this.selectionTextEl.innerHTML = "Pick a date to continue";
          this.selectionPriceEl.textContent = "";
          return;
        }
  
        const y = Number(this.selected.slice(0, 4));
        const m = Number(this.selected.slice(5, 7)) - 1;
        const d = Number(this.selected.slice(8, 10));
        const fullMeta = this.getDayMeta(y, m, d);
        const price = priceOverride ?? fullMeta.price;
  
        this.selectionTextEl.innerHTML = `<strong>${formatDisplayDate(this.selected)}</strong>`;
        this.selectionPriceEl.textContent =
          fullMeta.status === "available" ? this.formatPrice(price) : "";
      }
  
      syncFromInput() {
        if (!this.input.value) return;
        this.selected = this.input.value;
        this.trigger.textContent = formatDisplayDate(this.selected);
        this.trigger.classList.remove("is-placeholder");
        const d = parseDateString(this.selected);
        if (d) {
          this.viewYear = d.getFullYear();
          this.viewMonth = d.getMonth();
        }
        this.renderMonth();
        this.updateSelectionFooter();
      }
  
      open() {
        if (this.isOpen) return;
        if (this.onOpen) this.onOpen();
        this.isOpen = true;
  
        this.popup.classList.add("is-open");
        this.row?.classList.add("is-picker-open");
        this.trigger?.setAttribute("aria-expanded", "true");
        this.row?.querySelector("[data-tripon-picker-toggle]")?.setAttribute("aria-expanded", "true");
  
        document.body.classList.add("lux-cal-open");
  
        this.renderMonth();
        requestAnimationFrame(() => {
          this.positionPopup();
          requestAnimationFrame(() => this.positionPopup());
        });
  
        requestAnimationFrame(() => {
          document.addEventListener("pointerdown", this.outsideHandler, true);
        });
      }
  
      close() {
        if (!this.isOpen) return;
        this.isOpen = false;
        this.popup.classList.remove("is-open");
        this.row?.classList.remove("is-picker-open");
        this.trigger?.setAttribute("aria-expanded", "false");
        this.row?.querySelector("[data-tripon-picker-toggle]")?.setAttribute("aria-expanded", "false");
        document.body.classList.remove("lux-cal-open");
        document.removeEventListener("pointerdown", this.outsideHandler, true);
      }
  
      static attach(input, options) {
        if (!input || input.dataset.luxuryCalendar === "1") {
          return input?._luxuryCalendar || null;
        }
        input.dataset.luxuryCalendar = "1";
        const instance = new TriponLuxuryCalendar(input, options);
        input._luxuryCalendar = instance;
        return instance;
      }
    }
  
    g.TriponLuxuryCalendar = TriponLuxuryCalendar;

  /* ========== Luxury time picker ========== */
  const DEFAULT_SLOTS = [
      { value: "06:00", label: "06:00 AM", period: "Morning" },
      { value: "07:00", label: "07:00 AM", period: "Morning" },
      { value: "08:00", label: "08:00 AM", period: "Morning" },
      { value: "09:00", label: "09:00 AM", period: "Morning" },
      { value: "10:00", label: "10:00 AM", period: "Morning" },
      { value: "11:00", label: "11:00 AM", period: "Morning" },
      { value: "12:00", label: "12:00 PM", period: "Afternoon" },
      { value: "13:00", label: "01:00 PM", period: "Afternoon" },
      { value: "14:00", label: "02:00 PM", period: "Afternoon" },
      { value: "15:00", label: "03:00 PM", period: "Afternoon" },
      { value: "16:00", label: "04:00 PM", period: "Afternoon" },
      { value: "17:00", label: "05:00 PM", period: "Evening" },
      { value: "18:00", label: "06:00 PM", period: "Evening" },
      { value: "19:00", label: "07:00 PM", period: "Evening" },
    ];
  
    function formatDisplayTime(value24) {
      if (!value24) return "";
      const [hRaw, mRaw] = value24.split(":");
      let h = Number(hRaw);
      const m = mRaw || "00";
      if (!Number.isFinite(h)) return value24;
      const ampm = h >= 12 ? "PM" : "AM";
      h = h % 12;
      if (h === 0) h = 12;
      return `${String(h).padStart(2, "0")}:${m} ${ampm}`;
    }
  
    function hashSlot(value, dateStr) {
      const seed = `${dateStr || "default"}-${value}`;
      let sum = 0;
      for (let i = 0; i < seed.length; i++) {
        sum += seed.charCodeAt(i);
      }
      return sum % 11;
    }
  
    class TriponLuxuryTimePicker {
      constructor(input, options = {}) {
        this.input = input;
        this.options = options;
        this.row = input.closest(".input-box, .field");
        this.slots = options.slots || DEFAULT_SLOTS;
        this.selected = input.value || "";
        this.isOpen = false;
        this.packageName = options.packageName || "Your selected package";
        this.getDateInput = options.getDateInput || (() => null);
        this.getTotalText = options.getTotalText || (() => "");
        this.onSelect = typeof options.onSelect === "function" ? options.onSelect : null;
        this.onOpen = typeof options.onOpen === "function" ? options.onOpen : null;
        this._uid = `lux-time-${Math.random().toString(36).slice(2, 9)}`;
  
        this.buildUI();
        this.bindEvents();
        this.syncFromInput();
      }
  
      isSlotUnavailable(value) {
        const dateInput = this.getDateInput();
        const dateStr = dateInput?.value || "";
        const h = hashSlot(value, dateStr);
        return h === 0 || h === 5;
      }
  
      buildUI() {
        if (!this.row) return;
  
        this.row.classList.add("input-box--luxury-time");
        this.input.classList.add("luxury-time-native");
        this.input.setAttribute("tabindex", "-1");
        this.input.setAttribute("aria-hidden", "true");
  
        const fieldWrap = this.input.parentElement;
        if (!fieldWrap) return;
  
        this.trigger = document.createElement("button");
        this.trigger.type = "button";
        this.trigger.className = "luxury-time-trigger is-placeholder";
        this.trigger.setAttribute("aria-haspopup", "dialog");
        this.trigger.setAttribute("aria-expanded", "false");
        this.trigger.setAttribute("aria-controls", this._uid);
        this.trigger.textContent = "Select departure time";
        fieldWrap.insertBefore(this.trigger, this.input);
  
        this.popup = document.createElement("div");
        this.popup.className = "lux-time lux-time--floating";
        this.popup.id = this._uid;
        this.popup.setAttribute("role", "dialog");
        this.popup.setAttribute("aria-modal", "true");
        this.popup.setAttribute("aria-label", "Select departure time");
  
        this.popup.innerHTML = `
          <div class="lux-time__glow" aria-hidden="true"></div>
          <div class="lux-time__panel">
            <header class="lux-time__header">
              <div class="lux-time__header-icon" aria-hidden="true"><i class="fa-regular fa-clock"></i></div>
              <div>
                <h3 class="lux-time__title">Choose your time</h3>
                <p class="lux-time__subtitle">Premium departure slots</p>
              </div>
            </header>
            <div class="lux-time__slots" role="listbox" aria-label="Available time slots"></div>
            <footer class="lux-time__footer">
              <p class="lux-time__package-title"></p>
              <div class="lux-time__summary">
                <span class="lux-time__summary-trip"></span>
                <span class="lux-time__summary-total"></span>
              </div>
            </footer>
          </div>
        `;
  
        this.slotsRoot = this.popup.querySelector(".lux-time__slots");
        this.packageTitleEl = this.popup.querySelector(".lux-time__package-title");
        this.summaryTripEl = this.popup.querySelector(".lux-time__summary-trip");
        this.summaryTotalEl = this.popup.querySelector(".lux-time__summary-total");
        this.packageTitleEl.textContent = this.packageName;
  
        document.body.appendChild(this.popup);
        this.renderSlots();
        this.updateSummary();
      }
  
      renderSlots() {
        if (!this.slotsRoot) return;
        this.slotsRoot.innerHTML = "";
  
        let lastPeriod = "";
        this.slots.forEach((slot) => {
          if (slot.period !== lastPeriod) {
            lastPeriod = slot.period;
            const label = document.createElement("div");
            label.className = "lux-time__period";
            label.textContent = slot.period;
            this.slotsRoot.appendChild(label);
          }
  
          const unavailable = this.isSlotUnavailable(slot.value);
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "lux-time__slot";
          btn.setAttribute("role", "option");
          btn.dataset.value = slot.value;
          btn.innerHTML = `<span class="lux-time__slot-label">${slot.label}</span>`;
  
          if (unavailable) {
            btn.classList.add("lux-time__slot--unavailable");
            btn.disabled = true;
            btn.innerHTML += `<span class="lux-time__slot-badge">Full</span>`;
          } else if (slot.value === this.selected) {
            btn.classList.add("lux-time__slot--selected");
            btn.setAttribute("aria-selected", "true");
          }
  
          if (!unavailable) {
            btn.addEventListener("click", (e) => {
              e.stopPropagation();
              this.selectTime(slot.value, slot.label);
            });
          }
  
          this.slotsRoot.appendChild(btn);
        });
      }
  
      updateSummary() {
        const dateInput = this.getDateInput();
        const dateVal = dateInput?.value || "";
        let tripLine = "Select date & time for your trip";
  
        if (dateVal && this.selected) {
          const dateLabel = dateInput?._luxuryCalendar?.trigger?.textContent ||
            dateVal;
          tripLine = `${dateLabel} · ${formatDisplayTime(this.selected)}`;
        } else if (this.selected) {
          tripLine = formatDisplayTime(this.selected);
        } else if (dateVal) {
          tripLine = "Pick a departure time";
        }
  
        if (this.summaryTripEl) {
          this.summaryTripEl.textContent = tripLine;
        }
        if (this.summaryTotalEl) {
          const total = this.getTotalText();
          this.summaryTotalEl.textContent = total ? `Total ${total}` : "";
        }
      }
  
      positionPopup() {
        if (!this.popup || !this.row) return;
  
        const anchor = this.row.getBoundingClientRect();
        const gap = 10;
        const viewportPad = 12;
        const popupWidth = Math.min(380, window.innerWidth - viewportPad * 2);
  
        this.popup.style.width = `${popupWidth}px`;
  
        const popupH = this.popup.offsetHeight || 320;
        let top = anchor.bottom + gap;
        let left = anchor.left + anchor.width / 2 - popupWidth / 2;
  
        if (top + popupH > window.innerHeight - viewportPad) {
          const above = anchor.top - gap - popupH;
          if (above >= viewportPad) {
            top = above;
          }
        }
  
        left = Math.max(viewportPad, Math.min(left, window.innerWidth - popupWidth - viewportPad));
  
        this.popup.style.top = `${Math.round(top)}px`;
        this.popup.style.left = `${Math.round(left)}px`;
      }
  
      bindEvents() {
        const toggleBtn = this.row?.querySelector("[data-tripon-picker-toggle]");
        const close = () => this.close();
        const open = () => this.open();
  
        this.trigger?.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.isOpen ? close() : open();
        });
  
        toggleBtn?.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.isOpen ? close() : open();
        });
  
        this.row?.addEventListener("click", (e) => {
          if (
            e.target.closest(
              "[data-tripon-picker-toggle], .lux-time, .lux-time__slot, .luxury-time-trigger"
            )
          ) {
            return;
          }
          e.preventDefault();
          this.isOpen ? close() : open();
        });
  
        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape" && this.isOpen) close();
        });
  
        this.outsideHandler = (e) => {
          if (!this.isOpen) return;
          if (this.row?.contains(e.target) || this.popup?.contains(e.target)) return;
          close();
        };
  
        this.repositionHandler = () => {
          if (this.isOpen) this.positionPopup();
        };
  
        window.addEventListener("resize", this.repositionHandler, { passive: true });
        window.addEventListener("scroll", this.repositionHandler, { passive: true, capture: true });
  
        const dateInput = this.getDateInput();
        dateInput?.addEventListener("change", () => {
          this.renderSlots();
          this.updateSummary();
        });
      }
  
      selectTime(value24, label) {
        this.selected = value24;
        this.input.value = value24;
        this.input.dispatchEvent(new Event("input", { bubbles: true }));
        this.input.dispatchEvent(new Event("change", { bubbles: true }));
  
        this.trigger.textContent = label || formatDisplayTime(value24);
        this.trigger.classList.remove("is-placeholder");
  
        this.renderSlots();
        this.updateSummary();
        if (this.onSelect) this.onSelect(value24);
  
        window.setTimeout(() => this.close(), 220);
      }
  
      syncFromInput() {
        if (!this.input.value) return;
        this.selected = this.input.value;
        const match = this.slots.find((s) => s.value === this.selected);
        this.trigger.textContent = match?.label || formatDisplayTime(this.selected);
        this.trigger.classList.remove("is-placeholder");
        this.renderSlots();
        this.updateSummary();
      }
  
      open() {
        if (this.isOpen) return;
        if (this.onOpen) this.onOpen();
  
        this.isOpen = true;
        this.popup.classList.add("is-open");
        this.row?.classList.add("is-picker-open");
        this.trigger?.setAttribute("aria-expanded", "true");
        this.row?.querySelector("[data-tripon-picker-toggle]")?.setAttribute("aria-expanded", "true");
  
        this.renderSlots();
        this.updateSummary();
  
        requestAnimationFrame(() => {
          this.positionPopup();
          requestAnimationFrame(() => this.positionPopup());
        });
  
        requestAnimationFrame(() => {
          document.addEventListener("pointerdown", this.outsideHandler, true);
        });
      }
  
      close() {
        if (!this.isOpen) return;
        this.isOpen = false;
        this.popup.classList.remove("is-open");
        this.row?.classList.remove("is-picker-open");
        this.trigger?.setAttribute("aria-expanded", "false");
        this.row?.querySelector("[data-tripon-picker-toggle]")?.setAttribute("aria-expanded", "false");
        document.removeEventListener("pointerdown", this.outsideHandler, true);
      }
  
      static attach(input, options) {
        if (!input || input.dataset.luxuryTimePicker === "1") {
          return input?._luxuryTimePicker || null;
        }
        input.dataset.luxuryTimePicker = "1";
        const instance = new TriponLuxuryTimePicker(input, options);
        input._luxuryTimePicker = instance;
        return instance;
      }
    }
  
    g.TriponLuxuryTimePicker = TriponLuxuryTimePicker;
    g.TriponLuxuryTimePicker.formatDisplayTime = formatDisplayTime;

  /* ========== Luxury guests picker (hero booking bar + shared) ========== */
  function buildGuestSlots(min, max) {
    const slots = [];
    for (let n = min; n <= max; n += 1) {
      slots.push({
        value: String(n),
        label: n === 1 ? "1 Guest" : `${n} Guests`,
      });
    }
    return slots;
  }

  class TriponLuxuryGuestsPicker {
    constructor(input, options = {}) {
      this.input = input;
      this.options = options;
      this.row = input.closest(".input-box, .field");
      this.min = Number(options.min) || 1;
      this.max = Number(options.max) || 20;
      this.slots = buildGuestSlots(this.min, this.max);
      this.selected = input.value || "";
      this.isOpen = false;
      this.placeholder = options.placeholder || "No. of Guests";
      this.onSelect = typeof options.onSelect === "function" ? options.onSelect : null;
      this._uid = `lux-guests-${Math.random().toString(36).slice(2, 9)}`;

      this.buildUI();
      this.bindEvents();
      this.syncFromInput();
    }

    buildUI() {
      if (!this.row) return;

      this.row.classList.add("input-box--luxury-guests");
      this.input.classList.add("luxury-guests-native");
      this.input.setAttribute("tabindex", "-1");
      this.input.setAttribute("aria-hidden", "true");

      const fieldWrap = this.input.parentElement;
      if (!fieldWrap) return;

      this.trigger = document.createElement("button");
      this.trigger.type = "button";
      this.trigger.className = "luxury-guests-trigger is-placeholder";
      this.trigger.setAttribute("aria-haspopup", "dialog");
      this.trigger.setAttribute("aria-expanded", "false");
      this.trigger.setAttribute("aria-controls", this._uid);
      this.trigger.textContent = this.placeholder;
      fieldWrap.insertBefore(this.trigger, this.input);

      this.popup = document.createElement("div");
      this.popup.className = "lux-time lux-time--floating lux-guests--floating";
      this.popup.id = this._uid;
      this.popup.setAttribute("role", "dialog");
      this.popup.setAttribute("aria-modal", "true");
      this.popup.setAttribute("aria-label", "Select number of guests");

      this.popup.innerHTML = `
        <div class="lux-time__panel">
          <header class="lux-time__header">
            <div class="lux-time__header-icon" aria-hidden="true"><i class="fa-solid fa-users"></i></div>
            <div>
              <h3 class="lux-time__title">How many travelers?</h3>
              <p class="lux-time__subtitle">Select total guests for your trip</p>
            </div>
          </header>
          <div class="lux-time__slots lux-guests__slots" role="listbox" aria-label="Number of guests"></div>
        </div>
      `;

      this.slotsRoot = this.popup.querySelector(".lux-guests__slots");
      document.body.appendChild(this.popup);
      this.renderSlots();
    }

    renderSlots() {
      if (!this.slotsRoot) return;
      this.slotsRoot.innerHTML = "";

      this.slots.forEach((slot) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "lux-time__slot";
        btn.setAttribute("role", "option");
        btn.dataset.value = slot.value;
        btn.innerHTML = `<span class="lux-time__slot-label">${slot.label}</span>`;

        if (slot.value === this.selected) {
          btn.classList.add("lux-time__slot--selected");
          btn.setAttribute("aria-selected", "true");
        }

        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.selectGuests(slot.value, slot.label);
        });

        this.slotsRoot.appendChild(btn);
      });
    }

    positionPopup() {
      if (!this.popup || !this.row) return;

      const anchor = this.row.getBoundingClientRect();
      const gap = 10;
      const viewportPad = 12;
      const popupWidth = Math.min(380, window.innerWidth - viewportPad * 2);

      this.popup.style.width = `${popupWidth}px`;

      const popupH = this.popup.offsetHeight || 280;
      let top = anchor.bottom + gap;
      let left = anchor.left + anchor.width / 2 - popupWidth / 2;

      if (top + popupH > window.innerHeight - viewportPad) {
        const above = anchor.top - gap - popupH;
        if (above >= viewportPad) {
          top = above;
        }
      }

      left = Math.max(viewportPad, Math.min(left, window.innerWidth - popupWidth - viewportPad));

      this.popup.style.top = `${Math.round(top)}px`;
      this.popup.style.left = `${Math.round(left)}px`;
    }

    bindEvents() {
      const open = () => this.open();
      const close = () => this.close();

      this.trigger?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.isOpen ? close() : open();
      });

      this.row?.addEventListener("click", (e) => {
        if (e.target.closest(".lux-time, .luxury-guests-trigger, .lux-time__slot")) {
          return;
        }
        e.preventDefault();
        this.isOpen ? close() : open();
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.isOpen) close();
      });

      this.outsideHandler = (e) => {
        if (!this.isOpen) return;
        if (this.row?.contains(e.target) || this.popup?.contains(e.target)) return;
        close();
      };

      this.repositionHandler = () => {
        if (this.isOpen) this.positionPopup();
      };

      window.addEventListener("resize", this.repositionHandler, { passive: true });
      window.addEventListener("scroll", this.repositionHandler, { passive: true, capture: true });
    }

    selectGuests(value, label) {
      this.selected = value;
      this.input.value = value;
      this.input.dispatchEvent(new Event("input", { bubbles: true }));
      this.input.dispatchEvent(new Event("change", { bubbles: true }));

      this.trigger.textContent = label;
      this.trigger.classList.remove("is-placeholder");

      this.renderSlots();
      if (this.onSelect) this.onSelect(value);
      window.setTimeout(() => this.close(), 220);
    }

    syncFromInput() {
      if (!this.input.value) return;
      this.selected = this.input.value;
      const match = this.slots.find((s) => s.value === this.selected);
      if (match) {
        this.trigger.textContent = match.label;
        this.trigger.classList.remove("is-placeholder");
      }
      this.renderSlots();
    }

    open() {
      if (this.isOpen) return;
      this.isOpen = true;
      this.popup.classList.add("is-open");
      this.row?.classList.add("is-picker-open");
      this.trigger?.setAttribute("aria-expanded", "true");
      this.renderSlots();

      requestAnimationFrame(() => {
        this.positionPopup();
        requestAnimationFrame(() => this.positionPopup());
      });

      requestAnimationFrame(() => {
        document.addEventListener("pointerdown", this.outsideHandler, true);
      });
    }

    close() {
      if (!this.isOpen) return;
      this.isOpen = false;
      this.popup.classList.remove("is-open");
      this.row?.classList.remove("is-picker-open");
      this.trigger?.setAttribute("aria-expanded", "false");
      document.removeEventListener("pointerdown", this.outsideHandler, true);
    }

    static attach(input, options) {
      if (!input || input.dataset.luxuryGuestsPicker === "1") {
        return input?._luxuryGuestsPicker || null;
      }
      input.dataset.luxuryGuestsPicker = "1";
      const instance = new TriponLuxuryGuestsPicker(input, options);
      input._luxuryGuestsPicker = instance;
      return instance;
    }
  }

  g.TriponLuxuryGuestsPicker = TriponLuxuryGuestsPicker;

  if (!document.body?.classList.contains("package-details-page")) {
    return;
  }

  /* ========== Luxury tickets UI ========== */
  const TICKET_META = [
      { key: "adult", icon: "fa-user", label: "Adult (18+ yrs)" },
      { key: "youth", icon: "fa-user-group", label: "Youth (13–17 yrs)" },
      { key: "child", icon: "fa-child", label: "Children (0–12 yrs)" },
    ];
  
    function enhanceTicketRow(row, index) {
      const meta = TICKET_META[index] || TICKET_META[0];
      row.classList.add("ticket-row--lux");
  
      row.querySelectorAll(".ticket-price").forEach((el) => el.remove());
  
      const info = row.querySelector(".ticket-info");
      if (info && !info.querySelector(".ticket-row__icon")) {
        const icon = document.createElement("span");
        icon.className = "ticket-row__icon";
        icon.setAttribute("aria-hidden", "true");
        icon.innerHTML = `<i class="fa-solid ${meta.icon}"></i>`;
        info.insertBefore(icon, info.firstChild);
      }
  
      const label = row.querySelector(".ticket-label");
      if (label) {
        label.textContent = meta.label;
      }
  
      const counter = row.querySelector(".ticket-counter");
      const minus = row.querySelector(".minus");
      const plus = row.querySelector(".plus");
      const count = row.querySelector(".count");
  
      if (minus) {
        minus.classList.add("ticket-btn", "ticket-btn--minus");
        minus.setAttribute("aria-label", `Decrease ${meta.label}`);
        minus.innerHTML = '<i class="fa-solid fa-minus" aria-hidden="true"></i>';
      }
      if (plus) {
        plus.classList.add("ticket-btn", "ticket-btn--plus");
        plus.setAttribute("aria-label", `Increase ${meta.label}`);
        plus.innerHTML = '<i class="fa-solid fa-plus" aria-hidden="true"></i>';
      }
      if (count) {
        count.classList.add("ticket-count");
        count.setAttribute("aria-live", "polite");
        count.dataset.ticketIndex = String(index);
      }
      if (counter) {
        counter.classList.add("ticket-counter--lux");
      }
    }
  
    function buildSummaryPanel(bookingCard, existingTotal) {
      const summary = document.createElement("section");
      summary.className = "booking-summary-lux";
      summary.setAttribute("aria-label", "Booking summary");
  
      summary.innerHTML = `
        <header class="booking-summary-lux__head">
          <h3 class="booking-summary-lux__title">Booking summary</h3>
          <p class="booking-summary-lux__hint">
            Final pricing updates dynamically based on selected travel date and package.
          </p>
        </header>
        <ul class="booking-summary-lux__meta">
          <li class="booking-summary-lux__row">
            <span class="booking-summary-lux__label"><i class="fa-regular fa-calendar"></i> Date</span>
            <strong class="booking-summary-lux__value" data-summary-date>Not selected</strong>
          </li>
          <li class="booking-summary-lux__row">
            <span class="booking-summary-lux__label"><i class="fa-regular fa-clock"></i> Time</span>
            <strong class="booking-summary-lux__value" data-summary-time>Not selected</strong>
          </li>
          <li class="booking-summary-lux__row">
            <span class="booking-summary-lux__label"><i class="fa-solid fa-users"></i> Travelers</span>
            <strong class="booking-summary-lux__value" data-summary-travelers>0 travelers</strong>
          </li>
        </ul>
      `;
  
      if (existingTotal) {
        existingTotal.classList.add("booking-summary-lux__total");
        const totalLabel = existingTotal.querySelector("span:first-child");
        if (totalLabel) {
          totalLabel.textContent = "Total";
        }
        const priceEl = existingTotal.querySelector("#totalPrice");
        if (priceEl) {
          priceEl.classList.add("booking-summary-lux__price");
        }
        summary.appendChild(existingTotal);
      }
  
      return summary;
    }
  
    function triponEnhanceLuxuryTickets(bookingCardRoot) {
      if (!bookingCardRoot || bookingCardRoot.dataset.luxuryTickets === "1") {
        return;
      }
  
      const sectionTitle = Array.from(bookingCardRoot.querySelectorAll(".section-title")).find(
        (el) => /ticket/i.test(el.textContent || "")
      );
      const ticketRows = bookingCardRoot.querySelectorAll(".ticket-row");
      if (!ticketRows.length) {
        return;
      }
  
      bookingCardRoot.dataset.luxuryTickets = "1";
      bookingCardRoot.classList.add("booking-card--lux-tickets");
  
      const ticketsWrap = document.createElement("section");
      ticketsWrap.className = "booking-tickets-lux";
      ticketsWrap.setAttribute("aria-labelledby", "bookingTicketsLuxHeading");
  
      const ticketsHead = document.createElement("header");
      ticketsHead.className = "booking-tickets-lux__head";
      ticketsHead.innerHTML = `
        <h3 class="booking-tickets-lux__title" id="bookingTicketsLuxHeading">Travelers</h3>
        <p class="booking-tickets-lux__subtitle">Select how many guests are joining this experience</p>
      `;
  
      const ticketsList = document.createElement("div");
      ticketsList.className = "booking-tickets-lux__list";
  
      ticketRows.forEach((row, index) => {
        enhanceTicketRow(row, index);
        ticketsList.appendChild(row);
      });
  
      ticketsWrap.appendChild(ticketsHead);
      ticketsWrap.appendChild(ticketsList);
  
      const extras = bookingCardRoot.querySelector(".booking-extras");
      const oldTotal = bookingCardRoot.querySelector(".total");
      const insertBefore = extras || oldTotal || bookingCardRoot.querySelector(".book-btn");
  
      if (sectionTitle) {
        sectionTitle.remove();
      }
  
      bookingCardRoot.insertBefore(ticketsWrap, insertBefore);
  
      if (oldTotal) {
        const summary = buildSummaryPanel(bookingCardRoot, oldTotal);
        const bookBtn = bookingCardRoot.querySelector(".book-btn");
        if (bookBtn) {
          bookingCardRoot.insertBefore(summary, bookBtn);
        } else {
          bookingCardRoot.appendChild(summary);
        }
      }
    }
  
    function pulseCount(el) {
      if (!el) return;
      el.classList.remove("ticket-count--pulse");
      void el.offsetWidth;
      el.classList.add("ticket-count--pulse");
      window.setTimeout(() => el.classList.remove("ticket-count--pulse"), 420);
    }
  
    g.triponEnhanceLuxuryTickets = triponEnhanceLuxuryTickets;
    g.triponPulseTicketCount = pulseCount;


  /* ========== Package page: itinerary, context, related cards ========== */
  // --------- Package itinerary (duration, destination, places, activities) ---------
  function escapeHtmlItinerary(raw) {
    return String(raw)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function cleanSnippet(raw, maxLen = 160) {
    let s = String(raw || "")
      .replace(/^[\s.•●○◦\-–—]+/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (s.length > maxLen) s = `${s.slice(0, maxLen - 1).trim()}…`;
    return s;
  }

  /**
   * Turn package card / data-attribute image paths into a URL that works from
   * packages/package-details.html (where "images/..." would wrongly resolve
   * under a wrong images/... path).
   */
  function triponResolvePackageImageSrc(src) {
    const raw = String(src || "").trim();
    if (!raw) return "";
    if (raw.startsWith("data:")) return raw;
    if (/^(https?:)?\/\//i.test(raw)) return raw;
    if (raw.startsWith("/")) {
      try {
        return new URL(raw, window.location.origin || window.location.href).href;
      } catch (_e) {
        return raw;
      }
    }
    let path = raw.replace(/\\/g, "/");
    if (path.startsWith("./")) path = path.slice(2);
    while (path.startsWith("../")) path = path.slice(3);
    if (path.startsWith("images/")) {
      path = "/assets/images/" + path.slice("images/".length);
    } else if (path.startsWith("assets/images/")) {
      path = "/" + path;
    } else {
      try {
        return new URL(raw, document.baseURI || window.location.href).href;
      } catch (_e) {
        return raw;
      }
    }
    try {
      const origin = window.location.origin;
      if (origin && origin !== "null") {
        return new URL(path, origin).href;
      }
    } catch (_e) {
      /* fall through */
    }
    const loc = (window.location.pathname || "").replace(/\\/g, "/");
    const tail = path.startsWith("/") ? path.slice(1) : path;
    try {
      if (/\/packages\/[^/]+\/[^/]+\.html?$/i.test(loc) || loc.includes("/packages/package-details")) {
        return new URL(`../../${tail}`, window.location.href).href;
      }
      if (loc.includes("/packages/package-details")) {
        return new URL(`../${tail}`, window.location.href).href;
      }
      return new URL(tail, window.location.href).href;
    } catch (_e2) {
      return path;
    }
  }

  function pickFirstText(...values) {
    for (const v of values) {
      if (v == null) continue;
      const s = String(v).trim();
      if (s) return s;
    }
    return "";
  }

  function clampItineraryDays(n) {
    if (!Number.isFinite(n) || n < 1) return 3;
    return Math.min(Math.floor(n), 21);
  }

  function parseDurationDays(text) {
    const t = pickFirstText(text);
    if (!t) return 3;
    if (/half\s*-\s*day|half\s*day/i.test(t)) return 1;
    const daysMatch = t.match(/(\d+)\s*days?/i);
    if (daysMatch) return clampItineraryDays(Number(daysMatch[1]));
    const nums = t.match(/\d+/g)?.map(Number) || [];
    if (!nums.length) return 3;
    if (/night/i.test(t)) return clampItineraryDays(Math.max(...nums));
    return clampItineraryDays(Math.max(...nums));
  }

  function parseCommaListParam(value) {
    if (value == null || !String(value).trim()) return [];
    return String(value)
      .split("|")
      .flatMap((part) => part.split(","))
      .map((s) => cleanSnippet(s, 120))
      .filter(Boolean);
  }

  function readInitialPackagePageContext() {
    const durationItem = Array.from(document.querySelectorAll(".info-row .info-item")).find((el) =>
      /\bduration\b/i.test(el.querySelector(".info-label")?.textContent || "")
    );
    const daysText = durationItem?.querySelector(".info-value")?.textContent?.trim() || "";
    const fullLocation =
      document.querySelector(".top-bar .left-section .location span")?.textContent?.trim() || "";
    const title = document.querySelector(".title-section h1")?.textContent?.trim() || "";

    let highlightsUl = null;
    const left = document.querySelector(".content .left") || document.querySelector(".left");
    if (left) {
      const h3Highlight = Array.from(left.querySelectorAll("h3")).find((node) =>
        /highlight/i.test(node.textContent)
      );
      const nextEl = h3Highlight?.nextElementSibling;
      if (nextEl?.tagName === "UL") highlightsUl = nextEl;
    }

    const highlights = highlightsUl
      ? Array.from(highlightsUl.querySelectorAll("li")).map((li) => cleanSnippet(li.textContent)).filter(Boolean)
      : [];

    const includedRoot = document.querySelector(".accordion .accordion-item:first-of-type .accordion-content ul");
    const included = includedRoot
      ? Array.from(includedRoot.querySelectorAll("li")).map((li) => cleanSnippet(li.textContent)).filter(Boolean)
      : [];

    const destination = fullLocation.split(",")[0].trim() || "your destination";

    return { daysText, fullLocation, destination, title, highlights, included };
  }

  function simpleHashItinerary(str) {
    let h = 0;
    const s = String(str);
    for (let i = 0; i < s.length; i += 1) {
      h = (h << 5) - h + s.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  function uniqPreserveStrings(items) {
    const seen = new Set();
    const out = [];
    for (const item of items) {
      const t = cleanSnippet(item, 200);
      if (!t) continue;
      const key = t.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(t);
    }
    return out;
  }

  function includedToFriendlyBullet(line) {
    const t = line.toLowerCase();
    if (/pickup|drop|transfer|shuttle/i.test(t))
      return "Coordinated transfers so you can relax between stops.";
    if (/lunch|breakfast|meal|buffet|dining/i.test(t))
      return "Meals lined up exactly as promised in your inclusions.";
    if (/snorkel|gear|equipment/i.test(t))
      return "Gear and on-site guidance for water-based moments.";
    if (/boat|speedboat|cruise|ferry/i.test(t))
      return "Scenic crossings by boat woven into the day’s rhythm.";
    return `Included perk: ${line}`;
  }

  function typeFlavorPhrase(packageType) {
    const n = (packageType || "").toLowerCase();
    if (n === "couple") return "romantic pacing with quiet viewpoints";
    if (n === "family") return "kid-friendly pacing with breathing room";
    if (n === "friends") return "social, high-energy highlights";
    return "comfortable pacing and time to wander";
  }

  function triponParseCatalogList(value) {
    if (Array.isArray(value)) {
      return value.map((item) => cleanSnippet(item, 200)).filter(Boolean);
    }
    return parseCommaListParam(value);
  }

  function buildPackageOverviewCopy(meta) {
    const title = meta.title || "This package";
    const destination = meta.destination || "Bali";
    const dayNumber = String(meta.daysText || "").match(/\d+/)?.[0] || "5";
    const flavor = typeFlavorPhrase(meta.packageType);
    const places = triponParseCatalogList(meta.places);
    const activities = triponParseCatalogList(meta.activities);

    if (meta.overview) {
      return cleanSnippet(meta.overview, 1200);
    }

    let text = `${title} is crafted for ${flavor} across ${destination} over ${dayNumber} days.`;
    if (places.length) {
      text += ` The route covers ${places.slice(0, 3).join(", ")}`;
      if (places.length > 3) text += ", and more";
      text += ".";
    }
    if (activities.length) {
      text += ` Expect ${activities.slice(0, 2).join(" and ").toLowerCase()}`;
      if (activities.length > 2) text += ", plus other curated experiences";
      text += ".";
    }
    text += " Transfers, pacing, and on-ground support are coordinated by Tripon so you can travel with ease.";
    return text;
  }

  function buildPackageHighlightsCopy(meta) {
    if (Array.isArray(meta.highlights) && meta.highlights.length) {
      return meta.highlights.map((item) => cleanSnippet(item, 200)).filter(Boolean).slice(0, 6);
    }
    if (typeof meta.highlights === "string" && meta.highlights.trim()) {
      return triponParseCatalogList(meta.highlights).slice(0, 6);
    }

    const destination = meta.destination || "Bali";
    const places = triponParseCatalogList(meta.places);
    const activities = triponParseCatalogList(meta.activities);
    const items = uniqPreserveStrings([
      ...activities.map((line) => cleanSnippet(line, 200)),
      ...places.map((place) => `Explore ${place}`),
      ...regionalAccentLines(destination).slice(0, 2),
    ]);
    const dayNumber = String(meta.daysText || "").match(/\d+/)?.[0] || "5";
    if (items.length < 5) {
      items.push(`${dayNumber}-day schedule with balanced activity and downtime`);
      items.push(`Local assistance and transfers throughout ${destination}`);
    }
    return items.slice(0, 6);
  }

  function triponApplyPackageOverviewAndHighlights(meta) {
    if (!meta || !document.body?.classList.contains("package-details-page")) return;

    const overviewNode = document.querySelector(".package-overview-cell p");
    const highlightsHeading = Array.from(
      document.querySelectorAll(".package-body-main h3, .left-main h3")
    ).find((node) => /highlight/i.test(node.textContent || ""));
    const highlightsList =
      highlightsHeading?.nextElementSibling?.tagName === "UL"
        ? highlightsHeading.nextElementSibling
        : document.querySelector(".package-body-main ul");

    const overviewText = buildPackageOverviewCopy(meta);
    if (overviewNode && overviewText) {
      overviewNode.textContent = overviewText;
    }

    const highlightItems = buildPackageHighlightsCopy(meta);
    if (highlightsList && highlightItems.length) {
      highlightsList.innerHTML = highlightItems
        .map((item) => `<li>${triponEscapeHtmlLite(item)}</li>`)
        .join("");
    }

    const includedItems = triponParseCatalogList(meta.included);
    const includedPanel = document.querySelector(
      ".accordion .accordion-item:first-of-type .accordion-content"
    );
    if (includedPanel && includedItems.length) {
      includedPanel.innerHTML = `<ul>${includedItems
        .map((item) => `<li>${triponEscapeHtmlLite(item)}</li>`)
        .join("")}</ul>`;
    }
  }

  function buildExperiencePool(ctx) {
    const attractions = uniqPreserveStrings(ctx.attractions || []);
    const activities = uniqPreserveStrings(ctx.activities || []);
    const fromHighlights = uniqPreserveStrings(ctx.highlightPool || []).map((x) => cleanSnippet(x, 200));
    const fromIncluded = (ctx.includedPool || []).map((x) => cleanSnippet(includedToFriendlyBullet(x), 200));

    return uniqPreserveStrings([...attractions, ...activities, ...fromHighlights, ...fromIncluded]);
  }

  /** Destination-tuned bullets (prepended — consumed before generic filler). */
  function regionalAccentLines(dest) {
    const d = dest.toLowerCase();
    const lines = [];

    const add = (arr) => {
      arr.forEach((x) => lines.push(x));
    };

    if (/uluwatu/i.test(d)) {
      add([
        `Pura Luhur Uluwatu clifftop walk — sash provided if needed.`,
        `Kecak fire-dance dusk timing with ocean backdrop.`,
        `Padang Padang or Suluban steps — tidal timing matters.`,
        `Single-fin reefs & respectful surf-lineup etiquette.`,
        `Jimbaran-style seafood grills if you drift north for dinner.`,
        `El Kabron–style sunset decks (venue rotation by season).`,
        `Bingin viewpoint photos without crowding narrow lanes.`,
      ]);
    } else if (/ubud/i.test(d)) {
      add([
        `Tegallalang or Ceking rice-terrace ridge stroll.`,
        `Sacred Monkey Forest pace — secure loose items.`,
        `Campuhan Ridge easy walk — morning cool preferred.`,
        `Ubud royal palace & Saraswati lotus ponds.`,
        `Art market haggling with smile-and-walk-away grace.`,
        `Traditional dance dusk shows near central Ubud.`,
      ]);
    } else if (/seminyak|petitenget/i.test(d)) {
      add([
        `Eat Street tasting trail from satay to modern bistros.`,
        `Petitenget temple dress code quick stop.`,
        `Double Six–style sundown lounger rotation.`,
        `Designer boutiques between Jl. Kayu Aya hops.`,
        `Late swim at patrolled Seminyak beach strips.`,
      ]);
    } else if (/canggu/i.test(d)) {
      add([
        `Berawa to Batu Bolong scooter loop with helmet discipline.`,
        `Volcanic-black sand lounges and mellow surf.`,
        `Café-flatwhite crawl through leafy side roads.`,
        `Echo Beach grills as lanterns light up.`,
        `Rice-pocket shortcuts between trending brunch spots.`,
      ]);
    } else if (/sanur/i.test(d)) {
      add([
        `Sanur sunrise boardwalk glide — mellow reef shelf.`,
        `Le Mayeur legacy museum within garden calm.`,
        `Mangrove kayak or kayak-glide window tides.`,
        `Boat doorway to Nusa islands from sunrise coast.`,
        `Vintage beachfront hotels with porch tea rhythm.`,
      ]);
    } else if (/nusa penida/i.test(d)) {
      add([
        `Kelingking viewpoint descent planning — hydrate first.`,
        `Angel’s Billabong tide-table respect — slippery rocks.`,
        `Broken Beach & natural arch panorama loop.`,
        `Crystal Bay snorkel pacing with fins and flotation.`,
        `Fast-boat docking grace — nimble luggage packing.`,
      ]);
    } else if (/gili/i.test(d)) {
      add([
        `Horse-cart–free shoreline segments — choose quieter arcs.`,
        `Circum-island pedal with tropical downpour dodge.`,
        `Turtle snorkel points with buoy line courtesy.`,
        `Swing-set photo etiquette — swift fair queues.`,
        `Lantern-lit beach BBQ options by night breeze.`,
      ]);
    }

    if (/bali/i.test(d) && !lines.length) {
      add([
        `Blessing-ready sarong & sash kit for sacred entries.`,
        `Canang walkway mindfulness — gentle step-around.`,
        `Warung platter sharing — spoon-right-hand courtesy cues.`,
        `Volcano silhouette backdrop from southern cliff roads.`,
        `Blessing-water optional participation at family temples.`,
        `Island-hop boat spray prep — lite dry layers.`,
      ]);
    }

    return uniqPreserveStrings(lines);
  }

  /** Long list of filler lines — each used at most once across the trip. */
  function buildUniqueFallbackBulletBank(dest, packageType) {
    const flavor = typeFlavorPhrase(packageType);
    const coreBank = [
      `Sunrise stroll while ${dest} is still quiet.`,
      `Mid-morning swim or pool dip before peak heat.`,
      `Coastal viewpoints with plenty of pause for photos.`,
      `Coffee stop at a local roastery or breezy terrace.`,
      `Afternoon shaded walk through side streets.`,
      `Sunset vantage — watch the glow roll over ${dest}.`,
      `Evening meal focused on regional flavours.`,
      `Half-day beach time with towels and a good book.`,
      `Short heritage loop: architecture, stories, and photo breaks.`,
      `Market browse for snacks, fruit, and small gifts.`,
      `Artisan quarter — pottery, woodwork, or weaving demos.`,
      `Active block: light hike, bike path, or water sport taster.`,
      `Spa or massage window to reset after travel days.`,
      `Cliff-top or hill trail with wide-open views.`,
      `Hidden cove or calmer beach away from the main strip.`,
      `Seafood lunch by the water when timing allows.`,
      `Temple or shrine visit with respectful dress and calm pacing.`,
      `Rice-field edge drive with green panoramas.`,
      `Village stop for home-style cooking or tea.`,
      `Rooftop or deck drinks as the heat softens.`,
      `Snorkel, paddle, or reef swim if conditions look good.`,
      `Boat hop or short crossing to a nearby islet.`,
      `Surf check, lesson, or shore break watch — your pick.`,
      `Cooking class or tasting menu as a hands-on memory.`,
      `Yoga, stretch, or meditation block to keep things ${flavor}.`,
      `Boutique crawl for clothes, jewellery, or design pieces.`,
      `Night market energy: lights, music, and street bites.`,
      `Photography route mapped to golden-hour light.`,
      `Family-friendly pool games or shallow-water play.`,
      `Short nap or downtime — pacing stays ${flavor}.`,
      `Scenic ridge road with viewpoints every few kilometres.`,
      `Harbour walk watching boats come and go.`,
      `Coffee plantation or farm tour if available nearby.`,
      `Waterfall or freshwater dip on a hotter afternoon.`,
      `Canoe, kayak, or calm lagoon paddle.`,
      `Dance, music, or cultural show one evening.`,
      `Craft workshop: batik, mask painting, or similar.`,
      `Picnic assembly from bakery + deli staples.`,
      `Lighthouse or landmark selfie stop en route.`,
      `Underwater viewpoint: glass boat or submarine-style ride where offered.`,
      `Golf tee time, ATV line, or zipline bolt-on (optional add-on).`,
      `Reading hour at a hammock café.`,
      `Local rum, arak, or craft spirit tasting sampler.`,
      `Street-food crawl with guidance on what is mild vs spicy.`,
      `Botanical stroll — orchids, spices, or tropical trees.`,
      `Evening barefoot walk along the shoreline.`,
      `Kids’ ice-cream pause after sightseeing.`,
      `Courier bag drop: laundry pickup so bags stay light.`,
      `Morning drone-style viewpoint without the drone — high decks only.`,
      `Lagoon boardwalk birdwatching.`,
      `Historic fort, gate, or old town stone lanes.`,
      `Chocolate or coffee pairing board.`,
      `Volunteer-lite beach clean or reef-care talk if scheduled.`,
      `Silent hour: phones away, tide sounds only.`,
      `Moonrise swim only when tides and local guidance allow.`,
      `Shaded boardwalk stroll away from midday glare.`,
      `Shell collecting at low tide with gentle footprints.`,
      `Inland breezes — short drive to greener ridges near ${dest}.`,
      `Tropical fruit plate pause at a quiet terrace.`,
      `Sketch or journal hour beneath a pergola.`,
      `Family sandcastle stretch on a wide shoreline.`,
      `Watch wind-surf or kite lines from the promenade.`,
      `Reapply reef-safe SPF before peak UV blocks.`,
      `Rinse sandy feet before returning indoors.`,
      `Post office or stamp corner for handwritten notes.`,
      `Ferry observation deck breeze between islands.`,
      `Rainy-window alternative — gallery, café, or craft mall.`,
      `Laundry turnaround so suitcases breathe easier.`,
      `Small bills ready for kiosk snacks and iced drinks.`,
      `Power-bank café pit stop during long outings.`,
      `Light stretch circuit after uneven paths or stairs.`,
      `Welcome drink ritual where properties offer one.`,
      `Fresh coconut roadside stop — hydrate before heat.`,
      `Balanced brunch before a heavier sightseeing push.`,
      `Ask your guide where spice levels sit on your comfort scale.`,
      `Rainbow-lit sky chase after passing showers.`,
      `Dry sack for electronics when boats splash.`,
      `Sun hat refill at a kiosk if you travelled light.`,
      `One-more-sunset pigment memory before dinner.`,
      `Low-tidal shelf walk with mindful footing.`,
      `High-tide watch from railing or upper deck.`,
      `Calm float session with noodle or buoy support.`,
      `Beach volleyball as spectator—or join politely if invited.`,
      `Cliff etiquette: keep setbacks and respect closures.`,
      `Wildlife etiquette: distance, silence, no flash.`,
      `Coral etiquette: careful fins, buoyancy, buoy lines.`,
      `Boat etiquette: barefoot zones, seated boarding.`,
      `Life jacket sizing check before aquatic legs.`,
      `Spare dry layer sealed for splashes or drizzle.`,
      `Mosquito-dusk precaution if humidity climbs.`,
      `Quick cleanse after buzzing market tastings.`,
      `Lip balm with SPF alongside facial sunscreen.`,
      `Cooling balm hour after reef salt or sunny walks.`,
      `Quiet hotel night rhythm — blackout + soft fan hum.`,
      `Hydration checkpoints every few hours.`,
      `Curate a short “keepers” gallery before you fly.`,
    ];

    return uniqPreserveStrings([
      ...regionalAccentLines(dest),
      ...purposefulPlanningLines(dest, packageType),
      ...coreBank,
    ]);
  }

  function titleKeyLine(line) {
    return String(line || "")
      .replace(/^Day\s*\d+\s*·\s*/i, "")
      .trim()
      .toLowerCase();
  }

  const MIDDLE_TITLE_COASTAL = [
    (dest) => `Coastal cliffs & golden hour — ${dest}`,
    (dest) => `Beach rhythm & long lunch — ${dest}`,
    (dest) => `Reef, paddle, or water play — ${dest}`,
    (dest) => `Harbour routes & bayside dining — ${dest}`,
    (dest) => `Hidden shores & quieter coves — ${dest}`,
    (dest) => `Island-hop timing & reef windows — ${dest}`,
    (dest) => `Sunset perch & sea breeze — ${dest}`,
    (dest) => `Boat timetable & lagoon hops — ${dest}`,
    (dest) => `Fishing harbour & grill-to-table eve — ${dest}`,
  ];

  const MIDDLE_TITLE_INTRACOAST_MERGED = [
    (dest) => `Temples & tradition — ${dest}`,
    (dest) => `Markets, bites & artisan lanes — ${dest}`,
    (dest) => `Viewpoints & scenic drives — ${dest}`,
    (dest) => `Nature trails & green pockets — ${dest}`,
    (dest) => `Spa, stretch & slow reset — ${dest}`,
    (dest) => `Design shops & café hopping — ${dest}`,
    (dest) => `Heritage walk & neighbourhood stories — ${dest}`,
    (dest) => `Rice terraces & countryside loop — ${dest}`,
    (dest) => `Cooking aromas & tasting tables — ${dest}`,
    (dest) => `River gorge or canyon viewpoint — ${dest}`,
    (dest) => `Family picnics & shaded breaks — ${dest}`,
    (dest) => `Photo route & postcard frames — ${dest}`,
    (dest) => `Wellness soak & herbal tea pause — ${dest}`,
    (dest) => `Vintage quarter & nostalgic corners — ${dest}`,
    (dest) => `Active outing & outdoor stretch — ${dest}`,
    (dest) => `Night markets & lanterns — ${dest}`,
  ];

  const MIDDLE_TITLE_CITY_MAJOR = [
    (dest) => `Museums, galleries & grand avenues — ${dest}`,
    (dest) => `Royal quarters & ceremonial façades — ${dest}`,
    (dest) => `Historic core & skyline viewpoints — ${dest}`,
    (dest) => `Riverfront walks & landmark bridges — ${dest}`,
    (dest) => `Food halls, markets & supper clubs — ${dest}`,
    (dest) => `Theatre district or live show evening — ${dest}`,
    (dest) => `Parklands, palaces & garden calm — ${dest}`,
    (dest) => `Neighbourhood hop: boutiques & bakeries — ${dest}`,
    (dest) => `Cabinet-of-curiosities museum pace — ${dest}`,
    (dest) => `Street-art alleys & design quarters — ${dest}`,
    (dest) => `Cathedral climbs & skyline rewards — ${dest}`,
    (dest) => `Literary plaques & scholarly corners — ${dest}`,
    (dest) => `Pub heritage & craft taprooms — ${dest}`,
    (dest) => `Sunrise jog or quiet riverfront miles — ${dest}`,
    (dest) => `Iconic ticketing day — queues planned early — ${dest}`,
    (dest) => `Vintage markets & antiques crawl — ${dest}`,
  ];

  /** Pick title decks so inland/city trips avoid “harbour/beach/island” phrasing unless the place fits. */
  function middleDayTitleBuildersForDestination(dest, pkgTitle) {
    const dl = `${dest} ${pkgTitle}`.toLowerCase();
    const coastalHints =
      /\b(island|atoll|lagoon|coral|reef|surf|beach|bali|phuket|krabi|phi|phi phi|maldives|mauritius|seychelles|gili| lombok|sicily|crete|coast|cape\s+town|mykonos|santorini|gold\s+coast|bondi|honolulu|cancun)\b/;
    const cityHints =
      /\b(london|paris|rome|tokyo|new\s+york|nyc|dubai|berlin|barcelona|madrid|vienna|istanbul|hong\s+kong|singapore|copenhagen|edinburgh|dublin|mumbai|delhi|budapest)\b/;
    let core = [...MIDDLE_TITLE_INTRACOAST_MERGED];
    if (coastalHints.test(dl)) core = [...core, ...MIDDLE_TITLE_COASTAL];
    else if (cityHints.test(dl)) core = [...MIDDLE_TITLE_CITY_MAJOR, ...core];
    return core;
  }

  function reserveUniqueMiddleTitle(dayIndex, dest, pkgTitle, totalDays, focusSnippet, usedTitleNorm) {
    const h = simpleHashItinerary(`${pkgTitle}|${dest}|${totalDays}|mid`);
    const builders = middleDayTitleBuildersForDestination(dest, pkgTitle);
    if (focusSnippet && focusSnippet.length >= 8 && focusSnippet.length <= 52) {
      const focused = `${focusSnippet} spotlight — ${dest}`;
      const k = titleKeyLine(focused);
      if (!usedTitleNorm.has(k)) {
        usedTitleNorm.add(k);
        return `Day ${dayIndex} · ${focused}`;
      }
    }

    let idx = (h + dayIndex * 31) % builders.length;
    for (let tries = 0; tries < builders.length; tries += 1) {
      const line = builders[idx](dest);
      const nk = titleKeyLine(line);
      if (!usedTitleNorm.has(nk)) {
        usedTitleNorm.add(nk);
        return `Day ${dayIndex} · ${line}`;
      }
      idx = (idx + 1) % builders.length;
    }

    const fallback = `Custom route ${dayIndex} around ${dest}`;
    usedTitleNorm.add(titleKeyLine(fallback));
    return `Day ${dayIndex} · ${fallback}`;
  }

  function buildTerminalDayTitles(dayIndex, totalDays, kind, dest, pkgTitle) {
    const h = simpleHashItinerary(`${pkgTitle}|${dest}|${totalDays}|${kind}`);
    if (kind === "first") {
      const opts = [
        `Arrival & mellow evening — ${dest}`,
        `Welcome to ${dest} — settle & soft explore`,
        `Touch down — first evening in ${dest}`,
      ];
      return `Day ${dayIndex} · ${opts[h % opts.length]}`;
    }
    const opts = [
      `Soft morning & onward journey — ${dest}`,
      `Farewell rituals & departure — ${dest}`,
      `Last breakfast & checkout — ${dest}`,
    ];
    return `Day ${dayIndex} · ${opts[(h + dayIndex * 3) % opts.length]}`;
  }

  function capitalizeSent(s) {
    const t = cleanSnippet(s, 200);
    if (!t) return "";
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  function popUniqueBullets(queue, usedNorm, budget) {
    const out = [];
    while (queue.length && out.length < budget) {
      const raw = queue.shift();
      const line = capitalizeSent(raw);
      const k = line.toLowerCase();
      if (!line || usedNorm.has(k)) continue;
      usedNorm.add(k);
      out.push(line);
    }
    return out;
  }

  function takeFromFallbackBank(bank, bankCursor, usedNorm, budget) {
    const out = [];
    while (bankCursor.value < bank.length && out.length < budget) {
      const line = bank[bankCursor.value];
      bankCursor.value += 1;
      const k = line.toLowerCase();
      if (usedNorm.has(k)) continue;
      usedNorm.add(k);
      out.push(line);
    }
    return out;
  }

  /** Spread real package stops evenly across middle days so late days still get attractions. */
  function splitPoolForTrip(queueItems, totalDays) {
    const items = [...queueItems];
    const middleCount = Math.max(totalDays - 2, 0);
    const buckets = Array.from({ length: middleCount }, () => []);
    let firstReserve = [];
    let lastReserve = [];

    if (totalDays <= 1) {
      return { firstReserve: items, buckets, lastReserve: [] };
    }

    if (middleCount === 0) {
      if (items.length) firstReserve.push(items.shift());
      if (items.length) lastReserve.push(items.pop());
      items.forEach((it, idx) => {
        if (idx % 2 === 0) firstReserve.push(it);
        else lastReserve.push(it);
      });
      return { firstReserve: uniqPreserveStrings(firstReserve), buckets, lastReserve: uniqPreserveStrings(lastReserve) };
    }

    if (items.length <= middleCount + 2) {
      items.forEach((it, idx) => {
        buckets[idx % middleCount].push(it);
      });
      return {
        firstReserve: [],
        buckets: buckets.map((b) => uniqPreserveStrings(b)),
        lastReserve: [],
      };
    }

    firstReserve.push(items.shift());
    if (totalDays >= 3 && items.length > 0) lastReserve.push(items.pop());

    items.forEach((it, idx) => {
      buckets[idx % middleCount].push(it);
    });

    return {
      firstReserve: uniqPreserveStrings(firstReserve),
      buckets: buckets.map((b) => uniqPreserveStrings(b)),
      lastReserve: uniqPreserveStrings(lastReserve),
    };
  }

  function pushUniquePoolStrings(target, usedNorm, rawArr, capLen = 24) {
    rawArr.slice(0, capLen).forEach((raw) => {
      const line = capitalizeSent(raw);
      const k = line.toLowerCase();
      if (!line || usedNorm.has(k)) return;
      usedNorm.add(k);
      target.push(line);
    });
  }

  /** Plan-shaped lines consumed before etiquette / micro-tip filler so middle days read like real itineraries. */
  function purposefulPlanningLines(dest, packageType) {
    const f = typeFlavorPhrase(packageType);
    return uniqPreserveStrings([
      `Morning loop: clustered landmarks near ${dest} before heat.`,
      `Afternoon corridor: neighbourhoods you skipped on arrival day.`,
      `Beach or pool depth in the AM; inland culture block after lunch.`,
      `Half-day excursion radius, half-day loose for ${f}.`,
      `Sunrise outing, midday slowdown, sunset coastal return.`,
      `Ticketed highlights first; flexible eat-and stroll after.`,
      `Two-anchor rhythm: Landmark A calibrated early, Landmark B relaxed late.`,
      `Market-buy morning; chef-led tasting or long dinner payoff.`,
      `Water morning (boat, snorkel, swim); dry-ground storytelling afternoon.`,
      `Scenic driving string with viewpoints every 40–50 minutes.`,
      `Village introductions today; bigger icons can wait for tomorrow.`,
      `Icon sprint: timed entries bundled with shaded breaks.`,
      `Map-three-pins day — self-guided with optional guide assist.`,
      `Wellness layering: soak, massage window, stretches, herbal tea.`,
      `Evening-sector focus: lanterns, shoreline breeze, live music pockets.`,
      `Contrast routing: busiest strip versus quiet residential lanes.`,
      `Weekday pacing to dodge purely weekend-heavy venues.`,
      `Photography scouts midday; exposures at softer light windows.`,
      `Family cadence: shaded walks, playgrounds, hydration pit stops.`,
      `Active climb or canyon window with recovery dip after.`,
      `Harbour-energy morning; ridge-road or plateau afternoon.`,
      `Retail-and-gallery crawl exchanging coffee for culture.`,
      `Catch-up pass for bookmarks you saved earlier in ${dest}.`,
      `Laundry & bag reset so the second half of the trip stays light.`,
      `Self-guided wheels day with three agreed meet-up checkpoints.`,
    ]);
  }

  function isBaliLikePlace(dest, pkgTitle) {
    const t = `${dest} ${pkgTitle}`.toLowerCase();
    return /\bbali\b|\bubud\b|\buluwatu\b|\bcanggu\b|\bseminyak\b|\bsanur\b|\bkuta\b|\bjimbaran\b|\bnusa\s*penida\b|\bgili\b|\bdenpasar\b|\btanah\s*lot\b|\bbedugul\b/.test(t);
  }

  function ordinalEnglish(n) {
    const words = [
      "first",
      "second",
      "third",
      "fourth",
      "fifth",
      "sixth",
      "seventh",
      "eighth",
      "ninth",
      "tenth",
      "eleventh",
      "twelfth",
      "thirteenth",
      "fourteenth",
      "fifteenth",
      "sixteenth",
      "seventeenth",
      "eighteenth",
      "nineteenth",
      "twentieth",
    ];
    return n >= 1 && n <= words.length ? words[n - 1] : `${n}th`;
  }

  function uniqAddLine(text, bucket, used) {
    const t = cleanSnippet(text, 520);
    if (!t) return false;
    const k = t.toLowerCase();
    if (used.has(k)) return false;
    used.add(k);
    bucket.push(t);
    return true;
  }

  function pickPickupDropTimes(dayIndex, totalDays, seed) {
    const pickups = ["06:45 AM", "07:15 AM", "07:45 AM", "08:30 AM", "09:00 AM", "09:30 AM", "10:15 AM"];
    const drops = ["16:45", "17:15", "17:45", "18:00", "18:30", "19:00"];
    const pi = (seed + dayIndex * 17) % pickups.length;
    const di = (seed + dayIndex * 13) % drops.length;
    return { pu: pickups[pi], drop: drops[di] };
  }

  function joinChips(parts) {
    const u = uniqPreserveStrings(parts.map((p) => cleanSnippet(p, 80)).filter(Boolean));
    return u.slice(0, 9).join(" | ");
  }

  function visitDescriptor(stopName, dest) {
    const s = stopName.toLowerCase();
    if (/temple|pura|ulun/i.test(s))
      return `Balinese devotional architecture and lake or cliff backdrops—with respectful dress cues from your escort where needed.`;
    if (/forest|monkey/i.test(s)) return `A canopy-covered sanctuary stroll with guarded belongings and serene wildlife etiquette.`;
    if (/rice|terrace|tegallalang|jatiluwih/i.test(s))
      return `Layered emerald paddies and irrigation stories framed for leisurely photos along the ridges.`;
    if (/gold|silver|celuk|smith/i.test(s)) return `Bench-side glimpses of filigree waxwork, casting, and polished keepsakes worth comparing.`;
    if (/wood|carv|mas\s|sculpt/i.test(s)) return `Aromatic timber studios where chiselled forms range from miniature deities to statement panels.`;
    if (/batik|textile|weav|tohpati/i.test(s)) return `Pattern-dye demonstrations and heirloom fabrics you can unpack thread-by-thread with artisans.`;
    if (/spice|plantation|coffee|cocoa/i.test(s))
      return `A guided aromatic walk—coffee, cacao, cloves, vanilla—rounding out with tastings that linger on the palate.`;
    if (/village|kampung|^celuk|^mas|^ubud|^tohpati|^kintamani/i.test(s))
      return `Neighbourhood pace, maker conversations, and photo pauses calibrated to respectful distances.`;
    if (/volcano|batur|kintamani|caldera/i.test(s))
      return `Cool upland vistas across caldera rims and mirror lakes—with café stops angled for panorama light.`;
    if (/tanjung benoa|water\s*sport|parasail|jetski/i.test(s))
      return `Sheltered lagoon setups for tandem flights, donut rides, or jet skis—extras typically settled on-site.`;
    if (/uluwatu|cliff\s*temple/i.test(s))
      return `Marble pathways along limestone precipices crowned by spirited sunset skies and chanting traditions below.`;
    if (/tanah\s*lot/i.test(s)) return `Ocean-swept shrine silhouettes softened by tidal mist and lanterns as dusk gathers.`;
    if (/buyan|tamblingan|twin\s*lake|handara|wanagiri|hidden\s*hill|gate/i.test(s))
      return `Twin caldera moods, sculpted gates through highland mist, and lookouts perched over forested ridges.`;
    if (/benoa|harbour|sanur|fast\s*boat|nusa\s*penida|penida|angel|broken|kelingking|crystal\s*bay/i.test(s))
      return `Timed sea crossings, dramatic cliff overlooks, tidal pools, and snorkel-worthy coves—as swells safely allow.`;
    if (/beach|bay|coast/i.test(s)) return `Salt breeze, sheltered shallows for wading, and colour-rich reef glimpses offshore.`;
    if (/museum|gallery|historic|castle|palace|abbey|tower|bridge/i.test(s))
      return `Stories embedded in stonework plus curated pacing so each gallery or hall has breathing room.`;
    if (/market|bazaar/i.test(s)) return `Aisle-by-aisle tastings, souvenir scouting, and local pricing cues from your host.`;

    return `Curated narration, purposeful photo breaks, and timing that keeps crowds from rushing the rhythm around ${dest}.`;
  }

  /** Pick unique string from list (rotates seed); ensures not in usedTitles (lowercase compare). */
  function pickUniqueHeading(candidates, dayIndex, seed, usedTitles) {
    const clean = uniqPreserveStrings(candidates.map((c) => cleanSnippet(String(c), 120)).filter(Boolean));
    let i = (seed + dayIndex * 43) % clean.length;
    for (let t = 0; t < clean.length; t += 1) {
      const cand = clean[i];
      const k = cand.toLowerCase();
      if (!usedTitles.has(k)) {
        usedTitles.add(k);
        return cand;
      }
      i = (i + 1) % clean.length;
    }
    const fallback = `Signature discovery arc ${dayIndex} — customised`;
    usedTitles.add(fallback.toLowerCase());
    return fallback;
  }

  /** Rich multi-segment itineraries: narrative paragraphs + timed checklist inspired by brochure tours. */
  function buildRichItineraryDays(n, dest, pkgTitle, pool, packageType) {
    const usedTitles = new Set();
    const usedPara = new Set();
    const usedCheck = new Set();
    const seed = simpleHashItinerary(`${pkgTitle}|${dest}|${n}|rich`);
    const queueRaw = uniqPreserveStrings(pool.map((x) => cleanSnippet(x, 200)).filter(Boolean));
    const { firstReserve, buckets, lastReserve } = splitPoolForTrip(queueRaw, n);
    const bali = isBaliLikePlace(dest, pkgTitle);
    const out = [];

    const roleCycleBali = [
      "villages_terraces",
      "south_waters_cliff",
      "free_easy",
      "lakes_mountains",
      "temples_spirit",
      "island_boat",
    ];
    const roleCycleGen = ["culture_loop", "flavours_markets", "free_easy_gen", "nature_lens", "icon_day", "river_park"];

    const padBadge = (d) => `Day ${String(d).padStart(2, "0")} :`;

    /** Middle-day thematic key */
    function middleRoleFor(d) {
      const seq = bali ? roleCycleBali : roleCycleGen;
      return seq[(d - 2 + seed + Math.floor(seed / 7)) % seq.length];
    }

    /** Build arrival day */
    if (n >= 1) {
      const d = 1;
      const narratives = [];
      const checklist = [];

      let headlineCandidates;
      let p1Variants;
      let p2Variants;
      if (bali) {
        headlineCandidates = [
          `Arrival in Bali · Island of the Gods`,
          `Touchdown in Bali · Gateway to Culture & Sea`,
          `Welcome to Bali — First Evening Immersion`,
          `Bali Opens — Floral Welcomes & Gentle Breeze`,
          `Hello Bali · Temple Bells & Frangipani Air`,
        ];
        p1Variants = [
          `Welcome to Bali — affectionately crowned the Island of the Gods. After journeying in, loosen your shoulders while the tropics soften the skyline and friendly faces set the tempo.`,
          `Your Balinese chapters begin gently: incense on the breeze, gamelan hinted from far courtyards, and unhurried hospitality that turns check-in into ritual rather than paperwork.`,
        ];
        p2Variants = [
          `From baggage claim onward, savour small luxuries curated for weary travellers—a garland greeting when offered, chilled mineral water, and an escorted transfer that narrates neighbourhoods en route.`,
          `Ease into dusk with shoreline air, rooftop mocktails, or a quiet café wander; tomorrow’s adventures will deepen the mythology of this emerald island.`,
        ];
      } else {
        headlineCandidates = [
          `Arrival · ${dest} Welcomes You`,
          `First Light in ${dest} — Gentle Introduction`,
          `Touchdown · ${dest} Hospitality Unfolds`,
          `Gate Opens — Discover ${dest}`,
          `${dest} Awaits — Easy Arrival Rhythm`,
        ];
        p1Variants = [
          `Welcome to ${dest}. After transit, reclaim your breath as the skyline, sounds, and street rhythm orient you quicker than any map.`,
          `Your getaway opens with practical calm: concierge coordination, refreshments where provided, and time to decompress before bolder sightseeing.`,
        ];
        p2Variants = [
          `Let the concierge or driver flag photo-worthy corners nearby—sunset vantage, riverside plaza, heritage lane—whatever fits your stamina tonight.`,
          `Keep luggage light-handed; hydrate, freshen up, then choose between an early supper circuit or restorative sleep ahead of fuller days.`,
        ];
      }

      const headline = pickUniqueHeading(headlineCandidates, d, seed, usedTitles);
      uniqAddLine(p1Variants[(seed + d * 5) % p1Variants.length], narratives, usedPara);
      uniqAddLine(p2Variants[(seed + d * 11) % p2Variants.length], narratives, usedPara);

      const chipBits = uniqPreserveStrings([...firstReserve, dest].map((x) => cleanSnippet(x, 72)).filter(Boolean));
      const chips = joinChips(chipBits.slice(0, 6));

      const arrivalLinesBali = [
        `Warm meet & greet at the airport`,
        `Fragrant floral garland welcome (where included)`,
        `Chilled bottled water on arrival`,
        `Private vehicle transfer toward your resort`,
        `Assisted hotel check-in with luggage handling`,
        `Leisure evening — sunset walk, spa menu, or early rest`,
      ];
      const arrivalLinesGen = [
        `Arrival coordination with your transfer team`,
        `Welcome refreshment tray or lounge access (if included)`,
        `Comfortable ride with introduction to central ${dest}`,
        `Hotel check-in assisted with baggage support`,
        `Neighbourhood orientation map & dining ideas shared`,
        `Unscripted evening — stroll, supper, or slow reset`,
      ];
      const arrBank = bali ? arrivalLinesBali : arrivalLinesGen;
      arrBank.forEach((line, idx) => {
        const variant = `${line} — Day ${d} segment ${idx + 1}`;
        uniqAddLine(variant, checklist, usedCheck);
      });

      out.push({
        dayIndex: d,
        badge: padBadge(d),
        headline,
        title: `Day ${d} · ${headline}`,
        chips,
        narratives,
        checklist,
      });
    }

    /** Middle days */
    for (let d = 2; d <= Math.max(n - 1, 1); d += 1) {
      const bucket = buckets[d - 2] || [];
      const role = middleRoleFor(d);
      const ord = ordinalEnglish(d);
      const { pu, drop } = pickPickupDropTimes(d, n, seed);
      const narratives = [];
      const checklist = [];

      const chips = joinChips(bucket.length ? bucket : [dest, `${dest} highlight route`]);

      let headlineCandidates;
      let narrA;
      let narrB;

      if (bali) {
        if (role === "villages_terraces") {
          headlineCandidates = [
            `East Bali Artisan & Terrace Circuit`,
            `Craft Villages, Spices & Rice Sculptures`,
            `Village Ateliers & Emerald Contours`,
          ];
          narrA = `The ${ord} full day leans into Bali’s hands and hills—batik presses, jewellery benches, aromatic gardens, then layered rice shelves that ripple like folded silk under the sun.`;
          narrB = `We thread narrow studio lanes before climbing to breezy ridges; every stop keeps craft stories legible without crowding artisans or their tools.`;
        } else if (role === "south_waters_cliff") {
          headlineCandidates = [
            `South Bali · Watersports & Cliff Temple Glory`,
            `Reef Play & Marble Temple Sunsets`,
            `Adrenaline Lagoon Mornings · Kecak-Ready Evenings`,
          ];
          narrA = `Morning adrenaline hums across sheltered lagoons—parasail arcs, donut rides, or jet skis—then afternoon light drifts toward temple ledges perched over open ocean drama.`;
          narrB = `Expect salt on your skin by noon and golden-hour chants riding the cliff wind; pacing leaves margin for rinsing off and swapping footwear before sacred steps.`;
        } else if (role === "free_easy") {
          headlineCandidates = [
            `Free Day · Leisure Your Way`,
            `Unscheduled Bliss in Bali`,
            `Choose-Your-Own Island Tempo`,
          ];
          narrA = `Treat this ${ord} daylight as sovereign time: savour hotel breakfast slowly, chase a spontaneous cooking class, or float in the pool while staff curate optional add-ons.`;
          narrB = `Retail therapy, volcanic sand walks, or quiet reading corners are all fair—our desk can map driver-on-call timing if you crave a spontaneous temple hop.`;
        } else if (role === "lakes_mountains") {
          headlineCandidates = [
            `Lake Country & Highland Gate Icons`,
            `Misty Crater Lakes & Scenic Portals`,
            `Bedugul Breezes · Temples Above the Water`,
          ];
          narrA = `Cooler altitudes unveil mirror lakes, shrine islands, and sculpted gates punched through jungle mist—ideal for unrushed shutters and reflective pauses.`;
          narrB = `We weave ridgelines with hydration breaks, mindful of altitude shifts, before spiralling back toward warmer coasts for supper.`;
        } else if (role === "temples_spirit") {
          headlineCandidates = [
            `Bali’s Iconic Temple Trail`,
            `Sanctuary Jungles & Ocean Shrines`,
            `Spirit Routes — Forest to Sea`,
          ];
          narrA = `This ${ord} odyssey contrasts humid monkey canopies with sea-spray shrines—each entrance timed to beat peak heat and souvenir stall swells.`;
          narrB = `Your guide decodes ceremonial dress and photography etiquette so respect stays as sharp as your wide-angle captures.`;
        } else {
          headlineCandidates = [
            `Island Hop & Hidden Coves`,
            `Sea Crossings · Karst Drama & Tide Pools`,
            `Offshore Odyssey with Timed Returns`,
          ];
          narrA = `Fast ferries skim turquoise channels toward cliff-sculpted bays, tidal windows, and snorkel corridors where turtles might cruise your peripheral vision.`;
          narrB = `Waves dictate stairs and reef entries; dry bags, reef-safe SPF, and nimble footwear keep the voyage polished from pier to pier.`;
        }
      } else {
        if (role === "culture_loop") {
          headlineCandidates = [
            `City Culture & Landmark Loop`,
            `Museums, Plazas & Living History`,
            `Urban Storytelling Day — ${dest}`,
          ];
          narrA = `The ${ord} chapter explores ${dest} through curated corridors—grand façades, curated galleries, and neighbourhood pockets where locals actually queue for pastries.`;
          narrB = `We balance ticketed interiors with alfresco café pauses so kids, photographers, and foodies stay equally engaged.`;
        } else if (role === "flavours_markets") {
          headlineCandidates = [
            `Market Mornings & Supper Rituals`,
            `Tasting Tables — ${dest} Edition`,
            `Gastro Walk + Chef’s Table Option`,
          ];
          narrA = `Morning stalls roll out spice pyramids while evening reservations capture chef narratives—today is equal parts aroma and anecdote across ${dest}.`;
          narrB = `Bring curiosity and comfortable shoes; dietary notes travel ahead so substitutes feel generous, not apologetic.`;
        } else if (role === "free_easy_gen") {
          headlineCandidates = [
            `Flexible Leisure · ${dest}`,
            `Choose-Your-Adventure Reset`,
            `DIY Excursions & Spa Windows`,
          ];
          narrA = `No fixed convoy today—linger over brunch, chase a cycling map, or request a bespoke driver quote for spur-of-the-moment museums.`;
          narrB = `Concierge desks stand by with three “if you feel like it” itineraries covering different energy levels.`;
        } else if (role === "nature_lens") {
          headlineCandidates = [
            `Nature & Viewpoint Safari`,
            `Ridges, Gardens & Skyline Vistas`,
            `Green Lung Immersion Near ${dest}`,
          ];
          narrA = `Forested trails, botanical glasshouses, or urban parks provide oxygen between museum-heavy days—cameras welcome, hiking layers optional.`;
          narrB = `Route difficulty stays moderate; bottled water and sun barriers are rotated like clockwork.`;
        } else if (role === "icon_day") {
          headlineCandidates = [
            `Bucket-List Icons — ${dest}`,
            `Signature Ticketing & Photo Windows`,
            `Marquee Stops Without the Rush`,
          ];
          narrA = `Timed entries, fast-track cues, and strategic lunch breaks prevent iconic ${dest} sights from feeling like a queue exercise.`;
          narrB = `Evening optionally layers theatre, skyline bars, or river cruises depending on stamina.`;
        } else {
          headlineCandidates = [
            `Riverfront & Old Quarter Drift`,
            `Waterways, Bridges & Cobble Calm`,
            `Slow Path Along ${dest}’s Liquid Spine`,
          ];
          narrA = `Follow promenades, crossing historic bridges, ducking into archives or micro-galleries en route—ideal for reflective travellers.`;
          narrB = `Boat hops or bike shares can swap in if weather smiles; rain plans pivot to covered arcades.`;
        }
      }

      const headline = pickUniqueHeading(headlineCandidates, d, seed + d * 19, usedTitles);
      uniqAddLine(narrA, narratives, usedPara);
      uniqAddLine(narrB, narratives, usedPara);
      if (narratives.length < 2) {
        uniqAddLine(
          `Day ${d} cadence (${dest}, ${ord} rhythm): hydrate between chapters, heed shade breaks, and let your coordinator flex sequence if traffic pulses shift.`,
          narratives,
          usedPara
        );
      }

      uniqAddLine(`${pu} — Hotel pick-up with driver briefing and bottled water aboard.`, checklist, usedCheck);

      const stops = bucket.length ? bucket.slice(0, 5) : [`${dest} landmark circuit`, `Signature viewpoint`, `Local lunch enclave`];
      stops.forEach((stop, idx) => {
        const nm = capitalizeSent(stop);
        const body = visitDescriptor(stop, dest);
        const line = `Visit ${nm}: ${body}${idx === stops.length - 1 ? "" : ""}`;
        uniqAddLine(line, checklist, usedCheck);
      });

      if (role.includes("free")) {
        uniqAddLine(`Optional À la carte add-ons: cooking lab, photography guide, or extended spa block (book on demand).`, checklist, usedCheck);
        uniqAddLine(`Concierge follow-up with tomorrow’s weather snapshot & outfit suggestions.`, checklist, usedCheck);
      } else {
        uniqAddLine(`Afternoon flexibility: bonus viewpoint, tasting flight, or boutique pause when traffic cooperates.`, checklist, usedCheck);
      }

      uniqAddLine(`${drop} — Return to hotel with drop-off assistance and next-day reminder pack.`, checklist, usedCheck);

      out.push({
        dayIndex: d,
        badge: padBadge(d),
        headline,
        title: `Day ${d} · ${headline}`,
        chips,
        narratives,
        checklist,
      });
    }

    /** Last day / departure */
    if (n >= 2) {
      const d = n;
      const narratives = [];
      const checklist = [];

      const headlineCandidates = bali
        ? [
            `End of Journey — Bali Farewell`,
            `Departure Day · Until the Island Calls Again`,
            `Final Morning & Airport Escort`,
            `Goodbye Bali — Seamless Transfer Out`,
          ]
        : [
            `End of Trip — ${dest} Send-Off`,
            `Departure Morning · Homeward Bound`,
            `Final Chapter in ${dest}`,
            `Checkout & Airport Coordination`,
          ];

      const headline = pickUniqueHeading(headlineCandidates, d, seed + 401 + d * 3, usedTitles);

      const p1 = bali
        ? `As the ${ordinalEnglish(d)} morning breaks, trade flip-flops for boarding passes with gratitude—${dest}’s temples, softened light, and ocean rumble now live in memory as much as megapixels.`
        : `The ${ordinalEnglish(d)} dawn in ${dest} leans practical: final espresso, deliberate packing, and the quiet satisfaction of a route fully inhabited.`;

      const p2 = bali
        ? `Ease through breakfast buffers, boutique sweeps if you wish, then assisted checkout and a private airport run timed to honour carrier check-in and immigration buffers.`
        : `Savour an unrushed brunch, tidy last errands on foot, then escorted departure toward your onward terminal—with porter cues if your suitcases multiplied souvenirs.`;

      uniqAddLine(p1, narratives, usedPara);
      uniqAddLine(p2, narratives, usedPara);

      const chips = joinChips([...lastReserve, bali ? "DPS airport timing" : `${dest} airport / station`]);

      uniqAddLine(
        `${bali ? "Late-morning / noon" : "Midday"} checkout window — suitcases rallied, minibars audited, invoices sealed without rush.`,
        checklist,
        usedCheck
      );
      uniqAddLine(
        `Dedicated transfer pacing toward your onward hub (buffer ~2–3 hours pre-flight internationally, adjust for domestic hops).`,
        checklist,
        usedCheck
      );
      uniqAddLine(`Assistance with luggage tags, porter coordination, and lounge access if your fare includes it.`, checklist, usedCheck);
      uniqAddLine(`Optional last-minute duty-free list or digital boarding pass check before curbside goodbye.`, checklist, usedCheck);

      out.push({
        dayIndex: d,
        badge: padBadge(d),
        headline,
        title: `Day ${d} · ${headline}`,
        chips,
        narratives,
        checklist,
      });
    }

    /** Single-day compression */
    if (n === 1) {
      const single = out[0];
      const bank = buildUniqueFallbackBulletBank(dest, packageType);
      const uniqCheck = new Set(single.checklist.map((x) => x.toLowerCase()));
      const bc = { value: 0 };
      while (single.checklist.length < 8 && bc.value < bank.length) {
        const need = Math.min(3, 9 - single.checklist.length);
        const batch = takeFromFallbackBank(bank, bc, uniqCheck, need);
        batch.forEach((ln) => {
          const k = ln.toLowerCase();
          if (uniqCheck.has(k)) return;
          uniqCheck.add(k);
          single.checklist.push(ln);
        });
      }
      pool.slice(0, 6).forEach((raw) => {
        const line = `Featured waypoint — ${capitalizeSent(raw)}: ${visitDescriptor(raw, dest)}`;
        uniqAddLine(line, single.checklist, usedCheck);
      });
    }

    return out.slice(0, n);
  }

  function buildDynamicItineraryDaysFromContext(ctx) {
    const dest = pickFirstText(ctx.destination, "your destination");
    const pkgTitle = pickFirstText(ctx.packageTitle, "Your trip");
    const packageType = ctx.packageType || "";
    const n = clampItineraryDays(ctx.numDays);

    const pool = buildExperiencePool(ctx);
    return buildRichItineraryDays(n, dest, pkgTitle, pool, packageType);
  }

  function renderPackageItineraryHtml(dayBlocks) {
    const sections = dayBlocks.map((day, idx) => {
      const badge =
        day.badge || `Day ${String(day.dayIndex != null ? day.dayIndex : 1).padStart(2, "0")} :`;
      const head = day.headline || (day.title || "").replace(/^Day\s*\d+\s*·\s*/i, "").trim() || "Highlights";

      const chipsBlock = day.chips
        ? `<p class="itinerary-rich-chips">${escapeHtmlItinerary(day.chips)}</p>`
        : "";

      const narrBlock = Array.isArray(day.narratives)
        ? day.narratives.map((p) => `<p class="itinerary-rich-para">${escapeHtmlItinerary(p)}</p>`).join("")
        : "";

      const listSource = Array.isArray(day.checklist)
        ? day.checklist
        : Array.isArray(day.bullets)
          ? day.bullets
          : [];

      const listBlock = listSource
        .map(
          (li) =>
            `<li class="itinerary-rich-check-item"><i class="fa-solid fa-circle-check itinerary-rich-check-icon" aria-hidden="true"></i><span>${escapeHtmlItinerary(li)}</span></li>`
        )
        .join("");

      const hid = typeof day.dayIndex === "number" ? day.dayIndex : 1;
      const panelId = `itinerary-day-panel-${idx}-${hid}`;

      return `<div class="itinerary-day-box">
    <button type="button" class="itinerary-day-box-toggle" aria-expanded="false" aria-controls="${panelId}">
      <span class="itinerary-day-box-badge">${escapeHtmlItinerary(badge)}</span>
      <span class="itinerary-day-box-title">${escapeHtmlItinerary(head)}</span>
      <span class="itinerary-day-box-chevron" aria-hidden="true"><i class="fa-solid fa-chevron-down itinerary-day-box-chevron-icon"></i></span>
    </button>
    <div id="${panelId}" class="itinerary-day-box-panel">
      <div class="itinerary-day-box-inner">
        ${chipsBlock}
        <div class="itinerary-rich-narr">${narrBlock}</div>
        <ul class="itinerary-rich-checklist">${listBlock}</ul>
      </div>
    </div>
  </div>`;
    });
    return `<div class="package-itinerary-root package-itinerary-rich-root">${sections.join("")}</div>`;
  }

  /** Itinerary section uses CSS `max-height: none` when `.open`; clear any lingering inline px from other accordion logic. */
  function refreshPackageItineraryAccordionHeight() {
    const mount = document.getElementById("packageItineraryContent");
    if (!mount?.classList.contains("open")) return;
    mount.style.maxHeight = null;
  }
  g.refreshPackageItineraryAccordionHeight = refreshPackageItineraryAccordionHeight;

  /** Collapsible day rows (orange badge + title + chevron). Delegated clicks; bind once per mount element. */
  function setupItineraryDayBoxAccordion() {
    const root = document.getElementById("packageItineraryContent");
    if (!root || root.dataset.itineraryDayAccordionBound === "1") return;
    root.dataset.itineraryDayAccordionBound = "1";

    root.addEventListener("click", (event) => {
      const btn = event.target.closest(".itinerary-day-box-toggle");
      if (!btn || !root.contains(btn)) return;
      const row = btn.closest(".itinerary-day-box");
      const panel = row?.querySelector(".itinerary-day-box-panel");
      if (!row || !panel) return;

      const opens = !row.classList.contains("is-expanded");

      if (opens) {
        root.querySelectorAll(".itinerary-day-box.is-expanded").forEach((openRow) => {
          if (openRow === row) return;
          openRow.classList.remove("is-expanded");
          const ob = openRow.querySelector(".itinerary-day-box-toggle");
          ob?.setAttribute("aria-expanded", "false");
        });
      }

      row.classList.toggle("is-expanded", opens);
      btn.setAttribute("aria-expanded", String(opens));
      refreshPackageItineraryAccordionHeight();
    });

    let resizeTick = null;
    window.addEventListener("resize", () => {
      if (!document.body.contains(root)) return;
      window.clearTimeout(resizeTick);
      resizeTick = window.setTimeout(() => {
        refreshPackageItineraryAccordionHeight();
      }, 140);
    });
  }

  function buildItineraryMergeContext(initialCtx, detailParamsObj, urlSearchParams) {
    const fromQueryString = !!(urlSearchParams && String(urlSearchParams.toString()).trim());
    const title = pickFirstText(detailParamsObj.get?.("title"), initialCtx.title);
    const locationLine = pickFirstText(detailParamsObj.get?.("location"), initialCtx.fullLocation);
    const destination = locationLine.split(",")[0].trim() || initialCtx.destination;
    const daysText = pickFirstText(detailParamsObj.get?.("days"), initialCtx.daysText);
    const attractions = parseCommaListParam(detailParamsObj.get?.("places") || detailParamsObj.get?.("attractions"));
    const activities = parseCommaListParam(detailParamsObj.get?.("activities"));
    const packageType = pickFirstText(detailParamsObj.get?.("type"), "");

    const numDays = parseDurationDays(daysText);

    const highlightPool = fromQueryString ? [] : initialCtx.highlights.slice();
    const includedPool = fromQueryString ? [] : initialCtx.included.slice();

    return {
      packageTitle: title || "Trip",
      destination,
      numDays,
      packageType,
      attractions,
      activities,
      highlightPool,
      includedPool,
    };
  }

  function injectDynamicPackageItinerary(detailParamsObj, initialCtx, urlSearchParams) {
    const mount = document.getElementById("packageItineraryContent");
    if (!mount) return;
    const ctx = buildItineraryMergeContext(initialCtx, detailParamsObj, urlSearchParams);
    const days = buildDynamicItineraryDaysFromContext(ctx);
    mount.innerHTML = renderPackageItineraryHtml(days);
    setupItineraryDayBoxAccordion();
    refreshPackageItineraryAccordionHeight();
  }

  // Populate package details from selected package card state/path (clean URL).
  const toPackageSlug = (text) =>
    String(text || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "tripon-package";

  function triponPackageDetailHref(placeSlug, packageSlug, durationFolder) {
    const rel = typeof window.triponRelPrefix === "function" ? window.triponRelPrefix() : "";
    const slug =
      String(packageSlug || document.body?.getAttribute("data-package-slug") || "").trim() ||
      "honey-moon-package-in-bali";
    const dur =
      durationFolder ||
      document.body?.getAttribute("data-package-duration") ||
      (typeof triponDurationFolderFromDaysValue === "function"
        ? triponDurationFolderFromDaysValue(document.body?.getAttribute("data-package-days"))
        : "");
    if (dur) {
      return `${rel}packages/bali/${dur}/${slug}.html`;
    }
    return `${rel}packages/bali/5-days/${slug}.html`;
  }

  const toPlaceSlug = (text) => {
    const name = String(text || "").split(",")[0].trim();
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "ubud";
  };
  const detailParams = new URLSearchParams(window.location.search);
  const pagePlace = document.body?.getAttribute("data-package-place") || "";
  const pageSlug = document.body?.getAttribute("data-package-slug") || "";
  const catalogEntry =
    typeof triponGetCatalogEntry === "function" ? triponGetCatalogEntry(pagePlace, pageSlug) : null;

  const storedPackageRaw = sessionStorage.getItem("tripon_selected_package");
  const storedSlug = sessionStorage.getItem("tripon_selected_package_slug") || "";
  let storedPackage = null;
  try {
    storedPackage = storedPackageRaw ? JSON.parse(storedPackageRaw) : null;
  } catch (_error) {
    storedPackage = null;
  }

  /** Prefer page catalog when URL slug differs from last clicked card (stale session). */
  let activePackageData = null;
  if (catalogEntry) {
    const slugMatches = !pageSlug || !storedSlug || storedSlug === pageSlug;
    if (storedPackage && typeof storedPackage === "object" && storedPackage.title && slugMatches) {
      activePackageData = { ...storedPackage, ...catalogEntry };
    } else {
      activePackageData = catalogEntry;
    }
  } else if (storedPackage && typeof storedPackage === "object") {
    activePackageData = storedPackage;
  }

  const pageDurationFolder =
    document.body?.getAttribute("data-package-duration") ||
    (window.location.pathname.match(/\/packages\/bali\/([^/]+)\//i) || [])[1] ||
    "";
  const pageDurationLabel =
    typeof triponDurationLabelFromFolder === "function"
      ? triponDurationLabelFromFolder(pageDurationFolder)
      : "";
  if (pageDurationLabel && activePackageData && typeof activePackageData === "object") {
    activePackageData = { ...activePackageData, days: pageDurationLabel };
  }

  const detailParamLike = {
    get(key) {
      const fromQuery = detailParams.get(key);
      if (fromQuery) return fromQuery;
      if (!activePackageData || typeof activePackageData !== "object") return "";
      const val = activePackageData[key];
      if (Array.isArray(val)) return val.join("|");
      return val || "";
    },
    toString() {
      if (detailParams.toString()) return detailParams.toString();
      return activePackageData && typeof activePackageData === "object" ? "resolved" : "";
    }
  };
  const initialPackagePageContext = readInitialPackagePageContext();

  function triponEscapeHtmlLite(raw) {
    return String(raw || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function triponCatalogToDetailImagesAttr(detailImages) {
    return String(detailImages || "")
      .split(",")
      .map((piece) => {
        const p = piece.trim();
        if (!p) return "";
        if (p.startsWith("/")) return p;
        if (p.startsWith("assets/")) return `/${p}`;
        if (p.startsWith("images/")) return `/assets/${p}`;
        return `/assets/images/${p.replace(/^images\//, "")}`;
      })
      .filter(Boolean)
      .join(",");
  }

  function triponCatalogImageUrl(image, relPrefix) {
    const raw = String(image || "").trim();
    if (!raw) return "";
    if (/^(https?:)?\/\//i.test(raw) || raw.startsWith("data:")) return raw;
    if (raw.startsWith("/")) return raw;
    const rel = relPrefix || "";
    if (raw.startsWith("assets/")) return `${rel}${raw}`;
    return `${rel}assets/images/${raw.replace(/^images\//, "").replace(/^assets\/images\//, "")}`;
  }

  function triponExtractRelatedCardPayload(card) {
    const title = card.querySelector("h4")?.textContent?.trim() || "";
    const locationText =
      card.querySelector(".pd-related-location")?.textContent?.replace(/\s+/g, " ").trim() || "";
    const ratingRaw = card.querySelector(".pd-related-rating span")?.textContent?.trim() || "";
    const ratingMatch = ratingRaw.match(/(\d+(\.\d+)?)/);
    const reviewsMatch = ratingRaw.match(/\((\d+)\)/);
    const daysText =
      card.querySelector(".pd-related-meta span:first-child")?.textContent?.replace(/\s+/g, " ").trim() || "";
    const priceText =
      card.querySelector(".pd-related-meta span:last-child")?.textContent?.replace(/^From\s*/i, "").trim() || "";
    const imageSrc = card.querySelector("img")?.getAttribute("src") || "";
    const packageType = card.getAttribute("data-type") || "traveler";
    const imageUrl = imageSrc ? triponResolvePackageImageSrc(imageSrc) : "";
    return {
      title,
      location: locationText,
      rating: ratingMatch?.[1] || "",
      reviews: reviewsMatch?.[1] || "",
      days: daysText,
      price: priceText,
      type: packageType,
      image: imageUrl,
      gallery: (card.getAttribute("data-package-gallery") || "").trim(),
      detailImages: (card.getAttribute("data-package-detail-images") || "").trim()
    };
  }

  function triponMarkActiveRelatedCard(place, slug) {
    const p = String(place || "").toLowerCase();
    const s = String(slug || "").toLowerCase();
    document.querySelectorAll(".pd-related-card:not(.pd-related-card--clone)").forEach((card) => {
      const cardPlace = (card.getAttribute("data-package-place") || "").toLowerCase();
      const cardSlug = (card.getAttribute("data-package-slug") || "").toLowerCase();
      card.classList.toggle("pd-related-card--active", cardPlace === p && cardSlug === s);
    });
  }

  const TRIPON_RELATED_PACKAGES_FOLDER = "4-days";

  function triponHydratePackageRelatedTrack() {
    if (!document.body?.classList.contains("package-details-page")) return;
    const track = document.querySelector(".pd-related-track");
    if (!track) return;
    const pageFolder =
      document.body.getAttribute("data-package-duration") ||
      (window.location.pathname.match(/\/packages\/bali\/([^/]+)\//i) || [])[1] ||
      "";
    const relatedFolder = TRIPON_RELATED_PACKAGES_FOLDER;
    if (typeof triponCatalogEntriesForDurationFolder !== "function") return;
    const entries = triponCatalogEntriesForDurationFolder(relatedFolder);
    if (!entries.length) return;

    const currentPlace = (document.body.getAttribute("data-package-place") || pagePlace || "").toLowerCase();
    const currentSlug = (document.body.getAttribute("data-package-slug") || pageSlug || "").toLowerCase();
    const rel = typeof window.triponRelPrefix === "function" ? window.triponRelPrefix() : "../../../";
    const daysLabel =
      typeof triponDurationLabelFromFolder === "function"
        ? triponDurationLabelFromFolder(relatedFolder)
        : entries[0]?.days || "4 Days";

    track.innerHTML = entries
      .map((entry) => {
        const place = entry.place;
        const slug = entry.slug;
        const isActive =
          pageFolder === relatedFolder &&
          String(place).toLowerCase() === currentPlace &&
          String(slug).toLowerCase() === currentSlug;
        const imgSrc = triponCatalogImageUrl(entry.image, rel);
        const detailImgs = triponCatalogToDetailImagesAttr(entry.detailImages);
        const type = entry.type || "traveler";
        const title = entry.title || "";
        const location = entry.location || "";
        const rating = entry.rating || "4.8";
        const reviews = entry.reviews || "0";
        const price = entry.price || "";
        const activeClass = isActive ? " pd-related-card--active" : "";
        return `<article class="pd-related-card${activeClass}" data-type="${triponEscapeHtmlLite(type)}" data-package-place="${triponEscapeHtmlLite(place)}" data-package-slug="${triponEscapeHtmlLite(slug)}" data-package-duration="${triponEscapeHtmlLite(relatedFolder)}" data-package-detail-images="${triponEscapeHtmlLite(detailImgs)}" data-package-hover-images="${triponEscapeHtmlLite(detailImgs)}">
                  <img src="${triponEscapeHtmlLite(imgSrc)}" alt="${triponEscapeHtmlLite(title)}" />
                  <p class="pd-related-location"><i class="fa-solid fa-location-dot"></i> ${triponEscapeHtmlLite(location)}</p>
                  <h4>${triponEscapeHtmlLite(title)}</h4>
                  <p class="pd-related-rating"><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i> <span>${triponEscapeHtmlLite(rating)} (${triponEscapeHtmlLite(reviews)})</span></p>
                  <div class="pd-related-meta"><span><i class="fa-regular fa-clock"></i> ${triponEscapeHtmlLite(daysLabel)}</span><span>From ${triponEscapeHtmlLite(price)}</span></div>
                </article>`;
      })
      .join("");
  }

  function triponSwitchPackageDetailOnPage(place, slug, cardPayload) {
    const catalog =
      typeof triponGetCatalogEntry === "function" ? triponGetCatalogEntry(place, slug) : null;
    activePackageData = catalog ? { ...catalog, ...(cardPayload || {}) } : cardPayload;
    if (pageDurationLabel && activePackageData && typeof activePackageData === "object") {
      activePackageData = { ...activePackageData, days: pageDurationLabel };
    }
    document.body.setAttribute("data-package-place", place);
    document.body.setAttribute("data-package-slug", slug);
    sessionStorage.setItem("tripon_selected_package", JSON.stringify(activePackageData));
    sessionStorage.setItem("tripon_selected_package_slug", slug);
    applyPackageDetailFromContext();
    injectDynamicPackageItinerary(detailParamLike, initialPackagePageContext, detailParams);
    triponMarkActiveRelatedCard(place, slug);
    const path = (window.location.pathname || "").replace(/[^/]+\.html?$/i, `${slug}.html`);
    if (window.history && typeof window.history.replaceState === "function" && path) {
      window.history.replaceState({}, "", path);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function triponInitPackageRelatedCardClicks() {
    const track = document.querySelector(".pd-related-track");
    if (!track || track.dataset.triponRelatedWired === "1") return;
    track.dataset.triponRelatedWired = "1";
    track.addEventListener("click", (event) => {
      const card = event.target.closest(".pd-related-card:not(.pd-related-card--clone)");
      if (!card) return;
      if (!card.getAttribute("data-package-place") && !card.getAttribute("data-package-slug")) return;

      const durationFolder =
        card.getAttribute("data-package-duration") ||
        TRIPON_RELATED_PACKAGES_FOLDER;
      const pageFolder =
        document.body?.getAttribute("data-package-duration") ||
        (window.location.pathname.match(/\/packages\/bali\/([^/]+)\//i) || [])[1] ||
        "";
      const onBaliDurationPage =
        document.body?.classList.contains("package-details-page") &&
        durationFolder &&
        /\/packages\/bali\//i.test(window.location.pathname || "");

      const packageSlug =
        card.getAttribute("data-package-slug") ||
        toPackageSlug(card.querySelector("h4")?.textContent || "");
      const placeSlug =
        card.getAttribute("data-package-place") ||
        toPlaceSlug(card.querySelector(".pd-related-location")?.textContent || "");

      if (onBaliDurationPage && durationFolder === pageFolder) {
        event.preventDefault();
        triponSwitchPackageDetailOnPage(placeSlug, packageSlug, triponExtractRelatedCardPayload(card));
        return;
      }

      const payload = triponExtractRelatedCardPayload(card);
      sessionStorage.setItem("tripon_selected_package", JSON.stringify(payload));
      sessionStorage.setItem("tripon_selected_package_slug", packageSlug);
      window.location.href = triponPackageDetailHref(placeSlug, packageSlug, durationFolder);
    });
  }

  function triponInitRelatedCardHover() {
    const pdHoverOk =
      window.matchMedia("(hover: hover)").matches || !window.matchMedia("(pointer: coarse)").matches;
    if (!pdHoverOk) return;

    const preloadPdImg = ((cache) => (srcRaw) => {
      const resolved = String(srcRaw || "").trim();
      if (!resolved) return Promise.resolve(false);
      try {
        const url = triponResolvePackageImageSrc(resolved);
        if (cache.has(url)) return cache.get(url);
        const p = new Promise((resolve) => {
          const im = new Image();
          im.onload = () => resolve(true);
          im.onerror = () => resolve(false);
          im.src = url;
        });
        cache.set(url, p);
        return p;
      } catch (_e) {
        return Promise.resolve(false);
      }
    })(new Map());

    document.querySelectorAll(".pd-related-card:not(.pd-related-card--clone)").forEach((card) => {
      if (card.dataset.triponHoverWired === "1") return;
      card.dataset.triponHoverWired = "1";
      const raw = (card.getAttribute("data-package-hover-images") || "").trim();
      const hoverPool = raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (hoverPool.length < 2) return;
      const imageNode = card.querySelector(":scope > img");
      if (!imageNode) return;
      imageNode.dataset.originalPdSrc = imageNode.getAttribute("src") || "";
      let hoverIndex = 0;
      let hoverTimer = null;

      const showHoverFrame = () => {
        const next = hoverPool[hoverIndex % hoverPool.length];
        hoverIndex += 1;
        const resolved = triponResolvePackageImageSrc(next);
        if (resolved) imageNode.src = resolved;
      };

      card.addEventListener("mouseenter", () => {
        preloadPdImg(hoverPool[0]);
        hoverTimer = window.setInterval(showHoverFrame, 900);
      });
      card.addEventListener("mouseleave", () => {
        if (hoverTimer != null) {
          window.clearInterval(hoverTimer);
          hoverTimer = null;
        }
        if (imageNode.dataset.originalPdSrc) {
          imageNode.src = imageNode.dataset.originalPdSrc;
        }
      });
    });
  }

  if (typeof window !== "undefined") {
    window.triponSwitchPackageDetailOnPage = triponSwitchPackageDetailOnPage;
  }

  function applyPackageDetailFromContext() {
    if (!document.body?.classList.contains("package-details-page")) return;
    if (!detailParamLike.toString()) return;
    const title = detailParamLike.get("title");
    const locationText = detailParamLike.get("location");
    const ratingValue = detailParamLike.get("rating");
    const reviewsValue = detailParamLike.get("reviews");
    const durationFolder =
      document.body?.getAttribute("data-package-duration") ||
      (window.location.pathname.match(/\/packages\/bali\/([^/]+)\//i) || [])[1] ||
      "";
    const folderDurationLabel =
      typeof triponDurationLabelFromFolder === "function"
        ? triponDurationLabelFromFolder(durationFolder)
        : "";
    const daysText = folderDurationLabel || detailParamLike.get("days");
    const packageType = detailParamLike.get("type");
    const priceText = detailParamLike.get("price");
    const imageUrl = detailParamLike.get("image");

    if (title) {
      const titleNode = document.querySelector(".title-section h1");
      if (titleNode) titleNode.textContent = title;
      document.title = `${title} | Tripon`;
    }

    if (locationText) {
      const locationNode = document.querySelector(".top-bar .left-section .location span");
      if (locationNode) locationNode.textContent = locationText;
    }

    if (ratingValue || reviewsValue) {
      const ratingTextNode = document.querySelector("#ratingText");
      if (ratingTextNode) {
        const safeRating = ratingValue || "4.8";
        const safeReviews = reviewsValue || "136";
        ratingTextNode.textContent = `${safeRating} (${safeReviews})`;
      }
    }

    if (daysText) {
      const durationItem = Array.from(document.querySelectorAll(".info-row .info-item")).find((el) =>
        /\bduration\b/i.test(el.querySelector(".info-label")?.textContent || "")
      );
      const durationNode = durationItem?.querySelector(".info-value");
      if (durationNode) durationNode.textContent = daysText;
    }

    if (priceText) {
      const priceNode = document.querySelector(".booking-top .price-value");
      if (priceNode) priceNode.textContent = priceText;
    }

    if (typeof window.triponRefreshBookingTicketPrices === "function") {
      window.triponRefreshBookingTicketPrices();
    }

    const setGalleryImages = () => {
      const galleryNodes = Array.from(document.querySelectorAll(".image-grid .gallery-img"));
      const imageGrid = document.querySelector(".image-grid");
      if (!imageGrid) return;

      const resolvePkgImg = (src) => triponResolvePackageImageSrc(src);

      const sources = [];
      const detailImagesRaw = (detailParamLike.get("detailImages") || "").trim();

      if (detailImagesRaw) {
        detailImagesRaw
          .split(",")
          .map((piece) => piece.trim())
          .filter(Boolean)
          .forEach((piece) => {
            const resolved = resolvePkgImg(piece);
            if (resolved) {
              sources.push(resolved);
            }
          });
      } else {
        const primary = resolvePkgImg(imageUrl);
        if (primary) {
          sources.push(primary);
        }
        const extraRaw = (detailParamLike.get("gallery") || "").trim();
        if (extraRaw) {
          extraRaw.split(",").forEach((piece) => {
            const resolved = resolvePkgImg(piece.trim());
            if (resolved && !sources.includes(resolved)) {
              sources.push(resolved);
            }
          });
        }
      }

      const TRANSPARENT_PIXEL =
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

      galleryNodes.forEach((node, index) => {
        const nextSrc = sources[index] || "";
        const previewCard = node.closest(".side-image-preview-card");
        if (nextSrc) {
          node.classList.remove("gallery-img--empty");
          node.src = nextSrc;
          node.style.display = "";
          node.removeAttribute("hidden");
          if (previewCard) {
            previewCard.classList.remove("is-image-placeholder");
          }
        } else {
          node.classList.add("gallery-img--empty");
          node.src = TRANSPARENT_PIXEL;
          node.alt = "";
          node.style.display = "";
          node.removeAttribute("hidden");
          if (previewCard) {
            previewCard.classList.add("is-image-placeholder");
          }
        }
      });

      imageGrid.classList.remove("gallery-single", "gallery-empty");
      imageGrid.removeAttribute("hidden");
      updateImageGridDots(0);
    };

    setGalleryImages();

    const destination = (locationText || "Bali").split(",")[0].trim();
    const packageMeta = {
      title: title || "Tripon Package",
      destination,
      daysText,
      packageType: packageType || "traveler",
      overview: activePackageData?.overview || "",
      highlights: activePackageData?.highlights || "",
      places: detailParamLike.get("places"),
      activities: detailParamLike.get("activities"),
      included: detailParamLike.get("included"),
    };
    triponApplyPackageOverviewAndHighlights(packageMeta);
    const slugForPath =
      document.body?.getAttribute("data-package-slug") ||
      storedSlug ||
      toPackageSlug(title);
    let cleanPath = window.location.pathname || "";
    if (slugForPath && cleanPath) {
      cleanPath = cleanPath.replace(/[^/]+\.html?$/i, `${slugForPath}.html`);
    } else if (!cleanPath) {
      cleanPath = triponPackageDetailHref(
        document.body?.getAttribute("data-package-place"),
        slugForPath || toPackageSlug(title)
      );
    }
    if (window.history && typeof window.history.replaceState === "function" && cleanPath) {
      window.history.replaceState({}, "", cleanPath);
    }
  }


  // ================== RELATED PACKAGES CAROUSEL ==================
  const relatedTrack = document.querySelector(".pd-related-track");
  const relatedPrev = document.querySelector(".pd-related-prev");
  const relatedNext = document.querySelector(".pd-related-next");
  if (relatedTrack && relatedPrev && relatedNext) {
    const slideAmount = () => Math.max(relatedTrack.clientWidth * 0.85, 260);

    relatedPrev.addEventListener("click", () => {
      relatedTrack.scrollBy({ left: -slideAmount(), behavior: "smooth" });
    });

    relatedNext.addEventListener("click", () => {
      relatedTrack.scrollBy({ left: slideAmount(), behavior: "smooth" });
    });
  }

  document.querySelectorAll(".pd-related-card:not(.pd-related-card--clone)").forEach((card) => {
    if (card.getAttribute("data-package-place") || card.getAttribute("data-package-slug")) {
      card.style.cursor = "pointer";
    }
  });

  // Package details — mobile/tablet: related cards advance in a loop (scroll left)
  function initPackageDetailsRelatedCarouselLoop() {
    if (!document.body.classList.contains("package-details-page")) return;

    const section = document.querySelector(".pd-related");
    const track = document.querySelector(".pd-related-track");
    if (!section || !track) return;

    const carouselMq = window.matchMedia("(max-width: 768px)");
    const reduceMotionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let autoplayTimer = null;
    let slideIndex = 0;
    let clonesReady = false;
    let isVisible = false;

    const getOriginalCards = () =>
      Array.from(track.querySelectorAll(".pd-related-card:not(.pd-related-card--clone)"));

    const removeClones = () => {
      track.querySelectorAll(".pd-related-card--clone").forEach((el) => el.remove());
      clonesReady = false;
      slideIndex = 0;
      track.scrollTo({ left: 0, behavior: "auto" });
    };

    const ensureClones = () => {
      if (clonesReady) return;
      const originals = getOriginalCards();
      originals.forEach((card) => {
        const clone = card.cloneNode(true);
        clone.classList.add("pd-related-card--clone");
        clone.setAttribute("aria-hidden", "true");
        clone.tabIndex = -1;
        track.appendChild(clone);
      });
      clonesReady = originals.length > 0;
    };

    const getTrackWrap = () => track.parentElement;

    const getSlideStep = () => {
      const gap = Number.parseFloat(getComputedStyle(track).gap) || 14;
      const first = track.querySelector(".pd-related-card:not(.pd-related-card--clone)");
      if (first && first.offsetWidth > 0) {
        return first.offsetWidth + gap;
      }
      const wrap = getTrackWrap();
      if (wrap && wrap.clientWidth > 0) {
        return wrap.clientWidth + gap;
      }
      return 0;
    };

    const scrollToSlide = (index, smooth) => {
      const step = getSlideStep();
      if (!step) return;
      track.scrollTo({
        left: index * step,
        behavior: smooth ? "smooth" : "auto"
      });
    };

    const advance = () => {
      const originals = getOriginalCards();
      const count = originals.length;
      if (count < 2) return;

      ensureClones();
      slideIndex += 1;

      if (slideIndex >= count) {
        scrollToSlide(count, true);
        window.setTimeout(() => {
          scrollToSlide(0, false);
          slideIndex = 0;
        }, 500);
        return;
      }

      scrollToSlide(slideIndex, true);
    };

    const stopAutoplay = () => {
      if (autoplayTimer != null) {
        window.clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    };

    const startAutoplay = (immediate = false) => {
      stopAutoplay();
      if (!carouselMq.matches || !isVisible || reduceMotionMq.matches) return;
      const originals = getOriginalCards();
      if (originals.length < 2) return;
      ensureClones();
      track.classList.add("pd-related-track--auto");
      if (immediate) advance();
      autoplayTimer = window.setInterval(advance, 3200);
    };

    const applyMediaMode = () => {
      if (!carouselMq.matches) {
        stopAutoplay();
        removeClones();
        track.classList.remove("pd-related-track--auto");
        return;
      }
      if (isVisible) startAutoplay(true);
    };

    track.addEventListener("click", (event) => {
      const cloneCard = event.target.closest(".pd-related-card--clone");
      if (!cloneCard) return;
      const clones = Array.from(track.querySelectorAll(".pd-related-card--clone"));
      const originals = getOriginalCards();
      const idx = clones.indexOf(cloneCard);
      if (idx >= 0 && originals[idx]) originals[idx].click();
    });

    track.addEventListener("mouseenter", stopAutoplay);
    track.addEventListener("mouseleave", () => startAutoplay());
    track.addEventListener("touchstart", stopAutoplay, { passive: true });
    track.addEventListener(
      "touchend",
      () => {
        window.setTimeout(() => startAutoplay(), 500);
      },
      { passive: true }
    );

    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        isVisible = Boolean(entries[0]?.isIntersecting);
        if (isVisible && carouselMq.matches) {
          startAutoplay(true);
        } else {
          stopAutoplay();
        }
      },
      { threshold: 0.15 }
    );
    visibilityObserver.observe(section);

    if (typeof carouselMq.addEventListener === "function") {
      carouselMq.addEventListener("change", applyMediaMode);
    } else {
      carouselMq.addListener(applyMediaMode);
    }

    if (typeof reduceMotionMq.addEventListener === "function") {
      reduceMotionMq.addEventListener("change", applyMediaMode);
    } else {
      reduceMotionMq.addListener(applyMediaMode);
    }

    applyMediaMode();
  }


  function initPackageDetailsPageContent() {
    applyPackageDetailFromContext();
    injectDynamicPackageItinerary(detailParamLike, initialPackagePageContext, detailParams);
    triponHydratePackageRelatedTrack();
    triponInitPackageRelatedCardClicks();
    triponInitRelatedCardHover();
    initPackageDetailsRelatedCarouselLoop();
  }

  /* ========== Booking card ========== */
  function initPackageDetailsBookingCard() {
    const bookingCardRoot = document.querySelector(".booking-card");
    if (!bookingCardRoot) {
      return;
    }

    g.triponEnhanceLuxuryTickets(bookingCardRoot);


    let prices = [94, 84, 20]; // Adult, Youth, Child
    let values = [0, 0, 0];
    let currencySymbol = "₹";

    const plusBtns = bookingCardRoot.querySelectorAll(".plus");
    const minusBtns = bookingCardRoot.querySelectorAll(".minus");
    const counts = bookingCardRoot.querySelectorAll(".count");
    const extras = bookingCardRoot.querySelectorAll(".extra");
    const totalPrice = bookingCardRoot.querySelector("#totalPrice");
    const ticketPriceNodes = bookingCardRoot.querySelectorAll(".ticket-price");
    const packageStartPriceNode = bookingCardRoot.querySelector(".booking-top .price-value");
    const bookingDateInput = bookingCardRoot.querySelector("#date");
    const bookingTimeInput = bookingCardRoot.querySelector("#time");
    const bookingButton = bookingCardRoot.querySelector(".book-btn");
    const bookingSubmitPopup = document.getElementById("bookingSubmitPopup");
    const bookingSubmitPopupClose = document.getElementById("bookingSubmitPopupClose");
    const bookingSubmitPopupIconClose = document.getElementById("bookingSubmitPopupIconClose");

    function parseCurrencyAmount(rawValue) {
      const source = String(rawValue || "");
      const symbolMatch = source.match(/[₹$]/);
      const parsed = Number(source.replace(/[^0-9.]/g, ""));
      return {
        amount: Number.isFinite(parsed) ? parsed : 0,
        symbol: symbolMatch?.[0] || currencySymbol
      };
    }

    function roundToStep(value, step) {
      return Math.round(value / step) * step;
    }

    function formatPrice(value, symbol = currencySymbol) {
      return `${symbol}${Math.max(0, Math.round(value)).toLocaleString("en-IN")}`;
    }

    function getSelectedDateRateMultiplier() {
      const dateStr = bookingDateInput?.value;
      if (!dateStr) {
        return 1;
      }
      const parts = dateStr.split("-").map(Number);
      const y = parts[0];
      const m = parts[1];
      const d = parts[2];
      if (!y || !m || !d) {
        return 1;
      }

      const cal = bookingDateInput?._luxuryCalendar;
      const { amount: startPrice } = parseCurrencyAmount(packageStartPriceNode?.textContent);
      const base = Math.max(startPrice, 1200);

      if (cal && typeof cal.getDayMeta === "function") {
        const meta = cal.getDayMeta(y, m - 1, d);
        if (meta.status === "available" && meta.price > 0) {
          return meta.price / base;
        }
      }

      const h = (y * 10000 + m * 100 + d) % 17;
      return 0.88 + (h % 7) * 0.04;
    }

    function getTimeRateMultiplier() {
      const timeVal = bookingTimeInput?.value;
      if (!timeVal) {
        return 1;
      }
      const hour = Number(timeVal.split(":")[0]);
      if (!Number.isFinite(hour)) {
        return 1;
      }
      if (hour >= 6 && hour <= 10) {
        return 1.05;
      }
      if (hour >= 17) {
        return 1.03;
      }
      return 1;
    }

    function computeTravelerRates() {
      const priceNode =
        bookingCardRoot?.querySelector(".booking-top .price-value") || packageStartPriceNode;
      const { amount: startPrice, symbol } = parseCurrencyAmount(priceNode?.textContent);
      currencySymbol = symbol || "₹";

      const base = Math.max(startPrice, 1200);
      const dateMult = getSelectedDateRateMultiplier();
      const timeMult = getTimeRateMultiplier();
      const combined = dateMult * timeMult;

      const adult = roundToStep(Math.max(base * 0.38 * combined, 500), 50);
      const youth = roundToStep(adult * 0.82, 50);
      const child = roundToStep(adult * 0.35, 50);
      prices = [adult, youth, child];
      return prices;
    }

    function applyDynamicTicketPricing() {
      computeTravelerRates();
    }

    function formatTravelerSummary() {
      const parts = [];
      if (values[0] > 0) {
        parts.push(`${values[0]} Adult${values[0] > 1 ? "s" : ""}`);
      }
      if (values[1] > 0) {
        parts.push(`${values[1]} Youth`);
      }
      if (values[2] > 0) {
        parts.push(`${values[2]} Child${values[2] > 1 ? "ren" : ""}`);
      }
      const total = values.reduce((sum, n) => sum + n, 0);
      if (!parts.length) {
        return total === 0 ? "0 travelers" : `${total} traveler${total > 1 ? "s" : ""}`;
      }
      return `${total} · ${parts.join(", ")}`;
    }

    function updateBookingSummary() {
      const summary = bookingCardRoot?.querySelector(".booking-summary-lux");
      if (!summary) {
        return;
      }

      const dateEl = summary.querySelector("[data-summary-date]");
      const timeEl = summary.querySelector("[data-summary-time]");
      const travelersEl = summary.querySelector("[data-summary-travelers]");

      const dateText =
        bookingDateInput?._luxuryCalendar?.trigger?.textContent?.trim() ||
        (bookingDateInput?.value ? bookingDateInput.value : "");
      const timeText =
        bookingTimeInput?._luxuryTimePicker?.trigger?.textContent?.trim() ||
        (bookingTimeInput?.value && typeof window.TriponLuxuryTimePicker?.formatDisplayTime === "function"
          ? window.TriponLuxuryTimePicker.formatDisplayTime(bookingTimeInput.value)
          : bookingTimeInput?.value || "");

      const flash = (el, text) => {
        if (!el) return;
        el.classList.add("is-updating");
        el.textContent = text;
        requestAnimationFrame(() => {
          el.classList.remove("is-updating");
        });
      };

      flash(dateEl, dateText || "Not selected");
      flash(timeEl, timeText || "Not selected");
      flash(travelersEl, formatTravelerSummary());
    }

    function setTicketCount(index, next) {
      values[index] = Math.max(0, next);
      if (counts[index]) {
        counts[index].innerText = values[index];
        counts[index].dataset.value = String(values[index]);
        if (typeof window.triponPulseTicketCount === "function") {
          window.triponPulseTicketCount(counts[index]);
        }
      }
    }

    function getTodayDateString() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }







    function triponLinkLuxuryPickers() {
      const cal = bookingDateInput?._luxuryCalendar;
      const time = bookingTimeInput?._luxuryTimePicker;
      if (!cal || !time) return;

      const calOpen = cal.open.bind(cal);
      const timeOpen = time.open.bind(time);

      cal.open = () => {
        time.close();
        calOpen();
      };
      time.open = () => {
        cal.close();
        timeOpen();
      };
    }

    function triponInitLuxuryBookingTime() {
      if (!bookingCardRoot || !bookingTimeInput) {
        return;
      }

      const row = bookingTimeInput.closest(".input-box");
      triponEnsurePickerToggleButton(row, bookingTimeInput);

      const durationRaw = document.body?.dataset?.packageDuration || "";
      const packageDuration = durationRaw.replace(/-/g, " ");

      window.TriponLuxuryTimePicker.attach(bookingTimeInput, {
        packageName: triponGetPackageTitleForCalendar(),
        packageDuration,
        getDateInput: () => bookingDateInput,
        getTotalText: () => totalPrice?.innerText?.trim() || "",
        onSelect: () => {
          bookingTimeInput?._luxuryTimePicker?.updateSummary();
          updateTotal();
        },
        onOpen: () => bookingDateInput?._luxuryCalendar?.close(),
      });

      triponLinkLuxuryPickers();
    }


    function triponGetPackageTitleForCalendar() {
      const heading =
        document.querySelector(".package-body-main h1") ||
        document.querySelector(".left h1") ||
        document.querySelector("h1");
      return heading?.textContent?.trim() || "Your selected package";
    }

    function triponInitLuxuryBookingDate() {
      if (!bookingCardRoot || !bookingDateInput || bookingDateInput.type !== "date") {
        return;
      }

      const row = bookingDateInput.closest(".input-box");
      triponEnsurePickerToggleButton(row, bookingDateInput);

      bookingDateInput.min = getTodayDateString();

      const validateBookingDate = () => {
        if (!bookingDateInput.value) {
          bookingDateInput.setCustomValidity("");
          return;
        }
        if (bookingDateInput.value < bookingDateInput.min) {
          bookingDateInput.setCustomValidity("Invalid date. Please select a future date.");
          return;
        }
        bookingDateInput.setCustomValidity("");
      };

      validateBookingDate();
      bookingDateInput.addEventListener("input", validateBookingDate);
      bookingDateInput.addEventListener("change", validateBookingDate);

      const { amount: basePrice } = parseCurrencyAmount(packageStartPriceNode?.textContent);
      const durationRaw = document.body?.dataset?.packageDuration || "";
      const packageDuration = durationRaw.replace(/-/g, " ");

      window.TriponLuxuryCalendar.attach(bookingDateInput, {
        basePrice: basePrice > 0 ? basePrice : 1200,
        currencySymbol,
        packageName: triponGetPackageTitleForCalendar(),
        packageDuration,
        minDate: getTodayDateString(),
        onSelect: () => {
          validateBookingDate();
          bookingTimeInput?._luxuryTimePicker?.renderSlots();
          bookingTimeInput?._luxuryTimePicker?.updateSummary();
          updateTotal();
        },
        onOpen: () => bookingTimeInput?._luxuryTimePicker?.close(),
      });

      triponLinkLuxuryPickers();
    }

    const triponOpenBookingPicker = (input) => {
      if (!input) {
        return;
      }
      input.focus({ preventScroll: true });
      try {
        if (typeof input.showPicker === "function") {
          input.showPicker();
          return;
        }
      } catch (_) {
        // showPicker can throw if not allowed; fall back to click()
      }
      input.click();
    };

    const triponEnsurePickerToggleButton = (row, input) => {
      const existing = row.querySelector("[data-tripon-picker-toggle]");
      if (existing) {
        return existing;
      }
      const icon = row.querySelector(".input-box-dropdown-icon");
      if (!icon) {
        return null;
      }
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = icon.className;
      btn.classList.add("input-box-picker-toggle");
      btn.dataset.triponPickerToggle = "1";
      btn.setAttribute(
        "aria-label",
        input.type === "time" ? "Toggle time picker" : "Toggle date picker"
      );
      btn.setAttribute("aria-expanded", "false");
      btn.innerHTML = icon.innerHTML;
      icon.replaceWith(btn);
      return btn;
    };

    const triponBindBookingPickerRow = (input) => {
      const row = input?.closest(".input-box");
      if (!row) {
        return;
      }

      const toggleBtn = triponEnsurePickerToggleButton(row, input);
      let pickerOpen = false;
      let outsideListener = null;

      const setPickerOpen = (open) => {
        pickerOpen = Boolean(open);
        row.classList.toggle("is-picker-open", pickerOpen);
        row.setAttribute("aria-expanded", pickerOpen ? "true" : "false");
        if (toggleBtn) {
          toggleBtn.setAttribute("aria-expanded", pickerOpen ? "true" : "false");
        }
      };

      const removeOutsideListener = () => {
        if (!outsideListener) {
          return;
        }
        document.removeEventListener("pointerdown", outsideListener, true);
        outsideListener = null;
      };

      const closePicker = () => {
        removeOutsideListener();
        setPickerOpen(false);
        try {
          if (typeof input.hidePicker === "function") {
            input.hidePicker();
          }
        } catch (_) {
          // hidePicker unsupported or not allowed in this context
        }
        if (document.activeElement === input) {
          input.blur();
        }
      };

      const openPicker = () => {
        setPickerOpen(true);
        triponOpenBookingPicker(input);

        outsideListener = (event) => {
          if (row.contains(event.target)) {
            return;
          }
          closePicker();
        };

        requestAnimationFrame(() => {
          document.addEventListener("pointerdown", outsideListener, true);
        });
      };

      const handleTogglePointerDown = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (pickerOpen) {
          closePicker();
          return;
        }
        openPicker();
      };

      const handleRowClick = (event) => {
        if (event.target.closest("[data-tripon-picker-toggle], .input-box-dropdown-icon")) {
          return;
        }
        if (event.target === input) {
          if (pickerOpen) {
            event.preventDefault();
            closePicker();
          } else {
            openPicker();
          }
          return;
        }
        event.preventDefault();
        if (pickerOpen) {
          closePicker();
          return;
        }
        openPicker();
      };

      if (toggleBtn) {
        toggleBtn.addEventListener("pointerdown", handleTogglePointerDown);
      }
      row.addEventListener("click", handleRowClick);

      input.addEventListener("change", closePicker);
      input.addEventListener("cancel", closePicker);
      input.addEventListener("blur", () => {
        window.setTimeout(() => {
          if (document.activeElement !== input) {
            closePicker();
          }
        }, 0);
      });
    };

    // Update total
    function updateTotal() {
      computeTravelerRates();

      let total = 0;

      values.forEach((val, i) => {
        total += val * prices[i];
      });

      const travelerCount = values.reduce((sum, n) => sum + n, 0);
      extras.forEach((extra) => {
        if (!extra.checked) {
          return;
        }
        const amount = Number(extra.value) || 0;
        const basis = extra.getAttribute("data-extra-basis") || "booking";
        if (basis === "person") {
          total += amount * (travelerCount > 0 ? travelerCount : 1);
        } else {
          total += amount;
        }
      });

      if (totalPrice) {
        totalPrice.classList.add("is-updating");
        totalPrice.textContent = formatPrice(total);
        totalPrice.classList.remove("is-updated");
        void totalPrice.offsetWidth;
        totalPrice.classList.add("is-updated");
        window.setTimeout(() => totalPrice.classList.remove("is-updating"), 320);
      }

      updateBookingSummary();
      bookingTimeInput?._luxuryTimePicker?.updateSummary();
    }

    // Plus / minus ticket counters
    counts.forEach((node, i) => {
      if (node) {
        node.dataset.value = String(values[i] || 0);
      }
    });

    plusBtns.forEach((btn, i) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        setTicketCount(i, values[i] + 1);
        updateTotal();
      });
    });

    minusBtns.forEach((btn, i) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (values[i] > 0) {
          setTicketCount(i, values[i] - 1);
          updateTotal();
        }
      });
    });

    bookingDateInput?.addEventListener("change", updateTotal);
    bookingDateInput?.addEventListener("input", updateTotal);
    bookingTimeInput?.addEventListener("change", updateTotal);
    bookingTimeInput?.addEventListener("input", updateTotal);

    extras.forEach((extra) => {
      extra.addEventListener("change", updateTotal);
    });

    window.triponRefreshBookingTicketPrices = () => {
      updateTotal();
      const luxCal = bookingDateInput?._luxuryCalendar;
      if (luxCal) {
        const { amount } = parseCurrencyAmount(packageStartPriceNode?.textContent);
        if (amount > 0) {
          luxCal.basePrice = amount;
          luxCal.renderMonth();
          luxCal.updateSelectionFooter();
        }
      }
    };

    if (totalPrice) {
      window.triponRefreshBookingTicketPrices();
    }

    function openBookingSubmitPopup() {
      if (!bookingSubmitPopup) return;
      bookingSubmitPopup.classList.add("active");
      bookingSubmitPopup.setAttribute("aria-hidden", "false");
    }

    function closeBookingSubmitPopup() {
      if (!bookingSubmitPopup) return;
      bookingSubmitPopup.classList.remove("active");
      bookingSubmitPopup.setAttribute("aria-hidden", "true");
    }

    bookingSubmitPopupClose?.addEventListener("click", closeBookingSubmitPopup);
    bookingSubmitPopupIconClose?.addEventListener("click", closeBookingSubmitPopup);
    bookingSubmitPopup?.addEventListener("click", (event) => {
      if (event.target === bookingSubmitPopup) {
        closeBookingSubmitPopup();
      }
    });

    const resetPackageBookButton = () => {
      if (!bookingButton) {
        return;
      }
      bookingButton.disabled = false;
      bookingButton.classList.remove("is-booking", "is-booked");
      bookingButton.innerHTML = 'Book Now <span class="book-arrow">↗</span>';
    };

    const openPackageBookingModal = () => {
      const mobilePrefModal = document.getElementById("mobilePrefModal");
      if (typeof window.triponShowMobilePrefModal === "function") {
        window.triponShowMobilePrefModal();
        return;
      }
      if (!mobilePrefModal) {
        openBookingSubmitPopup();
        return;
      }
      mobilePrefModal.classList.add("active");
      mobilePrefModal.setAttribute("aria-hidden", "false");
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    };

    bookingButton?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (bookingDateInput?.valueMissing) {
        bookingDateInput.reportValidity();
        const luxCal = bookingDateInput._luxuryCalendar;
        if (luxCal?.open) {
          luxCal.open();
          luxCal.trigger?.focus();
        } else {
          bookingDateInput.focus();
        }
        return;
      }
      if (bookingTimeInput && bookingTimeInput.hasAttribute("required") && bookingTimeInput.valueMissing) {
        bookingTimeInput.reportValidity();
        const luxTime = bookingTimeInput._luxuryTimePicker;
        if (luxTime?.open) {
          luxTime.open();
          luxTime.trigger?.focus();
        } else {
          bookingTimeInput.focus();
        }
        return;
      }

      resetPackageBookButton();
      openPackageBookingModal();
    });

    const packagePrefModal = document.getElementById("mobilePrefModal");
    if (packagePrefModal) {
      const watchPrefModalClosed = new MutationObserver(() => {
        if (!packagePrefModal.classList.contains("active")) {
          resetPackageBookButton();
        }
      });
      watchPrefModalClosed.observe(packagePrefModal, { attributes: true, attributeFilter: ["class"] });
    }



    if (bookingCardRoot && bookingDateInput && bookingDateInput.type === "date") {
      try {
        triponInitLuxuryBookingDate();
      } catch (_) {
        bookingDateInput.min = getTodayDateString();
        triponBindBookingPickerRow(bookingDateInput);
      }
    }

    if (bookingCardRoot && bookingTimeInput) {
      try {
        triponInitLuxuryBookingTime();
      } catch (_) {
        triponBindBookingPickerRow(bookingTimeInput);
      }
    }

    applyDynamicTicketPricing();
    if (typeof updateTotal === "function") {
      updateTotal();
    }
  }

  /* ========== Share & bestseller popups ========== */
  
  function initPackageDetailsSharePopup() {
    const shareOverlay = document.getElementById("sharePopup");
    const shareCloseBtn = document.getElementById("sharePopupClose");
    const shareCopyBtn = document.getElementById("shareCopyBtn");
    const shareLinkInput = document.getElementById("shareLinkInput");
    if (!shareOverlay || !shareCloseBtn || !shareCopyBtn || !shareLinkInput) return;
  
    shareLinkInput.value = window.location.href;
    const shareSearchInput = document.getElementById("shareSearchInput");
    const appRows = shareOverlay.querySelectorAll(".share-app-row");
  
    const openSharePopup = () => {
      shareOverlay.classList.add("active");
      document.body.style.overflow = "hidden";
      if (shareSearchInput) {
        shareSearchInput.value = "";
        appRows.forEach((row) => {
          row.style.display = "";
        });
      }
    };
  
    const closeSharePopup = () => {
      shareOverlay.classList.remove("active");
      document.body.style.overflow = "";
    };
  
    const origShareBtn = document.getElementById("shareBtn");
    if (origShareBtn) {
      const newBtn = origShareBtn.cloneNode(true);
      origShareBtn.parentNode.replaceChild(newBtn, origShareBtn);
      newBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openSharePopup();
      });
    }
  
    shareCloseBtn.addEventListener("click", closeSharePopup);
    shareOverlay.addEventListener("click", (e) => {
      if (e.target === shareOverlay) closeSharePopup();
    });
  
    if (shareSearchInput) {
      shareSearchInput.addEventListener("input", () => {
        const query = shareSearchInput.value.trim().toLowerCase();
        appRows.forEach((row) => {
          const name = row.querySelector("span")?.textContent.toLowerCase() || "";
          row.style.display = name.includes(query) ? "" : "none";
        });
      });
    }
  
    const markCopied = () => {
      shareCopyBtn.textContent = "Copied!";
      setTimeout(() => {
        shareCopyBtn.textContent = "Copy";
      }, 2000);
    };
  
    shareCopyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(shareLinkInput.value).then(markCopied);
    });
  
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent("Check out this amazing tour!");
  
    shareOverlay.querySelectorAll(".share-app-row").forEach((row) => {
      row.addEventListener("click", (e) => {
        e.preventDefault();
        const type = row.getAttribute("data-share");
        let link = "";
        switch (type) {
          case "whatsapp":
            link = `https://wa.me/?text=${text}%20${url}`;
            break;
          case "telegram":
            link = `https://t.me/share/url?url=${url}&text=${text}`;
            break;
          case "gmail":
            link = `https://mail.google.com/mail/?view=cm&su=${text}&body=${url}`;
            break;
          case "instagram":
            link = "https://www.instagram.com/";
            break;
          case "facebook":
            link = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            break;
          case "twitter":
            link = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
            break;
          case "copy":
            navigator.clipboard.writeText(window.location.href).then(markCopied);
            return;
          default:
            break;
        }
        if (link) window.open(link, "_blank");
      });
    });
  }
  
  function initPackageDetailsBestsellerPopup() {
    const badge = document.getElementById("bestsellerBadge");
    const popup = document.getElementById("bestsellerPopup");
    if (!badge || !popup) return;
  
    const categories = {
      beach: {
        icon: "fa-solid fa-umbrella-beach",
        title: "Top Beach Experience",
        sub: "A coastal paradise travelers love",
        reasons: [
          { icon: "fa-solid fa-water", text: "Crystal-clear waters & white sand" },
          { icon: "fa-solid fa-fish", text: "Snorkeling & marine life encounters" },
          { icon: "fa-solid fa-sailboat", text: "Island hopping adventures" },
          { icon: "fa-regular fa-star", text: "Rated 4.8+ by 12K travelers" },
          { icon: "fa-regular fa-heart", text: "Couples & honeymoon favorite" }
        ],
        stats: [
          { icon: "fa-solid fa-star", value: "4.8", label: "Rating" },
          { icon: "fa-solid fa-users", value: "30K+", label: "Bookings" },
          { icon: "fa-solid fa-sun", value: "#1", label: "Beach trip" }
        ],
        tags: ["Island Hopping", "Snorkeling", "Couples Favorite", "Scenic Views"]
      },
      adventure: {
        icon: "fa-solid fa-person-hiking",
        title: "Top Adventure Pick",
        sub: "Thrill-seekers can\u2019t get enough",
        reasons: [
          { icon: "fa-solid fa-mountain", text: "Thrilling outdoor activities" },
          { icon: "fa-solid fa-bolt", text: "Adrenaline-pumping experiences" },
          { icon: "fa-solid fa-route", text: "Expert-guided excursions" },
          { icon: "fa-regular fa-star", text: "Rated 4.7+ by adventure lovers" },
          { icon: "fa-solid fa-users", text: "Youth & group favorite" }
        ],
        stats: [
          { icon: "fa-solid fa-star", value: "4.7", label: "Rating" },
          { icon: "fa-solid fa-users", value: "22K+", label: "Bookings" },
          { icon: "fa-solid fa-fire-flame-curved", value: "Trending", label: "this month" }
        ],
        tags: ["Outdoor", "Thrilling", "Youth Favorite", "Guided Tour"]
      },
      honeymoon: {
        icon: "fa-solid fa-heart",
        title: "Honeymoon Favorite",
        sub: "Perfectly romantic getaway",
        reasons: [
          { icon: "fa-solid fa-champagne-glasses", text: "Romantic luxury experience" },
          { icon: "fa-regular fa-sun", text: "Stunning sunset & sunrise views" },
          { icon: "fa-solid fa-spa", text: "Couple-friendly spa & dining" },
          { icon: "fa-regular fa-star", text: "Rated 4.9 by honeymooners" },
          { icon: "fa-solid fa-gem", text: "Premium handpicked stays" }
        ],
        stats: [
          { icon: "fa-solid fa-star", value: "4.9", label: "Rating" },
          { icon: "fa-solid fa-heart", value: "18K+", label: "Couples" },
          { icon: "fa-solid fa-gem", value: "Premium", label: "experience" }
        ],
        tags: ["Romantic", "Sunset Views", "Luxury Stay", "Couple-Friendly"]
      },
      city: {
        icon: "fa-solid fa-city",
        title: "Top City Experience",
        sub: "Most popular urban exploration",
        reasons: [
          { icon: "fa-solid fa-landmark", text: "Iconic attractions & landmarks" },
          { icon: "fa-solid fa-map-location-dot", text: "Expert-guided walking tours" },
          { icon: "fa-solid fa-utensils", text: "Local food & culture immersion" },
          { icon: "fa-regular fa-star", text: "Rated 4.7 by first-time visitors" },
          { icon: "fa-solid fa-camera", text: "Instagram-worthy photo spots" }
        ],
        stats: [
          { icon: "fa-solid fa-star", value: "4.7", label: "Rating" },
          { icon: "fa-solid fa-users", value: "25K+", label: "Bookings" },
          { icon: "fa-solid fa-ranking-star", value: "#1", label: "City tour" }
        ],
        tags: ["Guided Tour", "Landmarks", "Culture", "First-Timer Friendly"]
      },
      family: {
        icon: "fa-solid fa-people-roof",
        title: "Family Favorite",
        sub: "Safe, fun & kid-approved",
        reasons: [
          { icon: "fa-solid fa-child-reaching", text: "Kid-friendly activities included" },
          { icon: "fa-solid fa-shield-halved", text: "Safe & well-organized itinerary" },
          { icon: "fa-solid fa-people-group", text: "Group activities for all ages" },
          { icon: "fa-regular fa-star", text: "Rated 4.8 by families" },
          { icon: "fa-regular fa-face-smile", text: "Hassle-free family experience" }
        ],
        stats: [
          { icon: "fa-solid fa-star", value: "4.8", label: "Rating" },
          { icon: "fa-solid fa-users", value: "20K+", label: "Families" },
          { icon: "fa-solid fa-award", value: "Top", label: "family pick" }
        ],
        tags: ["Kid-Friendly", "Safe", "Group Fun", "All Ages"]
      }
    };
  
    const beachWords = ["beach", "island", "snorkel", "coast", "sea", "ocean", "marine", "coral", "phi phi", "bay", "lagoon", "water", "shore", "surf", "dive", "reef", "tropical"];
    const adventureWords = ["adventure", "trek", "hike", "climb", "zip", "raft", "safari", "jungle", "expedition", "thrill", "extreme", "kayak", "bungee", "canyon"];
    const honeymoonWords = ["honeymoon", "romantic", "couple", "romance", "sunset cruise", "luxury retreat", "spa", "candlelight"];
    const cityWords = ["city", "walking tour", "museum", "temple", "palace", "market", "street", "downtown", "heritage", "monument", "landmark", "cathedral", "gallery"];
    const familyWords = ["family", "kids", "child", "waterpark", "zoo", "theme park", "amusement", "playground", "picnic"];
  
    const detectCategory = () => {
      const title = document.querySelector(".title-section h1")?.textContent || "";
      const overview = document.querySelector(".left p")?.textContent || "";
      const highlights = document.querySelector(".left ul")?.textContent || "";
      const blob = `${title} ${overview} ${highlights}`.toLowerCase();
      const scores = { beach: 0, adventure: 0, honeymoon: 0, city: 0, family: 0 };
      const tally = (words, key) => {
        words.forEach((w) => {
          if (blob.includes(w)) scores[key] += 1;
        });
      };
      tally(beachWords, "beach");
      tally(adventureWords, "adventure");
      tally(honeymoonWords, "honeymoon");
      tally(cityWords, "city");
      tally(familyWords, "family");
      let best = "beach";
      let max = 0;
      Object.keys(scores).forEach((k) => {
        if (scores[k] > max) {
          max = scores[k];
          best = k;
        }
      });
      return best;
    };
  
    const data = categories[detectCategory()];
  
    const bsPopupIcon = document.getElementById("bsPopupIcon");
    const bsPopupTitle = document.getElementById("bsPopupTitle");
    const bsPopupSub = document.getElementById("bsPopupSub");
    const listEl = document.getElementById("bsPopupList");
    const statsEl = document.getElementById("bsPopupStats");
    const tagsEl = document.getElementById("bsPopupTags");
  
    if (bsPopupIcon) bsPopupIcon.innerHTML = `<i class="${data.icon}"></i>`;
    if (bsPopupTitle) bsPopupTitle.textContent = data.title;
    if (bsPopupSub) bsPopupSub.textContent = data.sub;
    if (listEl) {
      listEl.innerHTML = data.reasons
        .map((r) => `<li><i class="${r.icon}"></i><span>${r.text}</span></li>`)
        .join("");
    }
    if (statsEl) {
      statsEl.innerHTML = data.stats
        .map((s) => `<div class="bestseller-stat"><i class="${s.icon}"></i><strong>${s.value}</strong> ${s.label}</div>`)
        .join("");
    }
    if (tagsEl) {
      tagsEl.innerHTML = data.tags.map((t) => `<span class="bestseller-tag">${t}</span>`).join("");
    }
  
    badge.addEventListener("click", (e) => {
      e.stopPropagation();
      popup.classList.toggle("active");
    });
  
    document.addEventListener("click", (e) => {
      if (!popup.contains(e.target) && e.target !== badge && !badge.contains(e.target)) {
        popup.classList.remove("active");
      }
    });
  }
  

  /* ========== Package gallery: deck stack lightbox ========== */
  function getActiveGalleryImages() {
    return Array.from(document.querySelectorAll(".image-grid .gallery-img")).filter(
      (img) => !img.classList.contains("gallery-img--empty") && img.style.display !== "none" && img.getAttribute("src")
    );
  }

  function triponUpgradePackageLightbox(modal) {
    if (!modal) {
      return modal;
    }
    if (modal.querySelector("[data-pkg-single]") && modal.querySelector("[data-pkg-track]")) {
      return modal;
    }
    modal.querySelector("#lightbox-img")?.remove();
    modal.querySelector(".pkg-gallery__stage")?.remove();
    const stage = document.createElement("div");
    stage.className = "pkg-gallery__stage";
    stage.innerHTML = `
      <div class="pkg-gallery__backdrop" data-pkg-dismiss tabindex="-1" aria-hidden="true"></div>
      <div class="pkg-gallery__single" data-pkg-single aria-hidden="true">
        <img data-pkg-single-img src="" alt="" decoding="async" draggable="false" />
      </div>
      <div class="pkg-gallery__viewport" data-pkg-viewport tabindex="0" role="region" aria-label="Package photo gallery">
        <div class="pkg-gallery__track" data-pkg-track></div>
      </div>`;
    const prevBtn = modal.querySelector(".prev");
    modal.insertBefore(stage, prevBtn || null);
    modal.classList.add("pkg-gallery-lightbox");
    modal.setAttribute("aria-hidden", "true");
    modal.dataset.pkgGalleryReady = "1";
    return modal;
  }

  function initPackageGalleryLightbox() {
    const lightbox = triponUpgradePackageLightbox(document.getElementById("lightbox"));
    const track = lightbox?.querySelector("[data-pkg-track]");
    const viewport = lightbox?.querySelector("[data-pkg-viewport]");
    const singleWrap = lightbox?.querySelector("[data-pkg-single]");
    const singleImg = lightbox?.querySelector("[data-pkg-single-img]");
    const countEl = document.getElementById("lightbox-count");
    const progressFill = document.getElementById("lightbox-progress-fill");
    const playBtn = document.getElementById("lightbox-play");
    const hintEl = document.getElementById("lightbox-fullscreen-hint");
    const imageGrid = document.querySelector(".image-grid");

    if (!lightbox || !track || !viewport) {
      return;
    }

    let slides = [];
    let currentIndex = 0;
    let returnFocus = null;
    let dragStartX = 0;
    let dragDeltaX = 0;
    let isDragging = false;
    let pointerActive = false;
    let isSlideshowPlaying = false;
    let slideshowFrameId = null;
    let slideshowStartTime = 0;
    let hintTimeout = null;
    const slideDurationMs = 1000;
    const dragThreshold = 10;

    const normalize = (i, n) => ((i % n) + n) % n;

    const relativeOffset = (slideIndex, center, total) => {
      let diff = slideIndex - center;
      const half = Math.floor(total / 2);
      if (diff > half) diff -= total;
      if (diff < -half) diff += total;
      return diff;
    };

    const cardWidth = () => slides[0]?.offsetWidth || Math.min(720, Math.max(300, window.innerWidth * 0.62));

    const setProgress = (value) => {
      if (!progressFill) return;
      progressFill.style.width = `${Math.max(0, Math.min(100, value))}%`;
    };

    const showHint = () => {
      if (!hintEl) return;
      hintEl.classList.add("show");
      if (hintTimeout) window.clearTimeout(hintTimeout);
      hintTimeout = window.setTimeout(() => hintEl.classList.remove("show"), 2300);
    };

    const hideHint = () => {
      hintEl?.classList.remove("show");
      if (hintTimeout) {
        window.clearTimeout(hintTimeout);
        hintTimeout = null;
      }
    };

    const lockScroll = () => {
      document.body.classList.add("gallery-lightbox-open");
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    };

    const unlockScroll = () => {
      document.body.classList.remove("gallery-lightbox-open");
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };

    const updateDots = () => {
      if (typeof updateImageGridDots === "function") {
        updateImageGridDots(currentIndex);
      }
    };

    const updateStack = (dragPx = 0) => {
      const list = getActiveGalleryImages();
      const total = list.length;
      if (!total || !slides.length) return;

      const spacing = cardWidth() * 0.54;
      const dragNudge = dragPx * 0.22;

      slides.forEach((slide) => {
        const i = Number(slide.dataset.slideIndex);
        const diff = relativeOffset(i, currentIndex, total);
        const abs = Math.abs(diff);
        const tx = diff * spacing + (diff === 0 ? dragNudge : dragNudge * 0.4);
        const ty = abs * 18 + (diff === 0 ? 0 : 8);
        const ry = diff * -18;
        const rz = diff * -4;
        const tz = diff === 0 ? 140 : -abs * 70;
        const scale = diff === 0 ? 1 : abs === 1 ? 0.84 : abs === 2 ? 0.7 : 0.58;
        const opacity = abs > 3 ? 0 : diff === 0 ? 1 : abs === 1 ? 0.88 : abs === 2 ? 0.55 : 0.28;

        slide.style.transform = `translate3d(${tx}px, ${ty}px, ${tz}px) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${scale})`;
        slide.style.opacity = String(opacity);
        slide.style.zIndex = String(30 - abs);
        slide.classList.toggle("is-active", diff === 0);
        slide.classList.toggle("is-side", abs === 1);
        slide.style.pointerEvents = abs <= 2 ? "auto" : "none";
      });

      if (countEl) {
        countEl.textContent = `${currentIndex + 1} / ${total}`;
      }
      updateDots();
    };

    const layoutStack = (dragPx = 0) => {
      requestAnimationFrame(() => updateStack(dragPx));
    };

    const buildSlides = () => {
      const list = getActiveGalleryImages();
      track.textContent = "";
      list.forEach((img, index) => {
        const slide = document.createElement("article");
        slide.className = "pkg-gallery__slide";
        slide.dataset.slideIndex = String(index);
        const alt = (img.getAttribute("alt") || "Package photo").replace(/"/g, "&quot;");
        slide.innerHTML = `
          <div class="pkg-gallery__card">
            <div class="pkg-gallery__frame">
              <img src="${img.currentSrc || img.src}" alt="${alt}" decoding="async" draggable="false" />
            </div>
          </div>`;
        slide.addEventListener("click", () => {
          if (isDragging) return;
          const idx = Number(slide.dataset.slideIndex);
          if (!Number.isNaN(idx) && idx !== currentIndex) goTo(idx);
        });
        track.appendChild(slide);
      });
      slides = Array.from(track.querySelectorAll(".pkg-gallery__slide"));
      const imgs = track.querySelectorAll("img");
      let pending = imgs.length;
      const done = () => {
        pending -= 1;
        if (pending <= 0) layoutStack(0);
      };
      if (!pending) layoutStack(0);
      else imgs.forEach((img) => {
        if (img.complete) done();
        else {
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
        }
      });
    };

    const goTo = (index) => {
      const total = getActiveGalleryImages().length;
      if (!total || !slides.length) return;
      currentIndex = normalize(index, total);
      layoutStack(0);
    };

    const stopSlideshow = (reset = true) => {
      isSlideshowPlaying = false;
      if (slideshowFrameId) {
        window.cancelAnimationFrame(slideshowFrameId);
        slideshowFrameId = null;
      }
      if (playBtn) {
        playBtn.innerHTML = "&#9658;";
        playBtn.setAttribute("aria-label", "Start slideshow");
      }
      if (reset) setProgress(0);
    };

    const runSlideshow = (timestamp) => {
      if (!isSlideshowPlaying) return;
      if (!slideshowStartTime) slideshowStartTime = timestamp;
      const elapsed = timestamp - slideshowStartTime;
      setProgress((elapsed / slideDurationMs) * 100);
      if (elapsed >= slideDurationMs) {
        const total = getActiveGalleryImages().length;
        if (currentIndex >= total - 1) {
          stopSlideshow(false);
          return;
        }
        goTo(currentIndex + 1);
        slideshowStartTime = 0;
        setProgress(0);
      }
      slideshowFrameId = window.requestAnimationFrame(runSlideshow);
    };

    const startSlideshow = () => {
      const total = getActiveGalleryImages().length;
      if (total <= 1) return;
      currentIndex = 0;
      goTo(0);
      isSlideshowPlaying = true;
      if (playBtn) {
        playBtn.innerHTML = "&#10074;&#10074;";
        playBtn.setAttribute("aria-label", "Pause slideshow");
      }
      slideshowStartTime = 0;
      setProgress(0);
      slideshowFrameId = window.requestAnimationFrame(runSlideshow);
    };

    const setPlayVisible = (show) => {
      if (!playBtn) return;
      playBtn.style.display = show ? "inline-flex" : "none";
      if (!show) stopSlideshow(true);
    };

    const setGalleryMode = (mode) => {
      lightbox.classList.toggle("is-mode-stack", mode === "stack");
      lightbox.classList.toggle("is-mode-single", mode === "single");
      if (singleWrap) {
        singleWrap.setAttribute("aria-hidden", mode === "single" ? "false" : "true");
      }
    };

    const applyOriginVars = (originEl) => {
      if (!(originEl instanceof Element)) return;
      const rect = originEl.getBoundingClientRect();
      lightbox.style.setProperty("--origin-x", `${rect.left + rect.width / 2}px`);
      lightbox.style.setProperty("--origin-y", `${rect.top + rect.height / 2}px`);
      lightbox.style.setProperty("--origin-w", `${Math.max(rect.width, 1)}px`);
      lightbox.style.setProperty("--origin-h", `${Math.max(rect.height, 1)}px`);
    };

    const mountLightbox = () => {
      lightbox.classList.remove("is-closing");
      lightbox.classList.add("is-mounting");
      lightbox.style.display = "flex";
      lightbox.setAttribute("aria-hidden", "false");
      lockScroll();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => lightbox.classList.add("is-open"));
      });
    };

    const openStackGallery = (index = 0, originEl = null) => {
      const list = getActiveGalleryImages();
      if (!list.length) return;

      setGalleryMode("stack");
      buildSlides();
      currentIndex = normalize(index, list.length);
      returnFocus = document.activeElement;
      applyOriginVars(originEl);

      if (singleImg) {
        singleImg.removeAttribute("src");
      }

      mountLightbox();
      layoutStack(0);
      setPlayVisible(list.length > 1);
      showHint();
    };

    const openSingleGallery = (originImg) => {
      if (!singleImg) return;

      setGalleryMode("single");
      track.textContent = "";
      slides = [];
      stopSlideshow(true);
      setPlayVisible(false);

      singleImg.src = originImg.currentSrc || originImg.src;
      singleImg.alt = originImg.getAttribute("alt") || "Package photo";
      if (countEl) {
        countEl.textContent = "1 / 1";
      }

      returnFocus = document.activeElement;
      applyOriginVars(originImg);
      mountLightbox();
      hideHint();
    };

    const closeLightbox = () => {
      if (!lightbox.classList.contains("is-open") && !lightbox.classList.contains("is-mounting")) return;
      lightbox.classList.remove("is-open", "is-ui-ready");
      lightbox.classList.add("is-closing");
      stopSlideshow(true);
      hideHint();

      window.setTimeout(() => {
        lightbox.classList.remove("is-mounting", "is-closing", "is-mode-stack", "is-mode-single");
        lightbox.style.display = "none";
        lightbox.setAttribute("aria-hidden", "true");
        track.textContent = "";
        slides = [];
        singleImg?.removeAttribute("src");
        unlockScroll();
        const back = returnFocus;
        returnFocus = null;
        if (back instanceof HTMLElement && document.contains(back)) {
          back.focus({ preventScroll: true });
        }
      }, 720);
    };

    const step = (delta) => {
      if (!lightbox.classList.contains("is-mode-stack")) return;
      const total = getActiveGalleryImages().length;
      if (total < 2) return;
      if (!slides.length) buildSlides();
      goTo(currentIndex + delta);
      if (isSlideshowPlaying) startSlideshow();
    };

    imageGrid?.addEventListener("click", (event) => {
      const viewMoreCard = event.target.closest(".side-image-preview-card");
      if (viewMoreCard) {
        event.stopPropagation();
        const cardImg = viewMoreCard.querySelector(".gallery-img");
        openStackGallery(0, cardImg || viewMoreCard);
        return;
      }

      const img = event.target.closest(".gallery-img");
      if (!img || img.classList.contains("gallery-img--empty")) return;
      if (img.closest(".side-image-preview-card")) return;

      event.stopPropagation();
      openSingleGallery(img);
    });

    lightbox.querySelector(".close")?.addEventListener("click", (e) => {
      e.stopPropagation();
      closeLightbox();
    });
    lightbox.querySelector(".prev")?.addEventListener("click", (e) => {
      e.stopPropagation();
      step(-1);
    });
    lightbox.querySelector(".next")?.addEventListener("click", (e) => {
      e.stopPropagation();
      step(1);
    });
    lightbox.querySelector("[data-pkg-dismiss]")?.addEventListener("click", closeLightbox);

    playBtn?.addEventListener("click", () => {
      if (isSlideshowPlaying) {
        stopSlideshow(false);
        return;
      }
      startSlideshow();
    });

    document.addEventListener("keydown", (event) => {
      if (!lightbox.classList.contains("is-open")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
      } else if (lightbox.classList.contains("is-mode-stack")) {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          step(-1);
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          step(1);
        }
      }
    });

    window.addEventListener(
      "resize",
      () => {
        if (lightbox.classList.contains("is-open")) layoutStack(0);
      },
      { passive: true }
    );

    const onPointerDown = (e) => {
      if (!lightbox.classList.contains("is-open") || !lightbox.classList.contains("is-mode-stack") || e.button > 0) {
        return;
      }
      if (e.target.closest(".lightbox-top-controls, .close, .prev, .next, .lightbox-play")) return;
      pointerActive = true;
      isDragging = false;
      dragStartX = e.clientX;
      dragDeltaX = 0;
    };

    const onPointerMove = (e) => {
      if (!pointerActive) return;
      dragDeltaX = e.clientX - dragStartX;
      if (!isDragging && Math.abs(dragDeltaX) < dragThreshold) return;
      if (!isDragging) {
        isDragging = true;
        viewport.setPointerCapture(e.pointerId);
      }
      updateStack(dragDeltaX);
    };

    const onPointerUp = (e) => {
      if (!pointerActive) return;
      pointerActive = false;
      if (viewport.hasPointerCapture(e.pointerId)) viewport.releasePointerCapture(e.pointerId);
      if (isDragging) {
        const th = Math.min(72, cardWidth() * 0.2);
        if (dragDeltaX <= -th) step(1);
        else if (dragDeltaX >= th) step(-1);
        else layoutStack(0);
      }
      isDragging = false;
      dragDeltaX = 0;
    };

    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointermove", onPointerMove);
    viewport.addEventListener("pointerup", onPointerUp);
    viewport.addEventListener("pointercancel", onPointerUp);
  }

  function triponInitPackageDetailsPage() {
    initPackageDetailsPageContent();
    initPackageDetailsBookingCard();
    initPackageDetailsSharePopup();
    initPackageDetailsBestsellerPopup();
    initPackageGalleryLightbox();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", triponInitPackageDetailsPage);
  } else {
    triponInitPackageDetailsPage();
  }

  g.triponInitPackageDetailsPage = triponInitPackageDetailsPage;
})(typeof window !== "undefined" ? window : globalThis);
