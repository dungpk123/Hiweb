import React from "react";
import PropTypes from "prop-types";
import { base_path } from "../../environment";

const ImageWithBasePath = (props) => {
  // Vite uses import.meta.env.BASE_URL for public path
  const publicUrl = import.meta.env.BASE_URL || base_path;
  const prefix = publicUrl.endsWith('/') ? publicUrl : publicUrl + '/';
  
  const isAbsoluteUrl =
    typeof props.src === "string" &&
    (props.src.startsWith("http://") ||
      props.src.startsWith("https://") ||
      props.src.startsWith("data:"));
      
  const fullSrc = isAbsoluteUrl
    ? props.src
    : props.src.startsWith("/")
    ? `${publicUrl}${props.src.substring(1)}`
    : `${prefix}${props.src}`;

  return (
    <img
      className={props.className}
      src={fullSrc}
      height={props.height}
      alt={props.alt}
      width={props.width}
      id={props.id}
    />
  );
};

ImageWithBasePath.propTypes = {
  className: PropTypes.string,
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  height: PropTypes.number,
  width: PropTypes.number,
  id: PropTypes.string,
};

export default ImageWithBasePath;
