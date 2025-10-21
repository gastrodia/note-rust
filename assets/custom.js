window.addEventListener('load', onLoad)

function onLoad() {
    const script = document.createElement("script")
    const giscusTheme = getGiscusTheme()

    script.type = "text/javascript"
    script.src = "https://giscus.app/client.js"
    script.async = true
    script.crossOrigin = "anonymous"
    script.setAttribute("data-repo", "gastrodia/note-rust")
    script.setAttribute("data-repo-id", "R_kgDONvZAcw")
    script.setAttribute("data-category", "General")
    script.setAttribute("data-category-id", "DIC_kwDONvZAc84CmWmK")
    script.setAttribute("data-mapping", "pathname")
    script.setAttribute("data-strict", "0")
    script.setAttribute("data-reactions-enabled", "1")
    script.setAttribute("data-emit-metadata", "0")
    script.setAttribute("data-input-position", "top")
    script.setAttribute("data-theme", giscusTheme)
    script.setAttribute("data-lang", "zh-CN")
    document.querySelector("main").appendChild(script)

    observerTheme((theme) => {
        const iframe = document.querySelector('iframe.giscus-frame')
        iframe.contentWindow.postMessage({
            giscus: {
                setConfig: { theme: theme }
            }
        }, 'https://giscus.app')
    })

    initBigPicture()
}

function getGiscusTheme() {
    const htmlDom = document.documentElement
    const classList = htmlDom.classList
    const mdBookThemeMapGiscusTheme = {
        light: 'light',
        rust: 'fro',
        coal: 'dark_high_contrast',
        navy: 'dark',
        ayu: 'noborder_dark'
    }
    const keys = Object.keys(mdBookThemeMapGiscusTheme)
    const theme = Array.prototype.find.call(classList, item => keys.includes(item))
    const giscusTheme = (theme ? mdBookThemeMapGiscusTheme[theme] : null) || 'preferred_color_scheme'
    return giscusTheme
}

function observerTheme(onChange) {
    const htmlDom = document.documentElement
    const observer = new MutationObserver(() => {
        const giscusTheme = getGiscusTheme()
        onChange(giscusTheme)
    })

    observer.observe(htmlDom, {
        attributes: true,
        attributeOldValue: true,
        attributeFilter: ['class']
    })
}

function initBigPicture() {
    const images = Array.from(document.querySelectorAll("main img"))
    const gallery = images.map(img => ({src: img.src, caption: img.alt}))

    for (let i = 0; i < images.length; i++) {
        const img = images[i]
        img.addEventListener("click", () => {
            BigPicture({
                el: img,
                position: i,
                gallery
            });
        })
    }
}