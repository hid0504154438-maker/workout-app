import { NextResponse } from 'next/server';
import { trainees } from '@/lib/trainees';

export async function POST(request) {
    try {
        const { userSlug, passcode } = await request.json();

        if (!userSlug || !passcode) {
            return NextResponse.json({ success: false, message: 'Missing credentials' }, { status: 400 });
        }

        const trainee = trainees[userSlug];

        if (!trainee) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        // Master Passcode or Specific User Passcode
        const MASTER_CODE = '9999';
        const isValid = passcode === trainee.passcode || passcode === MASTER_CODE;

        if (isValid) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, message: 'Invalid passcode' }, { status: 401 });
        }
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
