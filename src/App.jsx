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
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

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
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
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
    const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return ((lighter + 0.05) / (darker + 0.05)).toFixed(2);
  };

  const getWcagRating = (ratio) => {
    if (ratio >= 7) return { rating: 'AAA', color: '#00ff88', label: 'Excellent' };
    if (ratio >= 4.5) return { rating: 'AA', color: '#ffaa00', label: 'Good' };
    if (ratio >= 3) return { rating: 'AA Large', color: '#ff6600', label: 'Large text only' };
    return { rating: 'Fail', color: '#ff0066', label: 'Poor contrast' };
  };

  const generateHarmonies = (hex) => {
    const rgb = hexToRgb(hex);
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
    if (colors.length === 0) return '';
    
    switch (format) {
      case 'css':
        return `:root {\n${colors.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n')}\n}`;
      case 'tailwind':
        return `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n${colors.map((c, i) => `        'brand-${i + 1}': '${c}',`).join('\n')}\n      }\n    }\n  }\n}`;
      case 'scss':
        return colors.map((c, i) => `$color-${i + 1}: ${c};`).join('\n');
      case 'json':
        return JSON.stringify(colors.reduce((acc, c, i) => ({ ...acc, [`color-${i + 1}`]: c }), {}), null, 2);
      case 'figma':
        return colors.map((c, i) => {
          const rgb = hexToRgb(c);
          return `Color ${i + 1}: ${c}\nRGB: ${rgb.r}, ${rgb.g}, ${rgb.b}`;
        }).join('\n\n');
      default:
        return colors.join(', ');
    }
  };

  const getTextColor = (bgHex) => {
    const rgb = hexToRgb(bgHex);
    const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
    return luminance > 0.179 ? '#000000' : '#ffffff';
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0a0a0f', 
      color: '#fafafa',
      fontFamily: '"Space Grotesk", -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {/* Y2K Grid Background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          linear-gradient(rgba(0, 255, 136, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 255, 136, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Header */}
      <header style={{
        borderBottom: '1px solid rgba(0, 255, 136, 0.2)',
        padding: '20px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
        backdropFilter: 'blur(10px)',
        background: 'rgba(10, 10, 15, 0.8)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #00ff88, #00aaff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '16px' }}>◈</span>
          </div>
          <h1 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            letterSpacing: '-0.02em',
            margin: 0,
            background: 'linear-gradient(135deg, #00ff88, #00aaff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            CHROMATIC
          </h1>
        </div>
        <span style={{ 
          fontSize: '11px', 
          color: '#00ff88',
          fontFamily: 'monospace',
          letterSpacing: '0.15em'
        }}>
          COLOR.INTELLIGENCE.v2
        </span>
      </header>

      {/* Copy notification */}
      {copyNotification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'rgba(0, 255, 136, 0.1)',
          border: '1px solid #00ff88',
          padding: '12px 20px',
          borderRadius: '8px',
          fontSize: '13px',
          zIndex: 1000,
          color: '#00ff88',
          fontFamily: 'monospace'
        }}>
          {copyNotification}
        </div>
      )}

      <main style={{ padding: '48px', maxWidth: '1600px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Upload Section */}
        {!image ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed rgba(0, 255, 136, 0.3)',
              borderRadius: '16px',
              padding: '100px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: 'rgba(0, 255, 136, 0.02)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#00ff88';
              e.currentTarget.style.background = 'rgba(0, 255, 136, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 255, 136, 0.3)';
              e.currentTarget.style.background = 'rgba(0, 255, 136, 0.02)';
            }}
          >
            <div style={{ 
              fontSize: '64px', 
              marginBottom: '24px',
              filter: 'drop-shadow(0 0 20px rgba(0, 255, 136, 0.5))'
            }}>
              ↑
            </div>
            <p style={{ 
              fontSize: '18px', 
              color: '#fafafa', 
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              Drop an image or click to upload
            </p>
            <p style={{ fontSize: '12px', color: '#666', fontFamily: 'monospace' }}>
              PNG • JPG • WEBP • UP TO 10MB
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '48px' }}>
            {/* Left Column */}
            <div>
              {/* Image Preview */}
              <div style={{ 
                borderRadius: '12px', 
                overflow: 'hidden', 
                marginBottom: '24px',
                position: 'relative',
                border: '1px solid rgba(0, 255, 136, 0.2)'
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
                    border: '1px solid rgba(0, 255, 136, 0.3)',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    color: '#00ff88',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}
                >
                  REPLACE
                </button>
              </div>

              {/* Color Count Control */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  fontSize: '10px', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.15em',
                  color: '#666',
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
                    accentColor: '#00ff88'
                  }}
                />
              </div>

              {/* Extracted Palette */}
              <div>
                <h3 style={{ 
                  fontSize: '10px', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.15em',
                  color: '#666',
                  marginBottom: '12px',
                  fontFamily: 'monospace'
                }}>
                  Extracted Palette
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {colors.map((color, i) => (
                    <div
                      key={i}
                      onClick={() => handleColorSelect(color)}
                      style={{
                        aspectRatio: '1',
                        backgroundColor: color,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        border: selectedColor === color 
                          ? '2px solid #00ff88' 
                          : '2px solid transparent',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        boxShadow: selectedColor === color 
                          ? '0 0 20px rgba(0, 255, 136, 0.3)' 
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
                borderBottom: '1px solid rgba(0, 255, 136, 0.2)',
                paddingBottom: '16px'
              }}>
                {['palette', 'contrast', 'typography', 'export'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      background: activeTab === tab 
                        ? 'rgba(0, 255, 136, 0.1)' 
                        : 'transparent',
                      border: activeTab === tab 
                        ? '1px solid rgba(0, 255, 136, 0.3)' 
                        : '1px solid transparent',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      color: activeTab === tab ? '#00ff88' : '#666',
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
                    background: 'rgba(0, 255, 136, 0.02)',
                    borderRadius: '12px',
                    border: '1px solid rgba(0, 255, 136, 0.1)'
                  }}>
                    <div 
                      style={{ 
                        aspectRatio: '1',
                        backgroundColor: selectedColor, 
                        borderRadius: '12px',
                        cursor: 'pointer',
                        boxShadow: `0 0 40px ${selectedColor}40`
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
                            return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
                          })(),
                          copy: (() => {
                            const rgb = hexToRgb(selectedColor);
                            return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
                          })()
                        },
                        { 
                          label: 'HSL', 
                          value: (() => {
                            const rgb = hexToRgb(selectedColor);
                            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                            return `${hsl.h}°, ${hsl.s}%, ${hsl.l}%`;
                          })(),
                          copy: (() => {
                            const rgb = hexToRgb(selectedColor);
                            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                            return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
                          })()
                        }
                      ].map(({ label, value, copy }) => (
                        <div key={label} style={{ marginBottom: '12px' }}>
                          <span style={{ 
                            fontSize: '10px', 
                            color: '#666', 
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
                            onMouseEnter={(e) => e.target.style.color = '#00ff88'}
                            onMouseLeave={(e) => e.target.style.color = '#fafafa'}
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
                      color: '#666',
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
                          background: 'rgba(0, 255, 136, 0.02)',
                          borderRadius: '12px',
                          border: '1px solid rgba(0, 255, 136, 0.1)'
                        }}>
                          <div style={{ marginBottom: '12px' }}>
                            <span style={{ 
                              fontSize: '13px', 
                              color: '#fafafa', 
                              fontWeight: '500',
                              display: 'block',
                              marginBottom: '4px'
                            }}>
                              {info.name}
                            </span>
                            <span style={{ 
                              fontSize: '11px', 
                              color: '#888',
                              display: 'block',
                              marginBottom: '4px',
                              lineHeight: '1.4'
                            }}>
                              {info.desc}
                            </span>
                            <span style={{ 
                              fontSize: '10px', 
                              color: '#00ff88',
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
                                  borderRadius: i === 0 ? '6px 0 0 6px' : i === palette.length - 1 ? '0 6px 6px 0' : '0',
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
              {activeTab === 'contrast' && colors.length > 0 && (
                <div>
                  <h3 style={{ 
                    fontSize: '10px', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.15em',
                    color: '#666',
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
                    {colors.map((color1, i) => 
                      colors.slice(i + 1).map((color2, j) => {
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
                              background: 'rgba(0, 255, 136, 0.02)',
                              borderRadius: '8px',
                              border: '1px solid rgba(0, 255, 136, 0.1)'
                            }}
                          >
                            <div style={{ 
                              width: '40px', 
                              height: '40px', 
                              backgroundColor: color1, 
                              borderRadius: '6px' 
                            }} />
                            <div style={{ 
                              width: '40px', 
                              height: '40px', 
                              backgroundColor: color2, 
                              borderRadius: '6px' 
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
                                color: '#666',
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
                                borderRadius: '4px',
                                display: 'block',
                                marginBottom: '2px',
                                fontFamily: 'monospace'
                              }}>
                                {rating}
                              </span>
                              <span style={{
                                fontSize: '9px',
                                color: '#666'
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
                  <div style={{ 
                    display: 'flex', 
                    gap: '24px', 
                    marginBottom: '24px',
                    flexWrap: 'wrap'
                  }}>
                    {/* Font Selector */}
                    <div>
                      <label style={{ 
                        fontSize: '10px', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.15em',
                        color: '#666',
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
                          background: 'rgba(0, 255, 136, 0.05)',
                          border: '1px solid rgba(0, 255, 136, 0.2)',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          color: '#fafafa',
                          fontSize: '12px',
                          cursor: 'pointer',
                          minWidth: '160px'
                        }}
                      >
                        {fonts.map(font => (
                          <option key={font.name} value={font.name} style={{ background: '#0a0a0f' }}>
                            {font.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Background Toggle */}
                    <div>
                      <label style={{ 
                        fontSize: '10px', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.15em',
                        color: '#666',
                        display: 'block',
                        marginBottom: '8px',
                        fontFamily: 'monospace'
                      }}>
                        Background
                      </label>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {['light', 'dark', 'color'].map(bg => (
                          <button
                            key={bg}
                            onClick={() => setPreviewBg(bg)}
                            style={{
                              background: previewBg === bg 
                                ? 'rgba(0, 255, 136, 0.1)' 
                                : 'transparent',
                              border: previewBg === bg 
                                ? '1px solid rgba(0, 255, 136, 0.3)' 
                                : '1px solid rgba(255, 255, 255, 0.1)',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              color: previewBg === bg ? '#00ff88' : '#666',
                              cursor: 'pointer',
                              fontSize: '11px',
                              textTransform: 'capitalize',
                              fontFamily: 'monospace'
                            }}
                          >
                            {bg}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Size Controls */}
                    <div>
                      <label style={{ 
                        fontSize: '10px', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.15em',
                        color: '#666',
                        display: 'block',
                        marginBottom: '8px',
                        fontFamily: 'monospace'
                      }}>
                        H1 Size: {fontSize.h1}px
                      </label>
                      <input
                        type="range"
                        min="24"
                        max="72"
                        value={fontSize.h1}
                        onChange={(e) => setFontSize({ ...fontSize, h1: parseInt(e.target.value) })}
                        style={{ width: '120px', accentColor: '#00ff88' }}
                      />
                    </div>
                  </div>

                  {/* Preview */}
                  <div style={{
                    background: previewBg === 'light' ? '#fafafa' 
                      : previewBg === 'dark' ? '#0a0a0f' 
                      : selectedColor,
                    padding: '48px',
                    borderRadius: '12px',
                    border: '1px solid rgba(0, 255, 136, 0.2)'
                  }}>
                    <h1 style={{ 
                      color: previewBg === 'color' ? getTextColor(selectedColor) : selectedColor, 
                      fontSize: `${fontSize.h1}px`, 
                      fontWeight: '700',
                      marginBottom: '16px',
                      lineHeight: 1.1,
                      fontFamily: fonts.find(f => f.name === selectedFont)?.stack
                    }}>
                      Display Heading
                    </h1>
                    <h2 style={{ 
                      color: previewBg === 'color' ? getTextColor(selectedColor) 
                        : previewBg === 'light' ? selectedColor : '#fafafa', 
                      fontSize: `${fontSize.h2}px`, 
                      fontWeight: '600',
                      marginBottom: '16px',
                      opacity: 0.9,
                      fontFamily: fonts.find(f => f.name === selectedFont)?.stack
                    }}>
                      Section Heading
                    </h2>
                    <p style={{ 
                      color: previewBg === 'color' 
                        ? `${getTextColor(selectedColor)}dd`
                        : previewBg === 'light' ? '#171717' : '#e5e5e5', 
                      fontSize: `${fontSize.body}px`, 
                      lineHeight: 1.7,
                      marginBottom: '16px',
                      fontFamily: fonts.find(f => f.name === selectedFont)?.stack
                    }}>
                      Body text demonstrates readability across different backgrounds. 
                      The quick brown fox jumps over the lazy dog. This sample helps 
                      visualize how your palette works with real typography in context.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <button style={{
                        background: previewBg === 'color' ? getTextColor(selectedColor) : selectedColor,
                        color: previewBg === 'color' ? selectedColor : getTextColor(selectedColor),
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontFamily: fonts.find(f => f.name === selectedFont)?.stack
                      }}>
                        Primary Button
                      </button>
                      <a href="#" style={{ 
                        color: previewBg === 'color' ? getTextColor(selectedColor) : selectedColor, 
                        fontSize: '14px',
                        fontFamily: fonts.find(f => f.name === selectedFont)?.stack
                      }}>
                        Link Text →
                      </a>
                    </div>
                  </div>

                  {/* Contrast info for current preview */}
                  <div style={{
                    marginTop: '16px',
                    padding: '12px 16px',
                    background: 'rgba(0, 255, 136, 0.02)',
                    borderRadius: '8px',
                    border: '1px solid rgba(0, 255, 136, 0.1)',
                    fontSize: '11px',
                    color: '#888',
                    fontFamily: 'monospace'
                  }}>
                    {(() => {
                      const bgColor = previewBg === 'light' ? '#fafafa' 
                        : previewBg === 'dark' ? '#0a0a0f' 
                        : selectedColor;
                      const textColor = previewBg === 'color' ? getTextColor(selectedColor) : selectedColor;
                      const ratio = getContrastRatio(bgColor, textColor);
                      const { rating } = getWcagRating(ratio);
                      return `Heading contrast: ${ratio}:1 (${rating})`;
                    })()}
                  </div>
                </div>
              )}

              {/* Export Tab */}
              {activeTab === 'export' && colors.length > 0 && (
                <div>
                  <h3 style={{ 
                    fontSize: '10px', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.15em',
                    color: '#666',
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
                          color: '#888', 
                          textTransform: 'uppercase',
                          fontFamily: 'monospace',
                          letterSpacing: '0.1em'
                        }}>
                          {format}
                        </span>
                        <button
                          onClick={() => copyToClipboard(generateExport(format), format.toUpperCase())}
                          style={{
                            background: 'rgba(0, 255, 136, 0.1)',
                            border: '1px solid rgba(0, 255, 136, 0.2)',
                            padding: '4px 12px',
                            borderRadius: '4px',
                            color: '#00ff88',
                            cursor: 'pointer',
                            fontSize: '10px',
                            fontFamily: 'monospace'
                          }}
                        >
                          COPY
                        </button>
                      </div>
                      <pre style={{
                        background: 'rgba(0, 255, 136, 0.02)',
                        border: '1px solid rgba(0, 255, 136, 0.1)',
                        padding: '16px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontFamily: '"JetBrains Mono", monospace',
                        overflow: 'auto',
                        margin: 0,
                        color: '#888'
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
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
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
          background: rgba(0, 255, 136, 0.05);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 136, 0.2);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 136, 0.3);
        }
      `}</style>
    </div>
  );
}
