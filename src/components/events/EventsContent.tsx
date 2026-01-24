"use client";

import { EventsHero } from "./EventsHero";
import HorizontalTimeline from "./HorizontalTimeline";
import {
  UpcomingEventsTeaser,
  UpcomingEventCardData,
} from "./UpcomingEventsTeaser";
import { EventStatistics } from "./EventStatistics";
import { EventGallery } from "./EventGallery";

export const EventsContent = ({
  upcomingEvents,
}: {
  upcomingEvents: UpcomingEventCardData[];
}) => (
  <div className=" text-white">
    {/* New 3D Carousel Hero */}
    <EventsHero />
    
    {/* New Horizontal Timeline */}
    <HorizontalTimeline />
        <EventStatistics />
    <EventGallery />
    {/* Existing Upcoming Events (fetched from server) */}
    <div className="container-grid pb-16 sm:pb-20 lg:pb-24 pt-20">
       <UpcomingEventsTeaser events={upcomingEvents} />
    </div>
  </div>
);

export default EventsContent;