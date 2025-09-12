
import Sponsor from '../db/models/sponsor'
import { NextResponse } from 'next/server';
import dbConnect from '../db/dbconnect';

export async function POST(req) {
    await dbConnect();
    const { name, email, phone, company, department, active = true } = await req.json();
    try {
        // Check for duplicate sponsor by email
        const existing = await Sponsor.findOne({ email });
        if (existing) {
            return NextResponse.json({ message: "Sponsor already exists" }, { status: 409 });
        }
        const sponsor = await Sponsor.create({ name, email, phone, company, department, active });
        return NextResponse.json(sponsor);
    } catch (error) {
        return NextResponse.json({ message: error.message || "Error creating sponsor" }, { status: 500 });
    }
}


export async function GET(req){
    await dbConnect();
    try {
        const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
        const name = searchParams.get('name');
        const email = searchParams.get('email');
        const department = searchParams.get('department');
        const filter = {};
        if (name) filter.name = { $regex: name, $options: 'i' };
        if (email) filter.email = email;
        if (department) filter.department = { $regex: department, $options: 'i' };
        const sponsors = await Sponsor.find(filter);
        if (!sponsors || sponsors.length === 0) {
            return NextResponse.json({ message: 'No sponsors found' }, { status: 404 });
        }
        return NextResponse.json(sponsors);
    } catch (error) {
        return NextResponse.json({ message: error.message || 'Error fetching sponsors' }, { status: 500 });
    }
}

export async function DELETE(req){
    await dbConnect();
    const {id} = await req.json();
    await Sponsor.findByIdAndDelete(id);
    return NextResponse.json({message: "Sponsor deleted successfully"});
}

export async function PUT(req){
    await dbConnect();
    const {email, name, phone, company, department, active} = await req.json();
    const sponsor = await Sponsor.findOneAndUpdate(
        { email },
        { name, phone, company, department, active },
        { new: true }
    );
    return NextResponse.json(sponsor);
}