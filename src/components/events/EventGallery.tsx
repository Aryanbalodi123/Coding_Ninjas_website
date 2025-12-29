"use client";

import { useState, useEffect } from "react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import DomeGallery from "@/components/ui/DomeGallery";

const eventImages = [
  {
    src: "/images/pastEvents/W9ersYUUwXSs37RqhEDFFj0sQq23-CUP07125 (1) (Custom).JPG-98d713ea-157f-465e-adc7-8abae734b848",
    alt: "Coding event",
  },
  {
    src: "/images/pastEvents/W9ersYUUwXSs37RqhEDFFj0sQq23-CUP07125 (Custom).JPG-bb7c0f69-9817-45ad-afa7-998b9b708923",
    alt: "Team collaboration",
  },
  {
    src: "/images/pastEvents/W9ersYUUwXSs37RqhEDFFj0sQq23-CUP07737 (Custom).JPG-b4cd26f5-211c-45fd-9e3b-0eaad989d74c",
    alt: "Workshop session",
  },
  {
    src: "/images/pastEvents/W9ersYUUwXSs37RqhEDFFj0sQq23-DSC_0089 (Custom).JPG-e97fe3de-7fa2-4950-b76b-f122e68c2bb6",
    alt: "Tech presentation",
  },
  {
    src: "/images/pastEvents/W9ersYUUwXSs37RqhEDFFj0sQq23-DSC_0210 (Custom).JPG-b2b6794c-1fa3-4f36-a9a3-dd6edacd9320",
    alt: "Networking event",
  },
  {
    src: "/images/pastEvents/W9ersYUUwXSs37RqhEDFFj0sQq23-DSC_2165 (Custom).JPG-8f5ffcef-d529-4b8a-a3b5-b55d74763bef",
    alt: "Coding Ninjas meetup",
  },
  {
    src: "/images/pastEvents/W9ersYUUwXSs37RqhEDFFj0sQq23-IMG_2550-min.JPG-15f819d4-12c5-48d6-8fa5-7707ec1d6585",
    alt: "Group activity",
  },
  {
    src: "/images/pastEvents/W9ersYUUwXSs37RqhEDFFj0sQq23-IMG_2575-min.JPG-f99dd3dc-4144-42fe-8470-ae709b884fc9",
    alt: "Innovation challenge",
  },
  {
    src: "/images/pastEvents/W9ersYUUwXSs37RqhEDFFj0sQq23-IMG_3518-min.JPG-64d6b54b-4daf-475b-9593-940b87968668",
    alt: "Learning session",
  },
  {
    src: "/images/pastEvents/W9ersYUUwXSs37RqhEDFFj0sQq23-IMG_6103 (1) (Custom).jpg-35d175f9-66b0-4ba9-ad85-217a9f3ed886",
    alt: "Community gathering",
  },
  {
    src: "/images/pastEvents/W9ersYUUwXSs37RqhEDFFj0sQq23-IMG_6478 (1) (Custom).jpg-8c2be97f-2489-498b-aa67-a66dd205acce",
    alt: "Hackathon",
  },
  {
    src: "/images/pastEvents/W9ersYUUwXSs37RqhEDFFj0sQq23-IMG_6479 (1) (Custom).jpg-443543a9-1156-4395-9b26-bd3d5ef0423b",
    alt: "Tech talk",
  },
  {
    src: "/images/pastEvents/W9ersYUUwXSs37RqhEDFFj0sQq23-IMG_6483 (1) (Custom).jpg-b42cbbcb-6b0d-4dd4-aa95-03fe57b9d9e5",
    alt: "Competition event",
  },
  {
    src: "/images/pastEvents/W9ersYUUwXSs37RqhEDFFj0sQq23-IMG_6489 (1) (Custom).jpg-186b1229-dcf4-4879-b4f9-e0191feabf6b",
    alt: "Project showcase",
  },
  {
    src: "/images/pastEvents/W9ersYUUwXSs37RqhEDFFj0sQq23-IMG_7624 (1) (Custom).jpg-1c39c11e-8517-407b-81bd-bcf055961cfb",
    alt: "Workshop participants",
  },
  {
    src: "/images/pastEvents/W9ersYUUwXSs37RqhEDFFj0sQq23-IMG_9050 (Custom).JPG-0997bd5d-5c0f-47ae-b7c6-6a7cb91949f4",
    alt: "Event highlights",
  },
  {
    src: "/images/pastEvents/W9ersYUUwXSs37RqhEDFFj0sQq23-IMG_9053 (Custom).JPG-1fc0dc74-216c-41d4-8575-67855b317724",
    alt: "Team celebration",
  },
  {
    src: "/images/pastEvents/W9ersYUUwXSs37RqhEDFFj0sQq23-IMG-20221109-WA0030.jpg-f1e43cf9-228b-4274-8542-17564f10ca29",
    alt: "Coding session",
  },
  {
    src: "/images/pastEvents/W9ersYUUwXSs37RqhEDFFj0sQq23-IMG-20221109-WA0031.jpg-6279e5bd-40a0-4107-b176-46466067444d",
    alt: "Event moments",
  },
];

export const EventGallery = () => {
  const [fit, setFit] = useState(0.5);
  const [imageSize, setImageSize] = useState({ width: "80vw", height: "80vw" });

  useEffect(() => {
    const updateSettings = () => {
      if (window.innerWidth < 640) {
        setFit(0.5); // Mobile
        setImageSize({ width: "85vw", height: "85vw" });
      } else if (window.innerWidth < 1024) {
        setFit(0.55); // Tablet
        setImageSize({ width: "500px", height: "500px" });
      } else {
        setFit(0.6); // Desktop
        setImageSize({ width: "550px", height: "550px" });
      }
    };

    updateSettings();
    window.addEventListener("resize", updateSettings);
    return () => window.removeEventListener("resize", updateSettings);
  }, []);

  return (
    <section className="container-grid space-y-8 md:space-y-12">
      <SectionTitle
        eyebrow="Gallery"
        title="Moments from Our Events"
        description="Capturing the energy, innovation, and community spirit at our gatherings."
      />
      <div className="w-full h-[60vh] min-h-[400px] max-h-[500px] sm:h-[65vh] sm:min-h-[450px] sm:max-h-[650px] md:h-[70vh] md:min-h-[500px] md:max-h-[800px]">
        <DomeGallery
          images={eventImages}
          fit={fit}
          overlayBlurColor="transparent"
          grayscale={false}
          imageBorderRadius="20px"
          openedImageBorderRadius="20px"
          openedImageWidth={imageSize.width}
          openedImageHeight={imageSize.height}
        />
      </div>
    </section>
  );
};
