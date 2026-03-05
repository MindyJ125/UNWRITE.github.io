const input = document.getElementById('keywordInput');
const btn = document.getElementById('generateBtn');
const container = document.getElementById('wall-container');
const overlay = document.getElementById('overlay');
const saveBtn = document.getElementById('saveBtn'); 

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
    // Clear previous wall for a fresh start
    container.innerHTML = ''; 

    const words = text.split(/\s+/).slice(0, 1500);
    const fragment = document.createDocumentFragment();

    words.forEach(word => {
        const span = document.createElement('span');
        span.className = 'word';
        span.innerText = word + ' ';
        
        span.addEventListener('mouseover', () => {
            span.classList.add('erased');
        });

        fragment.appendChild(span);
    });

    container.appendChild(fragment);

    // Show the save button ONCE at the end
    if (saveBtn) {
        saveBtn.style.display = 'block';
    }
}

saveBtn.addEventListener('click', () => {
    // Temporary hide the button so it doesn't appear in its own screenshot
    saveBtn.style.display = 'none';

    html2canvas(container, {
        backgroundColor: "#050505",
        scale: 3, // Boosts resolution for crisp text on mobile screens
        useCORS: true,
        logging: false
    }).then(canvas => {
        const image = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.download = `PROJECT-UNWRITE-${input.value || 'POEM'}.png`;
        link.href = image;
        link.click();

        // Bring the button back after capture
        saveBtn.style.display = 'block';
    });
});

