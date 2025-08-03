import React, { useState } from 'react';

interface PayloadAccordionProps {
  payload: any;
}

const PayloadAccordion: React.FC<PayloadAccordionProps> = ({ payload }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="accordion">
      <div className="accordion-header" onClick={() => setIsOpen(!isOpen)}>
        <h4>Payload</h4>
        <button className="accordion-button">
          {isOpen ? 'Hide' : 'View'}
        </button>
      </div>
      {isOpen && (
        <div className="accordion-body">
          <pre>
            <code>{JSON.stringify(JSON.parse(payload), null, 2)}</code>
          </pre>
        </div>
      )}
    </div>
  );
};

export default PayloadAccordion;