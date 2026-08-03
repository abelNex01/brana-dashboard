import { memo } from "react";

interface ServiceLogosProps {
  isExpanded: boolean;
}

const services = [
  {
    name: "Brana",
    icon: "/services/brana.svg",
    url: "https://www.branafilms.com/",
  },
  {
    name: "Visa",
    icon: "/services/visa.svg",
    url: "https://www.visa.com/",
  },
  {
    name: "Figma",
    icon: "/services/figma.svg",
    url: "https://www.figma.com/",
  },
  {
    name: "Google",
    icon: "/services/google.svg",
    url: "https://www.google.com/",
  },
  {
    name: "Notion",
    icon: "/services/notion.svg",
    url: "https://www.notion.so/",
  },
];

export const ServiceLogos = memo(function ServiceLogos({ isExpanded }: ServiceLogosProps) {
  const handleServiceClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!isExpanded) {
    return (
      <div className="flex flex-col gap-2">
        {services.map((service) => (
          <div
            key={service.name}
            className="w-9 h-9 flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
            title={service.name}
            onClick={() => handleServiceClick(service.url)}
          >
            <img src={service.icon} alt={service.name} className="w-5 h-5" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full">
      <p className="mb-3 px-2 text-[10px] font-medium uppercase tracking-[0.02em] text-muted-foreground">
        Services
      </p>
      <div className="grid grid-cols-5 gap-2">
        {services.map((service) => (
          <div
            key={service.name}
            className="flex flex-col items-center gap-1.5 p-2 hover:opacity-80 transition-opacity cursor-pointer group"
            title={service.name}
            onClick={() => handleServiceClick(service.url)}
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <img src={service.icon} alt={service.name} className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">
              {service.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});
