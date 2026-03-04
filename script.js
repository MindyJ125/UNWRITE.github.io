const input = document.getElementById('keywordInput');
const btn = document.getElementById('generateBtn');
const container = document.getElementById('wall-container');
const overlay = document.getElementById('overlay');

btn.addEventListener('click', async () => {
    const keyword = input.value;
    if (!keyword) return;

    // 1. Fetch from Wikipedia
    overlay.innerHTML = "<h1>GENERATING...</h1>";
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=extracts&explaintext&redirects=1&titles=${encodeURIComponent(keyword)}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        let text = pages[pageId].extract;

        if (!text) throw new Error("Void");

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

        if (saveBtn) {
            saveBtn.style.display = 'block';
        }
    });

    container.appendChild(fragment);
}

const saveBtn = document.getElementById('saveBtn');

saveBtn.addEventListener('click', () => {
    const element = document.getElementById('wall-container');

    // Run html2canvas
    html2canvas(element, {
        backgroundColor: "#050505", 
        logging: false,
        scale: 2 
    }).then(canvas => {
        const image = canvas.toDataURL("image/png");
        
    
        const link = document.createElement('a');
        link.download = `UNWRITE-${input.value}.png`;
        link.href = image;
        link.click();
    });
});


