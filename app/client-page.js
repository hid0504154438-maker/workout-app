'use client';

import { useState } from 'react';
import WeekTabs from '../components/WeekTabs';
import DayView from '../components/DayView';

export default function ClientHome({ weeks, userSlug }) {
    const [activeWeek, setActiveWeek] = useState(0);
    const [openDay, setOpenDay] = useState(0); // Index of open day in current week

    const currentWeek = weeks[activeWeek];

    return (
        <main style={{ paddingBottom: '50px' }}>
            <h1 style={{ textAlign: 'center', margin: '1rem 0', fontSize: '1.5rem' }}>My Workout Plan</h1>

            <WeekTabs
                weeks={weeks}
                activeWeek={activeWeek}
                onSelect={(index) => {
                    setActiveWeek(index);
                    setOpenDay(0); // Reset day on week change
                }}
            />

            <div className="container" style={{ marginTop: '1rem' }}>
                {currentWeek && currentWeek.days.map((day, dIndex) => (
                    <DayView
                        key={`${activeWeek}-${dIndex}`}
                        day={day}
                        weekIndex={activeWeek}
                        dayIndex={dIndex}
                        isOpen={openDay === dIndex}
                        onToggle={() => setOpenDay(openDay === dIndex ? -1 : dIndex)}
                        userSlug={userSlug}
                    />
                ))}

                {!currentWeek && <div style={{ textAlign: 'center', padding: '2rem' }}>No workouts found.</div>}
            </div>
        </main>
    );
}
