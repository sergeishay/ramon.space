import Image from 'next/image'
import React, { useEffect, useState, useRef } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import { close, cloudIcon, previewImg, SegmentationImg, CloudImg, segIcon } from '../../public/images';
import Link from 'next/link'
import AWS from "aws-sdk";
AWS.config.region = "eu-central-1";
AWS.config.credentials = new AWS.Credentials(
  process.env.AWS_ACCESS_KEY_ID,
  process.env.AWS_SECRET_ACCESS_KEY
);

const MainPage = () => {
  const { user, error, isLoading } = useUser();
  const [ModelType, setModelType] = useState("");
  const [files, setFiles] = useState(null);
  const [urlFile, setUrlFile] = useState("");
  const [imageSrc, setImageSrc] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [utcTime , setUtcTime] = useState("");

  const router = useRouter();
  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  const handleImageChange = (type, event) => {
    setModelType(type);
    const file = event.target.files[0];
    const urlFormat = URL.createObjectURL(file);
    setFiles(file);
    setUrlFile(urlFormat);
    toast.success("Image Uploaded");
    const lastModified = new Date(file.lastModified);
    const lastModifiedUTC = lastModified.toUTCString();
    setUtcTime(lastModifiedUTC);

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
        displayUploadMessage("Sending image...");
        const payload = {
          name: user.name,
          image: { name: file.name, data: e.target.result },
          model: ModelType,
          utcTime: utcTime,
        };
        const lambdaParams = {
          FunctionName: "uploadImages",
          InvocationType: "RequestResponse",
          Payload: JSON.stringify(payload),
          Qualifier: "4",
        };
        try {
          const lambdaResponse = await lambda.invoke(lambdaParams).promise();
          const responseBody = JSON.parse(lambdaResponse.Payload).body;
          console.log(responseBody);
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
    toast.success(message);
  }
  function displaySuccessMessage(message) {
    toast.success(message);
    setFiles(null);
    setUrlFile("");
    setImageSrc(null);
  }
  function displayErrorMessage(message) {
    toast.error(message);
  }
  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleImageInputChange(files);
  };
  const removeImage = () => {
    setFiles(null);
    setUrlFile("");
    setImageSrc(null);

  };

  return (
    <div className="flex flex-col justify-between align-center h-[80vh] w-full text-whites text-center">
      {showPopup && (
        <div className="fixed top-0 left-0 w-screen h-screen z-50 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-md">
            <h3 className="text-black font-primary" >Please upload a landscape (▭) image</h3>
            <button className='bg-my-orange w-[80%] p-2 mt-3 text-xl' onClick={() => setShowPopup(false)}>OK</button>
          </div>
        </div>
      )}
      <div className="headings flex flex-col justify-center align-center text-center">
        <p className="text-white font-italic text-2xl pt-5">
          {" "}
          AI at terrestial speeds
        </p>
        <p className="text-white font-primary text-2xl pt-5"> {user?.name}</p>
        <p className="text-white font-tertiary text-4xl pt-1">
          {" "}
          {files ? "Ai Model" : "Choose AI Model"}
        </p>
      </div>
      <div className=" flex flex-col w-full m-0 p-0">
        <form onSubmit={handleFormSubmit}>
          {!files && (
            <div className="form-group flex flex-row justify-around items-start w-full m-0 p-0">
              <div className="segment p-3">
                <button onClick={() => {document.getElementById('segmentation').click();}}>
                  <Image src={CloudImg} height={150} width={150} alt="Segmentation" />
                  Segmentation
                </button>
                <input
                  id="segmentation"
                  className="input-to-hidden"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(event) => handleImageChange('Segmentation', event)}
                  style={{ display: 'none' }}
                />
              </div>
              <div className="cloudDetection p-3">
                <button onClick={() => {document.getElementById('cloudDetection').click();}}>
                  <Image src={SegmentationImg} height={150} width={150} alt="Cloud Detection" />
                  Cloud Detection
                </button>
                <input
                  id="cloudDetection"
                  className="input-to-hidden"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(event) => handleImageChange('cloudDetection', event)}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          )}
          <div className='img-prev flex justify-center items-center w-full'>
            {imageSrc ? (
              <div className="static flex justify-center items-center flex-col " >
                <div className='flex flex-row justify-center items-center mb-7'>
                  <Image src={ModelType === 'cloudDetection' ? segIcon : cloudIcon} className="mx-1" height={50} width={50} alt="segIcon" />
                  <h3 className="text-white font-tertiary text-3xl mx-2 " >{ModelType === 'cloudDetection' ? "Cloud Detection" : "Segmentation"}</h3>
                </div>
                <div className='relative'>
                  <button className='absolute right-0  mr-[-10px] mt-[-10px]' onClick={removeImage}><Image src={close} height={35} width={35} alt="close-icon" /></button>
                  <Image src={urlFile} height={350} width={400} style={{ objectFit: "contain" }} className=' image-prev' alt="Preview" />
                </div>

                <button className='bg-my-orange w-[80%] p-2 mt-6 text-2xl font-mid text-whites' id="upload-button">SEND</button>
              </div>
            ) :
              <Image src={previewImg} className="p-7 image-prevs" height={400} width={400} alt="Preview-before" />
            }
          </div>
        </form>
      </div>
      <div>
        <Link href="/api/auth/logout">Logout</Link>
      </div>
    </div>
  );
};

export default MainPage;
