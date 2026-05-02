// ============================================================
// Bernard's AI Chat Widget
// ============================================================

const GEMINI_API_KEY = "AIzaSyCQBsEwlj9lhs5qCtlAztvesdj18N77stk";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const BERNARD_CONTEXT = `You are an AI assistant on Bernard Lusale's portfolio website. Answer questions about Bernard only. Be friendly and concise (2-3 sentences unless detail is asked).

ABOUT BERNARD:
- Full name: Bernard Lusale
- Location: Copperbelt University, Kitwe, Zambia
- Email: bernardlusale20@gmail.com
- GitHub: https://github.com/dev-lusale
- LinkedIn: https://www.linkedin.com/in/bernard-lusale
- Availability: Remote & On-site, Mon–Sat 08:00–18:00 CAT

EDUCATION:
- BSc Computer Science, Copperbelt University (2023–Present)
- Secondary School Certificate, Choma Secondary School

SKILLS:
- Frontend: HTML, CSS, JavaScript, React Native
- Backend: Node.js, Express, Java, C#, Python
- Mobile: React Native, Flutter, Dart, .NET MAUI
- AI/ML: TensorFlow, PyTorch, OpenCV, Pandas, NumPy, Matplotlib
- Databases: MongoDB, PostgreSQL, MySQL, Firebase
- Cyber Security: Linux, penetration testing, vulnerability analysis
- Tools: Git, Docker, AWS, Vercel, VS Code

PROJECTS:
1. Xero1 – Windows Forms number system converter. GitHub: https://github.com/dev-lusale/Xero1.git
2. Tech Mart – Web app for managing tech products. GitHub: https://github.com/dev-lusale/TechMart.git
3. Task Manager – Web task management app. GitHub: https://github.com/dev-lusale/task-manager.git

EXPERIENCE:
- Cyber Security Analyst @ Future Interns (2023–2025)
- Cyber Security Analyst @ Rydonox (2024–2025)

SERVICES: Web Dev, Backend Dev, Mobile Apps, AI/ML Solutions, Database Management, Cyber Security, Private Tutoring (CS & Math)

ACHIEVEMENTS: 1st Prize Evoke Data Analytics Hackathon, BongoHive Ignite Program, Kopala 100 2026, UniPod UNLEASH Hackathon, 2nd National Research & Innovation Symposium

If asked something unrelated to Bernard, politely say you can only answer questions about Bernard.`;

const chatHistory = [];

document.addEventListener("DOMContentLoaded", () => {
    const widget   = document.getElementById("ai-chat-widget");
    const toggle   = document.getElementById("ai-chat-toggle");
    const panel    = document.getElementById("ai-chat-panel");
    const closeBtn = document.getElementById("ai-chat-close");
    const input    = document.getElementById("ai-chat-input");
    const sendBtn  = document.getElementById("ai-chat-send");
    const messages = document.getElementById("ai-chat-messages");

    if (!widget || !toggle || !panel) return;

    // ── Position ──────────────────────────────────────────────
    widget.style.position = "fixed";
    widget.style.bottom   = "20px";
    widget.style.right    = "20px";
    widget.style.left     = "auto";
    widget.style.top      = "auto";

    // ── Drag ─────────────────────────────────────────────────
    let dragging    = false;
    let didDrag     = false;
    let dragOffX    = 0;
    let dragOffY    = 0;
    let startX      = 0;
    let startY      = 0;
    const DRAG_THRESHOLD = 6; // px before it counts as a drag

    function startDrag(cx, cy) {
        dragging = true;
        didDrag  = false;
        startX   = cx;
        startY   = cy;
        const r  = widget.getBoundingClientRect();
        dragOffX = cx - r.left;
        dragOffY = cy - r.top;
        // Switch from bottom/right to top/left so we can move freely
        widget.style.left   = r.left + "px";
        widget.style.top    = r.top  + "px";
        widget.style.right  = "auto";
        widget.style.bottom = "auto";
        widget.style.transition = "none";
    }

    function moveDrag(cx, cy) {
        if (!dragging) return;
        if (!didDrag && Math.hypot(cx - startX, cy - startY) < DRAG_THRESHOLD) return;
        didDrag = true;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        let x = Math.max(0, Math.min(cx - dragOffX, vw - widget.offsetWidth));
        let y = Math.max(0, Math.min(cy - dragOffY, vh - widget.offsetHeight));
        widget.style.left = x + "px";
        widget.style.top  = y + "px";
        // Keep panel in sync if open
        if (panel.classList.contains("open")) positionPanel();
    }

    function endDrag() {
        if (!dragging) return;
        dragging = false;
        widget.style.transition = "";
        if (!didDrag) togglePanel();
    }

    // Mouse events
    toggle.addEventListener("mousedown", e => { startDrag(e.clientX, e.clientY); e.preventDefault(); });
    document.addEventListener("mousemove", e => moveDrag(e.clientX, e.clientY));
    document.addEventListener("mouseup",   () => endDrag());

    // Touch events
    toggle.addEventListener("touchstart", e => {
        const t = e.touches[0];
        startDrag(t.clientX, t.clientY);
    }, { passive: true });
    document.addEventListener("touchmove", e => {
        const t = e.touches[0];
        moveDrag(t.clientX, t.clientY);
    }, { passive: true });
    document.addEventListener("touchend", () => endDrag());

    // ── Panel open/close ──────────────────────────────────────
    function togglePanel() {
        const isOpen = panel.classList.toggle("open");
        panel.setAttribute("aria-hidden", String(!isOpen));
        toggle.setAttribute("aria-expanded", String(isOpen));
        if (isOpen) {
            // On mobile reset bottom before focusing so keyboard shift is handled fresh
            if (window.innerWidth <= 600) {
                panel.style.bottom = "56px";
                panel.style.top    = "auto";
                panel.style.left   = "auto";
            } else {
                positionPanel();
            }
            scrollToBottom();
            setTimeout(() => input.focus(), 50);
        }
    }

    closeBtn.addEventListener("click", () => {
        panel.classList.remove("open");
        panel.setAttribute("aria-hidden", "true");
    });

    // Smart panel positioning — opens above or below the button
    function positionPanel() {
        const r   = widget.getBoundingClientRect();
        const pw  = panel.offsetWidth  || 280;
        const ph  = panel.offsetHeight || 400;
        const vw  = window.innerWidth;
        const vh  = window.innerHeight;
        const GAP = 10;

        let top  = r.top - ph - GAP;
        let left = r.left;

        if (top < 8)              top  = r.bottom + GAP;
        if (left + pw > vw - 8)   left = vw - pw - 8;
        if (left < 8)             left = 8;
        if (top + ph > vh - 8)    top  = vh - ph - 8;
        if (top < 8)              top  = 8;

        panel.style.top  = top  + "px";
        panel.style.left = left + "px";
    }

    window.addEventListener("resize", () => {
        if (panel.classList.contains("open")) positionPanel();
    });

    // ── Mobile keyboard: keep panel above keyboard ────────────
    if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", () => {
            if (!panel.classList.contains("open")) return;
            const isMobile = window.innerWidth <= 600;
            if (!isMobile) return;
            // Gap between bottom of visual viewport and bottom of layout viewport
            const keyboardHeight = window.innerHeight - window.visualViewport.height - window.visualViewport.offsetTop;
            const offset = Math.max(0, keyboardHeight);
            panel.style.bottom = (56 + offset) + "px";
        });
    }

    // ── Chips ─────────────────────────────────────────────────
    document.querySelectorAll(".ai-chip").forEach(chip => {
        chip.addEventListener("click", () => {
            input.value = chip.dataset.q;
            document.getElementById("ai-suggestions").style.display = "none";
            sendMessage();
        });
    });

    // ── Send ──────────────────────────────────────────────────
    input.addEventListener("keydown", e => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
    sendBtn.addEventListener("click", sendMessage);

    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        input.value    = "";
        sendBtn.disabled = true;
        input.disabled   = true;

        appendMessage(text, "user");
        chatHistory.push({ role: "user", parts: [{ text }] });

        const typingEl = appendTyping();

        try {
            const reply = await callGemini();
            typingEl.remove();
            appendMessage(reply, "bot");
            chatHistory.push({ role: "model", parts: [{ text: reply }] });
        } catch (err) {
            typingEl.remove();
            appendMessage("Couldn't connect. Email Bernard at bernardlusale20@gmail.com.", "bot");
            console.error("Gemini error:", err);
        }

        sendBtn.disabled = false;
        input.disabled   = false;
        input.focus();
    }

    async function callGemini() {
        const contents = [
            { role: "user",  parts: [{ text: BERNARD_CONTEXT }] },
            { role: "model", parts: [{ text: "Understood! I'm ready to answer questions about Bernard Lusale." }] },
            ...chatHistory
        ];

        const res = await fetch(GEMINI_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents,
                generationConfig: { temperature: 0.7, maxOutputTokens: 250 }
            })
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err?.error?.message || `HTTP ${res.status}`);
        }

        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
            || "I didn't get a response — please try again.";
    }

    // ── Helpers ───────────────────────────────────────────────
    function appendMessage(text, role) {
        const div  = document.createElement("div");
        div.className = `ai-msg ai-msg--${role}`;
        const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        div.innerHTML = `<span class="ai-msg-text">${escapeHtml(text)}</span><span class="ai-msg-time">${time}</span>`;
        messages.appendChild(div);
        scrollToBottom();
        return div;
    }

    function appendTyping() {
        const div = document.createElement("div");
        div.className = "ai-msg ai-msg--bot ai-msg--typing";
        div.innerHTML = `<span class="ai-msg-text"><span></span><span></span><span></span></span>`;
        messages.appendChild(div);
        scrollToBottom();
        return div;
    }

    function scrollToBottom() { messages.scrollTop = messages.scrollHeight; }

    function escapeHtml(str) {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/\n/g, "<br>");
    }
});
