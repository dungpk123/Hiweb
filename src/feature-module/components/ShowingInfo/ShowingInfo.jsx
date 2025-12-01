import React from 'react';
import PropTypes from 'prop-types';


const ShowingInfo = ({ 
  currentCount, 
  totalCount, 
  type = 'items',
  className = '',
  style = {}
}) => {
  return (
    <div className={`mb-4 mt-4 px-3 ${className}`}>
      <h6 
        className="text-muted" 
        style={{ 
          fontSize: '14px', 
          marginBottom: '15px',
          ...style 
        }}
      >
        Showing {totalCount > 0 ? currentCount : 0} out of {totalCount} {type}
      </h6>
    </div>
  );
};

ShowingInfo.propTypes = {
  currentCount: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  type: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default ShowingInfo;
