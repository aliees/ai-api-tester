import React, { useState } from 'react';

interface ResponseAccordionProps {
  response: any;
}

const ResponseAccordion: React.FC<ResponseAccordionProps> = ({ response }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="accordion">
      <div className="accordion-header">
        <h4>Response</h4>
        <button className="accordion-button" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? 'Hide Full Response' : 'View Full Response'}
        </button>
      </div>
      {isOpen && (
        <div className="accordion-body">
          <pre>
            <code>{JSON.stringify(response, null, 2)}</code>
          </pre>
        </div>
      )}
    </div>
  );
};

export default ResponseAccordion;

export {};