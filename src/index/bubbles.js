/**
 * EasyMed Bubbles Animation
 * Creates an interactive bubble animation in the hero section
 */
import './bubbles.css';

(function() {
  // Configuration
  const BUBBLE_COUNT = 50;
  const BUBBLE_SIZE = 45;
  const MOUSE_PROXIMITY = 135;
  const MOUSE_AVOID_DISTANCE = 180;
  const MOUSE_AVOID_SPEED = 10;
  const BURST_THRESHOLD = 7;
  const BUBBLE_COLLISION_DISTANCE = BUBBLE_SIZE * 0.9;

  // Floating effect configuration
  const FLOAT_AMPLITUDE = 3.5;
  const FLOAT_FREQUENCY = 0.0016;
  const FLOAT_PHASE_DIFF = 0.5;

  // State variables
  let bubbles = [];
  let mouseX = 0;
  let mouseY = 0;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let mouseSpeed = 0;
  let heroSection;
  let bubblesContainer;
  let textElements = []; // Array to store text element boundaries
  let animationTime = 0; // Global time for floating animation

  // Initialize when DOM is loaded
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    // Get hero section
    heroSection = document.querySelector('.hero');
    if (!heroSection) return;

    // Create bubbles container
    bubblesContainer = document.createElement('div');
    bubblesContainer.className = 'bubbles-container';
    heroSection.appendChild(bubblesContainer);

    // Add CSS link
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = './index/bubbles.css';
    document.head.appendChild(cssLink);

    // Store text element boundaries
    storeTextElementBoundaries();

    // Create initial bubbles
    createInitialBubbles();

    // Add event listeners
    document.addEventListener('mousemove', trackMouse);
    window.addEventListener('resize', debounce(() => {
      storeTextElementBoundaries();
    }, 250));

    // Start animation loop
    requestAnimationFrame(animationLoop);
  }

  function debounce(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  function storeTextElementBoundaries() {
    textElements = [];

    // Get all text elements in the hero section
    const h1Element = heroSection.querySelector('h1');
    const pElement = heroSection.querySelector('p.intro-description');

    if (h1Element) {
      const rect = h1Element.getBoundingClientRect();
      const heroRect = heroSection.getBoundingClientRect();

      textElements.push({
        left: rect.left - heroRect.left,
        top: rect.top - heroRect.top,
        right: rect.right - heroRect.left,
        bottom: rect.bottom - heroRect.top,
        element: h1Element
      });
    }

    if (pElement) {
      const rect = pElement.getBoundingClientRect();
      const heroRect = heroSection.getBoundingClientRect();

      textElements.push({
        left: rect.left - heroRect.left,
        top: rect.top - heroRect.top,
        right: rect.right - heroRect.left,
        bottom: rect.bottom - heroRect.top,
        element: pElement
      });
    }
  }

  function createInitialBubbles() {
    for (let i = 0; i < BUBBLE_COUNT; i++) {
      setTimeout(() => {
        createBubble(getRandomPosition());
      }, i * 100); // Stagger bubble creation
    }
  }

  function createBubble(position) {
    const bubble = document.createElement('div');
    bubble.className = 'bubble bubble-hidden'; // Add hidden class initially
    bubble.style.left = `${position.x}px`;
    bubble.style.top = `${position.y}px`;

    // Add random rotation for variety
    const rotation = Math.random() * 20 - 10; // -10 to 10 degrees
    bubble.style.transform = `rotate(${rotation}deg) scale(0)`; // Start with scale 0

    // Add to DOM
    bubblesContainer.appendChild(bubble);

    // Create bubble object for tracking
    const bubbleObj = {
      element: bubble,
      x: position.x,
      y: position.y,
      vx: (Math.random() - 0.5) * 0.5, // Random initial velocity
      vy: (Math.random() - 0.5) * 0.5,
      size: BUBBLE_SIZE,
      rotation: rotation,
      moving: true,
      avoiding: false, // Track if bubble is actively avoiding the mouse
      // Add random phase offsets for floating effect
      phaseOffsetX: Math.random() * Math.PI * 2,
      phaseOffsetY: Math.random() * Math.PI * 2,
      // Original position for floating effect
      originalX: position.x,
      originalY: position.y
    };

    bubbles.push(bubbleObj);

    // Force a reflow before adding the appear class
    // This ensures the initial state is properly applied before animation starts
    void bubble.offsetWidth;

    // Remove hidden class and add appear class
    requestAnimationFrame(() => {
      bubble.classList.remove('bubble-hidden');
      bubble.classList.add('appear');

      // Add random movement for 1-2 seconds after appearing
      const moveDuration = 1000 + Math.random() * 1000;
      animateRandomMovement(bubbleObj, moveDuration);
    });

    return bubbleObj;
  }

  function animateRandomMovement(bubble, duration) {
    const startTime = Date.now();
    const startX = bubble.x;
    const startY = bubble.y;
    const targetX = startX + (Math.random() - 0.5) * 30;
    const targetY = startY + (Math.random() - 0.5) * 30;

    function moveStep() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = easeInOutQuad(progress);

      const newX = startX + (targetX - startX) * easeProgress;
      const newY = startY + (targetY - startY) * easeProgress;

      // Check if new position would intersect with text
      const wouldIntersect = checkTextIntersection(
        newX,
        newY,
        bubble.size / 2
      );

      if (!wouldIntersect) {
        bubble.x = newX;
        bubble.y = newY;
        updateBubblePosition(bubble);
      }

      if (progress < 1) {
        requestAnimationFrame(moveStep);
      } else {
        bubble.moving = false;
      }
    }

    moveStep();
  }

  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function getRandomPosition() {
    const rect = heroSection.getBoundingClientRect();
    const padding = BUBBLE_SIZE;
    let position;
    let attempts = 0;
    const maxAttempts = 50;

    // Try to find a position that doesn't intersect with text
    do {
      position = {
        x: padding + Math.random() * (rect.width - padding * 2),
        y: padding + Math.random() * (rect.height - padding * 2)
      };
      attempts++;
    } while (
      checkTextIntersection(position.x, position.y, BUBBLE_SIZE / 2) &&
      attempts < maxAttempts
    );

    return position;
  }

  function checkTextIntersection(x, y, radius) {
    // Check if bubble intersects with any text element
    for (const textElement of textElements) {
      // Expand text boundaries by bubble radius
      const expandedLeft = textElement.left - radius;
      const expandedTop = textElement.top - radius;
      const expandedRight = textElement.right + radius;
      const expandedBottom = textElement.bottom + radius;

      // Check if bubble center is within expanded text boundaries
      if (
        x >= expandedLeft &&
        x <= expandedRight &&
        y >= expandedTop &&
        y <= expandedBottom
      ) {
        return true;
      }
    }

    return false;
  }

  function trackMouse(e) {
    const rect = heroSection.getBoundingClientRect();

    // Get mouse position relative to hero section
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;

    // Calculate mouse speed
    mouseSpeed = Math.sqrt(
      Math.pow(mouseX - lastMouseX, 2) +
      Math.pow(mouseY - lastMouseY, 2)
    );

    lastMouseX = mouseX;
    lastMouseY = mouseY;
  }

  function animationLoop() {
    // Increment animation time
    animationTime += 16; // Approximately 16ms per frame at 60fps

    updateBubbles();
    requestAnimationFrame(animationLoop);
  }

  function updateBubbles() {
    for (let i = 0; i < bubbles.length; i++) {
      const bubble = bubbles[i];

      // Skip if bubble is in controlled animation
      if (bubble.moving) continue;

      // Store the position before applying floating effect
      const baseX = bubble.x;
      const baseY = bubble.y;

      // Calculate distance to mouse
      const dx = bubble.x - mouseX;
      const dy = bubble.y - mouseY;
      const distanceToMouse = Math.sqrt(dx * dx + dy * dy);

      // Handle mouse proximity with immediate response for all bubbles within range
      if (distanceToMouse < MOUSE_PROXIMITY) {
        // Calculate how close the mouse is as a percentage (1.0 = very close, 0.0 = at the edge)
        const proximityFactor = 1.0 - (distanceToMouse / MOUSE_PROXIMITY);

        // Check if mouse is moving fast enough to burst the bubble
        if (mouseSpeed > BURST_THRESHOLD && distanceToMouse < MOUSE_PROXIMITY / 3) {
          burstBubble(bubble, i);
          i--; // Adjust index since we removed a bubble
          continue;
        }

        // Move away from mouse - enhanced avoidance behavior
        const angle = Math.atan2(dy, dx);

        // Calculate strength based on how close the mouse is - more aggressive curve
        // Use proximityFactor for a more gradual response that starts earlier
        // Ensure minimum strength of 0.3 for more noticeable movement at edge of radius
        const strength = Math.max(0.32, Math.pow(proximityFactor, 1.2));

        // Apply stronger velocity based on proximity
        bubble.vx = Math.cos(angle) * strength * MOUSE_AVOID_SPEED;
        bubble.vy = Math.sin(angle) * strength * MOUSE_AVOID_SPEED;

        // Add a small immediate position adjustment for more responsive feel
        // Scale the immediate movement based on proximity with minimum of 1.8 (scaled down from 2.4)
        const immediateMoveFactor = Math.max(1.8, proximityFactor * 4.5);
        bubble.x += Math.cos(angle) * immediateMoveFactor;
        bubble.y += Math.sin(angle) * immediateMoveFactor;

        // Add slight rotation when fleeing - adjusted for new bubble size
        bubble.rotation = (bubble.rotation || 0) + (Math.random() * 2.5 - 1.25) * proximityFactor;

        // Mark bubble as actively avoiding
        bubble.avoiding = true;
      } else if (bubble.avoiding) {
        // Continue moving if we haven't reached the safe distance
        const fullAvoidDistance = MOUSE_PROXIMITY + MOUSE_AVOID_DISTANCE;
        if (distanceToMouse < fullAvoidDistance) {
          // Keep moving but with reduced force
          const angle = Math.atan2(dy, dx);
          const remainingDistance = fullAvoidDistance - distanceToMouse;
          const strength = remainingDistance / MOUSE_AVOID_DISTANCE * 0.7;

          bubble.vx = Math.cos(angle) * strength * MOUSE_AVOID_SPEED;
          bubble.vy = Math.sin(angle) * strength * MOUSE_AVOID_SPEED;
        } else {
          // We've reached a safe distance
          bubble.avoiding = false;
        }
      } else {
        // Apply floating effect when not avoiding
        applyFloatingEffect(bubble);

        // Gradually slow down any remaining velocity
        bubble.vx *= 0.95;
        bubble.vy *= 0.95;
      }

      // Calculate new position
      const newX = bubble.x + bubble.vx;
      const newY = bubble.y + bubble.vy;

      // Check text intersection
      if (checkTextIntersection(newX, newY, bubble.size / 2)) {
        // Bounce off text
        const closestTextEdge = findClosestTextEdge(bubble.x, bubble.y, newX, newY);

        if (closestTextEdge === 'left' || closestTextEdge === 'right') {
          bubble.vx *= -0.8; // Reverse x velocity with damping
        } else if (closestTextEdge === 'top' || closestTextEdge === 'bottom') {
          bubble.vy *= -0.8; // Reverse y velocity with damping
        }
      } else {
        // Apply velocity if no text intersection
        bubble.x = newX;
        bubble.y = newY;
      }

      // Check boundaries
      const rect = heroSection.getBoundingClientRect();
      const padding = BUBBLE_SIZE / 2;

      if (bubble.x < padding) {
        bubble.x = padding;
        bubble.vx *= -0.5;
      } else if (bubble.x > rect.width - padding) {
        bubble.x = rect.width - padding;
        bubble.vx *= -0.5;
      }

      if (bubble.y < padding) {
        bubble.y = padding;
        bubble.vy *= -0.5;
      } else if (bubble.y > rect.height - padding) {
        bubble.y = rect.height - padding;
        bubble.vy *= -0.5;
      }

      // Check collisions with other bubbles
      for (let j = 0; j < bubbles.length; j++) {
        if (i === j) continue;

        const otherBubble = bubbles[j];
        const dx = bubble.x - otherBubble.x;
        const dy = bubble.y - otherBubble.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < BUBBLE_COLLISION_DISTANCE) {
          // Calculate collision response
          const angle = Math.atan2(dy, dx);
          const overlap = BUBBLE_COLLISION_DISTANCE - distance;

          // Move bubbles apart
          const moveX = Math.cos(angle) * overlap * 0.5;
          const moveY = Math.sin(angle) * overlap * 0.5;

          bubble.x += moveX;
          bubble.y += moveY;
          otherBubble.x -= moveX;
          otherBubble.y -= moveY;

          // Exchange velocities (simplified)
          const tempVx = bubble.vx;
          const tempVy = bubble.vy;
          bubble.vx = otherBubble.vx * 0.8;
          bubble.vy = otherBubble.vy * 0.8;
          otherBubble.vx = tempVx * 0.8;
          otherBubble.vy = tempVy * 0.8;

          updateBubblePosition(otherBubble);
        }
      }

      updateBubblePosition(bubble);
    }
  }

  function findClosestTextEdge(x1, y1, x2, y2) {
    // Find which edge of text element the bubble is closest to
    for (const textElement of textElements) {
      if (
        (x1 < textElement.left && x2 >= textElement.left) ||
        (x1 > textElement.right && x2 <= textElement.right) ||
        (y1 < textElement.top && y2 >= textElement.top) ||
        (y1 > textElement.bottom && y2 <= textElement.bottom)
      ) {
        // Calculate distances to each edge
        const distToLeft = Math.abs(x1 - textElement.left);
        const distToRight = Math.abs(x1 - textElement.right);
        const distToTop = Math.abs(y1 - textElement.top);
        const distToBottom = Math.abs(y1 - textElement.bottom);

        // Find minimum distance
        const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);

        if (minDist === distToLeft) return 'left';
        if (minDist === distToRight) return 'right';
        if (minDist === distToTop) return 'top';
        if (minDist === distToBottom) return 'bottom';
      }
    }

    return null;
  }

  function updateBubblePosition(bubble) {
    bubble.element.style.left = `${bubble.x}px`;
    bubble.element.style.top = `${bubble.y}px`;

    // Apply any rotation changes
    if (bubble.rotation !== undefined) {
      bubble.element.style.transform = `rotate(${bubble.rotation}deg)`;
    }
  }

  function burstBubble(bubble, index) {
    // Add burst animation class
    bubble.element.classList.add('burst');

    // Remove bubble after animation completes
    setTimeout(() => {
      if (bubble.element.parentNode) {
        bubble.element.parentNode.removeChild(bubble.element);
      }
    }, 300);

    // Remove from bubbles array
    bubbles.splice(index, 1);

    // Create a new bubble
    setTimeout(() => {
      const newBubble = createBubble(getRandomPosition());

      // Make surrounding bubbles move away
      const burstRadius = BUBBLE_SIZE * 3;
      bubbles.forEach(otherBubble => {
        const dx = otherBubble.x - newBubble.x;
        const dy = otherBubble.y - newBubble.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < burstRadius) {
          const angle = Math.atan2(dy, dx);
          const strength = (burstRadius - distance) / burstRadius;

          otherBubble.vx += Math.cos(angle) * strength * 2;
          otherBubble.vy += Math.sin(angle) * strength * 2;

          // Add slight rotation on collision
          otherBubble.rotation = (otherBubble.rotation || 0) + (Math.random() * 10 - 5);
          updateBubblePosition(otherBubble);
        }
      });
    }, 400);
  }

  // New function to apply floating effect
  function applyFloatingEffect(bubble) {
    // If this is the first time applying floating, store current position as original
    if (bubble.originalX === undefined) {
      bubble.originalX = bubble.x;
      bubble.originalY = bubble.y;
      bubble.phaseOffsetX = Math.random() * Math.PI * 2;
      bubble.phaseOffsetY = Math.random() * Math.PI * 2;
    }

    // Calculate floating offsets using sine waves
    const floatX = Math.sin((animationTime * FLOAT_FREQUENCY) + bubble.phaseOffsetX) * FLOAT_AMPLITUDE;
    const floatY = Math.sin((animationTime * FLOAT_FREQUENCY) + bubble.phaseOffsetY + FLOAT_PHASE_DIFF) * FLOAT_AMPLITUDE;

    // Apply floating movement
    bubble.x += floatX - (bubble.lastFloatX || 0);
    bubble.y += floatY - (bubble.lastFloatY || 0);

    // Store last float values for next frame
    bubble.lastFloatX = floatX;
    bubble.lastFloatY = floatY;

    // Add very slight random rotation for water-like bobbing
    // Adjusted rotation amount for new bubble size
    bubble.rotation = (bubble.rotation || 0) + (Math.sin((animationTime * FLOAT_FREQUENCY * 0.5) + bubble.phaseOffsetX) * 0.18);
  }
})();
