import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Generate window texture with proper aspect ratio
const createWindowTexture = (width, height, litRatio = 0.7) => {
  const canvas = document.createElement('canvas');
  const aspectRatio = width / height;
  canvas.width = 128;
  canvas.height = Math.max(64, Math.floor(128 / aspectRatio));
  const ctx = canvas.getContext('2d');

  // Building facade color (dark glass/concrete)
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(0.5, '#252538');
  gradient.addColorStop(1, '#1a1a2e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Window grid
  const cols = 4;
  const rows = Math.floor(canvas.height / 20);
  const padX = 8;
  const padY = 6;
  const winW = (canvas.width - padX * (cols + 1)) / cols;
  const winH = (canvas.height - padY * (rows + 1)) / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isLit = Math.random() < litRatio;
      const x = padX + c * (winW + padX);
      const y = padY + r * (winH + padY);
      
      if (isLit) {
        const brightness = 180 + Math.random() * 75;
        const winGradient = ctx.createLinearGradient(x, y, x, y + winH);
        winGradient.addColorStop(0, `rgb(${brightness}, ${brightness * 0.9}, ${brightness * 0.6})`);
        winGradient.addColorStop(1, `rgb(${brightness * 0.8}, ${brightness * 0.7}, ${brightness * 0.4})`);
        ctx.fillStyle = winGradient;
        ctx.fillRect(x, y, winW, winH);
        
        ctx.strokeStyle = '#0a0a14';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, winW, winH);
      } else {
        ctx.fillStyle = '#0d0d18';
        ctx.fillRect(x, y, winW, winH);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

// Generate emission map for night glow
const createEmissionTexture = (width, height, litRatio = 0.7) => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = Math.max(64, Math.floor(128 / (width / height)));
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cols = 4;
  const rows = Math.floor(canvas.height / 20);
  const padX = 8;
  const padY = 6;
  const winW = (canvas.width - padX * (cols + 1)) / cols;
  const winH = (canvas.height - padY * (rows + 1)) / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isLit = Math.random() < litRatio;
      if (isLit) {
        const x = padX + c * (winW + padX);
        const y = padY + r * (winH + padY);
        const intensity = 0.5 + Math.random() * 0.5;
        const val = Math.floor(intensity * 255);
        ctx.fillStyle = `rgb(${val}, ${val * 0.8}, ${val * 0.4})`;
        ctx.fillRect(x, y, winW, winH);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

const Building = ({ data, onHover, onClick, isCurrentUser = false, isTargetUser = false }) => {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [timeOffset] = useState(() => Math.random() * 100);

  const {
    position,
    architecture,
    isHighlighted,
    glowIntensity,
    color,
    username,
    id,
    height: buildingHeight,
    baseSize
  } = data;

  const totalHeight = useMemo(() => {
    if (!architecture?.segments || architecture.segments.length === 0) {
      return buildingHeight || 20;
    }
    return architecture.segments.reduce((sum, seg) => sum + (seg.height || 0), 0);
  }, [architecture, buildingHeight]);

  const buildingY = totalHeight / 2;
  const hitboxSize = Math.max(baseSize * 2.5, 25);

  // Create materials with textures
  const materials = useMemo(() => {
    const baseColor = new THREE.Color(color);
    const litRatio = 0.4 + glowIntensity * 0.5;
    
    // Current user gets green tint
    const finalColor = isCurrentUser ? baseColor.clone().lerp(new THREE.Color('#22c55e'), 0.3) : baseColor;
    
    return {
      main: new THREE.MeshStandardMaterial({
        color: finalColor,
        roughness: 0.3,
        metalness: 0.7,
        emissive: finalColor,
        emissiveIntensity: glowIntensity * 0.2,
      }),
      glass: new THREE.MeshPhysicalMaterial({
        color: '#1a1a2e',
        metalness: 0.9,
        roughness: 0.1,
        transmission: 0.2,
        thickness: 0.5,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        emissive: finalColor,
        emissiveIntensity: glowIntensity * 0.3,
      }),
      glow: new THREE.MeshBasicMaterial({
        color: finalColor,
        transparent: true,
        opacity: 0.15 + glowIntensity * 0.2,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
      // Special materials for current user
      userRing: new THREE.MeshBasicMaterial({
        color: '#22c55e',
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      }),
      // Target user (navigated to) gets blue highlight
      targetRing: new THREE.MeshBasicMaterial({
        color: '#3b82f6',
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      })
    };
  }, [color, glowIntensity, isCurrentUser]);

  // Animated effects
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (groupRef.current) {
      // Subtle floating for highlighted buildings
      if (isHighlighted || isCurrentUser || isTargetUser) {
        const floatY = Math.sin(time * 2 + timeOffset) * 0.5;
        groupRef.current.position.y = floatY;
        
        // Pulse emissive intensity
        const pulse = (Math.sin(time * 3 + timeOffset) + 1) * 0.5;
        groupRef.current.children.forEach(child => {
          if (child.material?.emissiveIntensity !== undefined) {
            child.material.emissiveIntensity = 0.3 + pulse * 0.4;
          }
        });
      }
      
      // Hover scale effect
      const targetScale = hovered ? 1.03 : 1;
      groupRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
      
      // Rotate user ring
      if (isCurrentUser || isTargetUser) {
        const ringMesh = groupRef.current.children.find(child => child.userData?.isRing);
        if (ringMesh) {
          ringMesh.rotation.y = time * 0.5;
        }
      }
    }
  });

  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    onHover?.(data, e);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    setHovered(false);
    onHover?.(null);
    document.body.style.cursor = 'default';
  };

  const handleClick = (e) => {
    e.stopPropagation();
    onClick?.(data);
  };

  if (!architecture?.segments || architecture.segments.length === 0) {
    return null;
  }

  let currentY = 0;
  const windowTexture = createWindowTexture(baseSize, totalHeight, 0.4 + glowIntensity * 0.4);
  const emissionTexture = createEmissionTexture(baseSize, totalHeight, 0.4 + glowIntensity * 0.4);

  return (
    <group position={[position[0], buildingY, position[2]]}>
      {/* Invisible hit box */}
      <mesh
        position={[0, 0, 0]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        visible={false}
      >
        <boxGeometry args={[hitboxSize, hitboxSize, hitboxSize]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Building segments */}
      <group ref={groupRef}>
        {architecture.segments.map((segment, index) => {
          const segY = currentY + segment.height / 2;
          currentY += segment.height;

          const segPosition = [
            segment.offsetX || 0,
            segY - totalHeight / 2,
            segment.offsetZ || 0
          ];

          if (segment.offsetY) {
            segPosition[1] = segment.offsetY - totalHeight / 2 + segment.height / 2;
          }

          const repeatX = Math.max(1, Math.round(segment.width / 3));
          const repeatY = Math.max(1, Math.round(segment.height / 4));
          
          const segWindowTexture = windowTexture.clone();
          segWindowTexture.repeat.set(repeatX, repeatY);
          
          const segEmissionTexture = emissionTexture.clone();
          segEmissionTexture.repeat.set(repeatX, repeatY);

          const segmentMaterial = new THREE.MeshStandardMaterial({
            color: materials.main.color,
            map: segWindowTexture,
            emissiveMap: segEmissionTexture,
            emissive: materials.main.emissive,
            emissiveIntensity: materials.main.emissiveIntensity,
            roughness: 0.2,
            metalness: 0.8,
          });

          return (
            <group key={index}>
              {/* Main building body */}
              <mesh 
                position={segPosition}
                castShadow 
                receiveShadow
              >
                {segment.round ? (
                  <cylinderGeometry args={[segment.width / 2, segment.width / 2, segment.height, 32]} />
                ) : (
                  <boxGeometry args={[segment.width, segment.height, segment.depth]} />
                )}
                <primitive object={segmentMaterial} />
              </mesh>
              
              {/* Glow outline for top tier buildings */}
              {(index === 0 && glowIntensity > 0.6) && (
                <mesh 
                  position={segPosition}
                  scale={[1.02, 1.01, 1.02]}
                >
                  {segment.round ? (
                    <cylinderGeometry args={[segment.width / 2, segment.width / 2, segment.height, 32]} />
                  ) : (
                    <boxGeometry args={[segment.width, segment.height, segment.depth]} />
                  )}
                  <primitive object={materials.glow} />
                </mesh>
              )}
            </group>
          );
        })}

        {/* Architectural details */}
        {architecture.details?.map((detail, index) => (
          <group key={`detail-${index}`} position={[0, totalHeight / 2, 0]}>
            {detail.type === 'antenna' && (
              <>
                <mesh position={[0, detail.height / 2, 0]} castShadow>
                  <cylinderGeometry args={[0.15, 0.2, detail.height, 8]} />
                  <meshStandardMaterial color="#444" metalness={0.8} roughness={0.2} />
                </mesh>
                <mesh position={[0, detail.height, 0]}>
                  <sphereGeometry args={[0.4, 16, 16]} />
                  <meshBasicMaterial color="#ff3333" />
                </mesh>
                <pointLight 
                  position={[0, detail.height, 0]} 
                  color="#ff3333" 
                  intensity={2} 
                  distance={20}
                  decay={2}
                />
              </>
            )}
            {detail.type === 'spire' && (
              <mesh castShadow>
                <coneGeometry args={[0.4, detail.height, 16]} />
                <meshStandardMaterial 
                  color={color} 
                  emissive={color} 
                  emissiveIntensity={0.8}
                  metalness={0.9}
                  roughness={0.1}
                />
              </mesh>
            )}
            {detail.type === 'beacon' && (
              <>
                <mesh position={[0, detail.height / 2, 0]} castShadow>
                  <cylinderGeometry args={[0.3, 0.4, detail.height, 8]} />
                  <meshStandardMaterial color="#333" metalness={0.7} />
                </mesh>
                <mesh position={[0, detail.height, 0]}>
                  <sphereGeometry args={[0.5, 16, 16]} />
                  <meshBasicMaterial color="#33ff33" />
                </mesh>
                <pointLight 
                  position={[0, detail.height, 0]} 
                  color="#33ff33" 
                  intensity={3} 
                  distance={25}
                />
              </>
            )}
          </group>
        ))}

        {/* Highlight ring for top developers */}
        {isHighlighted && !isCurrentUser && !isTargetUser && (
          <group position={[0, -totalHeight / 2 + 1, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[baseSize * 0.8, baseSize * 1.1, 64]} />
              <meshBasicMaterial 
                color="#ffd700" 
                transparent 
                opacity={0.9}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          </group>
        )}

        {/* Current user indicator - GREEN rotating ring + marker */}
        {isCurrentUser && (
          <group position={[0, -totalHeight / 2 + 0.5, 0]}>
            {/* Rotating ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} userData={{ isRing: true }}>
              <ringGeometry args={[baseSize * 0.9, baseSize * 1.2, 64]} />
              <primitive object={materials.userRing} />
            </mesh>
            {/* Secondary ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[baseSize * 1.3, baseSize * 1.4, 32]} />
              <meshBasicMaterial 
                color="#22c55e" 
                transparent 
                opacity={0.4}
                side={THREE.DoubleSide}
              />
            </mesh>
            {/* Vertical beam */}
            <mesh position={[0, totalHeight / 2, 0]}>
              <cylinderGeometry args={[0.3, 0.3, totalHeight, 8]} />
              <meshBasicMaterial 
                color="#22c55e" 
                transparent 
                opacity={0.3}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
            {/* "HOME" marker floating above */}
            <group position={[0, totalHeight + 8, 0]}>
              <mesh>
                <sphereGeometry args={[1.2, 16, 16]} />
                <meshBasicMaterial color="#22c55e" />
              </mesh>
              <pointLight 
                position={[0, 0, 0]} 
                color="#22c55e" 
                intensity={5} 
                distance={40}
              />
            </group>
          </group>
        )}

        {/* Target user indicator - BLUE ring (when navigating to someone) */}
        {isTargetUser && (
          <group position={[0, -totalHeight / 2 + 0.5, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} userData={{ isRing: true }}>
              <ringGeometry args={[baseSize * 0.9, baseSize * 1.2, 64]} />
              <primitive object={materials.targetRing} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[baseSize * 1.3, baseSize * 1.4, 32]} />
              <meshBasicMaterial 
                color="#3b82f6" 
                transparent 
                opacity={0.4}
                side={THREE.DoubleSide}
              />
            </mesh>
            <pointLight 
              position={[0, totalHeight / 2, 0]} 
              color="#3b82f6" 
              intensity={3} 
              distance={30}
            />
          </group>
        )}

        {/* Hover highlight */}
        {hovered && (
          <>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[baseSize * 1.35, totalHeight * 1.02, baseSize * 1.35]} />
              <meshBasicMaterial color="#4a9eff" transparent opacity={0.1} wireframe />
            </mesh>
            <pointLight 
              position={[0, totalHeight / 2, 0]} 
              color="#4a9eff" 
              intensity={2} 
              distance={30}
            />
          </>
        )}
      </group>
    </group>
  );
};

export default Building;
