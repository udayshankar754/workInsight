const options = {
  httpOnly: true,
  secure: true,
};

const classifyFileByMimeType = (mimetype) => {
  if (mimetype.startsWith('image/')) {
    return 'image'; // All image MIME types (e.g., image/jpeg, image/png, etc.)
  } else if (mimetype.startsWith('video/')) {
    return 'video'; // All video MIME types (e.g., video/mp4, video/webm, etc.)
  } else {
    return 'file'; // Anything else, treat as raw file (e.g., pdf, docx, zip, etc.)
  }
};


export {
  options,
  classifyFileByMimeType,
};