import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from "next/server";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const name = formData.get("name");

    if (!file || !name) {
      return NextResponse.json({ error: "Missing file or name" }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Create a unique filename
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-");
    const extension = file.name.split(".").pop();
    const safeName = name.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
    const fileName = `${safeName}_${timestamp}`;

    // Convert buffer to base64 string for Cloudinary
    const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64String, {
      public_id: `visitor-management/${safeName}/${fileName}`,
      folder: 'visitor-management',
      resource_type: 'auto',
      transformation: [
        { width: 800, height: 800, crop: 'limit' }, // Resize if too large
        { quality: 'auto' } // Optimize quality
      ]
    });

    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height
    });

  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
