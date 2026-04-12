#blog
let allPosts = [];
let currentCategory = "All";
let currentKeyword = "";

async function fetchYaml(path) {
    const res = await fetch(path);
    if (!res.ok) {
        throw new Error(`Failed to load ${path}: ${res.status}`);
    }

    const text = await res.text();

    if (typeof jsyaml === "undefined") {
        throw new Error("jsyaml is not defined. Please check js-yaml.min.js.");
    }

    return jsyaml.load(text);
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML;
}

function normalizeText(text) {
    return (text || "").toLowerCase().trim();
}

function formatCategoryName(name) {
    return name || "Uncategorized";
}

function getAllCategories(posts) {
    const categories = new Set();
    posts.forEach(post => {
        categories.add(formatCategoryName(post.category));
    });
    return ["All", ...Array.from(categories).sort()];
}

function renderCategories(categories) {
    const container = document.getElementById("category-list");
    if (!container) return;

    container.innerHTML = "";

    categories.forEach(category => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "blog-category-btn" + (category === currentCategory ? " active" : "");
        btn.textContent = category;
        btn.addEventListener("click", () => setCategory(category));
        container.appendChild(btn);
    });
}

function filterPosts() {
    const keyword = normalizeText(currentKeyword);

    return allPosts.filter(post => {
        const category = formatCategoryName(post.category);

        const matchCategory =
            currentCategory === "All" || category === currentCategory;

        const haystack = [
            post.title,
            post.summary,
            post.category,
            post.slug
        ].join(" ").toLowerCase();

        const matchKeyword = !keyword || haystack.includes(keyword);

        return matchCategory && matchKeyword;
    });
}

function renderMetaBar(posts) {
    const metaBar = document.getElementById("blog-meta-bar");
    if (!metaBar) return;

    const categoryText =
        currentCategory === "All" ? "All categories" : currentCategory;

    const keywordText = currentKeyword
        ? ` · Search: "${escapeHtml(currentKeyword)}"`
        : "";

    metaBar.innerHTML = `
        <span><strong>${posts.length}</strong> post(s)</span>
        <span> · ${escapeHtml(categoryText)}${keywordText}</span>
    `;
}

function renderPosts(posts) {
    const container = document.getElementById("blog-list");
    const emptyState = document.getElementById("blog-empty");

    if (!container || !emptyState) return;

    if (posts.length === 0) {
        container.innerHTML = "";
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";

    container.innerHTML = posts.map(post => `
        <article class="blog-post-card">
            <div class="blog-post-topline">
                <span class="blog-post-date">
                    <i class="bi bi-calendar3"></i> ${escapeHtml(post.date || "")}
                </span>
                <span class="blog-post-category">
                    ${escapeHtml(formatCategoryName(post.category))}
                </span>
            </div>

            <h3 class="blog-post-title">
                <a href="post.html?slug=${encodeURIComponent(post.slug)}">
                    ${escapeHtml(post.title)}
                </a>
            </h3>

            <p class="blog-post-summary">
                ${escapeHtml(post.summary || "")}
            </p>

            <div class="blog-post-bottom">
                <a class="blog-read-more" href="post.html?slug=${encodeURIComponent(post.slug)}">
                    Read more <i class="bi bi-arrow-right"></i>
                </a>
            </div>
        </article>
    `).join("");
}

function refreshPostView() {
    const filtered = filterPosts();
    renderCategories(getAllCategories(allPosts));
    renderMetaBar(filtered);
    renderPosts(filtered);
}

function setCategory(category) {
    currentCategory = category;
    refreshPostView();
}

function handleSearch() {
    const input = document.getElementById("blog-search");
    currentKeyword = input ? input.value : "";
    refreshPostView();
}

async function loadBlogList() {
    const listContainer = document.getElementById("blog-list");
    const categoryContainer = document.getElementById("category-list");
    const metaBar = document.getElementById("blog-meta-bar");

    if (!listContainer) return;

    try {
        const data = await fetchYaml("contents/blog.yml");

        if (!data || !Array.isArray(data.posts)) {
            throw new Error("Invalid blog.yml format: 'posts' must be an array.");
        }

        allPosts = data.posts.slice();
        allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

        refreshPostView();
    } catch (error) {
        console.error(error);

        if (categoryContainer) {
            categoryContainer.innerHTML = `<div style="color:red;">Failed to load categories</div>`;
        }

        if (metaBar) {
            metaBar.innerHTML = `<span style="color:red;">Failed to load metadata</span>`;
        }

        listContainer.innerHTML = `
            <div class="blog-empty-state" style="color:red;">
                Failed to load blog posts. Please check F12 Console.
            </div>
        `;
    }
}

async function loadPost() {
    const container = document.getElementById("post-content");
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug");

    if (!slug) {
        container.innerHTML = "<p>No post slug provided.</p>";
        return;
    }

    try {
        const res = await fetch(`contents/posts/${slug}.md`);
        if (!res.ok) {
            throw new Error(`Failed to load post: ${res.status}`);
        }

        const md = await res.text();

        if (typeof marked === "undefined") {
            throw new Error("marked is not defined. Please check marked.min.js.");
        }

        container.innerHTML = marked.parse(md);
    } catch (error) {
        console.error(error);
        container.innerHTML = `<p>Failed to load post: ${escapeHtml(slug)}.md</p>`;
    }
}

window.addEventListener("DOMContentLoaded", () => {
    loadBlogList();
    loadPost();
});
