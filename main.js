// main.js

// 1. Reference the global Firebase variables set in the HTML script tag
// These come from the <script type="module"> in your index.html

/**
 * Fetches project data from Firestore and injects it into the project-grid
 */
async function loadProjects() {
    const db = window.db;
    const getDocs = window.getDocs;
    const collection = window.collection;

    if (!db || !getDocs || !collection) {
        console.error("Firebase is not initialized yet. Projects cannot be loaded.");
        return;
    }

    const projectGrid = document.querySelector('.project-grid');
    
    // Safety check: if the grid isn't in the DOM yet, don't run the fetch
    if (!projectGrid) {
        console.warn("Project grid not found. It might still be loading.");
        return;
    }

    try {
        // Must match your Firestore collection name exactly: "Projects"
        const querySnapshot = await getDocs(collection(db, "Projects"));
        
        // Clear the placeholder/hardcoded content
        projectGrid.innerHTML = ""; 

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            // Build the card using your Firestore fields: Display_image, Title, Tech_Used
            projectGrid.innerHTML += `
                <div class="card">
                    <img src="${data.Display_image}" class="project-img" alt="${data.Title}">
                    <div class="project-details">
                        <h3>${data.Title}</h3>
                        <div class="tech-tags">
                            ${data.Tech_Used.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                        <a href="project-details.html?id=${doc.id}" class="view-link">
                            View Project >
                        </a>
                    </div>
                </div>
            `;
        });
        console.log("Firebase data loaded successfully!");
    } catch (error) {
        console.error("Error fetching projects from Firebase:", error);
    }
}

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
 * Manages visibility of sections and triggers data loading
 */
function showSection(id) {
    // Hide all sections
    document.querySelectorAll("section").forEach(section => {
        section.classList.remove("active");
    });

    // Show the targeted section
    const section = document.getElementById(id);
    if (section) {
        section.classList.add("active");
    }

    // CRITICAL: If the user navigates to projects, we try to load the data again
    // This ensures the grid fills up even if the initial load was wonky.
    if (id === "projects") {
        loadProjects();
    }
}

/**
 * INITIALIZATION: Runs when the page first loads
 */
window.addEventListener("load", async () => {
    // 1. Wait for all external HTML files to be injected into index.html
    await loadSection("home", "home.html");
    await loadSection("about", "about.html");
    await loadSection("projects", "projects.html");

    // 1b. Pre-load projects into the projects grid once the HTML is in place
    await loadProjects();

    // 2. Default view: Show Home
    showSection("home"); 
    
    // 3. Highlight the home link in the nav
    const homeLink = document.querySelector("nav ul li a[href='#home']");
    if (homeLink) homeLink.classList.add("active");
});

/**
 * NAVIGATION: Handles clicks on the Navbar links
 */
document.querySelectorAll("nav ul li a").forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = link.getAttribute("href").substring(1);

        showSection(targetId);

        // Update active class on links
        document.querySelectorAll("nav ul li a").forEach(l => l.classList.remove("active"));
        link.classList.add("active");
    });
});

/**
 * LOGO CLICK: Returns user to home
 */
const logo = document.querySelector(".logo");
if (logo) {
    logo.addEventListener("click", (e) => {
        e.preventDefault();
        showSection("home");
        document.querySelectorAll("nav ul li a").forEach(l => l.classList.remove("active"));
        document.querySelector("nav ul li a[href='#home']").classList.add("active");
    });
}