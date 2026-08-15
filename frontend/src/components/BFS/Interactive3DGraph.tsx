import React, { useRef, useMemo } from 'react';
import { motion, AnimatePresence, useAnimationFrame } from 'framer-motion';

export interface Interactive3DGraphProps {
  activeStep?: number;
}

const customEaseOut = [0.23, 1, 0.32, 1] as const;

export default function Interactive3DGraph({ activeStep = 2 }: Interactive3DGraphProps) {
  const velocityX = useRef(0);
  const velocityY = useRef(-0.0003);
  const angleXRef = useRef(0);
  const angleYRef = useRef(0);
  const isDragging = useRef(false);
  const lastInteractTime = useRef(Date.now());
  const htmlNodesRef = useRef<any[]>([]);
  const htmlLinksRef = useRef<any[]>([]);

  // Generate massive clustered graph deterministically
  const { nodes: processingNodes, paths: processingPaths, links: processingLinks } = useMemo(() => {
    let seed = 12345;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const factor = isMobile ? 0.4 : 1;

    const clusters = [
      { id: 'spending', label: 'SPENDING', cx: 350, cy: 180, cz: 250, color: '#fbbf24', count: Math.floor(15 * factor), isCore: true }, 
      { id: 'income', label: 'INCOME', cx: 450, cy: 350, cz: 0, color: '#34d399', count: Math.floor(18 * factor), isCore: true },   
      { id: 'risk', label: 'RISK', cx: 600, cy: 380, cz: -200, color: '#e879f9', count: Math.floor(14 * factor), isCore: true },       
      { id: 'history', label: 'HISTORY', cx: 680, cy: 220, cz: 100, color: '#2dd4bf', count: Math.floor(16 * factor), isCore: true }, 
      { id: 'social', label: 'SOCIAL', cx: 550, cy: 120, cz: -150, color: '#3b82f6', count: Math.floor(12 * factor), isCore: false },   
      { id: 'device', label: 'DEVICE', cx: 750, cy: 300, cz: 300, color: '#f87171', count: Math.floor(10 * factor), isCore: false },   
      { id: 'location', label: 'LOCATION', cx: 300, cy: 350, cz: -50, color: '#a78bfa', count: Math.floor(14 * factor), isCore: false }, 
      { id: 'fraud', label: 'FRAUD ML', cx: 500, cy: 500, cz: 150, color: '#f43f5e', count: Math.floor(12 * factor), isCore: false },    
      { id: 'anomaly', label: 'ANOMALY', cx: 400, cy: 550, cz: -250, color: '#c084fc', count: Math.floor(10 * factor), isCore: false },   
    ];

    const nodes: any[] = [];
    const paths: any[] = [];
    const links: any[] = [];
    const hubs: any[] = [];
    const flashPalette = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

    clusters.forEach((cluster) => {
      const hub = { 
        x: cluster.cx, y: cluster.cy, z: cluster.cz, r: 8, 
        color: cluster.color, 
        flashColor: flashPalette[Math.floor(rand() * flashPalette.length)],
        label: cluster.label, isHub: true, scale: 1.2, isCore: cluster.isCore
      };
      nodes.push(hub);
      hubs.push(hub);

      for (let i = 0; i < cluster.count; i++) {
        const angle = rand() * Math.PI * 2;
        const dist = 30 + rand() * 110; 
        const x = cluster.cx + Math.cos(angle) * dist;
        const y = cluster.cy + Math.sin(angle) * dist;
        const z = cluster.cz + (-100 + rand() * 200); 
        
        const scale = (z + 200) / 200; 
        const baseR = rand() > 0.8 ? 4 : 2;
        
        const flashColor = flashPalette[Math.floor(rand() * flashPalette.length)];
        const targetNode = { x, y, z, r: baseR * scale, color: cluster.color, flashColor, isHub: false, scale, isCore: cluster.isCore };
        nodes.push(targetNode);
        
        links.push({ n1: hub, n2: targetNode, color: cluster.color });

        const pathZ = (cluster.cz + z) / 2;
        paths.push({ 
          d: `M ${cluster.cx} ${cluster.cy} L ${x} ${y}`, 
          color: cluster.color, 
          flashColor: flashPalette[Math.floor(rand() * flashPalette.length)],
          z: pathZ,
          isCore: cluster.isCore
        });

        if (i > 0 && rand() > 0.4) {
          const prevNode = nodes[nodes.length - 2];
          links.push({ n1: prevNode, n2: targetNode, color: cluster.color });
          paths.push({ 
            d: `M ${prevNode.x} ${prevNode.y} L ${x} ${y}`, 
            color: cluster.color, 
            flashColor: flashPalette[Math.floor(rand() * flashPalette.length)],
            z: (prevNode.z + z) / 2,
            isCore: cluster.isCore
          });
        }
      }
    });

    for (let i = 0; i < 25; i++) {
      const n1 = Math.floor(rand() * nodes.length);
      const n2 = Math.floor(rand() * nodes.length);
      const isCoreConn = nodes[n1].isCore && nodes[n2].isCore;
      links.push({ n1: nodes[n1], n2: nodes[n2], color: '#94a3b8' });
      paths.push({ 
        d: `M ${nodes[n1].x} ${nodes[n1].y} L ${nodes[n2].x} ${nodes[n2].y}`, 
        color: '#94a3b8', 
        flashColor: flashPalette[Math.floor(rand() * flashPalette.length)],
        z: (nodes[n1].z + nodes[n2].z) / 2,
        isCore: isCoreConn
      });
    }

    for (let i = 0; i < hubs.length; i++) {
      const h1 = hubs[i];
      const h2 = hubs[(i + 1) % hubs.length];
      const isCoreConn = h1.isCore && h2.isCore;
      
      links.push({ n1: h1, n2: h2, color: '#94a3b8' });
      paths.push({ d: `M ${h1.x} ${h1.y} L ${h2.x} ${h2.y}`, color: '#94a3b8', flashColor: '#3b82f6', z: (h1.z + h2.z) / 2, isCore: isCoreConn });
      
      if (i % 2 === 0 && i + 2 < hubs.length) {
        const h3 = hubs[i + 2];
        const isCoreConn3 = h1.isCore && h3.isCore;
        links.push({ n1: h1, n2: h3, color: '#94a3b8' });
        paths.push({ d: `M ${h1.x} ${h1.y} L ${h3.x} ${h3.y}`, color: '#94a3b8', flashColor: '#3b82f6', z: (h1.z + h3.z) / 2, isCore: isCoreConn3 });
      }
    }

    nodes.sort((a, b) => a.z - b.z);
    paths.sort((a, b) => a.z - b.z);
    
    links.forEach(link => {
      link.n1_idx = nodes.indexOf(link.n1);
      link.n2_idx = nodes.indexOf(link.n2);
    });

    return { nodes, paths, links };
  }, []);

  useAnimationFrame((time, delta) => {
    if (activeStep !== 2) return;
    
    if (!isDragging.current) {
      velocityX.current *= 0.95; 
      velocityY.current = velocityY.current * 0.95 + (-0.0003) * 0.05; 
    }

    angleXRef.current += velocityX.current * delta;
    angleYRef.current += velocityY.current * delta;

    const rotY = angleYRef.current;
    const rotX = angleXRef.current + Math.sin(time * 0.001) * 0.05; 

    const sinY = Math.sin(rotY);
    const cosY = Math.cos(rotY);
    const sinX = Math.sin(rotX);
    const cosX = Math.cos(rotX);

    const proj = new Array(processingNodes.length);

    processingNodes.forEach((node, i) => {
      let nx = node.x - 550;
      let ny = node.y - 300;
      let nz = node.z;

      let tx = nx * cosY - nz * sinY;
      let tz = nx * sinY + nz * cosY;

      let ty = ny * cosX - tz * sinX;
      tz = ny * sinX + tz * cosX;

      const fov = 1000;
      const scale = fov / (fov + tz);
      
      const px = tx * scale;
      const py = ty * scale;
      
      proj[i] = { px, py, scale, z: tz };

      const el = htmlNodesRef.current[i];
      if (el) {
        el.style.transform = `translate3d(${px}px, ${py}px, 0) scale(${scale}) translate(-50%, -50%)`;
        el.style.zIndex = Math.floor(scale * 100).toString();
        el.style.opacity = Math.max(0.2, scale - 0.1).toString();
      }
    });

    processingLinks.forEach((link, i) => {
      const p1 = proj[link.n1_idx];
      const p2 = proj[link.n2_idx];
      if (!p1 || !p2) return;

      const el = htmlLinksRef.current[i];
      if (el) {
        const dx = p2.px - p1.px;
        const dy = p2.py - p1.py;
        const length = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        
        el.style.transform = `translate3d(${p1.px}px, ${p1.py}px, 0) rotateZ(${angle}deg)`;
        el.style.width = `${length}px`;
        el.style.zIndex = Math.floor((p1.scale + p2.scale) * 50).toString();
        const avgScale = (p1.scale + p2.scale) / 2;
        el.style.opacity = Math.max(0.05, (avgScale - 0.4) * 0.3).toString();
      }
    });
  });

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ perspective: "1200px" }}>
      <AnimatePresence>
        {activeStep === 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 0.9 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1, ease: customEaseOut }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="relative max-md:scale-[0.45] sm:scale-75 md:scale-100 origin-center">
              <div className="relative w-0 h-0">
                {processingLinks.map((link, i) => (
                  <div 
                    key={`html-l-${i}`}
                    ref={el => { htmlLinksRef.current[i] = el; }}
                    className="absolute origin-left"
                    style={{
                      left: 0, top: 0, height: 1,
                      backgroundColor: link.color,
                    }}
                  />
                ))}

                {processingNodes.map((node, i) => {
                  const size = node.isHub ? node.r * 3 : node.r * 2;
                  return (
                    <div 
                      key={`html-n-${i}`}
                      ref={el => { htmlNodesRef.current[i] = el; }}
                      className="absolute"
                      style={{ left: 0, top: 0 }}
                    >
                      <div 
                        className="rounded-full"
                        style={{ 
                          backgroundColor: node.color, 
                          width: size, 
                          height: size, 
                        }}
                      />
                      {node.isHub && (
                        <div 
                          className="absolute whitespace-nowrap text-center font-bold tracking-widest pointer-events-none"
                          style={{
                            color: node.color,
                            fontSize: 14,
                            left: '50%', top: -25,
                            transform: 'translateX(-50%)',
                            textShadow: `0 0 2px rgba(0,0,0,0.1)`
                          }}
                        >
                          {node.label}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {activeStep === 2 && (
        <motion.div 
          className="absolute inset-0 z-50 cursor-grab active:cursor-grabbing pointer-events-auto"
          onPointerMove={() => { lastInteractTime.current = Date.now(); }}
          onPointerDown={() => { lastInteractTime.current = Date.now(); }}
          onPanStart={() => { isDragging.current = true; }}
          onPan={(e, info) => {
            velocityY.current = info.delta.x * 0.0001;
            velocityX.current = info.delta.y * -0.0001;
          }}
          onPanEnd={() => { isDragging.current = false; }}
        />
      )}
    </div>
  );
}
