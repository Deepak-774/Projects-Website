/**
 * Fetches external HTML files and injects them into the section tags
 */
async function loadSection(id, file) {
    try {
        const response = await fetch(file);
        if (!response.ok) throw new Error("Failed to load " + file);
        const html = await response.text();
        document.getElementById(id).innerHTML = html;
    } catch (err) {
        console.error("Section Load Error:", err);
        document.getElementById(id).innerHTML = "<p>Error loading content.</p>";
    }
}

/**
 * Manages visibility of sections
 */
function showSection(id) {
    document.querySelectorAll("section").forEach(section => {
        section.classList.remove("active");
    });

    const section = document.getElementById(id);
    if (section) {
        section.classList.add("active");
    }

    window.scrollTo(0, 0);
}

function updateNav(targetId) {
    document.querySelectorAll("nav ul li a").forEach(l => l.classList.remove("active"));
    const navLink = document.querySelector(`nav ul li a[href="#${targetId}"]`);
    if (navLink) {
        navLink.classList.add("active");
    }
}

/**
 * Loads projects from Firestore and populates the project grid
 */
async function loadProjectsFromFirestore() {
    if (!window.db || !window.collection || !window.getDocs) {
        console.error("Firestore is not initialized on window.");
        return;
    }

    const grid = document.querySelector("#projects .project-grid, #projects #projects-grid");
    if (!grid) {
        console.warn("Projects grid element not found.");
        return;
    }

    grid.innerHTML = "";

    try {
        const projectsCol = window.collection(window.db, "Projects");
        const snapshot = await window.getDocs(projectsCol);

        snapshot.forEach(doc => {
            const data = doc.data();

            const card = document.createElement("div");
            card.className = "card";

            const img = document.createElement("img");
            img.className = "project-image";
            img.src = data["Display Image"] || "Images/Project Logos/Calculator.png";
            img.alt = data["Project Name"] || "Project image";
            card.appendChild(img);

            const details = document.createElement("div");
            details.className = "project-details";

            const title = document.createElement("h3");
            title.textContent = data["Project Name"] || "Untitled Project";
            details.appendChild(title);

            const tagsWrapper = document.createElement("div");
            tagsWrapper.className = "tech-tags";

            const tags = data.Tags || data["Tags"] || [];
            if (Array.isArray(tags)) {
                tags.forEach(tag => {
                    const span = document.createElement("span");
                    span.className = "tag";
                    span.textContent = tag;
                    tagsWrapper.appendChild(span);
                });
            }
            details.appendChild(tagsWrapper);

            const link = document.createElement("a");
            link.className = "view-link";
            link.href = "#project-detail";
            link.textContent = "View Project";
            link.addEventListener("click", (e) => {
                e.preventDefault();
                showSection("project-detail");
                updateNav("projects");
            });
            details.appendChild(link);

            card.appendChild(details);
            grid.appendChild(card);
        });
    } catch (err) {
        console.error("Error loading projects from Firestore", err);
        grid.innerHTML = "<p>Error loading projects. Please try again later.</p>";
    }
}

/**
 * INITIALIZATION: Runs when the page first loads
 */
window.addEventListener("load", async () => {
    // 1. Load all sections
    await loadSection("home", "home.html");
    await loadSection("about", "about.html");
    await loadSection("projects", "projects.html");
    await loadSection("project-detail", "project_detail.html");

    // 1b. After projects markup is injected, populate cards from Firestore
    await loadProjectsFromFirestore();

    // 2. Set default view
    showSection("home"); 
    
    // 3. Set up Navigation Clicks AFTER sections are loaded
    setupNavigation();
});

/**
 * NAVIGATION: Moved into a function to ensure it runs correctly
 */
function setupNavigation() {
    document.querySelectorAll("nav ul li a, .logo").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const href = link.getAttribute("href");
            const targetId = href === "#home" || link.classList.contains("logo") ? "home" : href.substring(1);

            showSection(targetId);

            updateNav(targetId);
        });
    });
}