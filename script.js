const input = document.getElementById('keywordInput');
const container = document.getElementById('wall-container');
const overlay = document.getElementById('overlay');
const sidebar = document.getElementById('sidebar');
const startOverBtn = document.getElementById('startOverBtn');
const instruction = document.getElementById('instruction');


/*
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
*/

input.addEventListener('keydown', async (event) => {
    if (event.key === 'Enter') {
        const keyword = input.value;
        if (!keyword) return;

        overlay.innerHTML = "<h1>SCRAMBLING REALITY...</h1>";
        
        const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=extracts&explaintext&redirects=1&titles=${encodeURIComponent(keyword)}`;
        const poetryUrl = `https://poetrydb.org/random/5`; // Get more poems
        const booksUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(keyword)}&maxResults=15`;

        try {
            const [wikiRes, poetryRes, booksRes] = await Promise.all([
                fetch(wikiUrl),
                fetch(poetryUrl),
                fetch(booksUrl)
            ]);

            const wikiData = await wikiRes.json();
            const poetryData = await poetryRes.json();
            const booksData = await booksRes.json();

            // 1. Collect Wiki Sentences
            const pageId = Object.keys(wikiData.query.pages)[0];
            const wikiText = wikiData.query.pages[pageId].extract || "";
            const wikiScraps = wikiText.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);

            // 2. Collect Poetic Lines
            const poetryScraps = poetryData.flatMap(poem => poem.lines).filter(l => l.trim().length > 5);

            // 3. Collect Book Snippets
            let bookScraps = [];
            if (booksData.items) {
                bookScraps = booksData.items
                    .map(item => item.searchInfo ? item.searchInfo.textSnippet : "")
                    .filter(s => s.length > 0)
                    .map(s => s.replace(/<[^>]*>/g, ''));
            }

            // --- THE CHAOS MIXER ---
            // Combine all sources into one massive pool
            const totalFragments = 100; 

            // 2. Calculate slice counts (30% Wiki, 50% Books, 20% Poetry)
            const countWiki = Math.floor(totalFragments * 0.15);   // 15
            const countBooks = Math.floor(totalFragments * 0.45);  // 25
            const countPoetry = Math.floor(totalFragments * 0.30); // 10

            // 3. Slice each source array
            const finalFragments = [
                ...wikiScraps.slice(0, countWiki),
                ...bookScraps.slice(0, countBooks),
                ...poetryScraps.slice(0, countPoetry)
            ];

            // 4. Shuffle the combined array
            for (let i = finalFragments.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [finalFragments[i], finalFragments[j]] = [finalFragments[j], finalFragments[i]];
            }

            const finalWallText = finalFragments.join(' ');
;

            overlay.style.display = 'none';
            renderWall(finalWallText);

            overlay.style.display = 'none';
            overlay.style.pointerEvents = 'none';   

        } catch (err) {
            console.error(err);
            overlay.innerHTML = "<h1>COLLISION ERROR.</h1>";
        }
    }
});

function renderWall(text) {
    // Clear previous wall for a fresh start
    container.innerHTML = ''; 

    const words = text.split(/\s+/).slice(0, 1500);
    const fragment = document.createDocumentFragment();

    words.forEach(word => {
        const span = document.createElement('span');
        span.classList.add('word');
        span.innerText = word;

        // Mouse Over Effect
        // This adds an event listener to each word
        // mouseover event occurs when the pointer is moved onto an element
        // and add 'erased' class
        //span.addEventListener('mouseover', () => { span.classList.add('erased'); });
        span.addEventListener('mouseover', () => { 
            // Only erase if the 'carving' class is active on the container (mouse is down)
            if (container.classList.contains('carving')) {
                span.classList.add('erased'); 
            }
        });

        span.addEventListener('mousedown', () => {
            span.classList.add('erased');
        });

        fragment.appendChild(span);
    });

    container.appendChild(fragment);

    // Show the save button ONCE at the end
    instruction.style.display = 'block';
    sidebar.style.display = 'block';

    // Enable carving when mouse is down
    window.addEventListener('mousedown', () => {
        container.classList.add('carving');
    });

    // Disable carving when mouse is up
    window.addEventListener('mouseup', () => {
        container.classList.remove('carving');
    });
}

document.getElementById('savePoemBtn').addEventListener('click', () => {
    // Temporary hide the button so it doesn't appear in its own screenshot
    sidebar.style.display = 'none';

    html2canvas(container, {
        backgroundColor: body.classList.contains('light-mode') ? '#FFFFFF' : '#050505', //match backgroud to theme color,
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
        sidebar.style.display = 'block';
    });
});

startOverBtn.addEventListener('click', () => {
    location.reload();
});

const themeToggleBtn = document.getElementById('themeToggle');
const body = document.body;

window.onload = () => {
    instruction.style.display = 'none';
    // If no theme is saved, default to light
    const savedTheme = localStorage.getItem('theme') || 'light-mode';
    body.classList.add(savedTheme);
    updateButtonText();
};

function updateButtonText() {
    themeToggleBtn.textContent = body.classList.contains('light-mode') 
        ? 'switch to dark mode' 
        : 'switch to light mode';
}

themeToggleBtn.addEventListener('click', () => {
    body.classList.toggle('light-mode');
    
    // Save preference
    const currentTheme = body.classList.contains('light-mode') ? 'light-mode' : 'dark-mode';
    localStorage.setItem('theme', currentTheme);
    
    updateButtonText();
});
