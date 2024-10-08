import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function App() {
    const [hasPermission, setHasPermission] = useState(false); // Kamera ruxsati
    const [alertShown, setAlertShown] = useState(false); // Alert bir marta ko'rsatish uchun
    const videoRef = useRef(null);
    const navigate = useNavigate();

    let { id } = useParams()

    // Kameraga ruxsat so'rash funksiyasi
    const requestCameraPermission = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setHasPermission(true);
            setAlertShown(false);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera access denied:", err);
            setHasPermission(false);
        }
    };

    // Doimiy ravishda foydalanuvchi ruxsatini tekshirish
    useEffect(() => {
        const checkPermission = async () => {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const hasVideoInput = devices.some((device) => device.kind === "videoinput");

            if (!hasVideoInput) {
                setHasPermission(false);
                if (!alertShown) {
                    alert("Iltimos, kameraga kirish uchun ruxsat bering!");
                    setAlertShown(true);
                }
            }
        };

        checkPermission();
        const interval = setInterval(checkPermission, 3000);
        return () => clearInterval(interval);
    }, [alertShown]);

    return (
        <div className="relative flex items-center justify-center h-screen">
            {/* Background gradient */}
            <div className="absolute top-0 z-[-2] h-full w-screen bg-white bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

            {/* Main container */}
            <div className="flex flex-col items-center justify-center bg-white shadow-lg p-10 rounded-lg space-y-8">
                <h1 className="text-xl font-bold text-indigo-600 mb-6">
                    Qurilmangiz kamerasiga kirish uchun ruxsat bering
                </h1>

                {/* Video preview */}
                <video
                    ref={videoRef}
                    autoPlay
                    className={`rounded-lg border-4 border-indigo-300 shadow-md ${hasPermission ? "block" : "hidden"}`}
                    width="320"
                    height="240"
                />

                {/* Ruxsat berish tugmasi */}
                {!hasPermission && (
                    <button
                        onClick={requestCameraPermission}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-6 rounded-md shadow-md transform transition duration-300 ease-in-out"
                    >
                        Ruxsat berish
                    </button>
                )}

                {/* Keyingisi tugmasi */}
                <button
                    onClick={() => navigate(`/${id}`)}
                    className={`${hasPermission ? "bg-green-600 cursor-pointer hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"
                        } text-white font-semibold py-2 px-8 rounded-md shadow-md transform transition duration-300 ease-in-out`}
                    disabled={!hasPermission}
                >
                    Keyingisi
                </button>
            </div>
        </div>
    );
}
