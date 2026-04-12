async function loadBlogList() {
    const container = document.getElementById("blog-list");
    if (!container) return;

    const res = await fetch("contents/blog.yml");
    const text = await res.text();
    const data = jsyaml.load(text);

    let html = "";

    data.posts.sort((a,b)=>new Date(b.date)-new Date(a.date));

    data.posts.forEach(p => {
        html += `
        <div style="margin-bottom:30px;border-bottom:1px solid #ddd;padding-bottom:10px">
            <h4>
                <a href="post.html?slug=${p.slug}">${p.title}</a>
            </h4>
            <div style="color:gray">${p.date}</div>
            <p>${p.summary}</p>
        </div>
        `;
    });

    container.innerHTML = html;
}

async function loadPost() {
    const container = document.getElementById("post-content");
    if (!container) return;

    const url = new URLSearchParams(window.location.search);
    const slug = url.get("slug");

    if (!slug) {
        container.innerHTML = "No post.";
        return;
    }

    const res = await fetch(`contents/posts/${slug}.md`);
    const md = await res.text();

    container.innerHTML = marked.parse(md);
}

window.onload = () => {
    loadBlogList();
    loadPost();
};
