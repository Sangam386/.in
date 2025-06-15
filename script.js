// B-DAY Flipbook Script
// Flipbook class to handle page flipping and animations
class FlipBook {
  constructor(bookElem) {
    this.book = bookElem;
    this.leaves = bookElem.querySelectorAll(".leaf");
    this.currentPage = 0;
    this.isAnimating = false;
    this.maxZIndex = 1000;
    this.setupEventListeners();
    this.initializeBook();
  }

  initializeBook() {
    // Set initial z-index for proper stacking
    this.leaves.forEach((leaf, index) => {
      const baseZIndex = this.leaves.length - index;
      leaf.style.zIndex = baseZIndex;
      leaf.style.transform = 'rotateY(0deg)';
      leaf.classList.remove('turned', 'flipping');
    });
  }

  updatePages() {
    this.leaves.forEach((leaf, index) => {
      leaf.classList.remove('flipping');
      
      if (index < this.currentPage) {
        // Pages that are completely turned
        leaf.classList.add('turned');
        leaf.style.transform = 'rotateY(-180deg)';
        leaf.style.zIndex = index + 1; // Lower z-index for turned pages
      } else {
        // Pages that are not turned yet
        leaf.classList.remove('turned');
        leaf.style.transform = 'rotateY(0deg)';
        leaf.style.zIndex = this.leaves.length - index + this.currentPage; // Higher z-index for unturned pages
      }
    });
  }

  nextPage() {
    if (this.isAnimating || this.currentPage >= this.leaves.length) return;
    
    this.isAnimating = true;
    
    const currentLeaf = this.leaves[this.currentPage];
    if (currentLeaf) {
      // Give the flipping page the highest z-index
      currentLeaf.style.zIndex = this.maxZIndex;
      currentLeaf.classList.add('flipping');
      
      // Start the flip animation
      requestAnimationFrame(() => {
        currentLeaf.style.transform = 'rotateY(-180deg)';
      });
    }
    
    this.currentPage++;
    this.addFlipEffect();
    
    setTimeout(() => {
      this.updatePages();
      this.isAnimating = false;
    }, 1500);
  }

  prevPage() {
    if (this.isAnimating || this.currentPage <= 0) return;
    
    this.isAnimating = true;
    this.currentPage--;
    
    const prevLeaf = this.leaves[this.currentPage];
    if (prevLeaf) {
      // Give the flipping page the highest z-index
      prevLeaf.style.zIndex = this.maxZIndex;
      prevLeaf.classList.add('flipping');
      
      // Start the flip animation
      requestAnimationFrame(() => {
        prevLeaf.style.transform = 'rotateY(0deg)';
      });
    }
    
    this.addFlipEffect();
    
    setTimeout(() => {
      this.updatePages();
      this.isAnimating = false;
    }, 1500);
  }

  goToPage(pageNum) {
    if (this.isAnimating || pageNum < 0 || pageNum > this.leaves.length) return;
    
    this.isAnimating = true;
    this.currentPage = pageNum;
    this.updatePages();
    this.addFlipEffect();
    
    setTimeout(() => {
      this.isAnimating = false;
    }, 1500);
  }

  addFlipEffect() {
    const flash = document.createElement('div');
    flash.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255,255,255,0.1);
      pointer-events: none;
      z-index: ${this.maxZIndex + 100};
      opacity: 0;
      animation: flashEffect 0.3s ease-out;
    `;
    
    document.body.appendChild(flash);
    setTimeout(() => {
      if (flash.parentNode) {
        flash.remove();
      }
    }, 300);
  }

  setupEventListeners() {
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let isDragging = false;

    // Prevent default touch behaviors
    this.book.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
      isDragging = false;
    }, { passive: true });

    this.book.addEventListener('touchmove', (e) => {
      isDragging = true;
    }, { passive: true });

    this.book.addEventListener('touchend', (e) => {
      if (isDragging) return;
      
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const endTime = Date.now();
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const deltaTime = endTime - startTime;
      
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50 && deltaTime < 500) {
        e.preventDefault();
        if (deltaX > 0) {
          this.prevPage();
        } else {
          this.nextPage();
        }
      }
    }, { passive: false });

    // Mouse events
    this.book.addEventListener('mousedown', (e) => {
      startX = e.clientX;
      startTime = Date.now();
      isDragging = false;
    });

    this.book.addEventListener('mousemove', () => {
      isDragging = true;
    });

    this.book.addEventListener('mouseup', (e) => {
      if (isDragging) return;
      
      const endX = e.clientX;
      const endTime = Date.now();
      const deltaX = endX - startX;
      const deltaTime = endTime - startTime;
      
      if (Math.abs(deltaX) > 50 && deltaTime < 500) {
        if (deltaX > 0) {
          this.prevPage();
        } else {
          this.nextPage();
        }
      }
    });

    // Click to flip
    this.book.addEventListener('click', (e) => {
      if (isDragging) return;
      
      const rect = this.book.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const centerX = rect.width / 2;
      
      if (x > centerX) {
        this.nextPage();
      } else {
        this.prevPage();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'ArrowRight':
        case 'PageDown':
        case ' ':
          e.preventDefault();
          this.nextPage();
          break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          this.prevPage();
          break;
        case 'Home':
          e.preventDefault();
          this.goToPage(0);
          break;
        case 'End':
          e.preventDefault();
          this.goToPage(this.leaves.length);
          break;
      }
    });
  }
}

// Create floating particles
function createParticles() {
  const particles = document.getElementById('particles');
  const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#ffa500', '#667eea'];
  
  for (let i = 0; i < 25; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    particle.style.animationDelay = Math.random() * 3 + 's';
    particle.style.animationDuration = (2 + Math.random() * 3) + 's';
    particles.appendChild(particle);
  }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  const flipbook = new FlipBook(document.getElementById("flipbook"));
  createParticles();

  // Add instruction tooltip
  setTimeout(() => {
    const instruction = document.createElement('div');
    instruction.innerHTML = '👈 Click, swipe, or use arrow keys to flip pages 👉<br><small>Space/PageDown: Next • PageUp: Previous • Home/End: First/Last</small>';
    instruction.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.9);
      color: white;
      padding: 15px 25px;
      border-radius: 15px;
      font-size: 14px;
      text-align: center;
      z-index: 10000;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.1);
      animation: slideInUp 0.5s ease-out, fadeOutDown 0.5s ease-in 5.5s forwards;
    `;
    document.body.appendChild(instruction);
    
    setTimeout(() => {
      if (instruction.parentNode) {
        instruction.remove();
      }
    }, 6000);
  }, 1000);
});
// Get video element
const video = document.getElementById('birthday-video');

// Function to check if a page is currently visible
function isPageVisible(pageElement) {
    const rect = pageElement.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    
    // Check if the page is mostly visible
    return (
        rect.top >= 0 && 
        rect.left >= 0 && 
        rect.bottom <= windowHeight && 
        rect.right <= windowWidth
    );
}

// Function to find the video page
function findVideoPage() {
    const pages = document.querySelectorAll('.page');
    for (let page of pages) {
        if (page.querySelector('#birthday-video')) {
            return page;
        }
    }
    return null;
}

// Observer for page visibility
let currentVisiblePage = null;

function checkVideoPage() {
    const videoPage = findVideoPage();
    if (!videoPage) return;
    
    if (isPageVisible(videoPage)) {
        // Video page is visible, play video
        if (video && video.paused) {
            video.play().catch(e => console.log('Video autoplay failed:', e));
        }
        currentVisiblePage = videoPage;
    } else {
        // Video page is not visible, pause video
        if (video && !video.paused) {
            video.pause();
        }
        if (currentVisiblePage === videoPage) {
            currentVisiblePage = null;
        }
    }
}

// Use Intersection Observer for better performance
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const page = entry.target;
        const hasVideo = page.querySelector('#birthday-video');
        
        if (hasVideo) {
            if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                // Video page is visible (more than 50%)
                if (video && video.paused) {
                    video.play().catch(e => console.log('Video autoplay failed:', e));
                }
            } else {
                // Video page is not visible or less than 50% visible
                if (video && !video.paused) {
                    video.pause();
                }
            }
        }
    });
}, {
    threshold: [0, 0.5, 1], // Trigger at 0%, 50%, and 100% visibility
    rootMargin: '0px'
});

// Start observing all pages
document.addEventListener('DOMContentLoaded', function() {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        observer.observe(page);
    });
    
    // Also listen for scroll events as backup
    window.addEventListener('scroll', checkVideoPage);
    window.addEventListener('resize', checkVideoPage);
    
    // Initial check
    setTimeout(checkVideoPage, 500);
});

// Handle flipbook page turns (if you have custom page turn events)
document.addEventListener('pageChanged', function(e) {
    setTimeout(checkVideoPage, 300); // Small delay for animation
});

// Alternative method using MutationObserver to detect style changes
const mutationObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            setTimeout(checkVideoPage, 100);
        }
    });
});

// Observe the flipbook container for style changes
const flipbook = document.getElementById('flipbook');
if (flipbook) {
    mutationObserver.observe(flipbook, {
        attributes: true,
        subtree: true,
        attributeFilter: ['style', 'class']
    });
}