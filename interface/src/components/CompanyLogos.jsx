import React from 'react';
import fcmb from '../assets/companies/fcmb.png';
import unitedCapital from '../assets/companies/united-capital.png';
import evolutionMoney from '../assets/companies/evolution-money.png';

const companies = [
  { name: 'FCMB', logo: fcmb, scale: 'scale-[1.25]' },
  { name: 'United Capital', logo: unitedCapital, scale: 'scale-100' },
  { name: 'Evolution Money', logo: evolutionMoney, scale: 'scale-[0.95]' },
];

const CompanyLogos = () => {
  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center justify-around gap-x-16 gap-y-8">
        {companies.map((c) => (
          <div
            key={c.name}
            className="flex items-center justify-center h-20 md:h-24 w-40 md:w-48 overflow-hidden"
          >
            <img
              src={c.logo}
              alt={`${c.name} logo`}
              loading="lazy"
              className={`max-h-full max-w-full object-contain ${c.scale} grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-300`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompanyLogos;
