import React, { useState, useRef, useCallback, useMemo } from 'react';

export default function App() {
  const [image, setImage] = useState(null);
  const [colors, setColors] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [harmonies, setHarmonies] = useState({});
  const [activeTab, setActiveTab] = useState('palette');
  const [copyNotification, setCopyNotification] = useState('');
  const [colorCount, setColorCount] = useState(6);
  const [selectedFont, setSelectedFont] = useState('Inter');
  const [fontSize, setFontSize] = useState({ h1: 48, h2: 32, body: 16 });
  const [selectedHarmony, setSelectedHarmony] = useState('complementary');
  const [theme, setTheme] = useState('cyber');
  const [generatedPalette, setGeneratedPalette] = useState([]);
  const [selectedMood, setSelectedMood] = useState(null);
  const [typographyMode, setTypographyMode] = useState('auto'); // 'auto', 'background', 'heading'
  const [selectedBgColor, setSelectedBgColor] = useState(null);
  const [selectedHeadingColor, setSelectedHeadingColor] = useState(null);
  const [customHex, setCustomHex] = useState('');
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const themes = {
    modern: {
      name: 'Clean Modern',
      bg: '#ffffff',
      surface: '#f5f5f5',
      border: '#e0e0e0',
      text: '#171717',
      textMuted: '#737373',
      accent: '#171717',
      accentGlow: 'transparent',
      grid: false
    },
    cyber: {
      name: 'Y2K Cyber',
      bg: '#0a0a0f',
      surface: 'rgba(0, 255, 136, 0.02)',
      border: 'rgba(0, 255, 136, 0.2)',
      text: '#fafafa',
      textMuted: '#666',
      accent: '#00ff88',
      accentGlow: 'rgba(0, 255, 136, 0.3)',
      grid: true
    },
    brutalist: {
      name: 'Brutalist',
      bg: '#ffffff',
      surface: '#ffffff',
      border: '#000000',
      text: '#000000',
      textMuted: '#000000',
      accent: '#000000',
      accentGlow: 'transparent',
      grid: false,
      borderWidth: '3px'
    },
    vapor: {
      name: 'Vaporwave',
      bg: '#1a0a2e',
      surface: 'rgba(255, 113, 206, 0.05)',
      border: 'rgba(255, 113, 206, 0.3)',
      text: '#fff1f9',
      textMuted: '#b794c7',
      accent: '#ff71ce',
      accentGlow: 'rgba(255, 113, 206, 0.4)',
      grid: true,
      gradientAccent: 'linear-gradient(135deg, #ff71ce, #01cdfe, #05ffa1)'
    },
    terminal: {
      name: 'Terminal',
      bg: '#0d0d0d',
      surface: '#0d0d0d',
      border: '#33ff33',
      text: '#33ff33',
      textMuted: '#1a8c1a',
      accent: '#33ff33',
      accentGlow: 'rgba(51, 255, 51, 0.3)',
      grid: false,
      scanlines: true
    }
  };

  const moods = {
    vibrant: {
      name: 'Vibrant',
      desc: 'Bold, energetic, attention-grabbing',
      generate: () => {
        const hue = Math.random() * 360;
        return [
          hslToHex(hue, 85, 55),
          hslToHex((hue + 30) % 360, 90, 50),
          hslToHex((hue + 180) % 360, 85, 55),
          hslToHex((hue + 210) % 360, 80, 60),
          hslToHex((hue + 60) % 360, 75, 65),
          hslToHex(hue, 90, 35)
        ];
      }
    },
    cool: {
      name: 'Cool',
      desc: 'Calm, professional, trustworthy',
      generate: () => {
        const baseHue = 180 + Math.random() * 60;
        return [
          hslToHex(baseHue, 60, 45),
          hslToHex(baseHue + 20, 50, 55),
          hslToHex(baseHue - 20, 55, 50),
          hslToHex(baseHue, 40, 70),
          hslToHex(baseHue + 10, 65, 35),
          hslToHex(baseHue - 10, 30, 80)
        ];
      }
    },
    warm: {
      name: 'Warm',
      desc: 'Cozy, inviting, friendly',
      generate: () => {
        const baseHue = Math.random() * 60;
        return [
          hslToHex(baseHue, 75, 50),
          hslToHex(baseHue + 20, 70, 55),
          hslToHex(baseHue - 15, 80, 45),
          hslToHex(baseHue + 10, 60, 70),
          hslToHex(baseHue + 30, 65, 60),
          hslToHex(baseHue, 50, 30)
        ];
      }
    },
    earthy: {
      name: 'Earthy',
      desc: 'Natural, organic, grounded',
      generate: () => {
        const baseHue = 30 + Math.random() * 30;
        return [
          hslToHex(baseHue, 40, 35),
          hslToHex(baseHue + 60, 35, 40),
          hslToHex(baseHue - 10, 45, 45),
          hslToHex(baseHue + 90, 30, 50),
          hslToHex(baseHue + 20, 35, 60),
          hslToHex(baseHue, 25, 75)
        ];
      }
    },
    pastel: {
      name: 'Pastel',
      desc: 'Soft, gentle, delicate',
      generate: () => {
        const hue = Math.random() * 360;
        return [
          hslToHex(hue, 50, 85),
          hslToHex((hue + 60) % 360, 45, 82),
          hslToHex((hue + 120) % 360, 55, 80),
          hslToHex((hue + 180) % 360, 40, 85),
          hslToHex((hue + 240) % 360, 50, 83),
          hslToHex((hue + 300) % 360, 45, 80)
        ];
      }
    },
    moody: {
      name: 'Moody',
      desc: 'Dark, dramatic, mysterious',
      generate: () => {
        const hue = Math.random() * 360;
        return [
          hslToHex(hue, 40, 20),
          hslToHex((hue + 30) % 360, 50, 25),
          hslToHex((hue + 180) % 360, 45, 30),
          hslToHex(hue, 60, 15),
          hslToHex((hue + 60) % 360, 35, 35),
          hslToHex((hue + 210) % 360, 55, 22)
        ];
      }
    },
    neon: {
      name: 'Neon',
      desc: 'Electric, futuristic, bold',
      generate: () => {
        const hue = Math.random() * 360;
        return [
          hslToHex(hue, 100, 50),
          hslToHex((hue + 60) % 360, 100, 50),
          hslToHex((hue + 180) % 360, 100, 50),
          hslToHex((hue + 240) % 360, 100, 50),
          hslToHex((hue + 120) % 360, 100, 50),
          hslToHex((hue + 300) % 360, 100, 50)
        ];
      }
    },
    muted: {
      name: 'Muted',
      desc: 'Sophisticated, understated, elegant',
      generate: () => {
        const hue = Math.random() * 360;
        return [
          hslToHex(hue, 20, 50),
          hslToHex((hue + 40) % 360, 15, 55),
          hslToHex((hue + 180) % 360, 25, 45),
          hslToHex((hue + 90) % 360, 18, 60),
          hslToHex((hue + 270) % 360, 22, 40),
          hslToHex(hue, 12, 70)
        ];
      }
    }
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
    complementary: {
      name: 'Complementary',
      desc: 'High contrast, vibrant look. Best for CTAs, headlines, or creating visual tension.',
      use: 'Hero sections, buttons, accent elements'
    },
    triadic: {
      name: 'Triadic',
      desc: 'Balanced and vibrant. Offers variety while maintaining harmony.',
      use: 'Illustrations, infographics, playful brands'
    },
    splitComplementary: {
      name: 'Split Complementary',
      desc: 'Strong contrast with less tension. Safer than complementary.',
      use: 'Web design, presentations, balanced layouts'
    },
    analogous: {
      name: 'Analogous',
      desc: 'Harmonious and serene. Colors sit next to each other on the wheel.',
      use: 'Backgrounds, gradients, cohesive themes'
    },
    tetradic: {
      name: 'Tetradic',
      desc: 'Rich and complex. Four colors forming a rectangle on the wheel.',
      use: 'Complex designs, dashboards, data visualization'
    },
    tints: {
      name: 'Tints',
      desc: 'Lighter variations. Add white to create softer versions.',
      use: 'Backgrounds, hover states, subtle hierarchy'
    },
    shades: {
      name: 'Shades',
      desc: 'Darker variations. Add black for depth and grounding.',
      use: 'Text, shadows, footer elements'
    }
  };

  // Color conversion utilities
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(Math.min(255, Math.max(0, x))).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const hslToHex = (h, s, l) => {
    const rgb = hslToRgb(h, s, l);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  };

  const rgbToHsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
        default: h = 0;
      }
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const hslToRgb = (h, s, l) => {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  };

  const getLuminance = (r, g, b) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const getContrastRatio = (color1, color2) => {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    if (!rgb1 || !rgb2) return 1;
    const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return ((lighter + 0.05) / (darker + 0.05)).toFixed(2);
  };

  const getWcagRating = (ratio) => {
    if (ratio >= 7) return { rating: 'AAA', color: themes[theme].accent, label: 'Excellent' };
    if (ratio >= 4.5) return { rating: 'AA', color: '#ffaa00', label: 'Good' };
    if (ratio >= 3) return { rating: 'AA Large', color: '#ff6600', label: 'Large text only' };
    return { rating: 'Fail', color: '#ff0066', label: 'Poor contrast' };
  };

  const generateHarmonies = (hex) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return {};
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    const harmonies = {
      complementary: [
        hex,
        rgbToHex(...Object.values(hslToRgb((hsl.h + 180) % 360, hsl.s, hsl.l)))
      ],
      triadic: [
        hex,
        rgbToHex(...Object.values(hslToRgb((hsl.h + 120) % 360, hsl.s, hsl.l))),
        rgbToHex(...Object.values(hslToRgb((hsl.h + 240) % 360, hsl.s, hsl.l)))
      ],
      splitComplementary: [
        hex,
        rgbToHex(...Object.values(hslToRgb((hsl.h + 150) % 360, hsl.s, hsl.l))),
        rgbToHex(...Object.values(hslToRgb((hsl.h + 210) % 360, hsl.s, hsl.l)))
      ],
      analogous: [
        rgbToHex(...Object.values(hslToRgb((hsl.h - 30 + 360) % 360, hsl.s, hsl.l))),
        hex,
        rgbToHex(...Object.values(hslToRgb((hsl.h + 30) % 360, hsl.s, hsl.l)))
      ],
      tetradic: [
        hex,
        rgbToHex(...Object.values(hslToRgb((hsl.h + 90) % 360, hsl.s, hsl.l))),
        rgbToHex(...Object.values(hslToRgb((hsl.h + 180) % 360, hsl.s, hsl.l))),
        rgbToHex(...Object.values(hslToRgb((hsl.h + 270) % 360, hsl.s, hsl.l)))
      ],
      tints: Array.from({ length: 5 }, (_, i) => 
        rgbToHex(...Object.values(hslToRgb(hsl.h, hsl.s, Math.min(95, hsl.l + (i + 1) * 10))))
      ),
      shades: Array.from({ length: 5 }, (_, i) => 
        rgbToHex(...Object.values(hslToRgb(hsl.h, hsl.s, Math.max(5, hsl.l - (i + 1) * 10))))
      )
    };

    return harmonies;
  };

  const extractColors = useCallback((imageData, k = 6) => {
    const pixels = [];
    for (let i = 0; i < imageData.data.length; i += 4) {
      if (imageData.data[i + 3] > 128) {
        pixels.push([imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]]);
      }
    }

    let centroids = [];
    for (let i = 0; i < k; i++) {
      centroids.push(pixels[Math.floor(Math.random() * pixels.length)]);
    }

    for (let iter = 0; iter < 15; iter++) {
      const clusters = Array.from({ length: k }, () => []);
      
      pixels.forEach(pixel => {
        let minDist = Infinity;
        let clusterIndex = 0;
        centroids.forEach((centroid, i) => {
          const dist = Math.sqrt(
            Math.pow(pixel[0] - centroid[0], 2) +
            Math.pow(pixel[1] - centroid[1], 2) +
            Math.pow(pixel[2] - centroid[2], 2)
          );
          if (dist < minDist) {
            minDist = dist;
            clusterIndex = i;
          }
        });
        clusters[clusterIndex].push(pixel);
      });

      centroids = clusters.map((cluster, i) => {
        if (cluster.length === 0) return centroids[i];
        return [
          cluster.reduce((sum, p) => sum + p[0], 0) / cluster.length,
          cluster.reduce((sum, p) => sum + p[1], 0) / cluster.length,
          cluster.reduce((sum, p) => sum + p[2], 0) / cluster.length
        ];
      });
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
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const extractedColors = extractColors(imageData, count);
      setColors(extractedColors);
      setGeneratedPalette([]);
      setSelectedMood(null);
      
      if (extractedColors.length > 0) {
        setSelectedColor(extractedColors[0]);
        setHarmonies(generateHarmonies(extractedColors[0]));
      }
    };
    img.src = imgSrc;
  }, [extractColors]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target.result);
      processImage(event.target.result, colorCount);
    };
    reader.readAsDataURL(file);
  };

  const handleColorCountChange = (count) => {
    setColorCount(count);
    if (image) {
      processImage(image, count);
    }
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setHarmonies(generateHarmonies(color));
  };

  const handleMoodGenerate = (moodKey) => {
    const palette = moods[moodKey].generate();
    setGeneratedPalette(palette);
    setSelectedMood(moodKey);
    setColors(palette);
    setImage(null);
    if (palette.length > 0) {
      setSelectedColor(palette[0]);
      setHarmonies(generateHarmonies(palette[0]));
    }
  };

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyNotification(`Copied ${label}`);
      setTimeout(() => setCopyNotification(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const generateExport = (format) => {
    const exportColors = colors.length > 0 ? colors : generatedPalette;
    if (exportColors.length === 0) return '';
    
    switch (format) {
      case 'css':
        return `:root {\n${exportColors.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n')}\n}`;
      case 'tailwind':
        return `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n${exportColors.map((c, i) => `        'brand-${i + 1}': '${c}',`).join('\n')}\n      }\n    }\n  }\n}`;
      case 'scss':
        return exportColors.map((c, i) => `$color-${i + 1}: ${c};`).join('\n');
      case 'json':
        return JSON.stringify(exportColors.reduce((acc, c, i) => ({ ...acc, [`color-${i + 1}`]: c }), {}), null, 2);
      case 'figma':
        return exportColors.map((c, i) => {
          const rgb = hexToRgb(c);
          return `Color ${i + 1}: ${c}\nRGB: ${rgb.r}, ${rgb.g}, ${rgb.b}`;
        }).join('\n\n');
      default:
        return exportColors.join(', ');
    }
  };

  const getTextColor = (bgHex) => {
    const rgb = hexToRgb(bgHex);
    if (!rgb) return '#000000';
    const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
    return luminance > 0.179 ? '#000000' : '#ffffff';
  };

  // Calculate best color pairs for current palette
  const bestPairs = useMemo(() => {
    const currentColors = colors.length > 0 ? colors : generatedPalette;
    if (currentColors.length < 2) return [];

    const pairs = [];
    
    // Add white and black as potential backgrounds
    const allColors = [...currentColors, '#ffffff', '#000000', '#fafafa', '#171717'];
    
    for (let i = 0; i < allColors.length; i++) {
      for (let j = 0; j < allColors.length; j++) {
        if (i !== j) {
          const ratio = parseFloat(getContrastRatio(allColors[i], allColors[j]));
          pairs.push({
            bg: allColors[i],
            text: allColors[j],
            ratio,
            rating: getWcagRating(ratio)
          });
        }
      }
    }

    // Sort by contrast ratio and get top pairs
    return pairs
      .filter(p => p.ratio >= 4.5)
      .sort((a, b) => b.ratio - a.ratio)
      .slice(0, 8);
  }, [colors, generatedPalette]);

  // Get suggested colors based on selected background or heading
  const getSuggestedColors = useMemo(() => {
    const currentColors = colors.length > 0 ? colors : generatedPalette;
    if (currentColors.length === 0) return { forBg: [], forHeading: [] };

    const allColors = [...currentColors, '#ffffff', '#000000', '#fafafa', '#171717'];
    
    // Suggestions when background is selected
    const forBg = selectedBgColor ? allColors
      .map(color => ({
        color,
        ratio: parseFloat(getContrastRatio(selectedBgColor, color)),
        rating: getWcagRating(parseFloat(getContrastRatio(selectedBgColor, color)))
      }))
      .filter(item => item.color !== selectedBgColor && item.ratio >= 3)
      .sort((a, b) => b.ratio - a.ratio)
      : [];

    // Suggestions when heading color is selected
    const forHeading = selectedHeadingColor ? allColors
      .map(color => ({
        color,
        ratio: parseFloat(getContrastRatio(color, selectedHeadingColor)),
        rating: getWcagRating(parseFloat(getContrastRatio(color, selectedHeadingColor)))
      }))
      .filter(item => item.color !== selectedHeadingColor && item.ratio >= 3)
      .sort((a, b) => b.ratio - a.ratio)
      : [];

    return { forBg, forHeading };
  }, [colors, generatedPalette, selectedBgColor, selectedHeadingColor]);

  const currentTheme = themes[theme];
  const currentColors = colors.length > 0 ? colors : generatedPalette;

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: currentTheme.bg, 
      color: currentTheme.text,
      fontFamily: '"Space Grotesk", -apple-system, BlinkMacSystemFont, sans-serif',
      transition: 'all 0.3s ease'
    }}>
      {/* Grid Background */}
      {currentTheme.grid && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(${currentTheme.accent}08 1px, transparent 1px),
            linear-gradient(90deg, ${currentTheme.accent}08 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          pointerEvents: 'none',
          zIndex: 0
        }} />
      )}

      {/* Scanlines for Terminal theme */}
      {currentTheme.scanlines && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)',
          pointerEvents: 'none',
          zIndex: 0
        }} />
      )}

      {/* Header */}
      <header style={{
        borderBottom: `1px solid ${currentTheme.border}`,
        padding: '20px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
        backdropFilter: 'blur(10px)',
        background: theme === 'modern' || theme === 'brutalist' ? currentTheme.bg : `${currentTheme.bg}cc`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: theme === 'brutalist' ? '0' : '8px',
            background: currentTheme.gradientAccent || currentTheme.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: theme === 'brutalist' ? `2px solid ${currentTheme.border}` : 'none'
          }}>
            <span style={{ fontSize: '16px', color: theme === 'brutalist' ? '#fff' : '#000' }}>◈</span>
          </div>
          <h1 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            letterSpacing: '-0.02em',
            margin: 0,
            background: currentTheme.gradientAccent || currentTheme.accent,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: theme === 'modern' || theme === 'brutalist' ? currentTheme.text : 'transparent'
          }}>
            CHROMATIC
          </h1>
        </div>
        
        {/* Theme Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            style={{
              background: currentTheme.surface,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: theme === 'brutalist' ? '0' : '6px',
              padding: '6px 12px',
              color: currentTheme.text,
              fontSize: '11px',
              cursor: 'pointer',
              fontFamily: 'monospace'
            }}
          >
            {Object.entries(themes).map(([key, t]) => (
              <option key={key} value={key} style={{ background: currentTheme.bg }}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Copy notification */}
      {copyNotification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: currentTheme.surface,
          border: `1px solid ${currentTheme.accent}`,
          padding: '12px 20px',
          borderRadius: theme === 'brutalist' ? '0' : '8px',
          fontSize: '13px',
          zIndex: 1000,
          color: currentTheme.accent,
          fontFamily: 'monospace'
        }}>
          {copyNotification}
        </div>
      )}

      <main style={{ padding: '48px', maxWidth: '1600px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Mode Selection - Image or Generate */}
        {!image && generatedPalette.length === 0 ? (
          <div>
            {/* Upload Section */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${currentTheme.border}`,
                borderRadius: theme === 'brutalist' ? '0' : '16px',
                padding: '60px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: currentTheme.surface,
                marginBottom: '48px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = currentTheme.accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = currentTheme.border;
              }}
            >
              <div style={{ 
                fontSize: '48px', 
                marginBottom: '16px',
                filter: currentTheme.accentGlow !== 'transparent' ? `drop-shadow(0 0 20px ${currentTheme.accentGlow})` : 'none'
              }}>
                ↑
              </div>
              <p style={{ 
                fontSize: '16px', 
                color: currentTheme.text, 
                marginBottom: '8px',
                fontWeight: '500'
              }}>
                Upload an image to extract colors
              </p>
              <p style={{ fontSize: '12px', color: currentTheme.textMuted, fontFamily: 'monospace' }}>
                PNG • JPG • WEBP
              </p>
            </div>

            {/* Mood Generator */}
            <div>
              <h2 style={{ 
                fontSize: '12px', 
                textTransform: 'uppercase', 
                letterSpacing: '0.15em',
                color: currentTheme.textMuted,
                marginBottom: '24px',
                fontFamily: 'monospace'
              }}>
                Or Generate by Mood
              </h2>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                gap: '12px' 
              }}>
                {Object.entries(moods).map(([key, mood]) => (
                  <button
                    key={key}
                    onClick={() => handleMoodGenerate(key)}
                    style={{
                      background: currentTheme.surface,
                      border: `1px solid ${currentTheme.border}`,
                      borderRadius: theme === 'brutalist' ? '0' : '12px',
                      padding: '20px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = currentTheme.accent;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = currentTheme.border;
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: currentTheme.text,
                      marginBottom: '4px'
                    }}>
                      {mood.name}
                    </div>
                    <div style={{ 
                      fontSize: '11px', 
                      color: currentTheme.textMuted,
                      lineHeight: '1.4'
                    }}>
                      {mood.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '48px' }}>
            {/* Left Column */}
            <div>
              {/* Image Preview or Generated Info */}
              {image ? (
                <div style={{ 
                  borderRadius: theme === 'brutalist' ? '0' : '12px', 
                  overflow: 'hidden', 
                  marginBottom: '24px',
                  position: 'relative',
                  border: `1px solid ${currentTheme.border}`
                }}>
                  <img 
                    src={image} 
                    alt="Uploaded" 
                    style={{ width: '100%', display: 'block' }}
                  />
                  <button
                    onClick={() => {
                      setImage(null);
                      setColors([]);
                      setSelectedColor(null);
                      setHarmonies({});
                    }}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'rgba(0, 0, 0, 0.8)',
                      border: `1px solid ${currentTheme.border}`,
                      borderRadius: theme === 'brutalist' ? '0' : '6px',
                      padding: '6px 12px',
                      color: currentTheme.accent,
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontFamily: 'monospace'
                    }}
                  >
                    REPLACE
                  </button>
                </div>
              ) : (
                <div style={{
                  padding: '24px',
                  background: currentTheme.surface,
                  borderRadius: theme === 'brutalist' ? '0' : '12px',
                  border: `1px solid ${currentTheme.border}`,
                  marginBottom: '24px'
                }}>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    marginBottom: '8px',
                    color: currentTheme.text
                  }}>
                    {selectedMood && moods[selectedMood].name} Palette
                  </div>
                  <div style={{ 
                    fontSize: '11px', 
                    color: currentTheme.textMuted,
                    marginBottom: '16px'
                  }}>
                    {selectedMood && moods[selectedMood].desc}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      onClick={() => selectedMood && handleMoodGenerate(selectedMood)}
                      style={{
                        background: currentTheme.accent,
                        border: 'none',
                        borderRadius: theme === 'brutalist' ? '0' : '6px',
                        padding: '8px 16px',
                        color: theme === 'terminal' ? '#000' : getTextColor(currentTheme.accent),
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontFamily: 'monospace'
                      }}
                    >
                      REGENERATE
                    </button>
                    
                    {/* Mood Dropdown */}
                    <select
                      value={selectedMood || ''}
                      onChange={(e) => handleMoodGenerate(e.target.value)}
                      style={{
                        background: currentTheme.surface,
                        border: `1px solid ${currentTheme.border}`,
                        borderRadius: theme === 'brutalist' ? '0' : '6px',
                        padding: '8px 12px',
                        color: currentTheme.text,
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontFamily: 'monospace'
                      }}
                    >
                      {Object.entries(moods).map(([key, mood]) => (
                        <option key={key} value={key} style={{ background: currentTheme.bg }}>
                          {mood.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Color Count Control (only for images) */}
              {image && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ 
                    fontSize: '10px', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.15em',
                    color: currentTheme.textMuted,
                    display: 'block',
                    marginBottom: '8px',
                    fontFamily: 'monospace'
                  }}>
                    Extract Colors: {colorCount}
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="12"
                    value={colorCount}
                    onChange={(e) => handleColorCountChange(parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      accentColor: currentTheme.accent
                    }}
                  />
                </div>
              )}

              {/* Palette */}
              <div>
                <h3 style={{ 
                  fontSize: '10px', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.15em',
                  color: currentTheme.textMuted,
                  marginBottom: '12px',
                  fontFamily: 'monospace'
                }}>
                  {image ? 'Extracted Palette' : 'Generated Palette'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {currentColors.map((color, i) => (
                    <div
                      key={i}
                      onClick={() => handleColorSelect(color)}
                      style={{
                        aspectRatio: '1',
                        backgroundColor: color,
                        borderRadius: theme === 'brutalist' ? '0' : '8px',
                        cursor: 'pointer',
                        border: selectedColor === color 
                          ? `2px solid ${currentTheme.accent}` 
                          : '2px solid transparent',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        boxShadow: selectedColor === color && currentTheme.accentGlow !== 'transparent'
                          ? `0 0 20px ${currentTheme.accentGlow}` 
                          : 'none'
                      }}
                    >
                      <span style={{
                        position: 'absolute',
                        bottom: '4px',
                        left: '4px',
                        fontSize: '8px',
                        fontFamily: 'monospace',
                        color: getTextColor(color),
                        opacity: 0.9
                      }}>
                        {color.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div>
              {/* Tabs */}
              <div style={{ 
                display: 'flex', 
                gap: '4px', 
                marginBottom: '32px',
                borderBottom: `1px solid ${currentTheme.border}`,
                paddingBottom: '16px'
              }}>
                {['palette', 'contrast', 'typography', 'export'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      background: activeTab === tab 
                        ? `${currentTheme.accent}15` 
                        : 'transparent',
                      border: activeTab === tab 
                        ? `1px solid ${currentTheme.border}` 
                        : '1px solid transparent',
                      padding: '8px 16px',
                      borderRadius: theme === 'brutalist' ? '0' : '6px',
                      color: activeTab === tab ? currentTheme.accent : currentTheme.textMuted,
                      cursor: 'pointer',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      transition: 'all 0.2s ease',
                      fontFamily: 'monospace'
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Palette Tab */}
              {activeTab === 'palette' && selectedColor && (
                <div>
                  {/* Color Details */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '140px 1fr', 
                    gap: '24px',
                    marginBottom: '40px',
                    padding: '24px',
                    background: currentTheme.surface,
                    borderRadius: theme === 'brutalist' ? '0' : '12px',
                    border: `1px solid ${currentTheme.border}`
                  }}>
                    <div 
                      style={{ 
                        aspectRatio: '1',
                        backgroundColor: selectedColor, 
                        borderRadius: theme === 'brutalist' ? '0' : '12px',
                        cursor: 'pointer',
                        boxShadow: currentTheme.accentGlow !== 'transparent' ? `0 0 40px ${selectedColor}40` : 'none'
                      }}
                      onClick={() => copyToClipboard(selectedColor, selectedColor)}
                    />
                    <div>
                      {[
                        { label: 'HEX', value: selectedColor.toUpperCase(), copy: selectedColor },
                        { 
                          label: 'RGB', 
                          value: (() => {
                            const rgb = hexToRgb(selectedColor);
                            return rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : '';
                          })(),
                          copy: (() => {
                            const rgb = hexToRgb(selectedColor);
                            return rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : '';
                          })()
                        },
                        { 
                          label: 'HSL', 
                          value: (() => {
                            const rgb = hexToRgb(selectedColor);
                            if (!rgb) return '';
                            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                            return `${hsl.h}°, ${hsl.s}%, ${hsl.l}%`;
                          })(),
                          copy: (() => {
                            const rgb = hexToRgb(selectedColor);
                            if (!rgb) return '';
                            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                            return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
                          })()
                        }
                      ].map(({ label, value, copy }) => (
                        <div key={label} style={{ marginBottom: '12px' }}>
                          <span style={{ 
                            fontSize: '10px', 
                            color: currentTheme.textMuted, 
                            display: 'block', 
                            marginBottom: '4px',
                            fontFamily: 'monospace',
                            letterSpacing: '0.1em'
                          }}>
                            {label}
                          </span>
                          <span 
                            style={{ 
                              fontFamily: 'monospace', 
                              cursor: 'pointer',
                              fontSize: '14px',
                              transition: 'color 0.2s'
                            }}
                            onClick={() => copyToClipboard(copy, label)}
                            onMouseEnter={(e) => e.target.style.color = currentTheme.accent}
                            onMouseLeave={(e) => e.target.style.color = currentTheme.text}
                          >
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Harmonies */}
                  <div>
                    <h3 style={{ 
                      fontSize: '10px', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.15em',
                      color: currentTheme.textMuted,
                      marginBottom: '20px',
                      fontFamily: 'monospace'
                    }}>
                      Color Harmonies
                    </h3>
                    
                    {Object.entries(harmonies).map(([key, palette]) => {
                      const info = harmonyDescriptions[key];
                      return (
                        <div key={key} style={{ 
                          marginBottom: '24px',
                          padding: '16px',
                          background: currentTheme.surface,
                          borderRadius: theme === 'brutalist' ? '0' : '12px',
                          border: `1px solid ${currentTheme.border}`
                        }}>
                          <div style={{ marginBottom: '12px' }}>
                            <span style={{ 
                              fontSize: '13px', 
                              color: currentTheme.text, 
                              fontWeight: '500',
                              display: 'block',
                              marginBottom: '4px'
                            }}>
                              {info.name}
                            </span>
                            <span style={{ 
                              fontSize: '11px', 
                              color: currentTheme.textMuted,
                              display: 'block',
                              marginBottom: '4px',
                              lineHeight: '1.4'
                            }}>
                              {info.desc}
                            </span>
                            <span style={{ 
                              fontSize: '10px', 
                              color: currentTheme.accent,
                              fontFamily: 'monospace'
                            }}>
                              ↳ {info.use}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {palette.map((color, i) => (
                              <div
                                key={i}
                                onClick={() => copyToClipboard(color, color)}
                                style={{
                                  flex: 1,
                                  height: '48px',
                                  backgroundColor: color,
                                  borderRadius: theme === 'brutalist' ? '0' : (i === 0 ? '6px 0 0 6px' : i === palette.length - 1 ? '0 6px 6px 0' : '0'),
                                  cursor: 'pointer',
                                  transition: 'transform 0.1s ease',
                                  position: 'relative'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scaleY(1.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scaleY(1)'}
                              >
                                <span style={{
                                  position: 'absolute',
                                  bottom: '2px',
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  fontSize: '7px',
                                  fontFamily: 'monospace',
                                  color: getTextColor(color),
                                  opacity: 0.8
                                }}>
                                  {color.slice(1).toUpperCase()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Contrast Tab */}
              {activeTab === 'contrast' && currentColors.length > 0 && (
                <div>
                  <h3 style={{ 
                    fontSize: '10px', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.15em',
                    color: currentTheme.textMuted,
                    marginBottom: '20px',
                    fontFamily: 'monospace'
                  }}>
                    WCAG Contrast Analysis
                  </h3>
                  
                  <div style={{ 
                    display: 'grid', 
                    gap: '8px',
                    maxHeight: '600px',
                    overflowY: 'auto',
                    paddingRight: '8px'
                  }}>
                    {currentColors.map((color1, i) => 
                      currentColors.slice(i + 1).map((color2, j) => {
                        const ratio = getContrastRatio(color1, color2);
                        const { rating, color: ratingColor, label } = getWcagRating(ratio);
                        
                        return (
                          <div 
                            key={`${i}-${j}`}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '50px 50px 1fr auto',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '12px',
                              background: currentTheme.surface,
                              borderRadius: theme === 'brutalist' ? '0' : '8px',
                              border: `1px solid ${currentTheme.border}`
                            }}
                          >
                            <div style={{ 
                              width: '40px', 
                              height: '40px', 
                              backgroundColor: color1, 
                              borderRadius: theme === 'brutalist' ? '0' : '6px'
                            }} />
                            <div style={{ 
                              width: '40px', 
                              height: '40px', 
                              backgroundColor: color2, 
                              borderRadius: theme === 'brutalist' ? '0' : '6px'
                            }} />
                            <div>
                              <div style={{ 
                                fontSize: '16px', 
                                marginBottom: '2px',
                                fontWeight: '600'
                              }}>
                                {ratio}:1
                              </div>
                              <div style={{ 
                                fontSize: '9px', 
                                color: currentTheme.textMuted,
                                fontFamily: 'monospace' 
                              }}>
                                {color1} × {color2}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ 
                                fontSize: '11px', 
                                fontWeight: '600',
                                color: ratingColor,
                                padding: '4px 8px',
                                background: `${ratingColor}15`,
                                borderRadius: theme === 'brutalist' ? '0' : '4px',
                                display: 'block',
                                marginBottom: '2px',
                                fontFamily: 'monospace'
                              }}>
                                {rating}
                              </span>
                              <span style={{
                                fontSize: '9px',
                                color: currentTheme.textMuted
                              }}>
                                {label}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Typography Tab */}
              {activeTab === 'typography' && selectedColor && (
                <div>
                  {/* Mode Selector */}
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ 
                      fontSize: '10px', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.15em',
                      color: currentTheme.textMuted,
                      display: 'block',
                      marginBottom: '8px',
                      fontFamily: 'monospace'
                    }}>
                      Smart Suggest Mode
                    </label>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {[
                        { key: 'auto', label: 'Auto (Harmony)' },
                        { key: 'background', label: 'I know my background' },
                        { key: 'heading', label: 'I know my heading' }
                      ].map(mode => (
                        <button
                          key={mode.key}
                          onClick={() => {
                            setTypographyMode(mode.key);
                            setSelectedBgColor(null);
                            setSelectedHeadingColor(null);
                          }}
                          style={{
                            background: typographyMode === mode.key 
                              ? `${currentTheme.accent}15` 
                              : 'transparent',
                            border: `1px solid ${typographyMode === mode.key ? currentTheme.accent : currentTheme.border}`,
                            padding: '8px 12px',
                            borderRadius: theme === 'brutalist' ? '0' : '6px',
                            color: typographyMode === mode.key ? currentTheme.accent : currentTheme.textMuted,
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontFamily: 'monospace'
                          }}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Auto Mode - Harmony Selection */}
                  {typographyMode === 'auto' && (
                    <div style={{ 
                      display: 'flex', 
                      gap: '16px', 
                      marginBottom: '24px',
                      flexWrap: 'wrap'
                    }}>
                      {/* Font Selector */}
                      <div>
                        <label style={{ 
                          fontSize: '10px', 
                          textTransform: 'uppercase', 
                          letterSpacing: '0.15em',
                          color: currentTheme.textMuted,
                          display: 'block',
                          marginBottom: '8px',
                          fontFamily: 'monospace'
                        }}>
                          Typeface
                        </label>
                        <select
                          value={selectedFont}
                          onChange={(e) => setSelectedFont(e.target.value)}
                          style={{
                            background: currentTheme.surface,
                            border: `1px solid ${currentTheme.border}`,
                            borderRadius: theme === 'brutalist' ? '0' : '6px',
                            padding: '8px 12px',
                            color: currentTheme.text,
                            fontSize: '12px',
                            cursor: 'pointer',
                            minWidth: '140px'
                          }}
                        >
                          {fonts.map(font => (
                            <option key={font.name} value={font.name} style={{ background: currentTheme.bg }}>
                              {font.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Harmony Selector */}
                      <div>
                        <label style={{ 
                          fontSize: '10px', 
                          textTransform: 'uppercase', 
                          letterSpacing: '0.15em',
                          color: currentTheme.textMuted,
                          display: 'block',
                          marginBottom: '8px',
                          fontFamily: 'monospace'
                        }}>
                          Color Scheme
                        </label>
                        <select
                          value={selectedHarmony}
                          onChange={(e) => setSelectedHarmony(e.target.value)}
                          style={{
                            background: currentTheme.surface,
                            border: `1px solid ${currentTheme.border}`,
                            borderRadius: theme === 'brutalist' ? '0' : '6px',
                            padding: '8px 12px',
                            color: currentTheme.text,
                            fontSize: '12px',
                            cursor: 'pointer',
                            minWidth: '160px'
                          }}
                        >
                          {Object.entries(harmonyDescriptions).map(([key, info]) => (
                            <option key={key} value={key} style={{ background: currentTheme.bg }}>
                              {info.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Size Control */}
                      <div>
                        <label style={{ 
                          fontSize: '10px', 
                          textTransform: 'uppercase', 
                          letterSpacing: '0.15em',
                          color: currentTheme.textMuted,
                          display: 'block',
                          marginBottom: '8px',
                          fontFamily: 'monospace'
                        }}>
                          H1: {fontSize.h1}px
                        </label>
                        <input
                          type="range"
                          min="24"
                          max="72"
                          value={fontSize.h1}
                          onChange={(e) => setFontSize({ ...fontSize, h1: parseInt(e.target.value) })}
                          style={{ width: '100px', accentColor: currentTheme.accent }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Background Selection Mode */}
                  {typographyMode === 'background' && (
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ 
                        fontSize: '10px', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.15em',
                        color: currentTheme.textMuted,
                        display: 'block',
                        marginBottom: '12px',
                        fontFamily: 'monospace'
                      }}>
                        Select Background Color
                      </label>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                        {[...currentColors, '#ffffff', '#000000', '#fafafa', '#171717'].map((color, i) => (
                          <div
                            key={i}
                            onClick={() => setSelectedBgColor(color)}
                            style={{
                              width: '40px',
                              height: '40px',
                              backgroundColor: color,
                              borderRadius: theme === 'brutalist' ? '0' : '6px',
                              cursor: 'pointer',
                              border: selectedBgColor === color 
                                ? `2px solid ${currentTheme.accent}` 
                                : `1px solid ${currentTheme.border}`
                            }}
                          />
                        ))}
                        {/* Custom hex input */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input
                            type="text"
                            placeholder="#hex"
                            value={customHex}
                            onChange={(e) => setCustomHex(e.target.value)}
                            style={{
                              width: '70px',
                              padding: '8px',
                              background: currentTheme.surface,
                              border: `1px solid ${currentTheme.border}`,
                              borderRadius: theme === 'brutalist' ? '0' : '4px',
                              color: currentTheme.text,
                              fontSize: '11px',
                              fontFamily: 'monospace'
                            }}
                          />
                          <button
                            onClick={() => {
                              if (/^#[0-9A-Fa-f]{6}$/.test(customHex)) {
                                setSelectedBgColor(customHex);
                              }
                            }}
                            style={{
                              padding: '8px 12px',
                              background: currentTheme.accent,
                              border: 'none',
                              borderRadius: theme === 'brutalist' ? '0' : '4px',
                              color: getTextColor(currentTheme.accent),
                              fontSize: '10px',
                              cursor: 'pointer',
                              fontFamily: 'monospace'
                            }}
                          >
                            SET
                          </button>
                        </div>
                      </div>

                      {/* Suggested text colors */}
                      {selectedBgColor && getSuggestedColors.forBg.length > 0 && (
                        <div style={{
                          padding: '16px',
                          background: currentTheme.surface,
                          borderRadius: theme === 'brutalist' ? '0' : '8px',
                          border: `1px solid ${currentTheme.border}`
                        }}>
                          <div style={{ 
                            fontSize: '11px', 
                            color: currentTheme.textMuted, 
                            marginBottom: '12px',
                            fontFamily: 'monospace'
                          }}>
                            Suggested text colors for {selectedBgColor}:
                          </div>
                          <div style={{ display: 'grid', gap: '8px' }}>
                            {getSuggestedColors.forBg.slice(0, 6).map((item, i) => (
                              <div 
                                key={i}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px',
                                  padding: '12px',
                                  background: selectedBgColor,
                                  borderRadius: theme === 'brutalist' ? '0' : '6px'
                                }}
                              >
                                <span style={{ 
                                  color: item.color, 
                                  fontSize: '16px', 
                                  fontWeight: '600',
                                  flex: 1 
                                }}>
                                  Sample Text
                                </span>
                                <span style={{ 
                                  fontSize: '10px', 
                                  fontFamily: 'monospace',
                                  color: item.color,
                                  opacity: 0.8
                                }}>
                                  {item.color}
                                </span>
                                <span style={{ 
                                  fontSize: '10px', 
                                  fontFamily: 'monospace',
                                  padding: '2px 6px',
                                  background: `${item.rating.color}20`,
                                  color: item.rating.color,
                                  borderRadius: '3px'
                                }}>
                                  {item.ratio}:1 {item.rating.rating}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Heading Selection Mode */}
                  {typographyMode === 'heading' && (
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ 
                        fontSize: '10px', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.15em',
                        color: currentTheme.textMuted,
                        display: 'block',
                        marginBottom: '12px',
                        fontFamily: 'monospace'
                      }}>
                        Select Heading Color
                      </label>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                        {[...currentColors, '#ffffff', '#000000'].map((color, i) => (
                          <div
                            key={i}
                            onClick={() => setSelectedHeadingColor(color)}
                            style={{
                              width: '40px',
                              height: '40px',
                              backgroundColor: color,
                              borderRadius: theme === 'brutalist' ? '0' : '6px',
                              cursor: 'pointer',
                              border: selectedHeadingColor === color 
                                ? `2px solid ${currentTheme.accent}` 
                                : `1px solid ${currentTheme.border}`
                            }}
                          />
                        ))}
                      </div>

                      {/* Suggested backgrounds */}
                      {selectedHeadingColor && getSuggestedColors.forHeading.length > 0 && (
                        <div style={{
                          padding: '16px',
                          background: currentTheme.surface,
                          borderRadius: theme === 'brutalist' ? '0' : '8px',
                          border: `1px solid ${currentTheme.border}`
                        }}>
                          <div style={{ 
                            fontSize: '11px', 
                            color: currentTheme.textMuted, 
                            marginBottom: '12px',
                            fontFamily: 'monospace'
                          }}>
                            Suggested backgrounds for {selectedHeadingColor} text:
                          </div>
                          <div style={{ display: 'grid', gap: '8px' }}>
                            {getSuggestedColors.forHeading.slice(0, 6).map((item, i) => (
                              <div 
                                key={i}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px',
                                  padding: '12px',
                                  background: item.color,
                                  borderRadius: theme === 'brutalist' ? '0' : '6px'
                                }}
                              >
                                <span style={{ 
                                  color: selectedHeadingColor, 
                                  fontSize: '16px', 
                                  fontWeight: '600',
                                  flex: 1 
                                }}>
                                  Sample Text
                                </span>
                                <span style={{ 
                                  fontSize: '10px', 
                                  fontFamily: 'monospace',
                                  color: selectedHeadingColor,
                                  opacity: 0.8
                                }}>
                                  {item.color}
                                </span>
                                <span style={{ 
                                  fontSize: '10px', 
                                  fontFamily: 'monospace',
                                  padding: '2px 6px',
                                  background: `${item.rating.color}20`,
                                  color: item.rating.color,
                                  borderRadius: '3px'
                                }}>
                                  {item.ratio}:1 {item.rating.rating}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Auto Mode Preview */}
                  {typographyMode === 'auto' && harmonies[selectedHarmony] && (
                    <>
                      <div style={{
                        background: '#fafafa',
                        padding: '48px',
                        borderRadius: theme === 'brutalist' ? '0' : '12px',
                        border: `1px solid ${currentTheme.border}`,
                        marginBottom: '16px'
                      }}>
                        {(() => {
                          const palette = harmonies[selectedHarmony];
                          const h1Color = palette[0];
                          const h2Color = palette[1] || palette[0];
                          const linkColor = palette[palette.length > 2 ? 2 : 1] || palette[0];

                          return (
                            <>
                              <h1 style={{ 
                                color: h1Color, 
                                fontSize: `${fontSize.h1}px`, 
                                fontWeight: '700',
                                marginBottom: '16px',
                                lineHeight: 1.1,
                                fontFamily: fonts.find(f => f.name === selectedFont)?.stack
                              }}>
                                Display Heading
                              </h1>
                              <h2 style={{ 
                                color: h2Color, 
                                fontSize: `${fontSize.h2}px`, 
                                fontWeight: '600',
                                marginBottom: '16px',
                                fontFamily: fonts.find(f => f.name === selectedFont)?.stack
                              }}>
                                Section Heading
                              </h2>
                              <p style={{ 
                                color: '#171717', 
                                fontSize: `${fontSize.body}px`, 
                                lineHeight: 1.7,
                                marginBottom: '24px',
                                fontFamily: fonts.find(f => f.name === selectedFont)?.stack
                              }}>
                                Body text demonstrates readability across different backgrounds. 
                                The quick brown fox jumps over the lazy dog.
                              </p>
                              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <button style={{
                                  background: h1Color,
                                  color: getTextColor(h1Color),
                                  border: 'none',
                                  padding: '12px 24px',
                                  borderRadius: theme === 'brutalist' ? '0' : '8px',
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  fontFamily: fonts.find(f => f.name === selectedFont)?.stack
                                }}>
                                  Primary Button
                                </button>
                                <button style={{
                                  background: 'transparent',
                                  color: linkColor,
                                  border: `2px solid ${linkColor}`,
                                  padding: '10px 22px',
                                  borderRadius: theme === 'brutalist' ? '0' : '8px',
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  fontFamily: fonts.find(f => f.name === selectedFont)?.stack
                                }}>
                                  Secondary
                                </button>
                                <a href="#" style={{ 
                                  color: linkColor, 
                                  fontSize: '14px',
                                  fontFamily: fonts.find(f => f.name === selectedFont)?.stack
                                }}>
                                  Link Text →
                                </a>
                              </div>

                              {/* Color swatches */}
                              <div style={{ 
                                marginTop: '24px', 
                                paddingTop: '24px', 
                                borderTop: '1px solid #e0e0e0'
                              }}>
                                <div style={{ 
                                  fontSize: '10px', 
                                  color: '#666',
                                  marginBottom: '8px',
                                  fontFamily: 'monospace'
                                }}>
                                  {harmonyDescriptions[selectedHarmony].name} palette:
                                </div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  {palette.map((color, i) => (
                                    <div
                                      key={i}
                                      onClick={() => copyToClipboard(color, color)}
                                      style={{
                                        width: '32px',
                                        height: '32px',
                                        backgroundColor: color,
                                        borderRadius: theme === 'brutalist' ? '0' : '4px',
                                        cursor: 'pointer'
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      {/* Contrast info */}
                      <div style={{
                        padding: '12px 16px',
                        background: currentTheme.surface,
                        borderRadius: theme === 'brutalist' ? '0' : '8px',
                        border: `1px solid ${currentTheme.border}`,
                        fontSize: '11px',
                        color: currentTheme.textMuted,
                        fontFamily: 'monospace'
                      }}>
                        {(() => {
                          const palette = harmonies[selectedHarmony];
                          const ratio = getContrastRatio('#fafafa', palette[0]);
                          const { rating } = getWcagRating(ratio);
                          return `H1 contrast on light: ${ratio}:1 (${rating})`;
                        })()}
                      </div>
                    </>
                  )}

                  {/* Best Pairs Panel */}
                  {bestPairs.length > 0 && (
                    <div style={{ marginTop: '32px' }}>
                      <h3 style={{ 
                        fontSize: '10px', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.15em',
                        color: currentTheme.textMuted,
                        marginBottom: '16px',
                        fontFamily: 'monospace'
                      }}>
                        Best Contrast Pairs
                      </h3>
                      <div style={{ display: 'grid', gap: '8px' }}>
                        {bestPairs.map((pair, i) => (
                          <div 
                            key={i}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '12px',
                              background: pair.bg,
                              borderRadius: theme === 'brutalist' ? '0' : '8px',
                              border: `1px solid ${currentTheme.border}`
                            }}
                          >
                            <span style={{ 
                              color: pair.text, 
                              fontSize: '14px', 
                              fontWeight: '600',
                              flex: 1 
                            }}>
                              {i < 2 ? 'Best for body text' : i < 4 ? 'Best for headings' : 'Good for buttons'}
                            </span>
                            <span style={{ 
                              fontSize: '9px', 
                              fontFamily: 'monospace',
                              color: pair.text,
                              opacity: 0.7
                            }}>
                              {pair.bg} / {pair.text}
                            </span>
                            <span style={{ 
                              fontSize: '10px', 
                              fontFamily: 'monospace',
                              padding: '2px 6px',
                              background: `${pair.rating.color}20`,
                              color: pair.rating.color,
                              borderRadius: '3px'
                            }}>
                              {pair.ratio}:1
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Export Tab */}
              {activeTab === 'export' && currentColors.length > 0 && (
                <div>
                  <h3 style={{ 
                    fontSize: '10px', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.15em',
                    color: currentTheme.textMuted,
                    marginBottom: '20px',
                    fontFamily: 'monospace'
                  }}>
                    Export Formats
                  </h3>
                  
                  {['css', 'scss', 'tailwind', 'json', 'figma'].map(format => (
                    <div key={format} style={{ marginBottom: '20px' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <span style={{ 
                          fontSize: '11px', 
                          color: currentTheme.textMuted, 
                          textTransform: 'uppercase',
                          fontFamily: 'monospace',
                          letterSpacing: '0.1em'
                        }}>
                          {format}
                        </span>
                        <button
                          onClick={() => copyToClipboard(generateExport(format), format.toUpperCase())}
                          style={{
                            background: `${currentTheme.accent}15`,
                            border: `1px solid ${currentTheme.border}`,
                            padding: '4px 12px',
                            borderRadius: theme === 'brutalist' ? '0' : '4px',
                            color: currentTheme.accent,
                            cursor: 'pointer',
                            fontSize: '10px',
                            fontFamily: 'monospace'
                          }}
                        >
                          COPY
                        </button>
                      </div>
                      <pre style={{
                        background: currentTheme.surface,
                        border: `1px solid ${currentTheme.border}`,
                        padding: '16px',
                        borderRadius: theme === 'brutalist' ? '0' : '8px',
                        fontSize: '11px',
                        fontFamily: '"JetBrains Mono", monospace',
                        overflow: 'auto',
                        margin: 0,
                        color: currentTheme.textMuted
                      }}>
                        {generateExport(format)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Hidden elements */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700&family=JetBrains+Mono:wght@400;500&family=Outfit:wght@400;500;600;700&family=Crimson+Pro:wght@400;600;700&display=swap" rel="stylesheet" />

      <style>{`
        * {
          box-sizing: border-box;
        }
        body {
          margin: 0;
        }
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: ${currentTheme.surface};
        }
        ::-webkit-scrollbar-thumb {
          background: ${currentTheme.border};
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${currentTheme.accent};
        }
      `}</style>
    </div>
  );
}
