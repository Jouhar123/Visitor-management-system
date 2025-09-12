"use client";

import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";

import React, { useState, useEffect, useRef } from "react";
import imageCompression from "browser-image-compression";
import Link from "next/link";

const Visitor = () => {
  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [whomToMeet, setWhomToMeet] = useState("");
  const [code, setCode] = useState("");
  const [qrData, setQrData] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [sponsors, setSponsors] = useState([]);
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch sponsors for dropdown
  useEffect(() => {
    fetch('/api/sponsor')
      .then(res => res.json())
      .then(data => setSponsors(Array.isArray(data) ? data : []));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // get current location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          const msg = error?.message || "Unknown geolocation error";
          console.error("Geolocation error:", msg);

          if (Notification.permission !== "granted") {
            Notification.requestPermission().then((permission) => {
              if (permission === "granted") {
                new Notification("Location Required", {
                  body: "Please refresh and allow location to continue registration.",
                });
              } else {
                alert("Please enable location to proceed.");
              }
            });
          } else {
            alert("Location access is required.");
          }
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  }, []);

  const handleImageCapture = async (e) => {
    let file = e.target.files[0];
    if (!file) return;

    if (file.size > 200 * 1024) {
      try {
        const options = {
          maxSizeMB: 0.2,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
        file = compressedFile;
      } catch (error) {
        console.error("Image compression error:", error);
      }
    }

    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !photo) {
      alert("Please fill all required fields and capture a photo.");
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await fetch("/api/visitor/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setStep(2);
      } else {
        alert(data.message || "Failed to send OTP.");
      }
    } catch (err) {
      console.error("Send OTP error:", err);
      alert("Error sending OTP.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  //  Download Qr Code in gallery
  const downloadVisitorCard = () => {
  const node = document.getElementById("visitor-card");

  if (!node) return;

  toPng(node, { cacheBust: true })
    .then((dataUrl) => {
      const link = document.createElement("a");
      link.download = `visitor_card_${name.replace(/\s+/g, "_")}.png`;
      link.href = dataUrl;
      link.click();
    })
    .catch((err) => {
      console.error("Error generating visitor card image:", err);
      alert("Failed to download visitor card.");
    });
};

  // Step 2: Verify OTP and submit details
  const handleVerifyAndUpload = async () => {
    if (!code || code.length !== 6) {
      alert("Please enter the 6-digit OTP.");
      return;
    }

    if (
      !name ||
      !email ||
      !phone ||
      !photo ||
      !purpose ||
      !(selectedSponsor && selectedSponsor.email)
    ) {
      alert("Please fill all required fields and select a sponsor.");
      return;
    }

    setIsVerifying(true);
    try {
      // 1. Verify OTP
      const res = await fetch("/api/visitor/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      const result = await res.json();
      if (!res.ok) {
        alert(result.message || "OTP verification failed.");
        return;
      }

      // 2. Upload photo
      const formData = new FormData();
    formData.append("file", photo); // original File object
    formData.append("name", email);

    const uploadRes = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) {
      alert(uploadData.error || "Image upload failed.");
      return;
    }
    setPhotoUrl(uploadData.url);

    // 3. Register visitor in DB with Cloudinary URL
    const saveVisitor = await fetch("/api/visitor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone,
        purpose,
        whomToMeet: selectedSponsor.email,
        location,
        photoUrl: uploadData.url, // ✅ send Cloudinary URL
      }),
    });

    const savedData = await saveVisitor.json();
    if (saveVisitor.ok) {
      // Show QR Code
      const now = new Date();
      const expiry = new Date(now.getTime() + 5 * 60 * 60 * 1000);
      setQrData(JSON.stringify({ email, registeredAt: now, expiresAt: expiry }));
      setRegistrationSuccess(true);
    } else {
      alert(savedData.message || "Failed to save visitor");
    }
  } catch (err) {
    console.error("Verification error:", err);
    alert("An error occurred.");
  } finally {
    setIsVerifying(false);
  }
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {step === 1 && (
        <form
          onSubmit={handleFormSubmit}
          className="w-full max-w-md p-6 bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-xl shadow-lg"
        >
          <h1 className="text-2xl font-bold text-center text-blue-700 mb-6">
            Visitor Registration
          </h1>

          <div className="flex flex-col space-y-4">
            <div>
              <label className="block text-black text-sm font-medium mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border text-black rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-black text-sm font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
                className="w-full p-2 border text-black rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-black text-sm font-medium mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2 border text-black rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your phone number"
              />
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-black text-sm font-medium mb-1">
                Purpose of Visit
              </label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full p-2 border text-black rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Purpose of visit"
              />
            </div>

            {/* Whom to Meet (Sponsor Dropdown) */}
            <div>
              <label className="block text-black text-sm font-medium mb-1">
                Meeting Person (Sponsor)
              </label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full p-2 border text-black rounded-md focus:ring-2 focus:ring-blue-500 text-left bg-white"
                  onClick={() => setDropdownOpen((open) => !open)}
                >
                  {selectedSponsor
                    ? `${selectedSponsor.name} (${[selectedSponsor.company, selectedSponsor.department].filter(Boolean).join(' / ')})`
                    : 'Select sponsor'}
                </button>
                {dropdownOpen && (
                  <div
                    ref={dropdownRef}
                    className="absolute z-10 mt-1 w-full bg-white border rounded shadow max-h-40 overflow-y-auto"
                  >
                    {sponsors.length === 0 ? (
                      <div className="p-2 text-gray-500">No sponsors found</div>
                    ) : (
                      sponsors.map((s) => (
                        <div
                          key={s._id}
                          className={`p-2 cursor-pointer hover:bg-blue-100 ${selectedSponsor && selectedSponsor._id === s._id ? 'bg-blue-50' : ''} ${!s.active ? 'opacity-50 cursor-not-allowed bg-gray-100 hover:bg-gray-100' : ''}`}
                          onClick={() => {
                            if (!s.active) return;
                            setSelectedSponsor(s);
                            setDropdownOpen(false);
                          }}
                          title={s.active ? '' : 'Sponsor is inactive'}
                        >
                          <span className="font-medium">{s.name}</span>
                          {(s.company || s.department) && (
                            <span className="text-xs text-gray-500 ml-2">
                              ({[s.company, s.department].filter(Boolean).join(' / ')})
                            </span>
                          )}
                          {!s.active && <span className="ml-2 text-xs text-red-500">(Inactive)</span>}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Capture Photo */}
            <div>
              <label className="block text-black text-sm font-medium mb-1">
                Capture Photo
              </label>
              <div className="flex items-center">
                <label
                  htmlFor="photo"
                  className="cursor-pointer text-black px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
                >
                  Open Camera
                </label>
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handleImageCapture}
                  className="hidden"
                />
              </div>

              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="mt-2 rounded-md w-full h-48 object-cover border"
                />
              )}
            </div>

            <button
              type="submit"
              className={`w-full mt-4 ${
                !location.latitude
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white py-2 rounded-md transition`}
              disabled={!location.latitude}
            >
              Next
            </button>
          </div>
        </form>
      )}

      {step === 2 && !registrationSuccess && (
        <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg space-y-4">
          <h2 className="text-xl font-semibold text-center text-blue-700 mb-4">
            Verification
          </h2>
          <p className="text-sm text-gray-700 text-center">
            Enter the 6-digit code sent to your phone or email.
          </p>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
            className="w-full p-2 border text-black rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Enter code (e.g. 123456)"
          />
          <button
            onClick={handleVerifyAndUpload}
            className={`w-full bg-green-600 text-white py-2 rounded-md transition ${isVerifying ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'}`}
            disabled={isVerifying}
          >
            {isVerifying ? "Processing..." : "Verify & Upload"}
          </button>
        </div>
      )}

     {registrationSuccess && (
  <div
    id="visitor-card"
    className="w-full max-w-md p-6 mt-6 bg-white rounded-xl shadow-xl text-center"
  >
    <h2 className="text-xl font-semibold text-green-700 mb-2">
      Dear {name}, your registration has been completed!
    </h2>
    <p className="text-sm text-gray-700 mb-2">Thank you for your visit.</p>

    {/* Show registration date */}
    {qrData && (
      <p className="text-xs text-gray-500 mb-2">
        Registered at: {new Date(JSON.parse(qrData).registeredAt).toLocaleString()}
      </p>
    )}

    <div className="flex justify-center mb-4">
      <QRCodeSVG value={qrData} size={180} />
    </div>

    <button
      onClick={downloadVisitorCard}
      className="w-full mb-2 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
    >
      Save Visitor Card
    </button>

    <Link
      href="/"
      className="inline-block w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
    >
      Register Another Visitor
    </Link>
  </div>
)}
    </div>
  );
}


export default Visitor;
