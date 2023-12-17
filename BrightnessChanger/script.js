document.addEventListener('DOMContentLoaded', function () {
    const uploadInput = document.getElementById('uploadInput');
    const originalImage = document.getElementById('originalImage');
    const modifiedImage = document.getElementById('modifiedImage');
    const brightnessSlider = document.getElementById('brightnessSlider');
    const submitBtn = document.getElementById('submitBtn');
    const originalImageBox = document.getElementById('originalImageBox');
    const modifiedImageBox = document.getElementById('modifiedImageBox');
    const processingTime = document.getElementById('processingTime');
    const timeValue = document.getElementById('timeValue');
    const randomDogButton = document.getElementById('random-dog-button');

    submitBtn.addEventListener('click', function () {
        // Reset the displayed processing time to 0
        timeValue.textContent = '0';

        const brightnessValue = brightnessSlider.value;
        processImage(brightnessValue);
    });

    randomDogButton.addEventListener('click', async function () {
        await displayRandomDog();
    });

    uploadInput.addEventListener('change', handleFileSelect);

    function handleFileSelect(event) {
        const file = event.target.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = function (e) {
                originalImage.src = e.target.result;
                originalImageBox.style.display = 'block';
                modifiedImageBox.style.display = 'none'; // Hide modified image box when a new image is uploaded
            };

            reader.readAsDataURL(file);
        }
    }

    async function processImage(brightness) {
        if (!originalImage.src) {
            alert('Please upload an image or select a random cute dog first.');
            return;
        }

        const startTime = performance.now(); // Record start time

        // Create a copy of the original image for processing
        const imageCopy = new Image();
        imageCopy.src = originalImage.src;

        imageCopy.onload = function () {
            drawImageOnCanvas(imageCopy);

            // Apply brightness
            applyBrightness(brightness);

            // Display the modified image in the second container
            modifiedImageBox.style.display = 'block';

            // Record end time and calculate processing time
            const endTime = performance.now();
            const timeElapsed = endTime - startTime;
            displayProcessingTime(timeElapsed);
        };
    }

    async function displayRandomDog() {
        const response = await fetch('https://dog.ceo/api/breeds/image/random');
        const data = await response.json();

        originalImage.src = data.message;
        originalImageBox.style.display = 'block';

        // Process the image with the current brightness value
        const brightnessValue = brightnessSlider.value;
        await processImage(brightnessValue);
    }

    function drawImageOnCanvas(image) {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        modifiedImage.src = canvas.toDataURL('image/jpeg');
    }

    function applyBrightness(brightness) {
        const canvas = document.createElement('canvas');
        canvas.width = modifiedImage.width;
        canvas.height = modifiedImage.height;
        const context = canvas.getContext('2d');
        context.drawImage(modifiedImage, 0, 0, canvas.width, canvas.height);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            // Adjust the brightness of each pixel
            data[i] += parseInt(brightness);         // Red channel
            data[i + 1] += parseInt(brightness);     // Green channel
            data[i + 2] += parseInt(brightness);     // Blue channel
        }

        context.putImageData(imageData, 0, 0);
        modifiedImage.src = canvas.toDataURL('image/jpeg');
    }

    function displayProcessingTime(timeElapsed) {
        timeValue.textContent = timeElapsed.toFixed(2);
    }
});