import { useRef, useMemo, useState } from 'react';
import * as THREE from 'three';

// Simple color-based material - no textures
const createSimpleMaterial = (color, glowIntensity, isCurrentUser, isTargetUser) => {
  const baseColor = new THREE.Color(color);
  
  if (isCurrentUser) {
    baseColor.lerp(new THREE.Color('#22c55e'), 0.3);
  }
  
  return new THREE.MeshLambertMaterial({
    color: baseColor,
    emissive: isCurrentUser ? new THREE.Color('#22c55e') : baseColor,
    emissiveIntensity: isCurrentUser ? 0.3 : glowIntensity * 0.1,
  });
};

const BuildingLite = ({ data, onHover, onClick, isCurrentUser = false, isTargetUser = false }) => {
  const [hovered, setHovered] = useState(false);

  const {
    position,
    architecture,
    isHighlighted,
    glowIntensity,
    color,
    username,
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

  // Simple material - no textures, no complex shaders
  const material = useMemo(() => 
    createSimpleMaterial(color, glowIntensity, isCurrentUser, isTargetUser),
    [color, glowIntensity, isCurrentUser, isTargetUser]
  );

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

      {/* Simple building - no animations, no complex effects */}
      <group>
        {architecture.segments.slice(0, 3).map((segment, index) => {
          const segY = currentY + segment.height / 2;
          currentY += segment.height;

          const segPosition = [
            segment.offsetX || 0,
            segY - totalHeight / 2,
            segment.offsetZ || 0
          ];

          // Limit to 3 segments max for performance
          if (index >= 3) return null;

          return (
            <mesh 
              key={index}
              position={segPosition}
            >
              {segment.round ? (
                <cylinderGeometry args={[segment.width / 2, segment.width / 2, segment.height, 8]} />
              ) : (
                <boxGeometry args={[segment.width, segment.height, segment.depth]} />
              )}
              <primitive object={material} />
            </mesh>
          );
        })}

        {/* Simple indicator for current user - just a ring */}
        {isCurrentUser && (
          <mesh position={[0, -totalHeight / 2 + 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[baseSize * 0.9, baseSize * 1.2, 16]} />
            <meshBasicMaterial color="#22c55e" side={THREE.DoubleSide} />
          </mesh>
        )}

        {/* Simple indicator for target user */}
        {isTargetUser && (
          <mesh position={[0, -totalHeight / 2 + 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[baseSize * 0.9, baseSize * 1.2, 16]} />
            <meshBasicMaterial color="#3b82f6" side={THREE.DoubleSide} />
          </mesh>
        )}

        {/* Simple hover highlight */}
        {hovered && (
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[baseSize * 1.35, totalHeight * 1.02, baseSize * 1.35]} />
            <meshBasicMaterial color="#4a9eff" transparent opacity={0.1} wireframe />
          </mesh>
        )}
      </group>
    </group>
  );
};

export default BuildingLite;
