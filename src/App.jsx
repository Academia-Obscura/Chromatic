import React, { useState, useRef, useCallback } from 'react';

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
  const [textOverlay, setTextOverlay] = useState({
    enabled: false,
    text: 'Your Text Here',
    type: 'header',
    color: '#ffffff',
    bgEnabled: false,
    bgColor: '#000000',
    bgOpacity: 80,
    bgPadding: 20,
    position: 'center',
    fontSize: 48
  });
  
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const paletteFileInputRef = useRef(null);

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

  const hexToRgb = (hex) => { const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex); return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : null; };
  const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => { const h = Math.round(Math.min(255, Math.max(0, x))).toString(16); return h.length === 1 ? '0' + h : h; }).join('');
  const hslToHex = (h, s, l) => { const rgb = hslToRgb(h, s, l); return rgbToHex(rgb.r, rgb.g, rgb.b); };
  const rgbToHsl = (r, g, b) => { r /= 255; g /= 255; b /= 255; const max = Math.max(r, g, b), min = Math.min(r, g, b); let h, s, l = (max + min) / 2; if (max === min) { h = s = 0; } else { const d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min); switch (max) { case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break; case g: h = ((b - r) / d + 2) / 6; break; case b: h = ((r - g) / d + 4) / 6; break; default: h = 0; } } return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }; };
  const hslToRgb = (h, s, l) => { h /= 360; s /= 100; l /= 100; let r, g, b; if (s === 0) { r = g = b = l; } else { const hue2rgb = (p, q, t) => { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1/6) return p + (q - p) * 6 * t; if (t < 1/2) return q; if (t < 2/3) return p + (q - p) * (2/3 - t) * 6; return p; }; const q = l < 0.5 ? l * (1 + s) : l + s - l * s; const p = 2 * l - q; r = hue2rgb(p, q, h + 1/3); g = hue2rgb(p, q, h); b = hue2rgb(p, q, h - 1/3); } return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) }; };
  const getLuminance = (r, g, b) => { const [rs, gs, bs] = [r, g, b].map(c => { c = c / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }); return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs; };
  const getContrastRatio = (c1, c2) => { const rgb1 = hexToRgb(c1); const rgb2 = hexToRgb(c2); if (!rgb1 || !rgb2) return 1; const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b); const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b); return ((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2); };
  const getWcagRating = (ratio) => { const t = themes[theme]; if (ratio >= 7) return { rating: 'AAA', color: t.accent, label: 'Excellent' }; if (ratio >= 4.5) return { rating: 'AA', color: '#ffaa00', label: 'Good' }; if (ratio >= 3) return { rating: 'AA Large', color: '#ff6600', label: 'Large text' }; return { rating: 'Fail', color: '#ff0066', label: 'Poor' }; };
  const getTextColor = (bgHex) => { const rgb = hexToRgb(bgHex); if (!rgb) return '#000000'; return getLuminance(rgb.r, rgb.g, rgb.b) > 0.179 ? '#000000' : '#ffffff'; };

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
    for (let i = 0; i < imageData.data.length; i += 4) {
      if (imageData.data[i + 3] > 128) pixels.push([imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]]);
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
      const extracted = extractColors(ctx.getImageData(0, 0, canvas.width, canvas.height), count);
      setColors(extracted);
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
  const effectiveTextMuted = appBgColor ? `${getTextColor(appBgColor)}99` : currentTheme.textMuted;

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
            <div onClick={() => fileInputRef.current?.click()} style={{ border: `2px dashed ${appBgColor ? `${effectiveText}40` : currentTheme.border}`, borderRadius: '16px', padding: '60px', textAlign: 'center', cursor: 'pointer', background: appBgColor ? `${effectiveText}05` : currentTheme.surface, marginBottom: '48px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>↑</div>
              <p style={{ fontSize: '16px', color: effectiveText, marginBottom: '8px', fontWeight: '500' }}>Upload an image to extract colors</p>
              <p style={{ fontSize: '12px', color: effectiveTextMuted, fontFamily: 'monospace' }}>PNG • JPG • WEBP</p>
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
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '48px' }}>
            <div>
              {image ? (
                <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '24px', position: 'relative', border: `1px solid ${appBgColor ? `${effectiveText}20` : currentTheme.border}` }}>
                  <div style={{ position: 'relative' }}>
                    <img src={image} alt="Uploaded" style={{ width: '100%', display: 'block' }} />
                    {textOverlay.enabled && (
                      <div style={{ position: 'absolute', top: textOverlay.position === 'top' ? '20px' : textOverlay.position === 'center' ? '50%' : 'auto', bottom: textOverlay.position === 'bottom' ? '20px' : 'auto', left: '50%', transform: textOverlay.position === 'center' ? 'translate(-50%, -50%)' : 'translateX(-50%)', textAlign: 'center', width: '90%' }}>
                        {textOverlay.bgEnabled && <div style={{ position: 'absolute', top: `-${textOverlay.bgPadding}px`, left: `-${textOverlay.bgPadding}px`, right: `-${textOverlay.bgPadding}px`, bottom: `-${textOverlay.bgPadding}px`, background: textOverlay.bgColor, opacity: textOverlay.bgOpacity / 100, borderRadius: '8px' }} />}
                        <span style={{ position: 'relative', color: textOverlay.color, fontSize: `${textOverlay.fontSize}px`, fontWeight: textOverlay.type === 'header' ? '700' : '400', fontFamily: fonts.find(f => f.name === selectedFont)?.stack, lineHeight: 1.2, textShadow: !textOverlay.bgEnabled ? '0 2px 4px rgba(0,0,0,0.5)' : 'none' }}>{textOverlay.text}</span>
                      </div>
                    )}
                  </div>
                  <button onClick={() => { setImage(null); setColors([]); setSelectedColor(null); setHarmonies({}); setAppBgColor(null); }} style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.8)', border: `1px solid ${currentTheme.border}`, borderRadius: '6px', padding: '6px 12px', color: currentTheme.accent, cursor: 'pointer', fontSize: '11px', fontFamily: 'monospace' }}>REPLACE</button>
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

              {image && (
                <div style={{ padding: '16px', background: appBgColor ? `${effectiveText}05` : currentTheme.surface, borderRadius: '12px', border: `1px solid ${appBgColor ? `${effectiveText}20` : currentTheme.border}`, marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: effectiveTextMuted, fontFamily: 'monospace' }}>Text Overlay</span>
                    <button onClick={() => setTextOverlay({ ...textOverlay, enabled: !textOverlay.enabled })} style={{ background: textOverlay.enabled ? (appBgColor ? effectiveText : currentTheme.accent) : 'transparent', border: `1px solid ${appBgColor ? `${effectiveText}40` : currentTheme.border}`, borderRadius: '4px', padding: '4px 8px', color: textOverlay.enabled ? (appBgColor ? appBgColor : getTextColor(currentTheme.accent)) : effectiveTextMuted, cursor: 'pointer', fontSize: '10px', fontFamily: 'monospace' }}>{textOverlay.enabled ? 'ON' : 'OFF'}</button>
                  </div>
                  {textOverlay.enabled && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <input type="text" value={textOverlay.text} onChange={(e) => setTextOverlay({ ...textOverlay, text: e.target.value })} placeholder="Enter text..." style={{ background: appBgColor ? `${effectiveText}10` : currentTheme.bg, border: `1px solid ${appBgColor ? `${effectiveText}20` : currentTheme.border}`, borderRadius: '6px', padding: '8px 12px', color: effectiveText, fontSize: '12px' }} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div>
                          <label style={{ fontSize: '9px', color: effectiveTextMuted, display: 'block', marginBottom: '4px' }}>Type</label>
                          <select value={textOverlay.type} onChange={(e) => setTextOverlay({ ...textOverlay, type: e.target.value, fontSize: e.target.value === 'header' ? 48 : 16 })} style={{ width: '100%', background: appBgColor ? `${effectiveText}10` : currentTheme.surface, border: `1px solid ${appBgColor ? `${effectiveText}20` : currentTheme.border}`, borderRadius: '4px', padding: '6px', color: effectiveText, fontSize: '11px' }}>
                            <option value="header">Header</option>
                            <option value="body">Body</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '9px', color: effectiveTextMuted, display: 'block', marginBottom: '4px' }}>Position</label>
                          <select value={textOverlay.position} onChange={(e) => setTextOverlay({ ...textOverlay, position: e.target.value })} style={{ width: '100%', background: appBgColor ? `${effectiveText}10` : currentTheme.surface, border: `1px solid ${appBgColor ? `${effectiveText}20` : currentTheme.border}`, borderRadius: '4px', padding: '6px', color: effectiveText, fontSize: '11px' }}>
                            <option value="top">Top</option>
                            <option value="center">Center</option>
                            <option value="bottom">Bottom</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '9px', color: effectiveTextMuted, display: 'block', marginBottom: '4px' }}>Text Color</label>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {['#ffffff', '#000000', ...currentColors].map((color, i) => <button key={i} onClick={() => setTextOverlay({ ...textOverlay, color })} style={{ width: '24px', height: '24px', borderRadius: '4px', border: `2px solid ${textOverlay.color === color ? currentTheme.accent : 'transparent'}`, background: color, cursor: 'pointer', padding: 0 }} />)}
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '9px', color: effectiveTextMuted, display: 'block', marginBottom: '4px' }}>Size: {textOverlay.fontSize}px</label>
                        <input type="range" min="12" max="72" value={textOverlay.fontSize} onChange={(e) => setTextOverlay({ ...textOverlay, fontSize: parseInt(e.target.value) })} style={{ width: '100%', accentColor: currentTheme.accent }} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '8px', borderTop: `1px solid ${appBgColor ? `${effectiveText}10` : currentTheme.border}` }}>
                        <button onClick={() => setTextOverlay({ ...textOverlay, bgEnabled: !textOverlay.bgEnabled })} style={{ background: textOverlay.bgEnabled ? (appBgColor ? effectiveText : currentTheme.accent) : 'transparent', border: `1px solid ${appBgColor ? `${effectiveText}40` : currentTheme.border}`, borderRadius: '4px', padding: '4px 8px', color: textOverlay.bgEnabled ? (appBgColor ? appBgColor : getTextColor(currentTheme.accent)) : effectiveTextMuted, cursor: 'pointer', fontSize: '10px', fontFamily: 'monospace' }}>BG BOX</button>
                        {textOverlay.bgEnabled && (
                          <>
                            <div style={{ display: 'flex', gap: '2px' }}>
                              {['#000000', '#ffffff', ...currentColors.slice(0, 3)].map((color, i) => <button key={i} onClick={() => setTextOverlay({ ...textOverlay, bgColor: color })} style={{ width: '20px', height: '20px', borderRadius: '3px', border: `1px solid ${textOverlay.bgColor === color ? currentTheme.accent : 'transparent'}`, background: color, cursor: 'pointer', padding: 0 }} />)}
                            </div>
                            <input type="range" min="20" max="100" value={textOverlay.bgOpacity} onChange={(e) => setTextOverlay({ ...textOverlay, bgOpacity: parseInt(e.target.value) })} style={{ width: '60px', accentColor: currentTheme.accent }} title={`Opacity: ${textOverlay.bgOpacity}%`} />
                          </>
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
                {['palette', 'contrast', 'typography', 'export'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: activeTab === tab ? `${appBgColor ? effectiveText : currentTheme.accent}15` : 'transparent', border: activeTab === tab ? `1px solid ${appBgColor ? `${effectiveText}30` : currentTheme.border}` : '1px solid transparent', padding: '8px 16px', borderRadius: '6px', color: activeTab === tab ? (appBgColor ? effectiveText : currentTheme.accent) : effectiveTextMuted, cursor: 'pointer', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'monospace' }}>{tab}</button>
                ))}
              </div>

              {activeTab === 'palette' && selectedColor && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '24px', marginBottom: '40px', padding: '24px', background: appBgColor ? `${effectiveText}05` : currentTheme.surface, borderRadius: '12px', border: `1px solid ${appBgColor ? `${effectiveText}20` : currentTheme.border}` }}>
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
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700&family=JetBrains+Mono:wght@400;500&family=Outfit:wght@400;500;600;700&family=Crimson+Pro:wght@400;600;700&display=swap" rel="stylesheet" />
      <style>{`* { box-sizing: border-box; } body { margin: 0; } ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: ${appBgColor ? `${effectiveText}05` : currentTheme.surface}; } ::-webkit-scrollbar-thumb { background: ${appBgColor ? `${effectiveText}20` : currentTheme.border}; border-radius: 3px; }`}</style>
    </div>
  );
}
