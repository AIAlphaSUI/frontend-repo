import React, { useEffect, useRef, useState } from 'react'
import './Background.css'

const Background: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fishLoaded, setFishLoaded] = useState(false);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Load fish image
    const fishImage = new Image();
    fishImage.src = '/fish-logo.png'; // Make sure to place your fish logo in the public folder
    fishImage.onload = () => setFishLoaded(true);
    
    // Set canvas size with pixel ratio for sharpness
    function resizeCanvas() {
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * pixelRatio;
      canvas.height = window.innerHeight * pixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(pixelRatio, pixelRatio);
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Stars background setup
    const stars: Star[] = [];
    const starCount = Math.min(window.innerWidth / 3, 300); // Fewer stars for better performance
    
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.15 + 0.05,
        opacity: Math.random() * 0.8 + 0.2,
        pulse: Math.random() * 0.1,
        pulseFactor: Math.random() * 0.02 + 0.01
      });
    }
    
    // Create floating words
    const wordEntities: WordEntity[] = [
      {
        text: 'AI',
        x: window.innerWidth * 0.3,
        y: window.innerHeight * 0.45,
        targetX: window.innerWidth * 0.3,
        targetY: window.innerHeight * 0.45,
        size: Math.min(window.innerWidth / 15, 80),
        color: '#ffffff',
        glowColor: 'rgba(255, 255, 255, 0.7)',
        floatSpeed: 0.8,
        floatRange: 10
      },
      {
        text: 'Alpha',
        x: window.innerWidth * 0.5,
        y: window.innerHeight * 0.45,
        targetX: window.innerWidth * 0.5,
        targetY: window.innerHeight * 0.45,
        size: Math.min(window.innerWidth / 15, 80),
        color: '#a099ff',
        glowColor: 'rgba(160, 153, 255, 0.7)',
        floatSpeed: 1.2,
        floatRange: 8
      },
      {
        text: 'SUI',
        x: window.innerWidth * 0.7,
        y: window.innerHeight * 0.45,
        targetX: window.innerWidth * 0.7,
        targetY: window.innerHeight * 0.45,
        size: Math.min(window.innerWidth / 15, 80),
        color: '#4361EE',
        glowColor: 'rgba(67, 97, 238, 0.7)',
        floatSpeed: 1.5,
        floatRange: 12
      }
    ];
    
    // Setup fish animation
    const fish = {
      x: window.innerWidth * 0.2,
      y: window.innerHeight * 0.7,
      size: 60, // Adjust size as needed
      angle: 0,
      speed: 0.5,
      pathAngle: 0,
      pathRadius: Math.min(window.innerWidth, window.innerHeight) * 0.12,
      pathCenterX: window.innerWidth * 0.8,
      pathCenterY: window.innerHeight * 0.8,
      wobble: 0
    };
    
    // Bubbles array for fish effect
    const bubbles: Bubble[] = [];
    
    // Animation variables
    let angle = 0;
    let animationId: number;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    
    // Track mouse movement for subtle interactivity
    canvas.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });
    
    // Touch support
    canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
      }
    });
    
    // Handle window resize - update positions
    const handleResize = () => {
      resizeCanvas();
      
      // Reposition words
      wordEntities[0].targetX = window.innerWidth * 0.3;
      wordEntities[0].targetY = window.innerHeight * 0.45;
      
      wordEntities[1].targetX = window.innerWidth * 0.5;
      wordEntities[1].targetY = window.innerHeight * 0.45;
      
      wordEntities[2].targetX = window.innerWidth * 0.7;
      wordEntities[2].targetY = window.innerHeight * 0.45;
      
      // Resize fish path
      fish.pathRadius = Math.min(window.innerWidth, window.innerHeight) * 0.12;
      fish.pathCenterX = window.innerWidth * 0.8;
      fish.pathCenterY = window.innerHeight * 0.8;
      
      // Reset stars
      for (let i = 0; i < stars.length; i++) {
        stars[i].x = Math.random() * window.innerWidth;
        stars[i].y = Math.random() * window.innerHeight;
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Draw sharper glowing text
    function drawGlowingText(word: WordEntity) {
      ctx.save();
      
      // Use crisp text rendering
      ctx.font = `bold ${word.size}px "Inter", "Segoe UI", Helvetica, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Create stronger glow with multiple passes
      for (let i = 0; i < 3; i++) {
        const blur = (3 - i) * 6;
        const alpha = 0.3 / (i + 1);
        
        ctx.shadowColor = word.glowColor;
        ctx.shadowBlur = blur;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        ctx.fillStyle = word.color;
        ctx.fillText(word.text, word.x, word.y);
      }
      
      // Final crisp text on top without blur
      ctx.shadowBlur = 0;
      ctx.fillStyle = word.color;
      ctx.fillText(word.text, word.x, word.y);
      
      ctx.restore();
    }
    
    // Create bubble from fish
    function createBubble(fish: any) {
      // Position bubbles behind the fish
      const angle = fish.angle - Math.PI;
      const offsetX = Math.cos(angle) * (fish.size * 0.4);
      const offsetY = Math.sin(angle) * (fish.size * 0.4);
      
      bubbles.push({
        x: fish.x + offsetX,
        y: fish.y + offsetY,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 0.5 + 0.5,
        opacity: 0.8,
        life: 1.0
      });
    }
    
    // Update and draw bubbles
    function updateBubbles() {
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const bubble = bubbles[i];
        
        // Move bubbles with slight randomness
        bubble.y -= bubble.speed;
        bubble.x += Math.sin(angle * 10 + i) * 0.3;
        
        // Decrease life/opacity
        bubble.life -= 0.02;
        bubble.opacity = bubble.life * 0.8;
        
        // Draw bubble
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 255, 200, ${bubble.opacity})`;
        ctx.fill();
        
        // Slight glow for bubbles
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(100, 255, 200, 0.5)';
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Remove dead bubbles
        if (bubble.life <= 0) {
          bubbles.splice(i, 1);
        }
      }
    }
    
    // Draw wake effect behind the fish
    function drawFishWake(fish: any) {
      ctx.save();
      
      // Calculate position behind fish based on current direction
      const wakeAngle = fish.angle - Math.PI;
      
      // Draw wake ripples
      for (let i = 0; i < 3; i++) {
        const distance = i * 10;
        const wakeX = fish.x + Math.cos(wakeAngle) * (fish.size * 0.5 + distance);
        const wakeY = fish.y + Math.sin(wakeAngle) * (fish.size * 0.5 + distance);
        const size = fish.size * 0.15 - i * 2;
        const opacity = 0.2 - i * 0.05;
        
        ctx.beginPath();
        ctx.arc(wakeX, wakeY, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 255, 200, ${opacity})`;
        ctx.fill();
      }
      
      ctx.restore();
    }
    
    // Draw fish swimming with enhanced effects
    function drawFish() {
      if (!fishLoaded) return;
      
      // Update fish position along circular path
      fish.pathAngle += 0.008; // Speed of circular movement
      fish.x = fish.pathCenterX + Math.cos(fish.pathAngle) * fish.pathRadius;
      fish.y = fish.pathCenterY + Math.sin(fish.pathAngle) * fish.pathRadius;
      
      // Calculate direction angle based on movement
      fish.angle = Math.atan2(
        Math.sin(fish.pathAngle) * fish.pathRadius,
        Math.cos(fish.pathAngle) * fish.pathRadius
      ) + Math.PI/2; // Add 90 degrees so fish faces forward
      
      // Add wobble for swimming effect
      fish.wobble += 0.1;
      
      // Add bubbles occasionally
      if (Math.random() < 0.05) {
        createBubble(fish);
      }
      
      // Draw wake effect behind fish
      drawFishWake(fish);
      
      ctx.save();
      
      // Move to fish position
      ctx.translate(fish.x, fish.y);
      
      // Rotate fish to face direction of movement
      ctx.rotate(fish.angle);
      
      // Add slight wobble to simulate swimming
      ctx.rotate(Math.sin(fish.wobble) * 0.08);
      
      // Add subtle scaling for swimming effect
      const scaleFactor = 1 + Math.sin(fish.wobble * 0.5) * 0.05;
      ctx.scale(scaleFactor, 1 / scaleFactor);
      
      // Draw fish with enhanced glow
      ctx.shadowColor = 'rgba(100, 255, 150, 0.7)';
      ctx.shadowBlur = 15;
      
      // Draw the fish image
      ctx.drawImage(
        fishImage,
        -fish.size / 2,
        -fish.size / 2,
        fish.size,
        fish.size
      );
      
      ctx.restore();
    }
    
    // Animation loop
    function animate() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      
      // Update angle for animations
      angle += 0.005;
      
      // Draw stars in the background
      for (const star of stars) {
        star.y += star.speed;
        
        // Reset stars that go off screen
        if (star.y > window.innerHeight) {
          star.y = 0;
          star.x = Math.random() * window.innerWidth;
        }
        
        // Pulsing effect
        star.opacity += star.pulseFactor;
        if (star.opacity > 1 || star.opacity < 0.2) {
          star.pulseFactor = -star.pulseFactor;
        }
        
        // Draw star
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Update and draw bubbles
      updateBubbles();
      
      // Draw swimming fish
      drawFish();
      
      // Update word positions with gentle floating effect
      for (const word of wordEntities) {
        // Add floating effect
        word.x = word.targetX + Math.sin(angle * word.floatSpeed) * word.floatRange;
        word.y = word.targetY + Math.cos(angle * word.floatSpeed * 0.8) * (word.floatRange * 0.5);
        
        // Add subtle mouse interaction
        const dx = mouseX - word.x;
        const dy = mouseY - word.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 300;
        
        if (dist < maxDist) {
          const force = (1 - dist / maxDist) * 0.5;
          word.x -= dx * force * 0.01;
          word.y -= dy * force * 0.01;
        }
      }
      
      // Draw connection lines between words (simpler version)
      ctx.beginPath();
      
      // First connection - AI to Alpha
      ctx.moveTo(wordEntities[0].x, wordEntities[0].y);
      ctx.lineTo(wordEntities[1].x, wordEntities[1].y);
      
      // Second connection - Alpha to SUI
      ctx.moveTo(wordEntities[1].x, wordEntities[1].y);
      ctx.lineTo(wordEntities[2].x, wordEntities[2].y);
      
      // Style for connection lines
      const gradient = ctx.createLinearGradient(
        wordEntities[0].x, wordEntities[0].y, 
        wordEntities[2].x, wordEntities[2].y
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
      gradient.addColorStop(0.5, 'rgba(160, 153, 255, 0.2)');
      gradient.addColorStop(1, 'rgba(67, 97, 238, 0.2)');
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw simple sparkles along the lines instead of complex particles
      drawSimpleSparkles();
      
      // Draw the words
      for (const word of wordEntities) {
        drawGlowingText(word);
      }
      
      animationId = requestAnimationFrame(animate);
    }
    
    // Draw simple sparkles along connection lines
    function drawSimpleSparkles() {
      // First connection - AI to Alpha
      for (let i = 0; i < 3; i++) {
        const t = ((angle * 0.5 + i * 0.33) % 1);
        const x = wordEntities[0].x + (wordEntities[1].x - wordEntities[0].x) * t;
        const y = wordEntities[0].y + (wordEntities[1].y - wordEntities[0].y) * t;
        
        drawSparkle(x, y, 'rgba(255, 255, 255, 0.6)');
      }
      
      // Second connection - Alpha to SUI
      for (let i = 0; i < 3; i++) {
        const t = ((angle * 0.7 + i * 0.33) % 1);
        const x = wordEntities[1].x + (wordEntities[2].x - wordEntities[1].x) * t;
        const y = wordEntities[1].y + (wordEntities[2].y - wordEntities[1].y) * t;
        
        drawSparkle(x, y, 'rgba(160, 153, 255, 0.6)');
      }
    }
    
    // Helper function to draw individual sparkle
    function drawSparkle(x: number, y: number, color: string) {
      const size = 2 + Math.sin(angle * 2) * 1;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      
      // Add subtle glow
      ctx.shadowBlur = 5;
      ctx.shadowColor = color;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    
    animate();
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [fishLoaded]);
  
  return (
    <div className="background-container">
      <canvas ref={canvasRef} className="particle-canvas" />
      <div className="background-glow"></div>
    </div>
  );
};

// Type definitions
interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  pulse: number;
  pulseFactor: number;
}

interface WordEntity {
  text: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  color: string;
  glowColor: string;
  floatSpeed: number;
  floatRange: number;
}

interface Bubble {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  life: number;
}

export default Background;