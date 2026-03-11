import { useRef, useMemo, forwardRef, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import Building from './Building';
import FlyingCamera from './FlyingCamera';

// Ambient city lights floating in the air
const CityParticles = ({ count = 200 }) => {
  const points = useRef();
  
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 600;
      positions[i * 3 + 1] = Math.random() * 100 + 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 600;
      
      colors[i * 3] = 0.3 + Math.random() * 0.3;
      colors[i * 3 + 1] = 0.5 + Math.random() * 0.4;
      colors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
    }
    return { positions, colors };
  }, [count]);
  
  useFrame((state) => {
    if (points.current) {
      const time = state.clock.elapsedTime;
      points.current.rotation.y = time * 0.02;
      
      const positions = points.current.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] += Math.sin(time * 0.5 + i) * 0.02;
      }
      points.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.8}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// Ground plane with grid
const Ground = ({ parks }) => {
  return (
    <>
      {/* Main ground */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.5, 0]} 
        receiveShadow
      >
        <planeGeometry args={[1200, 1200]} />
        <meshStandardMaterial 
          color="#0f0f1a"
          roughness={0.9}
          metalness={0.3}
        />
      </mesh>
      
      {/* Grid helper */}
      <gridHelper args={[1000, 50, '#222', '#1a1a2e']} position={[0, -0.49, 0]} />
      
      {/* Park areas */}
      {parks.map((park, index) => (
        <mesh 
          key={index}
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[park.x, -0.45, park.z]} 
          receiveShadow
        >
          <circleGeometry args={[park.radius, 32]} />
          <meshStandardMaterial 
            color="#1a3a2a"
            roughness={1}
          />
        </mesh>
      ))}
    </>
  );
};

// Road network with glow
const Roads = ({ roads }) => {
  return (
    <group>
      {roads.map((road, index) => {
        const length = Math.sqrt((road.x2 - road.x1) ** 2 + (road.z2 - road.z1) ** 2);
        const angle = Math.atan2(road.z2 - road.z1, road.x2 - road.x1);
        const midX = (road.x1 + road.x2) / 2;
        const midZ = (road.z1 + road.z2) / 2;
        
        return (
          <group key={index}>
            <mesh 
              rotation={[-Math.PI / 2, 0, angle]} 
              position={[midX, -0.3, midZ]}
              receiveShadow
            >
              <planeGeometry args={[length, road.width]} />
              <meshStandardMaterial 
                color={road.type === 'highway' ? '#2a3a5a' : '#252a3a'}
                roughness={0.9}
              />
            </mesh>
            <mesh 
              rotation={[-Math.PI / 2, 0, angle]} 
              position={[midX, -0.28, midZ]}
            >
              <planeGeometry args={[length, 0.3]} />
              <meshBasicMaterial 
                color="#4a9eff"
                transparent
                opacity={road.type === 'highway' ? 0.4 : 0.2}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// Enhanced trees
const Trees = ({ parks }) => {
  const trees = useMemo(() => {
    const result = [];
    parks.forEach(park => {
      const count = Math.floor(park.radius * 2.5);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * (park.radius - 6) + 4;
        result.push({
          x: park.x + Math.cos(angle) * radius,
          z: park.z + Math.sin(angle) * radius,
          scale: 1.5 + Math.random() * 0.8,
          type: Math.random() > 0.6 ? 'pine' : 'oak'
        });
      }
    });
    return result;
  }, [parks]);
  
  return (
    <group>
      {trees.map((tree, index) => (
        <group key={index} position={[tree.x, 0, tree.z]} scale={tree.scale}>
          <mesh position={[0, 2, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.4, 4, 8]} />
            <meshStandardMaterial color="#3d2d20" roughness={0.9} />
          </mesh>
          {tree.type === 'pine' ? (
            <>
              <mesh position={[0, 5, 0]} castShadow>
                <coneGeometry args={[1.8, 4, 8]} />
                <meshStandardMaterial color="#1a4a1a" roughness={0.8} />
              </mesh>
              <mesh position={[0, 7.5, 0]} castShadow>
                <coneGeometry args={[1.2, 3, 8]} />
                <meshStandardMaterial color="#1a4a1a" roughness={0.8} />
              </mesh>
            </>
          ) : (
            <mesh position={[0, 5, 0]} castShadow>
              <sphereGeometry args={[2.5, 8, 6]} />
              <meshStandardMaterial color="#2a6a2a" roughness={0.8} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
};

// Camera controller for navigation
const CameraController = forwardRef(({ cameraMode }, ref) => {
  const { camera, controls } = useThree();
  
  useImperativeHandle(ref, () => ({
    navigateTo: (position, target) => {
      // Animate camera to position
      const startPos = camera.position.clone();
      const endPos = new THREE.Vector3(
        position[0] + 80,
        position[1] + 60,
        position[2] + 80
      );
      
      const startTarget = controls?.target ? controls.target.clone() : new THREE.Vector3();
      const endTarget = new THREE.Vector3(target[0], target[1], target[2]);
      
      let progress = 0;
      const duration = 1500; // ms
      const startTime = performance.now();
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        
        camera.position.lerpVectors(startPos, endPos, easeOutCubic);
        
        if (controls) {
          controls.target.lerpVectors(startTarget, endTarget, easeOutCubic);
          controls.update();
        } else {
          camera.lookAt(endTarget);
        }
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    },
    
    getCameraPosition: () => {
      return camera.position.clone();
    }
  }));
  
  return null;
});

// Scene content
const SceneContent = ({ 
  buildings, 
  roads, 
  parks, 
  onBuildingHover, 
  onBuildingClick,
  cameraMode,
  onPointerLockChange,
  isPaused,
  currentUser,
  targetUser
}) => {
  const cameraControllerRef = useRef();
  
  return (
    <>
      <CameraController ref={cameraControllerRef} cameraMode={cameraMode} />
      
      {/* Ambient lighting */}
      <ambientLight intensity={0.3} />
      
      {/* Main sun/moon light */}
      <directionalLight
        position={[-100, 200, -100]}
        intensity={0.8}
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-camera-left={-600}
        shadow-camera-right={600}
        shadow-camera-top={600}
        shadow-camera-bottom={-600}
        shadow-bias={-0.0001}
        shadow-radius={4}
      />
      
      {/* City glow from below */}
      <hemisphereLight
        skyColor="#0a0a1a"
        groundColor="#1a1a3e"
        intensity={0.4}
      />
      
      {/* Blue rim light */}
      <directionalLight
        position={[100, 50, 100]}
        intensity={0.3}
        color="#4a9eff"
      />
      
      {/* Stars */}
      <Stars 
        radius={800} 
        depth={300} 
        count={5000} 
        factor={10} 
        saturation={0.5}
        fade 
        speed={0.5}
      />
      
      {/* Floating particles */}
      <CityParticles count={300} />
      
      <Ground parks={parks} />
      <Roads roads={roads} />
      <Trees parks={parks} />
      
      {/* Buildings */}
      {buildings.map((building) => (
        <Building
          key={building.id}
          data={building}
          onHover={onBuildingHover}
          onClick={onBuildingClick}
          isCurrentUser={currentUser && building.username?.toLowerCase() === currentUser.username?.toLowerCase()}
          isTargetUser={targetUser && building.username?.toLowerCase() === targetUser.toLowerCase()}
        />
      ))}
      
      {/* Fog for depth */}
      <fog attach="fog" args={['#050508', 100, 1000]} />
      
      {cameraMode === 'orbit' && (
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={50}
          maxDistance={800}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2 - 0.02}
          target={[0, 30, 0]}
        />
      )}
      
      {cameraMode === 'fly' && (
        <FlyingCamera 
          enabled={true}
          minHeight={10}
          maxHeight={600}
          movementSpeed={4}
          lookSpeed={0.002}
          onLockChange={onPointerLockChange}
          isPaused={isPaused}
        />
      )}
    </>
  );
};

const City = forwardRef(({ 
  buildings, 
  roads, 
  parks, 
  onBuildingHover, 
  onBuildingClick,
  cameraMode = 'fly',
  onCanvasReady,
  onPointerLockChange,
  isPaused = false,
  currentUser = null,
  targetUser = null
}, ref) => {
  const handleCreated = useCallback(({ gl }) => {
    if (gl?.domElement && onCanvasReady) {
      onCanvasReady(gl.domElement);
    }
  }, [onCanvasReady]);
  
  return (
    <div className="w-full h-full">
      <Canvas
        ref={ref}
        shadows
        camera={{ 
          position: [250, 100, 250],
          fov: 50,
          near: 1,
          far: 2000
        }}
        gl={{ 
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
        dpr={[1, 2]}
        onCreated={handleCreated}
        style={{ pointerEvents: isPaused ? 'none' : 'auto' }}
      >
        <color attach="background" args={['#050508']} />
        <SceneContent 
          buildings={buildings}
          roads={roads}
          parks={parks}
          onBuildingHover={onBuildingHover}
          onBuildingClick={onBuildingClick}
          cameraMode={cameraMode}
          onPointerLockChange={onPointerLockChange}
          isPaused={isPaused}
          currentUser={currentUser}
          targetUser={targetUser}
        />
      </Canvas>
    </div>
  );
});

export default City;
