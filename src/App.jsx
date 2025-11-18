import React, { useState, useRef, useCallback } from 'react';

export default function App() {
  const [image, setImage] = useState(null);
  const [colors, setColors] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [harmonies, setHarmonies] = useState({});
  const [activeTab, setActiveTab] = useState('palette');
  const [copyNotification, setCopyNotification] = useState('');
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

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

  // Calculate relative luminance for WCAG contrast
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
    if (ratio >= 7) return { rating: 'AAA', color: '#10b981' };
    if (ratio >= 4.5) return { rating: 'AA', color: '#f59e0b' };
    if (ratio >= 3) return { rating: 'AA Large', color: '#f97316' };
    return { rating: 'Fail', color: '#ef4444' };
  };

  // Generate color harmonies
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

  // Extract dominant colors using k-means clustering
  const extractColors = useCallback((imageData, k = 6) => {
    const pixels = [];
    for (let i = 0; i < imageData.data.length; i += 4) {
      if (imageData.data[i + 3] > 128) {
        pixels.push([imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]]);
      }
    }

    // Simple k-means clustering
    let centroids = pixels.slice(0, k);
    for (let iter = 0; iter < 10; iter++) {
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setImage(event.target.result);
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const scale = Math.min(300 / img.width, 300 / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const extractedColors = extractColors(imageData);
        setColors(extractedColors);
        
        if (extractedColors.length > 0) {
          setSelectedColor(extractedColors[0]);
          setHarmonies(generateHarmonies(extractedColors[0]));
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
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
        return `colors: {\n${colors.map((c, i) => `  'custom-${i + 1}': '${c}',`).join('\n')}\n}`;
      case 'scss':
        return colors.map((c, i) => `$color-${i + 1}: ${c};`).join('\n');
      case 'json':
        return JSON.stringify(colors.reduce((acc, c, i) => ({ ...acc, [`color-${i + 1}`]: c }), {}), null, 2);
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
      backgroundColor: '#0a0a0a', 
      color: '#fafafa',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid #262626',
        padding: '24px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ 
          fontSize: '20px', 
          fontWeight: '500', 
          letterSpacing: '-0.02em',
          margin: 0
        }}>
          Chromatic
        </h1>
        <span style={{ fontSize: '12px', color: '#737373' }}>Color Intelligence</span>
      </header>

      {/* Copy notification */}
      {copyNotification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#262626',
          padding: '12px 20px',
          borderRadius: '8px',
          fontSize: '13px',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease'
        }}>
          {copyNotification}
        </div>
      )}

      <main style={{ padding: '48px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Upload Section */}
        {!image ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed #262626',
              borderRadius: '16px',
              padding: '80px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#404040'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#262626'}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>↑</div>
            <p style={{ fontSize: '16px', color: '#a3a3a3', marginBottom: '8px' }}>
              Drop an image or click to upload
            </p>
            <p style={{ fontSize: '12px', color: '#525252' }}>
              PNG, JPG, WebP up to 10MB
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '48px' }}>
            {/* Left Column - Image & Palette */}
            <div>
              <div style={{ 
                borderRadius: '12px', 
                overflow: 'hidden', 
                marginBottom: '24px',
                position: 'relative'
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
                    background: 'rgba(0,0,0,0.7)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Replace
                </button>
              </div>

              {/* Extracted Palette */}
              <div>
                <h3 style={{ 
                  fontSize: '11px', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.1em',
                  color: '#737373',
                  marginBottom: '12px'
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
                        border: selectedColor === color ? '2px solid #fff' : '2px solid transparent',
                        transition: 'all 0.2s ease',
                        position: 'relative'
                      }}
                    >
                      <span style={{
                        position: 'absolute',
                        bottom: '4px',
                        left: '4px',
                        fontSize: '9px',
                        fontFamily: 'monospace',
                        color: getTextColor(color),
                        opacity: 0.8
                      }}>
                        {color.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Analysis */}
            <div>
              {/* Tabs */}
              <div style={{ 
                display: 'flex', 
                gap: '4px', 
                marginBottom: '32px',
                borderBottom: '1px solid #262626',
                paddingBottom: '16px'
              }}>
                {['palette', 'contrast', 'typography', 'export'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      background: activeTab === tab ? '#262626' : 'transparent',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      color: activeTab === tab ? '#fff' : '#737373',
                      cursor: 'pointer',
                      fontSize: '13px',
                      textTransform: 'capitalize',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'palette' && selectedColor && (
                <div>
                  {/* Color Details */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '120px 1fr', 
                    gap: '24px',
                    marginBottom: '40px'
                  }}>
                    <div 
                      style={{ 
                        aspectRatio: '1',
                        backgroundColor: selectedColor, 
                        borderRadius: '12px',
                        cursor: 'pointer'
                      }}
                      onClick={() => copyToClipboard(selectedColor, selectedColor)}
                    />
                    <div>
                      <div style={{ marginBottom: '16px' }}>
                        <span style={{ fontSize: '11px', color: '#737373', display: 'block', marginBottom: '4px' }}>HEX</span>
                        <span 
                          style={{ fontFamily: 'monospace', cursor: 'pointer' }}
                          onClick={() => copyToClipboard(selectedColor, 'HEX')}
                        >
                          {selectedColor.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <span style={{ fontSize: '11px', color: '#737373', display: 'block', marginBottom: '4px' }}>RGB</span>
                        <span 
                          style={{ fontFamily: 'monospace', cursor: 'pointer' }}
                          onClick={() => {
                            const rgb = hexToRgb(selectedColor);
                            copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, 'RGB');
                          }}
                        >
                          {(() => {
                            const rgb = hexToRgb(selectedColor);
                            return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
                          })()}
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: '#737373', display: 'block', marginBottom: '4px' }}>HSL</span>
                        <span 
                          style={{ fontFamily: 'monospace', cursor: 'pointer' }}
                          onClick={() => {
                            const rgb = hexToRgb(selectedColor);
                            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                            copyToClipboard(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, 'HSL');
                          }}
                        >
                          {(() => {
                            const rgb = hexToRgb(selectedColor);
                            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                            return `${hsl.h}°, ${hsl.s}%, ${hsl.l}%`;
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Harmonies */}
                  <div>
                    <h3 style={{ 
                      fontSize: '11px', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.1em',
                      color: '#737373',
                      marginBottom: '20px'
                    }}>
                      Color Harmonies
                    </h3>
                    
                    {Object.entries(harmonies).map(([name, palette]) => (
                      <div key={name} style={{ marginBottom: '20px' }}>
                        <span style={{ 
                          fontSize: '12px', 
                          color: '#a3a3a3', 
                          textTransform: 'capitalize',
                          display: 'block',
                          marginBottom: '8px'
                        }}>
                          {name.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {palette.map((color, i) => (
                            <div
                              key={i}
                              onClick={() => copyToClipboard(color, color)}
                              style={{
                                flex: 1,
                                height: '40px',
                                backgroundColor: color,
                                borderRadius: i === 0 ? '6px 0 0 6px' : i === palette.length - 1 ? '0 6px 6px 0' : '0',
                                cursor: 'pointer',
                                transition: 'transform 0.1s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'scaleY(1.1)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'scaleY(1)'}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'contrast' && colors.length > 0 && (
                <div>
                  <h3 style={{ 
                    fontSize: '11px', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em',
                    color: '#737373',
                    marginBottom: '20px'
                  }}>
                    WCAG Contrast Analysis
                  </h3>
                  
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {colors.map((color1, i) => 
                      colors.slice(i + 1).map((color2, j) => {
                        const ratio = getContrastRatio(color1, color2);
                        const { rating, color: ratingColor } = getWcagRating(ratio);
                        
                        return (
                          <div 
                            key={`${i}-${j}`}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '60px 60px 1fr auto',
                              alignItems: 'center',
                              gap: '16px',
                              padding: '12px',
                              background: '#171717',
                              borderRadius: '8px'
                            }}
                          >
                            <div style={{ 
                              width: '48px', 
                              height: '48px', 
                              backgroundColor: color1, 
                              borderRadius: '6px' 
                            }} />
                            <div style={{ 
                              width: '48px', 
                              height: '48px', 
                              backgroundColor: color2, 
                              borderRadius: '6px' 
                            }} />
                            <div>
                              <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                                {ratio}:1
                              </div>
                              <div style={{ 
                                fontSize: '11px', 
                                color: '#737373',
                                fontFamily: 'monospace' 
                              }}>
                                {color1} / {color2}
                              </div>
                            </div>
                            <span style={{ 
                              fontSize: '11px', 
                              fontWeight: '600',
                              color: ratingColor,
                              padding: '4px 8px',
                              background: `${ratingColor}20`,
                              borderRadius: '4px'
                            }}>
                              {rating}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'typography' && selectedColor && (
                <div>
                  <h3 style={{ 
                    fontSize: '11px', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em',
                    color: '#737373',
                    marginBottom: '20px'
                  }}>
                    Typography Preview
                  </h3>
                  
                  {/* Light Background */}
                  <div style={{
                    background: '#fafafa',
                    padding: '32px',
                    borderRadius: '12px',
                    marginBottom: '16px'
                  }}>
                    <h1 style={{ 
                      color: selectedColor, 
                      fontSize: '32px', 
                      fontWeight: '700',
                      marginBottom: '12px',
                      lineHeight: 1.2
                    }}>
                      Display Heading
                    </h1>
                    <h2 style={{ 
                      color: selectedColor, 
                      fontSize: '20px', 
                      fontWeight: '600',
                      marginBottom: '12px',
                      opacity: 0.9
                    }}>
                      Section Heading
                    </h2>
                    <p style={{ 
                      color: '#171717', 
                      fontSize: '14px', 
                      lineHeight: 1.6,
                      marginBottom: '12px'
                    }}>
                      Body text demonstrates readability. The quick brown fox jumps over the lazy dog. 
                      This sample helps visualize how your palette works in context.
                    </p>
                    <a href="#" style={{ color: selectedColor, fontSize: '13px' }}>
                      Link Text →
                    </a>
                  </div>

                  {/* Dark Background */}
                  <div style={{
                    background: selectedColor,
                    padding: '32px',
                    borderRadius: '12px'
                  }}>
                    <h1 style={{ 
                      color: '#fff', 
                      fontSize: '32px', 
                      fontWeight: '700',
                      marginBottom: '12px',
                      lineHeight: 1.2
                    }}>
                      Display Heading
                    </h1>
                    <h2 style={{ 
                      color: '#fff', 
                      fontSize: '20px', 
                      fontWeight: '600',
                      marginBottom: '12px',
                      opacity: 0.9
                    }}>
                      Section Heading
                    </h2>
                    <p style={{ 
                      color: 'rgba(255,255,255,0.9)', 
                      fontSize: '14px', 
                      lineHeight: 1.6
                    }}>
                      Body text on colored background. The quick brown fox jumps over the lazy dog. 
                      This preview helps assess text legibility on your chosen color.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'export' && colors.length > 0 && (
                <div>
                  <h3 style={{ 
                    fontSize: '11px', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em',
                    color: '#737373',
                    marginBottom: '20px'
                  }}>
                    Export Formats
                  </h3>
                  
                  {['css', 'scss', 'tailwind', 'json'].map(format => (
                    <div key={format} style={{ marginBottom: '20px' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <span style={{ 
                          fontSize: '12px', 
                          color: '#a3a3a3', 
                          textTransform: 'uppercase'
                        }}>
                          {format}
                        </span>
                        <button
                          onClick={() => copyToClipboard(generateExport(format), format.toUpperCase())}
                          style={{
                            background: '#262626',
                            border: 'none',
                            padding: '4px 12px',
                            borderRadius: '4px',
                            color: '#a3a3a3',
                            cursor: 'pointer',
                            fontSize: '11px'
                          }}
                        >
                          Copy
                        </button>
                      </div>
                      <pre style={{
                        background: '#171717',
                        padding: '16px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        overflow: 'auto',
                        margin: 0,
                        color: '#a3a3a3'
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
      `}</style>
    </div>
  );
}
