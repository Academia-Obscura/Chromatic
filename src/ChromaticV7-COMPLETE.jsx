import React, { useState, useRef, useCallback, useEffect } from 'react';

export default function App() {
  const [image, setImage] = useState(null);
  const [colors, setColors] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [harmonies, setHarmonies] = useState({});
  const [activeTab, setActiveTab] = useState('palette');
  const [copyNotification, setCopyNotification] = useState('');
  const [colorCount, setColorCount] = useState(6);
  const [selectedFont, setSelectedFont] = useState('Inter');
  const [previewBg, setPreviewBg] = useState('light');
  const [fontSize, setFontSize] = useState({ h1: 48, h2: 32, body: 16 });
  const [selectedHarmony, setSelectedHarmony] = useState('complementary');
  const [theme, setTheme] = useState('cyber');
  const [generatedPalette, setGeneratedPalette] = useState([]);
  const [selectedMood, setSelectedMood] = useState(null);
  const [appBgColor, setAppBgColor] = useState(null);
  const [imageAvgColor, setImageAvgColor] = useState(null);
  const [activeLayerId, setActiveLayerId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Palette generator
  const [palettePrompt, setPalettePrompt] = useState('');
  const [recentPrompts, setRecentPrompts] = useState([]);
  const [lockedColors, setLockedColors] = useState([]);
  
  // Font pairing
  const [fontPairPrompt, setFontPairPrompt] = useState('');
  const [selectedHeadingFont, setSelectedHeadingFont] = useState('Space Grotesk');
  const [selectedBodyFont, setSelectedBodyFont] = useState('Inter');
  const [fontPreviewHeading, setFontPreviewHeading] = useState('Your Headline Here');
  const [fontPreviewSubhead, setFontPreviewSubhead] = useState('Your subheading text goes here to preview the pairing');
  const [fontPreviewBg, setFontPreviewBg] = useState('light');
  const [suggestedPairs, setSuggestedPairs] = useState([]);
  
  // Smart color mode
  const [smartColorEnabled, setSmartColorEnabled] = useState(false);
  const smartColorCanvasRef = useRef(null);
  
  // V7+ NEW: Hex input for palette generation
  const [hexInput, setHexInput] = useState('');
  const [hexHarmonyType, setHexHarmonyType] = useState('complementary');
  
  // V7+ NEW: Overlay palette suggestions
  const [overlaySets, setOverlaySets] = useState([]);
  const [selectedOverlaySetId, setSelectedOverlaySetId] = useState(null);
  
  // V7+ NEW: Shape layers
  const [shapeLayers, setShapeLayers] = useState([]);
  const [activeShapeId, setActiveShapeId] = useState(null);
  const [isDraggingShape, setIsDraggingShape] = useState(false);
  const [shapeDragOffset, setShapeDragOffset] = useState({ x: 0, y: 0 });
  
  // V7+ NEW: Multi-card mode
  const [multiCardMode, setMultiCardMode] = useState({
    enabled: false,
    cardCount: 3,
    overlaySetId: null,
    cards: []
  });
  
  // V7+ NEW: Preview mode toggle
  const [previewMode, setPreviewMode] = useState(false);
  
  // V7+ NEW: Text color suggestions cache
  const [textColorSuggestions, setTextColorSuggestions] = useState({});
  
  // Multiple text layers support
  const [textLayers, setTextLayers] = useState([
    {
      id: 1,
      enabled: true,
      text: 'Your Headline',
      type: 'header',
      color: '#ffffff',
      bgEnabled: false,
      bgColor: '#000000',
      bgOpacity: 80,
      bgPaddingH: 20,
      bgPaddingV: 12,
      bgWidth: 'auto', // auto, full, custom
      bgCustomWidth: 100,
      autoBg: true, // auto-select best contrasting bg when text color changes
      position: { x: 50, y: 50 }, // percentage based
      fontSize: 48,
      fontWeight: '700',
      textAlign: 'center',
      letterSpacing: 0,
      preset: 'bold',
      colorMode: 'auto', // V7+ NEW: auto | global | custom
      globalColorIndex: 0, // V7+ NEW: which palette color
      linkedCardId: null // V7+ NEW: for multi-card mode
    }
  ]);

  // Ad format presets
  const [adFormat, setAdFormat] = useState(null);
  const adFormats = {
    'ig-story': { name: 'IG Story', width: 1080, height: 1920, ratio: '9:16' },
    'ig-feed': { name: 'IG Feed', width: 1080, height: 1080, ratio: '1:1' },
    'ig-landscape': { name: 'IG Landscape', width: 1080, height: 566, ratio: '1.91:1' },
    'fb-cover': { name: 'FB Cover', width: 820, height: 312, ratio: '2.63:1' },
    'twitter': { name: 'Twitter/X', width: 1200, height: 675, ratio: '16:9' },
    'pinterest': { name: 'Pinterest', width: 1000, height: 1500, ratio: '2:3' },
    'linkedin': { name: 'LinkedIn', width: 1200, height: 627, ratio: '1.91:1' }
  };

  // Text style presets
  const textPresets = {
    bold: { name: 'Bold Impact', fontWeight: '700', letterSpacing: -1, fontSize: 48 },
    clean: { name: 'Clean Modern', fontWeight: '500', letterSpacing: 0, fontSize: 42 },
    elegant: { name: 'Elegant Serif', fontWeight: '400', letterSpacing: 2, fontSize: 40 },
    minimal: { name: 'Minimal', fontWeight: '300', letterSpacing: 4, fontSize: 36 },
    loud: { name: 'Loud & Proud', fontWeight: '900', letterSpacing: -2, fontSize: 56 }
  };

  // Color keyword mappings for palette generation
  const colorKeywords = {
    calm: { h: [180, 220], s: [20, 40], l: [50, 70] },
    energetic: { h: [0, 60], s: [70, 100], l: [50, 60] },
    luxury: { h: [270, 310], s: [30, 60], l: [20, 40] },
    playful: { h: [280, 340], s: [60, 80], l: [55, 70] },
    serious: { h: [200, 240], s: [20, 40], l: [25, 45] },
    warm: { h: [0, 50], s: [50, 80], l: [45, 65] },
    cool: { h: [180, 240], s: [40, 70], l: [40, 60] },
    natural: { h: [60, 150], s: [30, 60], l: [35, 55] },
    bold: { h: [0, 360], s: [80, 100], l: [45, 55] },
    muted: { h: [0, 360], s: [10, 30], l: [40, 60] },
    fresh: { h: [80, 160], s: [50, 80], l: [50, 70] },
    elegant: { h: [0, 60], s: [10, 30], l: [20, 40] },
    vintage: { h: [20, 60], s: [30, 50], l: [40, 60] },
    modern: { h: [200, 260], s: [60, 90], l: [45, 60] },
    rustic: { h: [20, 50], s: [40, 60], l: [30, 50] },
    tropical: { h: [140, 200], s: [60, 90], l: [45, 65] },
    romantic: { h: [330, 360], s: [40, 70], l: [60, 80] },
    professional: { h: [200, 230], s: [50, 80], l: [30, 50] },
    creative: { h: [260, 320], s: [60, 90], l: [50, 65] },
    trustworthy: { h: [200, 220], s: [60, 80], l: [35, 50] },
    friendly: { h: [30, 60], s: [60, 80], l: [55, 70] },
    sophisticated: { h: [0, 30], s: [10, 30], l: [15, 35] },
    retro: { h: [10, 50], s: [50, 80], l: [50, 65] },
    minimalist: { h: [0, 360], s: [0, 15], l: [30, 90] },
    vibrant: { h: [0, 360], s: [85, 100], l: [50, 60] },
    earthy: { h: [25, 45], s: [35, 55], l: [30, 50] },
    oceanic: { h: [180, 210], s: [50, 80], l: [40, 60] },
    sunset: { h: [0, 45], s: [70, 100], l: [50, 70] },
    forest: { h: [100, 150], s: [40, 70], l: [25, 45] },
    pastel: { h: [0, 360], s: [30, 50], l: [75, 90] },
    neon: { h: [0, 360], s: [100, 100], l: [50, 60] },
    autumn: { h: [15, 45], s: [60, 85], l: [40, 60] },
    winter: { h: [200, 240], s: [20, 50], l: [70, 90] },
    spring: { h: [80, 160], s: [50, 75], l: [60, 80] },
    summer: { h: [40, 60], s: [70, 100], l: [55, 70] },
    night: { h: [230, 280], s: [40, 70], l: [15, 35] },
    corporate: { h: [200, 230], s: [60, 90], l: [30, 50] },
    startup: { h: [180, 280], s: [70, 100], l: [50, 65] },
    healthcare: { h: [160, 200], s: [40, 70], l: [45, 65] },
    tech: { h: [200, 270], s: [70, 100], l: [45, 60] },
    wellness: { h: [100, 180], s: [30, 60], l: [50, 70] },
    wedding: { h: [330, 60], s: [20, 50], l: [80, 95] },
    spa: { h: [140, 200], s: [20, 50], l: [60, 80] },
    coffee: { h: [20, 40], s: [40, 70], l: [20, 45] },
    beach: { h: [180, 220], s: [50, 80], l: [60, 80] },
    space: { h: [240, 280], s: [60, 90], l: [15, 35] },
    fire: { h: [0, 40], s: [90, 100], l: [45, 60] },
    ice: { h: [190, 220], s: [30, 60], l: [75, 95] },
    gold: { h: [40, 55], s: [70, 100], l: [45, 60] },
    royal: { h: [260, 290], s: [60, 90], l: [30, 50] },
    cyberpunk: { h: [280, 330], s: [80, 100], l: [45, 60] },
    bohemian: { h: [0, 60], s: [50, 80], l: [45, 65] },
    scandinavian: { h: [0, 60], s: [10, 30], l: [70, 95] },
    japanese: { h: [0, 30], s: [30, 60], l: [40, 70] },
    mediterranean: { h: [180, 220], s: [50, 80], l: [50, 70] }
  };

  // Font pairing database
  const fontPairs = {
    'modern minimal': [
      { heading: 'Space Grotesk', body: 'Inter' },
      { heading: 'Outfit', body: 'Source Sans Pro' },
      { heading: 'DM Sans', body: 'Inter' }
    ],
    'editorial luxury': [
      { heading: 'Playfair Display', body: 'Lora' },
      { heading: 'Cormorant Garamond', body: 'Crimson Pro' },
      { heading: 'Libre Baskerville', body: 'Source Serif Pro' }
    ],
    'tech forward': [
      { heading: 'Syne', body: 'IBM Plex Sans' },
      { heading: 'JetBrains Mono', body: 'Inter' },
      { heading: 'Space Mono', body: 'Work Sans' }
    ],
    'friendly approachable': [
      { heading: 'Quicksand', body: 'Nunito' },
      { heading: 'Poppins', body: 'Open Sans' },
      { heading: 'Comfortaa', body: 'Lato' }
    ],
    'classic professional': [
      { heading: 'Merriweather', body: 'Source Sans Pro' },
      { heading: 'Roboto Slab', body: 'Roboto' },
      { heading: 'Lora', body: 'Open Sans' }
    ],
    'bold statement': [
      { heading: 'Oswald', body: 'Quattrocento Sans' },
      { heading: 'Anton', body: 'Work Sans' },
      { heading: 'Bebas Neue', body: 'Montserrat' }
    ],
    'elegant sophisticated': [
      { heading: 'Cormorant', body: 'Raleway' },
      { heading: 'Playfair Display', body: 'Montserrat' },
      { heading: 'Cinzel', body: 'Fauna One' }
    ],
    'startup tech': [
      { heading: 'Plus Jakarta Sans', body: 'Inter' },
      { heading: 'Manrope', body: 'DM Sans' },
      { heading: 'Sora', body: 'Work Sans' }
    ],
    'creative artistic': [
      { heading: 'Abril Fatface', body: 'Lato' },
      { heading: 'Yeseva One', body: 'Roboto' },
      { heading: 'Rozha One', body: 'Poppins' }
    ]
  };

  const classicPairs = [
    { heading: 'Playfair Display', body: 'Source Sans Pro' },
    { heading: 'Space Grotesk', body: 'Inter' },
    { heading: 'Montserrat', body: 'Open Sans' },
    { heading: 'Oswald', body: 'Lato' },
    { heading: 'Merriweather', body: 'Roboto' }
  ];

  const canvasRef = useRef(null);
  const exportCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const paletteFileInputRef = useRef(null);
  const imageContainerRef = useRef(null);

  const themes = {
    modern: { name: 'Clean Modern', bg: '#ffffff', surface: '#f5f5f5', border: '#e0e0e0', text: '#171717', textMuted: '#737373', accent: '#171717', accentGlow: 'transparent', grid: false },
    cyber: { name: 'Y2K Cyber', bg: '#0a0a0f', surface: 'rgba(0, 255, 136, 0.02)', border: 'rgba(0, 255, 136, 0.2)', text: '#fafafa', textMuted: '#666', accent: '#00ff88', accentGlow: 'rgba(0, 255, 136, 0.3)', grid: true },
    brutalist: { name: 'Brutalist', bg: '#ffffff', surface: '#ffffff', border: '#000000', text: '#000000', textMuted: '#000000', accent: '#000000', accentGlow: 'transparent', grid: false },
    vapor: { name: 'Vaporwave', bg: '#1a0a2e', surface: 'rgba(255, 113, 206, 0.05)', border: 'rgba(255, 113, 206, 0.3)', text: '#fff1f9', textMuted: '#b794c7', accent: '#ff71ce', accentGlow: 'rgba(255, 113, 206, 0.4)', grid: true },
    terminal: { name: 'Terminal', bg: '#0d0d0d', surface: '#0d0d0d', border: '#33ff33', text: '#33ff33', textMuted: '#1a8c1a', accent: '#33ff33', accentGlow: 'rgba(51, 255, 51, 0.3)', grid: false, scanlines: true }
  };

  const moods = {
    vibrant: { name: 'Vibrant', desc: 'Bold, energetic', generate: () => { const h = Math.random() * 360; return [hslToHex(h, 85, 55), hslToHex((h + 30) % 360, 90, 50), hslToHex((h + 180) % 360, 85, 55), hslToHex((h + 210) % 360, 80, 60), hslToHex((h + 60) % 360, 75, 65), hslToHex(h, 90, 35)]; }},
    cool: { name: 'Cool', desc: 'Calm, professional', generate: () => { const h = 180 + Math.random() * 60; return [hslToHex(h, 60, 45), hslToHex(h + 20, 50, 55), hslToHex(h - 20, 55, 50), hslToHex(h, 40, 70), hslToHex(h + 10, 65, 35), hslToHex(h - 10, 30, 80)]; }},
    warm: { name: 'Warm', desc: 'Cozy, inviting', generate: () => { const h = Math.random() * 60; return [hslToHex(h, 75, 50), hslToHex(h + 20, 70, 55), hslToHex(h - 15, 80, 45), hslToHex(h + 10, 60, 70), hslToHex(h + 30, 65, 60), hslToHex(h, 50, 30)]; }},
    earthy: { name: 'Earthy', desc: 'Natural, grounded', generate: () => { const h = 30 + Math.random() * 30; return [hslToHex(h, 40, 35), hslToHex(h + 60, 35, 40), hslToHex(h - 10, 45, 45), hslToHex(h + 90, 30, 50), hslToHex(h + 20, 35, 60), hslToHex(h, 25, 75)]; }},
    pastel: { name: 'Pastel', desc: 'Soft, gentle', generate: () => { const h = Math.random() * 360; return [hslToHex(h, 50, 85), hslToHex((h + 60) % 360, 45, 82), hslToHex((h + 120) % 360, 55, 80), hslToHex((h + 180) % 360, 40, 85), hslToHex((h + 240) % 360, 50, 83), hslToHex((h + 300) % 360, 45, 80)]; }},
    moody: { name: 'Moody', desc: 'Dark, dramatic', generate: () => { const h = Math.random() * 360; return [hslToHex(h, 40, 20), hslToHex((h + 30) % 360, 50, 25), hslToHex((h + 180) % 360, 45, 30), hslToHex(h, 60, 15), hslToHex((h + 60) % 360, 35, 35), hslToHex((h + 210) % 360, 55, 22)]; }},
    neon: { name: 'Neon', desc: 'Electric, futuristic', generate: () => { const h = Math.random() * 360; return [hslToHex(h, 100, 50), hslToHex((h + 60) % 360, 100, 50), hslToHex((h + 180) % 360, 100, 50), hslToHex((h + 240) % 360, 100, 50), hslToHex((h + 120) % 360, 100, 50), hslToHex((h + 300) % 360, 100, 50)]; }},
    muted: { name: 'Muted', desc: 'Sophisticated, elegant', generate: () => { const h = Math.random() * 360; return [hslToHex(h, 20, 50), hslToHex((h + 40) % 360, 15, 55), hslToHex((h + 180) % 360, 25, 45), hslToHex((h + 90) % 360, 18, 60), hslToHex((h + 270) % 360, 22, 40), hslToHex(h, 12, 70)]; }}
  };

  const fonts = [
    { name: 'Inter', stack: 'Inter, -apple-system, sans-serif' },
    { name: 'Playfair Display', stack: '"Playfair Display", Georgia, serif' },
    { name: 'Space Grotesk', stack: '"Space Grotesk", sans-serif' },
    { name: 'JetBrains Mono', stack: '"JetBrains Mono", monospace' },
    { name: 'Outfit', stack: 'Outfit, sans-serif' },
    { name: 'Crimson Pro', stack: '"Crimson Pro", serif' },
  ];

  const harmonyDescriptions = {
    complementary: { name: 'Complementary', desc: 'High contrast, vibrant. Best for CTAs and headlines.', use: 'Hero sections, buttons' },
    triadic: { name: 'Triadic', desc: 'Balanced and vibrant with variety.', use: 'Illustrations, infographics' },
    splitComplementary: { name: 'Split Complementary', desc: 'Strong contrast, less tension.', use: 'Web design, presentations' },
    analogous: { name: 'Analogous', desc: 'Harmonious and serene.', use: 'Backgrounds, gradients' },
    tetradic: { name: 'Tetradic', desc: 'Rich and complex.', use: 'Dashboards, data viz' },
    tints: { name: 'Tints', desc: 'Lighter variations.', use: 'Backgrounds, hover states' },
    shades: { name: 'Shades', desc: 'Darker variations.', use: 'Text, shadows' }
  };

  // Color utility functions
  const hexToRgb = (hex) => { const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex); return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : null; };
  const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => { const h = Math.round(Math.min(255, Math.max(0, x))).toString(16); return h.length === 1 ? '0' + h : h; }).join('');
  const hslToHex = (h, s, l) => { const rgb = hslToRgb(h, s, l); return rgbToHex(rgb.r, rgb.g, rgb.b); };
  const rgbToHsl = (r, g, b) => { r /= 255; g /= 255; b /= 255; const max = Math.max(r, g, b), min = Math.min(r, g, b); let h, s, l = (max + min) / 2; if (max === min) { h = s = 0; } else { const d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min); switch (max) { case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break; case g: h = ((b - r) / d + 2) / 6; break; case b: h = ((r - g) / d + 4) / 6; break; default: h = 0; } } return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }; };
  const hslToRgb = (h, s, l) => { h /= 360; s /= 100; l /= 100; let r, g, b; if (s === 0) { r = g = b = l; } else { const hue2rgb = (p, q, t) => { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1/6) return p + (q - p) * 6 * t; if (t < 1/2) return q; if (t < 2/3) return p + (q - p) * (2/3 - t) * 6; return p; }; const q = l < 0.5 ? l * (1 + s) : l + s - l * s; const p = 2 * l - q; r = hue2rgb(p, q, h + 1/3); g = hue2rgb(p, q, h); b = hue2rgb(p, q, h - 1/3); } return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) }; };
  const getLuminance = (r, g, b) => { const [rs, gs, bs] = [r, g, b].map(c => { c = c / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }); return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs; };
  const getContrastRatio = (c1, c2) => { const rgb1 = hexToRgb(c1); const rgb2 = hexToRgb(c2); if (!rgb1 || !rgb2) return 1; const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b); const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b); return ((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2); };
  const getWcagRating = (ratio) => { const t = themes[theme]; if (ratio >= 7) return { rating: 'AAA', color: t.accent, label: 'Excellent' }; if (ratio >= 4.5) return { rating: 'AA', color: '#ffaa00', label: 'Good' }; if (ratio >= 3) return { rating: 'AA Large', color: '#ff6600', label: 'Large text' }; return { rating: 'Fail', color: '#ff0066', label: 'Poor' }; };
  const getTextColor = (bgHex) => { const rgb = hexToRgb(bgHex); if (!rgb) return '#000000'; return getLuminance(rgb.r, rgb.g, rgb.b) > 0.179 ? '#000000' : '#ffffff'; };

  // Get best text color for current image
  const getBestTextColor = useCallback(() => {
    if (!imageAvgColor) return '#ffffff';
    return getTextColor(imageAvgColor);
  }, [imageAvgColor]);

  // Get best text/bg combo based on current palette
  const getBestCombo = useCallback(() => {
    const availableColors = [...currentColors, '#ffffff', '#000000'];
    let bestCombo = { text: '#ffffff', bg: '#000000', ratio: 0 };
    
    availableColors.forEach(textColor => {
      availableColors.forEach(bgColor => {
        if (textColor !== bgColor) {
          const ratio = parseFloat(getContrastRatio(textColor, bgColor));
          if (ratio > bestCombo.ratio) {
            bestCombo = { text: textColor, bg: bgColor, ratio };
          }
        }
      });
    });
    
    return bestCombo;
  }, [colors, generatedPalette]);

  // Get best background color for a specific text color
  const getBestBgForTextColor = useCallback((textColor) => {
    const availableColors = [...currentColors, '#ffffff', '#000000'];
    let bestBg = '#000000';
    let bestRatio = 0;
    
    availableColors.forEach(bgColor => {
      if (textColor !== bgColor) {
        const ratio = parseFloat(getContrastRatio(textColor, bgColor));
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestBg = bgColor;
        }
      }
    });
    
    return bestBg;
  }, [colors, generatedPalette]);

  // Get overlay color options based on selected harmony
  const getOverlayColorOptions = useCallback(() => {
    const baseColors = ['#ffffff', '#000000'];
    const harmonyColors = harmonies[selectedHarmony] || [];
    const paletteColors = currentColors.slice(0, 4);
    
    // Combine and dedupe
    const allColors = [...new Set([...baseColors, ...harmonyColors, ...paletteColors])];
    return allColors.slice(0, 10);
  }, [harmonies, selectedHarmony, colors, generatedPalette]);

  // Generate palette from prompt
  const generatePaletteFromPrompt = useCallback((prompt) => {
    if (!prompt.trim()) return;
    
    const words = prompt.toLowerCase().split(/\s+/);
    let hRanges = [], sRanges = [], lRanges = [];
    
    words.forEach(word => {
      if (colorKeywords[word]) {
        const kw = colorKeywords[word];
        hRanges.push(kw.h);
        sRanges.push(kw.s);
        lRanges.push(kw.l);
      }
      Object.keys(colorKeywords).forEach(key => {
        if ((key.includes(word) || word.includes(key)) && !colorKeywords[word]) {
          const kw = colorKeywords[key];
          hRanges.push(kw.h);
          sRanges.push(kw.s);
          lRanges.push(kw.l);
        }
      });
    });
    
    if (hRanges.length === 0) {
      hRanges = [[0, 360]];
      sRanges = [[40, 70]];
      lRanges = [[40, 60]];
    }
    
    const newPalette = [];
    for (let i = 0; i < 6; i++) {
      if (lockedColors[i]) {
        newPalette.push(lockedColors[i]);
      } else {
        const hRange = hRanges[i % hRanges.length];
        const sRange = sRanges[i % sRanges.length];
        const lRange = lRanges[i % lRanges.length];
        
        const h = hRange[0] + Math.random() * (hRange[1] - hRange[0]);
        const s = sRange[0] + Math.random() * (sRange[1] - sRange[0]);
        const l = lRange[0] + Math.random() * (lRange[1] - lRange[0]);
        
        newPalette.push(hslToHex(h, s, l));
      }
    }
    
    setGeneratedPalette(newPalette);
    setColors(newPalette);
    setImage(null);
    if (newPalette.length > 0) {
      setSelectedColor(newPalette[0]);
      setHarmonies(generateHarmonies(newPalette[0]));
    }
    
    if (!recentPrompts.includes(prompt)) {
      setRecentPrompts([prompt, ...recentPrompts.slice(0, 4)]);
    }
  }, [lockedColors, recentPrompts]);

  // Generate font pairs from prompt
  const generateFontPairs = useCallback((prompt) => {
    if (!prompt.trim()) {
      setSuggestedPairs(classicPairs);
      return;
    }
    
    const words = prompt.toLowerCase().split(/\s+/);
    let matches = [];
    
    Object.keys(fontPairs).forEach(category => {
      const categoryWords = category.split(' ');
      let score = 0;
      words.forEach(word => {
        categoryWords.forEach(catWord => {
          if (catWord.includes(word) || word.includes(catWord)) {
            score += 1;
          }
        });
      });
      if (score > 0) {
        matches.push({ category, score, pairs: fontPairs[category] });
      }
    });
    
    matches.sort((a, b) => b.score - a.score);
    
    if (matches.length > 0) {
      const pairs = matches.flatMap(m => m.pairs).slice(0, 5);
      setSuggestedPairs(pairs);
      if (pairs.length > 0) {
        setSelectedHeadingFont(pairs[0].heading);
        setSelectedBodyFont(pairs[0].body);
      }
    } else {
      setSuggestedPairs(classicPairs);
    }
  }, []);

  // Sample region color for smart color mode
  const sampleRegionColor = useCallback((x, y) => {
    if (!image || !smartColorCanvasRef.current) return null;
    
    const canvas = smartColorCanvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const sampleSize = 50;
    const startX = Math.max(0, Math.floor((x / 100) * canvas.width - sampleSize / 2));
    const startY = Math.max(0, Math.floor((y / 100) * canvas.height - sampleSize / 2));
    const endX = Math.min(canvas.width, startX + sampleSize);
    const endY = Math.min(canvas.height, startY + sampleSize);
    
    try {
      const imageData = ctx.getImageData(startX, startY, endX - startX, endY - startY);
      let totalR = 0, totalG = 0, totalB = 0, count = 0;
      
      for (let i = 0; i < imageData.data.length; i += 4) {
        totalR += imageData.data[i];
        totalG += imageData.data[i + 1];
        totalB += imageData.data[i + 2];
        count++;
      }
      
      if (count > 0) {
        return rgbToHex(totalR / count, totalG / count, totalB / count);
      }
    } catch (e) {
      console.error('Error sampling region:', e);
    }
    
    return null;
  }, [image]);

  // Apply smart color to layer based on position
  const applySmartColorToLayer = useCallback((id, position) => {
    if (!smartColorEnabled || !image) return;
    
    const regionColor = sampleRegionColor(position.x, position.y);
    if (regionColor) {
      const layer = textLayers.find(l => l.id === id);
      if (layer) {
        const bestTextColor = getTextColor(regionColor);
        if (layer.bgEnabled && layer.autoBg) {
          const bestBg = getBestBgForTextColor(bestTextColor);
          updateTextLayer(id, { color: bestTextColor, bgColor: bestBg });
        } else {
          updateTextLayer(id, { color: bestTextColor });
        }
      }
    }
  }, [smartColorEnabled, image, sampleRegionColor, textLayers, getBestBgForTextColor]);

  const generateHarmonies = (hex) => {
    const rgb = hexToRgb(hex); if (!rgb) return {};
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    return {
      complementary: [hex, rgbToHex(...Object.values(hslToRgb((hsl.h + 180) % 360, hsl.s, hsl.l)))],
      triadic: [hex, rgbToHex(...Object.values(hslToRgb((hsl.h + 120) % 360, hsl.s, hsl.l))), rgbToHex(...Object.values(hslToRgb((hsl.h + 240) % 360, hsl.s, hsl.l)))],
      splitComplementary: [hex, rgbToHex(...Object.values(hslToRgb((hsl.h + 150) % 360, hsl.s, hsl.l))), rgbToHex(...Object.values(hslToRgb((hsl.h + 210) % 360, hsl.s, hsl.l)))],
      analogous: [rgbToHex(...Object.values(hslToRgb((hsl.h - 30 + 360) % 360, hsl.s, hsl.l))), hex, rgbToHex(...Object.values(hslToRgb((hsl.h + 30) % 360, hsl.s, hsl.l)))],
      tetradic: [hex, rgbToHex(...Object.values(hslToRgb((hsl.h + 90) % 360, hsl.s, hsl.l))), rgbToHex(...Object.values(hslToRgb((hsl.h + 180) % 360, hsl.s, hsl.l))), rgbToHex(...Object.values(hslToRgb((hsl.h + 270) % 360, hsl.s, hsl.l)))],
      tints: Array.from({ length: 5 }, (_, i) => rgbToHex(...Object.values(hslToRgb(hsl.h, hsl.s, Math.min(95, hsl.l + (i + 1) * 10))))),
      shades: Array.from({ length: 5 }, (_, i) => rgbToHex(...Object.values(hslToRgb(hsl.h, hsl.s, Math.max(5, hsl.l - (i + 1) * 10)))))
    };
  };

  const extractColors = useCallback((imageData, k = 6) => {
    const pixels = [];
    let totalR = 0, totalG = 0, totalB = 0, pixelCount = 0;
    
    for (let i = 0; i < imageData.data.length; i += 4) {
      if (imageData.data[i + 3] > 128) {
        pixels.push([imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]]);
        totalR += imageData.data[i];
        totalG += imageData.data[i + 1];
        totalB += imageData.data[i + 2];
        pixelCount++;
      }
    }
    
    // Calculate average color
    if (pixelCount > 0) {
      const avgColor = rgbToHex(totalR / pixelCount, totalG / pixelCount, totalB / pixelCount);
      setImageAvgColor(avgColor);
    }
    
    let centroids = Array.from({ length: k }, () => pixels[Math.floor(Math.random() * pixels.length)]);
    for (let iter = 0; iter < 15; iter++) {
      const clusters = Array.from({ length: k }, () => []);
      pixels.forEach(pixel => {
        let minDist = Infinity, idx = 0;
        centroids.forEach((c, i) => { const d = Math.sqrt((pixel[0] - c[0]) ** 2 + (pixel[1] - c[1]) ** 2 + (pixel[2] - c[2]) ** 2); if (d < minDist) { minDist = d; idx = i; } });
        clusters[idx].push(pixel);
      });
      centroids = clusters.map((cluster, i) => cluster.length === 0 ? centroids[i] : [cluster.reduce((s, p) => s + p[0], 0) / cluster.length, cluster.reduce((s, p) => s + p[1], 0) / cluster.length, cluster.reduce((s, p) => s + p[2], 0) / cluster.length]);
    }
    return centroids.map(c => rgbToHex(c[0], c[1], c[2]));
  }, []);

  const processImage = useCallback((imgSrc, count) => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const scale = Math.min(300 / img.width, 300 / img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Also draw to smart color canvas for region sampling
      if (smartColorCanvasRef.current) {
        const smartCanvas = smartColorCanvasRef.current;
        const smartCtx = smartCanvas.getContext('2d');
        smartCanvas.width = img.width * scale;
        smartCanvas.height = img.height * scale;
        smartCtx.drawImage(img, 0, 0, smartCanvas.width, smartCanvas.height);
      }
      
      const extracted = extractColors(ctx.getImageData(0, 0, canvas.width, canvas.height), count);
      setColors(extracted);
      // V7+ NEW: Generate overlay sets from image
      if (extracted.length > 0 && imageAvgColor) {
        const sets = generateOverlaySets(img, imageAvgColor);
        setOverlaySets(sets);
      }
      setGeneratedPalette([]);
      setSelectedMood(null);
      if (extracted.length > 0) { setSelectedColor(extracted[0]); setHarmonies(generateHarmonies(extracted[0])); }
    };
    img.src = imgSrc;
  }, [extractColors]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => { setImage(event.target.result); processImage(event.target.result, colorCount); };
    reader.readAsDataURL(file);
  };

  const handleColorCountChange = (count) => { setColorCount(count); if (image) processImage(image, count); };
  const handleColorSelect = (color) => { setSelectedColor(color); setHarmonies(generateHarmonies(color)); };
  const handleMoodGenerate = (moodKey) => {
    const palette = moods[moodKey].generate();
    setGeneratedPalette(palette); setSelectedMood(moodKey); setColors(palette); setImage(null);
    if (palette.length > 0) { setSelectedColor(palette[0]); setHarmonies(generateHarmonies(palette[0])); }
  };
  const copyToClipboard = async (text, label) => { try { await navigator.clipboard.writeText(text); setCopyNotification(`Copied ${label}`); setTimeout(() => setCopyNotification(''), 2000); } catch (err) { console.error('Failed to copy:', err); } };

  // Text layer management
  const addTextLayer = () => {
    const newLayer = {
      id: Date.now(),
      enabled: true,
      text: textLayers.length === 0 ? 'Your Headline' : textLayers.length === 1 ? 'Subheadline here' : 'Call to action →',
      type: textLayers.length === 0 ? 'header' : textLayers.length === 1 ? 'subhead' : 'cta',
      color: getBestTextColor(),
      bgEnabled: false,
      bgColor: '#000000',
      bgOpacity: 80,
      bgPaddingH: 20,
      bgPaddingV: 12,
      bgWidth: 'auto',
      bgCustomWidth: 100,
      autoBg: true,
      position: { x: 50, y: 30 + (textLayers.length * 20) },
      fontSize: textLayers.length === 0 ? 48 : textLayers.length === 1 ? 24 : 18,
      fontWeight: textLayers.length === 0 ? '700' : '500',
      textAlign: 'center',
      letterSpacing: 0,
      preset: 'clean'
    };
    setTextLayers([...textLayers, newLayer]);
    setActiveLayerId(newLayer.id);
  };

  const updateTextLayer = (id, updates) => {
    setTextLayers(textLayers.map(layer => 
      layer.id === id ? { ...layer, ...updates } : layer
    ));
  };

  // Update text color with auto background selection
  const updateTextColorWithAutoBg = (id, newTextColor) => {
    const layer = textLayers.find(l => l.id === id);
    if (layer && layer.bgEnabled && layer.autoBg) {
      const bestBg = getBestBgForTextColor(newTextColor);
      updateTextLayer(id, { color: newTextColor, bgColor: bestBg });
    } else {
      updateTextLayer(id, { color: newTextColor });
    }
  };

  const deleteTextLayer = (id) => {
    setTextLayers(textLayers.filter(layer => layer.id !== id));
    if (activeLayerId === id) {
      setActiveLayerId(textLayers.length > 1 ? textLayers[0].id : null);
    }
  };

  const applyPresetToLayer = (id, presetKey) => {
    const preset = textPresets[presetKey];
    updateTextLayer(id, {
      fontWeight: preset.fontWeight,
      letterSpacing: preset.letterSpacing,
      fontSize: preset.fontSize,
      preset: presetKey
    });
  };

  const applyBestComboToLayer = (id) => {
    const best = getBestCombo();
    updateTextLayer(id, {
      color: best.text,
      bgEnabled: true,
      bgColor: best.bg,
      bgOpacity: 90
    });
  };

  // Drag handlers for text positioning
  const handleDragStart = (e, layerId) => {
    if (!imageContainerRef.current) return;
    e.preventDefault();
    setIsDragging(true);
    setActiveLayerId(layerId);
    
    const rect = imageContainerRef.current.getBoundingClientRect();
    const layer = textLayers.find(l => l.id === layerId);
    if (!layer) return;
    
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    setDragOffset({
      x: clientX - (rect.left + (layer.position.x / 100) * rect.width),
      y: clientY - (rect.top + (layer.position.y / 100) * rect.height)
    });
  };

  const handleDragMove = useCallback((e) => {
    if (!isDragging || !imageContainerRef.current || !activeLayerId) return;
    
    const rect = imageContainerRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    const x = Math.max(0, Math.min(100, ((clientX - rect.left - dragOffset.x) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top - dragOffset.y) / rect.height) * 100));
    
    updateTextLayer(activeLayerId, { position: { x, y } });
    
    // Apply smart color if enabled
    if (smartColorEnabled) {
      applySmartColorToLayer(activeLayerId, { x, y });
    }
  }, [isDragging, activeLayerId, dragOffset, smartColorEnabled, applySmartColorToLayer]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove);
      window.addEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  // V7+ NEW: Shape dragging event listeners
  useEffect(() => {
    if (isDraggingShape) {
      window.addEventListener('mousemove', handleShapeDragMove);
      window.addEventListener('mouseup', handleShapeDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleShapeDragMove);
      window.removeEventListener('mouseup', handleShapeDragEnd);
    };
  }, [isDraggingShape, handleShapeDragMove, handleShapeDragEnd]);

  // Export image with overlays
  const exportWithOverlay = async (format = 'png') => {
    if (!image) return;
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = exportCanvasRef.current;
      const ctx = canvas.getContext('2d');
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      // Draw text layers
      textLayers.filter(l => l.enabled).forEach(layer => {
        const x = (layer.position.x / 100) * canvas.width;
        const y = (layer.position.y / 100) * canvas.height;
        const scaledFontSize = (layer.fontSize / 100) * Math.min(canvas.width, canvas.height) * 0.3;
        
        ctx.font = `${layer.fontWeight} ${scaledFontSize}px ${fonts.find(f => f.name === selectedFont)?.stack || 'sans-serif'}`;
        ctx.textAlign = layer.textAlign;
        ctx.textBaseline = 'middle';
        
        const metrics = ctx.measureText(layer.text);
        const textWidth = metrics.width;
        const textHeight = scaledFontSize;
        
        // Draw background if enabled
        if (layer.bgEnabled) {
          const paddingH = (layer.bgPaddingH / 100) * canvas.width * 0.1;
          const paddingV = (layer.bgPaddingV / 100) * canvas.height * 0.1;
          
          ctx.fillStyle = layer.bgColor;
          ctx.globalAlpha = layer.bgOpacity / 100;
          
          let bgWidth = textWidth + paddingH * 2;
          if (layer.bgWidth === 'full') {
            bgWidth = canvas.width;
          } else if (layer.bgWidth === 'custom') {
            bgWidth = (layer.bgCustomWidth / 100) * canvas.width;
          }
          
          const bgX = layer.textAlign === 'center' ? x - bgWidth / 2 : layer.textAlign === 'right' ? x - bgWidth : x;
          
          ctx.fillRect(bgX, y - textHeight / 2 - paddingV, bgWidth, textHeight + paddingV * 2);
          ctx.globalAlpha = 1;
        }
        
        // Draw text
        ctx.fillStyle = layer.color;
        ctx.letterSpacing = `${layer.letterSpacing}px`;
        ctx.fillText(layer.text, x, y);
      });
      
      // Download
      const link = document.createElement('a');
      link.download = `chromatic-export.${format}`;
      link.href = canvas.toDataURL(`image/${format}`, 0.95);
      link.click();
    };
    
    img.src = image;
  };

  const generateExport = (format) => {
    const exp = colors.length > 0 ? colors : generatedPalette;
    if (exp.length === 0) return '';
    switch (format) {
      case 'css': return `:root {\n${exp.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n')}\n}`;
      case 'tailwind': return `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n${exp.map((c, i) => `        'brand-${i + 1}': '${c}',`).join('\n')}\n      }\n    }\n  }\n}`;
      case 'scss': return exp.map((c, i) => `$color-${i + 1}: ${c};`).join('\n');
      case 'json': return JSON.stringify(exp.reduce((acc, c, i) => ({ ...acc, [`color-${i + 1}`]: c }), {}), null, 2);
      case 'figma': return exp.map((c, i) => { const rgb = hexToRgb(c); return `Color ${i + 1}: ${c}\nRGB: ${rgb.r}, ${rgb.g}, ${rgb.b}`; }).join('\n\n');
      default: return exp.join(', ');
    }
  };

  const currentTheme = themes[theme];
  const currentColors = colors.length > 0 ? colors : generatedPalette;
  const effectiveBg = appBgColor || currentTheme.bg;
  const effectiveText = appBgColor ? getTextColor(appBgColor) : currentTheme.text;
  const effectiveTextMuted = appBgColor ? `${effectiveText}99` : currentTheme.textMuted;
  const activeLayer = textLayers.find(l => l.id === activeLayerId);
  const overlayColors = getOverlayColorOptions();

  // V7+ NEW: Generate palette from hex input
  const handleHexGenerate = () => {
    let hex = hexInput.trim();
    if (!hex.startsWith('#')) hex = '#' + hex;
    if (!/^#[0-9A-F]{6}$/i.test(hex)) {
      alert('Please enter a valid 6-digit hex color (e.g., FF5733 or #FF5733)');
      return;
    }
    const rgb = hexToRgb(hex);
    const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
    let palette = [];
    if (hexHarmonyType === 'complementary') {
      palette = [hex, hslToHex((h + 180) % 360, Math.min(s + 20, 100), l), hslToHex(h, Math.max(s - 30, 0), Math.min(l + 20, 100)), hslToHex(h, Math.min(s + 20, 100), Math.max(l - 20, 0)), hslToHex((h + 180) % 360, Math.max(s - 20, 0), Math.min(l + 15, 100)), hslToHex((h + 180) % 360, Math.min(s + 10, 100), Math.max(l - 15, 0))];
    } else if (hexHarmonyType === 'triadic') {
      palette = [hex, hslToHex((h + 120) % 360, s, l), hslToHex((h + 240) % 360, s, l), hslToHex(h, Math.max(s - 20, 0), Math.min(l + 20, 100)), hslToHex((h + 120) % 360, Math.max(s - 20, 0), Math.min(l + 20, 100)), hslToHex((h + 240) % 360, Math.max(s - 20, 0), Math.min(l + 20, 100))];
    } else if (hexHarmonyType === 'analogous') {
      palette = [hex, hslToHex((h + 30) % 360, s, l), hslToHex((h - 30 + 360) % 360, s, l), hslToHex(h, Math.max(s - 20, 0), Math.min(l + 20, 100)), hslToHex((h + 30) % 360, Math.max(s - 20, 0), Math.min(l + 20, 100)), hslToHex((h - 30 + 360) % 360, Math.max(s - 20, 0), Math.min(l + 20, 100))];
    } else if (hexHarmonyType === 'monochromatic') {
      palette = [hex, hslToHex(h, s, Math.max(l - 30, 0)), hslToHex(h, s, Math.max(l - 15, 0)), hslToHex(h, s, Math.min(l + 15, 100)), hslToHex(h, s, Math.min(l + 30, 100)), hslToHex(h, Math.max(s - 30, 0), l)];
    }
    setGeneratedPalette(palette);
    setSelectedMood(`hex-${hexHarmonyType}`);
    setImage(null);
    setColors([]);
    if (palette.length > 0) {
      setSelectedColor(palette[0]);
      generateHarmonies(palette[0]);
    }
    setHexInput('');
  };

  // V7+ NEW: Generate overlay palette sets
  const generateOverlaySets = (imageData, avgColorHex) => {
    const { h, s, l } = hexToHsl(avgColorHex);
    const sets = [{
      id: 'high-contrast-cool', name: 'High Contrast Cool', description: 'Bold, modern ads',
      colors: [hslToHex((h + 180) % 360, 85, 45), hslToHex((h + 200) % 360, 75, 50), hslToHex((h + 160) % 360, 80, 48)],
      useCase: 'Modern, professional', backgroundHue: h, backgroundLuminance: l
    }, {
      id: 'candy-pop', name: 'Candy Pop', description: 'Playful, energetic',
      colors: [hslToHex((h + 330) % 360, 100, 60), hslToHex((h + 60) % 360, 100, 60), hslToHex((h + 180) % 360, 100, 55)],
      useCase: 'Eye-catching, fun', backgroundHue: h, backgroundLuminance: l
    }, {
      id: 'corporate-safe', name: 'Corporate Safe', description: 'Professional, trustworthy',
      colors: [hslToHex((h + 180) % 360, 70, 25), hslToHex((h + 150) % 360, 80, 30), hslToHex((h + 210) % 360, 65, 28)],
      useCase: 'Business, formal', backgroundHue: h, backgroundLuminance: l
    }, {
      id: 'neon-vibrant', name: 'Neon Vibrant', description: 'Eye-catching, urgent',
      colors: [hslToHex(120, 100, 50), hslToHex(300, 100, 50), hslToHex(180, 100, 50)],
      useCase: 'Attention-grabbing, urgent', backgroundHue: h, backgroundLuminance: l
    }, {
      id: 'warm-energetic', name: 'Warm Energetic', description: 'Friendly, inviting',
      colors: [hslToHex(10, 85, 55), hslToHex(40, 90, 60), hslToHex(330, 80, 58)],
      useCase: 'Sales, promotions', backgroundHue: h, backgroundLuminance: l
    }];
    sets.forEach(set => {
      const contrasts = set.colors.map(color => getContrastRatio(avgColorHex, color));
      set.minContrast = Math.min(...contrasts).toFixed(1);
      set.maxContrast = Math.max(...contrasts).toFixed(1);
      set.avgContrast = (contrasts.reduce((a, b) => a + b, 0) / contrasts.length).toFixed(1);
      set.wcag = getWcagRating(parseFloat(set.minContrast)).rating;
    });
    return sets;
  };

  // V7+ NEW: Shape layer management
  const addShapeLayer = (initialProps = {}) => {
    const newShape = {
      id: Date.now(), enabled: true, type: 'rectangle', position: { x: 50, y: 50 }, size: { width: 60, height: 20 },
      fillColor: selectedColor || generatedPalette[0] || '#FF5733', opacity: 100, cornerRadius: 12,
      zIndex: shapeLayers.length + 1, colorMode: 'custom', globalColorIndex: 0, linkedCardId: null, ...initialProps
    };
    setShapeLayers([...shapeLayers, newShape]);
    setActiveShapeId(newShape.id);
    return newShape.id;
  };
  const updateShapeLayer = (id, updates) => {
    setShapeLayers(shapeLayers.map(shape => shape.id === id ? { ...shape, ...updates } : shape));
  };
  const deleteShapeLayer = (id) => {
    setShapeLayers(shapeLayers.filter(shape => shape.id !== id));
    if (activeShapeId === id) setActiveShapeId(null);
  };
  const handleShapeDragStart = (e, shapeId) => {
    const shape = shapeLayers.find(s => s.id === shapeId);
    if (!shape || !imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / rect.width * 100;
    const clickY = (e.clientY - rect.top) / rect.height * 100;
    setIsDraggingShape(true);
    setActiveShapeId(shapeId);
    setShapeDragOffset({ x: clickX - shape.position.x, y: clickY - shape.position.y });
    e.preventDefault();
  };
  const handleShapeDragMove = useCallback((e) => {
    if (!isDraggingShape || !activeShapeId || !imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * 100;
    const y = (e.clientY - rect.top) / rect.height * 100;
    setShapeLayers(prev => prev.map(shape => 
      shape.id === activeShapeId ? { ...shape, position: { x: Math.max(0, Math.min(100, x - shapeDragOffset.x)), y: Math.max(0, Math.min(100, y - shapeDragOffset.y)) }} : shape
    ));
  }, [isDraggingShape, activeShapeId, shapeDragOffset]);
  const handleShapeDragEnd = useCallback(() => { setIsDraggingShape(false); }, []);

  // V7+ NEW: Multi-card mode
  const enableMultiCardMode = (setId, cardCount = 3) => {
    const set = overlaySets.find(s => s.id === setId);
    if (!set) return;
    const cards = [];
    const spacing = 100 / (cardCount + 1);
    for (let i = 0; i < cardCount; i++) {
      const cardId = i + 1;
      const yPos = spacing * (i + 1);
      const shapeId = addShapeLayer({
        position: { x: 50, y: yPos }, size: { width: 80, height: 18 },
        fillColor: set.colors[i % set.colors.length], colorMode: 'global',
        globalColorIndex: i % set.colors.length, linkedCardId: cardId
      });
      const textId1 = Date.now() + 1000 + i * 2;
      const text1 = {
        id: textId1, enabled: true, text: `CARD ${cardId}`, type: 'header',
        color: getContrastTextColor(set.colors[i % set.colors.length]), bgEnabled: false,
        position: { x: 50, y: yPos - 4 }, fontSize: 42, fontWeight: '700', textAlign: 'center',
        letterSpacing: 0, colorMode: 'auto', linkedCardId: cardId, bgColor: '#000000',
        bgOpacity: 80, bgPaddingH: 20, bgPaddingV: 12, bgWidth: 'auto', bgCustomWidth: 100,
        autoBg: true, preset: 'bold'
      };
      const textId2 = textId1 + 1;
      const text2 = { ...text1, id: textId2, text: 'Subtext', type: 'subhead', fontSize: 28, fontWeight: '500', position: { x: 50, y: yPos + 4 } };
      setTextLayers(prev => [...prev, text1, text2]);
      cards.push({
        id: cardId, name: `Card ${cardId}`, text: `CARD ${cardId}`, subtext: 'Subtext',
        shapeLayerId: shapeId, textLayerId: textId1, textLayerId2: textId2,
        colorAssignment: i % set.colors.length, textColorMode: 'auto',
        customTextColor: null, position: { x: 50, y: yPos }
      });
    }
    setMultiCardMode({ enabled: true, cardCount, overlaySetId: setId, cards });
    setSelectedOverlaySetId(setId);
  };
  const disableMultiCardMode = () => {
    const linkedShapes = shapeLayers.filter(s => s.linkedCardId !== null).map(s => s.id);
    const linkedTexts = textLayers.filter(t => t.linkedCardId !== null).map(t => t.id);
    setShapeLayers(shapeLayers.filter(s => !linkedShapes.includes(s.id)));
    setTextLayers(textLayers.filter(t => !linkedTexts.includes(t.id)));
    setMultiCardMode({ enabled: false, cardCount: 0, overlaySetId: null, cards: [] });
  };
  const updateCardText = (cardId, field, value) => {
    const card = multiCardMode.cards.find(c => c.id === cardId);
    if (!card) return;
    const newCards = multiCardMode.cards.map(c => c.id === cardId ? { ...c, [field]: value } : c);
    setMultiCardMode({ ...multiCardMode, cards: newCards });
    const textLayerId = field === 'text' ? card.textLayerId : card.textLayerId2;
    updateTextLayer(textLayerId, { text: value });
  };
  const switchOverlaySet = (newSetId) => {
    const newSet = overlaySets.find(s => s.id === newSetId);
    if (!newSet || !multiCardMode.enabled) return;
    multiCardMode.cards.forEach(card => {
      const shape = shapeLayers.find(s => s.id === card.shapeLayerId);
      if (shape && shape.colorMode === 'global') {
        const newColor = newSet.colors[card.colorAssignment % newSet.colors.length];
        updateShapeLayer(shape.id, { fillColor: newColor });
        [card.textLayerId, card.textLayerId2].forEach(textId => {
          const textLayer = textLayers.find(t => t.id === textId);
          if (textLayer && textLayer.colorMode === 'auto') {
            updateTextLayer(textId, { color: getContrastTextColor(newColor) });
          }
        });
      }
    });
    setSelectedOverlaySetId(newSetId);
    setMultiCardMode({ ...multiCardMode, overlaySetId: newSetId });
  };
  const rotateCardColors = () => {
    if (!multiCardMode.enabled) return;
    const set = overlaySets.find(s => s.id === selectedOverlaySetId);
    if (!set) return;
    const newCards = multiCardMode.cards.map(card => ({ ...card, colorAssignment: (card.colorAssignment + 1) % set.colors.length }));
    newCards.forEach(card => {
      const shape = shapeLayers.find(s => s.id === card.shapeLayerId);
      if (shape && shape.colorMode === 'global') {
        const newColor = set.colors[card.colorAssignment];
        updateShapeLayer(shape.id, { fillColor: newColor });
        [card.textLayerId, card.textLayerId2].forEach(textId => {
          const textLayer = textLayers.find(t => t.id === textId);
          if (textLayer && textLayer.colorMode === 'auto') {
            updateTextLayer(textId, { color: getContrastTextColor(newColor) });
          }
        });
      }
    });
    setMultiCardMode({ ...multiCardMode, cards: newCards });
  };
  const swapCardColors = (card1Id, card2Id) => {
    if (!multiCardMode.enabled) return;
    const set = overlaySets.find(s => s.id === selectedOverlaySetId);
    if (!set) return;
    const newCards = [...multiCardMode.cards];
    const card1Index = newCards.findIndex(c => c.id === card1Id);
    const card2Index = newCards.findIndex(c => c.id === card2Id);
    if (card1Index === -1 || card2Index === -1) return;
    const temp = newCards[card1Index].colorAssignment;
    newCards[card1Index].colorAssignment = newCards[card2Index].colorAssignment;
    newCards[card2Index].colorAssignment = temp;
    [newCards[card1Index], newCards[card2Index]].forEach(card => {
      const shape = shapeLayers.find(s => s.id === card.shapeLayerId);
      if (shape) {
        const newColor = set.colors[card.colorAssignment];
        updateShapeLayer(shape.id, { fillColor: newColor });
        [card.textLayerId, card.textLayerId2].forEach(textId => {
          const textLayer = textLayers.find(t => t.id === textId);
          if (textLayer && textLayer.colorMode === 'auto') {
            updateTextLayer(textId, { color: getContrastTextColor(newColor) });
          }
        });
      }
    });
    setMultiCardMode({ ...multiCardMode, cards: newCards });
  };
  const getTextColorSuggestions = (shapeHex) => {
    if (textColorSuggestions[shapeHex]) return textColorSuggestions[shapeHex];
    const { h, s, l } = hexToHsl(shapeHex);
    const suggestions = [
      { name: 'White', hex: '#FFFFFF', type: 'neutral', category: 'neutral' },
      { name: 'Black', hex: '#000000', type: 'neutral', category: 'neutral' },
      { name: 'Cream', hex: '#FFFBEB', type: 'neutral', category: 'neutral' },
      { name: 'Near-Black', hex: '#1A1A1A', type: 'neutral', category: 'neutral' },
      { name: 'Off-White', hex: '#F5F5F5', type: 'neutral', category: 'neutral' },
      { name: 'Complementary', hex: hslToHex((h + 180) % 360, 70, l < 50 ? 85 : 20), type: 'colored', category: 'complementary' },
      { name: 'Triadic Warm', hex: hslToHex((h + 120) % 360, 70, l < 50 ? 85 : 20), type: 'colored', category: 'triadic' },
      { name: 'Triadic Cool', hex: hslToHex((h + 240) % 360, 70, l < 50 ? 85 : 20), type: 'colored', category: 'triadic' },
      ...(l < 50 ? [
        { name: 'Light Tint', hex: hslToHex(h, Math.max(s-30, 20), 90), type: 'colored', category: 'tint' },
        { name: 'Medium Tint', hex: hslToHex(h, Math.max(s-20, 30), 80), type: 'colored', category: 'tint' },
        { name: 'Soft Tint', hex: hslToHex(h, Math.max(s-10, 40), 70), type: 'colored', category: 'tint' }
      ] : [
        { name: 'Dark Shade', hex: hslToHex(h, Math.min(s+30, 80), 15), type: 'colored', category: 'shade' },
        { name: 'Medium Shade', hex: hslToHex(h, Math.min(s+20, 70), 25), type: 'colored', category: 'shade' },
        { name: 'Soft Shade', hex: hslToHex(h, Math.min(s+10, 60), 35), type: 'colored', category: 'shade' }
      ]),
      { name: 'Warmer', hex: hslToHex((h - 30 + 360) % 360, s, l < 50 ? 85 : 20), type: 'colored', category: 'analogous' },
      { name: 'Cooler', hex: hslToHex((h + 30) % 360, s, l < 50 ? 85 : 20), type: 'colored', category: 'analogous' }
    ];
    const results = suggestions.map(s => ({ ...s, contrast: getContrastRatio(shapeHex, s.hex), wcag: getWcagRating(getContrastRatio(shapeHex, s.hex)) }))
      .filter(s => s.contrast >= 4.5).sort((a, b) => b.contrast - a.contrast);
    setTextColorSuggestions(prev => ({ ...prev, [shapeHex]: results }));
    return results;
  };
  const getContrastTextColor = (bgHex) => {
    const whiteContrast = getContrastRatio(bgHex, '#FFFFFF');
    const blackContrast = getContrastRatio(bgHex, '#000000');
    return whiteContrast > blackContrast ? '#FFFFFF' : '#000000';
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: effectiveBg, color: effectiveText, fontFamily: '"Space Grotesk", -apple-system, sans-serif', transition: 'all 0.3s ease' }}>
      {currentTheme.grid && !appBgColor && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `linear-gradient(${currentTheme.accent}08 1px, transparent 1px), linear-gradient(90deg, ${currentTheme.accent}08 1px, transparent 1px)`, backgroundSize: '50px 50px', pointerEvents: 'none', zIndex: 0 }} />}
      {currentTheme.scanlines && !appBgColor && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)', pointerEvents: 'none', zIndex: 0 }} />}

      <header style={{ borderBottom: `1px solid ${appBgColor ? `${effectiveText}20` : currentTheme.border}`, padding: '20px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1, backdropFilter: 'blur(10px)', background: appBgColor ? `${appBgColor}ee` : `${currentTheme.bg}cc` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: appBgColor ? effectiveText : currentTheme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '16px', color: appBgColor ? appBgColor : '#000' }}>◈</span>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: '600', letterSpacing: '-0.02em', margin: 0, color: effectiveText }}>CHROMATIC</h1>
          <span style={{ fontSize: '9px', padding: '2px 6px', background: `${currentTheme.accent}20`, borderRadius: '4px', color: currentTheme.accent, fontFamily: 'monospace' }}>V5</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {currentColors.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '10px', color: effectiveTextMuted, fontFamily: 'monospace' }}>BG:</span>
              <button onClick={() => setAppBgColor(null)} style={{ width: '24px', height: '24px', borderRadius: '4px', border: `2px solid ${!appBgColor ? currentTheme.accent : 'transparent'}`, background: 'linear-gradient(135deg, #fff 45%, #000 55%)', cursor: 'pointer', padding: 0 }} title="Default" />
              {currentColors.slice(0, 6).map((color, i) => (
                <button key={i} onClick={() => setAppBgColor(color)} style={{ width: '24px', height: '24px', borderRadius: '4px', border: `2px solid ${appBgColor === color ? currentTheme.accent : 'transparent'}`, background: color, cursor: 'pointer', padding: 0 }} title={color} />
              ))}
            </div>
          )}
          <select value={theme} onChange={(e) => setTheme(e.target.value)} style={{ background: appBgColor ? `${effectiveText}10` : currentTheme.surface, border: `1px solid ${appBgColor ? `${effectiveText}30` : currentTheme.border}`, borderRadius: '6px', padding: '6px 12px', color: effectiveText, fontSize: '11px', cursor: 'pointer', fontFamily: 'monospace' }}>
            {Object.entries(themes).map(([key, t]) => <option key={key} value={key} style={{ background: currentTheme.bg, color: currentTheme.text }}>{t.name}</option>)}
          </select>
        </div>
      </header>

      {copyNotification && <div style={{ position: 'fixed', top: '20px', right: '20px', background: appBgColor ? `${effectiveText}15` : currentTheme.surface, border: `1px solid ${appBgColor ? effectiveText : currentTheme.accent}`, padding: '12px 20px', borderRadius: '8px', fontSize: '13px', zIndex: 1000, color: appBgColor ? effectiveText : currentTheme.accent, fontFamily: 'monospace' }}>{copyNotification}</div>}

      <main style={{ padding: '48px', maxWidth: '1600px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {!image && generatedPalette.length === 0 ? (
          <div>
            <div onClick={() => fileInputRef.current?.click()} style={{ border: `2px dashed ${appBgColor ? `${effectiveText}40` : currentTheme.border}`, borderRadius: '16px', padding: '60px', textAlign: 'center', cursor: 'pointer', background: appBgColor ? `${effectiveText}05` : currentTheme.surface, marginBottom: '24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>↑</div>
              <p style={{ fontSize: '16px', color: effectiveText, marginBottom: '8px', fontWeight: '500' }}>Upload an image to extract colors</p>
              <p style={{ fontSize: '12px', color: effectiveTextMuted, fontFamily: 'monospace' }}>PNG • JPG • WEBP</p>
            </div>
            
            {/* V7+ NEW: Hex Input Section */}
            <div style={{ padding: '24px', background: currentTheme.surface, border: `1px solid ${currentTheme.border}`, borderRadius: '12px', marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: currentTheme.text }}>🎨 Generate from Background Hex</h3>
              <p style={{ fontSize: '12px', opacity: 0.6, marginBottom: '16px', color: currentTheme.textMuted }}>Enter your ad background color to generate perfect text & accent colors</p>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: currentTheme.textMuted, display: 'block', marginBottom: '6px', fontFamily: 'monospace' }}>Harmony Type</label>
                <select value={hexHarmonyType} onChange={(e) => setHexHarmonyType(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: currentTheme.bg, border: `1px solid ${currentTheme.border}`, borderRadius: '6px', color: currentTheme.text, fontSize: '13px', cursor: 'pointer', fontFamily: 'monospace' }}>
                  <option value="complementary">Complementary - High Contrast</option>
                  <option value="triadic">Triadic - Balanced & Vibrant</option>
                  <option value="analogous">Analogous - Harmonious</option>
                  <option value="monochromatic">Monochromatic - Same Hue</option>
                </select>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: currentTheme.textMuted, display: 'block', marginBottom: '6px', fontFamily: 'monospace' }}>Background Color</label>
                <input type="text" value={hexInput} onChange={(e) => setHexInput(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter' && hexInput.trim()) handleHexGenerate(); }} placeholder="FF5733 or #FF5733" style={{ width: '100%', padding: '10px 12px', background: currentTheme.bg, border: `1px solid ${currentTheme.border}`, borderRadius: '6px', color: currentTheme.text, fontSize: '14px', fontFamily: 'monospace' }} />
              </div>
              <button onClick={handleHexGenerate} disabled={!hexInput.trim()} style={{ width: '100%', padding: '12px', background: hexInput.trim() ? currentTheme.accent : currentTheme.surface, color: hexInput.trim() ? currentTheme.bg : currentTheme.textMuted, border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', letterSpacing: '0.05em', cursor: hexInput.trim() ? 'pointer' : 'not-allowed', textTransform: 'uppercase', fontFamily: 'monospace', opacity: hexInput.trim() ? 1 : 0.5 }}>Generate Palette</button>
              <div style={{ marginTop: '12px', fontSize: '11px', opacity: 0.5, fontFamily: 'monospace', color: currentTheme.textMuted }}>💡 Example: Enter <code style={{ background: `${currentTheme.accent}15`, padding: '2px 6px', borderRadius: '3px', color: currentTheme.accent }}>#003B5C</code> to get complementary colors</div>
            </div>
            
            <div>
              <h2 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.15em', color: effectiveTextMuted, marginBottom: '24px', fontFamily: 'monospace' }}>Or Generate by Mood</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                {Object.entries(moods).map(([key, mood]) => (
                  <button key={key} onClick={() => handleMoodGenerate(key)} style={{ background: appBgColor ? `${effectiveText}05` : currentTheme.surface, border: `1px solid ${appBgColor ? `${effectiveText}20` : currentTheme.border}`, borderRadius: '12px', padding: '20px', textAlign: 'left', cursor: 'pointer' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: effectiveText, marginBottom: '4px' }}>{mood.name}</div>
                    <div style={{ fontSize: '11px', color: effectiveTextMuted, lineHeight: '1.4' }}>{mood.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '48px' }}>
            <div>
              {image ? (
                <div style={{ marginBottom: '24px' }}>
                  {/* Smart Color toggle */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: effectiveTextMuted, fontFamily: 'monospace' }}>Preview</span>
                    <button 
                      onClick={() => setSmartColorEnabled(!smartColorEnabled)}
                      style={{ 
                        background: smartColorEnabled ? `${currentTheme.accent}30` : 'transparent', 
                        border: `1px solid ${smartColorEnabled ? currentTheme.accent : effectiveText + '30'}`, 
                        borderRadius: '4px', 
                        padding: '4px 8px', 
                        color: smartColorEnabled ? currentTheme.accent : effectiveTextMuted, 
                        cursor: 'pointer', 
                        fontSize: '9px', 
                        fontFamily: 'monospace' 
                      }}
                      title="Auto-update text color based on position"
                    >
                      SMART COLOR {smartColorEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  <div 
                    ref={imageContainerRef}
                    style={{ 
                      borderRadius: '12px', 
                      overflow: 'hidden', 
                      position: 'relative', 
                      border: `1px solid ${appBgColor ? `${effectiveText}20` : currentTheme.border}`,
                      cursor: isDragging ? 'grabbing' : 'default'
                    }}
                  >
                    <img src={image} alt="Uploaded" style={{ width: '100%', display: 'block' }} />
                    
                    {/* Ad format overlay guide */}
                    {adFormat && (
                      <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        border: `2px dashed ${currentTheme.accent}`,
                        pointerEvents: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <span style={{ 
                          background: 'rgba(0,0,0,0.7)', 
                          color: '#fff', 
                          padding: '4px 8px', 
                          borderRadius: '4px', 
                          fontSize: '10px', 
                          fontFamily: 'monospace' 
                        }}>
                          {adFormats[adFormat].name} • {adFormats[adFormat].ratio}
                        </span>
                      </div>
                    )}
                    
                    {/* V7+ NEW: Render shape layers */}
                    {shapeLayers.filter(shape => shape.enabled).sort((a, b) => a.zIndex - b.zIndex).map(shape => {
                      const containerRect = imageContainerRef.current?.getBoundingClientRect();
                      if (!containerRect) return null;
                      return (
                        <div key={shape.id} onMouseDown={(e) => handleShapeDragStart(e, shape.id)} style={{ position: 'absolute', left: `${shape.position.x}%`, top: `${shape.position.y}%`, transform: 'translate(-50%, -50%)', width: `${shape.size.width}%`, height: `${shape.size.height}%`, backgroundColor: shape.fillColor, opacity: shape.opacity / 100, borderRadius: `${shape.cornerRadius}px`, cursor: isDraggingShape && activeShapeId === shape.id ? 'grabbing' : 'grab', border: activeShapeId === shape.id ? `2px solid ${currentTheme.accent}` : 'none', zIndex: shape.zIndex, pointerEvents: 'auto' }} />
                      );
                    })}
                    
                    {/* Text layers */}
                    {textLayers.filter(l => l.enabled).map(layer => (
                      <div
                        key={layer.id}
                        onMouseDown={(e) => handleDragStart(e, layer.id)}
                        onTouchStart={(e) => handleDragStart(e, layer.id)}
                        onClick={() => setActiveLayerId(layer.id)}
                        style={{
                          position: 'absolute',
                          left: `${layer.position.x}%`,
                          top: `${layer.position.y}%`,
                          transform: 'translate(-50%, -50%)',
                          cursor: 'grab',
                          userSelect: 'none',
                          maxWidth: '90%'
                        }}
                      >
                        {layer.bgEnabled && (
                          <div style={{
                            position: 'absolute',
                            top: `-${layer.bgPaddingV}px`,
                            left: layer.bgWidth === 'full' ? '-50vw' : `-${layer.bgPaddingH}px`,
                            right: layer.bgWidth === 'full' ? '-50vw' : `-${layer.bgPaddingH}px`,
                            bottom: `-${layer.bgPaddingV}px`,
                            background: layer.bgColor,
                            opacity: layer.bgOpacity / 100,
                            borderRadius: '4px',
                            width: layer.bgWidth === 'custom' ? `${layer.bgCustomWidth}%` : 'auto'
                          }} />
                        )}
                        <span style={{
                          position: 'relative',
                          color: layer.color,
                          fontSize: `${layer.fontSize}px`,
                          fontWeight: layer.fontWeight,
                          fontFamily: fonts.find(f => f.name === selectedFont)?.stack,
                          lineHeight: 1.2,
                          textShadow: !layer.bgEnabled ? '0 2px 8px rgba(0,0,0,0.5)' : 'none',
                          letterSpacing: `${layer.letterSpacing}px`,
                          textAlign: layer.textAlign,
                          display: 'block',
                          outline: activeLayerId === layer.id ? `2px solid ${currentTheme.accent}` : 'none',
                          outlineOffset: '4px',
                          whiteSpace: 'nowrap'
                        }}>
                          {layer.text}
                        </span>
                      </div>
                    ))}
                    
                    <button onClick={() => { setImage(null); setColors([]); setSelectedColor(null); setHarmonies({}); setAppBgColor(null); setImageAvgColor(null); }} style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.8)', border: `1px solid ${currentTheme.border}`, borderRadius: '6px', padding: '6px 12px', color: currentTheme.accent, cursor: 'pointer', fontSize: '11px', fontFamily: 'monospace' }}>REPLACE</button>
                  </div>
                  
                  {/* Export buttons */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button 
                      onClick={() => exportWithOverlay('png')} 
                      style={{ 
                        flex: 1, 
                        background: appBgColor ? effectiveText : currentTheme.accent, 
                        border: 'none', 
                        borderRadius: '6px', 
                        padding: '10px', 
                        color: appBgColor ? appBgColor : getTextColor(currentTheme.accent), 
                        cursor: 'pointer', 
                        fontSize: '11px', 
                        fontFamily: 'monospace',
                        fontWeight: '600'
                      }}
                    >
                      EXPORT PNG
                    </button>
                    <button 
                      onClick={() => exportWithOverlay('jpeg')} 
                      style={{ 
                        flex: 1, 
                        background: 'transparent', 
                        border: `1px solid ${appBgColor ? `${effectiveText}40` : currentTheme.border}`, 
                        borderRadius: '6px', 
                        padding: '10px', 
                        color: effectiveTextMuted, 
                        cursor: 'pointer', 
                        fontSize: '11px', 
                        fontFamily: 'monospace' 
                      }}
                    >
                      EXPORT JPG
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '24px', background: appBgColor ? `${effectiveText}05` : currentTheme.surface, borderRadius: '12px', border: `1px solid ${appBgColor ? `${effectiveText}20` : currentTheme.border}`, marginBottom: '24px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: effectiveText }}>{selectedMood && moods[selectedMood].name} Palette</div>
                  <div style={{ fontSize: '11px', color: effectiveTextMuted, marginBottom: '16px' }}>{selectedMood && moods[selectedMood].desc}</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => selectedMood && handleMoodGenerate(selectedMood)} style={{ background: appBgColor ? effectiveText : currentTheme.accent, border: 'none', borderRadius: '6px', padding: '8px 16px', color: appBgColor ? appBgColor : getTextColor(currentTheme.accent), cursor: 'pointer', fontSize: '11px', fontFamily: 'monospace' }}>REGENERATE</button>
                    <button onClick={() => { setGeneratedPalette([]); setSelectedMood(null); setColors([]); setSelectedColor(null); setAppBgColor(null); }} style={{ background: 'transparent', border: `1px solid ${appBgColor ? `${effectiveText}40` : currentTheme.border}`, borderRadius: '6px', padding: '8px 16px', color: effectiveTextMuted, cursor: 'pointer', fontSize: '11px', fontFamily: 'monospace' }}>RESET</button>
                  </div>
                </div>
              )}

              {/* V7+ NEW: Overlay Palette Suggestions */}
              {image && overlaySets.length > 0 && (
                <div style={{ padding: '24px', background: currentTheme.surface, border: `1px solid ${currentTheme.border}`, borderRadius: '12px', marginBottom: '24px' }}>
                  <h3 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: currentTheme.text }}>🎨 Overlay Palette Suggestions</h3>
                  <p style={{ fontSize: '12px', opacity: 0.6, marginBottom: '20px', color: currentTheme.textMuted }}>Colors that will POP on your background</p>
                  {overlaySets.map(set => (
                    <div key={set.id} style={{ padding: '16px', background: selectedOverlaySetId === set.id ? `${currentTheme.accent}22` : 'transparent', border: `1px solid ${selectedOverlaySetId === set.id ? currentTheme.accent : currentTheme.border}`, borderRadius: '8px', marginBottom: '12px', cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={() => { if (!multiCardMode.enabled) { setSelectedOverlaySetId(set.id); } else { switchOverlaySet(set.id); } }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <div style={{ fontWeight: '600', marginBottom: '4px', fontSize: '13px', color: currentTheme.text }}>{set.name}</div>
                          <div style={{ fontSize: '11px', opacity: 0.6, color: currentTheme.textMuted }}>{set.description}</div>
                        </div>
                        <div style={{ fontSize: '10px', opacity: 0.5, fontFamily: 'monospace', color: currentTheme.textMuted }}>{set.avgContrast}:1 {set.wcag}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                        {set.colors.map((color, i) => (
                          <div key={i} style={{ flex: 1, height: '40px', background: color, borderRadius: '6px', border: `1px solid ${currentTheme.border}`, cursor: 'pointer' }} title={color} onClick={(e) => { e.stopPropagation(); copyToClipboard(color, color); }} />
                        ))}
                      </div>
                      <div style={{ fontSize: '10px', opacity: 0.5, marginBottom: '10px', fontFamily: 'monospace', color: currentTheme.textMuted }}>Great for: {set.useCase}</div>
                      {selectedOverlaySetId !== set.id ? (
                        <button onClick={(e) => { e.stopPropagation(); if (!multiCardMode.enabled) { enableMultiCardMode(set.id, 3); } else { switchOverlaySet(set.id); } }} style={{ padding: '8px 16px', background: currentTheme.accent, color: currentTheme.bg, border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'monospace' }}>{multiCardMode.enabled ? 'Switch to This Set' : 'Create Multi-Card'}</button>
                      ) : (
                        <div style={{ padding: '8px 16px', background: `${currentTheme.accent}20`, color: currentTheme.accent, borderRadius: '6px', fontSize: '11px', fontWeight: '600', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'monospace' }}>✓ Active Set</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Ad Format Presets */}
              {image && (
                <div style={{ padding: '16px', background: appBgColor ? `${effectiveText}05` : currentTheme.surface, borderRadius: '12px', border: `1px solid ${appBgColor ? `${effectiveText}20` : currentTheme.border}`, marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: effectiveTextMuted, fontFamily: 'monospace' }}>Ad Format Guide</span>
                    {adFormat && (
                      <button onClick={() => setAdFormat(null)} style={{ background: 'transparent', border: 'none', color: effectiveTextMuted, cursor: 'pointer', fontSize: '10px', fontFamily: 'monospace' }}>CLEAR</button>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                    {Object.entries(adFormats).map(([key, format]) => (
                      <button 
                        key={key} 
                        onClick={() => setAdFormat(adFormat === key ? null : key)}
                        style={{ 
                          background: adFormat === key ? `${currentTheme.accent}20` : 'transparent', 
                          border: `1px solid ${adFormat === key ? currentTheme.accent : `${effectiveText}20`}`, 
                          borderRadius: '4px', 
                          padding: '6px 4px', 
                          color: adFormat === key ? currentTheme.accent : effectiveTextMuted, 
                          cursor: 'pointer', 
                          fontSize: '8px', 
                          fontFamily: 'monospace',
                          textAlign: 'center'
                        }}
                      >
                        {format.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Text Layers Panel */}
              {image && (
                <div style={{ padding: '16px', background: appBgColor ? `${effectiveText}05` : currentTheme.surface, borderRadius: '12px', border: `1px solid ${appBgColor ? `${effectiveText}20` : currentTheme.border}`, marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: effectiveTextMuted, fontFamily: 'monospace' }}>Text Layers</span>
                    <button 
                      onClick={addTextLayer} 
                      style={{ 
                        background: appBgColor ? effectiveText : currentTheme.accent, 
                        border: 'none', 
                        borderRadius: '4px', 
                        padding: '4px 8px', 
                        color: appBgColor ? appBgColor : getTextColor(currentTheme.accent), 
                        cursor: 'pointer', 
                        fontSize: '10px', 
                        fontFamily: 'monospace' 
                      }}
                    >
                      + ADD
                    </button>
                  </div>
                  
                  {/* Layer list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                    {textLayers.map((layer, index) => (
                      <div 
                        key={layer.id}
                        onClick={() => setActiveLayerId(layer.id)}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          padding: '8px', 
                          background: activeLayerId === layer.id ? `${currentTheme.accent}15` : 'transparent',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          border: `1px solid ${activeLayerId === layer.id ? currentTheme.accent : 'transparent'}`
                        }}
                      >
                        <button 
                          onClick={(e) => { e.stopPropagation(); updateTextLayer(layer.id, { enabled: !layer.enabled }); }}
                          style={{ 
                            width: '16px', 
                            height: '16px', 
                            borderRadius: '3px', 
                            border: `1px solid ${effectiveText}40`, 
                            background: layer.enabled ? currentTheme.accent : 'transparent',
                            cursor: 'pointer',
                            padding: 0,
                            fontSize: '8px',
                            color: layer.enabled ? getTextColor(currentTheme.accent) : 'transparent'
                          }}
                        >
                          ✓
                        </button>
                        <span style={{ flex: 1, fontSize: '11px', color: effectiveText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {layer.text || `Layer ${index + 1}`}
                        </span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteTextLayer(layer.id); }}
                          style={{ 
                            background: 'transparent', 
                            border: 'none', 
                            color: effectiveTextMuted, 
                            cursor: 'pointer', 
                            fontSize: '12px',
                            padding: '2px 4px'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {/* Active layer controls */}
                  {activeLayer && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '12px', borderTop: `1px solid ${effectiveText}10` }}>
                      <input 
                        type="text" 
                        value={activeLayer.text} 
                        onChange={(e) => updateTextLayer(activeLayer.id, { text: e.target.value })} 
                        placeholder="Enter text..." 
                        style={{ 
                          background: appBgColor ? `${effectiveText}10` : currentTheme.bg, 
                          border: `1px solid ${appBgColor ? `${effectiveText}20` : currentTheme.border}`, 
                          borderRadius: '6px', 
                          padding: '8px 12px', 
                          color: effectiveText, 
                          fontSize: '12px' 
                        }} 
                      />
                      
                      {/* Style presets */}
                      <div>
                        <label style={{ fontSize: '9px', color: effectiveTextMuted, display: 'block', marginBottom: '6px' }}>Style Preset</label>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {Object.entries(textPresets).map(([key, preset]) => (
                            <button 
                              key={key}
                              onClick={() => applyPresetToLayer(activeLayer.id, key)}
                              style={{ 
                                background: activeLayer.preset === key ? `${currentTheme.accent}20` : 'transparent', 
                                border: `1px solid ${activeLayer.preset === key ? currentTheme.accent : `${effectiveText}20`}`, 
                                borderRadius: '4px', 
                                padding: '4px 8px', 
                                color: activeLayer.preset === key ? currentTheme.accent : effectiveTextMuted, 
                                cursor: 'pointer', 
                                fontSize: '9px', 
                                fontFamily: 'monospace' 
                              }}
                            >
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Text color with Best option */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ fontSize: '9px', color: effectiveTextMuted }}>Text Color</label>
                          <button 
                            onClick={() => applyBestComboToLayer(activeLayer.id)}
                            style={{ 
                              background: `${currentTheme.accent}20`, 
                              border: `1px solid ${currentTheme.accent}`, 
                              borderRadius: '4px', 
                              padding: '2px 6px', 
                              color: currentTheme.accent, 
                              cursor: 'pointer', 
                              fontSize: '8px', 
                              fontFamily: 'monospace' 
                            }}
                          >
                            ★ BEST
                          </button>
                        </div>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {overlayColors.map((color, i) => {
                            const contrastRatio = imageAvgColor ? getContrastRatio(color, imageAvgColor) : 21;
                            const { rating } = getWcagRating(contrastRatio);
                            return (
                              <div key={i} style={{ position: 'relative' }}>
                                <button 
                                  onClick={() => updateTextColorWithAutoBg(activeLayer.id, color)} 
                                  style={{ 
                                    width: '24px', 
                                    height: '24px', 
                                    borderRadius: '4px', 
                                    border: `2px solid ${activeLayer.color === color ? currentTheme.accent : 'transparent'}`, 
                                    background: color, 
                                    cursor: 'pointer', 
                                    padding: 0 
                                  }} 
                                />
                                {rating === 'Fail' && (
                                  <div style={{ 
                                    position: 'absolute', 
                                    top: '-2px', 
                                    right: '-2px', 
                                    width: '8px', 
                                    height: '8px', 
                                    background: '#ff0066', 
                                    borderRadius: '50%' 
                                  }} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Size slider */}
                      <div>
                        <label style={{ fontSize: '9px', color: effectiveTextMuted, display: 'block', marginBottom: '4px' }}>Size: {activeLayer.fontSize}px</label>
                        <input 
                          type="range" 
                          min="12" 
                          max="96" 
                          value={activeLayer.fontSize} 
                          onChange={(e) => updateTextLayer(activeLayer.id, { fontSize: parseInt(e.target.value) })} 
                          style={{ width: '100%', accentColor: currentTheme.accent }} 
                        />
                      </div>
                      
                      {/* Background controls */}
                      <div style={{ paddingTop: '8px', borderTop: `1px solid ${effectiveText}10` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <button 
                            onClick={() => updateTextLayer(activeLayer.id, { bgEnabled: !activeLayer.bgEnabled })} 
                            style={{ 
                              background: activeLayer.bgEnabled ? currentTheme.accent : 'transparent', 
                              border: `1px solid ${effectiveText}40`, 
                              borderRadius: '4px', 
                              padding: '4px 8px', 
                              color: activeLayer.bgEnabled ? getTextColor(currentTheme.accent) : effectiveTextMuted, 
                              cursor: 'pointer', 
                              fontSize: '10px', 
                              fontFamily: 'monospace' 
                            }}
                          >
                            BG BOX
                          </button>
                          {activeLayer.bgEnabled && (
                            <>
                              <button 
                                onClick={() => updateTextLayer(activeLayer.id, { autoBg: !activeLayer.autoBg })} 
                                style={{ 
                                  background: activeLayer.autoBg ? `${currentTheme.accent}30` : 'transparent', 
                                  border: `1px solid ${activeLayer.autoBg ? currentTheme.accent : `${effectiveText}30`}`, 
                                  borderRadius: '4px', 
                                  padding: '4px 6px', 
                                  color: activeLayer.autoBg ? currentTheme.accent : effectiveTextMuted, 
                                  cursor: 'pointer', 
                                  fontSize: '8px', 
                                  fontFamily: 'monospace' 
                                }}
                                title="Auto-select best contrasting background when text color changes"
                              >
                                AUTO
                              </button>
                              <div style={{ display: 'flex', gap: '2px' }}>
                                {['#000000', '#ffffff', ...currentColors.slice(0, 4)].map((color, i) => (
                                  <button 
                                    key={i} 
                                    onClick={() => updateTextLayer(activeLayer.id, { bgColor: color })} 
                                    style={{ 
                                      width: '20px', 
                                      height: '20px', 
                                      borderRadius: '3px', 
                                      border: `1px solid ${activeLayer.bgColor === color ? currentTheme.accent : 'transparent'}`, 
                                      background: color, 
                                      cursor: 'pointer', 
                                      padding: 0 
                                    }} 
                                  />
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                        
                        {activeLayer.bgEnabled && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {/* Width mode */}
                            <div>
                              <label style={{ fontSize: '9px', color: effectiveTextMuted, display: 'block', marginBottom: '4px' }}>Width</label>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                {['auto', 'full', 'custom'].map(mode => (
                                  <button 
                                    key={mode}
                                    onClick={() => updateTextLayer(activeLayer.id, { bgWidth: mode })}
                                    style={{ 
                                      flex: 1,
                                      background: activeLayer.bgWidth === mode ? `${currentTheme.accent}20` : 'transparent', 
                                      border: `1px solid ${activeLayer.bgWidth === mode ? currentTheme.accent : `${effectiveText}20`}`, 
                                      borderRadius: '4px', 
                                      padding: '4px', 
                                      color: activeLayer.bgWidth === mode ? currentTheme.accent : effectiveTextMuted, 
                                      cursor: 'pointer', 
                                      fontSize: '9px', 
                                      fontFamily: 'monospace',
                                      textTransform: 'capitalize'
                                    }}
                                  >
                                    {mode}
                                  </button>
                                ))}
                              </div>
                            </div>
                            
                            {activeLayer.bgWidth === 'custom' && (
                              <div>
                                <label style={{ fontSize: '9px', color: effectiveTextMuted, display: 'block', marginBottom: '4px' }}>Custom Width: {activeLayer.bgCustomWidth}%</label>
                                <input 
                                  type="range" 
                                  min="50" 
                                  max="200" 
                                  value={activeLayer.bgCustomWidth} 
                                  onChange={(e) => updateTextLayer(activeLayer.id, { bgCustomWidth: parseInt(e.target.value) })} 
                                  style={{ width: '100%', accentColor: currentTheme.accent }} 
                                />
                              </div>
                            )}
                            
                            {/* Padding controls */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                              <div>
                                <label style={{ fontSize: '9px', color: effectiveTextMuted, display: 'block', marginBottom: '4px' }}>H Padding: {activeLayer.bgPaddingH}px</label>
                                <input 
                                  type="range" 
                                  min="0" 
                                  max="60" 
                                  value={activeLayer.bgPaddingH} 
                                  onChange={(e) => updateTextLayer(activeLayer.id, { bgPaddingH: parseInt(e.target.value) })} 
                                  style={{ width: '100%', accentColor: currentTheme.accent }} 
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: '9px', color: effectiveTextMuted, display: 'block', marginBottom: '4px' }}>V Padding: {activeLayer.bgPaddingV}px</label>
                                <input 
                                  type="range" 
                                  min="0" 
                                  max="40" 
                                  value={activeLayer.bgPaddingV} 
                                  onChange={(e) => updateTextLayer(activeLayer.id, { bgPaddingV: parseInt(e.target.value) })} 
                                  style={{ width: '100%', accentColor: currentTheme.accent }} 
                                />
                              </div>
                            </div>
                            
                            {/* Opacity */}
                            <div>
                              <label style={{ fontSize: '9px', color: effectiveTextMuted, display: 'block', marginBottom: '4px' }}>Opacity: {activeLayer.bgOpacity}%</label>
                              <input 
                                type="range" 
                                min="20" 
                                max="100" 
                                value={activeLayer.bgOpacity} 
                                onChange={(e) => updateTextLayer(activeLayer.id, { bgOpacity: parseInt(e.target.value) })} 
                                style={{ width: '100%', accentColor: currentTheme.accent }} 
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {image && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: effectiveTextMuted, display: 'block', marginBottom: '8px', fontFamily: 'monospace' }}>Extract Colors: {colorCount}</label>
                  <input type="range" min="3" max="12" value={colorCount} onChange={(e) => handleColorCountChange(parseInt(e.target.value))} style={{ width: '100%', accentColor: appBgColor ? effectiveText : currentTheme.accent }} />
                </div>
              )}

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: effectiveTextMuted, margin: 0, fontFamily: 'monospace' }}>{image ? 'Extracted Palette' : 'Generated Palette'}</h3>
                  <button onClick={() => paletteFileInputRef.current?.click()} style={{ background: 'transparent', border: `1px solid ${appBgColor ? `${effectiveText}40` : currentTheme.border}`, borderRadius: '4px', padding: '4px 8px', color: effectiveTextMuted, cursor: 'pointer', fontSize: '9px', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '4px' }}><span>↑</span> NEW IMAGE</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {currentColors.map((color, i) => (
                    <div key={i} onClick={() => handleColorSelect(color)} style={{ aspectRatio: '1', backgroundColor: color, borderRadius: '8px', cursor: 'pointer', border: selectedColor === color ? `2px solid ${appBgColor ? effectiveText : currentTheme.accent}` : '2px solid transparent', position: 'relative' }}>
                      <span style={{ position: 'absolute', bottom: '4px', left: '4px', fontSize: '8px', fontFamily: 'monospace', color: getTextColor(color), opacity: 0.9 }}>{color.toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '32px', borderBottom: `1px solid ${appBgColor ? `${effectiveText}20` : currentTheme.border}`, paddingBottom: '16px' }}>
                {['generate', 'palette', 'fonts', 'contrast', 'typography', 'export'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: activeTab === tab ? `${appBgColor ? effectiveText : currentTheme.accent}15` : 'transparent', border: `1px solid ${activeTab === tab ? (appBgColor ? effectiveText : currentTheme.accent) : 'transparent'}`, padding: '8px 16px', borderRadius: '6px', color: activeTab === tab ? (appBgColor ? effectiveText : currentTheme.accent) : effectiveTextMuted, cursor: 'pointer', fontSize: '12px', textTransform: 'capitalize', fontFamily: 'monospace' }}>{tab}</button>
                ))}
              </div>

              {/* Generate Tab */}
              {activeTab === 'generate' && (
                <div>
                  <h3 style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: effectiveTextMuted, marginBottom: '16px', fontFamily: 'monospace' }}>Generate Palette from Prompt</h3>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <input 
                      type="text" 
                      value={palettePrompt} 
                      onChange={(e) => setPalettePrompt(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && generatePaletteFromPrompt(palettePrompt)}
                      placeholder="e.g., sunset beach, luxury minimal, tech startup..."
                      style={{ flex: 1, background: appBgColor ? `${effectiveText}10` : currentTheme.surface, border: `1px solid ${appBgColor ? `${effectiveText}20` : currentTheme.border}`, borderRadius: '8px', padding: '12px 16px', color: effectiveText, fontSize: '14px' }} 
                    />
                    <button onClick={() => generatePaletteFromPrompt(palettePrompt)} style={{ background: appBgColor ? effectiveText : currentTheme.accent, border: 'none', borderRadius: '8px', padding: '12px 24px', color: appBgColor ? appBgColor : getTextColor(currentTheme.accent), cursor: 'pointer', fontSize: '12px', fontFamily: 'monospace', fontWeight: '600' }}>GENERATE</button>
                  </div>
                  {recentPrompts.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <span style={{ fontSize: '10px', color: effectiveTextMuted, fontFamily: 'monospace' }}>Recent: </span>
                      {recentPrompts.map((prompt, i) => (
                        <button key={i} onClick={() => { setPalettePrompt(prompt); generatePaletteFromPrompt(prompt); }} style={{ background: 'transparent', border: `1px solid ${effectiveText}20`, borderRadius: '4px', padding: '4px 8px', color: effectiveTextMuted, cursor: 'pointer', fontSize: '10px', marginLeft: '8px', fontFamily: 'monospace' }}>{prompt}</button>
                      ))}
                    </div>
                  )}
                  {currentColors.length > 0 && (
                    <div>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        {currentColors.map((color, i) => (
                          <div key={i} onClick={() => handleColorSelect(color)} style={{ flex: 1, aspectRatio: '1', backgroundColor: color, borderRadius: '8px', cursor: 'pointer', border: selectedColor === color ? `3px solid ${currentTheme.accent}` : '3px solid transparent', position: 'relative' }}>
                            <span style={{ position: 'absolute', bottom: '4px', left: '4px', fontSize: '7px', fontFamily: 'monospace', color: getTextColor(color) }}>{color.toUpperCase()}</span>
                            <button onClick={(e) => { e.stopPropagation(); const newLocked = [...lockedColors]; newLocked[i] = newLocked[i] ? null : color; setLockedColors(newLocked); }} style={{ position: 'absolute', top: '4px', right: '4px', background: lockedColors[i] ? currentTheme.accent : 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '3px', padding: '2px 4px', cursor: 'pointer', fontSize: '8px', color: '#fff' }}>{lockedColors[i] ? '🔒' : '🔓'}</button>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => generatePaletteFromPrompt(palettePrompt || 'vibrant modern')} style={{ background: 'transparent', border: `1px solid ${effectiveText}30`, borderRadius: '6px', padding: '8px 16px', color: effectiveTextMuted, cursor: 'pointer', fontSize: '11px', fontFamily: 'monospace' }}>REGENERATE (keeps locked)</button>
                    </div>
                  )}
                </div>
              )}

              {/* Fonts Tab */}
              {activeTab === 'fonts' && (
                <div>
                  <h3 style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: effectiveTextMuted, marginBottom: '16px', fontFamily: 'monospace' }}>Font Pairing</h3>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <input 
                      type="text" 
                      value={fontPairPrompt} 
                      onChange={(e) => setFontPairPrompt(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && generateFontPairs(fontPairPrompt)}
                      placeholder="e.g., modern minimal, editorial luxury, tech startup..."
                      style={{ flex: 1, background: appBgColor ? `${effectiveText}10` : currentTheme.surface, border: `1px solid ${appBgColor ? `${effectiveText}20` : currentTheme.border}`, borderRadius: '8px', padding: '12px 16px', color: effectiveText, fontSize: '14px' }} 
                    />
                    <button onClick={() => generateFontPairs(fontPairPrompt)} style={{ background: appBgColor ? effectiveText : currentTheme.accent, border: 'none', borderRadius: '8px', padding: '12px 24px', color: appBgColor ? appBgColor : getTextColor(currentTheme.accent), cursor: 'pointer', fontSize: '12px', fontFamily: 'monospace', fontWeight: '600' }}>FIND PAIRS</button>
                  </div>
                  
                  {/* Font Preview */}
                  <div style={{ background: fontPreviewBg === 'light' ? '#fafafa' : fontPreviewBg === 'dark' ? '#0a0a0f' : (currentColors[0] || '#3b82f6'), padding: '32px', borderRadius: '12px', marginBottom: '16px', border: `1px solid ${effectiveText}20` }}>
                    <input type="text" value={fontPreviewHeading} onChange={(e) => setFontPreviewHeading(e.target.value)} style={{ background: 'transparent', border: 'none', width: '100%', color: fontPreviewBg === 'light' ? '#171717' : fontPreviewBg === 'dark' ? '#fafafa' : getTextColor(currentColors[0] || '#3b82f6'), fontSize: '32px', fontWeight: '700', fontFamily: fonts.find(f => f.name === selectedHeadingFont)?.stack || 'sans-serif', marginBottom: '12px', outline: 'none' }} />
                    <textarea value={fontPreviewSubhead} onChange={(e) => setFontPreviewSubhead(e.target.value)} style={{ background: 'transparent', border: 'none', width: '100%', color: fontPreviewBg === 'light' ? '#171717' : fontPreviewBg === 'dark' ? '#fafafa' : getTextColor(currentColors[0] || '#3b82f6'), fontSize: '14px', fontFamily: fonts.find(f => f.name === selectedBodyFont)?.stack || 'sans-serif', lineHeight: 1.6, outline: 'none', resize: 'none', minHeight: '50px' }} />
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${fontPreviewBg === 'light' ? '#00000010' : '#ffffff20'}` }}>
                      <span style={{ fontSize: '10px', fontFamily: 'monospace', color: fontPreviewBg === 'light' ? '#666' : '#999' }}>{selectedHeadingFont} + {selectedBodyFont}</span>
                    </div>
                  </div>
                  
                  {/* Preview controls */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    {['light', 'dark', 'color'].map(bg => (
                      <button key={bg} onClick={() => setFontPreviewBg(bg)} style={{ background: fontPreviewBg === bg ? `${currentTheme.accent}20` : 'transparent', border: `1px solid ${fontPreviewBg === bg ? currentTheme.accent : effectiveText + '20'}`, padding: '6px 12px', borderRadius: '4px', color: fontPreviewBg === bg ? currentTheme.accent : effectiveTextMuted, cursor: 'pointer', fontSize: '10px', textTransform: 'capitalize', fontFamily: 'monospace' }}>{bg}</button>
                    ))}
                  </div>
                  
                  {/* Suggested pairs */}
                  <div>
                    <h4 style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: effectiveTextMuted, marginBottom: '12px', fontFamily: 'monospace' }}>{suggestedPairs.length > 0 ? 'Suggested Pairs' : 'Classic Pairs'}</h4>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {(suggestedPairs.length > 0 ? suggestedPairs : classicPairs).map((pair, i) => (
                        <button key={i} onClick={() => { setSelectedHeadingFont(pair.heading); setSelectedBodyFont(pair.body); }} style={{ background: selectedHeadingFont === pair.heading && selectedBodyFont === pair.body ? `${currentTheme.accent}15` : appBgColor ? `${effectiveText}05` : currentTheme.surface, border: `1px solid ${selectedHeadingFont === pair.heading && selectedBodyFont === pair.body ? currentTheme.accent : (appBgColor ? `${effectiveText}20` : currentTheme.border)}`, borderRadius: '8px', padding: '12px 16px', textAlign: 'left', cursor: 'pointer' }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: effectiveText, marginBottom: '4px', fontFamily: fonts.find(f => f.name === pair.heading)?.stack }}>{pair.heading}</div>
                          <div style={{ fontSize: '11px', color: effectiveTextMuted, fontFamily: fonts.find(f => f.name === pair.body)?.stack }}>{pair.body}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'palette' && selectedColor && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '24px', marginBottom: '32px' }}>
                    <div onClick={() => copyToClipboard(selectedColor, selectedColor)} style={{ aspectRatio: '1', backgroundColor: selectedColor, borderRadius: '12px', cursor: 'pointer' }} />
                    <div>
                      {[{ label: 'HEX', value: selectedColor.toUpperCase(), copy: selectedColor }, { label: 'RGB', value: (() => { const rgb = hexToRgb(selectedColor); return rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : ''; })(), copy: (() => { const rgb = hexToRgb(selectedColor); return rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : ''; })() }, { label: 'HSL', value: (() => { const rgb = hexToRgb(selectedColor); if (!rgb) return ''; const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b); return `${hsl.h}°, ${hsl.s}%, ${hsl.l}%`; })(), copy: (() => { const rgb = hexToRgb(selectedColor); if (!rgb) return ''; const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b); return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`; })() }].map(({ label, value, copy }) => (
                        <div key={label} style={{ marginBottom: '12px' }}>
                          <span style={{ fontSize: '10px', color: effectiveTextMuted, display: 'block', marginBottom: '4px', fontFamily: 'monospace', letterSpacing: '0.1em' }}>{label}</span>
                          <span onClick={() => copyToClipboard(copy, label)} style={{ fontFamily: 'monospace', cursor: 'pointer', fontSize: '14px' }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: effectiveTextMuted, marginBottom: '20px', fontFamily: 'monospace' }}>Color Harmonies</h3>
                    {Object.entries(harmonies).map(([key, palette]) => {
                      const info = harmonyDescriptions[key];
                      return (
                        <div key={key} style={{ marginBottom: '24px', padding: '16px', background: appBgColor ? `${effectiveText}05` : currentTheme.surface, borderRadius: '12px', border: `1px solid ${appBgColor ? `${effectiveText}20` : currentTheme.border}` }}>
                          <div style={{ marginBottom: '12px' }}>
                            <span style={{ fontSize: '13px', color: effectiveText, fontWeight: '500', display: 'block', marginBottom: '4px' }}>{info.name}</span>
                            <span style={{ fontSize: '11px', color: effectiveTextMuted, display: 'block', marginBottom: '4px', lineHeight: '1.4' }}>{info.desc}</span>
                            <span style={{ fontSize: '10px', color: appBgColor ? effectiveText : currentTheme.accent, fontFamily: 'monospace' }}>↳ {info.use}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {palette.map((color, i) => (
                              <div key={i} onClick={() => copyToClipboard(color, color)} style={{ flex: 1, height: '48px', backgroundColor: color, borderRadius: i === 0 ? '6px 0 0 6px' : i === palette.length - 1 ? '0 6px 6px 0' : '0', cursor: 'pointer', position: 'relative' }}>
                                <span style={{ position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)', fontSize: '7px', fontFamily: 'monospace', color: getTextColor(color), opacity: 0.8 }}>{color.slice(1).toUpperCase()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'contrast' && currentColors.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: effectiveTextMuted, marginBottom: '20px', fontFamily: 'monospace' }}>WCAG Contrast Analysis</h3>
                  <div style={{ display: 'grid', gap: '8px', maxHeight: '600px', overflowY: 'auto', paddingRight: '8px' }}>
                    {currentColors.map((color1, i) => currentColors.slice(i + 1).map((color2, j) => {
                      const ratio = getContrastRatio(color1, color2);
                      const { rating, color: ratingColor, label } = getWcagRating(ratio);
                      return (
                        <div key={`${i}-${j}`} style={{ display: 'grid', gridTemplateColumns: '50px 50px 1fr auto', alignItems: 'center', gap: '12px', padding: '12px', background: appBgColor ? `${effectiveText}05` : currentTheme.surface, borderRadius: '8px', border: `1px solid ${appBgColor ? `${effectiveText}20` : currentTheme.border}` }}>
                          <div style={{ width: '40px', height: '40px', backgroundColor: color1, borderRadius: '6px' }} />
                          <div style={{ width: '40px', height: '40px', backgroundColor: color2, borderRadius: '6px' }} />
                          <div>
                            <div style={{ fontSize: '16px', marginBottom: '2px', fontWeight: '600' }}>{ratio}:1</div>
                            <div style={{ fontSize: '9px', color: effectiveTextMuted, fontFamily: 'monospace' }}>{color1} × {color2}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '11px', fontWeight: '600', color: ratingColor, padding: '4px 8px', background: `${ratingColor}15`, borderRadius: '4px', display: 'block', marginBottom: '2px', fontFamily: 'monospace' }}>{rating}</span>
                            <span style={{ fontSize: '9px', color: effectiveTextMuted }}>{label}</span>
                          </div>
                        </div>
                      );
                    }))}
                  </div>
                </div>
              )}

              {activeTab === 'typography' && selectedColor && (
                <div>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    <div>
                      <label style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: effectiveTextMuted, display: 'block', marginBottom: '8px', fontFamily: 'monospace' }}>Typeface</label>
                      <select value={selectedFont} onChange={(e) => setSelectedFont(e.target.value)} style={{ background: appBgColor ? `${effectiveText}10` : currentTheme.surface, border: `1px solid ${appBgColor ? `${effectiveText}20` : currentTheme.border}`, borderRadius: '6px', padding: '8px 12px', color: effectiveText, fontSize: '12px', cursor: 'pointer', minWidth: '140px' }}>
                        {fonts.map(font => <option key={font.name} value={font.name} style={{ background: currentTheme.bg, color: currentTheme.text }}>{font.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: effectiveTextMuted, display: 'block', marginBottom: '8px', fontFamily: 'monospace' }}>Color Scheme</label>
                      <select value={selectedHarmony} onChange={(e) => setSelectedHarmony(e.target.value)} style={{ background: appBgColor ? `${effectiveText}10` : currentTheme.surface, border: `1px solid ${appBgColor ? `${effectiveText}20` : currentTheme.border}`, borderRadius: '6px', padding: '8px 12px', color: effectiveText, fontSize: '12px', cursor: 'pointer', minWidth: '160px' }}>
                        {Object.entries(harmonyDescriptions).map(([key, info]) => <option key={key} value={key} style={{ background: currentTheme.bg, color: currentTheme.text }}>{info.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: effectiveTextMuted, display: 'block', marginBottom: '8px', fontFamily: 'monospace' }}>Background</label>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {['light', 'dark', 'color'].map(bg => (
                          <button key={bg} onClick={() => setPreviewBg(bg)} style={{ background: previewBg === bg ? `${appBgColor ? effectiveText : currentTheme.accent}15` : 'transparent', border: `1px solid ${appBgColor ? `${effectiveText}30` : currentTheme.border}`, padding: '8px 12px', borderRadius: '6px', color: previewBg === bg ? (appBgColor ? effectiveText : currentTheme.accent) : effectiveTextMuted, cursor: 'pointer', fontSize: '11px', textTransform: 'capitalize', fontFamily: 'monospace' }}>{bg}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: effectiveTextMuted, display: 'block', marginBottom: '8px', fontFamily: 'monospace' }}>H1: {fontSize.h1}px</label>
                      <input type="range" min="24" max="72" value={fontSize.h1} onChange={(e) => setFontSize({ ...fontSize, h1: parseInt(e.target.value) })} style={{ width: '100px', accentColor: appBgColor ? effectiveText : currentTheme.accent }} />
                    </div>
                  </div>
                  {harmonies[selectedHarmony] && (
                    <div style={{ background: previewBg === 'light' ? '#fafafa' : previewBg === 'dark' ? '#0a0a0f' : harmonies[selectedHarmony][0], padding: '48px', borderRadius: '12px', border: `1px solid ${appBgColor ? `${effectiveText}20` : currentTheme.border}` }}>
                      {(() => {
                        const palette = harmonies[selectedHarmony];
                        const h1Color = previewBg === 'color' ? getTextColor(palette[0]) : palette[0];
                        const h2Color = palette[1] || palette[0];
                        const bodyColor = previewBg === 'color' ? `${getTextColor(palette[0])}dd` : previewBg === 'light' ? '#171717' : '#e5e5e5';
                        const buttonBg = previewBg === 'color' ? getTextColor(palette[0]) : palette[0];
                        const buttonText = previewBg === 'color' ? palette[0] : getTextColor(palette[0]);
                        const linkColor = palette[palette.length > 2 ? 2 : 1] || palette[0];
                        return (
                          <>
                            <h1 style={{ color: h1Color, fontSize: `${fontSize.h1}px`, fontWeight: '700', marginBottom: '16px', lineHeight: 1.1, fontFamily: fonts.find(f => f.name === selectedFont)?.stack }}>Display Heading</h1>
                            <h2 style={{ color: previewBg === 'color' ? `${getTextColor(palette[0])}cc` : h2Color, fontSize: `${fontSize.h2}px`, fontWeight: '600', marginBottom: '16px', fontFamily: fonts.find(f => f.name === selectedFont)?.stack }}>Section Heading</h2>
                            <p style={{ color: bodyColor, fontSize: `${fontSize.body}px`, lineHeight: 1.7, marginBottom: '24px', fontFamily: fonts.find(f => f.name === selectedFont)?.stack }}>Body text demonstrates readability. The quick brown fox jumps over the lazy dog.</p>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                              <button style={{ background: buttonBg, color: buttonText, border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: fonts.find(f => f.name === selectedFont)?.stack }}>Primary Button</button>
                              <button style={{ background: 'transparent', color: previewBg === 'color' ? getTextColor(palette[0]) : linkColor, border: `2px solid ${previewBg === 'color' ? getTextColor(palette[0]) : linkColor}`, padding: '10px 22px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: fonts.find(f => f.name === selectedFont)?.stack }}>Secondary</button>
                              <a href="#" style={{ color: previewBg === 'color' ? getTextColor(palette[0]) : linkColor, fontSize: '14px', fontFamily: fonts.find(f => f.name === selectedFont)?.stack }}>Link Text →</a>
                            </div>
                            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: `1px solid ${previewBg === 'color' ? `${getTextColor(palette[0])}20` : '#00000020'}` }}>
                              <div style={{ fontSize: '10px', color: previewBg === 'color' ? `${getTextColor(palette[0])}80` : '#666', marginBottom: '8px', fontFamily: 'monospace' }}>{harmonyDescriptions[selectedHarmony].name} palette:</div>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                {palette.map((color, i) => <div key={i} onClick={() => copyToClipboard(color, color)} style={{ width: '32px', height: '32px', backgroundColor: color, borderRadius: '4px', cursor: 'pointer' }} />)}
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'export' && currentColors.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: effectiveTextMuted, marginBottom: '20px', fontFamily: 'monospace' }}>Export Formats</h3>
                  {['css', 'scss', 'tailwind', 'json', 'figma'].map(format => (
                    <div key={format} style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', color: effectiveTextMuted, textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: '0.1em' }}>{format}</span>
                        <button onClick={() => copyToClipboard(generateExport(format), format.toUpperCase())} style={{ background: `${appBgColor ? effectiveText : currentTheme.accent}15`, border: `1px solid ${appBgColor ? `${effectiveText}30` : currentTheme.border}`, padding: '4px 12px', borderRadius: '4px', color: appBgColor ? effectiveText : currentTheme.accent, cursor: 'pointer', fontSize: '10px', fontFamily: 'monospace' }}>COPY</button>
                      </div>
                      <pre style={{ background: appBgColor ? `${effectiveText}05` : currentTheme.surface, border: `1px solid ${appBgColor ? `${effectiveText}20` : currentTheme.border}`, padding: '16px', borderRadius: '8px', fontSize: '11px', fontFamily: '"JetBrains Mono", monospace', overflow: 'auto', margin: 0, color: effectiveTextMuted }}>{generateExport(format)}</pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
      <input ref={paletteFileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <canvas ref={exportCanvasRef} style={{ display: 'none' }} />
      <canvas ref={smartColorCanvasRef} style={{ display: 'none' }} />
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&family=JetBrains+Mono:wght@400;500&family=Outfit:wght@300;400;500;600;700&family=Crimson+Pro:wght@300;400;600;700&family=Montserrat:wght@300;400;500;600;700&family=Open+Sans:wght@300;400;500;600;700&family=Lato:wght@300;400;700&family=Roboto:wght@300;400;500;700&family=Oswald:wght@300;400;500;600;700&family=Raleway:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Merriweather:wght@300;400;700&family=Lora:wght@400;500;600;700&family=Source+Sans+Pro:wght@300;400;600;700&family=Work+Sans:wght@300;400;500;600;700&family=DM+Sans:wght@400;500;700&family=Quicksand:wght@300;400;500;600;700&family=Nunito:wght@300;400;600;700&family=Cormorant+Garamond:wght@300;400;500;600;700&family=Bebas+Neue&family=Anton&family=Abril+Fatface&display=swap" rel="stylesheet" />
      <style>{`* { box-sizing: border-box; } body { margin: 0; } ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: ${appBgColor ? `${effectiveText}05` : currentTheme.surface}; } ::-webkit-scrollbar-thumb { background: ${appBgColor ? `${effectiveText}20` : currentTheme.border}; border-radius: 3px; }`}</style>
    </div>
  );
}
