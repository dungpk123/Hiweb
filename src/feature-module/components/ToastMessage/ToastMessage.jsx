import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleInfo,
  faCheckCircle,
  faTriangleExclamation,
  faTimesCircle,
  faXmark
} from "@fortawesome/free-solid-svg-icons";

import "../../../style/css/toats-message.css";

const icons = {
  info: faCircleInfo,
  success: faCheckCircle,
  error: faTimesCircle,
  warning: faTriangleExclamation,
};

const ToastMessage = ({ type, message, onClose }) => {

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast-message toast-${type}`}>
      <FontAwesomeIcon icon={icons[type]} className="toast-icon" />
      <span className="toast-text">{message}</span>

      <FontAwesomeIcon
        icon={faXmark}
        className="toast-close"
        onClick={onClose}
      />
    </div>
  );
};

/* PropTypes */
ToastMessage.propTypes = {
  type: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ToastMessage;
