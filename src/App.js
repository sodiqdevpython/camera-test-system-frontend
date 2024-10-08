import React, { useEffect, useRef, useState, useCallback } from 'react';
import jsPDF from 'jspdf';

const MAX_PDF_SIZE = 2 * 1024 * 1024; // 20MB

const App = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [pdf, setPdf] = useState(new jsPDF());
  const [imageCount, setImageCount] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [pdfSize, setPdfSize] = useState(0);
  const [cameraAllowed, setCameraAllowed] = useState(false); // Kamera ruxsati flagi

  // Rasmlarni olish funksiyasi
  const captureImage = useCallback(() => {
    if (!cameraAllowed) {
      // alert("Kamera uchun ruxsat berilmadi!");
      return;
    }

    // PDF hajmini tekshiramiz
    const pdfBlob = pdf.output('blob'); // PDF ni Blob formatda olamiz
    const newPdfSize = pdfBlob.size;
    setPdfSize(newPdfSize);

    if (newPdfSize > MAX_PDF_SIZE) {
      handleStop(); // Agar hajm 20MB dan oshsa, rasm olishni to'xtatamiz
      // alert('PDF hajmi 20MB ga yetdi, rasm olish to\'xtatildi.');
      return; // Rasm olishni davom ettirmaslik uchun qaytamiz
    }

    if (videoRef.current) {
      const context = canvasRef.current.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      const imageData = canvasRef.current.toDataURL('image/png');

      // Rasmlarni PDF ga qo'shish (3x4 formatda)
      if (imageCount % 12 === 0 && imageCount > 0) {
        setPdf(prevPdf => {
          prevPdf.addPage();
          return prevPdf;
        });
      }
      const x = (imageCount % 3) * 70; // 3 ustun
      const y = Math.floor(imageCount % 12 / 3) * 90; // 4 qator
      setPdf(prevPdf => {
        prevPdf.addImage(imageData, 'PNG', x, y, 70, 90); // Rasmni PDF ga qo'shamiz
        return prevPdf;
      });

      setImageCount(prevCount => prevCount + 1);
    }
  }, [imageCount, pdf, cameraAllowed]);

  useEffect(() => {
    // Kamera uchun ruxsat so'rash faqat bir marta
    const getCameraAccess = async () => {
      try {
        if (videoRef.current && videoRef.current.srcObject) {
          // Avvalgi streamni to'xtatish
          const tracks = videoRef.current.srcObject.getTracks();
          tracks.forEach(track => track.stop());
        }

        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        await videoRef.current.play(); // play() requestni kutish
        setCameraAllowed(true); // Ruxsat berildi
      } catch (error) {
        console.error('Kamera uchun ruxsat olishda xatolik:', error);
        setCameraAllowed(false); // Ruxsat berilmadi
      }
    };

    getCameraAccess();

    // Har 3 soniyada rasmga olish
    const id = setInterval(() => {
      captureImage();
    }, 3000); // 3 sekund
    setIntervalId(id);

    // Kamera statusini muntazam tekshirish
    // const cameraCheckId = setInterval(() => {
    //   if (videoRef.current && videoRef.current.srcObject) {
    //     const tracks = videoRef.current.srcObject.getTracks();
    //     if (tracks.every(track => track.readyState === 'ended')) {
    //       alert('Kamera faollashtirilmagan yoki o\'chirilgan!');
    //       handleStop();
    //     }
    //   }
    // }, 1000); // Har soniyada kamera statusini tekshiramiz

    return () => {
      clearInterval(id);
      // clearInterval(cameraCheckId);

      const videoElement = videoRef.current;
      if (videoElement && videoElement.srcObject) {
        const tracks = videoElement.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [captureImage]);

  const handleStop = () => {
    if (intervalId) {
      clearInterval(intervalId); // Rasm olish jarayonini to'xtatish
      setIntervalId(null);
    }
  };

  const handleSavePdf = () => {
    // Foydalanuvchi PDFni saqlashni xohlasa, uni yuklab olish imkoniyati
    pdf.save('data.pdf');
  };

  return (
    <div>
      <video ref={videoRef} style={{ display: 'none' }}></video>
      <canvas ref={canvasRef} width="210" height="297" style={{ display: 'none' }}></canvas>
      <button onClick={handleSavePdf}>PDFni saqlash</button>
      <button onClick={handleStop}>Stop</button>
      <p>Hozirgi PDF hajmi: {(pdfSize / (1024 * 1024)).toFixed(2)} MB</p> {/* PDF hajmini ko'rsatamiz */}
    </div>
  );
};

export default App;
