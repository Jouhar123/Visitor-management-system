"use client";
import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const QRCodeScanner = () => {
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState("");
  const scannerRef = useRef(null);
  const qrRegionId = "qr-scanner";

  useEffect(() => {
    const startScanner = async () => {
      if (!Html5Qrcode.getCameras) {
        setError("Camera not supported on this device.");
        return;
      }

      try {
        const html5QrCode = new Html5Qrcode(qrRegionId);
        scannerRef.current = html5QrCode;

        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            try {
              const parsed = JSON.parse(decodedText);
              html5QrCode.stop();
              setScannedData(parsed);
            } catch (e) {
              setError("Invalid QR Code format.");
            }
          },
          (err) => {
            // console.log("Scan error", err);
          }
        );
      } catch (err) {
        setError("Failed to access camera.");
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">Scan QR Code</h1>

      {!scannedData && <div id={qrRegionId} className="w-[300px] h-[300px] border rounded-lg" />}

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {scannedData && (
        <div className="mt-6 w-full max-w-md bg-white p-4 rounded shadow space-y-2">
          <h2 className="text-lg font-semibold text-green-700">QR Code Data:</h2>
          <p><strong>Name:</strong> {scannedData.name}</p>
          <p><strong>Email:</strong> {scannedData.email}</p>
          <p><strong>Issued At:</strong> {new Date(scannedData.issuedAt).toLocaleString()}</p>
          <p><strong>Expiry:</strong> {new Date(scannedData.expiry).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};

export default QRCodeScanner;
