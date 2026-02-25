"use client";

import { lazy, Suspense } from "react";
import { EventsHero } from "./EventsHero";
import {
  UpcomingEventsTeaser,
  UpcomingEventCardData,
} from "./UpcomingEventsTeaser";

// Code-split below-fold sections — they load after the hero paints
const HorizontalTimeline = lazy(() => import("./HorizontalTimeline"));
const EventStatistics = lazy(() => import("./EventStatistics"));
const EventGallery = lazy(() =>
  import("./EventGallery").then((m) => ({ default: m.EventGallery }))
);

export const EventsContent = ({
  upcomingEvents,
}: {
  upcomingEvents: UpcomingEventCardData[];
}) => (
  <div className="text-white">
    {/* Above fold — eagerly loaded */}
    <EventsHero />

    {/* Below fold — deferred JS chunks */}
    <Suspense fallback={null}>
      <HorizontalTimeline />
    </Suspense>

    <Suspense fallback={null}>
      <EventStatistics />
    </Suspense>

    <Suspense fallback={null}>
      <EventGallery />
    </Suspense>

    {/* Upcoming Events (data fetched server-side) */}
    <div className="container-grid pb-16 sm:pb-20 lg:pb-24 pt-20">
      <UpcomingEventsTeaser events={upcomingEvents} />
    </div>
  </div>
);

export default EventsContent;