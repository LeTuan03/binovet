"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button, App, Row, Col } from 'antd';
import { RotateLeftOutlined, RotateRightOutlined, ZoomInOutlined, SwapOutlined } from '@ant-design/icons';

interface ImageEditorProps {
  readonly visible: boolean;
  readonly imageUrl: string;
  readonly onSave: (editedImage: Blob) => void;
  readonly onCancel: () => void;
}

export default function ImageEditor({ visible, imageUrl, onSave, onCancel }: ImageEditorProps) {
  const { message: msg } = App.useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const [cropping, setCropping] = useState(false);
  const [cropStart, setCropStart] = useState({ x: 0, y: 0 });
  const [cropEnd, setCropEnd] = useState({ x: 0, y: 0 });
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const clampValue = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

  // Vẽ ảnh lên canvas với các hiệu ứng đã chọn
  const drawImage = (canvas: HTMLCanvasElement, img: HTMLImageElement, crop?: boolean) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const zoomLevel = zoom / 100;
    const displayWidth = img.width * zoomLevel;
    const displayHeight = img.height * zoomLevel;

    canvas.width = displayWidth;
    canvas.height = displayHeight;

    ctx.save();
    ctx.translate(displayWidth / 2, displayHeight / 2);
    ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(img, -displayWidth / 2, -displayHeight / 2, displayWidth, displayHeight);
    ctx.restore();

    if (crop && cropStart.x !== cropEnd.x && cropStart.y !== cropEnd.y) {
      ctx.strokeStyle = 'rgba(255, 107, 53, 0.8)';
      ctx.lineWidth = 2;
      const minX = Math.min(cropStart.x, cropEnd.x);
      const minY = Math.min(cropStart.y, cropEnd.y);
      const width = Math.abs(cropEnd.x - cropStart.x);
      const height = Math.abs(cropEnd.y - cropStart.y);
      ctx.strokeRect(minX, minY, width, height);
    }
  };

  useEffect(() => {
    if (!visible || !imageUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      const canvas = canvasRef.current;
      if (canvas) {
        drawImage(canvas, img, cropping);
      }
    };
    img.src = imageUrl;
  }, [visible, imageUrl]);

  useEffect(() => {
    if (!canvasRef.current || !imageRef.current) return;
    drawImage(canvasRef.current, imageRef.current, cropping);
  }, [zoom, rotation, flipX, flipY, cropping, cropStart, cropEnd]);

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!cropping || e.button !== 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clampValue(e.clientX - rect.left, 0, rect.width);
    const y = clampValue(e.clientY - rect.top, 0, rect.height);
    setCropStart({ x, y });
    setCropEnd({ x, y });
    setIsDragging(true);
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!cropping || !isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clampValue(e.clientX - rect.left, 0, rect.width);
    const y = clampValue(e.clientY - rect.top, 0, rect.height);
    setCropEnd({ x, y });
  };

  const handleCanvasPointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let finalCanvas = canvas;

    // Nếu đang cắt, cắt canvas theo vùng chọn
    if (cropping && cropStart.x !== cropEnd.x && cropStart.y !== cropEnd.y) {
      const minX = Math.min(cropStart.x, cropEnd.x);
      const minY = Math.min(cropStart.y, cropEnd.y);
      const width = Math.abs(cropEnd.x - cropStart.x);
      const height = Math.abs(cropEnd.y - cropStart.y);

      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = width;
      croppedCanvas.height = height;
      const ctx = croppedCanvas.getContext('2d');
      if (ctx && imageRef.current) {
        const img = imageRef.current;
        const zoomLevel = zoom / 100;
        const displayWidth = img.width * zoomLevel;
        const displayHeight = img.height * zoomLevel;

        ctx.save();
        ctx.translate(displayWidth / 2, displayHeight / 2);
        ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(img, -displayWidth / 2 - minX, -displayHeight / 2 - minY, displayWidth, displayHeight);
        ctx.restore();
      }
      finalCanvas = croppedCanvas;
    }

    finalCanvas.toBlob((blob) => {
      if (blob) {
        onSave(blob);
        msg.success('Lưu chỉnh sửa thành công!');
        resetEditor();
      }
    }, 'image/webp', 0.9);
  };

  const resetEditor = () => {
    setZoom(100);
    setRotation(0);
    setFlipX(false);
    setFlipY(false);
    setCropping(false);
    setCropStart({ x: 0, y: 0 });
    setCropEnd({ x: 0, y: 0 });
  };

  const handleCancel = () => {
    resetEditor();
    onCancel();
  };

  return (
    <Modal
      title="Chỉnh sửa ảnh"
      open={visible}
      onCancel={handleCancel}
      width={2000}
      centered
      footer={[
        <Button key="cancel" size='small' onClick={handleCancel}>
          Hủy
        </Button>,
        <Button key="save" type="primary" size='small' onClick={handleSave}>
          Lưu chỉnh sửa
        </Button>,
      ]}
    >
      <div className="space-y-6">
        {/* Canvas */}
        <div
          ref={canvasContainerRef}
          className="border-2 border-gray-200 rounded-lg overflow-auto bg-gray-50 flex items-center justify-center"
          style={{ maxHeight: 'calc(100vh - 340px)', width: '100%' }}
        >
          <canvas
            ref={canvasRef}
            className={`max-w-full max-h-full ${cropping ? 'cursor-crosshair' : 'cursor-default'}`}
            onPointerDown={handleCanvasPointerDown}
            onPointerMove={handleCanvasPointerMove}
            onPointerUp={handleCanvasPointerUp}
            onPointerLeave={handleCanvasPointerUp}
          />
        </div>

        {/* Controls */}

        {/* Action Buttons */}
        <Row gutter={[ 16, 8 ]}>
          <Col xs={12} sm={6}>
            <Button
              block
              icon={<ZoomInOutlined />}
              onClick={() => setZoom(Math.min(zoom + 10, 200))}
              className="rounded-lg"
            >
              Phóng to
            </Button>
          </Col>
          <Col xs={12} sm={6}>
            <Button
              block
              icon={<ZoomInOutlined rotate={180} />}
              onClick={() => setZoom(Math.max(zoom - 10, 50))}
              className="rounded-lg"
            >
              Thu nhỏ
            </Button>
          </Col>
          <Col xs={12} sm={6}>
            <Button
              block
              icon={<RotateLeftOutlined />}
              onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
              className="rounded-lg"
            >
              Xoay trái 90°
            </Button>
          </Col>
          <Col xs={12} sm={6}>
            <Button
              block
              icon={<RotateRightOutlined />}
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="rounded-lg"
            >
              Xoay phải 90°
            </Button>
          </Col>
          <Col xs={12} sm={6}>
            <Button
              block
              icon={<SwapOutlined />}
              onClick={() => setFlipX(!flipX)}
              type={flipX ? 'primary' : 'default'}
              className="rounded-lg"
            >
              Lật ngang
            </Button>
          </Col>
          <Col xs={12} sm={6}>
            <Button
              block
              icon={<SwapOutlined rotate={90} />}
              onClick={() => setFlipY(!flipY)}
              type={flipY ? 'primary' : 'default'}
              className="rounded-lg"
            >
              Lật dọc
            </Button>
          </Col>
          <Col xs={12} sm={6}>
            <Button
              block
              onClick={() => {
                setCropping(!cropping);
                setCropStart({ x: 0, y: 0 });
                setCropEnd({ x: 0, y: 0 });
              }}
              type={cropping ? 'primary' : 'default'}
              className="rounded-lg"
            >
              {cropping ? 'Xong cắt' : 'Cắt ảnh'}
            </Button>
          </Col>
          <Col xs={12} sm={6}>
            <Button
              block
              danger
              onClick={resetEditor}
              className="rounded-lg"
            >
              Đặt lại
            </Button>
          </Col>
        </Row>

        {cropping && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            <strong>Hướng dẫn cắt:</strong> Kéo chuột trên ảnh để chọn vùng cắt, sau đó nhấn "Xong cắt"
          </div>
        )}
      </div>
    </Modal>
  );
}
