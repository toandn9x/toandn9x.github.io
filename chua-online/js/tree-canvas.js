// ============================================
// VIẾNG CHÙA ONLINE - Animated Bodhi Tree Canvas
// ============================================

class AnimatedBodhiTree {
  constructor(canvasId, onComplete) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this.onComplete = onComplete;
    
    this.branches = [];
    this.leaves = [];
    this.branchTips = []; // Store tip coordinates to hang wishes
    
    this.isAnimating = false;
    this.progress = 0;
    
    this.resize();
    window.addEventListener('resize', () => {
      this.resize();
      if (this.progress >= 1) {
        this.drawFullTree();
      }
    });
  }
  
  resize() {
    const parent = this.canvas.parentElement;
    this.canvas.width = parent.clientWidth;
    this.canvas.height = parent.clientHeight || 500;
    this.generateTreeStructure();
  }
  
  generateTreeStructure() {
    this.branches = [];
    this.leaves = [];
    this.branchTips = [];
    
    const startX = this.canvas.width / 2;
    const startY = this.canvas.height;
    
    // Initial trunk: shorter for more canopy space
    const initialLength = this.canvas.height * 0.25; 
    const initialThickness = 24;
    
    // Recursive generation
    this.addBranch(startX, startY, -Math.PI / 2, initialLength, initialThickness, 0, 0);
  }
  
  // depth: current depth, startProgress: when this branch starts growing (0 to 1)
  addBranch(x, y, angle, len, thickness, depth, startProgress) {
    const maxDepth = 7;
    
    // The growth duration of this branch relative to global progress
    const duration = 0.15; 
    const endProgress = startProgress + duration;
    
    const endX = x + Math.cos(angle) * len;
    const endY = y + Math.sin(angle) * len;
    
    const branch = {
      startX: x, startY: y,
      endX, endY,
      len, thickness, angle,
      depth, startProgress, endProgress,
      isTip: depth === maxDepth
    };
    
    this.branches.push(branch);
    
    if (depth < maxDepth) {
      // Create 2 to 3 branches
      const numBranches = (Math.random() > 0.3 || depth < 2) ? 2 : 3;
      
      for (let i = 0; i < numBranches; i++) {
        // Spread angle: tighter at bottom, wider at top
        const spread = (Math.PI / 3) + (depth * 0.1); 
        let newAngle = angle - spread / 2 + (spread / (numBranches - 1)) * i;
        
        // Add some random variation
        newAngle += (Math.random() - 0.5) * 0.2;
        
        const newLen = len * (0.7 + Math.random() * 0.15);
        const newThickness = thickness * 0.65;
        
        this.addBranch(endX, endY, newAngle, newLen, newThickness, depth + 1, startProgress + duration * 0.8);
      }
    } else {
      // Store tips for ribbons
      this.branchTips.push({ x: endX, y: endY });
      
      // Generate leaves around the tip
      for (let i = 0; i < 6; i++) {
        this.leaves.push({
          x: endX + (Math.random() - 0.5) * 60,
          y: endY + (Math.random() - 0.5) * 60,
          size: 8 + Math.random() * 10,
          angle: Math.random() * Math.PI * 2,
          startProgress: endProgress,
          color: (Math.random() > 0.5) ? '#D4AF37' : '#B8960C' // Golden bodhi leaves
        });
      }
    }
  }
  
  startAnimation() {
    this.isAnimating = true;
    this.progress = 0;
    this.lastTime = performance.now();
    this.animate();
  }
  
  animate(currentTime = performance.now()) {
    if (!this.isAnimating) return;
    
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    // Complete tree growth over ~4 seconds
    this.progress += deltaTime / 4000; 
    
    this.drawCurrentState();
    
    if (this.progress < 1) {
      requestAnimationFrame((time) => this.animate(time));
    } else {
      this.progress = 1;
      this.isAnimating = false;
      this.drawFullTree();
      
      if (this.onComplete) {
        this.onComplete(this.branchTips);
      }
    }
  }
  
  drawCurrentState() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw branches
    this.branches.forEach(b => {
      if (this.progress > b.startProgress) {
        // Calculate partial length
        const branchProgress = Math.min(1, (this.progress - b.startProgress) / (b.endProgress - b.startProgress));
        // Easing out
        const easeAmount = 1 - Math.pow(1 - branchProgress, 3);
        
        const currentX = b.startX + (b.endX - b.startX) * easeAmount;
        const currentY = b.startY + (b.endY - b.startY) * easeAmount;
        
        this.ctx.beginPath();
        this.ctx.moveTo(b.startX, b.startY);
        this.ctx.lineTo(currentX, currentY);
        
        // Wood color gradient based on height/depth
        const woodColor = `rgba(${61 + b.depth * 5}, ${31 + b.depth * 2}, 9, 1)`; // #3D1F09 variations
        this.ctx.strokeStyle = woodColor;
        this.ctx.lineWidth = Math.max(0.5, b.thickness);
        this.ctx.lineCap = 'round';
        this.ctx.stroke();
      }
    });
    
    // Draw leaves
    this.leaves.forEach(l => {
      if (this.progress > l.startProgress) {
        const leafProgress = Math.min(1, (this.progress - l.startProgress) / 0.1);
        if (leafProgress > 0) {
          this.drawLeaf(l.x, l.y, l.size * leafProgress, l.angle, l.color);
        }
      }
    });
  }
  
  drawFullTree() {
    this.progress = 1;
    this.drawCurrentState();
  }
  
  drawLeaf(x, y, size, angle, color) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(angle);
    
    this.ctx.beginPath();
    // Bodhi leaf shape approximation
    this.ctx.moveTo(0, -size);
    this.ctx.bezierCurveTo(size, -size/2, size, size/2, 0, size);
    this.ctx.bezierCurveTo(-size, size/2, -size, -size/2, 0, -size);
    
    this.ctx.fillStyle = color;
    this.ctx.fill();
    
    // Leaf vein
    this.ctx.beginPath();
    this.ctx.moveTo(0, -size);
    this.ctx.lineTo(0, size*0.8);
    this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    this.ctx.lineWidth = size * 0.05;
    this.ctx.stroke();
    
    this.ctx.restore();
  }
}

window.AnimatedBodhiTree = AnimatedBodhiTree;
