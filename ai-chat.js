// ============================================================
// Bernard's AI Chat Widget — Draggable + Gemini powered
// ============================================================

const GEMINI_API_KEY = "AIzaSyCQBsEwlj9lhs5qCtlAztvesdj18N77stk";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const BERNARD_CONTEXT = `
You are an AI assistant embedded on Bernard Lusale's personal portfolio website.
Your job is to answer questions about Bernard in a friendly, concise, and professional way.
Keep responses short (2-4 sentences max) unless the user asks for detail.

NAME: Bernard Lusale
LOCATION: Riverside Campus, Copperbelt University, Kitwe, Zambia
EMAIL: bernardlusale20@gmail.com
GITHUB: https://github.com/dev-lusale
LINKEDIN: https://www.linkedin.com/in/bernard-lusale
AVAILABILITY: Open to Remote & On-site · Mon–Sat, 08:00–18:00 CAT

EDUCATION:
- BSc Computer Science, Copperbelt University (2023 – Present)
- Secondary School Certificate, Choma Secondary School (Completed)

SKILLS / TECH STACK:
- Frontend: React Native, HTML, CSS, JavaScript
- Backend: Node.js, Express, Java, C#, Python
- Mobile: React Native, Flutter, Dart, .NET MAUI
- AI/ML: TensorFlow, PyTorch, OpenCV, Pandas, NumPy, Matplotlib
- Databases: MongoDB, PostgreSQL, MySQL, Firebase
- Cyber Security: Linux, penetration testing, vulnerability analysis
- Tools: Git, Docker, AWS, Vercel, VS Code

PROJECTS:
1. Xero1 — Windows Forms app for number system conversion. GitHub: https://github.com/dev-lusale/Xero1.git
2. Tech Mart — Web app for managing tech products. GitHub: https://github.com/dev-lusale/TechMart.git
3. Task Manager — Web app for managing tasks. GitHub: https://github.com/dev-lusale/task-manager.git

EXPERIENCE:
- Cyber Security Analyst @ Future Interns (2023–2025)
- Cyber Security Analyst @ Rydonox (2024–2025)

SERVICES: Web Dev, Backend Dev, Mobile Apps, AI/ML, Database Management, Cyber Security, Private Tutoring.

ACHIEVEMENTS: Evoke Hackathon 1st Prize Winner, BongoHive Ignite Program, Kopala 100 2026, UniPod UNLEASH Hackathon, 2nd National Research & Innovation Symposium.

Answer only about Bernard. If unrelated, politely redirect.
`;

const chatHistory = [];

document.addEventListener("DOMContentLoaded", () => {
    const widget  = document.getElementById("ai-chat-widget");
    const toggle  = document.getElementById("ai-chat-toggle");
    const panel   = document.getElementById("ai-chat-panel");
    const closeBtn = document.getElementById("ai-chat-close");
    const input   = document.getElementById("ai-chat-input");
    const sendBtn = document.getElementById("ai-chat-send");
    const messages = document.getElementById("ai-chat-messages");

    if (!widget || !toggle || !panel) {
        console.error("AI Chat: widget elements not found.");
        return;
    }

    // ── Default position (bottom-right) ──────────────────────
    const MARGIN = 24;
    widget.style.position = "fixed";
    widget.style.bottom   = MARGIN + "px";
    widget.style.right    = MARGIN + "px";
    widget.style.left     = "auto";
    widget.style.top      = "auto";

    // ── Drag logic ───────────────────────────────────────────
    let dragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let didDrag = false;
    let startX = 0;
    let startY = 0;

    function startDrag(clientX, clientY) {
        dragging = true;
        didDrag  = false;
        startX   = clientX;
        startY   = clientY;
        const rect = widget.getBoundingClientRect();
        dragOffsetX = clientX - rect.left;
        dragOffsetY = clientY - rect.top;
        widget.style.transition = "none";
        widget.style.cursor = "grabbing";
        widget.style.left   = rect.left + "px";
        widget.style.top    = rect.top  + "px";
        widget.style.right  = "auto";
        widget.style.bottom = "auto";
    }

    function moveDrag(clientX, clientY) {
        if (!dragging) return;
        // Only count as a drag after moving 5px — prevents tap being blocked
        if (!didDrag && Math.hypot(clientX - startX, clientY - startY) < 5) return;
        didDrag = true;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const ww = widget.offsetWidth;
        const wh = widget.offsetHeight;
        let x = clientX - dragOffsetX;
        let y = clientY - dragOffsetY;
        // Clamp inside viewport
        x = Math.max(0, Math.min(x, vw - ww));
        y = Math.max(0, Math.min(y, vh - wh));
        widget.style.left = x + "px";
        widget.style.top  = y + "px";
    }

    function endDrag() {
        if (!dragging) return;
        dragging = false;
        widget.style.cursor = "";
        widget.style.transition = "";
    }

    // Mouse
    toggle.addEventListener("mousedown", (e) => {
        startDrag(e.clientX, e.clientY);
        e.preventDefault();
    });
    document.addEventListener("mousemove", (e) => moveDrag(e.clientX, e.clientY));
    document.addEventListener("mouseup", () => {
        const wasDrag = didDrag;
        endDrag();
        if (!wasDrag) togglePanel();
    });

    // Touch
    toggle.addEventListener("touchstart", (e) => {
        const t = e.touches[0];
        startDrag(t.clientX, t.clientY);
    }, { passive: true });
    document.addEventListener("touchmove", (e) => {
        const t = e.touches[0];
        moveDrag(t.clientX, t.clientY);
    }, { passive: true });
    document.addEventListener("touchend", () => {
        const wasDrag = didDrag;
        endDrag();
        if (!wasDrag) togglePanel();
    });

    // ── Panel open/close ─────────────────────────────────────
    function togglePanel() {
        const isOpen = panel.classList.toggle("open");
        panel.setAttribute("aria-hidden", String(!isOpen));
        toggle.setAttribute("aria-expanded", String(isOpen));
        if (isOpen) {
            repositionPanel();
            input.focus();
            scrollToBottom();
        }
    }

    closeBtn.addEventListener("click", () => {
        panel.classList.remove("open");
        panel.setAttribute("aria-hidden", "true");
        toggle.setAttribute("aria-expanded", "false");
    });

    // Keep panel inside viewport when widget is dragged near edges
    function repositionPanel() {
        const rect   = widget.getBoundingClientRect();
        const pw     = panel.offsetWidth  || 340;
        const ph     = panel.offsetHeight || 480;
        const vw     = window.innerWidth;
        const vh     = window.innerHeight;
        const GAP    = 12;

        // Default: open above the toggle
        let top  = rect.top - ph - GAP;
        let left = rect.left;

        // Flip below if not enough space above
        if (top < 8) top = rect.bottom + GAP;
        // Clamp horizontally
        if (left + pw > vw - 8) left = vw - pw - 8;
        if (left < 8) left = 8;
        // Clamp vertically
        if (top + ph > vh - 8) top = vh - ph - 8;
        if (top < 8) top = 8;

        panel.style.top  = top  + "px";
        panel.style.left = left + "px";
    }

    window.addEventListener("resize", () => {
        if (panel.classList.contains("open")) repositionPanel();
    });

    // ── Suggestion chips ─────────────────────────────────────
    document.querySelectorAll(".ai-chip").forEach(chip => {
        chip.addEventListener("click", () => {
            input.value = chip.dataset.q;
            sendMessage();
            // Hide chips after first use
            document.getElementById("ai-suggestions").style.display = "none";
        });
    });

    // ── Messaging ────────────────────────────────────────────
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    sendBtn.addEventListener("click", sendMessage);

    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        input.value = "";
        sendBtn.disabled = true;
        input.disabled = true;

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
            appendMessage("Connection issue. Reach Bernard at bernardlusale20@gmail.com.", "bot");
            console.error("Gemini error:", err);
        }

        sendBtn.disabled = false;
        input.disabled = false;
        input.focus();
    }

    async function callGemini() {
        const contents = [
            { role: "user",  parts: [{ text: BERNARD_CONTEXT }] },
            { role: "model", parts: [{ text: "Got it! I'm ready to answer questions about Bernard." }] },
            ...chatHistory
        ];

        const res = await fetch(GEMINI_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents,
                generationConfig: { temperature: 0.7, maxOutputTokens: 300 }
            })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error?.message || "API error");
        }

        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text
            || "I didn't get a response. Please try again.";
    }

    function appendMessage(text, role) {
        const div = document.createElement("div");
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
        div.innerHTML = `<span></span><span></span><span></span>`;
        messages.appendChild(div);
        scrollToBottom();
        return div;
    }

    function scrollToBottom() {
        messages.scrollTop = messages.scrollHeight;
    }

    function escapeHtml(str) {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/\n/g, "<br>");
    }

}); // end DOMContentLoaded
