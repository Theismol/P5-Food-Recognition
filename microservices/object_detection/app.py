import base64
from collections import Counter
from io import BytesIO

import numpy as np
from flask import Flask, json, jsonify, request
from PIL import Image
from ultralytics import YOLO

app = Flask(__name__)


model = YOLO("best.pt")


@app.route("/detect", methods=["POST"])
def detect():
    if "images" not in request.json:
        return jsonify({"error": "No images provided"}), 400

    image_data_list = request.json["images"]

    # To store the frequency of each object detected
    object_counter = Counter()

    # Process each image
    for image_data in image_data_list:
        try:
            # Decode the base64 data to bytes
            image_bytes = base64.b64decode(image_data)

            # Convert bytes to an image
            image = Image.open(BytesIO(image_bytes))

            image_np = np.array(image.convert("RGB"))
            results = model.predict(image_np)

            # For each image, find the most confident detection
            most_confident_detection = None

            for result in results:
                boxes = result.boxes
                for box in boxes:
                    label = int(box.cls)
                    object_name = model.names[label]
                    confidence = float(box.conf)

                    # Update the most confident detection if needed
                    if (
                        most_confident_detection is None
                        or confidence > most_confident_detection["confidence"]
                    ):
                        most_confident_detection = {
                            "name": object_name,
                            "confidence": confidence,
                        }

            # If a most confident detection exists, count it
            if most_confident_detection:
                object_counter[most_confident_detection["name"]] += 1
        except Exception as e:
            return jsonify({"error": f"Failed to process image: {str(e)}"}), 500

        # Find the object that appeared most frequently
        if object_counter:
            most_common_object, count = object_counter.most_common(1)[0]
            return jsonify({"name": most_common_object, "count": count})
        else:
            return jsonify({"error": "No objects detected in any image"}), 404


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000)
