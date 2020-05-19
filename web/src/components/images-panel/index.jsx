import React, { Component, useCallback } from "react";
import { useDropzone } from "react-dropzone";

// class ImagesPanel extends Component {
//   state = { images: [] };

//   clearImages = () => {
//     this.setState({ images: [] });
//   };

//   addImage = (image) => {
//     const { images } = this.state;
//     images.push(image);
//     this.setState({ images });
//   };

//   render() {
//     const { images } = this.state;
//     return (
//       <MyDropzone
//         addImage={this.addImage}
//         clearImages={this.clearImages}
//         images={images}
//       ></MyDropzone>
//     );
//   }
// }

function ImagesPanel({ images, addImage, clearImages }) {
  const onDrop = useCallback((acceptedFiles) => {
    clearImages();
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        addImage(event.target.result);
      };
      reader.readAsDataURL(file);
    });
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <input {...getInputProps()} accept="image/*" />
      {images.length === 0 ? (
        <i style={{ fontSize: "150px" }} className="fa fa-picture-o"></i>
      ) : (
        <img
          style={{
            display: "block",
            maxHeight: "100%",
            maxWidth: "100%",
            objectFit: "contain",
          }}
          src={images[0]}
        ></img>
      )}

      <img src="" alt="" />
    </div>
  );
}

export default ImagesPanel;
