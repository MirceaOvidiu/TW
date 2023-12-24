document.addEventListener('DOMContentLoaded', function () {
    const uploadInput = document.getElementById('uploadInput');
    const randomDogButton = document.getElementById('random-dog-button');
    const originalImage = document.getElementById('originalImage');
    const modifiedImage = document.getElementById('modifiedImage');
    const brightnessSlider = document.getElementById('brightnessSlider');
    const submitBtn = document.getElementById('submitBtn');
    const originalImageBox = document.getElementById('originalImageBox');
    const modifiedImageBox = document.getElementById('modifiedImageBox');

    const timeValue = document.getElementById('timeValue');

    
    submitBtn.addEventListener('click', function () {
        // Reset the displayed processing time to 0
        timeValue.textContent = '0';

        // Slider for brightness
        const brightnessValue = brightnessSlider.value;
        processImage(brightnessValue);
    });

    /// The button that calls the API to get a random dog image when pressed
    randomDogButton.addEventListener('click', async function () {
        await displayRandomDog();
    });

    uploadInput.addEventListener('change', handleFileSelect);

    /// Function to handle the file upload
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

    /// Function to process the image
    async function processImage(brightness) {
        if (!originalImage.src) {
            alert('Please upload an image or select a random cute dog first.');
            return;
        }

        const startTime = performance.now(); // Record start time

        // Create a copy of the original image for processing
        const imageCopy = new Image();
        imageCopy.crossOrigin = "Anonymous"; // Enable cross-origin resource sharing
        imageCopy.src = originalImage.src;

        // Draw the image on a canvas
        imageCopy.onload = function () {
            drawImageOnCanvas(imageCopy);

            // Apply brightness
            applyBrightness(brightness);

            // Display the modified image in the second container
            modifiedImageBox.style.display = 'block';

            // Record end time and calculate processing time - the actual processing time, w/o delays
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
        mirrorImage(context);
        modifiedImage.src = canvas.toDataURL('image/jpeg');
    }

    ///The 1 second delay required
    setTimeout(function() {
        mirrorImage(context);
        modifiedImage.src = canvas.toDataURL('image/jpeg');
    }, 1000); // Delay of 1 second

    function mirrorImage(ctx) {
        const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        const newImageData = ctx.createImageData(imageData.width, imageData.height);
    
        /// Mirroring the image
        for (let y = 0; y < imageData.height; y++) {
            for (let x = 0; x < imageData.width; x++) {
                const index = (y * imageData.width + x) * 4;
                const mirrorIndex = (y * imageData.width + (imageData.width - x - 1)) * 4;
                newImageData.data[mirrorIndex] = imageData.data[index];
                newImageData.data[mirrorIndex + 1] = imageData.data[index + 1];
                newImageData.data[mirrorIndex + 2] = imageData.data[index + 2];
                newImageData.data[mirrorIndex + 3] = imageData.data[index + 3];
            }
        }
    
        ctx.putImageData(newImageData, 0, 0);
    }

    /// Function to apply brightness to the image
    function applyBrightness(brightness) {
        const canvas = document.createElement('canvas');
        canvas.width = modifiedImage.width;
        canvas.height = modifiedImage.height;
        const context = canvas.getContext('2d');
        context.drawImage(modifiedImage, 0, 0, canvas.width, canvas.height);
    
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
    
        const sliceSize = data.length / 4;
        let currentSlice = 0;
    
        function processSlice() {
            const start = currentSlice * sliceSize;
            const end = Math.min(start + sliceSize, data.length);
    
            for (let i = start; i < end; i += 4) {
                // Adjust the brightness of each pixel
                data[i] += parseInt(brightness);         // Red channel
                data[i + 1] += parseInt(brightness);     // Green channel
                data[i + 2] += parseInt(brightness);     // Blue channel
            }
    
            context.putImageData(imageData, 0, 0);
            modifiedImage.src = canvas.toDataURL('image/jpeg');
    
            currentSlice++;
            if (currentSlice < 4) {
                setTimeout(processSlice, 1000);
            }
        }
    
        processSlice();
    }

    /// Function to display the processing time
    function displayProcessingTime(timeElapsed) {
        timeValue.textContent = timeElapsed.toFixed(2);
    }
});
