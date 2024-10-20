import numpy as np
from flask import Flask, json, jsonify, request
from PIL import Image
from ultralytics import YOLO

app = Flask(__name__)


model = YOLO("yolo11n.pt")


@app.route("/detect", methods=["POST"])
def detect_objects():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "no selected file"}), 400
    image = Image.open(file.stream)

    image_np = np.array(image.convert("RGB"))
    results = model.predict(image_np)

    objects_detected = []

    for result in results:
        boxes = result.boxes
        for box in boxes:
            label = int(box.cls)
            object_name = model.names[label]
            confidence = float(box.conf)
            objects_detected.append({"name": object_name, "confidence": confidence})
    return jsonify({"detections": objects_detected})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
