import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';

export const CalendarPage: React.FC = () => {
  const { t } = useApp();
  const [events, setEvents] = useState<
    Array<{
      id: string;
      title: string;
      start: string;
      end?: string;
      color: string;
      category: string;
      meta: Record<string, unknown>;
    }>
  >([]);
  const [selectedEvent, setSelectedEvent] = useState<{
    title: string;
    startStr: string;
    meta: Record<string, unknown>;
  } | null>(null);

  useEffect(() => {
    api.calendar
      .events()
      .then(setEvents)
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-extrabold text-[#F5F8FF]">{t.calendar.title}</h2>
          <p className="text-xs text-[#9BAFC8] mt-0.5">{t.calendar.subtitle}</p>
        </div>

        {/* Color Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
          <span className="inline-flex items-center gap-1.5 text-[#0788F9]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0788F9]" />
            {t.calendar.legendRoute}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[#00C875]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00C875]" />
            {t.calendar.legendAvailable}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[#FFA526]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFA526]" />
            {t.calendar.legendLoading}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[#8055F5]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8055F5]" />
            {t.calendar.legendUnloading}
          </span>
        </div>
      </div>

      <div className="fura-card p-4 lg:p-6">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          buttonText={{
            month: t.calendar.month,
            week: t.calendar.week,
            day: t.calendar.day,
          }}
          events={events.map((ev) => ({
            id: ev.id,
            title: ev.title,
            start: ev.start,
            end: ev.end,
            backgroundColor: ev.color,
            borderColor: ev.color,
            extendedProps: { meta: ev.meta },
          }))}
          eventClick={(info) => {
            setSelectedEvent({
              title: info.event.title,
              startStr: info.event.startStr,
              meta: (info.event.extendedProps.meta as Record<string, unknown>) ?? {},
            });
          }}
          height="auto"
        />
      </div>

      <Modal
        open={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title || ''}
      >
        {selectedEvent && (
          <div className="space-y-2 text-xs">
            <div className="fura-card-inset p-4 space-y-2">
              {Object.entries(selectedEvent.meta).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-[#9BAFC8] uppercase">{k}</span>
                  <span className="font-semibold text-[#F5F8FF]">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
