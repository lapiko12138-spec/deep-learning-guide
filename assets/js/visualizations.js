(function () {
  function escapeHTML(value) {
    return window.DLComponents.escapeHTML(value);
  }

  function icon(name) {
    return window.DLComponents.icon(name);
  }

  function setupCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(320, Math.floor(rect.width));
    const height = Math.max(220, Math.floor(rect.height));
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, width, height };
  }

  function clear(ctx, width, height) {
    const styles = getComputedStyle(document.documentElement);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = styles.getPropertyValue('--canvas-bg').trim() || '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }

  function axis(ctx, cx, cy, scale, width, height) {
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--line-strong').trim();
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(24, cy);
    ctx.lineTo(width - 24, cy);
    ctx.moveTo(cx, 24);
    ctx.lineTo(cx, height - 24);
    ctx.stroke();
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--line').trim();
    for (let i = -4; i <= 4; i += 1) {
      ctx.beginPath();
      ctx.moveTo(cx + i * scale, 24);
      ctx.lineTo(cx + i * scale, height - 24);
      ctx.moveTo(24, cy + i * scale);
      ctx.lineTo(width - 24, cy + i * scale);
      ctx.stroke();
    }
  }

  function drawArrow(ctx, x1, y1, x2, y2, color, label) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 10 * Math.cos(angle - Math.PI / 6), y2 - 10 * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - 10 * Math.cos(angle + Math.PI / 6), y2 - 10 * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    if (label) {
      ctx.font = '12px ui-sans-serif, system-ui';
      ctx.fillText(label, x2 + 8, y2 - 8);
    }
  }

  function renderLinearAlgebra(root) {
    root.innerHTML = `
      <div class="viz-grid">
        <div class="viz-card">
          <div class="viz-title">
            <div>
              <h3>矩阵变换：旋转 + 缩放</h3>
              <p>对应原书 2.2：把 \\(Ax\\) 看成向量在空间中的移动。</p>
            </div>
          </div>
          <canvas class="viz-canvas" id="vector-canvas"></canvas>
          <div class="control-row">
            <label>旋转 <input id="vector-angle" type="range" min="-90" max="90" value="32"></label>
            <label>缩放 <input id="vector-scale" type="range" min="60" max="160" value="118"></label>
          </div>
          <p class="viz-caption" id="vector-caption"></p>
        </div>
        <div class="viz-card">
          <div class="viz-title">
            <div>
              <h3>PCA 投影轴</h3>
              <p>对应原书 2.12：寻找让投影方差最大的方向。</p>
            </div>
          </div>
          <canvas class="viz-canvas" id="pca-canvas"></canvas>
          <div class="control-row">
            <label>投影角度 <input id="pca-angle" type="range" min="0" max="180" value="28"></label>
          </div>
          <p class="viz-caption" id="pca-caption"></p>
        </div>
      </div>
    `;

    const vectorCanvas = root.querySelector('#vector-canvas');
    const angleInput = root.querySelector('#vector-angle');
    const scaleInput = root.querySelector('#vector-scale');
    const vectorCaption = root.querySelector('#vector-caption');
    const pcaCanvas = root.querySelector('#pca-canvas');
    const pcaAngle = root.querySelector('#pca-angle');
    const pcaCaption = root.querySelector('#pca-caption');
    const points = Array.from({ length: 42 }, (_, i) => {
      const t = (i - 21) / 7;
      return { x: t + Math.sin(i * 1.7) * 0.22, y: 0.55 * t + Math.cos(i * 1.3) * 0.42 };
    });

    function drawVector() {
      const { ctx, width, height } = setupCanvas(vectorCanvas);
      clear(ctx, width, height);
      const cx = width / 2;
      const cy = height / 2;
      const unit = Math.min(width, height) / 8;
      axis(ctx, cx, cy, unit, width, height);
      const angle = Number(angleInput.value) * Math.PI / 180;
      const s = Number(scaleInput.value) / 100;
      const x = { x: 1.7, y: 1.1 };
      const out = {
        x: s * (Math.cos(angle) * x.x - Math.sin(angle) * x.y),
        y: s * (Math.sin(angle) * x.x + Math.cos(angle) * x.y)
      };
      drawArrow(ctx, cx, cy, cx + x.x * unit, cy - x.y * unit, '#6b7280', 'x');
      drawArrow(ctx, cx, cy, cx + out.x * unit, cy - out.y * unit, '#2563eb', 'Ax');
      vectorCaption.textContent = `当前矩阵近似为旋转 ${angleInput.value} 度并缩放 ${scaleInput.value}%。矩阵乘法不是“表格乘表格”，而是改变向量所在空间。`;
    }

    function drawPca() {
      const { ctx, width, height } = setupCanvas(pcaCanvas);
      clear(ctx, width, height);
      const cx = width / 2;
      const cy = height / 2;
      const unit = Math.min(width, height) / 7;
      axis(ctx, cx, cy, unit, width, height);
      ctx.fillStyle = '#2563eb';
      points.forEach((point) => {
        ctx.beginPath();
        ctx.arc(cx + point.x * unit, cy - point.y * unit, 3.2, 0, Math.PI * 2);
        ctx.fill();
      });
      const theta = Number(pcaAngle.value) * Math.PI / 180;
      const ux = Math.cos(theta);
      const uy = Math.sin(theta);
      drawArrow(ctx, cx - ux * unit * 3, cy + uy * unit * 3, cx + ux * unit * 3, cy - uy * unit * 3, '#10b981', 'w');
      ctx.fillStyle = 'rgba(16, 185, 129, .42)';
      let variance = 0;
      points.forEach((point) => {
        const projection = point.x * ux + point.y * uy;
        variance += projection * projection;
        ctx.beginPath();
        ctx.arc(cx + projection * ux * unit, cy - projection * uy * unit, 2.4, 0, Math.PI * 2);
        ctx.fill();
      });
      variance /= points.length;
      pcaCaption.textContent = `投影方差约为 ${variance.toFixed(2)}。PCA 会选择让这个数最大的正交方向。`;
    }

    [angleInput, scaleInput].forEach((input) => input.addEventListener('input', drawVector));
    pcaAngle.addEventListener('input', drawPca);
    window.addEventListener('resize', () => { drawVector(); drawPca(); }, { passive: true });
    drawVector();
    drawPca();
  }

  function renderBayes(root) {
    root.innerHTML = `
      <div class="viz-grid">
        <div class="viz-card">
          <h3>贝叶斯后验调节器</h3>
          <p>对应原书 3.11：后验由先验、似然和证据共同决定。</p>
          <canvas class="viz-canvas" id="bayes-canvas"></canvas>
          <div class="control-row stacked">
            <label>先验 P(病) <input id="prior" type="range" min="1" max="80" value="10"></label>
            <label>敏感度 P(阳性|病) <input id="sensitivity" type="range" min="50" max="99" value="90"></label>
            <label>假阳性 P(阳性|无病) <input id="false-positive" type="range" min="1" max="50" value="10"></label>
          </div>
          <p class="viz-caption" id="bayes-caption"></p>
        </div>
      </div>
    `;
    const canvas = root.querySelector('#bayes-canvas');
    const prior = root.querySelector('#prior');
    const sensitivity = root.querySelector('#sensitivity');
    const falsePositive = root.querySelector('#false-positive');
    const caption = root.querySelector('#bayes-caption');

    function draw() {
      const p = Number(prior.value) / 100;
      const s = Number(sensitivity.value) / 100;
      const f = Number(falsePositive.value) / 100;
      const evidence = s * p + f * (1 - p);
      const posterior = (s * p) / evidence;
      const { ctx, width, height } = setupCanvas(canvas);
      clear(ctx, width, height);
      const bars = [
        ['先验', p, '#94a3b8'],
        ['似然', s, '#2563eb'],
        ['假阳性', f, '#f59e0b'],
        ['后验', posterior, '#10b981']
      ];
      const gap = 18;
      const barWidth = (width - 80 - gap * (bars.length - 1)) / bars.length;
      bars.forEach(([label, value, color], index) => {
        const x = 40 + index * (barWidth + gap);
        const h = value * (height - 84);
        ctx.fillStyle = color;
        ctx.fillRect(x, height - 44 - h, barWidth, h);
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text').trim();
        ctx.font = '12px ui-sans-serif, system-ui';
        ctx.fillText(label, x, height - 20);
        ctx.fillText(`${Math.round(value * 100)}%`, x, height - 50 - h);
      });
      caption.textContent = `阳性后的后验概率 P(病|阳性) = ${Math.round(posterior * 100)}%。低先验场景下，即使测试很敏感，假阳性也会显著影响结论。`;
    }

    [prior, sensitivity, falsePositive].forEach((input) => input.addEventListener('input', draw));
    window.addEventListener('resize', draw, { passive: true });
    draw();
  }

  function renderGradient(root) {
    root.innerHTML = `
      <div class="viz-grid">
        <div class="viz-card">
          <h3>梯度下降轨迹</h3>
          <p>对应原书 4.3 / 8.3：学习率决定每步沿负梯度走多远。</p>
          <canvas class="viz-canvas" id="gradient-canvas"></canvas>
          <div class="control-row">
            <label>学习率 <input id="lr" type="range" min="2" max="35" value="12"></label>
            <button class="button ghost small" id="gd-step">${icon('step-forward')}单步</button>
            <button class="button ghost small" id="gd-play">${icon('play')}播放</button>
            <button class="button ghost small" id="gd-reset">${icon('rotate-ccw')}重置</button>
          </div>
          <p class="viz-caption" id="gd-caption"></p>
        </div>
      </div>
    `;
    const canvas = root.querySelector('#gradient-canvas');
    const lr = root.querySelector('#lr');
    const stepButton = root.querySelector('#gd-step');
    const playButton = root.querySelector('#gd-play');
    const resetButton = root.querySelector('#gd-reset');
    const caption = root.querySelector('#gd-caption');
    let x = -2.7;
    let timer = null;
    const path = [];
    const loss = (v) => 0.25 * (v * v) + 0.12 * Math.sin(4 * v) + 0.35;
    const grad = (v) => 0.5 * v + 0.48 * Math.cos(4 * v);

    function draw() {
      const { ctx, width, height } = setupCanvas(canvas);
      clear(ctx, width, height);
      const left = 34;
      const bottom = height - 36;
      const plotW = width - 68;
      const plotH = height - 74;
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= 220; i += 1) {
        const xv = -3.2 + 6.4 * (i / 220);
        const yv = loss(xv);
        const px = left + (xv + 3.2) / 6.4 * plotW;
        const py = bottom - yv / 3 * plotH;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.strokeStyle = 'rgba(16, 185, 129, .5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      path.forEach((point, index) => {
        const px = left + (point + 3.2) / 6.4 * plotW;
        const py = bottom - loss(point) / 3 * plotH;
        if (index === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      const px = left + (x + 3.2) / 6.4 * plotW;
      const py = bottom - loss(x) / 3 * plotH;
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
      caption.textContent = `当前位置 x=${x.toFixed(2)}，梯度=${grad(x).toFixed(2)}，损失=${loss(x).toFixed(2)}。学习率过大时会越过低点甚至震荡。`;
    }

    function step() {
      path.push(x);
      x -= Number(lr.value) / 100 * grad(x);
      draw();
    }

    stepButton.addEventListener('click', step);
    playButton.addEventListener('click', () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
        playButton.innerHTML = `${icon('play')}播放`;
      } else {
        timer = setInterval(step, 420);
        playButton.innerHTML = `${icon('pause')}暂停`;
        if (window.lucide) window.lucide.createIcons();
      }
    });
    resetButton.addEventListener('click', () => {
      x = -2.7;
      path.length = 0;
      draw();
    });
    lr.addEventListener('input', draw);
    window.addEventListener('resize', draw, { passive: true });
    draw();
  }

  function renderNetwork(root) {
    root.innerHTML = `
      <div class="viz-grid">
        <div class="viz-card">
          <h3>前向传播与激活</h3>
          <p>对应原书 6.2-6.5：线性变换、非线性激活和链式求导共同构成训练。</p>
          <canvas class="viz-canvas" id="network-canvas"></canvas>
          <div class="control-row">
            <label>x1 <input id="x1" type="range" min="-100" max="100" value="70"></label>
            <label>x2 <input id="x2" type="range" min="-100" max="100" value="-40"></label>
          </div>
          <p class="viz-caption" id="network-caption"></p>
        </div>
      </div>
    `;
    const canvas = root.querySelector('#network-canvas');
    const x1Input = root.querySelector('#x1');
    const x2Input = root.querySelector('#x2');
    const caption = root.querySelector('#network-caption');
    const weights = [
      [1.1, -0.7],
      [-0.9, 1.2],
      [0.6, 0.8]
    ];
    const outWeights = [0.7, -0.5, 1.0];
    const relu = (v) => Math.max(0, v);

    function draw() {
      const x1 = Number(x1Input.value) / 100;
      const x2 = Number(x2Input.value) / 100;
      const hidden = weights.map(([a, b]) => relu(a * x1 + b * x2));
      const y = hidden.reduce((sum, h, index) => sum + h * outWeights[index], 0);
      const { ctx, width, height } = setupCanvas(canvas);
      clear(ctx, width, height);
      const layers = [
        [{ label: 'x1', v: x1 }, { label: 'x2', v: x2 }],
        hidden.map((v, i) => ({ label: `h${i + 1}`, v })),
        [{ label: 'y', v: y }]
      ];
      const xs = [70, width / 2, width - 70];
      const ys = [
        [height / 2 - 44, height / 2 + 44],
        [height / 2 - 70, height / 2, height / 2 + 70],
        [height / 2]
      ];
      ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--line-strong').trim();
      ctx.lineWidth = 1.2;
      ys[0].forEach((y0) => ys[1].forEach((y1) => {
        ctx.beginPath();
        ctx.moveTo(xs[0] + 18, y0);
        ctx.lineTo(xs[1] - 18, y1);
        ctx.stroke();
      }));
      ys[1].forEach((y1) => {
        ctx.beginPath();
        ctx.moveTo(xs[1] + 18, y1);
        ctx.lineTo(xs[2] - 18, ys[2][0]);
        ctx.stroke();
      });
      layers.forEach((layer, li) => {
        layer.forEach((node, ni) => {
          const radius = 18 + Math.min(12, Math.abs(node.v) * 8);
          ctx.fillStyle = node.v >= 0 ? '#2563eb' : '#f59e0b';
          ctx.globalAlpha = 0.82;
          ctx.beginPath();
          ctx.arc(xs[li], ys[li][ni], radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.fillStyle = '#ffffff';
          ctx.font = '12px ui-sans-serif, system-ui';
          ctx.textAlign = 'center';
          ctx.fillText(node.label, xs[li], ys[li][ni] + 4);
        });
      });
      caption.textContent = `隐藏层激活为 [${hidden.map((v) => v.toFixed(2)).join(', ')}]，输出约 ${y.toFixed(2)}。ReLU 会截断负信号，让网络产生分段线性决策。`;
    }

    [x1Input, x2Input].forEach((input) => input.addEventListener('input', draw));
    window.addEventListener('resize', draw, { passive: true });
    draw();
  }

  function renderCnn(root) {
    root.innerHTML = `
      <div class="viz-grid">
        <div class="viz-card">
          <h3>卷积窗口滑动</h3>
          <p>对应原书 9.1-9.3：同一个核在不同位置共享参数。</p>
          <canvas class="viz-canvas" id="cnn-canvas"></canvas>
          <div class="control-row">
            <button class="button ghost small" id="cnn-step">${icon('step-forward')}下一步</button>
            <button class="button ghost small" id="cnn-play">${icon('play')}播放</button>
          </div>
          <p class="viz-caption" id="cnn-caption"></p>
        </div>
      </div>
    `;
    const canvas = root.querySelector('#cnn-canvas');
    const stepButton = root.querySelector('#cnn-step');
    const playButton = root.querySelector('#cnn-play');
    const caption = root.querySelector('#cnn-caption');
    const input = [
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0]
    ];
    const kernel = [
      [1, 0, -1],
      [1, 0, -1],
      [1, 0, -1]
    ];
    let pos = 0;
    let timer = null;
    function convAt(row, col) {
      let sum = 0;
      for (let i = 0; i < 3; i += 1) {
        for (let j = 0; j < 3; j += 1) sum += input[row + i][col + j] * kernel[i][j];
      }
      return sum;
    }
    function draw() {
      const { ctx, width, height } = setupCanvas(canvas);
      clear(ctx, width, height);
      const cell = Math.min((width - 120) / 8, (height - 80) / 5);
      const startX = 46;
      const startY = 44;
      const row = Math.floor(pos / 3);
      const col = pos % 3;
      input.forEach((line, i) => line.forEach((value, j) => {
        ctx.fillStyle = value ? '#2563eb' : '#eef2f7';
        ctx.fillRect(startX + j * cell, startY + i * cell, cell - 3, cell - 3);
      }));
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.strokeRect(startX + col * cell - 2, startY + row * cell - 2, cell * 3 - 1, cell * 3 - 1);
      const outX = startX + cell * 6.4;
      ctx.font = '12px ui-sans-serif, system-ui';
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--muted').trim();
      ctx.fillText('输出特征图', outX, startY - 14);
      for (let i = 0; i < 3; i += 1) {
        for (let j = 0; j < 3; j += 1) {
          const v = convAt(i, j);
          ctx.fillStyle = i === row && j === col ? '#10b981' : '#dbeafe';
          ctx.fillRect(outX + j * cell, startY + i * cell, cell - 3, cell - 3);
          ctx.fillStyle = i === row && j === col ? '#ffffff' : '#1f2937';
          ctx.textAlign = 'center';
          ctx.fillText(String(v), outX + j * cell + cell / 2 - 2, startY + i * cell + cell / 2 + 4);
        }
      }
      caption.textContent = `窗口位置 (${row + 1}, ${col + 1}) 的卷积响应为 ${convAt(row, col)}。参数共享意味着每个位置使用同一个 3x3 核。`;
    }
    function step() {
      pos = (pos + 1) % 9;
      draw();
    }
    stepButton.addEventListener('click', step);
    playButton.addEventListener('click', () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
        playButton.innerHTML = `${icon('play')}播放`;
      } else {
        timer = setInterval(step, 600);
        playButton.innerHTML = `${icon('pause')}暂停`;
        if (window.lucide) window.lucide.createIcons();
      }
    });
    window.addEventListener('resize', draw, { passive: true });
    draw();
  }

  function renderRnn(root) {
    root.innerHTML = `
      <div class="viz-grid">
        <div class="viz-card">
          <h3>时间展开计算图</h3>
          <p>对应原书 10.1-10.2：同一循环单元在时间上重复使用。</p>
          <canvas class="viz-canvas" id="rnn-canvas"></canvas>
          <div class="control-row">
            <label>时间步 <input id="rnn-step" type="range" min="1" max="6" value="3"></label>
          </div>
          <p class="viz-caption" id="rnn-caption"></p>
        </div>
      </div>
    `;
    const canvas = root.querySelector('#rnn-canvas');
    const stepInput = root.querySelector('#rnn-step');
    const caption = root.querySelector('#rnn-caption');
    function draw() {
      const step = Number(stepInput.value);
      const { ctx, width, height } = setupCanvas(canvas);
      clear(ctx, width, height);
      const gap = (width - 100) / 5;
      const y = height / 2;
      for (let t = 1; t <= 6; t += 1) {
        const x = 50 + (t - 1) * gap;
        ctx.strokeStyle = t <= step ? '#2563eb' : '#cbd5e1';
        ctx.fillStyle = t <= step ? '#dbeafe' : '#f8fafc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x - 24, y - 24, 48, 48, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text').trim();
        ctx.textAlign = 'center';
        ctx.font = '12px ui-sans-serif, system-ui';
        ctx.fillText(`h${t}`, x, y + 4);
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--muted').trim();
        ctx.fillText(`x${t}`, x, y + 52);
        if (t < 6) drawArrow(ctx, x + 28, y, x + gap - 28, y, t < step ? '#2563eb' : '#cbd5e1');
      }
      caption.textContent = `当前展开到 t=${step}。反向传播穿过越多时间步，梯度越容易衰减、爆炸或被截断。`;
    }
    stepInput.addEventListener('input', draw);
    window.addEventListener('resize', draw, { passive: true });
    draw();
  }

  function init(root) {
    const panels = Array.from((root || document).querySelectorAll('[data-viz]'));
    panels.forEach((panel) => {
      const type = panel.dataset.viz;
      if (type === 'linear-algebra') renderLinearAlgebra(panel);
      if (type === 'bayes') renderBayes(panel);
      if (type === 'gradient') renderGradient(panel);
      if (type === 'network') renderNetwork(panel);
      if (type === 'cnn') renderCnn(panel);
      if (type === 'rnn') renderRnn(panel);
      if (window.lucide) window.lucide.createIcons();
    });
  }

  window.DLVisualizations = { init };
})();
