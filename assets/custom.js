window.addEventListener('load', onLoad);

function onLoad() {
    const chapterItems = document.querySelectorAll('li.chapter-item');
    chapterItems.forEach((item) => {
        item.classList.add('expanded');
    });
}