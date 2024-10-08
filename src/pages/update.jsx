import { useEffect, useRef, useState, useCallback } from 'react';
import jsPDF from 'jspdf';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import { baseURL } from '../api';

const MAX_PDF_SIZE = 20 * 1024 * 1024; // 20MB

export default function UpdatePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [pdf, setPdf] = useState(new jsPDF());
    const [imageCount, setImageCount] = useState(0);
    const [intervalId, setIntervalId] = useState(null);
    const [pdfSize, setPdfSize] = useState(0);
    const [cameraAllowed, setCameraAllowed] = useState(false);
    const [body, setBody] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [alertCount, setAlertCount] = useState(0); // So'rov soni

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get(`${baseURL}/practise/${id}/`);
                setBody(response.data.body);
                if (response.data.is_valid === true) {
                    window.location.href = `${baseURL}/${id}`;
                }
            } catch (error) {
                console.error('Xato:', error);
            }
        }

        fetchData();
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    }, [id]);

    const captureImage = useCallback(() => {
        if (!cameraAllowed) return;

        const pdfBlob = pdf.output('blob');
        const newPdfSize = pdfBlob.size;
        setPdfSize(newPdfSize);

        if (newPdfSize > MAX_PDF_SIZE) {
            handleStop();
            return;
        }

        if (videoRef.current) {
            const context = canvasRef.current.getContext('2d');
            context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
            const imageData = canvasRef.current.toDataURL('image/png');

            if (imageCount % 12 === 0 && imageCount > 0) {
                setPdf((prevPdf) => {
                    prevPdf.addPage();
                    return prevPdf;
                });
            }
            const x = (imageCount % 10) * 21;  // Adjust width for 10 images per row
            const y = Math.floor(imageCount % 20 / 10) * 30;  // Adjust height for 2 rows of 10
            setPdf((prevPdf) => {
                prevPdf.addImage(imageData, 'PNG', x, y, 21, 30);  // Adjust image size for 10 per row
                return prevPdf;
            });

            setImageCount((prevCount) => prevCount + 1);
        }
    }, [imageCount, pdf, cameraAllowed]);

    useEffect(() => {
        const getCameraAccess = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
                setCameraAllowed(true);
            } catch (error) {
                console.error('Kamera uchun ruxsat olishda xatolik:', error);
                setCameraAllowed(false);
            }
        };

        getCameraAccess();

        // Set an interval to capture image every 30 seconds
        const captureId = setInterval(() => {
            captureImage();
        }, 30000); // 30 seconds

        // Set an interval to check camera access every 1 second
        const accessId = setInterval(() => {
            checkCameraAccess();
        }, 1000); // 1 second

        setIntervalId(captureId);

        return () => {
            clearInterval(captureId);
            clearInterval(accessId);
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach((track) => track.stop());
            }
        };
    }, [captureImage]);

    const checkCameraAccess = () => {
        navigator.permissions.query({ name: 'camera' }).then((permissionStatus) => {
            if (permissionStatus.state === 'denied') {
                if (alertCount < 3) {
                    alert('Kamera ruxsati o\'chirildi! Ruxsat berasizmi?');
                    setAlertCount(prevCount => prevCount + 1);
                } else {
                    navigate('/'); // 3 marta so'ralgandan so'ng navigatsiya qilish
                }
            } else {
                setAlertCount(0); // Agar ruxsat berilgan bo'lsa, hisobni reset qiling
            }
        });
    };

    const handleStop = () => {
        if (intervalId) {
            clearInterval(intervalId);
            setIntervalId(null);
        }
    };

    const handleSavePdf = async () => {
        try {
            const pdfBlob = pdf.output('blob');
            const formData = new FormData();
            formData.append('camera_pdf', pdfBlob, 'data.pdf');
            formData.append('body', body);
            formData.append('is_valid', true);

            await axios.put(`${baseURL}/practise/${id}/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            alert("Muvaffaqiyatli saqlandi!");
            window.location.href = `${baseURL}/${id}`;
        } catch (error) {
            console.error('Error updating data with PDF:', error);
            alert("Nimadir xato ketdi, iltimos qaytadan urinib ko'ring, balki internet tarmog'ingizdandir");
        }
    };

    return (
        <div className="absolute top-0 z-[-2] h-full w-full bg-white">
            {isLoading ? (
                <div className="flex justify-center items-center h-full">
                    <div className="spinner-border animate-spin inline-block w-16 h-16 border-4 rounded-full" role="status">
                        <span className="sr-only">Yuklanmoqda...</span>
                    </div>
                </div>
            ) : (
                <section className="w-full h-full bg-white">
                    <div className="h-full">
                        <form className="h-full">
                            <Editor
                                apiKey="tugztdda8zonioisizvq7tcyhx98n68ji2b651rsqb89rjlh"
                                value={body}
                                onEditorChange={(newText) => setBody(newText)}
                                init={{
                                    width: '100vw',
                                    height: '100vh',
                                    menubar: true,
                                    plugins: [
                                        'advlist autolink lists link image charmap print preview anchor',
                                        'searchreplace visualblocks code fullscreen',
                                        'insertdatetime media table paste code help wordcount',
                                        'table',
                                        'codesample',
                                        'emoticons',
                                        'quickbars',
                                    ],
                                    toolbar: `undo redo | formatselect | bold italic backcolor | 
                                        alignleft aligncenter alignright alignjustify | 
                                        bullist numlist outdent indent | table image codesample | 
                                        removeformat | fullscreen | help | emoticons`,
                                    quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
                                    table_toolbar: "tableprops cell row column deletetable | cellprops rowprops",
                                    content_style: `
                                        body {
                                            font-family: 'Rubik', sans-serif;
                                            font-size: 14px;
                                            height: 100%;
                                            background-color: #f5f5f5;
                                            color: #333;
                                        }
                                        table {
                                            width: 100%;
                                            border-collapse: collapse;
                                            border: 1px solid #ccc;
                                        }
                                        th, td {
                                            padding: 8px;
                                            border: 1px solid #ddd;
                                        }
                                    `,
                                    setup: (editor) => {
                                        // Disable pasting
                                        editor.on('paste', (e) => {
                                            e.preventDefault();
                                            alert("ctrl+v mumkin emas! Agar rasm qo'yish kerak bo'lsa kursorni o'ng tomonida insert image nomli menu bor !"); // Optional: show an alert or message
                                        });
                                    }
                                }}
                            />
                            <div className="top-4 py-5">
                                <button type="button" onClick={handleSavePdf} className="text-Light bg-[#2563eb] font-medium rounded-lg text-sm px-10 py-2.5 text-center ms-5 shadow-lg hover:shadow-2xl transition-all duration-700">
                                    Saqlash
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
            )}
            <video ref={videoRef} style={{ display: 'none' }}></video>
            <canvas ref={canvasRef} width="210" height="297" style={{ display: 'none' }}></canvas>
        </div>
    );
}
