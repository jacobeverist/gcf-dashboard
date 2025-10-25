/**
 * Thumbnail Generator
 *
 * Generates thumbnail images from ReactFlow canvas
 * Note: Requires html-to-image library (optional dependency)
 * Install with: npm install html-to-image
 */

// Will be loaded dynamically when needed
let htmlToImage = null;
let htmlToImageLoadAttempted = false;

/**
 * Attempt to load html-to-image library dynamically
 * @returns {Promise<boolean>} True if loaded successfully
 */
async function loadHtmlToImage() {
    // TODO: Uncomment when html-to-image is installed (npm install html-to-image)
    // if (htmlToImageLoadAttempted) {
    //     return htmlToImage !== null;
    // }
    //
    // htmlToImageLoadAttempted = true;
    //
    // try {
    //     htmlToImage = await import('html-to-image');
    //     console.log('[Thumbnail Generator] html-to-image loaded successfully');
    //     return true;
    // } catch (error) {
    //     console.warn('[Thumbnail Generator] html-to-image not available. Thumbnails will use placeholders.');
    //     return false;
    // }

    // For now, always use placeholders
    return false;
}

/**
 * Generate thumbnail from ReactFlow canvas
 * @param {HTMLElement} canvasElement - ReactFlow viewport element
 * @param {object} options - Thumbnail options
 * @returns {Promise<string|null>} Base64 data URL or null
 */
export async function generateThumbnail(canvasElement, options = {}) {
    const {
        width = 300,
        height = 200,
        quality = 0.8,
        backgroundColor = '#1a1a1a',
    } = options;

    // Try to load html-to-image
    const loaded = await loadHtmlToImage();

    // If html-to-image not available, return placeholder
    if (!loaded || !htmlToImage || !htmlToImage.toPng) {
        console.warn('[Thumbnail Generator] Cannot generate thumbnail, using placeholder');
        return generatePlaceholder(width, height, backgroundColor);
    }

    try {
        // Find the ReactFlow viewport element
        const viewport = canvasElement.querySelector('.react-flow__viewport') || canvasElement;

        // Generate PNG from element
        const dataUrl = await htmlToImage.toPng(viewport, {
            cacheBust: true,
            backgroundColor,
            width,
            height,
            quality,
            pixelRatio: 1,
        });

        console.log('[Thumbnail Generator] Generated thumbnail');
        return dataUrl;
    } catch (error) {
        console.error('[Thumbnail Generator] Failed to generate thumbnail:', error);
        return generatePlaceholder(width, height, backgroundColor);
    }
}

/**
 * Generate a placeholder thumbnail (SVG-based)
 * @param {number} width - Thumbnail width
 * @param {number} height - Thumbnail height
 * @param {string} backgroundColor - Background color
 * @returns {string} Data URL for SVG placeholder
 */
export function generatePlaceholder(width = 300, height = 200, backgroundColor = '#1a1a1a') {
    const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="${backgroundColor}"/>
            <circle cx="100" cy="100" r="30" fill="#4A9EFF" opacity="0.3"/>
            <circle cx="200" cy="100" r="30" fill="#FF9E4A" opacity="0.3"/>
            <line x1="130" y1="100" x2="170" y2="100" stroke="#666" stroke-width="2"/>
            <text x="${width / 2}" y="${height / 2 + 60}"
                  font-family="Arial" font-size="14" fill="#666"
                  text-anchor="middle">
                Network Template
            </text>
        </svg>
    `;

    const encoded = btoa(unescape(encodeURIComponent(svg)));
    return `data:image/svg+xml;base64,${encoded}`;
}

/**
 * Resize image data URL to specific dimensions
 * @param {string} dataUrl - Original image data URL
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @returns {Promise<string>} Resized image data URL
 */
export async function resizeThumbnail(dataUrl, maxWidth = 300, maxHeight = 200) {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Calculate new dimensions maintaining aspect ratio
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }

            canvas.width = width;
            canvas.height = height;

            // Draw resized image
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to data URL
            resolve(canvas.toDataURL('image/png', 0.8));
        };

        img.onerror = (error) => {
            console.error('[Thumbnail Generator] Failed to resize thumbnail:', error);
            reject(error);
        };

        img.src = dataUrl;
    });
}

/**
 * Generate thumbnail for network state directly
 * @param {Array} nodes - Network nodes
 * @param {Array} edges - Network edges
 * @param {object} options - Generation options
 * @returns {string} Placeholder thumbnail
 */
export function generateThumbnailFromState(nodes, edges, options = {}) {
    const {
        width = 300,
        height = 200,
        backgroundColor = '#1a1a1a',
    } = options;

    // Create a simple visualization of the network structure
    const svg = createNetworkSVG(nodes, edges, width, height, backgroundColor);
    const encoded = btoa(unescape(encodeURIComponent(svg)));
    return `data:image/svg+xml;base64,${encoded}`;
}

/**
 * Create SVG representation of network
 * @param {Array} nodes - Network nodes
 * @param {Array} edges - Network edges
 * @param {number} width - SVG width
 * @param {number} height - SVG height
 * @param {string} backgroundColor - Background color
 * @returns {string} SVG markup
 */
function createNetworkSVG(nodes, edges, width, height, backgroundColor) {
    if (nodes.length === 0) {
        return `
            <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="${backgroundColor}"/>
                <text x="${width / 2}" y="${height / 2}"
                      font-family="Arial" font-size="14" fill="#666"
                      text-anchor="middle">
                    Empty Network
                </text>
            </svg>
        `;
    }

    // Calculate bounds
    const positions = nodes.map(n => n.position);
    const minX = Math.min(...positions.map(p => p.x));
    const maxX = Math.max(...positions.map(p => p.x));
    const minY = Math.min(...positions.map(p => p.y));
    const maxY = Math.max(...positions.map(p => p.y));

    const boundWidth = maxX - minX || 100;
    const boundHeight = maxY - minY || 100;

    // Scale to fit thumbnail
    const padding = 20;
    const scale = Math.min(
        (width - 2 * padding) / boundWidth,
        (height - 2 * padding) / boundHeight
    );

    // Create SVG elements
    let svgContent = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
    svgContent += `<rect width="100%" height="100%" fill="${backgroundColor}"/>`;

    // Draw edges
    edges.forEach(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);

        if (sourceNode && targetNode) {
            const x1 = (sourceNode.position.x - minX) * scale + padding;
            const y1 = (sourceNode.position.y - minY) * scale + padding;
            const x2 = (targetNode.position.x - minX) * scale + padding;
            const y2 = (targetNode.position.y - minY) * scale + padding;

            const strokeColor = edge.type === 'context' ? '#888' : '#4A9EFF';
            const strokeDasharray = edge.type === 'context' ? '4,2' : '0';

            svgContent += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
                          stroke="${strokeColor}" stroke-width="1.5"
                          stroke-dasharray="${strokeDasharray}" opacity="0.6"/>`;
        }
    });

    // Draw nodes
    nodes.forEach(node => {
        const x = (node.position.x - minX) * scale + padding;
        const y = (node.position.y - minY) * scale + padding;
        const nodeColor = getNodeColor(node.data.blockType);

        svgContent += `<circle cx="${x}" cy="${y}" r="6" fill="${nodeColor}" opacity="0.8"/>`;
    });

    svgContent += '</svg>';
    return svgContent;
}

/**
 * Get color for block type
 * @param {string} blockType - Block type
 * @returns {string} Color hex code
 */
function getNodeColor(blockType) {
    const colorMap = {
        ScalarTransformer: '#4A9EFF',
        DiscreteTransformer: '#FF9E4A',
        PersistenceTransformer: '#A64AFF',
        PatternPooler: '#4AFFDB',
        PatternClassifier: '#FF4A9E',
        SequenceLearner: '#FFE44A',
        ContextLearner: '#4AFF9E',
    };

    return colorMap[blockType] || '#888888';
}

/**
 * Check if html-to-image is available
 * @returns {Promise<boolean>} Availability status
 */
export async function isThumbnailGenerationAvailable() {
    const loaded = await loadHtmlToImage();
    return loaded && htmlToImage !== null && htmlToImage.toPng !== undefined;
}
