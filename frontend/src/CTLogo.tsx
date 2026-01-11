// This file was added to import the Creative Technology logo for the dashboard header.
import React from 'react';

export default function CTLogo(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  return <img src="/ct-logo.png" alt="Creative Technology Logo" style={{ height: 48, ...props.style }} {...props} />;
}
