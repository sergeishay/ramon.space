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
  const router = useRouter();
  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;


  const handleImageChange = (type, event) => {
    setModelType(type);
    const file = event.target.files[0];
    const urlFormat = URL.createObjectURL(file);
    setFiles(file);
    setUrlFile(urlFormat);
    toast.success("Image Uploaded");

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  // handleImageInputChange function

  //check if the image is uploaded function



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
    toast.success(message);
  }

  function displaySuccessMessage(message) {
    toast.success(message);
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




  console.log(ModelType);


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
          {files ? "Ai Model" : "Choose AI Model"}

        </p>
      </div>

      <div className="container flex flex-col">
        <form onSubmit={handleFormSubmit}>
          {!files && (
            <div className="form-group flex flex-row justify-around items-start">
              <div className="segment">
                <input
                  id="segmentation"
                  className="input-to-hidden"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(event) => handleImageChange('Segmentation', event)}
                  style={{ display: 'none' }}
                />
                <label htmlFor="segmentation">
                  <Image src={SegmentationImg} height={150} width={150} alt="Segmentation" />
                </label>
                <p className='text-mid text-whites'>Segmentation</p>
              </div>
              <div className="cloudDetection">
                <input
                  id="cloudDetection"
                  className="input-to-hidden"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="cloudDetection">
                  <Image src={CloudImg} height={150} width={150} alt="Cloud Detection" />
                </label>
                <p>Cloud Detection</p>
              </div>
            </div>
          )}
          <div className='img-prev flex justify-center items-center'>
            {imageSrc ? (
              <div className="static flex justify-center items-center flex-col" >
                <div className='flex flex-row justify-center items-center mb-7'>
                  <Image src={segIcon} className="mx-1" height={50} width={50} alt="segIcon" />
                  <h3 className="text-white font-tertiary text-4xl mx-2 " >{ModelType}</h3>
                </div>
                <div className=''>
                  <button className='absolute right-0 mr-[5%] ' onClick={removeImage}><Image src={close} height={45} width={45}  alt="close-icon" /></button>
                </div>
                <Image src={urlFile} height={400} width={400}  className='px-6' alt="Preview" />
                <button className='bg-my-orange w-[80%] p-3 mt-6 text-2xl font-mid text-whites' id="upload-button">SEND</button>
              </div>
            ) :
              <Image src={previewImg} className="p-7" height={400} width={400} alt="Preview-before" />
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
