document.addEventListener('DOMContentLoaded', () => {

  // Menu
  const brushes = document.querySelector('.brushes');
  const inkPenButton = document.querySelector('.ink-pen');
  const paintBrushButton = document.querySelector('.paint-brush');
  const pencilButton = document.querySelector('.pencil');
  const soapButton = document.querySelector('.soap');
  const fillBucketButton = document.querySelector('.fill-bucket');
  const effects = document.querySelector('.effects');
  const rainbowButton = document.querySelector('.rainbow');
  const screenButton = document.querySelector('.screen');
  const multiplyButton = document.querySelector('.multiply');
  const color = document.querySelector('.color-pick');
  const clearButton = document.querySelector('.clear');

  // Canvas
  const radialCursor = document.querySelector('.radial-cursor');
  const canvas = document.querySelector('.responsive-canvas');
  const heightRatio = 1.5;
  const ctx = canvas.getContext('2d');

  // Booleans
  let isPainting = false;
  let inkPen = true;
  let paintBrush = false;
  let pencil = false;
  let soap = false;
  let fillBucket = false;
  let rainbow = false;
  let screen = false;
  let multiply = false;

  // For offsetX and offsetY in paint function
  let lastX = 0;
  let lastY = 0;

  // For hsl value in rainbow effect
  let hue = 0;

  // Default brushsize
  let lineWidth = 26;

  // For paint brush effect
  let lineDirection = true;

  // Addressing the mouse position for radialCursor
  let mousePosX = 0;
  let mousePosY = 0;
  let delay = 1;
  let revisedMousePosX = 0;
  let revisedMousePosY = 0;

  // Default settings from page load
  canvas.width = window.innerWidth - 112; // keeps margin
  canvas.height = window.innerHeight - 34;
  // canvas.width = window.innerWidth;
  // canvas.height = canvas.width * heightRatio;

  ctx.strokeStyle = color.value;
  ctx.lineWidth = 26;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.globalCompositeOperation = 'source-over'; // default

  inkPenButton.style.background = '#0d6efd';

  // If window is resized, canvas is resized
  function windowResize() {
    canvas.width = window.innerWidth - 112; // keeps margin
    canvas.height = window.innerHeight - 34;
  }

  window.addEventListener("resize", windowResize);
  
  // Tracking mouse position for radialCursor
  document.onmousemove = (e) => {
    mousePosX = e.pageX;
    mousePosY = e.pageY;
    // Make radialCursor disappear outside of canvas
    if (mousePosX < 95 || mousePosY < 8) {
      radialCursor.style.opacity = 0;
    } else {
      radialCursor.style.opacity = 1;
    }
  }

  // radialCursor (circle) to follow cursor  
  function mouseFollow() {
    requestAnimationFrame(mouseFollow);

    revisedMousePosX += (mousePosX - revisedMousePosX) / delay;
    revisedMousePosY += (mousePosY - revisedMousePosY) / delay; 

    radialCursor.style.top = `${revisedMousePosY}px`;
    radialCursor.style.left = `${revisedMousePosX}px`;
  }
  mouseFollow();

  // Changing the radialCursor to match the lineWidth
  function changeCursorSize() {
    radialCursor.style.width = `${lineWidth}px`;
    radialCursor.style.height = `${lineWidth}px`;
    radialCursor.style.marginTop = `${-(lineWidth / 2)}px`;
    radialCursor.style.marginLeft = `${-(lineWidth / 2)}px`;
  }

  // Adjust size of mark 
  // Increments of 2 feels more natural
  document.addEventListener('keydown', (e) => {
    if (e.code == 'BracketLeft') {
      if (lineWidth > 2) {
        lineWidth = lineWidth - 2;
        changeCursorSize();
      }
    } else if (e.code == 'BracketRight') {
      if (lineWidth < 100) {
        lineWidth = lineWidth + 2;
        changeCursorSize();
      }
    }
  });

  // Mark marking function 
  function paint(e) {
    if (!isPainting) return; 
    // Brushes
    // If paintBrushButton is clicked, brushstroke will vary in size
    if (paintBrush == true) {
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
      [lastX, lastY] = [e.offsetX, e.offsetY];
      if (ctx.lineWidth >= lineWidth || ctx.lineWidth <= 2) {
        lineDirection = !lineDirection;
      }
      if(lineDirection) {
        ctx.lineWidth++;
      } else {
        ctx.lineWidth--;
      }
    } else if (pencil == true) {
      // If pencil is clicked, brushstroke will have scratchy effect
      ctx.lineJoin = 'butt';
      ctx.lineCap = 'butt';
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
      [lastX, lastY] = [e.offsetX, e.offsetY];
    } else {
      // If inkPenButton is clicked, brushstroke is solid (Also Default Setting)
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
      [lastX, lastY] = [e.offsetX, e.offsetY];
    }

    // If soap is clicked, globalCompositeOperation is reset so that content
    // drawn on canvas is removed under brushstroke
    if (soap == true) {
      ctx.globalCompositeOperation = 'destination-out'; // erase
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
      [lastX, lastY] = [e.offsetX, e.offsetY];
    } else {
      ctx.globalCompositeOperation = 'source-over'; // default
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
      [lastX, lastY] = [e.offsetX, e.offsetY];
    }

    // Effects
    // If rainbowButton is clicked, brushstroke will cycle through colors
    if (rainbow == true) {
      // Calling from hue, which is set to 0 (red)
      ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
      // Increase hue value, reset at 360
      hue++;
      if (hue >= 360) {
        hue = 0;
      }    
    } else {
      ctx.strokeStyle = color.value;
    }

    // If screenButton is clicked, overlapping brushstroke will invert, multiply, and invert again
    if (screen == true) {
      ctx.globalCompositeOperation = 'screen'; 
    }

    // If multiplyButton is clicked, overlapping brushstroke layer will multiply with bottom layer
    if (multiply == true) {
      ctx.globalCompositeOperation = 'multiply'; 
    }
  }

  // Event Listeners for canvas
  canvas.addEventListener('mousedown', (e) => {

    // Checking to see is user wants to fill canvas background color first
    if (fillBucket == true) {
      canvas.style.background = color.value;
    // If not, proceed with mark marking
    } else {
      isPainting = true;
      [lastX, lastY] = [e.offsetX, e.offsetY];
    }
  });

  canvas.addEventListener('mousemove', paint);
  canvas.addEventListener('mouseup', () => isPainting = false);
  canvas.addEventListener('mouseout', () => isPainting = false);

  // Event Listeners for buttons
  // Solid ink pen effect
  inkPenButton.addEventListener('click', () => {
    inkPen = !inkPen; // Toggle boolean value and set other booleans to false except effects
    [paintBrush, pencil, soap, fillBucket] = [false, false, false, false];

    // Show user if inkPen is set to true
    if (inkPen == true) {
      for (let i = 0; i < brushes.children.length; i++) {
        brushes.children[i].style.background = 'none';
      }
      inkPenButton.style.background = '#0d6efd'; 
    } else {
      inkPenButton.style.background = '#0d6efd';
      inkPen = true;
    }
  });

  // Paint brushstroke effect 
  paintBrushButton.addEventListener('click', () => {
    paintBrush = !paintBrush; // Toggle boolean value and set other booleans to false except effects
    [inkPen, pencil, soap, fillBucket] = [false, false, false, false];

    // Show user if paintBrush is set to true
    if (paintBrush == true) {
      for (let i = 0; i < brushes.children.length; i++) {
        brushes.children[i].style.background = 'none';
      }
      paintBrushButton.style.background = '#0d6efd'; 
    } else {
      paintBrushButton.style.background = 'none';
      inkPenButton.style.background = '#0d6efd';
      inkPen = true;
    }
  });

  // Pencil brushstroke effect
  pencilButton.addEventListener('click', () => {
    pencil = !pencil; // Toggle boolean value and set other booleans to false except effects
    [inkPen, paintBrush, soap, fillBucket] = [false, false, false, false];

    // Show user if pencil is set to true
    if (pencil == true) {
      for (let i = 0; i < brushes.children.length; i++) {
        brushes.children[i].style.background = 'none';
      }
      pencilButton.style.background = '#0d6efd'; 
    } else {
      pencilButton.style.background = 'none';
      inkPenButton.style.background = '#0d6efd';
      inkPen = true;
    }
  });

  // Soap undo/erase effect
  soapButton.addEventListener('click', () => {
    soap = !soap; // Toggle boolean value and set all other booleans to false
    [inkPen, paintBrush, pencil, fillBucket, rainbow, screen, multiply] = [false, false, false, false, false, false, false];

    // Show user if soap is set to true
    if (soap == true) {
      for (let i = 0; i < brushes.children.length; i++) {
        brushes.children[i].style.background = 'none';
      }
      for (let i = 0; i < effects.children.length; i++) {
        effects.children[i].style.background = 'none';
      }
      soapButton.style.background = '#0d6efd';
    } else {
      soapButton.style.background = 'none';
      inkPenButton.style.background = '#0d6efd';
      inkPen = true;
    }
  });

  // Fill background
  fillBucketButton.addEventListener('click', () => {
    fillBucket = !fillBucket; // Toggle boolean value and set all other booleans to false
    [inkPen, paintBrush, pencil, soap, rainbow, screen, multiply] = [false, false, false, false, false, false, false];

    // Show user if fillBucket is set to true
    if (fillBucket == true) {
      for (let i = 0; i < brushes.children.length; i++) {
        brushes.children[i].style.background = 'none';
      }
      for (let i = 0; i < effects.children.length; i++) {
        effects.children[i].style.background = 'none';
      }
      fillBucketButton.style.background = '#0d6efd';
    } else {
      fillBucketButton.style.background = 'none';
      inkPenButton.style.background = '#0d6efd';
      inkPen = true;
    }
  });

  // Rainbow effect
  rainbowButton.addEventListener('click', () => {
    rainbow = !rainbow; // Toggle boolean value
    [soap, fillBucket] = [false, false];

    // Show user if rainbowButton is set to true
    if (rainbow == true) {
      rainbowButton.style.background = '#0d6efd';
      soapButton.style.background = 'none';
      fillBucketButton.style.background = 'none';
    } else {
      rainbowButton.style.background = 'none';
    }
  });

  if (rainbow == true && inkPen == false) {
    console.log('okay then');
  }

  // Screen effect
  screenButton.addEventListener('click', () => {
    screen = !screen; // Toggle boolean value
    [soap, fillbucket, multiply] = [false, false, false];

    // Show user if screenButton is set to true
    if (screen == true) {
      screenButton.style.background = '#0d6efd';
      multiplyButton.style.background = 'none';
      soapButton.style.background = 'none';
      fillBucketButton.style.background = 'none';
    } else {
      screenButton.style.background = 'none';
    }
  });

  // Multiply effect
  multiplyButton.addEventListener('click', () => {
    multiply = !multiply; // Toggle boolean value
    [soap, fillBucket, screen] = [false, false, false];

    // Show user if screenButton is set to true
    if (multiply == true) {
      multiplyButton.style.background = '#0d6efd';
      screenButton.style.background = 'none';
      soapButton.style.background = 'none';
      fillBucketButton.style.background = 'none';
    } else {
      multiplyButton.style.background = 'none';
    }
  });

  // Clear canavas
  clearButton.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.background = '';
  });
});
