import { useRef, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const FlyingCamera = ({ 
  enabled = true, 
  minHeight = 5,
  maxHeight = 400,
  movementSpeed = 2,
  lookSpeed = 0.002,
  onLockChange,
  isPaused = false
}) => {
  const { camera, gl } = useThree();
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const isLocked = useRef(false);
  const keys = useRef({});
  const mouseDelta = useRef({ x: 0, y: 0 });
  
  const canvas = gl.domElement;
  
  // Toggle pointer lock
  const togglePointerLock = useCallback(() => {
    if (!enabled || isPaused) return;
    
    if (isLocked.current) {
      document.exitPointerLock?.();
    } else {
      canvas.requestPointerLock?.();
    }
  }, [enabled, isPaused, canvas]);
  
  useEffect(() => {
    if (!enabled) {
      if (document.pointerLockElement === canvas) {
        document.exitPointerLock?.();
      }
      return;
    }
    
    const onPointerLockChange = () => {
      const locked = document.pointerLockElement === canvas;
      isLocked.current = locked;
      onLockChange?.(locked);
    };
    
    const onMouseMove = (e) => {
      if (!isLocked.current) return;
      mouseDelta.current.x += e.movementX * lookSpeed;
      mouseDelta.current.y += e.movementY * lookSpeed;
    };
    
    const onKeyDown = (e) => {
      keys.current[e.code] = true;
      
      if (e.code === 'Tab') {
        e.preventDefault();
        togglePointerLock();
      }
    };
    
    const onKeyUp = (e) => {
      keys.current[e.code] = false;
    };
    
    // Only add canvas click handler if not paused
    const onCanvasClick = () => {
      if (!isLocked.current && enabled && !isPaused) {
        canvas.requestPointerLock?.();
      }
    };
    
    document.addEventListener('pointerlockchange', onPointerLockChange);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('click', onCanvasClick);
    
    return () => {
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('click', onCanvasClick);
      document.exitPointerLock?.();
    };
  }, [enabled, isPaused, canvas, lookSpeed, onLockChange, togglePointerLock]);
  
  useFrame(() => {
    if (!enabled || !isLocked.current || isPaused) return;
    
    // Apply mouse look
    euler.current.setFromQuaternion(camera.quaternion);
    euler.current.y -= mouseDelta.current.x;
    euler.current.x -= mouseDelta.current.y;
    euler.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.current.x));
    camera.quaternion.setFromEuler(euler.current);
    mouseDelta.current.x = 0;
    mouseDelta.current.y = 0;
    
    // Calculate movement
    direction.current.set(0, 0, 0);
    
    if (keys.current['KeyW'] || keys.current['ArrowUp']) direction.current.z -= 1;
    if (keys.current['KeyS'] || keys.current['ArrowDown']) direction.current.z += 1;
    if (keys.current['KeyA'] || keys.current['ArrowLeft']) direction.current.x -= 1;
    if (keys.current['KeyD'] || keys.current['ArrowRight']) direction.current.x += 1;
    if (keys.current['KeyQ'] || keys.current['Space']) direction.current.y += 1;
    if (keys.current['KeyE'] || keys.current['ShiftLeft']) direction.current.y -= 1;
    
    if (direction.current.length() > 0) {
      direction.current.normalize();
      direction.current.applyEuler(new THREE.Euler(0, euler.current.y, 0));
      velocity.current.lerp(direction.current.multiplyScalar(movementSpeed), 0.1);
    } else {
      velocity.current.multiplyScalar(0.9);
    }
    
    camera.position.add(velocity.current);
    
    // Ground collision
    if (camera.position.y < minHeight) {
      camera.position.y = minHeight;
      velocity.current.y = 0;
    }
    if (camera.position.y > maxHeight) {
      camera.position.y = maxHeight;
      velocity.current.y = 0;
    }
    
    // Boundary
    const boundary = 400;
    camera.position.x = Math.max(-boundary, Math.min(boundary, camera.position.x));
    camera.position.z = Math.max(-boundary, Math.min(boundary, camera.position.z));
  });
  
  return null;
};

export default FlyingCamera;
