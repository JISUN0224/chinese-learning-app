import React, { useRef, useState, useEffect } from 'react';
import './WritingPractice.css';

function WritingPractice({ character }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // 초기화
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 가이드 한자 그리기 (희미하게)
    ctx.font = '200px sans-serif';
    ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(character, canvas.width / 2, canvas.height / 2);
    
    // 테두리 추가
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
  }, [character]);
  
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    
    setIsDrawing(true);
    setLastPos({ x, y });
  };
  
  const draw = (e) => {
    if (!isDrawing || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    setLastPos({ x, y });
  };
  
  const endDrawing = () => {
    setIsDrawing(false);
  };
  
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // 초기화
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 가이드 한자 다시 그리기
    ctx.font = '200px sans-serif';
    ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(character, canvas.width / 2, canvas.height / 2);
    
    // 테두리 추가
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
  };
  
  return (
    <div className="writing-practice">
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={endDrawing}
        className="writing-canvas"
      />
      <div className="writing-controls">
        <button onClick={clearCanvas} className="clear-button">지우기</button>
      </div>
    </div>
  );
}

export default WritingPractice;