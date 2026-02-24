const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Import the existing Project model
const Project = require('./models/Project');
const AiSector = require('./models/AiSector');

// Connect to MongoDB if running standalone
let isConnected = false;
async function ensureConnection() {
  if (!isConnected && mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/geekpie-portfolio');
    isConnected = true;
    console.log('Connected to MongoDB');
  }
}

// Configuration for Load More functionality
const INITIAL_ITEMS_COUNT = 6;
const LOAD_MORE_COUNT = 6;

// Generate portfolio item HTML for index.html
function generatePortfolioItemHTML(project, index) {
  const paddedIndex = String(index + 1).padStart(2, '0');
  const categoryClass = project.category || 'design';
  const isHidden = index >= INITIAL_ITEMS_COUNT;
  const hiddenClass = isHidden ? 'pxl-portfolio-hidden' : '';
  
  return `                    <div class="pxl-grid-item col-12 ${categoryClass} ${hiddenClass} wow fadeInUp" data-index="${index}" style="z-index: ${index}${isHidden ? '; display: none;' : ''}">
                <div class="pxl-post-item hover-parent pxl-accordion-item ">
                    <div class="pxl-post-content">
                                                    <span class="pxl-post-index">${paddedIndex}</span>
                                                <div class="pxl-post-group">
                            <div class="pxl-accorrdion-header">
                                <h3 class="pxl-post-title hover-text-default">
                                    <a href="/portfolio/${project.slug}/" class="pxl-title-link">
                                        ${escapeHtml(project.title)}                                    </a>
                                </h3>
                            </div>
                            <div class="pxl-accordion-content">
                                <div class="pxl-accordion-details">
                                                                            <p class="pxl-post-excerpt">
                                            ${escapeHtml(project.shortDescription || project.description || '')}                                        </p>
                                                                                                                <a href="/portfolio/${project.slug}/" class="btn pxl-post-btn pxl-btn-split">
                                            <span class="pxl-btn-icon icon-duplicated">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewbox="0 0 30 30" fill="none">
                                                    <path d="M21.5657 19.3518L21.4975 9.87206C21.4975 9.46287 21.1793 9.1446 20.7701 9.1446L11.2903 9.0764C10.8811 9.0764 10.5628 9.39467 10.5628 9.80386C10.5628 10.2131 10.8811 10.5313 11.2903 10.5313L18.9969 10.5995L9.33525 20.2612C9.06246 20.534 9.06246 20.9886 9.33525 21.2614C9.60805 21.5342 10.0855 21.5569 10.3583 21.2842L20.0653 11.5771L20.1335 19.3746C20.1335 19.5564 20.2245 19.7383 20.3609 19.8747C20.4973 20.0111 20.6791 20.102 20.8837 20.0793C21.2475 20.0793 21.5885 19.7383 21.5657 19.3518Z" fill="currentcolor"></path>
                                                </svg>
                                            </span>
                                            <span class="pxl-btn-text">View Project Details</span>
                                            <span class="pxl-btn-icon icon-main">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewbox="0 0 30 30" fill="none">
                                                    <path d="M21.5657 19.3518L21.4975 9.87206C21.4975 9.46287 21.1793 9.1446 20.7701 9.1446L11.2903 9.0764C10.8811 9.0764 10.5628 9.39467 10.5628 9.80386C10.5628 10.2131 10.8811 10.5313 11.2903 10.5313L18.9969 10.5995L9.33525 20.2612C9.06246 20.534 9.06246 20.9886 9.33525 21.2614C9.60805 21.5342 10.0855 21.5569 10.3583 21.2842L20.0653 11.5771L20.1335 19.3746C20.1335 19.5564 20.2245 19.7383 20.3609 19.8747C20.4973 20.0111 20.6791 20.102 20.8837 20.0793C21.2475 20.0793 21.5885 19.7383 21.5657 19.3518Z" fill="currentcolor"></path>
                                                </svg>
                                            </span>
                                        </a>
                                                                    </div>
                            </div>
                        </div>
                    </div>
                    <div class="pxl-post-featured hover-image-parallax">
                        <a href="/portfolio/${project.slug}/" class="pxl-featured-link">            
                            <img loading="lazy" decoding="async" src="${project.thumbnail || ''}" width="767" height="642" class="pxl-featured-image no-lazyload" alt="${escapeHtml(project.title || '')}">                        </a>
                    </div>
                </div>
            </div>`;
}

// Generate Load More button HTML
function generateLoadMoreButton(totalItems) {
  if (totalItems <= INITIAL_ITEMS_COUNT) {
    return ''; // No need for load more button if all items are visible
  }
  
  const hiddenItems = totalItems - INITIAL_ITEMS_COUNT;
  const loadMoreText = `Load More (${hiddenItems} more projects)`;
  
  return `
            <div class="pxl-load-more-wrapper" style="text-align: center; margin-top: 50px; width: 100%;">
                <button id="pxl-load-more-btn" class="btn pxl-load-more-btn" data-loaded="${INITIAL_ITEMS_COUNT}" data-total="${totalItems}" data-load-count="${LOAD_MORE_COUNT}" style="
                    background-color: #FF6B35;
                    color: #121212;
                    padding: 18px 45px;
                    border-radius: 50px;
                    font-family: 'Kanit', sans-serif;
                    font-size: 16px;
                    font-weight: 500;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                ">
                    <span class="pxl-btn-text">${loadMoreText}</span>
                    <span class="pxl-btn-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewbox="0 0 20 20" fill="none">
                            <path d="M10 2V18M2 10H18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </span>
                </button>
            </div>`;
}

// Generate JavaScript for Load More functionality
function generateLoadMoreScript() {
  return `
<script>
(function() {
    const loadMoreBtn = document.getElementById('pxl-load-more-btn');
    if (!loadMoreBtn) return;
    
    const loaded = parseInt(loadMoreBtn.dataset.loaded);
    const total = parseInt(loadMoreBtn.dataset.total);
    const loadCount = parseInt(loadMoreBtn.dataset.loadCount);
    
    loadMoreBtn.addEventListener('click', function() {
        const hiddenItems = document.querySelectorAll('.pxl-portfolio-hidden');
        const itemsToShow = Math.min(loadCount, hiddenItems.length);
        
        for (let i = 0; i < itemsToShow; i++) {
            hiddenItems[i].style.display = 'block';
            hiddenItems[i].classList.remove('pxl-portfolio-hidden');
            // Trigger animation
            hiddenItems[i].classList.add('fadeInUp');
        }
        
        const newLoaded = loaded + itemsToShow;
        loadMoreBtn.dataset.loaded = newLoaded;
        
        const remaining = total - newLoaded;
        if (remaining <= 0) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.querySelector('.pxl-btn-text').textContent = 'Load More (' + remaining + ' more projects)';
        }
    });
    
    // Hover effect
    loadMoreBtn.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#121212';
        this.style.color = '#FF6B35';
    });
    
    loadMoreBtn.addEventListener('mouseleave', function() {
        this.style.backgroundColor = '#FF6B35';
        this.style.color = '#121212';
    });
})();
</script>`;
}

// Generate AI Sector item HTML for index.html
function generateAiSectorItemHTML(sector, index) {
  const paddedIndex = String(index + 1).padStart(2, '0');
  const isActive = index === 0 ? 'active' : '';
  const link = `/ai-sector/${sector.slug}/`;
  const thumbnail = sector.thumbnail || '';
  const shortDesc = sector.shortDescription || sector.description?.substring(0, 150) || '';
  
  return `                    <div class="pxl-grid-item col-12 wow fadeInUp" style="z-index: ${index}">
                <div class="pxl-post-item hover-parent pxl-accordion-item ${isActive}">
                    <div class="pxl-post-content">
                                                    <span class="pxl-post-index">${paddedIndex}</span>
                                                <div class="pxl-post-group">
                            <div class="pxl-accorrdion-header">
                                <h3 class="pxl-post-title hover-text-default">
                                    <a href="${link}" class="pxl-title-link">
                                        ${escapeHtml(sector.title)}                                    </a>
                                </h3>
                            </div>
                            <div class="pxl-accordion-content">
                                <div class="pxl-accordion-details">
                                                                            <p class="pxl-post-excerpt">
                                            ${escapeHtml(shortDesc)}                                        </p>
                                                                                                                <a href="${link}" class="btn pxl-post-btn pxl-btn-split">
                                            <span class="pxl-btn-icon icon-duplicated">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewbox="0 0 30 30" fill="none">
                                                    <path d="M21.5657 19.3518L21.4975 9.87206C21.4975 9.46287 21.1793 9.1446 20.7701 9.1446L11.2903 9.0764C10.8811 9.0764 10.5628 9.39467 10.5628 9.80386C10.5628 10.2131 10.8811 10.5313 11.2903 10.5313L18.9969 10.5995L9.33525 20.2612C9.06246 20.534 9.06246 20.9886 9.33525 21.2614C9.60805 21.5342 10.0855 21.5569 10.3583 21.2842L20.0653 11.5771L20.1335 19.3746C20.1335 19.5564 20.2245 19.7383 20.3609 19.8747C20.4973 20.0111 20.6791 20.102 20.8837 20.0793C21.2475 20.0793 21.5885 19.7383 21.5657 19.3518Z" fill="currentcolor"></path>
                                                </svg>
                                            </span>
                                            <span class="pxl-btn-text">View Project Details</span>
                                            <span class="pxl-btn-icon icon-main">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewbox="0 0 30 30" fill="none">
                                                    <path d="M21.5657 19.3518L21.4975 9.87206C21.4975 9.46287 21.1793 9.1446 20.7701 9.1446L11.2903 9.0764C10.8811 9.0764 10.5628 9.39467 10.5628 9.80386C10.5628 10.2131 10.8811 10.5313 11.2903 10.5313L18.9969 10.5995L9.33525 20.2612C9.06246 20.534 9.06246 20.9886 9.33525 21.2614C9.60805 21.5342 10.0855 21.5569 10.3583 21.2842L20.0653 11.5771L20.1335 19.3746C20.1335 19.5564 20.2245 19.7383 20.3609 19.8747C20.4973 20.0111 20.6791 20.102 20.8837 20.0793C21.2475 20.0793 21.5885 19.7383 21.5657 19.3518Z" fill="currentcolor"></path>
                                                </svg>
                                            </span>
                                        </a>
                                                                    </div>
                            </div>
                        </div>
                    </div>
                    <div class="pxl-post-featured hover-image-parallax">
                        <a href="${link}" class="pxl-featured-link">            
                            <img loading="lazy" decoding="async" src="${thumbnail}" width="767" height="642" class="pxl-featured-image no-lazyload" alt="${escapeHtml(sector.title || '')}">                        </a>
                    </div>
                </div>
            </div>`;
}

// Generate individual AI sector page HTML using the same template as portfolio pages
function generateAiSectorPageHTML(sector) {
  const title = escapeHtml(sector.title);
  const description = sector.description || '';
  const content = sector.content || description;
  const thumbnail = sector.thumbnail || '/wp-content/uploads/2024/10/image5-scaled.webp';
  const slug = sector.slug;
  const client = sector.client || 'N/A';
  const category = sector.category || 'design';
  const location = sector.location || 'N/A';
  const timeline = sector.timeline || 'N/A';
  
  // Format category for display
  const categoryDisplay = category.charAt(0).toUpperCase() + category.slice(1);
  
  // Read the original template
  let template = getPortfolioTemplate();
  
  // Replace the title in the <title> tag (handle both formats: with dash or double space)
  template = template.replace(
    /<title>Mockup 3d\s*[–-]?\s*GeekPie<\/title>/,
    `<title>${title} – GeekPie</title>`
  );
  
  // Replace the canonical URL
  template = template.replace(
    /<link rel="canonical" href="\/portfolio\/mockup-3d\/">/,
    `<link rel="canonical" href="/ai-sector/${slug}/">`
  );
  
  // Remove the "Home" breadcrumb link
  template = template.replace(
    /<li><a class="pxl-breadcrumb-link" href="\/">Home<\/a><\/li><li class="pxl-breadcrumb-separator">\.<\/li>/g,
    '<li class="pxl-breadcrumb-separator">.</li>'
  );
  
  // Replace the post title in the hero section
  template = template.replace(
    /<span class="pxl-post-title">Mockup 3d<\/span>/,
    `<span class="pxl-post-title">${title}</span>`
  );
  
  // Replace the post title in the content section
  template = template.replace(
    /<span class="pxl-post-title">Mockup 3d<\/span>/g,
    `<span class="pxl-post-title">${title}</span>`
  );
  
  // Replace the thumbnail image
  template = template.replace(
    /src="\/wp-content\/uploads\/2025\/02\/post-29\.webp"/,
    `src="${thumbnail}"`
  );
  
  // Replace the description/content
  template = template.replace(
    /<div id="pxl_text_editor-6fc2186-5297" class="pxl-text-editor-wrapper text-primary link-default link-hover-default   ">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/,
    `<div id="pxl_text_editor-6fc2186-5297" class="pxl-text-editor-wrapper text-primary link-default link-hover-default   " style="word-wrap: break-word; overflow-wrap: break-word; max-width: 100%;">
	${content}		
</div>				</div>
				</div>`
  );
  
  // Replace Client Name
  template = template.replace(
    /(<span class="pxl-info-title">\s*Client Name:\s*<\/span>[\s\S]*?<span class="pxl-info-meta">[\s\S]*?<a href="\/author\/root\/" class="pxl-author-link">)\s*root\s*(<\/a>[\s\S]*?<\/span>)/,
    `$1${escapeHtml(client)}$2`
  );
  
  // Replace Category
  template = template.replace(
    /(<span class="pxl-info-title">\s*Category:\s*<\/span>[\s\S]*?<span class="pxl-info-meta">[\s\S]*?<a href="\/portfolio-category\/design\/" rel="tag">)[^<]*(<\/a>[\s\S]*?<\/span>)/,
    `$1${categoryDisplay}$2`
  );
  
  // Replace Location
  template = template.replace(
    /(<span class="pxl-info-title">\s*Location:\s*<\/span>[\s\S]*?<span class="pxl-info-meta">[\s\S]*?<a href="#">)\s*United Kingdom\s*(<\/a>[\s\S]*?<\/span>)/,
    `$1${escapeHtml(location)}$2`
  );
  
  // Replace Timeline
  template = template.replace(
    /(<span class="pxl-info-title">\s*Timeline:\s*<\/span>[\s\S]*?<span class="pxl-info-meta">[\s\S]*?<span>)\s*Oct 2023 - Nov 2023\s*(<\/span>[\s\S]*?<\/span>)/,
    `$1${escapeHtml(timeline)}$2`
  );
  
  // Add sector images if available
  if (sector.images && sector.images.length > 0) {
    const imagesHTML = sector.images.map(img => 
      `<div style="margin-bottom: 30px;">
        <img src="${img}" alt="${title}" style="width: 100%; border-radius: 20px;">
      </div>`
    ).join('\n');
    
    template = template.replace(
      /<\/article><!-- #post -->/,
      `${imagesHTML}\n                    </article><!-- #post -->`
    );
  }
  
  return template;
}

// Read the portfolio template
function getPortfolioTemplate() {
  const templatePath = path.join(__dirname, '../../portfolio/mockup-3d/index.html');
  return fs.readFileSync(templatePath, 'utf8');
}

// Generate individual portfolio page HTML using the original template
function generatePortfolioPageHTML(project) {
  const title = escapeHtml(project.title);
  const description = project.description || '';
  const content = project.content || description;
  const thumbnail = project.thumbnail || '/wp-content/uploads/2024/10/image5-scaled.webp';
  const slug = project.slug;
  const client = project.client || 'N/A';
  const category = project.category || 'design';
  const location = project.location || 'N/A';
  const timeline = project.timeline || 'N/A';
  
  // Format category for display
  const categoryDisplay = category.charAt(0).toUpperCase() + category.slice(1);
  
  // Read the original template
  let template = getPortfolioTemplate();
  
  // Replace the title in the <title> tag (handle both formats: with dash or double space)
  template = template.replace(
    /<title>Mockup 3d\s*[–-]?\s*GeekPie<\/title>/,
    `<title>${title} – GeekPie</title>`
  );
  
  // Replace the canonical URL
  template = template.replace(
    /<link rel="canonical" href="\/portfolio\/mockup-3d\/">/,
    `<link rel="canonical" href="/portfolio/${slug}/">`
  );
  
  // Remove the "Home" breadcrumb link
  template = template.replace(
    /<li><a class="pxl-breadcrumb-link" href="\/">Home<\/a><\/li><li class="pxl-breadcrumb-separator">\.<\/li>/g,
    '<li class="pxl-breadcrumb-separator">.</li>'
  );
  
  // Replace the post title in the hero section (line 197)
  template = template.replace(
    /<span class="pxl-post-title">Mockup 3d<\/span>/,
    `<span class="pxl-post-title">${title}</span>`
  );
  
  // Replace the post title in the content section (line 231)
  template = template.replace(
    /<span class="pxl-post-title">Mockup 3d<\/span>/g,
    `<span class="pxl-post-title">${title}</span>`
  );
  
  // Replace the thumbnail image (post-29.webp)
  template = template.replace(
    /src="\/wp-content\/uploads\/2025\/02\/post-29\.webp"/,
    `src="${thumbnail}"`
  );
  
  // Replace the description/content - don't wrap in <p> since ReactQuill provides HTML
  // Add inline style for word-wrap to prevent overflow
  template = template.replace(
    /<div id="pxl_text_editor-6fc2186-5297" class="pxl-text-editor-wrapper text-primary link-default link-hover-default   ">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/,
    `<div id="pxl_text_editor-6fc2186-5297" class="pxl-text-editor-wrapper text-primary link-default link-hover-default   " style="word-wrap: break-word; overflow-wrap: break-word; max-width: 100%;">
	${content}		
</div>				</div>
				</div>`
  );
  
  // Replace Client Name - find the client name section and replace the author link text
  template = template.replace(
    /(<span class="pxl-info-title">\s*Client Name:\s*<\/span>[\s\S]*?<span class="pxl-info-meta">[\s\S]*?<a href="\/author\/root\/" class="pxl-author-link">)\s*root\s*(<\/a>[\s\S]*?<\/span>)/,
    `$1${escapeHtml(client)}$2`
  );
  
  // Replace Category - find the category section
  template = template.replace(
    /(<span class="pxl-info-title">\s*Category:\s*<\/span>[\s\S]*?<span class="pxl-info-meta">[\s\S]*?<a href="\/portfolio-category\/design\/" rel="tag">)[^<]*(<\/a>[\s\S]*?<\/span>)/,
    `$1${categoryDisplay}$2`
  );
  
  // Replace Location - find the location section
  template = template.replace(
    /(<span class="pxl-info-title">\s*Location:\s*<\/span>[\s\S]*?<span class="pxl-info-meta">[\s\S]*?<a href="#">)\s*United Kingdom\s*(<\/a>[\s\S]*?<\/span>)/,
    `$1${escapeHtml(location)}$2`
  );
  
  // Replace Timeline - find the timeline section
  template = template.replace(
    /(<span class="pxl-info-title">\s*Timeline:\s*<\/span>[\s\S]*?<span class="pxl-info-meta">[\s\S]*?<span>)\s*Oct 2023 - Nov 2023\s*(<\/span>[\s\S]*?<\/span>)/,
    `$1${escapeHtml(timeline)}$2`
  );
  
  // Add project images if available
  if (project.images && project.images.length > 0) {
    // Find the section after the content and add images
    const imagesHTML = project.images.map(img => 
      `<div style="margin-bottom: 30px;">
        <img src="${img}" alt="${title}" style="width: 100%; border-radius: 20px;">
      </div>`
    ).join('\n');
    
    // Insert images before the closing of the main content area
    template = template.replace(
      /<\/article><!-- #post -->/,
      `${imagesHTML}\n                    </article><!-- #post -->`
    );
  }
  
  return template;
}

// Helper function to escape HTML
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Main function to generate static files
async function generateStaticSite() {
  try {
    // Ensure MongoDB connection when running standalone
    await ensureConnection();
    
    console.log('Starting static site generation...');
    
    // Get all published projects
    const projects = await Project.find({ status: 'published' }).sort({ order: 1, createdAt: -1 });
    console.log(`Found ${projects.length} published projects`);
    
    // Get all published AI sectors
    const aiSectors = await AiSector.find({ status: 'published' }).sort({ order: 1, createdAt: -1 });
    console.log(`Found ${aiSectors.length} published AI sectors`);
    
    // Create uploads directory in static site root
    const staticUploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(staticUploadsDir)) {
      fs.mkdirSync(staticUploadsDir, { recursive: true });
    }
    
    // Copy uploaded images to static site uploads folder
    const serverUploadsDir = path.join(__dirname, 'uploads');
    if (fs.existsSync(serverUploadsDir)) {
      const files = fs.readdirSync(serverUploadsDir);
      for (const file of files) {
        const srcPath = path.join(serverUploadsDir, file);
        const destPath = path.join(staticUploadsDir, file);
        if (!fs.existsSync(destPath)) {
          fs.copyFileSync(srcPath, destPath);
          console.log(`Copied image: ${file}`);
        }
      }
    }
    
    // Read the index.html file
    const indexPath = path.join(__dirname, '../../index.html');
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    
    // Find the portfolio section - use regex to handle multi-line formatting
    const portfolioStartMarker = 'id="pxl_portfolio-99a9dd8-9958"';
    const portfolioEndMarker = '</div>\n            </div>\n                </div>';
    
    const startIndex = indexContent.indexOf(portfolioStartMarker);
    if (startIndex === -1) {
      console.error('Could not find portfolio section marker');
      return { success: false, error: 'Could not find portfolio section marker in index.html' };
    }
    
    // Find the opening <div> tag that contains the id (may be on a previous line)
    let divStartIndex = indexContent.lastIndexOf('<div', startIndex);
    if (divStartIndex === -1) {
      divStartIndex = startIndex;
    }
    
    // Find the end of the portfolio grid
    const searchStart = startIndex + portfolioStartMarker.length;
    let depth = 1;
    let endIndex = searchStart;
    let foundEnd = false;
    
    // Navigate through the HTML to find the closing div
    const remainingContent = indexContent.substring(searchStart);
    for (let i = 0; i < remainingContent.length && depth > 0; i++) {
      if (remainingContent[i] === '<' && remainingContent.substring(i, i + 4) === '<div') {
        depth++;
      } else if (remainingContent[i] === '<' && remainingContent.substring(i, i + 5) === '</div') {
        depth--;
        if (depth === 0) {
          endIndex = searchStart + i;
          foundEnd = true;
          break;
        }
      }
    }
    
    if (!foundEnd) {
      console.error('Could not find end of portfolio section');
      return { success: false, error: 'Could not find end of portfolio section in index.html' };
    }
    
    // Generate new portfolio items HTML
    const portfolioItemsHTML = projects.map((project, index) => generatePortfolioItemHTML(project, index)).join('\n');
    
    // Generate Load More button
    const loadMoreButton = generateLoadMoreButton(projects.length);
    
    // Generate Load More script
    const loadMoreScript = generateLoadMoreScript();
    
    // Build the new portfolio section
    const newPortfolioSection = `<div id="pxl_portfolio-99a9dd8-9958" class="pxl-grid pxl-portfolio-grid pxl-layout-portfolio pxl-layout-portfolio3 pxl-post-accordion" data-start-page="1" data-max-pages="1" data-total="${projects.length}" data-perpage="${INITIAL_ITEMS_COUNT}" data-next-link="" data-loadmore="">
            <div class="pxl-grid-inner row">
${portfolioItemsHTML}
            </div>
            ${loadMoreButton}
        </div>
        ${loadMoreScript}`;
    
    // Replace the old portfolio section - use divStartIndex to include the opening <div
    const newContent = indexContent.substring(0, divStartIndex) + newPortfolioSection + indexContent.substring(endIndex + 6);
    
    // Write the updated index.html
    fs.writeFileSync(indexPath, newContent, 'utf8');
    console.log('Updated index.html with portfolio items');
    
    // ========== AI SECTORS SECTION ==========
    // Read the updated index.html file
    let aiIndexContent = fs.readFileSync(indexPath, 'utf8');
    
    // Find the AI Sectors section - use id pattern to handle multi-line formatting
    const aiSectorsIdMarker = 'id="pxl_portfolio-15bf4fe-5345"';
    const aiSectorsEndMarker = '<span class="pxl-grid-loader"></span>';
    
    const aiIdIndex = aiIndexContent.indexOf(aiSectorsIdMarker);
    if (aiIdIndex === -1) {
      console.error('Could not find AI Sectors section marker');
    } else {
      // Find the opening <div> tag that contains the id
      let aiDivStartIndex = aiIndexContent.lastIndexOf('<div', aiIdIndex);
      if (aiDivStartIndex === -1) {
        aiDivStartIndex = aiIdIndex;
      }
      
      // Generate new AI Sectors items HTML
      const aiSectorItemsHTML = aiSectors.map((sector, index) => generateAiSectorItemHTML(sector, index)).join('\n');
      
      // Build the new AI Sectors section
      const newAiSectorsSection = `<div id="pxl_portfolio-15bf4fe-5345" class="pxl-grid pxl-portfolio-grid pxl-layout-portfolio pxl-layout-portfolio3 pxl-post-accordion" data-start-page="1" data-max-pages="1" data-total="${aiSectors.length}" data-perpage="5" data-next-link="" data-loadmore="">
            <div class="pxl-grid-inner row">
${aiSectorItemsHTML}
                    </div>
            <span class="pxl-grid-loader"></span>`;
      
      // Find where to end the replacement (after the loader span)
      const aiEndIndex = aiIndexContent.indexOf(aiSectorsEndMarker, aiIdIndex);
      if (aiEndIndex !== -1) {
        const aiNewContent = aiIndexContent.substring(0, aiDivStartIndex) + newAiSectorsSection + aiIndexContent.substring(aiEndIndex + aiSectorsEndMarker.length);
        
        // Write the updated index.html
        fs.writeFileSync(indexPath, aiNewContent, 'utf8');
        console.log('Updated index.html with AI Sectors items');
      }
    }
    
    // Generate individual portfolio pages
    const portfolioDir = path.join(__dirname, '../../portfolio');
    
    for (const project of projects) {
      const projectDir = path.join(portfolioDir, project.slug);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(projectDir)) {
        fs.mkdirSync(projectDir, { recursive: true });
      }
      
      // Generate and write the portfolio page
      const pageHTML = generatePortfolioPageHTML(project);
      fs.writeFileSync(path.join(projectDir, 'index.html'), pageHTML, 'utf8');
      console.log(`Generated portfolio page: ${project.slug}`);
    }
    
    // Generate individual AI sector pages
    const aiSectorDir = path.join(__dirname, '../../ai-sector');
    
    for (const sector of aiSectors) {
      const sectorPageDir = path.join(aiSectorDir, sector.slug);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(sectorPageDir)) {
        fs.mkdirSync(sectorPageDir, { recursive: true });
      }
      
      // Generate and write the AI sector page
      const pageHTML = generateAiSectorPageHTML(sector);
      fs.writeFileSync(path.join(sectorPageDir, 'index.html'), pageHTML, 'utf8');
      console.log(`Generated AI sector page: ${sector.slug}`);
    }
    
    console.log('Static site generation complete!');
    return { success: true, projectsGenerated: projects.length, aiSectorsGenerated: aiSectors.length };
  } catch (error) {
    console.error('Error generating static site:', error);
    return { success: false, error: error.message };
  }
}

// Run if called directly
if (require.main === module) {
  generateStaticSite().then(() => {
    mongoose.connection.close();
    process.exit(0);
  });
}

module.exports = generateStaticSite;
