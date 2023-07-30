import AWS from 'aws-sdk';
AWS.config.region = 'eu-central-1'; // Replace with your desired AWS region
AWS.config.credentials = new AWS.Credentials(process.env.AWS_ACCESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);

export function handleImageInputChange(imageInput) {
    const file = imageInput;
    console.log(file);


    if (file) {
        const maxImageSizeBytes = 20 * 1024 * 1024;
        if (file.size > maxImageSizeBytes) {
            displayErrorMessage('Please select an image with a size less than 20MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {


            const lambda = new AWS.Lambda();
            displayUploadMessage('Uploading image...');

            const payload = {
                name: "sergei",
                image: { name: file.name, data: e.target.result }
            };
            const lambdaParams = {
                FunctionName: 'uploadImages',
                InvocationType: 'RequestResponse',
                Payload: JSON.stringify(payload),
                Qualifier: '2', 
            };
            try {
                const lambdaResponse = await lambda.invoke(lambdaParams).promise();
                console.log(lambdaResponse);
                const responseBody = JSON.parse(lambdaResponse.Payload).body;
                displaySuccessMessage(responseBody);
            } catch (error) {
                console.error(error);
                displayErrorMessage('Error uploading image - please ask for support.');
            } finally {
                console.log("finally")
            }
        };

        reader.readAsDataURL(file);
    }
}

function displayUploadMessage(message) {
    console.log(message)
}

function displaySuccessMessage(message) {
    console.log(message)

}
function displayErrorMessage(message) {
    console.log(message)

}
