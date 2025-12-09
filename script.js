// Tab switching functionality
document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');

            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');

            // Scroll to top when switching tabs - multiple fallbacks for production reliability
            // Immediate scroll
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
            
            // Use requestAnimationFrame to ensure DOM is updated
            requestAnimationFrame(() => {
                window.scrollTo(0, 0);
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;
                
                // Double-check after layout update to handle any content changes
                requestAnimationFrame(() => {
                    window.scrollTo(0, 0);
                    document.documentElement.scrollTop = 0;
                    document.body.scrollTop = 0;
                });
            });
            
            // Final fallback with timeout for production edge cases
            setTimeout(() => {
                window.scrollTo(0, 0);
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;
            }, 50);
        });
    });

    // Scale planets proportionally based on real sizes
    scalePlanetsProportionally();
});

// Custom size ratios based on specified differences
// Order: mercury < mars < venus < earth <<<< Neptune < Uranus << Saturn << Jupiter <<<<<< Sun
// Mercury = 0.33 (1/3 of Sun), Sun = 1.0
const planetSizes = {
    mercury: 0.33,  // Smallest
    mars: 0.36,     // Slightly bigger than Mercury
    venus: 0.40,    // More noticeably bigger than Mars
    earth: 0.45,    // More noticeably bigger than Venus
    neptune: 0.50,  // Big jump from Earth (<<<<)
    uranus: 0.55,   // More noticeably bigger than Neptune
    saturn: 0.60,   // Medium jump from Uranus (<<)
    jupiter: 0.70,  // Bigger than Saturn
    sun: 1.0        // Biggest (very big jump from Jupiter <<<<<<)
};

// Store images data globally for resize handler
let storedImagesData = [];

function scalePlanetsProportionally() {
    const planetImages = document.querySelectorAll('.planet-image');
    const imagesData = [];
    
    // Load all images and get their natural dimensions
    let loadedCount = 0;
    const totalImages = planetImages.length;
    
    planetImages.forEach(img => {
        const planetName = img.getAttribute('data-planet');
        const tempImg = new Image();
        
        tempImg.onload = function() {
            const naturalWidth = this.naturalWidth;
            const naturalHeight = this.naturalHeight;
            const sizeRatio = planetSizes[planetName] || 1;
            
            imagesData.push({
                element: img,
                planetName: planetName,
                naturalWidth: naturalWidth,
                naturalHeight: naturalHeight,
                sizeRatio: sizeRatio
            });
            
            loadedCount++;
            
            // When all images are loaded, calculate and apply sizes
            if (loadedCount === totalImages) {
                storedImagesData = imagesData;
                applyProportionalSizes(imagesData);
            }
        };
        
        tempImg.onerror = function() {
            loadedCount++;
            if (loadedCount === totalImages) {
                storedImagesData = imagesData;
                applyProportionalSizes(imagesData);
            }
        };
        
        tempImg.src = img.src;
    });
}

function applyProportionalSizes(imagesData) {
    // Find the Sun data
    const sunData = imagesData.find(d => d.planetName === 'sun');
    if (!sunData) return;
    
    // Set Sun's height to screen width
    const screenWidth = window.innerWidth;
    const sunHeight = screenWidth;
    
    // Calculate Sun's width based on aspect ratio
    const sunAspectRatio = sunData.naturalWidth / sunData.naturalHeight;
    const sunWidth = sunHeight * sunAspectRatio;
    
    // Apply Sun's size
    sunData.element.style.width = `${sunWidth}px`;
    sunData.element.style.height = `${sunHeight}px`;
    
    // Apply sizes to all other planets using custom size ratios
    imagesData.forEach(data => {
        if (data.planetName === 'sun') return; // Already set
        
        // Get the custom size ratio for this planet
        const sizeRatio = planetSizes[data.planetName] || 0.33;
        
        // Calculate planet's display size based on Sun's height and size ratio
        const planetHeight = sunHeight * sizeRatio;
        
        // Calculate planet's width based on aspect ratio
        const planetAspectRatio = data.naturalWidth / data.naturalHeight;
        const planetWidth = planetHeight * planetAspectRatio;
        
        // Apply the size
        data.element.style.width = `${planetWidth}px`;
        data.element.style.height = `${planetHeight}px`;
    });
    
    // Also handle window resize (only add listener once)
    if (!window.planetResizeHandlerAdded) {
        window.addEventListener('resize', function() {
            if (storedImagesData.length > 0) {
                applyProportionalSizes(storedImagesData);
            }
        });
        window.planetResizeHandlerAdded = true;
    }
}

