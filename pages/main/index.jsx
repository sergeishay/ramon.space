import Image from 'next/image'
import React, { useEffect, useState, useRef } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/router";
import Link from 'next/link'
import AWS from "aws-sdk";
AWS.config.region = "eu-central-1";
AWS.config.credentials = new AWS.Credentials(
  process.env.AWS_ACCESS_KEY_ID,
  process.env.AWS_SECRET_ACCESS_KEY
);

const compressImage = (canvas, callback) => {
  canvas.toBlob(callback, "image/jpeg", 0.8);
};

const MainPage = () => {
  const { user, error, isLoading } = useUser();
  const [ModelType, setModelType] = useState("");
  const [files, setFiles] = useState(null);
  const [urlFile, setUrlFile] = useState("");
  const [imageSrc, setImageSrc] = useState(null);
  const router = useRouter();
  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);



  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;


  const handleImageChange = (event) => {
    const file = event.target.files[0];
    const urlFormat = URL.createObjectURL(file);
    setFiles(file);
    setUrlFile(urlFormat);

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };



  // handleImageInputChange function

  async function handleImageInputChange() {
    const file = files;

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
          name: user.name,
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
    <div className="flex flex-col justify-between align-center h-[80vh] w-full text-whites text-center">
      <div className="headings flex flex-col justify-center align-center text-center">
        <p className="text-white font-italic text-2xl pt-5">
          {" "}
          AI at terrestial speeds
        </p>
        <p className="text-white font-primary text-2xl pt-5"> {user?.name}</p>
        <p className="text-white font-tertiary text-4xl pt-1">
          {" "}
          Choose AI Model:
        </p>
      </div>

      <div className="container">
        <form onSubmit={handleFormSubmit}>
         <div >
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
            />
          </div>
          {/* Image Preview */}
          {imageSrc && (
            <div className="flex justify-center items-center flex-col" >
              <h3>Image Preview:</h3>
              <button onClick={removeImage}>X</button>
              <Image src={urlFile} height={400} width={400} alt="Preview" />
            </div>
          )}
          <button id="upload-button">Upload Image</button>
        </form>
      </div>
      <Link href="/api/auth/logout">Logout</Link>
    </div>
  );
};

export default MainPage;
