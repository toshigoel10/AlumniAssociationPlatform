/* ============================================================
   ALUMNI CONNECT — SHARED SCRIPT
   Small, dependency-free helpers used across every page.
   Organized in sections so it's easy to find what you need.
   ============================================================ */

/* ---------- 1. NAVBAR SCROLL SHADOW ---------- */
function initNavbarScroll() {
  const nav = document.querySelector(".site-navbar");
  if (!nav) return;
  const onScroll = () => {
    nav.style.boxShadow = window.scrollY > 8
      ? "0 4px 20px rgba(11,61,145,0.10)"
      : "0 1px 0 var(--border)";
  };
  window.addEventListener("scroll", onScroll);
  onScroll();
}

/* ---------- 2. SCROLL REVEAL ---------- */
function initScrollReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach((item) => observer.observe(item));
}

/* ---------- 3. NETWORK MOTIF (SVG generator) ----------
   Draws the dotted node/line graph used in the hero and dividers.
   Generated with JS (rather than a static image) so it can be
   reused at any size across pages with slight randomised variation. */
function drawNetworkField(containerId, nodeCount = 26) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const w = 1000, h = 700;
  const points = Array.from({ length: nodeCount }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
  }));

  let lines = "";
  points.forEach((p, i) => {
    // connect each point to its 2 nearest neighbours for an organic web
    const distances = points
      .map((q, j) => ({ j, d: Math.hypot(p.x - q.x, p.y - q.y) }))
      .filter((o) => o.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);
    distances.forEach((o) => {
      const q = points[o.j];
      lines += `<line x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}" />`;
    });
  });

  let nodes = "";
  points.forEach((p, i) => {
    const isPulse = i % 6 === 0;
    nodes += `<circle class="node ${isPulse ? "pulse" : ""}" cx="${p.x}" cy="${p.y}" r="${isPulse ? 4 : 2.5}" />`;
  });

  el.innerHTML = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice">${lines}${nodes}</svg>`;
}

/* ---------- 4. SIDEBAR TOGGLE (app shell pages) ---------- */
function initSidebarToggle() {
  const toggleBtns = document.querySelectorAll(".sidebar-toggle-btn");
  const sidebar = document.querySelector(".app-sidebar");
  const backdrop = document.querySelector(".sidebar-backdrop");
  if (!sidebar) return;
  const close = () => { sidebar.classList.remove("show"); backdrop?.classList.remove("show"); };
  toggleBtns.forEach((btn) => btn.addEventListener("click", () => {
    sidebar.classList.toggle("show");
    backdrop?.classList.toggle("show");
  }));
  backdrop?.addEventListener("click", close);
}

/* ---------- 5. ACTIVE SIDEBAR / NAV LINK ---------- */
function markActiveLink(selector) {
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(selector).forEach((link) => {
    const href = link.getAttribute("href");
    if (href === path) link.classList.add("active");
  });
}

/* ---------- 6. SIMPLE FORM VALIDATION HELPER ---------- */
function initFormValidation(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll("[required]").forEach((field) => {
      if (!field.value.trim()) {
        valid = false;
        field.classList.add("is-invalid");
      } else {
        field.classList.remove("is-invalid");
      }
    });

    const password = form.querySelector('input[name="password"]');
    const confirmPassword = form.querySelector('input[name="confirm_password"]');
    if (confirmPassword && password && password.value.trim() && confirmPassword.value.trim() && password.value !== confirmPassword.value) {
      valid = false;
      confirmPassword.classList.add("is-invalid");
    }

    const feedback = form.querySelector(".form-feedback");
    if (!valid) {
      if (feedback) {
        feedback.textContent = confirmPassword && password && password.value.trim() && confirmPassword.value.trim() && password.value !== confirmPassword.value
          ? "Passwords do not match."
          : "Please fill in all required fields.";
        feedback.className = "form-feedback text-danger mt-3 fw-semibold";
      }
      return;
    }

    const payload = {
      email: form.querySelector('input[name="email"]')?.value.trim(),
      password: password?.value,
      fullName: form.querySelector('input[name="fullname"]')?.value.trim(),
      batch: form.querySelector('input[name="batch"]')?.value.trim()
    };

    if (feedback) {
      feedback.textContent = formId === "loginForm" ? "Signing you in..." : "Creating your account...";
      feedback.className = "form-feedback text-info mt-3 fw-semibold";
    }

    try {
      const res = await fetch(formId === "loginForm" ? "/api/login" : "/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Request failed");
      }
      if (feedback) {
        feedback.textContent = formId === "loginForm" ? "Welcome back! Redirecting..." : "Account created! Redirecting...";
        feedback.className = "form-feedback text-success mt-3 fw-semibold";
      }
      localStorage.setItem("alumniAuth", JSON.stringify(data.user));
      setTimeout(() => { window.location.href = "dashboard.html"; }, 900);
    } catch (error) {
      if (feedback) {
        feedback.textContent = error.message || "Something went wrong.";
        feedback.className = "form-feedback text-danger mt-3 fw-semibold";
      }
    }
  });
}

/* ---------- 7. SAMPLE DATA ----------
   Central place for demo content used by directory, events, jobs,
   mentorship and dashboard pages. In a real app this would come
   from an API. */
const SAMPLE_DATA = {
  alumni: [
    { name: "Ritika Sharma", grad: "2018", role: "Senior Product Manager", company: "Google", location: "Bengaluru", tags: ["Product", "AI"], initials: "RS" },
    { name: "Arjun Mehta", grad: "2015", role: "Founder & CEO", company: "Nimbus Health", location: "Mumbai", tags: ["Startups", "Healthcare"], initials: "AM" },
    { name: "Sara Iqbal", grad: "2020", role: "Data Scientist", company: "Amazon", location: "Hyderabad", tags: ["Data", "AI"], initials: "SI" },
    { name: "Karan Verma", grad: "2012", role: "VP Engineering", company: "Flipkart", location: "Bengaluru", tags: ["Engineering", "Leadership"], initials: "KV" },
    { name: "Priya Nair", grad: "2019", role: "UX Design Lead", company: "Swiggy", location: "Pune", tags: ["Design"], initials: "PN" },
    { name: "Devansh Rao", grad: "2016", role: "Investment Analyst", company: "Sequoia India", location: "Delhi", tags: ["Finance", "Startups"], initials: "DR" },
    { name: "Neha Kapoor", grad: "2021", role: "Software Engineer", company: "Microsoft", location: "Hyderabad", tags: ["Engineering"], initials: "NK" },
    { name: "Rohan Das", grad: "2014", role: "Marketing Director", company: "Zomato", location: "Gurgaon", tags: ["Marketing"], initials: "RD" },
  ],
  events: [
    { title: "Annual Alumni Meet 2026", date: "Aug 14, 2026", time: "6:00 PM", mode: "In-person · Campus Auditorium", tag: "Networking", attendees: 214 },
    { title: "AI in Industry — Panel Discussion", date: "Jul 22, 2026", time: "5:00 PM", mode: "Online · Zoom", tag: "Webinar", attendees: 132 },
    { title: "Startup Pitch Night", date: "Aug 02, 2026", time: "4:30 PM", mode: "In-person · Innovation Hub", tag: "Startups", attendees: 98 },
    { title: "Resume & Interview Bootcamp", date: "Jul 18, 2026", time: "11:00 AM", mode: "Online · Google Meet", tag: "Career", attendees: 176 },
    { title: "Women in Tech Mixer", date: "Aug 09, 2026", time: "6:30 PM", mode: "In-person · Rooftop Lounge", tag: "Community", attendees: 87 },
    { title: "Homecoming Weekend", date: "Sep 05, 2026", time: "All day", mode: "In-person · Main Campus", tag: "Networking", attendees: 340 },
  ],
  jobs: [
    { title: "Product Manager", company: "Google", location: "Bengaluru", type: "Full-time", posted: "2 days ago", referrer: "Ritika Sharma" },
    { title: "Frontend Engineer", company: "Flipkart", location: "Bengaluru", type: "Full-time", posted: "1 day ago", referrer: "Karan Verma" },
    { title: "Data Science Intern", company: "Amazon", location: "Hyderabad", type: "Internship", posted: "3 days ago", referrer: "Sara Iqbal" },
    { title: "UX Designer", company: "Swiggy", location: "Pune", type: "Full-time", posted: "5 days ago", referrer: "Priya Nair" },
    { title: "Growth Marketing Associate", company: "Zomato", location: "Gurgaon", type: "Full-time", posted: "6 days ago", referrer: "Rohan Das" },
    { title: "Software Engineer Intern", company: "Microsoft", location: "Hyderabad", type: "Internship", posted: "1 week ago", referrer: "Neha Kapoor" },
  ],
  mentors: [
    { name: "Ritika Sharma", role: "Senior PM, Google", expertise: "Product Strategy, AI", match: 96, initials: "RS" },
    { name: "Arjun Mehta", role: "Founder, Nimbus Health", expertise: "Startups, Fundraising", match: 91, initials: "AM" },
    { name: "Karan Verma", role: "VP Engineering, Flipkart", expertise: "Engineering Leadership", match: 88, initials: "KV" },
    { name: "Devansh Rao", role: "Analyst, Sequoia India", expertise: "Venture Capital, Finance", match: 84, initials: "DR" },
  ],
  announcements: [
    { title: "Applications open for Winter Mentorship Cohort", date: "Jul 1, 2026" },
    { title: "New job board partnership with 40+ startups", date: "Jun 26, 2026" },
    { title: "Alumni Directory now supports advanced AI search", date: "Jun 18, 2026" },
  ],
};

/* ---------- 8. CHATBOT LOGIC ---------- */
const BOT_RESPONSES = [
  {
    keys: ["mentor", "mentorship"],
    reply: "I can help with that! Based on your profile, I'd recommend connecting with mentors in Product and AI — Ritika Sharma (96% match) and Karan Verma (88% match) are great starting points. Want me to open your Mentorship page?",
  },
  {
    keys: ["job", "internship", "career"],
    reply: "There are 6 new openings this week, including a Product Manager role at Google and a Data Science Internship at Amazon. Shall I take you to the Jobs board?",
  },
  {
    keys: ["event", "meet", "webinar"],
    reply: "The next big one is the Annual Alumni Meet on Aug 14, 2026. There's also an online AI-in-Industry panel on Jul 22. Want me to add one to your calendar?",
  },
  {
    keys: ["profile", "update"],
    reply: "You can update your profile photo, work history, and interests from the Profile page — a complete profile gets 3x more mentor matches.",
  },
  {
    keys: ["director", "alumni", "find", "search"],
    reply: "You can search the Alumni Directory by company, batch year, or skill. Try filtering by 'AI' or 'Startups' to find people in that space.",
  },
  {
    keys: ["hello", "hi", "hey"],
    reply: "Hey there! I'm your AI assistant. Ask me about mentors, jobs, events, or your profile — I'm here to help you get the most out of the network.",
  },
];

function getBotReply(message) {
  const lower = message.toLowerCase();
  const match = BOT_RESPONSES.find((r) => r.keys.some((k) => lower.includes(k)));
  return match
    ? match.reply
    : "Thanks for sharing that! I can help you find mentors, jobs, events, or answer questions about your profile — what would you like to explore?";
}

function appendChatBubble(container, text, sender) {
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${sender}`;
  bubble.textContent = text;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
  return bubble;
}

function initChatbot() {
  const form = document.getElementById("chatForm");
  const input = document.getElementById("chatInput");
  const window_ = document.getElementById("chatWindow");
  if (!form || !window_) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    appendChatBubble(window_, text, "user");
    input.value = "";

    const typing = document.createElement("div");
    typing.className = "chat-bubble bot typing-dots";
    typing.innerHTML = "<span></span><span></span><span></span>";
    window_.appendChild(typing);
    window_.scrollTop = window_.scrollHeight;

    setTimeout(() => {
      typing.remove();
      appendChatBubble(window_, getBotReply(text), "bot");
    }, 850);
  });

  document.querySelectorAll(".chat-suggestions button").forEach((btn) => {
    btn.addEventListener("click", () => {
      input.value = btn.textContent;
      form.dispatchEvent(new Event("submit"));
    });
  });
}

/* ---------- 9. CARD RENDERERS (used by directory/events/jobs/mentorship/dashboard) ---------- */
function renderAlumniCards(target, data) {
  const el = document.getElementById(target);
  if (!el) return;
  el.innerHTML = data.map((a) => `
    <div class="col-md-6 col-lg-4 reveal">
      <div class="card-soft p-4 h-100">
        <div class="d-flex align-items-center gap-3 mb-3">
          <div class="avatar-circle">${a.initials}</div>
          <div>
            <h6 class="mb-0">${a.name}</h6>
            <small class="text-soft">Batch of ${a.grad}</small>
          </div>
        </div>
        <p class="mb-1 fw-semibold small">${a.role}</p>
        <p class="mb-3 text-soft small"><i class="bi bi-building me-1"></i>${a.company} &nbsp; <i class="bi bi-geo-alt ms-1 me-1"></i>${a.location}</p>
        <div class="mb-3">${a.tags.map((t) => `<span class="tag-pill me-1">${t}</span>`).join("")}</div>
        <button class="btn btn-outline-brand btn-sm w-100">Connect</button>
      </div>
    </div>`).join("");
  initScrollReveal();
}

function renderEventCards(target, data) {
  const el = document.getElementById(target);
  if (!el) return;
  el.innerHTML = data.map((ev) => `
    <div class="col-md-6 col-lg-4 reveal">
      <div class="card-soft p-4 h-100 d-flex flex-column">
        <span class="tag-pill mb-3 align-self-start">${ev.tag}</span>
        <h6 class="mb-2">${ev.title}</h6>
        <p class="text-soft small mb-1"><i class="bi bi-calendar3 me-1"></i>${ev.date} · ${ev.time}</p>
        <p class="text-soft small mb-3"><i class="bi bi-geo-alt me-1"></i>${ev.mode}</p>
        <p class="mono small text-blue mb-3">${ev.attendees} attending</p>
        <button class="btn btn-brand btn-sm mt-auto">Register</button>
      </div>
    </div>`).join("");
  initScrollReveal();
}

function renderJobCards(target, data) {
  const el = document.getElementById(target);
  if (!el) return;
  el.innerHTML = data.map((j) => `
    <div class="col-12 reveal">
      <div class="card-soft p-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div class="d-flex align-items-center gap-3">
          <div class="icon-tile"><i class="bi bi-briefcase"></i></div>
          <div>
            <h6 class="mb-1">${j.title}</h6>
            <p class="text-soft small mb-1">${j.company} · ${j.location}</p>
            <span class="tag-pill">${j.type}</span>
            <span class="text-soft small ms-2">Referred by ${j.referrer} · ${j.posted}</span>
          </div>
        </div>
        <button class="btn btn-outline-brand btn-sm">Apply Now</button>
      </div>
    </div>`).join("");
  initScrollReveal();
}

function renderMentorCards(target, data) {
  const el = document.getElementById(target);
  if (!el) return;
  el.innerHTML = data.map((m) => `
    <div class="col-md-6 reveal">
      <div class="card-soft p-4 h-100">
        <div class="d-flex justify-content-between align-items-start mb-3">
          <div class="d-flex align-items-center gap-3">
            <div class="avatar-circle">${m.initials}</div>
            <div>
              <h6 class="mb-0">${m.name}</h6>
              <small class="text-soft">${m.role}</small>
            </div>
          </div>
          <span class="match-score">${m.match}% match</span>
        </div>
        <p class="text-soft small mb-3"><i class="bi bi-stars me-1"></i>${m.expertise}</p>
        <button class="btn btn-brand btn-sm w-100">Request Mentorship</button>
      </div>
    </div>`).join("");
  initScrollReveal();
}

/* ---------- 10. JOBS PAGE FILTERS ---------- */
function initJobsPage() {
  const searchInput = document.getElementById("searchJobs");
  const typeSelect = document.getElementById("filterType");
  const locationSelect = document.getElementById("filterLocation");
  const jobsGrid = document.getElementById("jobsGrid");
  if (!jobsGrid) return;

  const locations = [...new Set(SAMPLE_DATA.jobs.map((job) => job.location))].sort();
  locations.forEach((location) => {
    const option = document.createElement("option");
    option.value = location;
    option.textContent = location;
    locationSelect?.appendChild(option);
  });

  const renderFilteredJobs = () => {
    const query = searchInput?.value.trim().toLowerCase() || "";
    const typeValue = typeSelect?.value || "all";
    const locationValue = locationSelect?.value || "all";

    const filtered = SAMPLE_DATA.jobs.filter((job) => {
      const matchesQuery = !query || [job.title, job.company, job.location, job.type, job.referrer].some((value) => value.toLowerCase().includes(query));
      const matchesType = typeValue === "all" || job.type === typeValue;
      const matchesLocation = locationValue === "all" || job.location === locationValue;
      return matchesQuery && matchesType && matchesLocation;
    });

    if (!filtered.length) {
      jobsGrid.innerHTML = `
        <div class="col-12">
          <div class="card-soft p-5 text-center">
            <h6 class="mb-2">No roles match your filters</h6>
            <p class="text-soft mb-0">Try broadening your search or check back soon for fresh openings.</p>
          </div>
        </div>`;
      return;
    }

    renderJobCards("jobsGrid", filtered);
  };

  [searchInput, typeSelect, locationSelect].forEach((field) => {
    field?.addEventListener("input", renderFilteredJobs);
    field?.addEventListener("change", renderFilteredJobs);
  });

  document.addEventListener("jobs:filters-reset", renderFilteredJobs);
  renderFilteredJobs();
}

/* ---------- 11. INIT ON LOAD ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initNavbarScroll();
  initScrollReveal();
  initSidebarToggle();
  initChatbot();
  initJobsPage();
  initFormValidation("loginForm");
  initFormValidation("registerForm");
  markActiveLink(".nav-link");
});