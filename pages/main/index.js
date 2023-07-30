import React, { useEffect, useState, useRef } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/router";
import AWS from "aws-sdk";
AWS.config.region = "eu-central-1";
AWS.config.credentials = new AWS.Credentials(
  process.env.AWS_ACCESS_KEY_ID,
  process.env.AWS_SECRET_ACCESS_KEY
);

const compressImage = (canvas, callback) => {
  canvas.toBlob(callback, "image/jpeg", 0.8);
};

const Main = () => {
  const { user, error, isLoading } = useUser();
  const [ModelType, setModelType] = useState("");
  const [files, setFiles] = useState(null);
  const [urlFile, setUrlFile] = useState("");
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [videoStream, setVideoStream] = useState(null);

  const videoRef = useRef();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  useEffect(() => {
    if (videoStream && videoRef.current) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  // imageHandler function
  const handleInputFile = async (e) => {
    const file = e.target.files[0];
    console.log(file);
    const urlFormat = URL.createObjectURL(file);
    setFiles(file);
    setUrlFile(urlFormat);
  };

  // start Camera function
  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          aspectRatio: 16 / 9,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setVideoStream(stream);
      setIsCameraOn(true);
    } catch (error) {
      console.log("Error Accessing Camera:", error);
    }
  };
  const captureImage = () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    compressImage(canvas, (blob) => {
      const file = new File([blob], "capturedImage.jpg", {
        type: "image/jpeg",
      });
      handleInputFile({ target: { files: [file] } });
    });

    stopCamera();
  };
  const stopCamera = () => {
    const tracks = videoRef.current.srcObject.getTracks();
    tracks.forEach((track) => track.stop());
    setIsCameraOn(false);
  };

  // handleImageInputChange function
  async function handleImageInputChange() {
    const file = files;
    console.log(file);

    if (file) {
      const maxImageSizeBytes = 20 * 1024 * 1024;
      if (file.size > maxImageSizeBytes) {
        displayErrorMessage(
          "Please select an image with a size less than 20MB."
        );
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const lambda = new AWS.Lambda();
        displayUploadMessage("Uploading image...");

        const payload = {
          name: file.name,
          image: { name: file.name, data: e.target.result },
        };
        const lambdaParams = {
          FunctionName: "uploadImages",
          InvocationType: "RequestResponse",
          Payload: JSON.stringify(payload),
          Qualifier: "2",
        };
        try {
          const lambdaResponse = await lambda.invoke(lambdaParams).promise();
          console.log(lambdaResponse);
          const responseBody = JSON.parse(lambdaResponse.Payload).body;
          displaySuccessMessage(responseBody);
        } catch (error) {
          console.error(error);
          displayErrorMessage(
            "Error uploading image - please ask for support."
          );
        } finally {
          console.log("finally");
        }
      };

      reader.readAsDataURL(file);
    }
  }
  const [imageObject, setImageObject] = useState(null);

  const handleFileInput = useRef(null);

  const handleClick = () => {
    handleFileInput.current.click();
  };

  const handleImageChange = (event) => {
    setImageObject({
      imagePreview: URL.createObjectURL(event.target.files[0]),
      imageFile: event.target.files[0],
    });
  };
  function displayUploadMessage(message) {
    console.log(message);
  }

  function displaySuccessMessage(message) {
    console.log(message);
  }
  function displayErrorMessage(message) {
    console.log(message);
  }

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleImageInputChange(files);
  };
  const removeImage = () => {
    setFiles(null);
    setUrlFile("");
  };
  return (
    <div className="flex flex-col justify-between items-center h-[80vh] w-full text-whites">
      <p className="text-white font-italic text-2xl pt-5">
        {" "}
        AI at terrestial speeds
      </p>
      <p className="text-white font-primary text-2xl pt-5"> {user?.name}</p>
      <p className="text-white font-tertiary text-4xl pt-1">
        {" "}
        Choose AI Model:
      </p>

      <div className="container">
        <form onSubmit={handleFormSubmit}>
          {/* Camera controls
          {!isCameraOn && (
            <button type="button" onClick={startCamera}>
              Open Camera
            </button>
          )}
          {videoStream && (
            <>
              <video
                ref={(element) => {
                  videoRef.current = element;
                }}
                width="600"
                height="400"
                autoPlay
                style={{ backgroundColor: "grey", border: "2px solid red" }}
              ></video>

              <button type="button" onClick={captureImage}>
                Capture Image
              </button>
              <button type="button" onClick={stopCamera}>
                Close Camera
              </button>
            </>
          )} */}
          <div>
            <button onClick={handleClick}>Upload Photo</button>
            <label>
              <input
                style={{ display: "none" }}
                type="file"
                accept="image/*"
                capture="environment"
                ref={handleFileInput}
                onChange={handleImageChange}
              />
            </label>
            {imageObject && <img src={imageObject.imagePreview} />}
          </div>
          {/* Image Preview */}
          {/* {urlFile && (
            <div>
              <h3>Image Preview:</h3>
              <button onClick={removeImage}>X</button>
              <img src={urlFile} alt="Preview" width="300" />
            </div>
          )} */}

          <button id="upload-button">Upload Image</button>



        </form>
        <a href="/api/auth/logout">Logout</a>
      </div>
    </div>
  );
};

export default Main;
