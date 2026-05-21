import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X } from 'lucide-react';

export default function QRScanner({ onScan, onClose }) {
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);

  useEffect(() => {
    const html5Qr = new Html5Qrcode('qr-reader');
    html5QrRef.current = html5Qr;

    html5Qr.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        html5Qr.stop().catch(() => {});
        onScan(decodedText);
      },
      () => {}
    ).catch((err) => {
      console.error('QR scanner start error:', err);
    });

    return () => {
      html5Qr.stop().catch(() => {});
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Scan QR</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div id="qr-reader" className="w-full" />
        <p className="text-sm text-gray-500 text-center mt-3">
          Arahkan kamera ke QR code
        </p>
      </div>
    </div>
  );
}
