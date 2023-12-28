document.addEventListener('DOMContentLoaded', function () {
    const uploadInput = document.getElementById('uploadInput');
    const randomDogButton = document.getElementById('random-dog-button');
    const originalImage = document.getElementById('originalImage');
    const modifiedImage = document.getElementById('modifiedImage');
    const brightnessSlider = document.getElementById('brightnessSlider');
    const submitBtn = document.getElementById('submitBtn');
    const originalImageBox = document.getElementById('originalImageBox');
    const modifiedImageBox = document.getElementById('modifiedImageBox');
    const downloadBtn = document.getElementById('downloadBtn');

    const timeValue = document.getElementById('timeValue');


    submitBtn.addEventListener('click', function () {
        // Reset the displayed processing time to 0, just in case
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

    /// Handling file upload
    function handleFileSelect(event) {
        const file = event.target.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = function (e) {
                originalImage.src = e.target.result;
                originalImageBox.style.display = 'block';
                modifiedImageBox.style.display = 'none'; // Hide the modified image box when a new image is uploaded
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

        // copy of the original image for processing
        const imageCopy = new Image();
        imageCopy.crossOrigin = "Anonymous"; // cross-origin resource sharing
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

    ///The 1 second-delay required
    setTimeout(function () {
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

    /// HSL to RGB
    function hslToRgb(h, s, l) {
        let r, g, b;

        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            let hue2rgb = function hue2rgb(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            let p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    ///RGB to HSL
    function rgbToHsl(r, g, b) {
        r /= 255, g /= 255, b /= 255;
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [h, s, l];
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
                let r = data[i];
                let g = data[i + 1];
                let b = data[i + 2];

                // Convert RGB to HSL
                let hsl = rgbToHsl(r, g, b);
                // Adjust lightness
                hsl[2] = hsl[2] * (brightness / 100);
                // Convert back to RGB
                let rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);

                // Update the pixel data
                data[i] = Math.round(rgb[0]);
                data[i + 1] = Math.round(rgb[1]);
                data[i + 2] = Math.round(rgb[2]);
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

    /// Function for downloading the resulted image
    function downloadModifiedImage() {
        let link = document.createElement('a');
        link.href = modifiedImage.src;
        link.download = 'modified_image.jpg'; // You can set the download filename here
        link.click();
    }

    // Attaching the download function to the button click event
    downloadBtn.addEventListener('click', downloadModifiedImage);
});
