window.addEventListener('load', onLoad);

function onLoad() {
    const script = document.createElement("script")
    script.type = "text/javascript";
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-repo", "gastrodia/note-rust");
    script.setAttribute("data-repo-id", "R_kgDONvZAcw");
    script.setAttribute("data-category", "General");
    script.setAttribute("data-category-id", "DIC_kwDONvZAc84CmWmK");
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", "preferred_color_scheme");
    script.setAttribute("data-lang", "zh-CN");
    document.querySelector("main").appendChild(script);
}