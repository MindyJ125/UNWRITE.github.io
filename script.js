const input = document.getElementById('keywordInput');
const btn = document.getElementById('generateBtn');
const container = document.getElementById('wall-container');
const overlay = document.getElementById('overlay');

btn.addEventListener('click', async () => {
    const keyword = input.value;
    if (!keyword) return;

    // 1. Fetch from Wikipedia
    overlay.innerHTML = "<h1>GENERATING...</h1>";
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=extracts&explaintext&titles=${keyword}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        let text = pages[pageId].extract;

        if (!text) throw new Error("Void");

        // 2. Clear overlay and prepare text
        overlay.style.display = 'none';
        renderWall(text);

    } catch (err) {
        overlay.innerHTML = "<h1>THE VOID RETURNED NOTHING.</h1><p>Try a different word.</p>";
    }
});

function renderWall(text) {
    const words = text.split(/\s+/).slice(0, 1500); // Limit to 1500 words for performance
    const fragment = document.createDocumentFragment();

    words.forEach(word => {
        const span = document.createElement('span');
        span.className = 'word';
        span.innerText = word + ' ';
        
        // Interaction: Erase on hover
        span.addEventListener('mouseover', () => {
            span.classList.add('erased');
        });

        fragment.appendChild(span);
    });

    container.appendChild(fragment);
}
