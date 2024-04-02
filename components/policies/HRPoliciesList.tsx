// components/HRPoliciesList.tsx

import React from 'react';

interface Props {
  policies: string[];
}

const HRPoliciesList: React.FC<Props> = ({ policies }) => {
  return (
    <div>
      <h3>HR Policies</h3>
      <ul>
        {policies.map((policy, index) => (
          <li key={index}>{policy}</li>
        ))}
      </ul>
    </div>
  );
};

export default HRPoliciesList;
