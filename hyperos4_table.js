document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    // 1. Table Alignment Logic
    const table = document.getElementById('updateTable');
    if (table) {
        const rows = table.querySelectorAll('tbody tr');
        let colCount = 0;
        if (rows.length > 0) {
            // Find max columns
            rows.forEach(r => {
                let count = 0;
                Array.from(r.children).forEach(c => {
                    count += parseInt(c.getAttribute('colspan') || 1);
                });
                colCount = Math.max(colCount, count);
            });

            // Simplified approach for the specific table: 
            // Any cell with text that wraps should be text-left.
            rows.forEach(row => {
                Array.from(row.children).forEach(cell => {
                    // skip images and headers
                    if (cell.querySelector('img') || cell.tagName === 'TH' || cell.classList.contains('mod-cell')) return;
                    
                    const cs = window.getComputedStyle(cell);
                    const lineHeight = parseFloat(cs.lineHeight);
                    const height = cell.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
                    if (height > lineHeight * 1.5 || cell.innerText.length > 30) {
                        cell.classList.add('text-left');
                    }
                });
            });
        }
    }

    // 2. Removed ScrollSpy & TOC
    
    // Back to top
    window.addEventListener('scroll', () => {
        const backBtn = document.getElementById('backToTop');
        if (backBtn) {
            if (pageYOffset > window.innerHeight / 2) {
                backBtn.classList.add('visible');
            } else {
                backBtn.classList.remove('visible');
            }
        }
    });

    const backBtnElement = document.getElementById('backToTop');
    if (backBtnElement) {
        backBtnElement.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 4. Lightbox
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.querySelector('.lightbox-close');
    
    document.querySelectorAll('.lightbox-img').forEach(img => {
        img.addEventListener('click', () => {
            lightboxImg.src = img.src;
            lightbox.classList.add('active');
        });
    });
    
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target !== lightboxImg) {
                lightbox.classList.remove('active');
            }
        });
    }

    // 5. English proper noun capitalization fixing
    function fixProperNouns(node) {
        if (node.nodeType === 3) {
            let text = node.nodeValue;
            text = text.replace(/\bios\b/gi, 'iOS');
            text = text.replace(/\bmacos\b/gi, 'macOS');
            text = text.replace(/\bapp\b/gi, 'App');
            text = text.replace(/\biphone\b/gi, 'iPhone');
            node.nodeValue = text;
        } else if (node.nodeType === 1 && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
            for (let i = 0; i < node.childNodes.length; i++) {
                fixProperNouns(node.childNodes[i]);
            }
        }
    }
    fixProperNouns(document.body);
});
