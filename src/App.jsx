import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Palette, Type, Wand2, Shuffle, Pipette, Lock, Unlock, Copy, Check } from 'lucide-react';

// Main App Component
export default function ChromaticV7() {
  const [image, setImage] = useState(null);
  const [extractedColors, setExtractedColors] = useState([]);
  const [activeTab, setActiveTab] = useState('palette');
  const [theme, setTheme] = useState('clean');
  const [selectedPalette, setSelectedPalette] = useState(null);
  const [selectedHarmony, setSelectedHarmony] = useState(null);
  const [customHex, setCustomHex] = useState('');
  const [lockedColors, setLockedColors] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [colorVariations, setColorVariations] = useState([]);
  
  // Typography Playground State
  const [typographyPlayground, setTypographyPlayground] = useState({
    headerText: 'Your Header',
    subheaderText: 'Your Subheader',
    bodyText: 'Body text goes here',
    headerFont: 'Inter',
    bodyFont: 'Inter',
    bgColor: '#FFFFFF',
    headerColor: '#000000',
    subheaderColor: '#4A5568',
    bodyColor: '#718096',
    smartMode: false,
    linkedColors: true
  });
  
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const themes = {
    clean: { name: 'Clean Modern', bg: '#0a0a0f', text: '#ffffff', accent: '#00ff88', secondary: '#1a1a24' },
    y2k: { name: 'Y2K Cyber', bg: '#000000', text: '#00ff41', accent: '#ff00ff', secondary: '#0a0a0a' },
    brutalist: { name: 'Brutalist', bg: '#ffffff', text: '#000000', accent: '#ff0000', secondary: '#f0f0f0' },
    vaporwave: { name: 'Vaporwave', bg: '#1a0033', text: '#ff71ce', accent: '#01cdfe', secondary: '#2d0052' },
    terminal: { name: 'Terminal', bg: '#000000', text: '#33ff33', accent: '#ffff00', secondary: '#001100' },
    sunset: { name: 'Sunset', bg: '#1a1a2e', text: '#ff6b6b', accent: '#ffd93d', secondary: '#2d2d44' },
    ocean: { name: 'Ocean', bg: '#001f3f', text: '#7fdbff', accent: '#39cccc', secondary: '#003366' },
    forest: { name: 'Forest', bg: '#0d2818', text: '#a8e6cf', accent: '#56ab91', secondary: '#1a3a2e' }
  };

  const aestheticGenerators = {
    vibrant: { name: 'Vibrant Energy', desc: 'Bold, saturated colors with high contrast' },
    cool: { name: 'Cool Professional', desc: 'Blues, teals, and purples for trust and calm' },
    warm: { name: 'Warm & Inviting', desc: 'Oranges, reds, and yellows for energy' },
    earthy: { name: 'Earthy Natural', desc: 'Browns, greens, and earth tones' },
    pastel: { name: 'Soft Pastel', desc: 'Gentle, desaturated colors' },
    moody: { name: 'Moody Dark', desc: 'Deep, rich colors with drama' },
    neon: { name: 'Neon Glow', desc: 'Bright, electric colors that pop' },
    muted: { name: 'Muted Elegant', desc: 'Sophisticated, desaturated tones' },
    cyber: { name: 'Cyberpunk', desc: 'Neon pinks, blues, and purples' },
    brutalist: { name: 'Brutalist Bold', desc: 'High contrast blacks, whites, primary colors' },
    vaporwave: { name: 'Vaporwave Dream', desc: 'Pinks, purples, teals - 80s aesthetic' },
    monochrome: { name: 'Monochrome', desc: 'Single hue with varying lightness' }
  };

  const trendingFonts = [
    { name: 'Inter', category: 'Sans-serif', trending: true, pair: 'Lora', desc: 'Clean, modern, highly legible' },
    { name: 'Playfair Display', category: 'Serif', trending: true, pair: 'Source Sans Pro', desc: 'Elegant, high-contrast serif' },
    { name: 'Montserrat', category: 'Sans-serif', trending: true, pair: 'Merriweather', desc: 'Geometric, urban-inspired' },
    { name: 'Roboto', category: 'Sans-serif', trending: false, pair: 'Roboto Slab', desc: 'Friendly, mechanical balance' },
    { name: 'Lato', category: 'Sans-serif', trending: false, pair: 'Libre Baskerville', desc: 'Warm, stable, serious' },
    { name: 'Poppins', category: 'Sans-serif', trending: true, pair: 'Crimson Text', desc: 'Geometric with friendly curves' },
    { name: 'Raleway', category: 'Sans-serif', trending: false, pair: 'Lora', desc: 'Elegant, thin strokes' },
    { name: 'Space Grotesk', category: 'Sans-serif', trending: true, pair: 'Space Mono', desc: 'Tech-forward, geometric' }
  ];

  const harmonies = {
    complementary: {
      name: 'Complementary',
      desc: 'Opposite colors on the wheel - maximum contrast and energy. Great for call-to-action buttons and grabbing attention.',
      generate: (h, s, l) => [`hsl(${h}, ${s}%, ${l}%)`, `hsl(${(h + 180) % 360}, ${s}%, ${l}%)`]
    },
    triadic: {
      name: 'Triadic',
      desc: 'Three colors equally spaced - vibrant and balanced. Perfect for playful, energetic designs and interfaces.',
      generate: (h, s, l) => [`hsl(${h}, ${s}%, ${l}%)`, `hsl(${(h + 120) % 360}, ${s}%, ${l}%)`, `hsl(${(h + 240) % 360}, ${s}%, ${l}%)`]
    },
    analogous: {
      name: 'Analogous',
      desc: 'Adjacent colors - harmonious and comfortable. Ideal for backgrounds and creating cohesive, serene designs.',
      generate: (h, s, l) => [`hsl(${h}, ${s}%, ${l}%)`, `hsl(${(h + 30) % 360}, ${s}%, ${l}%)`, `hsl(${(h - 30 + 360) % 360}, ${s}%, ${l}%)`]
    },
    splitComplementary: {
      name: 'Split-Complementary',
      desc: 'Base color plus two adjacent to its complement - contrast without tension. Great for sophisticated designs.',
      generate: (h, s, l) => [`hsl(${h}, ${s}%, ${l}%)`, `hsl(${(h + 150) % 360}, ${s}%, ${l}%)`, `hsl(${(h + 210) % 360}, ${s}%, ${l}%)`]
    },
    tetradic: {
      name: 'Tetradic',
      desc: 'Two complementary pairs - rich and varied. Best for complex designs needing variety while maintaining balance.',
      generate: (h, s, l) => [`hsl(${h}, ${s}%, ${l}%)`, `hsl(${(h + 90) % 360}, ${s}%, ${l}%)`, `hsl(${(h + 180) % 360}, ${s}%, ${l}%)`, `hsl(${(h + 270) % 360}, ${s}%, ${l}%)`]
    },
    monochromatic: {
      name: 'Monochromatic',
      desc: 'One hue with varying lightness - elegant and cohesive. Perfect for minimalist designs and professional layouts.',
      generate: (h, s, l) => [`hsl(${h}, ${s}%, ${Math.max(20, l - 20)}%)`, `hsl(${h}, ${s}%, ${l}%)`, `hsl(${h}, ${s}%, ${Math.min(80, l + 20)}%)`]
    }
  };

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Playfair+Display:wght@400;700&family=Montserrat:wght@400;600;700&family=Roboto:wght@300;400;700&family=Lato:wght@300;400;700&family=Poppins:wght@400;600;700&family=Raleway:wght@300;400;600&family=Space+Grotesk:wght@400;600;700&family=Lora:wght@400;600&family=Source+Sans+Pro:wght@400;600&family=Merriweather:wght@400;700&family=Roboto+Slab:wght@400;700&family=Libre+Baskerville:wght@400;700&family=Crimson+Text:wght@400;600&family=Space+Mono:wght@400;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
        extractColors(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const extractColors = (imageSrc) => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      const colorMap = {};

      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const key = `${r},${g},${b}`;
        colorMap[key] = (colorMap[key] || 0) + 1;
      }

      const sortedColors = Object.entries(colorMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
        .map(([color]) => {
          const [r, g, b] = color.split(',').map(Number);
          return rgbToHex(r, g, b);
        });

      setExtractedColors(sortedColors);
      setLockedColors(new Array(sortedColors.length).fill(false));
      generateColorVariations(sortedColors[0]);
    };
    img.src = imageSrc;
  };

  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
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
        default: break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const getColorName = (hex) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 'Unknown';
    
    const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    let hue = 'Gray';
    if (s > 10) {
      if (h < 15 || h >= 345) hue = 'Red';
      else if (h < 45) hue = 'Orange';
      else if (h < 65) hue = 'Yellow';
      else if (h < 150) hue = 'Green';
      else if (h < 200) hue = 'Cyan';
      else if (h < 260) hue = 'Blue';
      else if (h < 290) hue = 'Purple';
      else if (h < 345) hue = 'Pink';
    }
    
    let lightness = '';
    if (l < 25) lightness = 'Dark ';
    else if (l > 75) lightness = 'Light ';
    
    let saturation = '';
    if (s < 20) saturation = 'Grayish ';
    else if (s > 70) saturation = 'Vivid ';
    else if (s > 40) saturation = 'Bright ';
    
    return `${lightness}${saturation}${hue}`.trim();
  };

  const generateColorVariations = (baseColor) => {
    const rgb = hexToRgb(baseColor);
    if (!rgb) return;
    
    const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    const variations = [
      { name: 'Lighter', color: `hsl(${h}, ${s}%, ${Math.min(l + 15, 95)}%)` },
      { name: 'Darker', color: `hsl(${h}, ${s}%, ${Math.max(l - 15, 10)}%)` },
      { name: 'Saturated', color: `hsl(${h}, ${Math.min(s + 20, 100)}%, ${l}%)` },
      { name: 'Desaturated', color: `hsl(${h}, ${Math.max(s - 20, 0)}%, ${l}%)` },
      { name: 'Warmer', color: `hsl(${(h + 15) % 360}, ${s}%, ${l}%)` },
      { name: 'Cooler', color: `hsl(${(h - 15 + 360) % 360}, ${s}%, ${l}%)` }
    ];
    
    setColorVariations(variations);
  };

  const generateAestheticPalette = (aesthetic) => {
    const generators = {
      vibrant: () => ['#FF1744', '#00E676', '#2979FF', '#FFD600', '#E040FB'],
      cool: () => ['#0288D1', '#00897B', '#5E35B1', '#00ACC1', '#1565C0'],
      warm: () => ['#F4511E', '#FB8C00', '#FDD835', '#E53935', '#FF6F00'],
      earthy: () => ['#6D4C41', '#8D6E63', '#A1887F', '#4E342E', '#5D4037'],
      pastel: () => ['#F8BBD0', '#C5CAE9', '#B2DFDB', '#FFE0B2', '#D1C4E9'],
      moody: () => ['#1A237E', '#4A148C', '#BF360C', '#263238', '#1B5E20'],
      neon: () => ['#FF00FF', '#00FFFF', '#FFFF00', '#FF1493', '#00FF00'],
      muted: () => ['#78909C', '#90A4AE', '#B0BEC5', '#607D8B', '#546E7A'],
      cyber: () => ['#FF006E', '#8338EC', '#3A86FF', '#FB5607', '#FFBE0B'],
      brutalist: () => ['#000000', '#FFFFFF', '#FF0000', '#0000FF', '#FFFF00'],
      vaporwave: () => ['#FF71CE', '#01CDFE', '#05FFA1', '#B967FF', '#FFFB96'],
      monochrome: () => {
        const h = Math.floor(Math.random() * 360);
        return [
          `hsl(${h}, 70%, 20%)`,
          `hsl(${h}, 60%, 35%)`,
          `hsl(${h}, 50%, 50%)`,
          `hsl(${h}, 40%, 65%)`,
          `hsl(${h}, 30%, 80%)`
        ];
      }
    };

    const colors = generators[aesthetic]();
    setExtractedColors(colors);
    setLockedColors(new Array(colors.length).fill(false));
    setSelectedPalette(aesthetic);
  };

  const generateHarmonyColors = (harmony) => {
    if (extractedColors.length === 0) return;
    
    const baseColor = extractedColors[0];
    const rgb = hexToRgb(baseColor);
    if (!rgb) return;
    
    const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const newColors = harmonies[harmony].generate(h, s, l);
    
    const updatedColors = extractedColors.map((color, index) => 
      lockedColors[index] ? color : (newColors[index] || color)
    );
    
    setExtractedColors(updatedColors);
    setSelectedHarmony(harmony);
  };

  const handleCustomHexAdd = () => {
    const hex = customHex.startsWith('#') ? customHex : `#${customHex}`;
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      setExtractedColors([...extractedColors, hex]);
      setLockedColors([...lockedColors, false]);
      setCustomHex('');
      generateColorVariations(hex);
    }
  };

  const toggleLock = (index) => {
    const newLocked = [...lockedColors];
    newLocked[index] = !newLocked[index];
    setLockedColors(newLocked);
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleEyedropper = async (index) => {
    if ('EyeDropper' in window) {
      try {
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        const newColors = [...extractedColors];
        newColors[index] = result.sRGBHex;
        setExtractedColors(newColors);
        generateColorVariations(result.sRGBHex);
      } catch (e) {
        console.log('Eyedropper cancelled');
      }
    } else {
      alert('Eyedropper not supported in this browser');
    }
  };

  const shufflePalette = () => {
    const newColors = extractedColors.map((color, i) => {
      if (lockedColors[i]) return color;
      const rgb = hexToRgb(color);
      if (!rgb) return color;
      const { h } = rgbToHsl(rgb.r, rgb.g, rgb.b);
      const newH = (h + Math.random() * 60 - 30 + 360) % 360;
      return `hsl(${newH}, ${60 + Math.random() * 30}%, ${40 + Math.random() * 20}%)`;
    });
    
    setExtractedColors(newColors);
  };

  const getContrastRatio = (color1, color2) => {
    const getLuminance = (hex) => {
      const rgb = hexToRgb(hex);
      if (!rgb) return 0;
      const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
        val /= 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  };

  const updateTypographyPlayground = (field, value) => {
    const newState = { ...typographyPlayground, [field]: value };
    
    if (newState.smartMode && field === 'bgColor') {
      const bgLuminance = hexToRgb(value);
      if (bgLuminance) {
        const { l } = rgbToHsl(bgLuminance.r, bgLuminance.g, bgLuminance.b);
        const isDark = l < 50;
        
        if (newState.linkedColors) {
          newState.headerColor = isDark ? '#FFFFFF' : '#000000';
          newState.subheaderColor = isDark ? '#E0E0E0' : '#4A5568';
          newState.bodyColor = isDark ? '#B0B0B0' : '#718096';
        }
      }
    }
    
    setTypographyPlayground(newState);
  };

  const exportPalette = (format) => {
    let output = '';
    
    switch(format) {
      case 'css':
        output = ':root {\n' + extractedColors.map((color, i) => 
          `  --color-${i + 1}: ${color};`
        ).join('\n') + '\n}';
        break;
      case 'scss':
        output = extractedColors.map((color, i) => 
          `$color-${i + 1}: ${color};`
        ).join('\n');
        break;
      case 'tailwind':
        output = 'module.exports = {\n  theme: {\n    extend: {\n      colors: {\n' + 
          extractedColors.map((color, i) => 
            `        'custom-${i + 1}': '${color}',`
          ).join('\n') + '\n      }\n    }\n  }\n}';
        break;
      case 'json':
        output = JSON.stringify(
          extractedColors.reduce((acc, color, i) => {
            acc[`color-${i + 1}`] = color;
            return acc;
          }, {}),
          null,
          2
        );
        break;
      default:
        break;
    }
    
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `palette.${format}`;
    a.click();
  };

  const currentTheme = themes[theme];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: currentTheme.bg,
      color: currentTheme.text,
      fontFamily: "'Inter', sans-serif",
      transition: 'all 0.3s ease'
    }}>
      {/* Header */}
      <div style={{
        padding: '2rem',
        borderBottom: `2px solid ${currentTheme.accent}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          background: `linear-gradient(135deg, ${currentTheme.accent}, ${currentTheme.text})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: 0
        }}>
          CHROMATIC V7
        </h1>
        
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {Object.entries(themes).map(([key, t]) => (
            <button
              key={key}
              onClick={() => setTheme(key)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: theme === key ? t.accent : t.secondary,
                color: theme === key ? t.bg : t.text,
                border: `2px solid ${t.accent}`,
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '2rem' }}>
        {/* Upload Section */}
        {!image && (
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `3px dashed ${currentTheme.accent}`,
              borderRadius: '12px',
              padding: '4rem',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: currentTheme.secondary,
              transition: 'all 0.3s',
              marginBottom: '2rem'
            }}
          >
            <Upload size={64} color={currentTheme.accent} style={{ margin: '0 auto' }} />
            <p style={{ marginTop: '1rem', fontSize: '1.25rem' }}>
              Click to upload an image
            </p>
            <p style={{ marginTop: '0.5rem', opacity: 0.7 }}>
              Or start with aesthetic generators below
            </p>
          </div>
        )}

        {image && (
          <div style={{
            marginBottom: '2rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <img 
              ref={imageRef}
              src={image} 
              alt="Uploaded" 
              style={{ 
                maxWidth: '200px', 
                maxHeight: '200px',
                borderRadius: '8px',
                border: `2px solid ${currentTheme.accent}`
              }} 
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: currentTheme.accent,
                color: currentTheme.bg,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Upload size={20} />
              NEW IMAGE
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          borderBottom: `2px solid ${currentTheme.secondary}`,
          flexWrap: 'wrap'
        }}>
          {[
            { id: 'palette', icon: Palette, label: 'Palette' },
            { id: 'typography', icon: Type, label: 'Typography' },
            { id: 'generate', icon: Wand2, label: 'Generate' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '1rem 2rem',
                backgroundColor: activeTab === tab.id ? currentTheme.accent : 'transparent',
                color: activeTab === tab.id ? currentTheme.bg : currentTheme.text,
                border: 'none',
                borderBottom: activeTab === tab.id ? `3px solid ${currentTheme.accent}` : '3px solid transparent',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Palette Tab */}
        {activeTab === 'palette' && (
          <div>
            {extractedColors.length > 0 && (
              <>
                {/* Palette Actions */}
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  marginBottom: '2rem',
                  flexWrap: 'wrap'
                }}>
                  <button
                    onClick={shufflePalette}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: currentTheme.accent,
                      color: currentTheme.bg,
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Shuffle size={20} />
                    Shuffle Unlocked
                  </button>

                  <div style={{ display: 'flex', gap: '0.5rem', flex: 1, maxWidth: '400px' }}>
                    <input
                      type="text"
                      value={customHex}
                      onChange={(e) => setCustomHex(e.target.value)}
                      placeholder="Add custom hex (e.g., #FF5733)"
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        backgroundColor: currentTheme.secondary,
                        color: currentTheme.text,
                        border: `2px solid ${currentTheme.accent}`,
                        borderRadius: '6px',
                        fontSize: '1rem'
                      }}
                    />
                    <button
                      onClick={handleCustomHexAdd}
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: currentTheme.accent,
                        color: currentTheme.bg,
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Color Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '1.5rem',
                  marginBottom: '2rem'
                }}>
                  {extractedColors.map((color, index) => (
                    <div key={index} style={{
                      backgroundColor: color,
                      borderRadius: '12px',
                      padding: '1.5rem',
                      border: `3px solid ${currentTheme.accent}`,
                      position: 'relative',
                      minHeight: '180px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        display: 'flex',
                        gap: '0.25rem'
                      }}>
                        <button
                          onClick={() => toggleLock(index)}
                          style={{
                            padding: '0.5rem',
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          {lockedColors[index] ? 
                            <Lock size={16} color="#fff" /> : 
                            <Unlock size={16} color="#fff" />
                          }
                        </button>
                        <button
                          onClick={() => handleEyedropper(index)}
                          style={{
                            padding: '0.5rem',
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <Pipette size={16} color="#fff" />
                        </button>
                      </div>
                      
                      <div style={{
                        marginTop: '2.5rem',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        padding: '0.75rem',
                        borderRadius: '6px'
                      }}>
                        <div style={{
                          color: '#fff',
                          fontWeight: '600',
                          fontSize: '0.875rem',
                          marginBottom: '0.25rem'
                        }}>
                          {getColorName(color)}
                        </div>
                        <div style={{
                          color: '#fff',
                          fontFamily: 'monospace',
                          fontSize: '1rem',
                          marginBottom: '0.5rem'
                        }}>
                          {color.toUpperCase()}
                        </div>
                        <button
                          onClick={() => {
                            copyToClipboard(color, index);
                            generateColorVariations(color);
                          }}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: currentTheme.accent,
                            color: currentTheme.bg,
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          {copiedIndex === index ? (
                            <>
                              <Check size={16} />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy size={16} />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Color Variations */}
                {colorVariations.length > 0 && (
                  <div style={{
                    backgroundColor: currentTheme.secondary,
                    padding: '1.5rem',
                    borderRadius: '12px',
                    marginBottom: '2rem'
                  }}>
                    <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Color Variations</h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                      gap: '1rem'
                    }}>
                      {colorVariations.map((variation, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setExtractedColors([...extractedColors, variation.color]);
                            setLockedColors([...lockedColors, false]);
                          }}
                          style={{
                            backgroundColor: variation.color,
                            padding: '1rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            border: `2px solid ${currentTheme.accent}`,
                            textAlign: 'center',
                            minHeight: '80px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <span style={{
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            color: '#fff',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.875rem',
                            fontWeight: '600'
                          }}>
                            {variation.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Harmony Generators */}
                <div style={{
                  backgroundColor: currentTheme.secondary,
                  padding: '1.5rem',
                  borderRadius: '12px',
                  marginBottom: '2rem'
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Color Harmonies</h3>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {Object.entries(harmonies).map(([key, harmony]) => (
                      <div key={key}>
                        <button
                          onClick={() => generateHarmonyColors(key)}
                          style={{
                            width: '100%',
                            padding: '1rem',
                            backgroundColor: selectedHarmony === key ? currentTheme.accent : currentTheme.bg,
                            color: selectedHarmony === key ? currentTheme.bg : currentTheme.text,
                            border: `2px solid ${currentTheme.accent}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontWeight: '600',
                            fontSize: '1rem',
                            transition: 'all 0.2s'
                          }}
                        >
                          {harmony.name}
                        </button>
                        <p style={{
                          margin: '0.5rem 0 0 0',
                          fontSize: '0.875rem',
                          opacity: 0.8,
                          paddingLeft: '1rem'
                        }}>
                          {harmony.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Export */}
                <div style={{
                  backgroundColor: currentTheme.secondary,
                  padding: '1.5rem',
                  borderRadius: '12px'
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Export Palette</h3>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {['css', 'scss', 'tailwind', 'json'].map(format => (
                      <button
                        key={format}
                        onClick={() => exportPalette(format)}
                        style={{
                          padding: '0.75rem 1.5rem',
                          backgroundColor: currentTheme.accent,
                          color: currentTheme.bg,
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <Download size={20} />
                        {format.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Typography Tab */}
        {activeTab === 'typography' && (
          <div style={{
            backgroundColor: currentTheme.secondary,
            padding: '2rem',
            borderRadius: '12px'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '2rem' }}>Typography Playground</h2>
            
            {/* Controls */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Header Text
                </label>
                <input
                  type="text"
                  value={typographyPlayground.headerText}
                  onChange={(e) => updateTypographyPlayground('headerText', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: currentTheme.bg,
                    color: currentTheme.text,
                    border: `2px solid ${currentTheme.accent}`,
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Subheader Text
                </label>
                <input
                  type="text"
                  value={typographyPlayground.subheaderText}
                  onChange={(e) => updateTypographyPlayground('subheaderText', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: currentTheme.bg,
                    color: currentTheme.text,
                    border: `2px solid ${currentTheme.accent}`,
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Body Text
                </label>
                <input
                  type="text"
                  value={typographyPlayground.bodyText}
                  onChange={(e) => updateTypographyPlayground('bodyText', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: currentTheme.bg,
                    color: currentTheme.text,
                    border: `2px solid ${currentTheme.accent}`,
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Header Font
                </label>
                <select
                  value={typographyPlayground.headerFont}
                  onChange={(e) => updateTypographyPlayground('headerFont', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: currentTheme.bg,
                    color: currentTheme.text,
                    border: `2px solid ${currentTheme.accent}`,
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                >
                  {trendingFonts.map(font => (
                    <option key={font.name} value={font.name}>
                      {font.name} {font.trending ? '⭐' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Body Font
                </label>
                <select
                  value={typographyPlayground.bodyFont}
                  onChange={(e) => updateTypographyPlayground('bodyFont', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: currentTheme.bg,
                    color: currentTheme.text,
                    border: `2px solid ${currentTheme.accent}`,
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                >
                  {trendingFonts.map(font => (
                    <option key={font.name} value={font.name}>
                      {font.name} {font.trending ? '⭐' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Background Color
                </label>
                <input
                  type="color"
                  value={typographyPlayground.bgColor}
                  onChange={(e) => updateTypographyPlayground('bgColor', e.target.value)}
                  style={{
                    width: '100%',
                    height: '45px',
                    padding: '0',
                    backgroundColor: currentTheme.bg,
                    border: `2px solid ${currentTheme.accent}`,
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Header Color
                </label>
                <input
                  type="color"
                  value={typographyPlayground.headerColor}
                  onChange={(e) => updateTypographyPlayground('headerColor', e.target.value)}
                  disabled={typographyPlayground.smartMode && typographyPlayground.linkedColors}
                  style={{
                    width: '100%',
                    height: '45px',
                    padding: '0',
                    backgroundColor: currentTheme.bg,
                    border: `2px solid ${currentTheme.accent}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    opacity: (typographyPlayground.smartMode && typographyPlayground.linkedColors) ? 0.5 : 1
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Subheader Color
                </label>
                <input
                  type="color"
                  value={typographyPlayground.subheaderColor}
                  onChange={(e) => updateTypographyPlayground('subheaderColor', e.target.value)}
                  disabled={typographyPlayground.smartMode && typographyPlayground.linkedColors}
                  style={{
                    width: '100%',
                    height: '45px',
                    padding: '0',
                    backgroundColor: currentTheme.bg,
                    border: `2px solid ${currentTheme.accent}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    opacity: (typographyPlayground.smartMode && typographyPlayground.linkedColors) ? 0.5 : 1
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Body Color
                </label>
                <input
                  type="color"
                  value={typographyPlayground.bodyColor}
                  onChange={(e) => updateTypographyPlayground('bodyColor', e.target.value)}
                  disabled={typographyPlayground.smartMode && typographyPlayground.linkedColors}
                  style={{
                    width: '100%',
                    height: '45px',
                    padding: '0',
                    backgroundColor: currentTheme.bg,
                    border: `2px solid ${currentTheme.accent}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    opacity: (typographyPlayground.smartMode && typographyPlayground.linkedColors) ? 0.5 : 1
                  }}
                />
              </div>
            </div>

            {/* Smart Mode Toggle */}
            <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={typographyPlayground.smartMode}
                  onChange={(e) => updateTypographyPlayground('smartMode', e.target.checked)}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: '600' }}>Smart Color Mode</span>
              </label>

              {typographyPlayground.smartMode && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={typographyPlayground.linkedColors}
                    onChange={(e) => updateTypographyPlayground('linkedColors', e.target.checked)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <span style={{ fontWeight: '600' }}>Link Colors</span>
                </label>
              )}
            </div>

            {/* Preview */}
            <div style={{
              backgroundColor: typographyPlayground.bgColor,
              padding: '3rem',
              borderRadius: '12px',
              border: `3px solid ${currentTheme.accent}`
            }}>
              <h1 style={{
                fontFamily: typographyPlayground.headerFont,
                color: typographyPlayground.headerColor,
                fontSize: '3rem',
                marginTop: 0,
                marginBottom: '1rem'
              }}>
                {typographyPlayground.headerText}
              </h1>
              <h2 style={{
                fontFamily: typographyPlayground.bodyFont,
                color: typographyPlayground.subheaderColor,
                fontSize: '1.75rem',
                marginTop: 0,
                marginBottom: '1rem'
              }}>
                {typographyPlayground.subheaderText}
              </h2>
              <p style={{
                fontFamily: typographyPlayground.bodyFont,
                color: typographyPlayground.bodyColor,
                fontSize: '1.125rem',
                lineHeight: '1.6',
                marginTop: 0
              }}>
                {typographyPlayground.bodyText}
              </p>
            </div>

            {/* Contrast Info */}
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              backgroundColor: currentTheme.bg,
              borderRadius: '8px'
            }}>
              <h4 style={{ marginTop: 0, marginBottom: '0.75rem' }}>Contrast Ratios</h4>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <div>Header: {getContrastRatio(typographyPlayground.bgColor, typographyPlayground.headerColor).toFixed(2)}:1</div>
                <div>Subheader: {getContrastRatio(typographyPlayground.bgColor, typographyPlayground.subheaderColor).toFixed(2)}:1</div>
                <div>Body: {getContrastRatio(typographyPlayground.bgColor, typographyPlayground.bodyColor).toFixed(2)}:1</div>
              </div>
            </div>

            {/* Font Info */}
            <div style={{
              marginTop: '1.5rem',
              padding: '1.5rem',
              backgroundColor: currentTheme.bg,
              borderRadius: '8px'
            }}>
              <h4 style={{ marginTop: 0, marginBottom: '1rem' }}>Font Pairing Guide</h4>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {trendingFonts.filter(f => 
                  f.name === typographyPlayground.headerFont || 
                  f.name === typographyPlayground.bodyFont
                ).map(font => (
                  <div key={font.name} style={{
                    padding: '1rem',
                    backgroundColor: currentTheme.secondary,
                    borderRadius: '6px',
                    border: `2px solid ${currentTheme.accent}`
                  }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {font.name}
                      {font.trending && <span>⭐ Trending</span>}
                    </div>
                    <div style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '0.5rem' }}>
                      {font.desc}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: currentTheme.accent }}>
                      Pairs well with: {font.pair}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div>
            <h2 style={{ marginTop: 0, marginBottom: '2rem' }}>Aesthetic Palette Generators</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              {Object.entries(aestheticGenerators).map(([key, generator]) => (
                <button
                  key={key}
                  onClick={() => generateAestheticPalette(key)}
                  style={{
                    padding: '2rem',
                    backgroundColor: selectedPalette === key ? currentTheme.accent : currentTheme.secondary,
                    color: selectedPalette === key ? currentTheme.bg : currentTheme.text,
                    border: `3px solid ${currentTheme.accent}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                    {generator.name}
                  </div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                    {generator.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
